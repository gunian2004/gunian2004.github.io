# 语义空间 · pages/semantic-space.html

> 把自己的 AI 工程笔记切成语义片段，向量化后摊成一片可旋转的三维空间；提一个问题，看得见检索把哪些片段点亮、又怎么被塞进有限的上下文窗口。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/semantic-space.html`](../../../pages/semantic-space.html) |
| 线上路径 | `/pages/semantic-space.html` |
| 页面类型 | 可视化 / 数据实验（Three.js + 离线向量数据） |
| `<title>` | 语义空间 · 一次检索发生在哪里 \| 陈柏贤 |
| 样式文件 | [`css/semantic-space.css`](../../../css/semantic-space.css)（`ss-` 前缀，独立令牌） |
| 脚本文件 | [`js/semantic-space.js`](../../../js/semantic-space.js)（场景 / 相机 / 检索 / 装配） |
| 第三方库 | [`js/vendor/three/three.min.js`](../../../js/vendor/three/three.min.js)（Three.js r149 UMD，本地 vendor，608 KB） |
| 数据文件 | [`data/semantic-space/space.js`](../../../data/semantic-space/space.js)（`window.SS_DATA`）、`space.json`（同内容，供工具读取） |
| 数据管线 | [`script/build-semantic-space.py`](../../../script/build-semantic-space.py)（纯标准库，可离线重跑） |
| 语料来源 | `pages/AI.html` 的 35 条知识卡 + `index.html` 的 6 个项目案例，共 41 份 |
| 规模 | 78 个片段 · 词表 2429 维 · 7 个主题 · 12 个预设问题 |
| 访问控制 | 无 |
| 文档更新 | 2026-10-25 |

## 2. 页面定位

- **给谁看**：面试官、技术同行，以及想弄清「向量检索到底在做什么」的人。
- **核心任务**：把抽象的 RAG 检索过程变成可以转、可以点、可以对照的实物——哪几段被召回、它们为什么被召回、装进上下文时谁被挤掉。
- **不做什么**：不演示生成。静态站跑不了真模型，硬编一段「AI 回答」没有意义，页面上明确写了这条边界。
- **与其他页面的关系**：数据来自知识手册（`AI.html`）与项目案例（`index.html`），但这一页不复述内容，只展示它们之间的空间关系。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 跳转链接 | `.skip-link` | 跳到主内容 | 第 11 行 |
| 2 | 顶栏 | `.ss-top` | 返回首页、「语义空间 / SEMANTIC FIELD」、右侧 `TF-IDF → SVD → COSINE` | 第 14–18 行 |
| 3 | 首屏 | `.ss-hero` | 眉题、标题、说明、右侧 2×2 统计（41 / 78 / 2429 / 3 DIM） | 第 22–37 行 |
| 4 | 工作区 | `.ss-workspace` | 左侧场景 + 右侧面板两栏 | 第 39 行 |
| 5 | 三维场景 | `#ssStage` `#ssCanvas` | Three.js 点云、地面网格、命中连线、编号标签、图例、工具按钮 | 第 40–66 行 |
| 6 | 平面视图 | `#ssFlat` | 同数据的 SVG 散点，WebGL 不可用或手动切换时使用 | 第 43 行 |
| 7 | 查询卡 | `.ss-query` `#ssForm` | 输入框、向量 / BM25 模式切换、6 个预设问题 +「看另外 6 个问题」 | 第 69–83 行 |
| 8 | 召回列表 | `.ss-results` `#ssResultList` | 排名、标题、分数、摘要、主题 | 第 84–91 行 |
| 9 | 片段详情 | `.ss-detail` `#ssDetail` | 选中后替换召回列表：主题、标题、相似度、字数 / token、原文、原文链接 | 第 92–107 行 |
| 10 | 上下文装配 | `.ss-context` | 窗口预算滑块、8 条槽位、溢出划掉、合计说明 | 第 109–123 行 |
| 11 | 方法说明 | `.ss-method` | 四步管线 + 边界与取舍 | 第 125–161 行 |
| 12 | 页脚 | `.ss-foot` | 版权与「继续看项目案例」 | 第 163–166 行 |

