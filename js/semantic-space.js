/* ============================================================
   内容书架 / semantic-space.js
   职责：数据索引、分词与 BM25、召回、右侧面板、上下文装配
   三维部分在 semantic-engine.js，通过回调与这里通信
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

    var PART_META = {
        shelf: {
            name: '书架',
            desc: '承托七本书的木质书架。侧板和背板把书固定成一排，前缘铭牌上刻着这排书总的范围。',
            specs: [['尺寸', '2.5 × 0.86'], ['层数', '1 排 7 本'], ['材质', '深色 hardwood + 金属包边']]
        },
        rail: {
            name: '顶横梁',
            desc: '压在书架顶部的横梁，底面 78 道刻度对应 78 个片段——它不参与装载，只负责把「一共有多少段」摊开给你看。',
            specs: [['刻度', '78 道'], ['长度', '2.5'], ['含义', '1 刻度 = 1 个片段']]
        }
    };

    var TOKEN_RATIO = 1.6;   // 1 token ≈ 1.6 汉字，仅作估算
    var LIMIT = 24;

    var state = {
        hits: [],
        hitMap: {},
        mode: 'vector',
        preset: null,
        selectedChunk: null,
        selectedPart: null,
        budget: 240
    };

    var CHUNKS = [];
    var CHUNK_BY_ID = {};
    var DOC_BY_ID = {};
    var CAT_LABEL = {};
    var engine = null;

    /* ---------------- 启动 ---------------- */

    function boot() {
        if (!DATA || !DATA.chunks || !DATA.chunks.length) {
            fail('数据没有加载成功', 'space.js 未载入或为空，请重跑 build-semantic-space.py。');
            return;
        }

        (DATA.docs || []).forEach(function (d) { DOC_BY_ID[d.id] = d; });
        (DATA.categories || []).forEach(function (c) { CAT_LABEL[c.key] = c.label; });
        DATA.chunks.forEach(function (c) {
            CHUNKS.push(c);
            CHUNK_BY_ID[c.i] = c;
        });

        paintStats();
        renderPresets();
        renderEmptyResults();
        renderWindow();
        bindUI();
        initEngine();

        maybeShowGuide();

        var first = DATA.queries && DATA.queries[0];
        if (first) window.setTimeout(function () { runPreset(first); }, 520);
    }

    function fail(title, detail) {
        var box = $('#ssLoading');
        if (!box) return;
        box.innerHTML = '';
        var b = document.createElement('b');
        b.textContent = title;
        var p = document.createElement('p');
        p.textContent = detail;
        p.style.maxWidth = '30ch';
        p.style.textAlign = 'center';
        p.style.letterSpacing = '0';
        box.appendChild(b);
        box.appendChild(p);
    }

    function paintStats() {
        var m = DATA.meta || {};
        var map = { docs: m.docs, chunks: m.chunks, vocab: m.vocab };
        $$('[data-stat]').forEach(function (node) {
            var v = map[node.getAttribute('data-stat')];
            if (v) node.textContent = v;
        });
    }

    /* ---------------- 三维书架 ---------------- */

    function initEngine() {
        var stage = $('#ssStage');
        var canvas = $('#ssCanvas');
        if (!window.SSEngine) {
            fallback('三维书架没有加载，下面是同一份数据的结构剖面。');
            return;
        }
        engine = window.SSEngine.create({
            canvas: canvas,
            stage: stage,
            labelLayer: $('#ssLabels'),
            data: DATA,
            colors: COLORS,
            onSelectPart: function (key) {
                if (key) showPart(key);
                else showResults();
            },
            onSelectChunk: function (idx) {
                showChunk(idx);
            },
            onHoverPart: function () {}
        });

        if (!engine) {
            fallback('当前环境不支持 WebGL，下面是同一份数据的结构剖面。');
            return;
        }
        $('#ssLoading').hidden = true;
    }

    function fallback(message) {
        var stage = $('#ssStage');
        var loading = $('#ssLoading');
        if (loading) loading.hidden = true;
        var cv = $('#ssCanvas');
        if (cv) cv.style.display = 'none';
        if ($('#ssLabels')) $('#ssLabels').style.display = 'none';

        var box = document.createElement('div');
        box.className = 'ss-fallback';
        var parts = (DATA.categories || []).map(function (cat) {
            var items = CHUNKS.filter(function (c) { return c.c === cat.key; });
            return { key: cat.key, label: cat.label, n: items.length };
        }).sort(function (a, b) { return b.n - a.n; });

        var maxN = Math.max.apply(null, parts.map(function (p) { return p.n; }));
        var rows = parts.map(function (p, i) {
            var w = 150 + 300 * Math.sqrt(p.n / maxN);
            var y = 20 + i * 46;
            return '<g transform="translate(' + (300 - w / 2) + ',' + y + ')">' +
                '<rect width="' + w + '" height="30" rx="7" fill="#161d29" stroke="' + COLORS[p.key] + '" stroke-width="1.4"/>' +
                '<rect x="10" y="12" width="' + Math.min(52, w - 20) + '" height="4" rx="2" fill="' + COLORS[p.key] + '" opacity=".9"/>' +
                '<text x="' + (w - 10) + '" y="20" text-anchor="end" font-family="Consolas, monospace" font-size="11" fill="#e8eef6">' +
                p.label + ' · ' + p.n + '</text></g>';
        }).join('');

        box.innerHTML = '<svg viewBox="0 0 600 360" role="img" aria-label="7 本书的结构剖面">' +
            '<text x="300" y="12" text-anchor="middle" font-family="Consolas, monospace" font-size="10" fill="#8f979f">STRUCTURE SECTION</text>' +
            rows + '</svg>' +
            '<p class="ss-fallback-note">' + message + '</p>';
        stage.appendChild(box);
    }

    /* ---------------- 分词 / BM25 ---------------- */

    var CJK = /[\u4e00-\u9fff]+/g;
    var ASCIIW = /[a-z0-9][a-z0-9+#._-]*/g;

    function tokenize(text) {
        var s = String(text || '').toLowerCase();
        var out = [];
        var m;
        CJK.lastIndex = 0;
        while ((m = CJK.exec(s))) {
            var seg = m[0];
            for (var i = 0; i < seg.length - 1; i++) out.push(seg.slice(i, i + 2));
            if (seg.length === 1) out.push(seg);
        }
        ASCIIW.lastIndex = 0;
        while ((m = ASCIIW.exec(s))) out.push(m[0]);
        return out;
    }

    var BM25 = null;

    function buildBM25() {
        var docs = CHUNKS.map(function (c) { return tokenize(c.t + ' ' + c.x); });
        var df = {}, tfs = [], lens = [];
        var total = 0;
        docs.forEach(function (toks) {
            var tf = {};
            toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
            Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
            tfs.push(tf);
            lens.push(toks.length);
            total += toks.length;
        });
        BM25 = {
            n: docs.length,
            avgdl: total / Math.max(1, docs.length),
            df: df, tfs: tfs, lens: lens
        };
    }

    function bm25Search(query, limit) {
        if (!BM25) buildBM25();
        var k1 = 1.2, b = 0.62;
        var terms = [];
        var seen = {};
        tokenize(query).forEach(function (t) {
            if (seen[t]) return;
            seen[t] = 1;
            terms.push(t);
        });

        var scored = [];
        terms.forEach(function (term) {
            var df = BM25.df[term] || 0;
            if (!df) return;
            var idf = Math.log(1 + (BM25.n - df + 0.5) / (df + 0.5));
            BM25.tfs.forEach(function (tf, i) {
                var f = tf[term];
                if (!f) return;
                var dl = BM25.lens[i];
                var s = idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * dl / BM25.avgdl));
                scored.push({ i: i, s: s });
            });
        });

        scored.sort(function (a, b2) { return b2.s - a.s; });
        var top = scored.slice(0, limit);
        var max = top.length ? top[0].s : 0;
        var matched = terms.filter(function (t) { return BM25.df[t]; }).length;

        return {
            hits: top.map(function (r) {
                return { i: r.i, score: Math.max(0.01, r.s / (max || 1)) };
            }),
            matched: matched,
            total: terms.length
        };
    }

    /* ---------------- 召回 ---------------- */

    function runPreset(preset) {
        state.preset = preset;
        state.mode = 'vector';
        setMode('vector', true);
        var input = $('#ssInput');
        if (input) input.value = preset.q;
        $$('.ss-chip').forEach(function (c) {
            c.setAttribute('aria-pressed', String(c.dataset.q === preset.q));
        });
        hideNotice();
        applyHits((preset.hits || []).slice(0, LIMIT).map(function (h) {
            return { i: h[0], score: h[1] };
        }), preset.q);
    }

    function runFree(text) {
        var matched = (DATA.queries || []).filter(function (q) { return q.q === text; })[0];
        if (matched) { runPreset(matched); return; }

        var res = bm25Search(text, LIMIT);
        state.preset = null;
        state.mode = 'keyword';
        setMode('keyword', true);
        $$('.ss-chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });

        if (!res.hits.length) {
            showNotice('没有命中任何片段，换一种说法试试。');
        } else if (res.matched < res.total) {
            showNotice('自由输入走的是 BM25 关键词召回，没有预计算向量。');
        } else {
            hideNotice();
        }
        applyHits(res.hits, text);
    }

    function applyHits(hits, query) {
        state.hits = hits;
        state.hitMap = {};
        hits.forEach(function (h, idx) {
            state.hitMap[h.i] = { score: h.score, rank: idx + 1 };
        });
        state.selectedChunk = null;

        if (engine) engine.setHits(hits);
        renderResults(query);
        renderDist();
        renderWindow();
        showResults();
        syncStatus();
    }

    /* ---------------- 面板 ---------------- */

    function panelViews() {
        return {
            results: $('#ssResults'),
            detail: $('#ssDetail'),
            part: $('#ssPart')
        };
    }

    function showResults() {
        var v = panelViews();
        v.detail.hidden = true;
        v.part.hidden = true;
        v.results.hidden = false;
        var first = $('.ss-hit', v.results);
        if (first) {
            $$('.ss-hit').forEach(function (b) { b.removeAttribute('aria-current'); });
        }
    }

    function showChunk(idx) {
        var c = CHUNK_BY_ID[idx];
        if (!c) return;
        var v = panelViews();
        var hit = state.hitMap[idx];

        state.selectedChunk = idx;
        state.selectedPart = null;

        $('#ssDetailCat').style.color = COLORS[c.c] || 'var(--ss-muted)';
        $('#ssDetailCat').querySelector('span').textContent = CAT_LABEL[c.c] || c.c;
        $('#ssDetailTitle').textContent = c.t || '（无标题）';
        $('#ssDetailScore').textContent = hit ? hit.score.toFixed(4) : '—';
        $('#ssDetailLen').textContent = (c.x || '').length + ' 字 / ' + tokensOf(c) + ' tok';
        $('#ssDetailSource').textContent = (DOC_BY_ID[c.d] && DOC_BY_ID[c.d].title) || '笔记片段';
        $('#ssDetailText').textContent = c.x || '';
        $('#ssDetailLink').href = ANCHORS[c.c] || '../pages/AI.html';

        v.results.hidden = true;
        v.part.hidden = true;
        v.detail.hidden = false;

        $$('.ss-hit').forEach(function (b) {
            b.setAttribute('aria-current', String(Number(b.dataset.i) === idx));
        });
    }

    function kvRow(dt, dd) {
        var div = document.createElement('div');
        var a = document.createElement('dt');
        a.textContent = dt;
        var b = document.createElement('dd');
        b.textContent = dd;
        div.appendChild(a);
        div.appendChild(b);
        return div;
    }

    function showPart(key) {
        var part = null;
        if (engine) {
            part = engine.parts.filter(function (p) { return p.key === key; })[0];
        }

        var isPlate = !!CAT_LABEL[key];
        var meta = PART_META[key] || null;
        var label = isPlate ? CAT_LABEL[key] : (meta ? meta.name : key);
        var items = CHUNKS.filter(function (c) { return c.c === key; });
        var chars = items.reduce(function (sum, c) { return sum + (c.x || '').length; }, 0);
        var hits = state.hits.filter(function (h) {
            var c = CHUNK_BY_ID[h.i];
            return c && c.c === key;
        });

        var v = panelViews();
        state.selectedPart = key;
        state.selectedChunk = null;

        $('#ssPartIndex').style.color = COLORS[key] || 'var(--ss-muted)';
        $('#ssPartIndex').querySelector('span').textContent =
            'PART ' + String((part ? part.index : 0) + 1).padStart(2, '0') + (isPlate ? '' : ' · 书架部件');
        $('#ssPartName').textContent = label;
        var link = $('#ssPartLink');
        link.hidden = !isPlate;
        link.href = ANCHORS[key] || '../pages/AI.html';

        var kv = $('#ssPartKv');
        kv.innerHTML = '';
        var desc = $('#ssPartDesc');
        var sub = $('#ssPartSub');
        var list = $('#ssPartChunks');
        list.innerHTML = '';

        if (isPlate) {
            desc.hidden = true;
            sub.hidden = false;
            list.hidden = false;
            kv.appendChild(kvRow('片段数', items.length + ' 段'));
            kv.appendChild(kvRow('总字数', chars.toLocaleString('en-US') + ' 字'));
            kv.appendChild(kvRow('平均长度', items.length ? Math.round(chars / items.length) + ' 字' : '—'));
            kv.appendChild(kvRow('本次命中', hits.length ? hits.length + ' 段' : '未命中'));

            sub.textContent = '这本书里的片段';
            items.slice(0, 8).forEach(function (c) {
                var li = document.createElement('li');
                var b = document.createElement('b');
                b.textContent = '#' + String(c.i + 1).padStart(2, '0');
                var span = document.createElement('span');
                span.textContent = c.t || '（无标题）';
                li.appendChild(b);
                li.appendChild(span);
                li.addEventListener('click', function () {
                    if (engine) engine.focusChunk(c.i);
                    showChunk(c.i);
                });
                list.appendChild(li);
            });
        } else {
            desc.hidden = false;
            desc.textContent = meta ? meta.desc : '这个部件没有挂内容片段。';
            sub.hidden = true;
            list.hidden = true;
            (meta ? meta.specs : []).forEach(function (row) {
                kv.appendChild(kvRow(row[0], row[1]));
            });
        }

        v.results.hidden = true;
        v.detail.hidden = true;
        v.part.hidden = false;
        syncStatus();
    }

    function renderDist() {
        var box = $('#ssDist');
        var list = $('#ssDistList');
        if (!box || !list) return;

        if (!state.hits.length) {
            box.hidden = true;
            return;
        }

        var counts = {};
        state.hits.forEach(function (h) {
            var c = CHUNK_BY_ID[h.i];
            if (c) counts[c.c] = (counts[c.c] || 0) + 1;
        });

        var rows = Object.keys(counts).map(function (k) {
            return { key: k, n: counts[k], label: CAT_LABEL[k] || k };
        }).sort(function (a, b) { return b.n - a.n; });

        var max = Math.max.apply(null, rows.map(function (r) { return r.n; }));
        list.innerHTML = '';
        rows.forEach(function (r) {
            var li = document.createElement('li');
            var dot = document.createElement('i');
            dot.className = 'ss-dot';
            dot.style.color = COLORS[r.key] || 'var(--ss-muted)';
            var name = document.createElement('span');
            name.textContent = r.label;
            var bar = document.createElement('span');
            bar.className = 'ss-dist-bar';
            bar.innerHTML = '<i style="width:' + Math.round((r.n / max) * 100) + '%;background:' + (COLORS[r.key] || '#315ce8') + '"></i>';
            var num = document.createElement('em');
            num.textContent = r.n;
            li.appendChild(dot);
            li.appendChild(name);
            li.appendChild(bar);
            li.appendChild(num);
            list.appendChild(li);
        });

        $('#ssDistTotal').textContent = state.hits.length + ' 段命中 / ' + rows.length + ' 个主题';
        box.hidden = false;
    }

    function renderResults(query) {
        var list = $('#ssResultList');
        list.innerHTML = '';
        $('#ssResultMeta').textContent = state.hits.length
            ? state.hits.length + ' 条 · ' + (state.mode === 'vector' ? 'COSINE' : 'BM25')
            : (query ? '没有命中' : '选一个问题开始');

        if (!state.hits.length) {
            renderEmptyResults(query);
            return;
        }

        state.hits.forEach(function (h, idx) {
            var c = CHUNK_BY_ID[h.i];
            if (!c) return;

            var li = document.createElement('li');
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ss-hit';
            btn.dataset.i = c.i;

            var rank = document.createElement('span');
            rank.className = 'ss-hit-rank';
            rank.textContent = String(idx + 1).padStart(2, '0');

            var title = document.createElement('span');
            title.className = 'ss-hit-title';
            title.textContent = c.t || '（无标题）';

            var score = document.createElement('span');
            score.className = 'ss-hit-score';
            score.textContent = h.score.toFixed(3);

            var snippet = document.createElement('span');
            snippet.className = 'ss-hit-snippet';
            snippet.textContent = (c.x || '').replace(/\s+/g, ' ').slice(0, 96);

            var cat = document.createElement('span');
            cat.className = 'ss-hit-cat';
            cat.style.color = COLORS[c.c];
            cat.innerHTML = '<i class="ss-dot"></i>';
            var catText = document.createElement('span');
            catText.textContent = CAT_LABEL[c.c] || c.c;
            catText.style.color = 'var(--ss-faint)';
            cat.appendChild(catText);

            btn.appendChild(rank);
            btn.appendChild(title);
            btn.appendChild(score);
            btn.appendChild(snippet);
            btn.appendChild(cat);

            btn.addEventListener('click', function () {
                if (engine) engine.focusChunk(c.i);
                showChunk(c.i);
            });

            li.appendChild(btn);
            list.appendChild(li);
        });
        syncStatus();
    }

    function renderEmptyResults(query) {
        var list = $('#ssResultList');
        list.innerHTML = '';
        var li = document.createElement('li');
        li.className = 'ss-empty';
        li.innerHTML = query
            ? '<b>没有命中的片段</b>换一种说法，或切到另一个召回模式。'
            : '<b>还没有检索</b>点上面的预设问题，或者自己问一句。';
        list.appendChild(li);
    }

    /* ---------------- 上下文装配 ---------------- */

    function tokensOf(c) {
        var chars = (c.x || '').length;
        return Math.max(4, Math.round(chars / TOKEN_RATIO));
    }

    function renderWindow() {
        var host = $('#ssWindow');
        if (!host) return;
        host.innerHTML = '';

        if (!state.hits.length) {
            $('#ssWindowNote').textContent = '先选一个问题，这里会显示片段如何被装进窗口。';
            return;
        }

        var used = 0;
        var kept = 0;
        var dropped = 0;
        var top = state.hits.slice(0, 8);

        top.forEach(function (h) {
            var c = CHUNK_BY_ID[h.i];
            if (!c) return;
            var tk = tokensOf(c);
            var fits = used + tk <= state.budget;

            var row = document.createElement('div');
            row.className = 'ss-slot' + (fits ? '' : ' is-dropped');

            var fill = document.createElement('i');
            fill.className = 'ss-slot-fill';
            fill.style.width = Math.min(100, (tk / state.budget) * 100) + '%';

            var rank = document.createElement('b');
            rank.textContent = '#' + String(c.i + 1).padStart(2, '0');

            var title = document.createElement('span');
            title.textContent = c.t || '（无标题）';

            var tok = document.createElement('em');
            tok.textContent = fits ? tk + ' tok' : '× ' + tk;

            row.appendChild(fill);
            row.appendChild(rank);
            row.appendChild(title);
            row.appendChild(tok);
            host.appendChild(row);

            if (fits) { used += tk; kept++; } else { dropped++; }
        });

        $('#ssWindowNote').innerHTML = '装入 <b>' + kept + '</b> 段，用掉 <b>' + used +
            '</b> / ' + state.budget + ' tokens，丢弃 <b>' + dropped + '</b> 段。' +
            '总召回 ' + state.hits.length + ' 段，这里只显示前 8 条。';
    }

    /* ---------------- 预设与控件 ---------------- */

    function renderPresets() {
        var host = $('#ssPresets');
        if (!host) return;
        (DATA.queries || []).forEach(function (q, i) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'ss-chip';
            b.dataset.q = q.q;
            b.setAttribute('aria-pressed', 'false');
            b.textContent = q.q;
            if (i >= 6) b.hidden = true;
            b.addEventListener('click', function () { runPreset(q); });
            host.appendChild(b);
        });
    }

    function setMode(mode, quiet) {
        state.mode = mode;
        $$('[data-mode]').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
        });
        if (quiet) return;
        var input = $('#ssInput').value.trim();
        if (!input) return;
        if (mode === 'vector') {
            var preset = (DATA.queries || []).filter(function (q) { return q.q === input; })[0];
            if (preset) runPreset(preset);
            else { showNotice('这句没有预计算的问题向量，已改用 BM25。'); runFree(input); }
        } else {
            runFree(input);
        }
    }

    function showNotice(text) {
        var n = $('#ssNotice');
        if (!n) return;
        n.textContent = text;
        n.hidden = false;
    }

    function hideNotice() {
        var n = $('#ssNotice');
        if (n) n.hidden = true;
    }

    function syncStatus() {
        var el = $('#ssStatus');
        if (!el || !engine) return;
        var exploded = engine.state.explodeTarget > 0.5;
        el.classList.remove('is-hit', 'is-sel');

        if (state.selectedChunk != null) {
            var c = CHUNK_BY_ID[state.selectedChunk];
            if (c) {
                var hit = state.hitMap[state.selectedChunk];
                el.classList.add('is-sel');
                var title = (c.t || '无标题').slice(0, 16);
                el.innerHTML = '片段 <b>#' + (c.i + 1) + '</b> · <b>' + title + '</b>' +
                    (hit ? ' · 相似度 <b>' + hit.score.toFixed(3) + '</b>' : ' · 来自部件清单');
            }
            return;
        }
        if (state.selectedPart) {
            el.classList.add('is-sel');
            var isPlate = !!CAT_LABEL[state.selectedPart];
            var name = isPlate ? CAT_LABEL[state.selectedPart] : (PART_META[state.selectedPart] || {}).name;
            if (isPlate) {
                var items = CHUNKS.filter(function (x) { return x.c === state.selectedPart; });
                var hits = state.hits.filter(function (h) {
                    var x = CHUNK_BY_ID[h.i];
                    return x && x.c === state.selectedPart;
                });
                el.innerHTML = '选中：<b>' + name + '</b> · <b>' + items.length +
                    '</b> 段 · 本次命中 <b>' + hits.length + '</b> 段';
            } else {
                el.innerHTML = '选中：<b>' + name + '</b> · 书架部件（不挂内容）';
            }
            return;
        }
        if (state.hits.length) {
            el.classList.add('is-hit');
            var cats = {};
            state.hits.forEach(function (h) {
                var x = CHUNK_BY_ID[h.i];
                if (x) cats[x.c] = 1;
            });
            var k = Object.keys(cats).length;
            el.innerHTML = '命中 <b>' + state.hits.length + '</b> 段 · 分布在 <b>' + k +
                '</b> 本书 · 点亮处看详情';
            return;
        }
        el.textContent = exploded
            ? '已散开 · 点击书本看详情，或下面提问看谁亮'
            : '点击任意一本书翻开看内容';
    }

    function maybeShowGuide() {
        var g = $('#ssGuide');
        if (!g) return;
        try { if (localStorage.getItem('ss-guide-seen')) return; } catch (e) { return; }
        g.hidden = false;
    }

    function dismissGuide() {
        var g = $('#ssGuide');
        if (!g || g.hidden) return;
        g.hidden = true;
        try { localStorage.setItem('ss-guide-seen', '1'); } catch (e) {}
    }

    function bindUI() {
        var form = $('#ssForm');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var text = $('#ssInput').value.trim();
                if (!text) return;
                var preset = (DATA.queries || []).filter(function (q) { return q.q === text; })[0];
                if (preset && state.mode === 'vector') runPreset(preset);
                else runFree(text);
            });
        }

        $$('[data-mode]').forEach(function (b) {
            b.addEventListener('click', function () { setMode(b.dataset.mode); });
        });

        var more = $('#ssMore');
        if (more) {
            more.addEventListener('click', function () {
                var open = more.getAttribute('aria-expanded') === 'true';
                more.setAttribute('aria-expanded', String(!open));
                more.textContent = open ? '看另外 6 个问题' : '收起问题';
                $('#ssPresets').classList.toggle('is-open', !open);
                $$('.ss-chip').forEach(function (c, i) {
                    if (i >= 6) c.hidden = open;
                });
            });
        }

        var budget = $('#ssBudget');
        if (budget) {
            budget.addEventListener('input', function () {
                state.budget = Number(budget.value);
                $('#ssBudgetOut').textContent = state.budget + ' tokens';
                renderWindow();
            });
        }

        var guideOk = $('#ssGuideOk');
        if (guideOk) {
            guideOk.addEventListener('click', dismissGuide);
        }
        var stageEl = $('#ssStage');
        if (stageEl) {
            stageEl.addEventListener('pointerdown', dismissGuide, { once: true });
        }

        var detailClose = $('#ssDetailClose');
        if (detailClose) {
            detailClose.addEventListener('click', function () {
                showResults();
                if (engine) engine.deselect();
            });
        }

        var partClose = $('#ssPartClose');
        if (partClose) {
            partClose.addEventListener('click', function () {
                showResults();
                if (engine) engine.deselect();
            });
        }

        bindDock();
    }

    function bindDock() {
        var explode = $('#ssExplode');
        var tour = $('#ssTour');
        var labels = $('#ssLabels');
        var spin = $('#ssSpin');
        var reset = $('#ssReset');

        function syncExplode() {
            var on = engine ? engine.state.explodeTarget > 0.5 : false;
            explode.setAttribute('aria-pressed', String(on));
            $('#ssExplodeTxt').textContent = on ? '合上书架' : '翻开书架';
        }

        if (explode) {
            explode.addEventListener('click', function () {
                if (!engine) return;
                engine.toggleExplode();
                window.setTimeout(syncExplode, 40);
                if (engine.state.explodeTarget === 0) showResults();
                syncStatus();
            });
        }

        if (tour) {
            tour.addEventListener('click', function () {
                if (!engine) return;
                engine.tour();
                syncExplode();
            });
        }

        if (labels) {
            labels.addEventListener('click', function () {
                if (!engine) return;
                var on = labels.getAttribute('aria-pressed') !== 'true';
                labels.setAttribute('aria-pressed', String(on));
                engine.setLabels(on);
            });
        }

        if (spin) {
            spin.addEventListener('click', function () {
                if (!engine) return;
                var on = spin.getAttribute('aria-pressed') !== 'true';
                spin.setAttribute('aria-pressed', String(on));
                engine.setSpin(on);
            });
        }

        if (reset) {
            reset.addEventListener('click', function () {
                if (!engine) return;
                engine.reset();
                syncExplode();
                showResults();
                syncStatus();
                labels.setAttribute('aria-pressed', 'true');
                spin.setAttribute('aria-pressed', 'false');
                hideNotice();
            });
        }

        window.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && engine) {
                window.setTimeout(syncExplode, 60);
            }
        });

        syncExplode();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
