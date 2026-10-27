# 内容小屋 · pages/semantic-space.html

> 把自己的 AI 工程笔记切成语义片段，向量化后装进一间可以拆开的三维小屋；提一个问题，看得见检索把哪些片段点亮、又怎么被塞进有限的上下文窗口。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/semantic-space.html`](../../../pages/semantic-space.html) |
| 线上路径 | `/pages/semantic-space.html` |
| 页面类型 | 可视化 / 数据实验（Three.js + 离线向量数据） |
| `<title>` | 内容小屋 · 把知识装进一间能拆开的房子 \| 陈柏贤 |
| 样式文件 | [`css/semantic-space.css`](../../../css/semantic-space.css)（`ss-` 前缀，独立令牌；深色科技底） |
| 脚本文件 | [`js/semantic-space.js`](../../../js/semantic-space.js)（数据索引 / 检索 / 面板 / 装配）、[`js/semantic-engine.js`](../../../js/semantic-engine.js)（三维小屋） |
| 第三方库 | [`js/vendor/three/three.min.js`](../../../js/vendor/three/three.min.js)（Three.js r149 UMD，本地 vendor，608 KB） |
| 数据文件 | [`data/semantic-space/space.js`](../../../data/semantic-space/space.js)（`window.SS_DATA`）、`space.json`（同内容，供工具读取） |
| 数据管线 | [`script/build-semantic-space.py`](../../../script/build-semantic-space.py)（纯标准库，可离线重跑） |
| 语料来源 | `pages/AI.html` 的 35 条知识卡 + `index.html` 的 6 个项目案例，共 41 份 |
| 规模 | 78 个片段 · 词表 2429 维 · 7 个主题展台 · 5 个结构壳 · 12 个预设问题 |
| 访问控制 | 无 |
| 文档更新 | 2026-10-26 |

## 2. 页面定位

- **给谁看**：面试官、技术同行，以及想弄清「向量检索到底在做什么」的人。
- **核心任务**：把抽象的 RAG 检索过程变成可以转、可以拆、可以点的实物——哪几段被召回、它们为什么被召回、装进上下文时谁被挤掉。
- **不做什么**：不演示生成。静态站跑不了真模型，硬编一段「AI 回答」没有意义，页面上明确写了这条边界。
- **与其他页面的关系**：数据来自知识手册（`AI.html`）与项目案例（`index.html`），但这一页不复述内容，只展示它们之间的空间关系。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 跳转链接 | `.skip-link` | 跳到主内容 | 第 12 行 |
| 2 | 顶栏 | `.ss-top` | 返回首页、「内容小屋 / CONTENT HOUSE」、右侧 `41 DOCS / 78 CHUNKS / 7 DIORAMAS` | 第 15–19 行 |
| 3 | 首屏 | `.ss-hero` | 眉题、标题、说明、右侧 2×2 统计（41 / 78 / 2429 / 7） | 第 22–39 行 |
| 4 | 三维舞台 | `.ss-rig` `#ssStage` `#ssCanvas` | Three.js 小屋、标注层、HUD、状态条、工具条、部件清单、引导卡、加载态 | 第 41–84 行 |
| 5 | 检索带 | `.ss-search` | 左查询卡 + 右面板两栏 | 第 86 行 |
| 6 | 查询卡 | `.ss-query` `#ssForm` | 输入框、向量 / BM25 模式切换、12 个预设问题 +「看另外 6 个问题」、命中分布 | 第 87–105 行 |
| 7 | 召回列表 | `.ss-results` `#ssResultList` | 排名、标题、分数、摘要、主题 | 第 107–113 行 |
| 8 | 片段详情 | `.ss-detail` `#ssDetail` | 选中后替换召回列表：主题、标题、相似度、字数 / token、原文、原文链接 | 第 115–130 行 |
| 9 | 部件详情 | `.ss-part` `#ssPart` | 部件编号、名称、形态、描述、参数表、所属片段、原文链接 | 第 132–144 行 |
| 10 | 上下文装配 | `.ss-context` | 窗口预算滑块、8 条槽位、溢出划掉、合计说明 | 第 147–159 行 |
| 11 | 方法说明 | `.ss-method` | 四步管线 + 参数说明 + 边界与取舍 | 第 161–217 行 |
| 12 | 页脚 | `.ss-foot` | 版权与「继续看项目案例」 | 第 219–222 行 |