## 4. 布局

- **容器**：`.ss-main` `width: min(1180px, calc(100% - 56px))` 居中。
- **首屏**：`grid-template-columns: minmax(0,1fr) 300px`，`align-items: end`，`padding: 66px 0 40px`。
- **工作区**：`grid-template-columns: minmax(0,1fr) 372px`，`gap: 18px`。
- **场景高度**：`.ss-stage` 固定 `660px`；`.ss-panel` 同样 `660px`，内部 `flex` 分三段（查询卡 / 结果或详情 / 自适应），结果列表 `flex: 1` 内部滚动，页面不因 24 条结果被拉长。
- **上下文装配**：整宽卡片，`grid` 行高 8 条；槽位 `grid-template-columns: 18px 132px minmax(0,1fr) 54px`。
- **方法说明**：四步 `grid-template-columns: repeat(4, minmax(0,1fr))`，用 1px 间隙形成分隔线；下方 `.ss-limits` 为 `132px + 1fr` 两列。
- **层级**：页内无弹窗；场景内浮层 z-index 依次为图例 3、编号 4、提示 5、加载 6。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `--ss-paper` | `#f4f2ed` |
| 卡片表面 | `--ss-surface` | `#fffefa` |
| 凹陷底（模式切换、代码） | `--ss-sink` | `#eeece5` |
| 正文 | `--ss-ink` | `#172433` |
| 次要文字 | `--ss-muted` | `#66727d` |
| 极弱标注 | `--ss-faint` | `#8f979f` |
| 描边 | `--ss-line` | `rgba(23,36,51,.12)` |
| 主色（命中连线、主按钮） | `--ss-primary` | `#315ce8` |
| 辅色（分数） | `--ss-secondary` | `#287e79` |
| 溢出 / 丢弃 | `--ss-warn` | `#a8472f` |
| 主题色 · 提示词 | `--ss-c-prompts` | `#315ce8` |
| 主题色 · 代理规则 | `--ss-c-rules` | `#2b7d78` |
| 主题色 · 软件设计 | `--ss-c-design` | `#8a6a2f` |
| 主题色 · 智能体开发 | `--ss-c-agent` | `#6b4a86` |
| 主题色 · 自动化工作流 | `--ss-c-automation` | `#6f7f2a` |
| 主题色 · 产品分析 | `--ss-c-product` | `#4a6472` |
| 主题色 · 项目实践 | `--ss-c-project` | `#a8472f` |

