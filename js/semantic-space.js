/* ============================================================
   语义空间 / semantic-space.js
   依赖：window.THREE（本地 vendor）、window.SS_DATA（离线管线产出）
   职责：点云渲染、自写轨道相机、双模式召回、上下文装配、2D 降级
   ============================================================ */
(function () {
    'use strict';

    var DATA = window.SS_DATA;
    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    };

    var COLORS = {
        prompts: '#315ce8',
        rules: '#2b7d78',
        design: '#8a6a2f',
        agent: '#6b4a86',
        automation: '#6f7f2a',
        product: '#4a6472',
        project: '#a8472f'
    };

    var ANCHORS = {
        prompts: '../pages/AI.html#prompts',
        rules: '../pages/AI.html#rules',
        design: '../pages/AI.html#design',
        agent: '../pages/AI.html#agent',
        automation: '../pages/AI.html#automation',
        product: '../pages/AI.html#product',
        project: '../index.html#projects'
    };

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var TOKEN_RATIO = 1.6; // 1 token ≈ 1.6 汉字，仅作估算

    var state = {
        hits: [],
        hitMap: null,
        query: '',
        queryPos: null,
        mode: 'vector',
        preset: null,
        selected: null,
        hovered: null,
        budget: 240,
        view: '3d',
        spin: true,
        lastInput: 0
    };

    /* ---------------- 数据索引 ---------------- */

    var CHUNKS = [];
    var DOC_BY_ID = {};
    var CHUNK_BY_ID = {};

    function boot() {
        if (!DATA || !DATA.chunks || !DATA.chunks.length) {
            fail('数据没有加载成功', 'space.js 未载入或为空，请重跑 <code>python script/build-semantic-space.py</code>。');
            return;
        }
        DATA.docs.forEach(function (d) { DOC_BY_ID[d.id] = d; });
        DATA.chunks.forEach(function (c) {
            CHUNKS.push(c);
            CHUNK_BY_ID[c.i] = c;
        });

        paintStats();
        renderLegend();
        renderPresets();
        renderEmptyResults();
        renderWindow();

        var ok = initThree();
        buildFlat();
        setView(ok ? '3d' : '2d', true);

        if (!ok) {
            showNotice('当前环境不支持 WebGL，已切到平面视图，功能一致。');
        }

        bindUI();
        $('#ssLoading').hidden = true;

        // 首次进入直接跑一个问题，让空间立刻有意义
        var first = DATA.queries && DATA.queries[0];
        if (first) {
            window.setTimeout(function () { runPreset(first); }, 420);
        }
    }

    function fail(title, detail) {
        var box = $('#ssLoading');
        if (box) {
            box.innerHTML = '';
            var b = document.createElement('b');
            b.textContent = title;
            var p = document.createElement('p');
            p.innerHTML = detail;
            p.style.maxWidth = '30ch';
            p.style.textAlign = 'center';
            p.style.letterSpacing = '0';
            box.appendChild(b);
            box.appendChild(p);
        }
    }

    function paintStats() {
        var m = DATA.meta || {};
        var map = {
            docs: m.docs,
            chunks: m.chunks,
            vocab: m.vocab
        };
        $$('[data-stat]').forEach(function (node) {
            var k = node.getAttribute('data-stat');
            if (map[k]) node.textContent = map[k];
        });
        $('#ssSpaceSub').textContent = (m.chunks || CHUNKS.length) + ' chunks · ' +
            (DATA.categories ? DATA.categories.length : 7) + ' topics';
    }

    /* ---------------- 分词 / BM25 ---------------- */

    var CJK = /[\u4e00-\u9fff]+/g;
    var ASCIIW = /[a-z0-9][a-z0-9+#._-]*/g;

    function tokenize(text) {
        var t = String(text || '').toLowerCase();
        var out = [];
        var runs = t.match(CJK) || [];
        for (var r = 0; r < runs.length; r++) {
            var run = runs[r];
            if (run.length === 1) {
                out.push(run);
            } else {
                for (var i = 0; i < run.length - 1; i++) out.push(run.slice(i, i + 2));
            }
        }
        var words = t.match(ASCIIW) || [];
        for (var w = 0; w < words.length; w++) {
            if (words[w].length >= 2) out.push(words[w]);
        }
        return out;
    }

    var BM25 = null;

    function buildBM25() {
        var docs = CHUNKS.map(function (c) { return tokenize(c.t + ' ' + c.x); });
        var df = Object.create(null);
        var tfs = [];
        var total = 0;

        docs.forEach(function (toks) {
            total += toks.length;
            var tf = Object.create(null);
            toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
            tfs.push(tf);
            Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
        });

        BM25 = { n: docs.length, avgdl: total / Math.max(1, docs.length), df: df, tfs: tfs, lens: docs.map(function (d) { return d.length; }) };
    }

    function bm25Search(query, limit) {
        if (!BM25) buildBM25();
        var terms = Object.keys(tokenize(query).reduce(function (acc, t) { acc[t] = 1; return acc; }, {}));
        var k1 = 1.2;
        var b = 0.62;
        var scores = new Array(BM25.n).fill(0);

        terms.forEach(function (term) {
            var df = BM25.df[term] || 0;
            if (!df) return;
            var idf = Math.log(1 + (BM25.n - df + 0.5) / (df + 0.5));
            for (var i = 0; i < BM25.n; i++) {
                var f = BM25.tfs[i][term];
                if (!f) continue;
                var dl = BM25.lens[i] || 1;
                scores[i] += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * dl / BM25.avgdl));
            }
        });

        var ranked = [];
        for (var i = 0; i < scores.length; i++) if (scores[i] > 0) ranked.push({ i: i, s: scores[i] });
        ranked.sort(function (a, b2) { return b2.s - a.s; });

        var hitTerms = terms.filter(function (t) { return BM25.df[t]; }).length;
        ranked = ranked.slice(0, limit || 24);
        var max = ranked.length ? ranked[0].s : 1;
        return {
            hits: ranked.map(function (r) { return { i: r.i, score: Math.max(0.01, r.s / max) }; }),
            terms: terms.length,
            hitTerms: hitTerms
        };
    }

    /* ---------------- 召回 ---------------- */

    function runPreset(preset) {
        state.preset = preset.q;
        state.query = preset.q;
        state.mode = 'vector';
        syncModeButtons();
        $('#ssInput').value = preset.q;
        var hits = (preset.hits || []).map(function (h) { return { i: h[0], score: h[1] }; });
        state.hits = hits;
        state.queryPos = preset.p ? { x: preset.p[0], y: preset.p[1], z: preset.p[2] } : centroid(hits);
        state.selected = null;
        state.source = 'preset';
        state.notice = '';
        apply();
        renderResults('本题的问题向量已离线算好');
        highlightPreset();
    }

    function runFree(text) {
        text = String(text || '').trim();
        if (!text) return;

        // 输入正好等于某个预设问题时，直接用离线向量，避免降级成关键词
        var matched = (DATA.queries || []).filter(function (q) { return q.q === text; })[0];
        if (matched) { runPreset(matched); return; }

        state.query = text;
        state.preset = null;
        highlightPreset();

        var res = bm25Search(text, 24);
        var hits = res.hits;

        if (state.mode === 'vector') {
            state.notice = '自由输入没有预计算的问题向量，已用关键词召回近似；上面的预设问题是真向量。';
        } else {
            state.notice = '';
        }

        state.hits = hits;
        state.queryPos = centroid(hits);
        state.selected = null;
        apply();
        var label = (state.mode === 'vector' ? 'BM25 近似' : '关键词 BM25') +
            ' · 命中 ' + res.hitTerms + '/' + res.terms + ' 词';
        renderResults(label);
        if (state.notice) showNotice(state.notice, 7000);
    }

    function centroid(hits) {
        var top = (hits || []).slice(0, 8);
        var wx = 0, wy = 0, wz = 0, w = 0;
        top.forEach(function (h) {
            var c = CHUNK_BY_ID[h.i];
            if (!c) return;
            var weight = h.score * h.score;
            wx += c.p[0] * weight;
            wy += c.p[1] * weight;
            wz += c.p[2] * weight;
            w += weight;
        });
        if (!w) return { x: 0, y: 0, z: 0 };
        return { x: wx / w, y: wy / w, z: wz / w };
    }

    function apply() {
        state.hitMap = {};
        state.hits.forEach(function (h, idx) {
            state.hitMap[h.i] = { rank: idx, score: h.score };
        });
        syncScene();
        syncFlat();
        renderWindow();
        renderDetail();
    }

    /* ---------------- Three 场景 ---------------- */

    var T = null; // three 相关对象集合

    function initThree() {
        if (!window.THREE) return false;
        var canvas = $('#ssCanvas');
        var stage = $('#ssStage');
        var renderer;

        try {
            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        } catch (err) {
            return false;
        }
        if (!renderer.getContext()) return false;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearAlpha(0);

        var dotMap = dotTexture();
        var ringMap = ringTexture();
        var dots = [];
        var group = new THREE.Group();
        scene.add(group);

        CHUNKS.forEach(function (c) {
            var mat = new THREE.SpriteMaterial({
                map: dotMap,
                color: new THREE.Color(COLORS[c.c] || '#66727d'),
                transparent: true,
                opacity: 0.42,
                depthWrite: false,
                depthTest: false
            });
            var sprite = new THREE.Sprite(mat);
            sprite.position.set(c.p[0], c.p[1], c.p[2]);
            sprite.scale.setScalar(baseScale(c));
            sprite.userData.index = c.i;
            dots.push(sprite);
            group.add(sprite);
        });

        // 地面网格：只给纵深参照，不做装饰（像一张摊开的坐标纸）
        var grid = new THREE.GridHelper(2.9, 12, 0x172433, 0x172433);
        grid.position.y = -1.02;
        grid.material.transparent = true;
        grid.material.opacity = 0.06;
        grid.material.depthWrite = false;
        scene.add(grid);

        var ring = new THREE.Sprite(new THREE.SpriteMaterial({
            map: ringMap, color: new THREE.Color('#315ce8'), transparent: true,
            opacity: 0, depthWrite: false, depthTest: false
        }));
        ring.scale.setScalar(0.2);
        scene.add(ring);

        var anchor = new THREE.Sprite(new THREE.SpriteMaterial({
            map: ringMap, color: new THREE.Color('#172433'), transparent: true,
            opacity: 0, depthWrite: false, depthTest: false
        }));
        anchor.scale.setScalar(0.26);
        scene.add(anchor);

        var lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
        var lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
            color: 0x315ce8, transparent: true, opacity: 0.34, depthWrite: false, depthTest: false
        }));
        scene.add(lines);

        T = {
            renderer: renderer,
            scene: scene,
            camera: camera,
            dots: dots,
            group: group,
            ring: ring,
            anchor: anchor,
            lines: lines,
            lineGeo: lineGeo,
            raycaster: new THREE.Raycaster(),
            pointer: new THREE.Vector2(-10, -10),
            cam: { theta: 0.72, phi: 1.06, radius: 3.05, tx: 0, ty: 0, tz: 0 },
            camTarget: { theta: 0.72, phi: 1.06, radius: 3.05, tx: 0, ty: 0, tz: 0 },
            dragging: false,
            moved: 0,
            last: { x: 0, y: 0 },
            pinch: 0,
            visible: true,
            frameId: null
        };

        resizeThree();
        bindThreeInput();
        startLoop();
        if (window.ResizeObserver) {
            var ro = new ResizeObserver(function () { resizeThree(); });
            ro.observe($('#ssStage'));
        }
        return true;
    }

    function baseScale(c) {
        return 0.042 + (c.k - 1) * 0.013;
    }

    function dotTexture() {
        var s = 64;
        var cv = document.createElement('canvas');
        cv.width = cv.height = s;
        var g = cv.getContext('2d');
        var grd = g.createRadialGradient(s / 2, s / 2, s * 0.12, s / 2, s / 2, s * 0.5);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.62, 'rgba(255,255,255,1)');
        grd.addColorStop(0.78, 'rgba(255,255,255,.55)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.arc(s / 2, s / 2, s * 0.5, 0, Math.PI * 2);
        g.fill();
        var tex = new THREE.CanvasTexture(cv);
        if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    function ringTexture() {
        var s = 64;
        var cv = document.createElement('canvas');
        cv.width = cv.height = s;
        var g = cv.getContext('2d');
        g.strokeStyle = '#ffffff';
        g.lineWidth = 3;
        g.beginPath();
        g.arc(s / 2, s / 2, s * 0.36, 0, Math.PI * 2);
        g.stroke();
        var tex = new THREE.CanvasTexture(cv);
        if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    function resizeThree() {
        if (!T) return;
        var stage = $('#ssStage');
        var w = stage.clientWidth;
        var h = stage.clientHeight;
        T.renderer.setSize(w, h, false);
        T.camera.aspect = w / Math.max(1, h);
        T.camera.updateProjectionMatrix();
    }

    function syncScene() {
        if (!T) return;
        var hitMap = state.hitMap || {};
        var selected = state.selected;

        T.dots.forEach(function (sprite) {
            var c = CHUNK_BY_ID[sprite.userData.index];
            var hit = hitMap[c.i];
            var isSelected = selected === c.i;
            var isHovered = state.hovered === c.i;
            var isDim = state.hits.length > 0 && !hit;

            var scale = baseScale(c);
            if (hit) scale *= 1.28 + hit.score * 0.55;
            if (isSelected) scale *= 1.55;
            if (isHovered) scale *= 1.22;

            sprite.scale.setScalar(scale);
            var mat = sprite.material;
            mat.opacity = isDim ? 0.32 : (hit ? 0.96 : (isSelected ? 1 : 0.5));
            mat.color.set(COLORS[c.c] || '#66727d');
            if (isDim) mat.color.set('#a3acb3');
        });

        // 高亮环
        var focus = state.selected != null ? CHUNK_BY_ID[state.selected] : (state.hovered != null ? CHUNK_BY_ID[state.hovered] : null);
        if (focus) {
            T.ring.position.set(focus.p[0], focus.p[1], focus.p[2]);
            T.ring.material.opacity = state.selected != null ? 0.85 : 0.4;
            T.ring.material.color.set(COLORS[focus.c] || '#315ce8');
            T.ring.scale.setScalar(baseScale(focus) * 2.6);
        } else {
            T.ring.material.opacity = 0;
        }

        // 查询落点与连线
        var qp = state.queryPos;
        if (qp) {
            T.anchor.position.set(qp.x, qp.y, qp.z);
            T.anchor.material.opacity = 0.9;
        } else {
            T.anchor.material.opacity = 0;
        }
        drawLines(qp);

        var tagBox = $('#ssTags');
        renderTags(qp, tagBox);
    }

    function drawLines(qp) {
        if (!T) return;
        var pos = [];
        if (qp) {
            state.hits.slice(0, 12).forEach(function (h) {
                var c = CHUNK_BY_ID[h.i];
                if (!c) return;
                var dx = c.p[0] - qp.x, dy = c.p[1] - qp.y, dz = c.p[2] - qp.z;
                var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist > 0.95) {
                    // 排序靠前却离得远：用虚线，提示视觉距离只是近似
                    var segs = 7;
                    for (var s = 0; s < segs; s += 2) {
                        var t0 = s / segs, t1 = (s + 1) / segs;
                        pos.push(qp.x + dx * t0, qp.y + dy * t0, qp.z + dz * t0);
                        pos.push(qp.x + dx * t1, qp.y + dy * t1, qp.z + dz * t1);
                    }
                } else {
                    pos.push(qp.x, qp.y, qp.z, c.p[0], c.p[1], c.p[2]);
                }
            });
        }
        if (!pos.length) pos = [0, 0, 0, 0, 0, 0];
        var attr = new THREE.BufferAttribute(new Float32Array(pos), 3);
        T.lineGeo.setAttribute('position', attr);
        T.lineGeo.computeBoundingSphere();
    }

    function renderTags(qp, host) {
        if (!T) return;
        var limit = window.matchMedia('(max-width: 760px)').matches ? 3 : 5;
        var want = state.hits.slice(0, limit);
        while (host.children.length > want.length) host.removeChild(host.lastChild);
        while (host.children.length < want.length) {
            var el = document.createElement('span');
            el.className = 'ss-tag';
            host.appendChild(el);
        }
        want.forEach(function (h, i) {
            var el = host.children[i];
            var c = CHUNK_BY_ID[h.i];
            el.textContent = String(i + 1);
            el.style.color = COLORS[c.c] || '#315ce8';
            el.dataset.index = h.i;
        });
        state._tags = want;
    }

    function projectToScreen(v3) {
        var p = v3.clone().project(T.camera);
        var stage = $('#ssStage');
        return {
            x: (p.x * 0.5 + 0.5) * stage.clientWidth,
            y: (-p.y * 0.5 + 0.5) * stage.clientHeight,
            visible: p.z < 1
        };
    }

    function startLoop() {
        if (!T) return;
        var tick = function () {
            T.frameId = window.requestAnimationFrame(tick);
            if (!T.visible || document.hidden || state.view !== '3d') return;
            stepCamera();
            T.renderer.render(T.scene, T.camera);
            placeTags();
        };
        tick();
    }

    function stepCamera() {
        var c = T.cam;
        var t = T.camTarget;
        var damp = reduceMotion.matches ? 1 : 0.12;

        var idle = Date.now() - state.lastInput > 4200;
        if (state.spin && idle && !T.dragging && state.view === '3d') {
            t.theta += 0.0011;
        }

        c.theta += (t.theta - c.theta) * damp;
        c.phi += (t.phi - c.phi) * damp;
        c.radius += (t.radius - c.radius) * damp;
        c.tx += (t.tx - c.tx) * damp;
        c.ty += (t.ty - c.ty) * damp;
        c.tz += (t.tz - c.tz) * damp;

        var sp = Math.sin(c.phi);
        T.camera.position.set(
            c.tx + c.radius * sp * Math.cos(c.theta),
            c.ty + c.radius * Math.cos(c.phi),
            c.tz + c.radius * sp * Math.sin(c.theta)
        );
        T.camera.lookAt(c.tx, c.ty, c.tz);
    }

    function placeTags() {
        if (!T || !state._tags) return;
        var host = $('#ssTags');
        if (!state._tags.length) { host.innerHTML = ''; return; }
        state._tags.forEach(function (h, i) {
            var el = host.children[i];
            if (!el) return;
            var c = CHUNK_BY_ID[h.i];
            var p = projectToScreen(new THREE.Vector3(c.p[0], c.p[1], c.p[2]));
            el.style.left = p.x + 'px';
            el.style.top = p.y + 'px';
            el.style.display = p.visible ? '' : 'none';
        });
    }

    function bindThreeInput() {
        var stage = $('#ssStage');
        var canvas = $('#ssCanvas');

        stage.addEventListener('pointerdown', function (e) {
            if (state.view !== '3d') return;
            if (e.target.closest('.ss-stage-tools')) return;
            T.dragging = true;
            T.moved = 0;
            T.last.x = e.clientX;
            T.last.y = e.clientY;
            stage.setPointerCapture(e.pointerId);
        });

        stage.addEventListener('pointermove', function (e) {
            if (state.view !== '3d' || !T) return;
            if (T.dragging) {
                var dx = e.clientX - T.last.x;
                var dy = e.clientY - T.last.y;
                T.moved += Math.abs(dx) + Math.abs(dy);
                T.last.x = e.clientX;
                T.last.y = e.clientY;
                T.camTarget.theta -= dx * 0.0062;
                T.camTarget.phi = clamp(T.camTarget.phi - dy * 0.0055, 0.22, 2.92);
                state.lastInput = Date.now();
                hideTip();
                return;
            }
            updateHover(e);
        });

        stage.addEventListener('pointerup', function (e) {
            if (state.view !== '3d' || !T) return;
            var wasDragging = T.dragging;
            T.dragging = false;
            if (!wasDragging) return;
            if (T.moved < 6) handleClick(e);
            state.lastInput = Date.now();
        });

        stage.addEventListener('pointerleave', function () {
            if (!T) return;
            T.dragging = false;
            state.hovered = null;
            hideTip();
            syncScene();
        });

        canvas.addEventListener('wheel', function (e) {
            if (state.view !== '3d' || !T) return;
            e.preventDefault();
            T.camTarget.radius = clamp(T.camTarget.radius * Math.exp(e.deltaY * 0.0011), 1.9, 7.2);
            state.lastInput = Date.now();
        }, { passive: false });

        stage.addEventListener('dblclick', function (e) {
            if (state.view !== '3d') return;
            if (e.target.closest('.ss-stage-tools')) return;
            resetCamera();
        });

        stage.addEventListener('keydown', function (e) {
            if (state.view !== '3d' || !T) return;
            var step = 0.11;
            if (e.key === 'ArrowLeft') T.camTarget.theta -= step;
            else if (e.key === 'ArrowRight') T.camTarget.theta += step;
            else if (e.key === 'ArrowUp') T.camTarget.phi = clamp(T.camTarget.phi - step, 0.22, 2.92);
            else if (e.key === 'ArrowDown') T.camTarget.phi = clamp(T.camTarget.phi + step, 0.22, 2.92);
            else if (e.key === '+' || e.key === '=') T.camTarget.radius = clamp(T.camTarget.radius - 0.3, 1.9, 7.2);
            else if (e.key === '-' || e.key === '_') T.camTarget.radius = clamp(T.camTarget.radius + 0.3, 1.9, 7.2);
            else if (e.key === 'Escape') { state.selected = null; syncScene(); renderDetail(); return; }
            else return;
            e.preventDefault();
            state.lastInput = Date.now();
        });

        window.addEventListener('resize', resizeThree);
    }

    function handleClick(e) {
        var idx = pick(e);
        if (idx != null) select(idx);
    }

    function pick(e) {
        if (!T) return null;
        var stage = $('#ssStage');
        var rect = stage.getBoundingClientRect();
        T.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        T.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        T.raycaster.setFromCamera(T.pointer, T.camera);
        var hits = T.raycaster.intersectObjects(T.dots, false);
        return hits.length ? hits[0].object.userData.index : null;
    }

    function updateHover(e) {
        var idx = pick(e);
        if (idx === state.hovered) {
            if (idx != null) moveTip(e);
            return;
        }
        state.hovered = idx;
        syncScene();
        if (idx == null) { hideTip(); return; }
        showTip(idx, e);
    }

    function showTip(idx, e) {
        var c = CHUNK_BY_ID[idx];
        var tip = $('#ssTip');
        var doc = DOC_BY_ID[c.d];
        tip.innerHTML = '';
        var title = document.createElement('span');
        title.textContent = c.t;
        var sub = document.createElement('small');
        sub.textContent = (doc ? doc.label : '') + ' · ' + c.n + ' 字';
        tip.appendChild(title);
        tip.appendChild(sub);
        tip.hidden = false;
        moveTip(e);
    }

    function moveTip(e) {
        var stage = $('#ssStage');
        var rect = stage.getBoundingClientRect();
        var tip = $('#ssTip');
        tip.style.left = (e.clientX - rect.left) + 'px';
        tip.style.top = (e.clientY - rect.top) + 'px';
    }

    function hideTip() { $('#ssTip').hidden = true; }

    function resetCamera() {
        if (!T) return;
        T.camTarget.theta = 0.72;
        T.camTarget.phi = 1.06;
        T.camTarget.radius = 3.05;
        T.camTarget.tx = 0;
        T.camTarget.ty = 0;
        T.camTarget.tz = 0;
        state.lastInput = Date.now();
    }

    function focusOn(c) {
        if (!T) return;
        T.camTarget.tx = c.p[0] * 0.35;
        T.camTarget.ty = c.p[1] * 0.35;
        T.camTarget.tz = c.p[2] * 0.35;
        T.camTarget.radius = Math.min(T.camTarget.radius, 3.4);
        state.lastInput = Date.now();
    }

    /* ---------------- 2D 平面视图 ---------------- */

    var FLAT = { dots: [], lines: null, anchor: null };

    function buildFlat() {
        var svg = $('#ssFlat');
        var NS = 'http://www.w3.org/2000/svg';

        var grid = document.createElementNS(NS, 'g');
        for (var g = -1; g <= 1; g += 0.5) {
            var v = document.createElementNS(NS, 'line');
            v.setAttribute('x1', g); v.setAttribute('x2', g);
            v.setAttribute('y1', -1.5); v.setAttribute('y2', 1.5);
            v.setAttribute('stroke', 'rgba(23,36,51,.06)');
            v.setAttribute('stroke-width', '0.004');
            grid.appendChild(v);
            var h = document.createElementNS(NS, 'line');
            h.setAttribute('y1', g); h.setAttribute('y2', g);
            h.setAttribute('x1', -1.5); h.setAttribute('x2', 1.5);
            h.setAttribute('stroke', 'rgba(23,36,51,.06)');
            h.setAttribute('stroke-width', '0.004');
            grid.appendChild(h);
        }
        svg.appendChild(grid);

        FLAT.lines = document.createElementNS(NS, 'g');
        svg.appendChild(FLAT.lines);

        FLAT.dots.forEach(function (d) { d.remove(); });
        FLAT.dots = [];

        CHUNKS.forEach(function (c) {
            var dot = document.createElementNS(NS, 'circle');
            dot.setAttribute('cx', c.p[0]);
            dot.setAttribute('cy', -c.p[1]);
            dot.setAttribute('r', 0.016 + (c.k - 1) * 0.006);
            dot.setAttribute('fill', COLORS[c.c] || '#66727d');
            dot.setAttribute('fill-opacity', '0.55');
            dot.dataset.index = c.i;
            dot.style.cursor = 'pointer';
            svg.appendChild(dot);
            FLAT.dots.push(dot);
        });

        FLAT.anchor = document.createElementNS(NS, 'circle');
        FLAT.anchor.setAttribute('r', '0.05');
        FLAT.anchor.setAttribute('fill', 'none');
        FLAT.anchor.setAttribute('stroke', '#172433');
        FLAT.anchor.setAttribute('stroke-width', '0.008');
        FLAT.anchor.setAttribute('opacity', '0');
        svg.appendChild(FLAT.anchor);

        svg.addEventListener('click', function (e) {
            var idx = e.target && e.target.dataset ? e.target.dataset.index : null;
            if (idx != null) select(Number(idx));
        });

        svg.addEventListener('pointermove', function (e) {
            var idx = e.target && e.target.dataset ? e.target.dataset.index : null;
            var next = idx == null ? null : Number(idx);
            if (next === state.hovered) return;
            state.hovered = next;
            syncFlat();
            if (next == null) { hideTip(); return; }
            var rect = $('#ssStage').getBoundingClientRect();
            showTipAt(next, e.clientX - rect.left, e.clientY - rect.top);
        });

        svg.addEventListener('pointerleave', function () {
            state.hovered = null;
            hideTip();
            syncFlat();
        });
    }

    function showTipAt(idx, x, y) {
        var c = CHUNK_BY_ID[idx];
        var doc = DOC_BY_ID[c.d];
        var tip = $('#ssTip');
        tip.innerHTML = '';
        var title = document.createElement('span');
        title.textContent = c.t;
        var sub = document.createElement('small');
        sub.textContent = (doc ? doc.label : '') + ' · ' + c.n + ' 字';
        tip.appendChild(title);
        tip.appendChild(sub);
        tip.hidden = false;
        tip.style.left = x + 'px';
        tip.style.top = y + 'px';
    }

    function syncFlat() {
        if (!FLAT.dots.length) return;
        var hitMap = state.hitMap || {};
        FLAT.dots.forEach(function (dot) {
            var c = CHUNK_BY_ID[Number(dot.dataset.index)];
            var hit = hitMap[c.i];
            var dim = state.hits.length > 0 && !hit;
            var isSel = state.selected === c.i;
            var isHover = state.hovered === c.i;

            var r = 0.016 + (c.k - 1) * 0.006;
            if (hit) r *= 1.45 + hit.score * 0.5;
            if (isSel) r *= 1.5;
            if (isHover) r *= 1.25;

            dot.setAttribute('r', r);
            dot.setAttribute('fill', COLORS[c.c] || '#66727d');
            dot.setAttribute('fill-opacity', dim ? '0.16' : (hit ? '0.95' : '0.5'));
            dot.setAttribute('stroke', isSel ? '#172433' : 'none');
            dot.setAttribute('stroke-width', isSel ? '0.008' : '0');
        });

        // 连线
        while (FLAT.lines.firstChild) FLAT.lines.removeChild(FLAT.lines.firstChild);
        var qp = state.queryPos;
        if (qp) {
            var NS = 'http://www.w3.org/2000/svg';
            state.hits.slice(0, 12).forEach(function (h) {
                var c = CHUNK_BY_ID[h.i];
                var line = document.createElementNS(NS, 'line');
                line.setAttribute('x1', qp.x);
                line.setAttribute('y1', -qp.y);
                line.setAttribute('x2', c.p[0]);
                line.setAttribute('y2', -c.p[1]);
                line.setAttribute('stroke', '#315ce8');
                line.setAttribute('stroke-width', '0.004');
                line.setAttribute('stroke-opacity', '0.3');
                FLAT.lines.appendChild(line);
            });
            FLAT.anchor.setAttribute('cx', qp.x);
            FLAT.anchor.setAttribute('cy', -qp.y);
            FLAT.anchor.setAttribute('opacity', '0.85');
        } else {
            FLAT.anchor.setAttribute('opacity', '0');
        }
    }

    /* ---------------- 视图切换 ---------------- */

    function setView(view, silent) {
        state.view = view;
        var stage = $('#ssStage');
        var isFlat = view === '2d';

        stage.classList.toggle('is-flat', isFlat);
        $('#ssCanvas').hidden = isFlat;
        // SVGElement 没有 hidden 属性，必须直接改 attribute
        var flatEl = $('#ssFlat');
        if (isFlat) flatEl.removeAttribute('hidden');
        else flatEl.setAttribute('hidden', '');
        $('#ssTags').hidden = isFlat;
        $('#ssSpaceLabel').textContent = isFlat ? 'SPACE / 2D' : 'SPACE / 3D';

        $$('[data-view]').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.view === view));
        });

        if (isFlat) {
            syncFlat();
        } else if (T) {
            resizeThree();
            syncScene();
        }
        if (!silent) state.lastInput = Date.now();
    }

    /* ---------------- 面板渲染 ---------------- */

    function renderLegend() {
        var host = $('#ssLegend');
        var counts = {};
        CHUNKS.forEach(function (c) { counts[c.c] = (counts[c.c] || 0) + 1; });
        (DATA.categories || []).forEach(function (cat) {
            if (!counts[cat.key]) return;
            var li = document.createElement('li');
            var dot = document.createElement('i');
            dot.className = 'ss-dot';
            dot.style.color = COLORS[cat.key] || '#66727d';
            var label = document.createElement('span');
            label.textContent = cat.label;
            var num = document.createElement('b');
            num.textContent = counts[cat.key];
            li.appendChild(dot);
            li.appendChild(label);
            li.appendChild(num);
            host.appendChild(li);
        });
    }

    function renderPresets() {
        var host = $('#ssPresets');
        (DATA.queries || []).forEach(function (q, i) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'ss-chip';
            b.textContent = q.q;
            b.dataset.q = q.q;
            b.setAttribute('aria-pressed', 'false');
            if (i >= 6) b.hidden = true;
            b.addEventListener('click', function () { runPreset(q); });
            host.appendChild(b);
        });

        var more = $('#ssMore');
        if (!more) return;
        if ((DATA.queries || []).length <= 6) { more.hidden = true; return; }
        more.addEventListener('click', function () {
            var open = more.getAttribute('aria-expanded') === 'true';
            more.setAttribute('aria-expanded', String(!open));
            more.textContent = open ? '看另外 6 个问题' : '收起问题';
            $$('.ss-chip').forEach(function (chip, i) {
                if (i >= 6) chip.hidden = open;
            });
            $('#ssPresets').classList.toggle('is-open', !open);
        });
    }

    function highlightPreset() {
        $$('.ss-chip').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.q === state.preset));
        });
    }

    function renderEmptyResults() {
        var list = $('#ssResultList');
        list.innerHTML = '';
        var li = document.createElement('li');
        li.className = 'ss-empty';
        li.innerHTML = '<b>还没有检索</b>点上面的预设问题，或者在输入框里问一句。';
        list.appendChild(li);
        $('#ssResultMeta').textContent = '选一个问题开始';
    }

    function renderResults(modeLabel) {
        var list = $('#ssResultList');
        list.innerHTML = '';

        if (!state.hits.length) {
            var empty = document.createElement('li');
            empty.className = 'ss-empty';
            empty.innerHTML = '<b>没有召回到片段</b>换一种说法，或切到另一个召回模式再试。';
            list.appendChild(empty);
            $('#ssResultMeta').textContent = '0 条';
            return;
        }

        var frag = document.createDocumentFragment();
        state.hits.slice(0, 18).forEach(function (h, idx) {
            var c = CHUNK_BY_ID[h.i];
            var doc = DOC_BY_ID[c.d];

            var li = document.createElement('li');
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ss-hit';
            btn.setAttribute('aria-current', String(state.selected === c.i));
            btn.dataset.index = c.i;

            var rank = document.createElement('span');
            rank.className = 'ss-hit-rank';
            rank.textContent = String(idx + 1).padStart(2, '0');

            var title = document.createElement('span');
            title.className = 'ss-hit-title';
            title.textContent = c.t;

            var score = document.createElement('span');
            score.className = 'ss-hit-score';
            score.textContent = h.score.toFixed(2);

            var snippet = document.createElement('span');
            snippet.className = 'ss-hit-snippet';
            snippet.textContent = c.x.replace(/\n/g, ' ').slice(0, 96);

            var cat = document.createElement('span');
            cat.className = 'ss-hit-cat';
            var dot = document.createElement('i');
            dot.className = 'ss-dot';
            dot.style.color = COLORS[c.c] || '#66727d';
            var catText = document.createElement('span');
            catText.textContent = (doc ? doc.label : '') + (doc ? ' · ' + doc.title : '');
            cat.appendChild(dot);
            cat.appendChild(catText);

            btn.appendChild(rank);
            btn.appendChild(title);
            btn.appendChild(score);
            btn.appendChild(snippet);
            btn.appendChild(cat);
            btn.addEventListener('click', function () { select(c.i, true); });

            li.appendChild(btn);
            frag.appendChild(li);
        });
        list.appendChild(frag);

        $('#ssResultMeta').textContent = state.hits.length + ' 条 · ' + (modeLabel || '');
    }

    function select(index, scrollIntoView) {
        state.selected = index;
        var c = CHUNK_BY_ID[index];
        if (c) focusOn(c);
        apply();
        $$('.ss-hit').forEach(function (b) {
            b.setAttribute('aria-current', String(Number(b.dataset.index) === index));
        });
        if (scrollIntoView) {
            var active = $('.ss-hit[aria-current="true"]');
            if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
        }
    }

    function renderDetail() {
        var box = $('#ssDetail');
        var panel = $('.ss-panel');
        if (state.selected == null || !CHUNK_BY_ID[state.selected]) {
            box.hidden = true;
            panel.classList.remove('is-detail');
            return;
        }
        var c = CHUNK_BY_ID[state.selected];
        var doc = DOC_BY_ID[c.d];
        var hit = state.hitMap ? state.hitMap[c.i] : null;

        box.hidden = false;
        panel.classList.add('is-detail');
        $('#ssDetailTitle').textContent = c.t;
        $('#ssDetailCat').style.color = COLORS[c.c] || '#315ce8';
        $('#ssDetailCat').lastElementChild.textContent = doc ? doc.label : '';
        $('#ssDetailScore').textContent = hit ? hit.score.toFixed(3) : '未命中';
        $('#ssDetailLen').textContent = c.n + ' 字 / ' + tokensOf(c.x) + ' t';
        $('#ssDetailSource').textContent = doc ? doc.title : '—';
        $('#ssDetailText').textContent = c.x;
        $('#ssDetailLink').href = ANCHORS[c.c] || '../pages/AI.html';
    }

    function tokensOf(text) {
        var chars = String(text).replace(/\s/g, '').length;
        return Math.ceil(chars / TOKEN_RATIO) + 4;
    }

    function renderWindow() {
        var host = $('#ssWindow');
        var note = $('#ssWindowNote');
        var budget = state.budget;
        host.innerHTML = '';

        if (!state.hits.length) {
            note.textContent = '先选一个问题，这里会显示片段如何被装进窗口。';
            return;
        }

        var used = 0;
        var kept = 0;
        var dropped = 0;

        state.hits.slice(0, 8).forEach(function (h, idx) {
            var c = CHUNK_BY_ID[h.i];
            var t = tokensOf(c.x);
            var fits = used + t <= budget;

            var row = document.createElement('div');
            row.className = 'ss-slot' + (fits ? '' : ' is-dropped');

            var fill = document.createElement('div');
            fill.className = 'ss-slot-fill';
            var width = Math.min(100, (t / budget) * 100);
            fill.style.width = (fits ? width : 0) + '%';

            var rank = document.createElement('b');
            rank.textContent = String(idx + 1).padStart(2, '0');

            var body = document.createElement('span');
            body.textContent = fits ? c.t : c.t + ' · 溢出';

            var tok = document.createElement('em');
            tok.textContent = (fits ? '+' : '×') + t + ' t';

            row.appendChild(fill);
            row.appendChild(rank);
            row.appendChild(body);
            row.appendChild(tok);
            host.appendChild(row);

            if (fits) { used += t; kept += 1; } else { dropped += 1; }
        });

        note.innerHTML = '';
        var b1 = document.createElement('b');
        b1.textContent = kept + ' / ' + Math.min(8, state.hits.length);
        note.appendChild(b1);
        note.appendChild(document.createTextNode(
            ' 条装入 · 用掉 ' + used + ' / ' + budget + ' tokens' +
            (dropped ? ' · 丢弃 ' + dropped + ' 条' : ' · 没有溢出')
        ));
    }

    function showNotice(text, ms) {
        var node = $('#ssNotice');
        node.textContent = text;
        node.hidden = false;
        window.clearTimeout(showNotice._t);
        showNotice._t = window.setTimeout(function () { node.hidden = true; }, ms || 5200);
    }

    /* ---------------- 绑定 UI ---------------- */

    function bindUI() {
        $('#ssForm').addEventListener('submit', function (e) {
            e.preventDefault();
            runFree($('#ssInput').value);
        });

        $$('.ss-mode button').forEach(function (b) {
            b.addEventListener('click', function () {
                state.mode = b.dataset.mode;
                syncModeButtons();
                if (state.preset && state.mode === 'vector') {
                    var preset = (DATA.queries || []).filter(function (q) { return q.q === state.preset; })[0];
                    if (preset) runPreset(preset);
                } else if (state.query) {
                    runFree(state.query);
                }
            });
        });

        $$('[data-view]').forEach(function (b) {
            b.addEventListener('click', function () { setView(b.dataset.view); });
        });

        $('#ssSpin').addEventListener('click', function () {
            state.spin = !state.spin;
            $('#ssSpin').setAttribute('aria-pressed', String(state.spin));
            state.lastInput = 0;
        });

        $('#ssReset').addEventListener('click', function () {
            resetCamera();
            state.selected = null;
            apply();
        });

        $('#ssBudget').addEventListener('input', function (e) {
            state.budget = Number(e.target.value);
            $('#ssBudgetOut').textContent = state.budget + ' tokens';
            renderWindow();
        });

        $('#ssDetailClose').addEventListener('click', function () {
            state.selected = null;
            apply();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && state.selected != null) {
                state.selected = null;
                apply();
            }
        });

        if (T) {
            var stage = $('#ssStage');
            var io = new IntersectionObserver(function (entries) {
                T.visible = entries[0].isIntersecting;
            }, { threshold: 0.05 });
            io.observe(stage);
        }
    }

    function syncModeButtons() {
        $$('.ss-mode button').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode));
        });
    }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    /* ---------------- 启动 ---------------- */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