## 4. 布局

- **容器**：`.ss-main` `width: min(1180px, calc(100% - 56px))` 居中。
- **首屏**：`grid-template-columns: minmax(0,1fr) 300px`，`align-items: end`，`padding: 52px 0 30px`。
- **三维舞台**：`.ss-stage` 固定 `640px`；`overflow: hidden`，`touch-action: none`。
- **检索带**：`grid-template-columns: 372px minmax(0, 1fr)`，`gap: 18px`；右面板固定 `470px`，内部 `flex` 分三段，召回列表 `flex: 1` 内部滚动。
- **舞台浮层**：HUD 左上（`top:16 left:20`）；部件清单左侧（`left:14 top:96`，宽 `180px`，`max-height: calc(100% - 190px)`）；状态条底部居中（`bottom:66`）；工具条底部居中（`bottom:15`）；引导卡右下（`right:16 bottom:62`）。z-index 依次为标注 3、HUD/清单/状态 4、工具条/提示 5、加载 6、引导 7。
- **上下文装配**：整宽卡片，`grid` 行高 8 条；槽位 `grid-template-columns: 18px minmax(0,1fr) 54px`。
- **方法说明**：四步 `grid-template-columns: repeat(4, minmax(0,1fr))`，用 1px 间隙形成分隔线；参数说明两列；`.ss-limits` 为 `132px + 1fr` 两列。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `--ss-bg` | `#070c12` |
| 纸面 | `--ss-paper` | `#0a1119` |
| 卡片表面 | `--ss-surface` | `#0e1722` |
| 凹陷底（输入框、模式切换） | `--ss-sink` | `#0b1420` |
| 正文 | `--ss-ink` | `#e6eef6` |
| 次要文字 | `--ss-muted` | `#93a7b8` |
| 极弱标注 | `--ss-faint` | `#6b8092` |
| 描边 | `--ss-line` | `rgba(140,180,205,.16)` |
| 主色（发光、命中、主按钮） | `--ss-primary` | `#4ff0dc` |
| 辅色 | `--ss-secondary` | `#7fb4ff` |
| 溢出 / 丢弃 | `--ss-warn` | `#ff8a6b` |
| 主题色 · 提示词 | `--ss-c-prompts` | `#4f7ef0` |
| 主题色 · 代理规则 | `--ss-c-rules` | `#35b3a6` |
| 主题色 · 软件设计 | `--ss-c-design` | `#c39a52` |
| 主题色 · 智能体开发 | `--ss-c-agent` | `#9a7ec0` |
| 主题色 · 自动化工作流 | `--ss-c-automation` | `#9dae4e` |
| 主题色 · 产品分析 | `--ss-c-product` | `#6f92a6` |
| 主题色 · 项目实践 | `--ss-c-project` | `#d1745a` |

