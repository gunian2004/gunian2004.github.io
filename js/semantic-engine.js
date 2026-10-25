/* ============================================================
   语义空间 · 内容引擎 / semantic-engine.js
   一台可拆解的拟物装置：基座 → 导柱 → 7 块内容层板 → 索引环 → 顶盖
   依赖：window.THREE（本地 r149 UMD，不用 addons）
   约束：file:// 直开、无外部模型 / 贴图，几何与材质全部程序化生成
   ============================================================ */
(function (global) {
    'use strict';

    var THREE = global.THREE;
    if (!THREE) {
        console.error('[SSEngine] THREE 未加载');
        return;
    }

    // r149 默认 legacy 色彩管理：关掉它，主题色才不会被 sRGB 输出洗成粉彩
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;

    var D2R = Math.PI / 180;
    var PLATE_GAP = 0.045;
    var EXPLODE_STEP = 0.22;

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
    function lerp(a, b, t) { return a + (b - a) * t; }

    /* ---------------- 几何工具 ---------------- */

    function roundedRectShape(w, d, r) {
        var s = new THREE.Shape();
        var x = -w / 2, y = -d / 2;
        r = Math.min(r, w / 2 - 0.001, d / 2 - 0.001);
        s.moveTo(x + r, y);
        s.lineTo(x + w - r, y);
        s.quadraticCurveTo(x + w, y, x + w, y + r);
        s.lineTo(x + w, y + d - r);
        s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
        s.lineTo(x + r, y + d);
        s.quadraticCurveTo(x, y + d, x, y + d - r);
        s.lineTo(x, y + r);
        s.quadraticCurveTo(x, y, x + r, y);
        return s;
    }

    function slab(w, d, h, r, bevel) {
        var bev = bevel === undefined ? 0.008 : bevel;
        var geo = new THREE.ExtrudeGeometry(roundedRectShape(w, d, r), {
            depth: Math.max(0.001, h - bev * 2),
            bevelEnabled: bev > 0,
            bevelThickness: bev,
            bevelSize: bev * 0.9,
            bevelSegments: 2,
            curveSegments: 10
        });
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, -(h - bev * 2) / 2, 0);
        geo.computeVertexNormals();
        return geo;
    }

    function ngonShape(r, sides) {
        var s = new THREE.Shape();
        for (var i = 0; i <= sides; i++) {
            var a = (i / sides) * Math.PI * 2;
            var x = Math.cos(a) * r, y = Math.sin(a) * r;
            if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
        }
        return s;
    }

    /* ---------------- 程序化环境贴图 ---------------- */

    function envTexture() {
        var c = document.createElement('canvas');
        c.width = 512; c.height = 256;
        var g = c.getContext('2d');

        var grd = g.createLinearGradient(0, 0, 0, 256);
        grd.addColorStop(0.00, '#f6f8fb');
        grd.addColorStop(0.26, '#cdd6e2');
        grd.addColorStop(0.48, '#8b97a7');
        grd.addColorStop(0.66, '#4b5563');
        grd.addColorStop(1.00, '#0e131a');
        g.fillStyle = grd;
        g.fillRect(0, 0, 512, 256);

        // 两处柔光灯箱，给金属一条像样的高光
        [[150, 74, 120], [386, 96, 90]].forEach(function (b) {
            var hot = g.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
            hot.addColorStop(0, 'rgba(255,255,255,.95)');
            hot.addColorStop(0.45, 'rgba(255,255,255,.35)');
            hot.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = hot;
            g.fillRect(b[0] - b[2], b[1] - b[2], b[2] * 2, b[2] * 2);
        });

        var tex = new THREE.CanvasTexture(c);
        tex.mapping = THREE.EquirectangularReflectionMapping;
        tex.encoding = THREE.sRGBEncoding;
        return tex;
    }

    function radialTexture() {
        var c = document.createElement('canvas');
        c.width = c.height = 128;
        var g = c.getContext('2d');
        var grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grd.addColorStop(0.00, 'rgba(255,255,255,1)');
        grd.addColorStop(0.35, 'rgba(255,255,255,.55)');
        grd.addColorStop(1.00, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
    }

    function shadowTexture() {
        var c = document.createElement('canvas');
        c.width = c.height = 256;
        var g = c.getContext('2d');
        var grd = g.createRadialGradient(128, 128, 10, 128, 128, 126);
        grd.addColorStop(0.00, 'rgba(23,36,51,.42)');
        grd.addColorStop(0.45, 'rgba(23,36,51,.18)');
        grd.addColorStop(1.00, 'rgba(23,36,51,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 256, 256);
        return new THREE.CanvasTexture(c);
    }

    /* ---------------- 晶格布局 ---------------- */

    // 把某主题的片段按 SVD 前两维投到板面，再做最小间距松弛
    function layoutCells(members, w, d) {
        var pad = 0.085;
        var hw = Math.max(0.05, w / 2 - pad);
        var hd = Math.max(0.05, d / 2 - pad);

        var pts = members.map(function (c) {
            return { i: c.i, c: c, ux: c.p ? c.p[0] : 0, uz: c.p ? c.p[2] : 0, x: 0, z: 0 };
        });

        var minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        pts.forEach(function (p) {
            if (p.ux < minX) minX = p.ux;
            if (p.ux > maxX) maxX = p.ux;
            if (p.uz < minZ) minZ = p.uz;
            if (p.uz > maxZ) maxZ = p.uz;
        });
        var spanX = Math.max(1e-4, maxX - minX);
        var spanZ = Math.max(1e-4, maxZ - minZ);

        pts.forEach(function (p) {
            var nx = (p.ux - minX) / spanX * 2 - 1;
            var nz = (p.uz - minZ) / spanZ * 2 - 1;
            p.x = clamp(nx * hw * 0.86, -hw, hw);
            p.z = clamp(-nz * hd * 0.86, -hd, hd);
        });

        // 松弛：把过近的点推开，避免晶格叠在一起
        var minDist = 0.096;
        var iters = pts.length > 1 ? 60 : 0;
        for (var k = 0; k < iters; k++) {
            for (var a = 0; a < pts.length; a++) {
                for (var b = a + 1; b < pts.length; b++) {
                    var dx = pts[b].x - pts[a].x;
                    var dz = pts[b].z - pts[a].z;
                    var dist = Math.sqrt(dx * dx + dz * dz) || 1e-4;
                    if (dist < minDist) {
                        var push = (minDist - dist) * 0.5;
                        var ux = dx / dist, uz = dz / dist;
                        pts[a].x -= ux * push; pts[a].z -= uz * push;
                        pts[b].x += ux * push; pts[b].z += uz * push;
                    }
                }
            }
            pts.forEach(function (p) {
                p.x = clamp(p.x, -hw, hw);
                p.z = clamp(p.z, -hd, hd);
            });
        }

        // 单个 / 双个片段时不要挤在角落
        if (pts.length === 1) { pts[0].x = 0; pts[0].z = 0; }
        if (pts.length === 2) {
            pts[0].z = -hd * 0.45; pts[1].z = hd * 0.45;
            pts[0].x = pts[1].x = 0;
        }
        return pts;
    }

    /* ============================================================
       引擎
       ============================================================ */

    function create(opts) {
        var canvas = opts.canvas;
        var stage = opts.stage;
        var labelLayer = opts.labelLayer;
        var data = opts.data || {};
        var colors = opts.colors || {};
        var labelsCN = opts.labels || {};

        var onSelectPart = opts.onSelectPart || function () {};
        var onSelectChunk = opts.onSelectChunk || function () {};
        var onHoverPart = opts.onHoverPart || function () {};
        var onReady = opts.onReady || function () {};

        var reduceMotion = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* ---------- 渲染器 / 场景 ---------- */

        var renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvas, antialias: true, alpha: true,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            console.error('[SSEngine] WebGL 初始化失败', e);
            return null;
        }

        renderer.setClearAlpha(0);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.02;

        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
        camera.position.set(3.4, 2.8, 4.2);

        var pmrem = new THREE.PMREMGenerator(renderer);
        var envTex = envTexture();
        var envRT = pmrem.fromEquirectangular(envTex);
        scene.environment = envRT.texture;
        envTex.dispose();
        pmrem.dispose();

        scene.add(new THREE.HemisphereLight(0xffffff, 0x4b5563, 0.32));

        var keyLight = new THREE.DirectionalLight(0xffffff, 1.55);
        keyLight.position.set(4.2, 6.4, 4.8);
        scene.add(keyLight);

        var fillLight = new THREE.DirectionalLight(0xdfe9f6, 0.55);
        fillLight.position.set(-4.6, 2.6, 2.2);
        scene.add(fillLight);

        var rimLight = new THREE.DirectionalLight(0xffffff, 1.25);
        rimLight.position.set(-1.4, 3.0, -5.2);
        scene.add(rimLight);

        var root = new THREE.Group();
        scene.add(root);

        /* ---------- 材质 ---------- */

        var glowTex = radialTexture();

        function metal(color, rough, metalness) {
            var m = new THREE.MeshStandardMaterial({
                color: color,
                metalness: metalness === undefined ? 0.82 : metalness,
                roughness: rough === undefined ? 0.38 : rough,
                envMapIntensity: 0.62
            });
            return m;
        }

        /* ---------- 数据分组 ---------- */

        var cats = (data.categories || []).slice();
        var chunks = data.chunks || [];

        var groups = cats.map(function (cat) {
            var members = chunks.filter(function (c) { return c.c === cat.key; });
            var chars = members.reduce(function (s, c) { return s + (c.x || '').length; }, 0);
            return {
                key: cat.key,
                name: cat.label,
                color: colors[cat.key] || '#315ce8',
                members: members,
                count: members.length,
                chars: chars,
                avg: members.length ? Math.round(chars / members.length) : 0
            };
        }).filter(function (g) { return g.count > 0; });

        groups.sort(function (a, b) { return b.count - a.count; });

        var MAXN = Math.max.apply(null, groups.map(function (g) { return g.count; })) || 1;

        /* ---------- 部件注册 ---------- */

        var parts = [];
        var partsGroup = new THREE.Group();
        root.add(partsGroup);

        function registerPart(def) {
            var g = new THREE.Group();
            g.name = def.key;
            g.add(def.inner);
            partsGroup.add(g);
            var p = {
                key: def.key,
                index: parts.length,
                group: g,
                inner: def.inner,
                basePos: def.pos.clone(),
                dir: def.dir.clone(),
                rotZ: def.rotZ || 0,
                color: def.color || '#315ce8',
                mats: def.mats || [],
                outline: null,
                glow: null,
                lift: 0,
                liftTarget: 0,
                hit: 0,
                stretch: def.stretch || 0,
                radial: def.radial || 0,
                anchor: def.anchor || new THREE.Object3D()
            };
            if (def.anchor) g.add(def.anchor);
            parts.push(p);
            return p;
        }

        function collectMats(obj, out) {
            obj.traverse(function (o) {
                if (!o.isMesh) return;
                var list = Array.isArray(o.material) ? o.material : [o.material];
                list.forEach(function (m) {
                    if (!m || !m.isMeshStandardMaterial) return;
                    if (out.indexOf(m) < 0) out.push({ m: m, opacity: m.opacity, transparent: m.transparent });
                });
            });
            return out;
        }

        /* ---------- 书架 ---------- */

        var SHELF_W = 2.5, SHELF_D = 0.62, SHELF_H = 0.14;
        var BOOK_H = 1.18, BOOK_DEPTH = 0.6, BOOK_GAP = 0.006;

        (function buildShelf() {
            var inner = new THREE.Group();
            // 底板
            var body = new THREE.Mesh(slab(SHELF_W, SHELF_D, SHELF_H, 0.06, 0.008), metal(0x10161e, 0.42, 0.85));
            inner.add(body);
            // 两侧细立柱
            [-1, 1].forEach(function (sgn) {
                var side = new THREE.Mesh(slab(0.05, SHELF_D, 1.22, 0.02, 0.003), metal(0x161d27, 0.5, 0.7));
                side.position.set(sgn * (SHELF_W / 2 - 0.025), SHELF_H / 2 + 0.61, 0);
                inner.add(side);
            });
            // 前缘铭牌
            var plate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.008), metal(0x8c97a8, 0.28, 1.0));
            plate.position.set(0, 0.01, SHELF_D / 2 + 0.002);
            inner.add(plate);

            var mats = collectMats(inner, []);
            var anchor = new THREE.Object3D();
            anchor.position.set(SHELF_W * 0.42, 0.04, SHELF_D * 0.42);
            registerPart({
                key: 'shelf', inner: inner,
                pos: new THREE.Vector3(0, 0, 0),
                dir: new THREE.Vector3(0, 0, 0),
                mats: mats, anchor: anchor, color: '#5b6678'
            });
        })();

        /* ---------- 7 本书（书脊朝观众，高低不齐） ---------- */

        var cells = [];
        var CELL_GEO = new THREE.BoxGeometry(0.014, 0.022, 0.006);

        (function buildBooks() {
            var widths = groups.map(function (g) {
                return 0.17 + 0.22 * Math.sqrt(g.count / MAXN);
            });
            var heights = groups.map(function (g) {
                return 0.96 + 0.24 * Math.sqrt(g.count / MAXN);
            });
            var totalW = widths.reduce(function (a, b) { return a + b; }, 0) + (groups.length - 1) * 0.004;
            var cursor = -totalW / 2;

            groups.forEach(function (g, i) {
                var w = widths[i];
                var h = heights[i];
                var inner = new THREE.Group();
                var x = cursor + w / 2;
                cursor += w + 0.004;

                // 书体（封面，深色，在书脊后面）
                var cover = new THREE.Mesh(slab(w, BOOK_DEPTH, h, 0.012, 0.003), metal(0x0d1219, 0.62, 0.5));
                inner.add(cover);

                // 书脊（朝观众 +Z）—— 整块亮主题色，是主视觉
                var spineMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(g.color),
                    emissive: new THREE.Color(g.color), emissiveIntensity: 0.42,
                    metalness: 0.25, roughness: 0.5
                });
                var spine = new THREE.Mesh(slab(w, 0.03, h, 0.006, 0.002), spineMat);
                spine.position.set(0, 0, BOOK_DEPTH / 2 + 0.015);
                inner.add(spine);

                // 书脊中央竖向亮带（像书脊烫印）
                var accentMat = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(g.color), emissive: new THREE.Color(g.color),
                    emissiveIntensity: 0.95, roughness: 0.35
                });
                var accent = new THREE.Mesh(new THREE.BoxGeometry(w * 0.22, h * 0.62, 0.006), accentMat);
                accent.position.set(0, 0, BOOK_DEPTH / 2 + 0.034);
                inner.add(accent);

                // 书脊顶/底压边（深色，像书脊护套）
                [h / 2 - 0.018, -h / 2 + 0.018].forEach(function (yy) {
                    var edge = new THREE.Mesh(new THREE.BoxGeometry(w, 0.018, 0.034), metal(0x080c12, 0.4, 0.6));
                    edge.position.set(0, yy, BOOK_DEPTH / 2 + 0.017);
                    inner.add(edge);
                });

                // 书页切口（左右侧边，浅色，拆解散开时可见）
                var edgeMat = new THREE.MeshStandardMaterial({ color: 0xe7e0d2, metalness: 0.1, roughness: 0.85 });
                [-1, 1].forEach(function (sgn) {
                    var edge = new THREE.Mesh(new THREE.BoxGeometry(0.004, h * 0.92, BOOK_DEPTH * 0.94), edgeMat);
                    edge.position.set(sgn * (w / 2), 0, 0);
                    inner.add(edge);
                });

                // 顶面书页切口
                var topEdge = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.004, BOOK_DEPTH * 0.94), edgeMat);
                topEdge.position.set(0, h / 2 + 0.001, 0);
                inner.add(topEdge);

                // 书页（-Z 背面）
                var pages = new THREE.Mesh(
                    new THREE.PlaneGeometry(w * 0.94, h * 0.92),
                    new THREE.MeshStandardMaterial({ color: 0xe7e0d2, metalness: 0.1, roughness: 0.88, side: THREE.DoubleSide })
                );
                pages.position.set(0, 0, -BOOK_DEPTH / 2 - 0.001);
                inner.add(pages);
                for (var li = 0; li < 8; li++) {
                    var ln = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.82, 0.003),
                        new THREE.MeshBasicMaterial({ color: 0xb8ad97 }));
                    ln.position.set(0, -h * 0.4 + li * 0.1, -BOOK_DEPTH / 2 - 0.003);
                    inner.add(ln);
                }

                // 书脊索引灯条（竖向，一道=一个片段）
                var n = g.count;
                var cellMats = [];
                var span = h * 0.56;
                var yTop = h * 0.28;
                var yBot = yTop - span;
                for (var ci = 0; ci < n; ci++) {
                    var m = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(g.color),
                        emissive: new THREE.Color(g.color), emissiveIntensity: 0.3,
                        metalness: 0.3, roughness: 0.5
                    });
                    var mesh = new THREE.Mesh(CELL_GEO, m);
                    var yy = n === 1 ? 0 : (yBot + (ci + 0.5) / n * span);
                    mesh.position.set(0, yy, BOOK_DEPTH / 2 + 0.04);
                    mesh.userData.chunkIndex = g.members[ci].i;
                    mesh.userData.partKey = g.key;
                    inner.add(mesh);
                    cellMats.push({ mesh: mesh, mat: m, baseColor: m.color.clone(), chunk: g.members[ci] });
                }

                inner.traverse(function (o) { if (o.isMesh) o.userData.partKey = g.key; });

                var mats = collectMats(inner, []);
                var anchor = new THREE.Object3D();
                anchor.position.set(w / 2 + 0.02, h / 2 + 0.04, BOOK_DEPTH / 2 + 0.2);

                var part = registerPart({
                    key: g.key, inner: inner,
                    pos: new THREE.Vector3(x, SHELF_H / 2 + h / 2, 0),
                    dir: new THREE.Vector3(
                        (i - (groups.length - 1) / 2) * 0.22,
                        0.04 + i * 0.01,
                        (i % 2 ? 1 : -1) * 0.14
                    ),
                    rotZ: (i % 2 ? 1 : -1) * 0.016,
                    mats: mats, anchor: anchor, color: g.color
                });
                part.book = { w: w, h: h, depth: BOOK_DEPTH };
                part.strip = { mats: [spineMat, accentMat], base: 0.42 };
                part.cells = cellMats;
                part.stat = { count: g.count, chars: g.chars, avg: g.avg };
                part.name = g.name;

                cellMats.forEach(function (o) {
                    cells.push(o);
                    o.mat.userData = { part: part };
                });
            });

            var stackTop = SHELF_H / 2 + 1.2 + 0.04;

            /* ---------- 顶横梁 ---------- */

            var railGroup = new THREE.Group();
            var rail = new THREE.Mesh(slab(SHELF_W, SHELF_D, 0.1, 0.06, 0.006), metal(0x10161e, 0.42, 0.85));
            railGroup.add(rail);

            var tickCount = chunks.length || 78;
            var tickGeo = new THREE.BoxGeometry(0.005, 0.004, 0.04);
            var tickMat = metal(0x78849a, 0.4, 0.9);
            var ticks = new THREE.InstancedMesh(tickGeo, tickMat, tickCount);
            var dummy = new THREE.Object3D();
            for (var ti = 0; ti < tickCount; ti++) {
                var tx = -SHELF_W * 0.46 + (ti + 0.5) / tickCount * SHELF_W * 0.92;
                dummy.position.set(tx, 0.052, SHELF_D / 2 + 0.002);
                dummy.updateMatrix();
                ticks.setMatrixAt(ti, dummy.matrix);
            }
            ticks.instanceMatrix.needsUpdate = true;
            ticks.userData.partKey = 'rail';
            railGroup.add(ticks);

            railGroup.traverse(function (o) { if (o.isMesh) o.userData.partKey = 'rail'; });

            var railMats = [];
            railGroup.traverse(function (o) {
                if (!o.isMesh || !o.material.isMeshStandardMaterial) return;
                railMats.push({ m: o.material, opacity: 1, transparent: false });
            });

            var railAnchor = new THREE.Object3D();
            railAnchor.position.set(SHELF_W * 0.42, 0.05, 0);

            registerPart({
                key: 'rail', inner: railGroup,
                pos: new THREE.Vector3(0, stackTop, 0),
                dir: new THREE.Vector3(0, 0.22, 0),
                mats: railMats, anchor: railAnchor, color: '#3f7f9a'
            });

            // 装配总高，供取景用
            root.userData.topY = stackTop + 0.1;
        })();

        /* ---------- 接触阴影 ---------- */

        var shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(5.4, 4.2),
            new THREE.MeshBasicMaterial({
                map: shadowTexture(), transparent: true, opacity: 1,
                depthWrite: false
            })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -SHELF_H / 2 - 0.048;
        shadow.renderOrder = -1;
        root.add(shadow);

        /* ---------- 包围球（装配 / 拆解） ---------- */

        var bounds = parts.map(function (p) {
            var box = new THREE.Box3().setFromObject(p.inner);
            if (box.isEmpty()) box.setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(0.4, 0.1, 0.4));
            var size = box.getSize(new THREE.Vector3());
            var centerLocal = box.getCenter(new THREE.Vector3());
            return { part: p, size: size, centerLocal: centerLocal };
        });

        function boundsBoxAt(e) {
            var box = new THREE.Box3();
            bounds.forEach(function (b) {
                var p = b.part;
                var sz = b.size.clone();
                var cl = b.centerLocal.clone();
                if (p.stretch) {
                    sz.y *= (1 + e * p.stretch);
                    cl.y *= (1 + e * p.stretch);
                }
                if (p.radial) {
                    sz.x *= (1 + e * p.radial);
                    sz.z *= (1 + e * p.radial);
                }
                var c = new THREE.Vector3(
                    p.basePos.x + p.dir.x * e + cl.x,
                    p.basePos.y + p.dir.y * e + cl.y,
                    p.basePos.z + p.dir.z * e + cl.z
                );
                box.expandByPoint(new THREE.Vector3(c.x - sz.x / 2, c.y - sz.y / 2, c.z - sz.z / 2));
                box.expandByPoint(new THREE.Vector3(c.x + sz.x / 2, c.y + sz.y / 2, c.z + sz.z / 2));
            });
            return box;
        }

        var box0 = boundsBoxAt(0);
        var box1 = boundsBoxAt(1);

        /* ---------- 选中描边 ---------- */

        function buildOutline(p) {
            if (p.outline) return p.outline;
            var group = new THREE.Group();
            var mat = new THREE.LineBasicMaterial({
                color: new THREE.Color(p.color),
                transparent: true, opacity: 0.92, depthWrite: false
            });
            p.inner.traverse(function (o) {
                if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                if (o.geometry.attributes.position.count > 5000) return;
                var eg;
                try { eg = new THREE.EdgesGeometry(o.geometry, 32); } catch (err) { return; }
                if (!eg.attributes.position || eg.attributes.position.count < 2) { eg.dispose(); return; }
                var ls = new THREE.LineSegments(eg, mat);
                ls.position.copy(o.position);
                ls.quaternion.copy(o.quaternion);
                ls.scale.copy(o.scale);
                ls.renderOrder = 6;
                group.add(ls);
            });
            group.visible = false;
            p.inner.add(group);
            p.outline = group;
            return group;
        }

        function buildGlow(p) {
            if (p.glow) return p.glow;
            var mat = new THREE.SpriteMaterial({
                map: glowTex,
                color: new THREE.Color(p.color),
                transparent: true,
                opacity: 0.0,
                depthWrite: false,
                depthTest: false
            });
            var sp = new THREE.Sprite(mat);
            var b = bounds.filter(function (x) { return x.part === p; })[0];
            var size = b ? b.size : new THREE.Vector3(1, 1, 1);
            var scale = Math.max(size.x, size.z, size.y) * 1.9;
            sp.scale.set(scale, scale, 1);
            sp.position.copy(b ? b.centerLocal : new THREE.Vector3());
            sp.renderOrder = 4;
            p.inner.add(sp);
            p.glow = sp;
            return sp;
        }

        /* ---------- 状态 ---------- */

        var S = {
            explode: 0,
            explodeTarget: 0,
            selected: null,
            selectedChunk: null,
            hovered: null,
            labels: true,
            spin: false,
            tour: null,
            zoom: 1,
            panY: 0,
            panX: 0,
            dirty: true,
            running: true,
            idleTime: 0
        };

        var cam = {
            theta: -0.18,
            phi: 1.46,
            radius: 4.9,
            targetTheta: -0.18,
            targetPhi: 1.46
        };

        var MIN_PHI = 0.30, MAX_PHI = Math.PI - 0.34;
        var ZOOM_MIN = 0.55, ZOOM_MAX = 1.85;

        /* ---------- 相机 ---------- */

        function currentBox(e) {
            var t = clamp(e === undefined ? S.explode : e, 0, 1);
            var min = box0.min.clone().lerp(box1.min, t);
            var max = box0.max.clone().lerp(box1.max, t);
            return new THREE.Box3(min, max);
        }

        var _fitCamTarget = new THREE.Vector3();
        var _fitCorner = new THREE.Vector3();

        function fitsAt(box, pos, target) {
            camera.position.copy(pos);
            camera.lookAt(target);
            camera.updateMatrixWorld(true);
            // r149 的 Camera.updateMatrixWorld 不保证刷新逆矩阵，手工同步，
            // 否则 project() 会用上一帧的相机做判断，自动取景会算飞
            camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
            for (var i = 0; i < 8; i++) {
                _fitCorner.set(
                    i & 1 ? box.max.x : box.min.x,
                    i & 2 ? box.max.y : box.min.y,
                    i & 4 ? box.max.z : box.min.z
                );
                _fitCorner.project(camera);
                if (Math.abs(_fitCorner.x) > 0.66 || Math.abs(_fitCorner.y) > 0.88) return false;
            }
            return true;
        }

        function frameDistance() {
            var box = currentBox();
            var target = currentTarget();
            var dir = new THREE.Vector3(
                Math.sin(cam.phi) * Math.sin(cam.theta),
                Math.cos(cam.phi),
                Math.sin(cam.phi) * Math.cos(cam.theta)
            );
            var lo = 1.2, hi = 48;
            for (var i = 0; i < 22; i++) {
                var mid = (lo + hi) / 2;
                if (fitsAt(box, target.clone().addScaledVector(dir, mid), target)) hi = mid;
                else lo = mid;
            }
            return hi;
        }

        function currentTarget() {
            var box = currentBox();
            var c = box.getCenter(new THREE.Vector3());
            return new THREE.Vector3(0, c.y, 0);
        }

        function updateCamera() {
            var t = currentTarget();
            var want = frameDistance() * S.zoom;
            cam.radius = cam.radius ? cam.radius + (want - cam.radius) * 0.18 : want;
            var dist = cam.radius;
            var look = new THREE.Vector3(t.x + S.panX, t.y + S.panY, t.z);
            var sinPhi = Math.sin(cam.phi);
            camera.position.set(
                look.x + dist * sinPhi * Math.sin(cam.theta),
                look.y + dist * Math.cos(cam.phi),
                look.z + dist * sinPhi * Math.cos(cam.theta)
            );
            camera.lookAt(look);
        }

        /* ---------- 交互：拖拽 / 缩放 / 平移 ---------- */

        var ptr = { down: false, x: 0, y: 0, btn: 0, moved: 0, id: null };
        var touches = [];

        function onDown(e) {
            if (e.target.closest && e.target.closest('.se-ui, .ss-label')) return;
            ptr.down = true;
            ptr.x = e.clientX; ptr.y = e.clientY;
            ptr.btn = e.button;
            ptr.moved = 0;
            ptr.id = e.pointerId;
            stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
            stopTour();
            wake();
        }

        function onMove(e) {
            if (ptr.down && e.pointerId === ptr.id) {
                var dx = e.clientX - ptr.x;
                var dy = e.clientY - ptr.y;
                ptr.moved += Math.abs(dx) + Math.abs(dy);

                if (ptr.btn === 2 || e.shiftKey) {
                    S.panX -= dx * 0.004 * (cam.radius / 5);
                    S.panY += dy * 0.004 * (cam.radius / 5);
                } else {
                    cam.targetTheta -= dx * 0.0072;
                    cam.targetPhi = clamp(cam.targetPhi - dy * 0.0062, MIN_PHI, MAX_PHI);
                }
                ptr.x = e.clientX; ptr.y = e.clientY;
                wake();
            } else {
                updateHover(e);
            }
        }

        function onUp(e) {
            if (!ptr.down) return;
            ptr.down = false;
            if (ptr.moved < 6) handleClick(e);
            ptr.id = null;
        }

        function onWheel(e) {
            e.preventDefault();
            stopTour();
            var k = e.deltaY > 0 ? 1.08 : 0.926;
            S.zoom = clamp(S.zoom * k, ZOOM_MIN, ZOOM_MAX);
            wake();
        }

        stage.addEventListener('pointerdown', onDown);
        global.addEventListener('pointermove', onMove);
        global.addEventListener('pointerup', onUp);
        stage.addEventListener('wheel', onWheel, { passive: false });
        stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        /* ---------- 拾取 ---------- */

        var raycaster = new THREE.Raycaster();
        var ndc = new THREE.Vector2();

        function pickAt(cx, cy) {
            var rect = canvas.getBoundingClientRect();
            ndc.x = ((cx - rect.left) / rect.width) * 2 - 1;
            ndc.y = -((cy - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(ndc, camera);
            var hits = raycaster.intersectObjects(partsGroup.children, true);
            for (var i = 0; i < hits.length; i++) {
                var ud = hits[i].object.userData || {};
                if (ud.chunkIndex !== undefined) {
                    return { type: 'cell', chunk: ud.chunkIndex, part: ud.partKey };
                }
                if (ud.partKey) return { type: 'part', part: ud.partKey };
            }
            return null;
        }

        function updateHover(e) {
            if (ptr.down) return;
            var hit = pickAt(e.clientX, e.clientY);
            var key = hit ? hit.part : null;
            canvas.style.cursor = hit ? 'pointer' : 'grab';
            if (key !== S.hovered) {
                S.hovered = key;
                onHoverPart(key);
                wake();
            }
        }

        function handleClick(e) {
            var hit = pickAt(e.clientX, e.clientY);
            if (!hit) { deselect(); return; }
            if (hit.type === 'cell') {
                selectPart(hit.part, true);
                selectChunk(hit.chunk);
            } else {
                selectPart(hit.part);
            }
        }

        /* ---------- 选中 ---------- */

        function setPartsDim(exceptKey) {
            var dim = exceptKey ? 0.13 : 1;
            parts.forEach(function (p) {
                var opacity = (p.key === exceptKey) ? 1 : dim;
                p.mats.forEach(function (rec) {
                    var m = rec.m;
                    if (opacity < 1) {
                        m.transparent = true;
                        m.opacity = opacity;
                        m.depthWrite = false;
                    } else {
                        m.opacity = rec.opacity;
                        m.transparent = rec.transparent;
                        m.depthWrite = true;
                    }
                });
                if (p.outline) p.outline.visible = false;
                if (p.glow) p.glow.material.opacity = 0;
            });

            if (!exceptKey) return;
            var sel = partByKey(exceptKey);
            if (!sel) return;
            var out = buildOutline(sel);
            out.visible = true;
            var glow = buildGlow(sel);
            glow.material.opacity = 0.46;
        }

        function partByKey(k) {
            for (var i = 0; i < parts.length; i++) if (parts[i].key === k) return parts[i];
            return null;
        }

        function selectPart(key, quiet) {
            if (key && S.selected === key) {
                if (!quiet) { /* 再点一次保持选中 */ }
            }
            S.selected = key;
            setPartsDim(key);
            if (key) {
                if (S.explodeTarget < 0.55) S.explodeTarget = 0.92;
                var p = partByKey(key);
                if (p) p.liftTarget = 0.03;
            }
            parts.forEach(function (p) {
                if (p.key !== key) p.liftTarget = 0;
            });
            if (!quiet) onSelectPart(key);
            wake();
        }

        function deselect() {
            S.selected = null;
            S.selectedChunk = null;
            parts.forEach(function (p) { p.liftTarget = 0; });
            setPartsDim(null);
            onSelectPart(null);
            wake();
        }

        function selectChunk(index) {
            S.selectedChunk = index;
            onSelectChunk(index);
            wake();
        }

        /* ---------- 检索 ---------- */

        function setHits(hits) {
            var map = {};
            var maxScore = 0;
            (hits || []).forEach(function (h) {
                map[h.i] = h.score;
                if (h.score > maxScore) maxScore = h.score;
            });

            var byPart = {};

            cells.forEach(function (c) {
                var idx = c.mesh.userData.chunkIndex;
                var score = map[idx];
                if (score === undefined) {
                    c.mat.emissiveIntensity = 0.16;
                    c.mat.color.copy(c.baseColor);
                } else {
                    var k = maxScore > 0 ? score / maxScore : 0;
                    c.mat.emissiveIntensity = 0.55 + k * 3.1;
                    c.mat.color.copy(c.baseColor).lerp(new THREE.Color(0xffffff), 0.18);
                    var pk = c.mesh.userData.partKey;
                    byPart[pk] = byPart[pk] || { n: 0, max: 0 };
                    byPart[pk].n++;
                    if (k > byPart[pk].max) byPart[pk].max = k;
                }
            });

            parts.forEach(function (p) {
                if (p.key === 'rail') return;
                var rec = byPart[p.key];
                p.hit = rec ? rec.max : 0;
                p.hitCount = rec ? rec.n : 0;
                if (p.strip) {
                    p.strip.mats.forEach(function (m) {
                        m.emissiveIntensity = 0.08 + (rec ? rec.max * 1.15 : 0);
                    });
                }
            });

            wake();
        }

        /* ---------- 拆解 ---------- */

        function setExplode(v) {
            S.explodeTarget = clamp(v, 0, 1);
            if (reduceMotion) S.explode = S.explodeTarget;
            wake();
        }

        function toggleExplode() {
            setExplode(S.explodeTarget > 0.5 ? 0 : 1);
            if (S.explodeTarget === 0) deselect();
        }

        function focusPart(key) {
            var p = partByKey(key);
            if (!p) return;
            selectPart(key);
            setExplode(0.92);
        }

        /* ---------- 自动巡览 ---------- */

        function tour() {
            stopTour();
            var order = parts.filter(function (p) {
                return p.book !== undefined;
            }).map(function (p) { return p.key; });
            if (!order.length) return;
            setExplode(1);
            var i = 0;
            S.tour = global.setInterval(function () {
                selectPart(order[i % order.length]);
                i++;
                if (i > order.length) { stopTour(); }
            }, 2400);
            selectPart(order[0]);
        }

        function stopTour() {
            if (S.tour) { global.clearInterval(S.tour); S.tour = null; }
        }

        /* ---------- 标注 ---------- */

        var labelEls = {};
        var labelSvg = labelLayer.querySelector ? labelLayer.querySelector('svg') : null;

        function svgRoot() {
            if (labelSvg) return labelSvg;
            labelSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            labelSvg.setAttribute('class', 'se-leaders');
            labelLayer.appendChild(labelSvg);
            return labelSvg;
        }

        function labelDescriptor(p) {
            var idx = String(p.index + 1).padStart(2, '0');
            if (p.book) {
                return {
                    idx: idx,
                    name: p.name,
                    meta: p.stat.count + ' 段 · ' + p.stat.chars + ' 字',
                    show: true
                };
            }
            var names = {
                shelf: ['书架', '2.5 × 0.86'],
                rail: ['顶横梁', chunks.length + ' 道刻度']
            };
            var n = names[p.key] || ['部件', ''];
            return { idx: idx, name: n[0], meta: n[1], show: S.explode > 0.55 };
        }

        function ensureLabel(p) {
            if (labelEls[p.key]) return labelEls[p.key];
            var el = document.createElement('button');
            el.type = 'button';
            el.className = 'se-label se-ui';
            el.style.setProperty('--acc', p.color);
            el.innerHTML = '<i class="se-label__idx"></i><b class="se-label__name"></b><em class="se-label__meta"></em>';
            el.addEventListener('click', function (ev) {
                ev.stopPropagation();
                selectPart(p.key);
            });
            labelLayer.appendChild(el);

            var line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            line.setAttribute('class', 'se-leader');
            line.style.stroke = p.color;
            svgRoot().appendChild(line);

            var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('r', '2.6');
            dot.setAttribute('class', 'se-leader-dot');
            dot.style.fill = p.color;
            svgRoot().appendChild(dot);

            labelEls[p.key] = { el: el, line: line, dot: dot };
            return labelEls[p.key];
        }

        var _v3 = new THREE.Vector3();

        function updateLabels() {
            var w = stage.clientWidth, h = stage.clientHeight;
            var list = [];

            parts.forEach(function (p) {
                var desc = labelDescriptor(p);
                var rec = ensureLabel(p);
                if (!S.labels || !desc.show) {
                    rec.el.style.display = 'none';
                    rec.line.style.display = 'none';
                    rec.dot.style.display = 'none';
                    return;
                }
                rec.el.style.display = '';
                rec.line.style.display = '';
                rec.dot.style.display = '';

                p.anchor.getWorldPosition(_v3);
                _v3.project(camera);
                var x = (_v3.x * 0.5 + 0.5) * w;
                var y = (-_v3.y * 0.5 + 0.5) * h;
                if (_v3.z > 1) {
                    rec.el.style.display = 'none';
                    rec.line.style.display = 'none';
                    rec.dot.style.display = 'none';
                    return;
                }
                list.push({ p: p, rec: rec, x: x, y: y, desc: desc });
            });

            // 左右分列，按 y 排序避让
            var sides = { left: [], right: [] };
            list.forEach(function (it) {
                sides[it.x > w / 2 ? 'right' : 'left'].push(it);
            });

            ['left', 'right'].forEach(function (side) {
                var arr = sides[side].sort(function (a, b) { return a.y - b.y; });
                var gap = 46;
                var minY = 74, maxY = h - 96;
                var cursor = minY;
                arr.forEach(function (it) {
                    var ly = clamp(Math.max(it.y - 14, cursor), minY, maxY);
                    it.ly = ly;
                    cursor = ly + gap;
                });
                // 超出下边界则整体上推
                var overflow = cursor - gap - maxY;
                if (overflow > 0) {
                    arr.forEach(function (it) { it.ly = clamp(it.ly - overflow, minY, maxY); });
                }
                arr.forEach(function (it) {
                    var cardW = 196;
                    var cardX = side === 'right' ? w - cardW - 16 : 16;
                    var edgeX = side === 'right' ? cardX : cardX + cardW;
                    it.rec.el.style.left = cardX + 'px';
                    it.rec.el.style.top = it.ly + 'px';
                    it.rec.el.style.width = cardW + 'px';
                    it.rec.el.querySelector('.se-label__idx').textContent = it.desc.idx;
                    it.rec.el.querySelector('.se-label__name').textContent = it.desc.name;
                    it.rec.el.querySelector('.se-label__meta').textContent = it.desc.meta;
                    it.rec.el.classList.toggle('is-on', S.selected === it.p.key);

                    // 固定折线列：所有竖段对齐成两条竖线，读起来才像技术图
                    var midX = side === 'right' ? cardX - 26 : cardX + cardW + 26;
                    it.rec.line.setAttribute('points',
                        it.x.toFixed(1) + ',' + it.y.toFixed(1) + ' ' +
                        midX.toFixed(1) + ',' + it.y.toFixed(1) + ' ' +
                        midX.toFixed(1) + ',' + (it.ly + 13).toFixed(1) + ' ' +
                        edgeX.toFixed(1) + ',' + (it.ly + 13).toFixed(1)
                    );
                    it.rec.dot.setAttribute('cx', it.x.toFixed(1));
                    it.rec.dot.setAttribute('cy', it.y.toFixed(1));
                });
            });
        }

        /* ---------- 循环 ---------- */

        var lastTime = 0;

        function wake() {
            S.dirty = true;
            S.idleTime = 0;
            if (!S.running) {
                S.running = true;
                lastTime = 0;
                requestAnimationFrame(tick);
            }
        }

        function step(dt) {
            var k = reduceMotion ? 1 : 1 - Math.exp(-dt * 6.2);

            if (Math.abs(S.explode - S.explodeTarget) > 0.0004) {
                S.explode += (S.explodeTarget - S.explode) * k;
                S.dirty = true;
            } else if (S.explode !== S.explodeTarget) {
                S.explode = S.explodeTarget;
                S.dirty = true;
            }

            if (Math.abs(cam.theta - cam.targetTheta) > 0.0002 ||
                Math.abs(cam.phi - cam.targetPhi) > 0.0002) {
                var ck = reduceMotion ? 1 : 0.16;
                cam.theta += (cam.targetTheta - cam.theta) * ck;
                cam.phi += (cam.targetPhi - cam.phi) * ck;
                S.dirty = true;
            }

            if (S.spin) {
                cam.targetTheta += dt * 0.16;
                S.dirty = true;
            }

            parts.forEach(function (p) {
                var liftDiff = p.liftTarget - p.lift;
                if (Math.abs(liftDiff) > 0.0002) {
                    p.lift += liftDiff * (reduceMotion ? 1 : 0.18);
                    S.dirty = true;
                }
                var hitLift = p.book && p.hit ? 0.022 * p.hit : 0;
                var e = S.explode;
                p.group.position.set(
                    p.basePos.x + p.dir.x * e,
                    p.basePos.y + p.dir.y * e + p.lift + hitLift,
                    p.basePos.z + p.dir.z * e
                );
                if (p.rotZ) p.group.rotation.z = p.rotZ * e;
                if (p.stretch) p.inner.scale.y = 1 + e * p.stretch;
                if (p.radial) {
                    var rs = 1 + e * p.radial;
                    p.inner.scale.x = rs;
                    p.inner.scale.z = rs;
                }
            });

            updateCamera();

            if (S.dirty) {
                renderer.render(scene, camera);
                updateLabels();
            }
        }

        function tick(now) {
            if (!S.running) return;
            var dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
            lastTime = now;

            var moving =
                Math.abs(S.explode - S.explodeTarget) > 0.0004 ||
                Math.abs(cam.theta - cam.targetTheta) > 0.0002 ||
                Math.abs(cam.phi - cam.targetPhi) > 0.0002 ||
                S.spin ||
                parts.some(function (p) { return Math.abs(p.liftTarget - p.lift) > 0.0002; });

            step(dt);

            if (!moving && !S.dirty) {
                S.idleTime += dt;
                if (S.idleTime > 0.9) { S.running = false; return; }
            } else {
                S.idleTime = 0;
                S.dirty = false;
            }

            requestAnimationFrame(tick);
        }

        /* ---------- 尺寸 ---------- */

        function resize() {
            var w = stage.clientWidth || 1;
            var h = stage.clientHeight || 1;
            var dpr = Math.min(global.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(dpr);
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            S.dirty = true;
            wake();
        }

        var ro = new ResizeObserver(resize);
        ro.observe(stage);

        resolveSize();
        function resolveSize() {
            var w = stage.clientWidth;
            if (!w) {
                requestAnimationFrame(resolveSize);
                return;
            }
            resize();
            updateCamera();
            renderer.render(scene, camera);
            updateLabels();
            onReady({ parts: parts.map(function (p) {
                return { key: p.key, name: p.name || p.key, index: p.index, color: p.color, stat: p.stat || null, hitCount: 0 };
            }) });
            requestAnimationFrame(tick);
        }

        /* ---------- 键盘 ---------- */

        function onKey(e) {
            var k = e.key;
            if (k === 'ArrowLeft') { cam.targetTheta += 0.14; wake(); e.preventDefault(); }
            else if (k === 'ArrowRight') { cam.targetTheta -= 0.14; wake(); e.preventDefault(); }
            else if (k === 'ArrowUp') { cam.targetPhi = clamp(cam.targetPhi - 0.1, MIN_PHI, MAX_PHI); wake(); e.preventDefault(); }
            else if (k === 'ArrowDown') { cam.targetPhi = clamp(cam.targetPhi + 0.1, MIN_PHI, MAX_PHI); wake(); e.preventDefault(); }
            else if (k === '+' || k === '=') { S.zoom = clamp(S.zoom * 0.92, ZOOM_MIN, ZOOM_MAX); wake(); e.preventDefault(); }
            else if (k === '-' || k === '_') { S.zoom = clamp(S.zoom * 1.08, ZOOM_MIN, ZOOM_MAX); wake(); e.preventDefault(); }
            else if (k === 'Escape') {
                if (S.selected) deselect();
                else reset();
                e.preventDefault();
            }
        }
        stage.addEventListener('keydown', onKey);

        /* ---------- 复位 ---------- */

        function reset() {
            stopTour();
            deselect();
            setExplode(0);
            S.zoom = 1;
            S.panX = 0;
            S.panY = 0;
            cam.targetTheta = -0.18;
            cam.targetPhi = 1.46;
            S.spin = false;
            wake();
        }

        function setLabels(v) {
            S.labels = !!v;
            wake();
        }

        function setSpin(v) {
            S.spin = !!v;
            wake();
        }

        function setZoom(v) {
            S.zoom = clamp(v, ZOOM_MIN, ZOOM_MAX);
            wake();
        }

        function dispose() {
            S.running = false;
            ro.disconnect();
            stage.removeEventListener('pointerdown', onDown);
            global.removeEventListener('pointermove', onMove);
            global.removeEventListener('pointerup', onUp);
            stage.removeEventListener('wheel', onWheel);
            stage.removeEventListener('keydown', onKey);
            stopTour();
            renderer.dispose();
        }

        return {
            setHits: setHits,
            selectPart: selectPart,
            selectChunk: selectChunk,
            focusChunk: function (idx) {
                var c = cells.filter(function (x) { return x.mesh.userData.chunkIndex === idx; })[0];
                if (c) {
                    selectPart(c.mesh.userData.partKey, true);
                    selectChunk(idx);
                }
            },
            setExplode: setExplode,
            toggleExplode: toggleExplode,
            tour: tour,
            stopTour: stopTour,
            setLabels: setLabels,
            setSpin: setSpin,
            setZoom: setZoom,
            reset: reset,
            deselect: deselect,
            resize: resize,
            dispose: dispose,
            state: S,
            parts: parts,
            _dbg: function () {
                var box = currentBox();
                var size = box.getSize(new THREE.Vector3());
                var ndc = [];
                camera.updateMatrixWorld(true);
                camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
                for (var i = 0; i < 8; i++) {
                    var v = new THREE.Vector3(
                        i & 1 ? box.max.x : box.min.x,
                        i & 2 ? box.max.y : box.min.y,
                        i & 4 ? box.max.z : box.min.z
                    ).project(camera);
                    ndc.push([+v.x.toFixed(3), +v.y.toFixed(3)]);
                }
                return { fov: camera.fov, pos: camera.position.toArray().map(function(n){return +n.toFixed(2);}), camY: +camera.position.y.toFixed(2), radius: +cam.radius.toFixed(2), size: [+size.x.toFixed(2), +size.y.toFixed(2), +size.z.toFixed(2)], ndc: ndc, aspect: +camera.aspect.toFixed(3) };
            }
        };
    }

    global.SSEngine = { create: create };
})(window);