> 主题色的 7 个键与数据里的 `chunks[].c` 一一对应；改键值要同步 `js/semantic-space.js` 的 `COLORS` 与 `script/build-semantic-space.py` 的 `CATEGORY_CN`。

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(30px, 4vw, 47px)` / 650 | 关键词数字用主色 + 等宽数字 |
| 区块标题 | 22px / 650 | `.ss-method h2` |
| 面板标题 | 12–14px / 600 | 查询卡、召回列表头 |
| 正文 | 13–13.5px，行高 1.85 | 详情原文保留换行 |
| 等宽标注 | `--ss-mono` 10–11px | 分数、token、`SPACE / 3D`、步骤号 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 场景圆角 | `--ss-r-lg` 20px |
| 卡片圆角 | `--ss-r-md` 14px |
| 控件圆角 | `--ss-r-sm` 9px |
| 胶囊 | `999px`（工具按钮、模式切换、预设问题） |
| 卡片阴影 | `0 1px 2px rgba(27,39,52,.045), 0 12px 32px rgba(27,39,52,.06)` |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 相机阻尼 | 拖拽 / 滚轮 / 键盘 | `lerp 0.12`，`prefers-reduced-motion` 下改为瞬时 |
| 自转 | 静止 4.2 秒后 | 每帧 `theta += 0.0011`，可手动关闭；≤760px 隐藏该按钮 |
| 点云状态过渡 | 检索 / 悬停 / 选中 | 缩放与透明度即时切换，无补间，避免 78 个 sprite 同时补间 |
| 详情切换 | 选中片段 | `ss-rise` 220ms 上浮淡入 |
| 加载态 | 首次进入 | 转圈 + `LOADING VECTORS`，数据就绪后移除 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 三维场景 | `initThree()` | 创建 renderer / scene / camera / sprites，`setPixelRatio(min(dpr,2))` |
| 圆形点精灵 | `dotTexture()` `baseScale()` | 64×64 Canvas 纹理，半径按片段长度分 3 档（`chunks[].k`） |
| 环状高亮 | `ringTexture()` `T.ring` | 悬停半透明、选中 0.85 不透明 |
| 地面网格 | `THREE.GridHelper(2.9, 12)` | `y = -1.02`，透明度 0.06，只作纵深参照 |
| 轨道相机 | `stepCamera()` `T.camTarget` | 自写球坐标相机，无 addons 依赖 |
| 坐标拾取 | `pick()` `T.raycaster` | sprite 射线拾取，供悬停与点击 |
| 命中连线 | `drawLines()` | 距离 >0.95 的点画成 7 段虚线，提示「排序靠前但视觉远」 |
| 编号标签 | `renderTags()` `placeTags()` | DOM 叠层，桌面 5 个、窄屏 3 个，逐帧投影定位 |
| 平面视图 | `buildFlat()` `syncFlat()` | SVG 散点 + 连线，同一份坐标取 x / -y |
| 预设问题 | `renderPresets()` `runPreset()` | 12 个，默认显示 6 个，`#ssMore` 展开 |
| BM25 检索 | `buildBM25()` `bm25Search()` | `k1=1.2 b=0.62`，返回命中词数 / 查询词数 |
| 中文分词 | `tokenize()` | 汉字相邻二字 + 英文按词，与离线脚本保持一致 |
| 上下文装配 | `renderWindow()` `tokensOf()` | `1 token ≈ 1.6 汉字 + 4`，按分数顺序累加，超出标 `is-dropped` |
| 视图切换 | `setView()` | 3D / 平面；SVG 用 `removeAttribute('hidden')` 而非 `.hidden` |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回首页 | ↖ 返回首页 | `.ss-back` | 跳转 | `../index.html` |
| 视图切换 | 立体 / 平面 | `[data-view]` | 切换 WebGL 与 SVG 视图 | 本页 |
| 自转 | 自转 | `#ssSpin` | 开关自动旋转（`aria-pressed`） | 本页 |
| 复位 | 复位 | `#ssReset` | 相机回默认角度并取消选中 | 本页 |
| 检索 | 检索 | `.ss-go` | 提交输入框内容 | 本页 |
| 召回模式 | 向量相似 / 关键词 BM25 | `[data-mode]` | 切换召回方式 | 本页 |
| 预设问题 | 12 个问题 | `.ss-chip` | 用离线向量召回 | 本页 |
| 展开问题 | 看另外 6 个问题 / 收起问题 | `#ssMore` | 显示或隐藏后 6 个 | 本页 |
| 召回条目 | 标题 / 分数 / 摘要 | `.ss-hit` | 选中片段并替换右侧为详情 | 本页 |
| 返回列表 | ← 返回召回列表 | `#ssDetailClose` | 关闭详情 | 本页 |
| 原文链接 | 在原文里查看 ↗ | `#ssDetailLink` | 按主题跳到 `AI.html#prompts` 等锚点；项目实践跳 `index.html#projects` | 新窗口 |
| 预算滑块 | 窗口预算 | `#ssBudget` | 120–480 tokens，步长 20 | 本页 |
| 页脚 | 继续看项目案例 ↗ | `.ss-foot a` | 跳转 | `../index.html#projects` |

## 8. 交互与状态