> 主题色的 7 个键与数据里的 `chunks[].c` 一一对应；改键值要同步 `js/semantic-space.js` 的 `COLORS` 与 `script/build-semantic-space.py` 的 `CATEGORY_CN`。暗底上必须用提亮后的色值，否则模型会暗成一团。

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(30px, 4vw, 47px)` / 650 | 关键词数字用主色 + `text-shadow` 发光 |
| 区块标题 | 22px / 650 | `.ss-method h2` |
| 面板标题 | 12–16px / 600 | 查询卡、召回列表头、部件名 |
| 正文 | 12–13.5px，行高 1.7–1.85 | 详情原文保留换行 |
| 等宽标注 | `--ss-mono` 9–11px | 分数、token、编号、参数 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 舞台圆角 | `--ss-r-lg` 18px |
| 卡片圆角 | `--ss-r-md` 12px |
| 控件圆角 | `--ss-r-sm` 8px |
| 胶囊 | `999px`（工具按钮、模式切换、预设问题、状态条） |
| 卡片阴影 | `0 1px 0 rgba(255,255,255,.04) inset, 0 18px 44px rgba(0,0,0,.46)` |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 拆解补间 | 点房子 / 工具条 | 每帧 `explode += (target - explode) × (1 - e^(-dt×6.4))`，`prefers-reduced-motion` 下瞬时 |
| 机械件运转 | 拆解 > 0.35 时 | 齿轮啮合、滚筒转、悬浮环自转、货箱滑动；因此拆解态逐帧渲染 |
| 相机阻尼 | 拖拽 / 滚轮 / 键盘 | `lerp 0.16`，`prefers-reduced-motion` 下改为瞬时 |
| 自转 | 手动开关 | 每帧 `theta += dt × 0.16`；≤760px 隐藏该按钮 |
| 命中发光 | 检索 / 悬停 / 选中 | 灯条 `emissive 0.18 → 0.6 + k×3.4`；部件高亮同步 +1.4 |
| 详情切换 | 选中片段 / 部件 | `ss-rise` 220ms 上浮淡入 |
| 加载态 | 首次进入 | 转圈 + `BUILDING GEOMETRY`，数据就绪后移除 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 三维引擎入口 | `SSEngine.create()` | 创建 renderer / scene / camera，程序化生成全部几何与材质 |
| 结构壳 | `buildBase()` `buildFloor()` `buildWalls()` `buildRoof()` `buildChimney()` | 5 个 shell 部件，各自的位移方向写在 `delta` / `dRot` 里 |
| 主题展台 | `DIO.rules/prompts/design/agent/automation/product/project()` | 7 个专属形态；返回 `{ group, anchorY, accent, spin }` |
| 展台布置 | `buildDioramas()` | 7 个展台按环均匀排在 `RING_R = 0.78` 的圆上，`inner.rotation.y` 朝向圆心 |
| 片段灯条 | `buildCells()` | 每个展台背部一根竖列，段数 = 该主题片段数，合计 78 道 |
| 部件注册 | `registerPart()` | 统一管理 `subs`（可独立位移的子对象）与 `mats`（可调透明度的材质） |
| 布局应用 | `applyLayout(e)` | 按拆解进度 `e` 插值每个 sub 的 `position` 与 `rotation` |
| 包围盒 | `collectFrameBoxes()` `boundsBoxAt()` | 收集「真实」子包围盒；避免联合 AABB 造出幽灵角 |
| 相机取景 | `frameDistance()` | 解析法：把每个子包围盒 8 角投到相机基上直接解算半径，`margin 0.84` |
| 轨道相机 | `updateCamera()` `cam` | 自写球坐标相机，无 addons 依赖 |
| 坐标拾取 | `pickAt()` `raycaster` | 射线拾取，优先返回片段灯条再返回部件 |
| 选中描边 | `buildOutline()` | `EdgesGeometry` 描边，`userData.noOutline` 的灯条跳过 |
| 选中光晕 | `buildGlow()` | Sprite + 径向纹理，跟随部件包围盒尺寸 |
| 部件清单 | `renderInventory()` `syncInventory()` | 左下常驻，分「结构壳 / 主题展台」两组，点击跳转选中 |
| 标注层 | `ensureLabel()` `updateLabels()` | DOM 叠层 + SVG 引线；左右分列按 y 排序避让 |
| 主题形态表 | `TOPIC_FORM` | 每个主题的形态名与设计说明，同时喂给部件详情面板 |
| 结构壳文案 | `SHELL_META` | 5 个 shell 的 `name` / `desc` / `specs` |
| 预设问题 | `renderPresets()` `runPreset()` | 12 个，默认显示 6 个，`#ssMore` 展开 |
| BM25 检索 | `buildBM25()` `bm25Search()` | `k1=1.2 b=0.62`，返回命中词数 / 查询词数 |
| 中文分词 | `tokenize()` | 汉字相邻二字 + 英文按词，与离线脚本保持一致 |
| 上下文装配 | `renderWindow()` `tokensOf()` | `1 token ≈ 1.6 汉字 + 4`，按分数顺序累加，超出标 `is-dropped` |
| 结构降级 | `fallback()` | 无 WebGL 时用 SVG 画 7 个主题的片段分布剖面 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回首页 | ↖ 返回首页 | `.ss-back` | 跳转 | `../index.html` |
| 拆开 / 合上房子 | 拆开房子 / 合上房子 | `#ssExplode` | 切换拆解状态（`aria-pressed`） | 本页 |
| 自动演示 | 自动演示 | `#ssTour` | 逐个展台选中巡览 | 本页 |
| 标注 | 标注 | `#ssLabels` | 开关标注层（`aria-pressed`） | 本页 |
| 自转 | 自转 | `#ssSpin` | 开关自动旋转（`aria-pressed`） | 本页 |
| 复位 | 复位 | `#ssReset` | 相机回默认角度、合上、取消选中 | 本页 |
| 部件清单项 | 基座 / 地板 / … / 代理规则 / … | `.ss-inv__item` | 选中该部件并拆解、右侧显示参数 | 本页 |
| 检索 | 检索 | `.ss-go` | 提交输入框内容 | 本页 |
| 召回模式 | 向量相似 / 关键词 BM25 | `[data-mode]` | 切换召回方式 | 本页 |
| 预设问题 | 12 个问题 | `.ss-chip` | 用离线向量召回 | 本页 |
| 展开问题 | 看另外 6 个问题 / 收起问题 | `#ssMore` | 显示或隐藏后 6 个 | 本页 |
| 召回条目 | 标题 / 分数 / 摘要 | `.ss-hit` | 选中片段并替换右侧为详情 | 本页 |
| 返回列表 | ← 返回召回列表 | `#ssDetailClose` `#ssPartClose` | 关闭详情 / 部件面板 | 本页 |
| 原文链接 | 在原文里查看 ↗ | `#ssDetailLink` `#ssPartLink` | 按主题跳到 `AI.html#prompts` 等锚点；项目实践跳 `index.html#projects` | 新窗口 |
| 部件内片段 | `#01 标题` | `.ss-part-chunks li` | 选中该片段并在屋里定位 | 本页 |
| 预算滑块 | 窗口预算 | `#ssBudget` | 120–480 tokens，步长 20 | 本页 |
| 引导关闭 | 开始探索 | `#ssGuideOk` | 关闭并写 `localStorage['ss-guide-seen']` | 本页 |
| 页脚 | 继续看项目案例 ↗ | `.ss-foot a` | 跳转 | `../index.html#projects` |

