/* ============================================================
   小屋 · 可拆解的内容馆 / semantic-engine.js
   一台程序化生成的“小房子”：
     基座 → 地板 → 玻璃四壁 → 双坡屋顶 → 烟囱（结构壳 shell）
     房里 7 个主题展台（机器人 / 控制台 / 蓝图桌 / 机柜 / 小工厂 / 数据塔 / 货箱）
   点开任意部件 → 结构壳向外摊开、展台升到屋顶之上，互不穿插
   依赖：window.THREE（本地 r149 UMD，不用 addons）
   约束：file:// 直开、无外部模型 / 贴图，几何与材质全部代码生成
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

    /* ---------------- 房子骨架尺寸（单位：世界单位，约等于米） ---------------- */

    var HX = 1.62;              // 墙体中线半宽（X）
    var HZ = 1.42;              // 墙体中线半深（Z）
    var T = 0.10;               // 墙厚
    var FLOOR_TOP = 0.12;       // 室内地平面
    var WALL_H = 1.02;          // 墙高（含玻璃）
    var EAVE_Y = FLOOR_TOP + WALL_H;   // 檐口 1.14
    var RIDGE_Y = EAVE_Y + 0.62;       // 屋脊 1.76
    var ROOF_HALF = HX + T;            // 屋面半跨 1.72

    /* ---------------- 拆解布局：全部按“层”与“环”算好，保证不互相穿插 ---------------- */

    var RING_R = 0.78;          // 未拆解时 7 个展台所在环半径
    var RING_SCALE = 1.86;      // 拆解后环放大倍数
    var RING_Y = 1.40;          // 拆解后展台抬升到的平面（高于墙顶 1.14）
    var BASE_DY = -0.46;        // 基座下沉
    var FLOOR_DY = 0.02;
    var WALLS_DY = 0.16;
    var WALLS_OUT = 1.18;       // 四壁水平外摊距离
    var ROOF_DY = 1.74;         // 屋顶整体抬升（檐口 2.88 > 展台顶 ~2.3）
    var CHIM_DY = 1.96;

    var D2R = Math.PI / 180;

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

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

    // 水平薄板：宽 w（X）、深 d（Z）、高 h（Y），圆角 r
    function slabGeo(w, d, h, r, bevel) {
        var bev = bevel === undefined ? 0.006 : bevel;
        var geo = new THREE.ExtrudeGeometry(roundedRectShape(w, d, r), {
            depth: Math.max(0.001, h - bev * 2),
            bevelEnabled: bev > 0,
            bevelThickness: bev,
            bevelSize: bev * 0.9,
            bevelSegments: 1,
            curveSegments: 6
        });
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, -(h - bev * 2) / 2, 0);
        geo.computeVertexNormals();
        return geo;
    }

    // 带齿的齿轮：半径 r、厚 t、齿数 n，面朝 +Z
    function gearGeo(r, t, n) {
        var shape = new THREE.Shape();
        var steps = n * 4;
        for (var i = 0; i < steps; i++) {
            var a = (i / steps) * Math.PI * 2;
            var rr = (i % 4 < 2) ? r : r * 0.78;
            var x = Math.cos(a) * rr, y = Math.sin(a) * rr;
            if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
        }
        shape.closePath();
        var geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 1 });
        geo.translate(0, 0, -t / 2);
        return geo;
    }

    function lineLoop(points, color, opacity, width) {
        var geo = new THREE.BufferGeometry().setFromPoints(points);
        var mat = new THREE.LineBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: opacity === undefined ? 0.5 : opacity
        });
        var l = new THREE.Line(geo, mat);
        if (width && l.material.linewidth !== undefined) l.material.linewidth = width;
        return l;
    }

    function lineSegs(pts, color, opacity) {
        var geo = new THREE.BufferGeometry().setFromPoints(pts);
        var mat = new THREE.LineBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: opacity === undefined ? 0.35 : opacity
        });
        return new THREE.LineSegments(geo, mat);
    }

    /* ---------------- 程序化纹理 ---------------- */

    function envTexture() {
        var c = document.createElement('canvas');
        c.width = 512; c.height = 256;
        var g = c.getContext('2d');

        // 深色环境：上半冷光，下半近黑，金属才不脏
        var grd = g.createLinearGradient(0, 0, 0, 256);
        grd.addColorStop(0.00, '#2c3d52');
        grd.addColorStop(0.26, '#18242f');
        grd.addColorStop(0.52, '#0d151d');
        grd.addColorStop(0.74, '#070b10');
        grd.addColorStop(1.00, '#030507');
        g.fillStyle = grd;
        g.fillRect(0, 0, 512, 256);

        // 两块灯箱：给金属一条像样的高光
        [[132, 60, 116, 'rgba(180,235,255,.85)'], [392, 88, 84, 'rgba(255,236,204,.62)']].forEach(function (b) {
            var hot = g.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
            hot.addColorStop(0, b[3]);
            hot.addColorStop(0.42, 'rgba(255,255,255,.14)');
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
        grd.addColorStop(0.32, 'rgba(255,255,255,.5)');
    grd.addColorStop(1.00, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
    }

    function contactTexture() {
        var c = document.createElement('canvas');
        c.width = c.height = 256;
        var g = c.getContext('2d');
        var grd = g.createRadialGradient(128, 128, 8, 128, 128, 126);
        grd.addColorStop(0.00, 'rgba(0,0,0,.62)');
        grd.addColorStop(0.44, 'rgba(0,0,0,.26)');
        grd.addColorStop(1.00, 'rgba(0,0,0,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 256, 256);
        return new THREE.CanvasTexture(c);
    }

    /* ============================================================
       部件文案：结构壳 + 七个主题展台
       ============================================================ */

    var SHELL_META = {
        base: {
            name: '基座',
            desc: '整间屋子的承重台。前缘铭牌刻着这一批数据的范围，四角螺栓把它固定在地面上——拆开后它会最先下沉，给上面所有层让出高度。',
            specs: [['外形尺寸', '3.74 × 3.34'], ['台体厚度', '0.24'], ['材质', '深色金属 + 磨砂面板'], ['承载', '11 个部件']]
        },
        floor: {
            name: '地板',
            desc: '室内地平面。上面铺了 16 × 14 的刻度网格，7 个主题展台就摆在这张网格上；语义空间中靠得近的片段，在屋里也摆得近。',
            specs: [['平面尺寸', '3.28 × 2.88'], ['刻度网格', '16 × 14'], ['台面高度', '0.12'], ['功能', '展台定位基准']]
        },
        walls: {
            name: '四壁',
            desc: '四面玻璃幕墙，只保留 0.30 高的实心墙裙和顶部发光压梁。做成半透明是刻意的：屋里装的是内容，墙不该挡住它。正面留了门洞。',
            specs: [['墙面数', '4'], ['墙高', '1.02（玻璃 0.66）'], ['墙裙', '0.30 实心'], ['门洞', '0.78 × 0.72']]
        },
        roof: {
            name: '屋顶',
            desc: '双坡屋顶，坡角 19.8°，两片玻璃屋面加屋脊压条。拆解时两片屋面像翻盖一样向上掀开并轻微外张——这是整个动画里最容易被看懂的一步。',
            specs: [['形式', '双坡 / Gable'], ['坡度', '19.8°'], ['檐口标高', '1.14'], ['屋脊标高', '1.76']]
        },
        chimney: {
            name: '烟囱',
            desc: '屋面上唯一的实体凸起，顶端有一圈发光环。它单独作为一个部件，是因为它能最直观地说明「拆解后每个零件都还认得出来」。',
            specs: [['高度', '0.60'], ['截面', '0.24 × 0.24'], ['顶部', '发光环 + 通风缝'], ['位置', '+X / -Z 坡面']]
        }
    };

    var TOPIC_FORM = {
        prompts: { form: '控制台', desc: '一张斜面操作台，屏幕上三条亮线代表提示词的三段结构。提示词是最“手动”的一类知识，所以做成需要人坐下来的工作台。' },
        rules: { form: '机器人', desc: '房里的主角。机器人代表代理规则——它执行、它守边界，天线和目镜就是它的状态灯：规则越多，灯越密。' },
        design: { form: '蓝图桌', desc: '一块斜立图板，板上是发光的结构线框。软件设计只有 2 段，所以这块板做得很薄，不假装内容很多。' },
        agent: { form: '机柜', desc: '一台服务器机柜，正面 6 道插槽灯。智能体开发在这一版语料里只有 2 段，机柜高度按真实片段数收缩。' },
        automation: { form: '小工厂', desc: '一条带齿轮的传送带，是屋里唯一的机械装置。它转起来的时候，正好对应「把重复流程交给机器」这句话。' },
        product: { form: '数据塔', desc: '五根荧光柱加一条趋势线，代表产品分析里的对比与排序。它的高度由片段数决定，不按重要程度排。' },
        project: { form: '货箱', desc: '三只堆叠货箱，代表已经交付的项目案例。箱子是完整的、封口的——项目实践讲的是结果，不是过程。' }
    };

    /* ============================================================
       引擎
       ============================================================ */

    function create(opts) {
        var canvas = opts.canvas;
        var stage = opts.stage;
        var labelLayer = opts.labelLayer;
        var data = opts.data || {};
        var colors = opts.colors || {};

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
        renderer.toneMappingExposure = 1.16;

        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

        var pmrem = new THREE.PMREMGenerator(renderer);
        var envTex = envTexture();
        var envRT = pmrem.fromEquirectangular(envTex);
        scene.environment = envRT.texture;
        envTex.dispose();
        pmrem.dispose();

        scene.add(new THREE.HemisphereLight(0x9fd8ff, 0x0a1016, 0.42));

        var keyLight = new THREE.DirectionalLight(0xdcefff, 1.35);
        keyLight.position.set(4.4, 6.6, 4.2);
        scene.add(keyLight);

        var fillLight = new THREE.DirectionalLight(0x8fb6e0, 0.5);
        fillLight.position.set(-5.0, 2.4, 2.0);
        scene.add(fillLight);

        var rimLight = new THREE.DirectionalLight(0x6ff2dd, 0.9);
        rimLight.position.set(-1.2, 3.2, -5.4);
        scene.add(rimLight);

        // 屋里两盏灯：让玻璃房里真的有光
        var inWarm = new THREE.PointLight(0xffd7a3, 0.85, 4.6, 2);
        inWarm.position.set(-0.5, 0.78, 0.42);
        scene.add(inWarm);
        var inCool = new THREE.PointLight(0x59e8ff, 0.6, 4.2, 2);
        inCool.position.set(0.62, 0.66, -0.5);
        scene.add(inCool);

        var root = new THREE.Group();
        scene.add(root);

        /* ---------- 材质 ---------- */

        var glowTex = radialTexture();
        var CYAN = '#4ff0dc';
        var AMBER = '#ffcf8a';

        function metal(color, rough, metalness) {
            return new THREE.MeshStandardMaterial({
                color: color,
                metalness: metalness === undefined ? 0.86 : metalness,
                roughness: rough === undefined ? 0.38 : rough,
                envMapIntensity: 0.9
            });
        }

        // 自发光条 / 灯带
        function neon(color, intensity) {
            var c = new THREE.Color(color);
            return new THREE.MeshStandardMaterial({
                color: c.clone().multiplyScalar(0.55),
                emissive: c,
                emissiveIntensity: intensity === undefined ? 1.5 : intensity,
                metalness: 0.35,
                roughness: 0.42
            });
        }

        // 玻璃幕墙 / 玻璃屋面：半透明，不写深度，永远能看进去
        function glass(color, opacity) {
            return new THREE.MeshStandardMaterial({
                color: new THREE.Color(color || 0x0b2632),
                metalness: 0.62,
                roughness: 0.08,
                transparent: true,
                opacity: opacity === undefined ? 0.16 : opacity,
                depthWrite: false,
                side: THREE.DoubleSide,
                envMapIntensity: 1.2
            });
        }

        /* ---------- 数据分组（7 个主题 → 7 个展台） ---------- */

        var cats = (data.categories || []).slice();
        var chunks = data.chunks || [];

        var groups = cats.map(function (cat) {
            var members = chunks.filter(function (c) { return c.c === cat.key; });
            var chars = members.reduce(function (s, c) { return s + (c.x || '').length; }, 0);
            return {
                key: cat.key,
                name: cat.label,
                color: colors[cat.key] || CYAN,
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
        var cells = [];                 // 78 道片段灯条
        var partsGroup = new THREE.Group();
        root.add(partsGroup);

        function collectMats(obj, out) {
            obj.traverse(function (o) {
                if (!o.isMesh) return;
                var list = Array.isArray(o.material) ? o.material : [o.material];
                list.forEach(function (m) {
                    if (!m) return;
                    if (out.some(function (r) { return r.m === m; })) return;
                    out.push({
                        m: m,
                        opacity: m.opacity,
                        transparent: m.transparent,
                        depthWrite: m.depthWrite,
                        emissiveIntensity: m.emissiveIntensity
                    });
                });
            });
            return out;
        }

        function registerPart(def) {
            var g = new THREE.Group();
            g.name = def.key;
            g.position.copy(def.pos);
            g.add(def.inner);

            var subs = (def.subs || [{ obj: def.inner, delta: def.delta || new THREE.Vector3() }]).map(function (s) {
                return {
                    obj: s.obj,
                    base: s.obj.position.clone(),
                    baseRot: s.obj.rotation.clone(),
                    delta: s.delta.clone(),
                    dRot: s.dRot || null
                };
            });

            def.inner.traverse(function (o) {
                if (o.isMesh || o.isLineSegments) o.userData.partKey = def.key;
            });
            g.traverse(function (o) {
                if (o.isMesh || o.isLineSegments) o.userData.partKey = def.key;
            });
            partsGroup.add(g);

            var p = {
                key: def.key,
                kind: def.kind || 'shell',
                index: parts.length,
                group: g,
                inner: def.inner,
                basePos: def.pos.clone(),
                subs: subs,
                color: def.color || CYAN,
                name: def.name || def.key,
                desc: def.desc || '',
                specs: def.specs || [],
                stat: def.stat || null,
                form: def.form || '',
                mats: collectMats(def.inner, []),
                outline: null,
                glow: null,
                lift: 0,
                liftTarget: 0,
                hit: 0,
                hitCount: 0,
                accent: def.accent || [],
                anchor: new THREE.Object3D()
            };

            if (def.anchor) p.anchor.position.copy(def.anchor);
            (def.anchorOn || def.inner).add(p.anchor);

            parts.push(p);
            return p;
        }

        /* ============================================================
           A. 结构壳
           ============================================================ */

        /* ---------- A1 基座 ---------- */

        (function buildBase() {
            var inner = new THREE.Group();

            var plinth = new THREE.Mesh(slabGeo(3.74, 3.34, 0.24, 0.06, 0.008), metal(0x0c1219, 0.46, 0.9));
            plinth.position.y = -0.12;
            inner.add(plinth);

            var foot = new THREE.Mesh(slabGeo(3.96, 3.56, 0.05, 0.08, 0.004), metal(0x05080c, 0.72, 0.55));
            foot.position.y = -0.245;
            inner.add(foot);

            // 台面内嵌的一圈亮边
            var inset = new THREE.Mesh(slabGeo(3.42, 3.02, 0.014, 0.04, 0.002), neon(CYAN, 0.85));
            inset.position.y = 0.002;
            inner.add(inset);

            // 四角螺栓
            var boltGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.03, 6);
            var boltMat = metal(0x6f7f92, 0.3, 1.0);
            [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
                var b = new THREE.Mesh(boltGeo, boltMat);
                b.position.set(s[0] * (3.74 / 2 - 0.14), 0.015, s[1] * (3.34 / 2 - 0.14));
                inner.add(b);
            });

            // 前缘铭牌
            var plate = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.055, 0.014), metal(0x93a2b5, 0.3, 1.0));
            plate.position.set(0, -0.052, 3.34 / 2 + 0.008);
            inner.add(plate);
            var plateGlow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.012, 0.016), neon(AMBER, 1.1));
            plateGlow.position.set(0, -0.052, 3.34 / 2 + 0.014);
            inner.add(plateGlow);

            // 侧向散热缝
            var ventMat = metal(0x131b25, 0.55, 0.7);
            for (var i = 0; i < 9; i++) {
                var v = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.1, 0.9), ventMat);
                v.position.set(-3.74 / 2 + 0.02, -0.12, -1.2 + i * 0.3);
                inner.add(v);
            }

            registerPart({
                key: 'base', kind: 'shell', name: SHELL_META.base.name,
                desc: SHELL_META.base.desc, specs: SHELL_META.base.specs,
                color: '#7d8ea3', inner: inner,
                pos: new THREE.Vector3(0, 0, 0),
                delta: new THREE.Vector3(0, BASE_DY, 0),
                anchor: new THREE.Vector3(1.42, 0.02, 1.4)
            });
        })();

        /* ---------- A2 地板 ---------- */

        (function buildFloor() {
            var inner = new THREE.Group();

            var deck = new THREE.Mesh(slabGeo(3.28, 2.88, 0.12, 0.05, 0.005), metal(0x0e1720, 0.5, 0.82));
            deck.position.y = FLOOR_TOP - 0.06;
            inner.add(deck);

            // 刻度网格（只画线，不用贴图）
            var pts = [];
            var gx = 16, gz = 14;
            var hw = 1.5, hz = 1.32;
            for (var i = 0; i <= gx; i++) {
                var x = -hw + (i / gx) * hw * 2;
                pts.push(new THREE.Vector3(x, FLOOR_TOP + 0.004, -hz));
                pts.push(new THREE.Vector3(x, FLOOR_TOP + 0.004, hz));
            }
            for (var j = 0; j <= gz; j++) {
                var z = -hz + (j / gz) * hz * 2;
                pts.push(new THREE.Vector3(-hw, FLOOR_TOP + 0.004, z));
                pts.push(new THREE.Vector3(hw, FLOOR_TOP + 0.004, z));
            }
            inner.add(lineSegs(pts, CYAN, 0.13));

            // 中央定位环
            var ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.007, 6, 48), neon(CYAN, 1.3));
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = FLOOR_TOP + 0.008;
            inner.add(ring);

            var ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.004, 6, 56), neon(AMBER, 0.9));
            ring2.rotation.x = -Math.PI / 2;
            ring2.position.y = FLOOR_TOP + 0.008;
            inner.add(ring2);

            registerPart({
                key: 'floor', kind: 'shell', name: SHELL_META.floor.name,
                desc: SHELL_META.floor.desc, specs: SHELL_META.floor.specs,
                color: '#58c7d8', inner: inner,
                pos: new THREE.Vector3(0, 0, 0),
                delta: new THREE.Vector3(0, FLOOR_DY, 0),
                anchor: new THREE.Vector3(-1.25, FLOOR_TOP + 0.02, 1.2)
            });
        })();

        /* ---------- A3 四壁 ---------- */

        var wallSubs = [];

        (function buildWalls() {
            var inner = new THREE.Group();
            var capLen = 2 * HX + T;

            // 单面墙：沿本地 X 铺开，厚度朝本地 Z
            function wallLocal(len, withDoor) {
                var g = new THREE.Group();

                var skirt = new THREE.Mesh(new THREE.BoxGeometry(len, 0.30, T), metal(0x0d151e, 0.5, 0.86));
                skirt.position.y = FLOOR_TOP + 0.15;
                g.add(skirt);

                // 墙裙上的一道亮缝
                var strip = new THREE.Mesh(new THREE.BoxGeometry(len * 0.94, 0.014, 0.012), neon(CYAN, 1.35));
                strip.position.set(0, FLOOR_TOP + 0.305, T / 2 + 0.004);
                g.add(strip);

                // 玻璃
                var gl = new THREE.Mesh(new THREE.BoxGeometry(len - 0.04, 0.66, 0.03), glass(0x0b2630, 0.15));
                gl.position.y = FLOOR_TOP + 0.65;
                g.add(gl);

                // 竖向发光立柱
                var n = Math.max(2, Math.round(len / 0.44));
                for (var i = 0; i <= n; i++) {
                    var x = -len / 2 + 0.03 + (i / n) * (len - 0.06);
                    var mull = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.68, 0.05), metal(0x121d27, 0.42, 0.8));
                    mull.position.set(x, FLOOR_TOP + 0.65, 0);
                    g.add(mull);
                }

                // 顶部压梁（发光）
                var cap = new THREE.Mesh(new THREE.BoxGeometry(len, 0.075, T + 0.03), metal(0x121b25, 0.4, 0.9));
                cap.position.y = EAVE_Y - 0.037;
                g.add(cap);
                var capGlow = new THREE.Mesh(new THREE.BoxGeometry(len * 0.99, 0.012, 0.016), neon(CYAN, 1.1));
                capGlow.position.set(0, EAVE_Y - 0.079, (T + 0.03) / 2);
                g.add(capGlow);

                if (withDoor) {
                    var dw = 0.78, dh = 0.72;
                    var frameMat = metal(0x2a3a4a, 0.34, 0.95);
                    [-1, 1].forEach(function (s) {
                        var post = new THREE.Mesh(new THREE.BoxGeometry(0.05, dh + 0.04, T + 0.02), frameMat);
                        post.position.set(s * (dw / 2 + 0.02), FLOOR_TOP + dh / 2 + 0.02, 0);
                        g.add(post);
                    });
                    var header = new THREE.Mesh(new THREE.BoxGeometry(dw + 0.09, 0.05, T + 0.02), frameMat);
                    header.position.set(0, FLOOR_TOP + dh + 0.045, 0);
                    g.add(header);

                    var leaf = new THREE.Mesh(new THREE.BoxGeometry(dw, dh, 0.022), glass(0x0d3540, 0.26));
                    leaf.position.set(0, FLOOR_TOP + dh / 2 + 0.02, 0);
                    g.add(leaf);

                    var handle = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.12, 0.016), neon(AMBER, 1.5));
                    handle.position.set(dw / 2 - 0.1, FLOOR_TOP + dh / 2 + 0.02, T / 2 + 0.02);
                    g.add(handle);
                }
                return g;
            }

            var defs = [
                { key: 'back', pos: new THREE.Vector3(0, 0, -HZ), rot: 0, len: capLen, dir: new THREE.Vector3(0, 0, -1) },
                { key: 'front', pos: new THREE.Vector3(0, 0, HZ), rot: 0, len: capLen, dir: new THREE.Vector3(0, 0, 1), door: true },
                { key: 'left', pos: new THREE.Vector3(-HX, 0, 0), rot: Math.PI / 2, len: 2 * HZ, dir: new THREE.Vector3(-1, 0, 0) },
                { key: 'right', pos: new THREE.Vector3(HX, 0, 0), rot: Math.PI / 2, len: 2 * HZ, dir: new THREE.Vector3(1, 0, 0) }
            ];

            var subs = [];
            defs.forEach(function (d) {
                var g = wallLocal(d.len, d.door);
                g.position.copy(d.pos);
                g.rotation.y = d.rot;
                inner.add(g);
                subs.push({
                    obj: g,
                    delta: d.dir.clone().multiplyScalar(WALLS_OUT).add(new THREE.Vector3(0, WALLS_DY, 0))
                });
            });

            var anchorOn = inner.children[1];
            var part = registerPart({
                key: 'walls', kind: 'shell', name: SHELL_META.walls.name,
                desc: SHELL_META.walls.desc, specs: SHELL_META.walls.specs,
                color: '#4fd6c4', inner: inner, subs: subs,
                pos: new THREE.Vector3(0, 0, 0),
                anchorOn: anchorOn,
                anchor: new THREE.Vector3(0.95, 0.35, 0.06)
            });
            wallSubs = part.subs;
        })();

        /* ---------- A4 双坡屋顶 ---------- */

        (function buildRoof() {
            var inner = new THREE.Group();
            var rise = RIDGE_Y - EAVE_Y;
            var slopeLen = Math.sqrt(ROOF_HALF * ROOF_HALF + rise * rise);
            var slopeAng = Math.atan2(rise, ROOF_HALF);
            var depth = 2 * HZ + 0.34;

            function panel(sign) {
                var g = new THREE.Group();

                var glassPanel = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.035, depth), glass(0x0a202a, 0.2));
                g.add(glassPanel);

                // 檩条：几道横向加强筋，让玻璃有结构感
                for (var i = 1; i <= 3; i++) {
                    var rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.045, depth * 0.98), metal(0x1a2733, 0.4, 0.9));
                    rib.position.set(-slopeLen / 2 + (i / 4) * slopeLen, 0.03, 0);
                    g.add(rib);
                }

                // 檐口压条
                var eave = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, depth), metal(0x16222d, 0.38, 0.95));
                eave.position.set(sign * (slopeLen / 2 - 0.02), -0.035, 0);
                g.add(eave);

                var eaveGlow = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, depth * 0.97), neon(CYAN, 1.5));
                eaveGlow.position.set(sign * (slopeLen / 2 - 0.02), -0.088, 0);
                g.add(eaveGlow);

                g.rotation.z = -sign * slopeAng;
                g.position.set(sign * slopeLen / 2 * Math.cos(slopeAng), EAVE_Y + rise / 2, 0);
                return g;
            }

            var left = panel(-1);
            var right = panel(1);
            inner.add(left);
            inner.add(right);

            // 屋脊压条
            var ridge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, depth), metal(0x1c2a36, 0.36, 0.95));
            ridge.position.set(0, RIDGE_Y + 0.01, 0);
            inner.add(ridge);
            var ridgeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.014, depth * 0.98), neon(AMBER, 1.4));
            ridgeGlow.position.set(0, RIDGE_Y + 0.05, 0);

            // 两端山墙三角形
            function gable(sign) {
                var g = new THREE.Group();
                var shape = new THREE.Shape();
                shape.moveTo(-ROOF_HALF, 0);
                shape.lineTo(ROOF_HALF, 0);
                shape.lineTo(0, rise);
                shape.closePath();
                var geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
                geo.translate(0, 0, -0.025);
                var mesh = new THREE.Mesh(geo, glass(0x0a202a, 0.22));
                mesh.position.y = EAVE_Y;
                g.add(mesh);

                // 三角形边框
                var frame = lineLoop([
                    new THREE.Vector3(-ROOF_HALF, EAVE_Y, 0),
                    new THREE.Vector3(ROOF_HALF, EAVE_Y, 0),
                    new THREE.Vector3(0, RIDGE_Y, 0),
                    new THREE.Vector3(-ROOF_HALF, EAVE_Y, 0)
                ], CYAN, 0.7);
                g.add(frame);
                g.position.z = sign * (HZ + 0.12);
                return g;
            }

            var gf = gable(1);
            var gb = gable(-1);
            inner.add(gf);
            inner.add(gb);
            inner.add(ridgeGlow);

            var subs = [
                { obj: left, delta: new THREE.Vector3(-0.42, ROOF_DY, 0), dRot: new THREE.Vector3(0, 0, 0.2) },
                { obj: right, delta: new THREE.Vector3(0.42, ROOF_DY, 0), dRot: new THREE.Vector3(0, 0, -0.2) },
                { obj: gf, delta: new THREE.Vector3(0, ROOF_DY, 0.52), dRot: null },
                { obj: gb, delta: new THREE.Vector3(0, ROOF_DY, -0.52), dRot: null },
                { obj: ridge, delta: new THREE.Vector3(0, ROOF_DY + 0.06, 0), dRot: null },
                { obj: ridgeGlow, delta: new THREE.Vector3(0, ROOF_DY + 0.06, 0), dRot: null }
            ];

            registerPart({
                key: 'roof', kind: 'shell', name: SHELL_META.roof.name,
                desc: SHELL_META.roof.desc, specs: SHELL_META.roof.specs,
                color: '#ffc98a', inner: inner, subs: subs,
                pos: new THREE.Vector3(0, 0, 0),
                anchorOn: left,
                anchor: new THREE.Vector3(-0.95, 0.1, 0.3)
            });
        })();

        /* ---------- A5 烟囱 ---------- */

        (function buildChimney() {
            var inner = new THREE.Group();
            var body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.60, 0.24), metal(0x16202b, 0.44, 0.88));
            body.position.y = 1.62;
            inner.add(body);

            var capRing = new THREE.Mesh(new THREE.TorusGeometry(0.131, 0.012, 6, 20), neon(AMBER, 1.6));
            capRing.rotation.x = -Math.PI / 2;
            capRing.position.y = 1.925;
            inner.add(capRing);

            var innerGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.098, 0.014, 16), neon('#ff9d4d', 1.9));
            innerGlow.position.y = 1.918;
            inner.add(innerGlow);

            // 砖缝
            for (var i = 0; i < 3; i++) {
                var seam = new THREE.Mesh(new THREE.BoxGeometry(0.248, 0.012, 0.248), metal(0x24313d, 0.5, 0.7));
                seam.position.y = 1.38 + i * 0.15;
                inner.add(seam);
            }

            registerPart({
                key: 'chimney', kind: 'shell', name: SHELL_META.chimney.name,
                desc: SHELL_META.chimney.desc, specs: SHELL_META.chimney.specs,
                color: '#ffb066', inner: inner,
                pos: new THREE.Vector3(1.0, 0, -0.5),
                delta: new THREE.Vector3(0.28, CHIM_DY, 0),
                anchor: new THREE.Vector3(0.16, 0.34, 0.16)
            });
        })();

        /* ============================================================
           B. 七个主题展台
           ============================================================ */

        // 展台公用底座
        function dioBase() {
            var g = new THREE.Group();
            var pad = new THREE.Mesh(slabGeo(0.46, 0.36, 0.05, 0.018, 0.004), metal(0x101a24, 0.5, 0.8));
            pad.position.y = 0.025;
            g.add(pad);
            var edge = new THREE.Mesh(slabGeo(0.42, 0.32, 0.008, 0.014, 0.002), neon(CYAN, 0.55));
            edge.position.y = 0.052;
            g.add(edge);
            return g;
        }

        var DIO = {
            /* 机器人 —— 代理规则 */
            rules: function (m) {
                var g = new THREE.Group();
                g.add(dioBase());
                var bodyMat = metal(0x28323d, 0.4, 0.85);
                var plateMat = metal(0x3b4a58, 0.34, 0.95);

                // 腿
                [-1, 1].forEach(function (s) {
                    var leg = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.17, 0.09), bodyMat);
                    leg.position.set(s * 0.065, 0.138, 0);
                    g.add(leg);
                });

                // 躯干
                var torso = new THREE.Mesh(slabGeo(0.26, 0.19, 0.28, 0.03, 0.004), plateMat);
                torso.position.y = 0.36;
                g.add(torso);

                // 胸口指示灯阵列
                var eyeMat = neon(m, 2.0);
                for (var r = 0; r < 2; r++) {
                    for (var c = 0; c < 3; c++) {
                        var led = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.014, 0.012), eyeMat);
                        led.position.set(-0.05 + c * 0.05, 0.40 - r * 0.035, 0.098);
                        g.add(led);
                    }
                }

                // 手臂
                [-1, 1].forEach(function (s) {
                    var arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.21, 0.05), bodyMat);
                    arm.position.set(s * 0.163, 0.345, 0);
                    arm.rotation.z = s * 0.09;
                    g.add(arm);
                });

                // 头
                var head = new THREE.Mesh(slabGeo(0.21, 0.17, 0.16, 0.04, 0.004), plateMat);
                head.position.y = 0.60;
                g.add(head);

                var visor = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.045, 0.012), neon(m, 2.4));
                visor.position.set(0, 0.607, 0.083);
                g.add(visor);

                // 颈
                var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.04, 8), bodyMat);
                neck.position.y = 0.515;
                g.add(neck);

                // 天线
                var ant = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.11, 6), bodyMat);
                ant.position.set(0.06, 0.73, -0.02);
                g.add(ant);
                var tip = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 8), neon('#ff7d6b', 2.4));
                tip.position.set(0.06, 0.79, -0.02);
                g.add(tip);

                return { group: g, anchorY: 0.92, accent: [eyeMat, visor], spin: null };
            },

            /* 控制台 —— 提示词 */
            prompts: function (m) {
                var g = new THREE.Group();
                g.add(dioBase());
                var frameMat = metal(0x212b36, 0.42, 0.82);

                var top = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.24), metal(0x2b3641, 0.36, 0.9));
                top.position.y = 0.265;
                g.add(top);

                // 四条腿
                [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
                    var leg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.21, 0.02), frameMat);
                    leg.position.set(s[0] * 0.185, 0.155, s[1] * 0.1);
                    g.add(leg);
                });

                // 斜面屏
                var screen = new THREE.Group();
                var panel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.21, 0.014), metal(0x0a1219, 0.5, 0.6));
                screen.add(panel);
                var glowPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.30, 0.17), neon(m, 0.55));
                glowPanel.position.z = 0.008;
                screen.add(glowPanel);
                for (var i = 0; i < 3; i++) {
                    var ln = new THREE.Mesh(new THREE.BoxGeometry(0.20 - i * 0.045, 0.012, 0.004), neon(m, 2.2));
                    ln.position.set(-0.04 + i * 0.01, 0.05 - i * 0.045, 0.012);
                    screen.add(ln);
                }
                screen.position.set(0, 0.40, -0.055);
                screen.rotation.x = -0.28;
                g.add(screen);

                // 键盘
                var kb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.012, 0.09), metal(0x1b242e, 0.55, 0.7));
                kb.position.set(0, 0.285, 0.075);
                g.add(kb);
                var kbGlow = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.004, 0.06), neon(m, 1.2));
                kbGlow.position.set(0, 0.293, 0.075);
                g.add(kbGlow);

                // 悬浮光标
                var cursor = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.03, 0.022), neon('#ffffff', 1.8));
                cursor.position.set(0.12, 0.50, 0.02);
                g.add(cursor);

                return { group: g, anchorY: 0.62, accent: [glowPanel], spin: { obj: cursor, axis: 'y', speed: 0.9 } };
            },

            /* 蓝图桌 —— 软件设计 */
            design: function (m) {
                var g = new THREE.Group();
                g.add(dioBase());
                var frameMat = metal(0x3a3428, 0.44, 0.8);

                var board = new THREE.Group();
                var face = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.012), metal(0x0c141b, 0.52, 0.55));
                board.add(face);

                var glowFace = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.24), neon(m, 0.32));
                glowFace.position.z = 0.007;
                board.add(glowFace);

                // 图板上的结构线框：一个房子的剖面，正好呼应这页本身
                var pts = [
                    new THREE.Vector3(-0.11, -0.07, 0.01), new THREE.Vector3(0.11, -0.07, 0.01),
                    new THREE.Vector3(0.11, 0.03, 0.01), new THREE.Vector3(-0.11, 0.03, 0.01),
                    new THREE.Vector3(-0.11, -0.07, 0.01),
                    new THREE.Vector3(-0.13, 0.03, 0.01), new THREE.Vector3(0, 0.105, 0.01),
                    new THREE.Vector3(0.13, 0.03, 0.01),
                    new THREE.Vector3(0.05, -0.07, 0.01), new THREE.Vector3(0.05, 0.005, 0.01)
                ];
                var wire = lineLoop(pts, m, 0.95);
                board.add(wire);

                // 尺寸标注点
                [[-0.11, -0.07], [0.11, 0.03]].forEach(function (p) {
                    var dot = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), neon('#ffffff', 1.6));
                    dot.position.set(p[0], p[1], 0.012);
                    board.add(dot);
                });

                board.position.set(0, 0.34, -0.01);
                board.rotation.x = -0.18;
                g.add(board);

                // 支架
                [-1, 1].forEach(function (s) {
                    var strut = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.34, 0.018), frameMat);
                    strut.position.set(s * 0.13, 0.20, 0.03);
                    strut.rotation.x = -0.18;
                    g.add(strut);
                });
                var bar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.02), frameMat);
                bar.position.set(0, 0.075, 0.05);
                g.add(bar);

                return { group: g, anchorY: 0.64, accent: [glowFace], spin: null };
            },

            /* 机柜 —— 智能体开发 */
            agent: function (m) {
                var g = new THREE.Group();
                g.add(dioBase());
                var cab = new THREE.Mesh(slabGeo(0.30, 0.24, 0.50, 0.014, 0.004), metal(0x1a232d, 0.42, 0.9));
                cab.position.y = 0.30;
                g.add(cab);

                var slotMat = neon(m, 1.5);
                for (var i = 0; i < 6; i++) {
                    var slot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.018, 0.012), slotMat);
                    slot.position.set(0, 0.15 + i * 0.05, 0.126);
                    g.add(slot);
                    // 每个插槽左侧的状态点
                    var dot = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.014), neon('#ffffff', 1.4));
                    dot.position.set(-0.088, 0.15 + i * 0.05, 0.128);
                    g.add(dot);
                }

                // 顶部风扇
                var fan = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 6, 20), metal(0x40505f, 0.34, 1.0));
                fan.rotation.x = -Math.PI / 2;
                fan.position.y = 0.555;
                g.add(fan);
                var fanGlow = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), neon(m, 1.1));
                fanGlow.rotation.x = -Math.PI / 2;
                fanGlow.position.y = 0.548;
                g.add(fanGlow);

                // 侧边走线
                var curve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(-0.152, 0.52, 0.0),
                    new THREE.Vector3(-0.175, 0.36, 0.06),
                    new THREE.Vector3(-0.152, 0.14, 0.02)
                ]);
                var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.008, 6, false), metal(0x51616f, 0.4, 0.9));
                g.add(tube);

                return { group: g, anchorY: 0.72, accent: [slotMat], spin: null };
            },

            /* 小工厂 —— 自动化工作流 */
            automation: function (m) {
                var g = new THREE.Group();
                g.add(dioBase());
                var frameMat = metal(0x27313b, 0.42, 0.86);

                // 传送带
                var belt = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.15), metal(0x141d26, 0.55, 0.7));
                belt.position.y = 0.20;
                g.add(belt);

                var beltGlow = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.006, 0.13), neon(m, 1.0));
                beltGlow.position.y = 0.222;
                g.add(beltGlow);

                // 滚筒
                var rollerGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.14, 10);
                var rollerMat = metal(0x485764, 0.36, 0.95);
                var rollers = [];
                for (var i = 0; i < 4; i++) {
                    // 外层 group 把轴摆到 Z 方向，内层 mesh 绕自身 Y 轴自转
                    var wrap = new THREE.Group();
                    wrap.rotation.x = Math.PI / 2;
                    var roll = new THREE.Mesh(rollerGeo, rollerMat);
                    wrap.add(roll);
                    wrap.position.set(-0.15 + i * 0.1, 0.20, 0);
                    g.add(wrap);
                    rollers.push(roll);
                }

                // 支腿
                [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
                    var leg = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.19, 0.018), frameMat);
                    leg.position.set(s[0] * 0.185, 0.115, s[1] * 0.06);
                    g.add(leg);
                });

                // 齿轮组
                var gearMat = neon(m, 1.1);
                var g1 = new THREE.Mesh(gearGeo(0.075, 0.02, 9), gearMat);
                g1.position.set(-0.06, 0.345, -0.075);
                g.add(g1);
                var g2 = new THREE.Mesh(gearGeo(0.052, 0.018, 7), gearMat);
                g2.position.set(0.055, 0.328, -0.075);
                g.add(g2);

                // 烟囱
                var stack = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 0.28, 10), metal(0x33414e, 0.44, 0.8));
                stack.position.set(-0.155, 0.40, -0.055);
                g.add(stack);
                var stackRing = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.006, 6, 14), neon(AMBER, 1.4));
                stackRing.rotation.x = -Math.PI / 2;
                stackRing.position.set(-0.155, 0.545, -0.055);
                g.add(stackRing);

                // 带上的箱子
                var crate = new THREE.Mesh(slabGeo(0.075, 0.075, 0.075, 0.008, 0.003), metal(0x5a6572, 0.42, 0.75));
                crate.position.set(0.10, 0.258, 0);
                g.add(crate);

                return {
                    group: g, anchorY: 0.70, accent: [beltGlow, gearMat],
                    spin: { gears: [g1, g2], rollers: rollers, crate: crate }
                };
            },

            /* 数据塔 —— 产品分析 */
            product: function (m) {
                var g = new THREE.Group();
                g.add(dioBase());

                var base = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.03, 0.24), metal(0x1b2530, 0.44, 0.86));
                base.position.y = 0.065;
                g.add(base);

                var heights = [0.12, 0.20, 0.31, 0.26, 0.38];
                var barMat = neon(m, 1.15);
                heights.forEach(function (h, i) {
                    var bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.05), barMat);
                    bar.position.set(-0.14 + i * 0.07, 0.08 + h / 2, 0);
                    g.add(bar);
                });

                // 趋势折线
                var pts = heights.map(function (h, i) {
                    return new THREE.Vector3(-0.14 + i * 0.07, 0.08 + h + 0.03, 0.0);
                });
                var trend = lineLoop(pts, '#ffffff', 0.85);
                g.add(trend);

                // 悬浮环
                var halo = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.006, 6, 32), neon(AMBER, 1.5));
                halo.rotation.x = -Math.PI / 2 + 0.3;
                halo.position.set(0, 0.60, 0);
                g.add(halo);

                return { group: g, anchorY: 0.74, accent: [barMat], spin: { obj: halo, axis: 'y', speed: 0.5 } };
            },

            /* 货箱 —— 项目实践 */
            project: function (m) {
                var g = new THREE.Group();
                g.add(dioBase());
                var crateMat = metal(0x3b3730, 0.5, 0.72);
                var edgeMat = neon(m, 1.2);

                function crate(x, y, z, s, rot) {
                    var c = new THREE.Group();
                    var body = new THREE.Mesh(slabGeo(s, s, s * 0.86, 0.008, 0.003), crateMat);
                    c.add(body);
                    // 三面亮边
                    var geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(s * 0.99, s * 0.85, s * 0.99));
                    var e = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
                        color: new THREE.Color(m), transparent: true, opacity: 0.75
                    }));
                    c.add(e);
                    c.position.set(x, y, z);
                    c.rotation.y = rot || 0;
                    return c;
                }

                g.add(crate(-0.085, 0.105, 0.01, 0.17, 0.12));
                g.add(crate(0.075, 0.105, -0.03, 0.17, -0.2));
                g.add(crate(0.0, 0.255, -0.01, 0.15, 0.42));

                // 顶部吊牌杆
                var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 6), metal(0x6a7280, 0.36, 1.0));
                pole.position.set(-0.1, 0.42, 0.05);
                g.add(pole);
                var flag = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.05), neon(m, 1.4));
                flag.position.set(-0.055, 0.48, 0.05);
                flag.material.side = THREE.DoubleSide;
                g.add(flag);

                return { group: g, anchorY: 0.62, accent: [edgeMat], spin: null };
            }
        };

        /* ---------- 布置展台 ---------- */

        var dioramas = [];

        (function buildDioramas() {
            var n = groups.length;
            // 从 -Z（后墙中点）起排，正面留出门口，7 个展台大致左右对称
            var start = -Math.PI / 2;

            groups.forEach(function (g, i) {
                var maker = DIO[g.key];
                var ang = start + (i / n) * Math.PI * 2;
                var rx = Math.sin(ang) * RING_R;
                var rz = Math.cos(ang) * RING_R;

                var built = maker ? maker(g.color) : { group: new THREE.Group(), anchorY: 0.6, accent: [] };
                var inner = built.group;
                inner.position.set(rx, FLOOR_TOP, rz);
                // 面向圆心：本地 +Z 指向原点
                inner.rotation.y = Math.atan2(-rx, -rz);

                var meta = TOPIC_FORM[g.key] || { form: '展台', desc: '' };

                var part = registerPart({
                    key: g.key,
                    kind: 'core',
                    name: g.name,
                    form: meta.form,
                    desc: meta.desc +
                        '这一版语料里属于「' + g.name + '」的片段共 ' + g.count + ' 段、' + g.chars +
                        ' 字，平均每段 ' + g.avg + ' 字。展台背后那根竖列就是 ' + g.count + ' 道片段灯条，检索命中时会逐条亮起。',
                    specs: [
                        ['形态', meta.form],
                        ['片段数', g.count + ' 段'],
                        ['总字数', g.chars.toLocaleString('en-US') + ' 字'],
                        ['平均长度', g.avg + ' 字'],
                        ['索引列', g.count + ' 道灯条']
                    ],
                    stat: { count: g.count, chars: g.chars, avg: g.avg },
                    color: g.color,
                    inner: inner,
                    pos: new THREE.Vector3(0, 0, 0),
                    delta: new THREE.Vector3(
                        rx * (RING_SCALE - 1),
                        RING_Y - FLOOR_TOP,
                        rz * (RING_SCALE - 1)
                    ),
                    accent: built.accent || [],
                    anchor: new THREE.Vector3(0, built.anchorY || 0.62, 0)
                });

                part.built = built;
                part.ringPos = new THREE.Vector3(rx, FLOOR_TOP, rz);
                dioramas.push(part);
            });
        })();

        /* ---------- 片段灯条（每个展台背后一根竖列） ---------- */

        (function buildCells() {
            var first = dioramas[0];
            if (!first) return;
            var color0 = first.color;

            dioramas.forEach(function (part) {
                var g = groups.filter(function (x) { return x.key === part.key; })[0];
                if (!g) return;

                var n = g.count;
                var spineH = 0.46;
                var pitch = spineH / n;
                var segH = Math.max(0.004, pitch * 0.62);

                // 立柱
                var post = new THREE.Mesh(
                    new THREE.BoxGeometry(0.05, spineH + 0.06, 0.04),
                    metal(0x111a23, 0.52, 0.7)
                );
                post.position.set(0.205, 0.10 + (spineH + 0.06) / 2, -0.115);
                part.inner.add(post);

                // 底座小灯
                var foot = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.014, 0.045), neon(part.color, 1.0));
                foot.position.set(0.205, 0.10, -0.115);
                part.inner.add(foot);

                var cellMats = [];
                for (var i = 0; i < n; i++) {
                    var m = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(part.color),
                        emissive: new THREE.Color(part.color),
                        emissiveIntensity: 0.32,
                        metalness: 0.3,
                        roughness: 0.45
                    });
                    var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.03, segH, 0.012), m);
                    var yy = n === 1
                        ? 0.10 + spineH / 2
                        : 0.10 + (i + 0.5) * pitch;
                    mesh.position.set(0.205, yy, -0.093);
                    mesh.userData.chunkIndex = g.members[i].i;
                    mesh.userData.partKey = part.key;
                    mesh.userData.noOutline = true;
                    part.inner.add(mesh);
                    cellMats.push({ mesh: mesh, mat: m, baseColor: m.color.clone(), chunk: g.members[i], partKey: part.key });
                    cells.push(cellMats[cellMats.length - 1]);
                }

                part.spine = { mats: cellMats, height: spineH, post: post };
                part.mats = collectMats(part.inner, []);
            });
        })();

        /* ---------- 接触阴影 ---------- */

        var shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(7.4, 6.4),
            new THREE.MeshBasicMaterial({
                map: contactTexture(), transparent: true, opacity: 0.95,
                depthWrite: false
            })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -0.30;
        shadow.renderOrder = -1;
        root.add(shadow);

        /* ---------- 包围盒（装配 / 拆解） ---------- */

        var bounds = parts.map(function (p) {
            // 每个子对象在“静止姿态”下各自的包围盒；拆解时按它自己的位移平移
            var subs = p.subs.map(function (s) {
                var bb = new THREE.Box3().setFromObject(s.obj);
                if (bb.isEmpty()) {
                    bb.setFromCenterAndSize(
                        s.base.clone(),
                        new THREE.Vector3(0.3, 0.2, 0.3)
                    );
                }
                return { sub: s, box: bb, size: bb.getSize(new THREE.Vector3()) };
            });
            var whole = new THREE.Box3().setFromObject(p.inner);
            if (whole.isEmpty()) whole.setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(0.4, 0.1, 0.4));
            return {
                part: p,
                subs: subs,
                box: whole,
                size: whole.getSize(new THREE.Vector3()),
                centerLocal: whole.getCenter(new THREE.Vector3())
            };
        });

        var _tmpBox = new THREE.Box3();
        var _frameBoxes = [];

        // 收集当前拆解进度下所有"真实"子包围盒。
        // 用联合 AABB 会把不相干的宽/高组合成幽灵角（比如基座的宽度配屋顶的高度），
        // 自动取景就会被推到很远，模型缩成一小块。
        function collectFrameBoxes(e) {
            _frameBoxes.length = 0;
            bounds.forEach(function (b) {
                b.subs.forEach(function (s) {
                    _tmpBox.copy(s.box).translate(s.sub.delta.clone().multiplyScalar(e));
                    _frameBoxes.push(_tmpBox.clone());
                });
            });
            return _frameBoxes;
        }

        function boundsBoxAt(e) {
            var out = new THREE.Box3();
            collectFrameBoxes(e).forEach(function (bb) { out.union(bb); });
            if (out.isEmpty()) out = box0Fallback();
            return out;
        }

        // setFromObject 在极窄场景下可能为空：兜一个体面的默认盒
        function box0Fallback() {
            return new THREE.Box3(new THREE.Vector3(-1.9, -0.3, -1.7), new THREE.Vector3(1.9, 1.9, 1.7));
        }

        var box0 = boundsBoxAt(0);
        var box1 = boundsBoxAt(1);

        /* ---------- 选中描边 / 光晕 ---------- */

        function buildOutline(p) {
            if (p.outline) return p.outline;
            var group = new THREE.Group();
            var mat = new THREE.LineBasicMaterial({
                color: new THREE.Color(p.color),
                transparent: true, opacity: 0.9, depthWrite: false
            });
            p.inner.traverse(function (o) {
                if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                if (o.userData.noOutline) return;
                if (o.geometry.attributes.position.count > 4000) return;
                var eg;
                try { eg = new THREE.EdgesGeometry(o.geometry, 34); } catch (err) { return; }
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
            var scale = Math.max(size.x, size.z, size.y) * 2.1;
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
            idleTime: 0,
            clock: 0
        };

        var cam = {
            theta: 0.62,
            phi: 1.04,
            radius: 6,
            targetTheta: 0.62,
            targetPhi: 1.04
        };

        var MIN_PHI = 0.26, MAX_PHI = Math.PI - 0.42;
        var ZOOM_MIN = 0.5, ZOOM_MAX = 1.9;

        /* ---------- 相机 ---------- */

        function currentBox(e) {
            var t = clamp(e === undefined ? S.explode : e, 0, 1);
            var min = box0.min.clone().lerp(box1.min, t);
            var max = box0.max.clone().lerp(box1.max, t);
            return new THREE.Box3(min, max);
        }

        var _fitCorner = new THREE.Vector3();
        var _fitRel = new THREE.Vector3();
        var _fitRight = new THREE.Vector3();
        var _fitUp = new THREE.Vector3();
        var _fitDir = new THREE.Vector3();

        // 解析取景：把每个真实子包围盒的 8 个角投到相机基上，直接解出"刚好装下"的半径。
        // 二分法依赖 project()，且 AABB 的角大量落在空白区时会把相机推得过远。
        function frameDistance() {
            var target = currentTarget();
            var t = clamp(S.explode, 0, 1);
            var boxes = collectFrameBoxes(t);

            // 视线方向（从 target 指向相机）
            var sp = Math.sin(cam.phi);
            _fitDir.set(sp * Math.sin(cam.theta), Math.cos(cam.phi), sp * Math.cos(cam.theta)).normalize();
            _fitRight.set(_fitDir.z, 0, -_fitDir.x);
            if (_fitRight.lengthSq() < 1e-6) _fitRight.set(1, 0, 0);
            _fitRight.normalize();
            _fitUp.crossVectors(_fitRight, _fitDir).normalize();

            // 垂直 fov 是基准，水平方向按 aspect 换算；margin 是留边。
            // 1.0 = 刚好贴边，取 0.78 让主体占到画面约 8 成，同时给标注留位置。
            var margin = 0.84;
            var tanV = Math.tan(camera.fov * D2R / 2) * margin;
            var tanH = tanV * Math.max(0.5, camera.aspect);

            var need = 0;
            boxes.forEach(function (box) {
                for (var i = 0; i < 8; i++) {
                    _fitCorner.set(
                        i & 1 ? box.max.x : box.min.x,
                        i & 2 ? box.max.y : box.min.y,
                        i & 4 ? box.max.z : box.min.z
                    );
                    _fitRel.copy(_fitCorner).sub(target);
                    // along: 该角在视线方向上的位置（正 = 比 target 更靠近相机）
                    var along = _fitRel.dot(_fitDir);
                    var x = Math.abs(_fitRel.dot(_fitRight));
                    var y = Math.abs(_fitRel.dot(_fitUp));
                    need = Math.max(need, x / tanH + along, y / tanV + along);
                }
            });
            return Math.max(2.2, need);
        }

        function currentTarget() {
            var box = currentBox();
            var c = box.getCenter(new THREE.Vector3());
            return new THREE.Vector3(0, c.y, 0);
        }

        // 保留：调试/外部查询用
        function sceneSize(e) {
            var box = currentBox(e);
            return box.getSize(new THREE.Vector3());
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

        function onDown(e) {
            if (e.target.closest && e.target.closest('.se-ui, .se-label')) return;
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
                    S.panX -= dx * 0.004 * (cam.radius / 6);
                    S.panY += dy * 0.004 * (cam.radius / 6);
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

        function partByKey(k) {
            for (var i = 0; i < parts.length; i++) if (parts[i].key === k) return parts[i];
            return null;
        }

        function setPartsDim(exceptKey) {
            var dim = exceptKey ? 0.11 : 1;
            parts.forEach(function (p) {
                var opacity = (p.key === exceptKey) ? 1 : dim;
                p.mats.forEach(function (rec) {
                    var m = rec.m;
                    if (opacity < 1 && rec.opacity > 0.9) {
                        m.transparent = true;
                        m.opacity = opacity;
                        m.depthWrite = false;
                    } else if (opacity < 1) {
                        // 本来就是半透明的（玻璃），再压一点就好
                        m.transparent = true;
                        m.opacity = rec.opacity * 0.5;
                        m.depthWrite = false;
                    } else {
                        m.opacity = rec.opacity;
                        m.transparent = rec.transparent;
                        m.depthWrite = rec.depthWrite;
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
            glow.material.opacity = 0.5;
        }

        function selectPart(key, quiet) {
            S.selected = key;
            setPartsDim(key);
            if (key) {
                if (S.explodeTarget < 0.55) S.explodeTarget = 0.94;
                var p = partByKey(key);
                if (p) p.liftTarget = 0.035;
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
                var idx = c.chunk.i;
                var score = map[idx];
                if (score === undefined) {
                    c.mat.emissiveIntensity = 0.18;
                    c.mat.color.copy(c.baseColor);
                } else {
                    var k = maxScore > 0 ? score / maxScore : 0;
                    c.mat.emissiveIntensity = 0.6 + k * 3.4;
                    c.mat.color.copy(c.baseColor).lerp(new THREE.Color(0xffffff), 0.22);
                    byPart[c.partKey] = byPart[c.partKey] || { n: 0, max: 0 };
                    byPart[c.partKey].n++;
                    if (k > byPart[c.partKey].max) byPart[c.partKey].max = k;
                }
            });

            parts.forEach(function (p) {
                if (p.kind !== 'core') { p.hit = 0; p.hitCount = 0; return; }
                var rec = byPart[p.key];
                p.hit = rec ? rec.max : 0;
                p.hitCount = rec ? rec.n : 0;
                p.accent.forEach(function (m) {
                    if (!m || !m.emissive) return;
                    if (!m.userData.baseEmissive) m.userData.baseEmissive = m.emissiveIntensity;
                    m.emissiveIntensity = m.userData.baseEmissive + (rec ? rec.max * 1.4 : 0);
                });
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
            setExplode(0.94);
        }

        /* ---------- 自动巡览 ---------- */

        function tour() {
            stopTour();
            var order = dioramas.map(function (p) { return p.key; });
            if (!order.length) return;
            setExplode(1);
            var i = 0;
            selectPart(order[0]);
            S.tour = global.setInterval(function () {
                i++;
                if (i >= order.length) { stopTour(); return; }
                selectPart(order[i]);
            }, 2600);
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

        var SHELL_ORDER = ['base', 'floor', 'walls', 'roof', 'chimney'];

        function labelDescriptor(p) {
            if (p.kind === 'core') {
                return {
                    badge: 'T' + String(dioramas.indexOf(p) + 1).padStart(2, '0'),
                    name: p.name,
                    meta: p.stat.count + ' 段 · ' + p.stat.chars + ' 字',
                    show: true
                };
            }
            var idx = SHELL_ORDER.indexOf(p.key);
            return {
                badge: 'S' + String(idx + 1).padStart(2, '0'),
                name: p.name,
                meta: (p.specs[0] ? p.specs[0][1] : ''),
                show: S.explode > 0.5
            };
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

            var sides = { left: [], right: [] };
            list.forEach(function (it) {
                sides[it.x > w / 2 ? 'right' : 'left'].push(it);
            });

            ['left', 'right'].forEach(function (side) {
                var arr = sides[side].sort(function (a, b) { return a.y - b.y; });
                var gap = 40;
                var minY = 70, maxY = h - 92;
                var cursor = minY;
                arr.forEach(function (it) {
                    var ly = clamp(Math.max(it.y - 13, cursor), minY, maxY);
                    it.ly = ly;
                    cursor = ly + gap;
                });
                var overflow = cursor - gap - maxY;
                if (overflow > 0) {
                    arr.forEach(function (it) { it.ly = clamp(it.ly - overflow * 0.6, minY, maxY); });
                }
                arr.forEach(function (it) {
                    var cardW = 186;
                    var cardX = side === 'right' ? w - cardW - 14 : 14;
                    var edgeX = side === 'right' ? cardX : cardX + cardW;
                    it.rec.el.style.left = cardX + 'px';
                    it.rec.el.style.top = it.ly + 'px';
                    it.rec.el.style.width = cardW + 'px';
                    it.rec.el.querySelector('.se-label__idx').textContent = it.desc.badge;
                    it.rec.el.querySelector('.se-label__name').textContent = it.desc.name;
                    it.rec.el.querySelector('.se-label__meta').textContent = it.desc.meta;
                    it.rec.el.classList.toggle('is-on', S.selected === it.p.key);
                    it.rec.el.classList.toggle('is-core', it.p.kind === 'core');

                    var midX = side === 'right' ? cardX - 24 : cardX + cardW + 24;
                    it.rec.line.setAttribute('points',
                        it.x.toFixed(1) + ',' + it.y.toFixed(1) + ' ' +
                        midX.toFixed(1) + ',' + it.y.toFixed(1) + ' ' +
                        midX.toFixed(1) + ',' + (it.ly + 12).toFixed(1) + ' ' +
                        edgeX.toFixed(1) + ',' + (it.ly + 12).toFixed(1)
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
        function applyLayout(e) {
            parts.forEach(function (p) {
                p.subs.forEach(function (s) {
                    s.obj.position.copy(s.base).addScaledVector(s.delta, e);
                    if (s.dRot) {
                        s.obj.rotation.set(
                            s.baseRot.x + s.dRot.x * e,
                            s.baseRot.y + s.dRot.y * e,
                            s.baseRot.z + s.dRot.z * e
                        );
                    }
                });
                p.group.position.set(p.basePos.x, p.basePos.y + p.lift, p.basePos.z);
            });
        }

        function idleMotion(t) {
            // 拆解后让机械件动起来：齿轮啮合、滚筒转、悬浮件飘
            dioramas.forEach(function (p) {
                var sp = p.built && p.built.spin;
                if (!sp) return;
                if (sp.gears) {
                    sp.gears[0].rotation.z = t * 0.9;
                    sp.gears[1].rotation.z = -t * 1.3;
                }
                if (sp.rollers) {
                    sp.rollers.forEach(function (r) { r.rotation.y = t * 1.6; });
                }
                if (sp.crate) {
                    sp.crate.position.z = Math.sin(t * 0.8) * 0.035;
                }
                if (sp.obj) {
                    if (sp.axis === 'y') sp.obj.rotation.y = t * (sp.speed || 0.6);
                    else sp.obj.rotation.x = t * (sp.speed || 0.6);
                }
            });
        }

        function step(dt) {
            var k = reduceMotion ? 1 : 1 - Math.exp(-dt * 6.4);

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
            });

            applyLayout(S.explode);

            // 拆开后屋里的机械件持续动作，这时必须逐帧渲染
            if (S.explode > 0.35 && !reduceMotion) {
                S.clock += dt;
                idleMotion(S.clock);
                S.dirty = true;
            }

            updateCamera();

            if (S.dirty) {
                renderer.render(scene, camera);
                updateLabels();
                S.dirty = false;
            }
        }

        function tick(now) {
            if (!S.running) return;
            var dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
            lastTime = now;

            step(dt);

            // 是否还有必要继续画：拆解中 / 相机在动 / 自转 / 机械件在转
            var busy =
                Math.abs(S.explode - S.explodeTarget) > 0.0004 ||
                Math.abs(cam.theta - cam.targetTheta) > 0.0002 ||
                Math.abs(cam.phi - cam.targetPhi) > 0.0002 ||
                S.spin ||
                (S.explode > 0.35 && !reduceMotion) ||
                parts.some(function (p) { return Math.abs(p.liftTarget - p.lift) > 0.0002; });

            if (!busy) {
                S.idleTime += dt;
                if (S.idleTime > 1.0) { S.running = false; S.dirty = true; return; }
            } else {
                S.idleTime = 0;
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

        function resolveSize() {
            var w = stage.clientWidth;
            if (!w) {
                requestAnimationFrame(resolveSize);
                return;
            }
            resize();
            applyLayout(S.explode);
            updateCamera();
            renderer.render(scene, camera);
            updateLabels();
            onReady({ parts: listParts() });
            requestAnimationFrame(tick);
        }

        function listParts() {
            return parts.map(function (p) {
                return {
                    key: p.key,
                    name: p.name,
                    kind: p.kind,
                    index: p.index,
                    color: p.color,
                    form: p.form,
                    desc: p.desc,
                    specs: p.specs,
                    stat: p.stat,
                    hitCount: p.hitCount || 0,
                    badge: p.kind === 'core'
                        ? 'T' + String(dioramas.indexOf(p) + 1).padStart(2, '0')
                        : 'S' + String(SHELL_ORDER.indexOf(p.key) + 1).padStart(2, '0')
                };
            });
        }

        resolveSize();

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
            cam.targetTheta = 0.62;
            cam.targetPhi = 1.04;
            S.spin = false;
            S.clock = 0;
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
                var c = cells.filter(function (x) { return x.chunk.i === idx; })[0];
                if (c) {
                    selectPart(c.partKey, true);
                    selectChunk(idx);
                }
            },
            listParts: listParts,
            setExplode: setExplode,
            toggleExplode: toggleExplode,
            focusPart: focusPart,
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
            dioramas: dioramas,
            _dbg: function () {
                var box = currentBox();
                var size = box.getSize(new THREE.Vector3());
                return {
                    fov: camera.fov,
                    pos: camera.position.toArray().map(function (n) { return +n.toFixed(2); }),
                    radius: +cam.radius.toFixed(2),
                    explode: +S.explode.toFixed(3),
                    size: [+size.x.toFixed(2), +size.y.toFixed(2), +size.z.toFixed(2)],
                    aspect: +camera.aspect.toFixed(3)
                };
            }
        };
    }

    global.SSEngine = { create: create };
})(window);