- **进入页面**：加载数据 → 建场景 → 420ms 后自动跑第 1 个预设问题，让空间立刻有意义。
- **相机**：拖拽旋转（`theta/phi`）、滚轮缩放（1.9–7.2）、双击复位；舞台获得焦点后方向键旋转、`+/-` 缩放、`Esc` 取消选中。
- **悬停**：sprite 射线拾取 → 点放大 1.22 倍 + 深色提示框；移出恢复。
- **召回**：命中点放大到 `1.28 + score×0.55`，未命中降到 0.32 不透明度并转灰，其余连线从查询落点拉出。
- **查询落点**：预设问题用离线算好的加权位置；自由输入用 Top 8 命中的 `score²` 加权重心——因为查询本身不在文档空间里。
- **自由输入**：没有预计算向量，自动降级为 BM25，并在舞台底部提示「非预计算向量」；若输入正好等于某个预设问题，直接走真向量。
- **模式切换**：从「关键词」切回「向量且当前是预设问题」时，重新跑真向量；否则按当前输入走 BM25。
- **详情**：选中后 `.ss-panel` 加 `is-detail` 隐藏列表、显示详情卡；`Esc` 或「返回召回列表」恢复。
- **装配**：按分数顺序累加 token；放不下的条目标 `is-dropped`（虚线框 + 删除线 + `×`），底部实时显示「装入 / 用掉 / 丢弃」。
- **空态**：无召回时列表给出「换一种说法，或切到另一个召回模式」；未查询时提示「还没有检索」。
- **无障碍**：场景 `role="group"` + 文字说明「右侧列表是同等的文字入口」；按钮全部 `aria-pressed`；召回列表是真正的键盘路径，canvas 不承载内容文本。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1080px` | 工作区改单列；面板高度自动、结果列表最高 340px；首屏单栏、统计卡最宽 420px；场景 540px |
| `max-width: 760px` | 容器 32px 边距；顶栏 54px、隐藏右侧技术标注；场景 460px；工具按钮缩小并隐藏「自转」；角标限宽 34%；图例压到 2 行；编号标签降到 3 个；槽位隐藏标题列、只留正文；四步改 2 列；详情最小 420px |
| `max-width: 420px` | 四步改单列 |
| `prefers-reduced-motion` | 关闭相机阻尼、自转与详情动效，缩短加载动画 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 语料范围（多收哪些页） | `script/build-semantic-space.py` 的 `parse_cards()` / `parse_projects()` |
| 切块粒度（片段多少） | 同文件 `chunk_doc()` 的 `min_len / target / hard_max` |
| 预设问题 | 同文件 `PRESET_QUERIES`，改完必须重跑脚本 |
| 三维布局 | 同文件 `layout()` / `normalize_coords()`；`mode` 可选 `whiten` / `scaled` |
| 主题颜色 | `css/semantic-space.css` 的 `--ss-c-*` + `js/semantic-space.js` 的 `COLORS`（两处必须一致） |
| 首屏文案与统计 | `pages/semantic-space.html` 的 `.ss-hero`；数字由 `data-stat` 从数据回填 |
| 方法说明与边界 | 同文件 `.ss-method` 的四步与 `.ss-limits` |
| 窗口预算默认值 | HTML 的 `#ssBudget` `value` 与 `js/semantic-space.js` 的 `state.budget` |
| 重新生成数据 | `python script/build-semantic-space.py` |

## 11. 修改须知

- **关联文件**：`pages/semantic-space.html`、`css/semantic-space.css`、`js/semantic-space.js`、`js/vendor/three/three.min.js`、`data/semantic-space/space.js`、`script/build-semantic-space.py`。
- **数据不要手改**：`space.js` / `space.json` 由脚本生成，文件头已标注；改了会被下次重跑覆盖。
- **Three.js 版本**：当前 r149 的 UMD 构建，走 `<script>` 全局 `THREE`，**不是** ES module——这样 `file://` 直开也能跑。换版本要确认还有 `build/three.min.js`，并且控制台没有弃用警告。
- **不要引 addons**：相机、拾取、网格全部自己实现，避免 importmap 与 file:// 的 CORS 问题。
- **数字一致性**：首屏 `78` / `41` / `2429` 来自数据，改语料后页面会自动变；但 `.ss-lede` 里的「41 份笔记与项目案例」是写死的，要一起改。
- **诚实边界**：向量是 TF-IDF + SVD（LSA），不是神经 embedding；页面上这条说明不能删，否则等于虚假宣传。
- **必须同步**：本文件 + [`docs/design/README.md`](../README.md) 页面索引 + [`docs/change.md`](../../change.md) 的「语义空间」章节。