## 8. 交互与状态

- **进入页面**：加载数据 → 建场景 → 520ms 后自动跑第 1 个预设问题，让空间立刻有意义。
- **点击舞台**：点到空白处取消选中；点到片段灯条先选部件再选片段；点到其他部件直接选部件。
- **选中部件**：若拆解度 < 0.55 会自动推到 0.94；被选部件上浮 `0.035`，其余部件材质透明度降到 `0.11` 并加描边 + 光晕。
- **相机**：拖拽旋转（`theta/phi`）、滚轮缩放（0.5–1.9 倍）、右键或 Shift 平移；舞台获得焦点后方向键旋转、`+/-` 缩放、`Esc` 取消选中 / 复位。
- **召回**：命中灯条按 `0.6 + k×3.4` 提亮并混白；未命中降到 `0.18`；部件高亮在 `userData.baseEmissive` 基础上 +1.4。
- **自由输入**：没有预计算向量，自动降级为 BM25，并在舞台底部提示「非预计算向量」；若输入正好等于某个预设问题，直接走真向量。
- **模式切换**：从「关键词」切回「向量且当前是预设问题」时，重新跑真向量；否则按当前输入走 BM25。
- **装配**：按分数顺序累加 token；放不下的条目标 `is-dropped`（虚线框 + 删除线 + `×`），底部实时显示「装入 / 用掉 / 丢弃」。
- **性能**：合上且静止 1 秒后停帧；拆解 > 0.35 时机械件持续运转所以逐帧渲染；像素比上限 2。
- **空态**：无召回时列表给出「换一种说法，或切到另一个召回模式」；未查询时提示「还没有检索」。
- **无障碍**：舞台 `role="group"` + 文字说明；按钮全部 `aria-pressed`；部件清单与召回列表是等价的键盘入口，canvas 不承载内容文本。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1160px` | 检索带改 `340px + 1fr` |
| `max-width: 1080px` | 检索带单列；舞台 580px；首屏单栏、统计卡最宽 420px；参数说明改单列 |
| `max-width: 880px` | 舞台 520px；工具条收紧；部件清单收窄到 156px |
| `max-width: 760px` | 容器 32px 边距；顶栏 54px、隐藏右侧技术标注；舞台 470px；部件清单变底部横向一行（`max-height: 34px`，隐藏 meta）；状态条上移到 `bottom: 100px`；隐藏「自转」；标注降为紧凑卡；四步改 2 列 |
| `max-width: 420px` | 四步改单列；工具条撑满并均分；参数说明单列 |
| `prefers-reduced-motion` | 关闭拆解补间、相机阻尼、自转与机械件运转，缩短加载动画 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 语料范围（多收哪些页） | `script/build-semantic-space.py` 的 `parse_cards()` / `parse_projects()` |
| 切块粒度（片段多少） | 同文件 `chunk_doc()` 的 `min_len / target / hard_max` |
| 预设问题 | 同文件 `PRESET_QUERIES`，改完必须重跑脚本 |
| 三维布局 | 同文件 `layout()` / `normalize_coords()`；`mode` 可选 `whiten` / `scaled` |
| 主题颜色 | `css/semantic-space.css` 的 `--ss-c-*` + `js/semantic-space.js` 的 `COLORS`（两处必须一致） |
| 房子尺寸 | `js/semantic-engine.js` 顶部常量 `HX / HZ / T / WALL_H / EAVE_Y / RIDGE_Y` |
| 拆解站位 | 同文件 `RING_R / RING_SCALE / RING_Y / BASE_DY / FLOOR_DY / WALLS_DY / WALLS_OUT / ROOF_DY / CHIM_DY` |
| 展台形态与文案 | 同文件 `DIO`（形态建造）与 `TOPIC_FORM`（形态名 + 设计说明） |
| 结构壳文案 | 同文件 `SHELL_META` |
| 首屏文案与统计 | `pages/semantic-space.html` 的 `.ss-hero`；数字由 `data-stat` 从数据回填 |
| 参数说明与边界 | 同文件 `.ss-spec` 与 `.ss-limits` |
| 窗口预算默认值 | HTML 的 `#ssBudget` `value` 与 `js/semantic-space.js` 的 `state.budget` |
| 重新生成数据 | `python script/build-semantic-space.py` |

## 11. 修改须知

- **关联文件**：`pages/semantic-space.html`、`css/semantic-space.css`、`js/semantic-space.js`、`js/semantic-engine.js`、`js/vendor/three/three.min.js`、`data/semantic-space/space.js`、`script/build-semantic-space.py`。
- **数据不要手改**：`space.js` / `space.json` 由脚本生成，文件头已标注；改了会被下次重跑覆盖。
- **Three.js 版本**：当前 r149 的 UMD 构建，走 `<script>` 全局 `THREE`，**不是** ES module——这样 `file://` 直开也能跑。换版本要确认还有 `build/three.min.js`，并且控制台没有弃用警告。
- **不要引 addons**：相机、拾取、网格全部自己实现，避免 importmap 与 file:// 的 CORS 问题。
- **拆解不能穿模**：屋顶抬升量必须让屋面最低点高于展台最高点（当前 2.64 > 2.21）。改 `RING_Y`、`ROOF_DY` 或展台高度后，必须重新核对这条；`explode=1` 时的层级关系是这页的硬约束。
- **取景不要退回二分法**：`frameDistance()` 用解析法逐「真实子包围盒」解算。若退回「联合 AABB 8 角 + project 二分」，拆解态会被幽灵角推远，模型缩成一小块——这是已经踩过的坑。
- **机械件运转与停帧**：`tick()` 里 `S.explode > 0.35` 会强制逐帧渲染，因为齿轮在转。把这段删掉，拆解后机械件会卡住。
- **数字一致性**：首屏 `78` / `41` / `2429` 来自数据，改语料后页面会自动变；但 `.ss-lede` 里的「41 份笔记与项目案例」是写死的，要一起改。
- **诚实边界**：向量是 TF-IDF + SVD（LSA），不是神经 embedding；页面上这条说明不能删，否则等于虚假宣传。
- **必须同步**：本文件 + [`docs/design/README.md`](../README.md) 页面索引 + [`docs/change.md`](../../change.md) 的「语义空间」章节。
