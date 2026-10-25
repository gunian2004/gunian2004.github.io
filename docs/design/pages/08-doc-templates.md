# 开发文档模板台 · pages/doc-templates.html

> 按 docs 目录规划取标题级骨架：选文件 → 复制 → 直接贴给 AI Agent，不用每次重讲项目文档要求。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/doc-templates.html`](../../../pages/doc-templates.html) |
| 线上路径 | `/pages/doc-templates.html` |
| 页面类型 | 文档骨架模板库（目录树 + 只读预览 + 复制 / ZIP） |
| `<title>` | 开发文档模板台 · 工作台 |
| 样式文件 | [`css/work-hub.css`](../../../css/work-hub.css)（底座）+ [`css/doc-templates.css`](../../../css/doc-templates.css)（`dt-` 前缀） |
| 脚本文件 | [`script/studio.js`](../../../script/studio.js)（复制 / Toast）、[`js/project-doc-templates.js`](../../../js/project-doc-templates.js)（模板数据与自检）、[`js/doc-templates.js`](../../../js/doc-templates.js)（渲染、形态切换、导出、存储）、[`js/gate.js`](../../../js/gate.js)（密码门） |
| 依赖资源 | 无外部依赖、无构建；ZIP 由前端 Blob 生成 |
| 数据来源 | 模板内置；`localStorage` 键 `work-hub.doc-templates.v2` 只存「形态 / 当前模板 / 项目名称 / 技术栈」；首次加载从 v1 迁移项目名称与技术栈后删除旧键 |
| 访问控制 | 密码门（`data-pw-field="work-hub-PW"`，前端校验，弱隔离） |
| 文档更新 | 2026-10-25 |

## 2. 页面定位

- **给谁看**：新项目开工前的自己，以及需要把文档规范一次性交给 AI Agent 的人。
- **核心任务**：按固定的 docs 目录规划，取出对应文件的标题级骨架，复制或下载后交给 Agent，避免每次重复描述文档要求。
- **产品特征**：先画目录树，再按真实相对路径导航；右侧只读预览；两种页面规模形态各 13 个位置；支持整套复制与 ZIP 落盘。
- **不做什么**：不提供在线编辑与正文草稿，不调用在线 AI，不生成模板以外的项目内容。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 密码门 | `#gate` | 访问密码，解锁前隐藏页头与主内容 | 第 13–19 行 |
| 2 | 页头 / 导航 | `.hub-header` `.hub-nav` | 品牌、四页互链、返回主页 | 第 20–22 行 |
| 3 | 首屏 | `.hub-hero` | 标题、说明、3 个 chip（当前形态 / 位置数 / 只读） | 第 24–29 行 |
| 4 | 目录结构 | `#dtTree` `#dtRules` `.dt-naming` `#dtCopyTree` | 形态切换、CSS 目录树、4 条规则、命名速查、复制按钮 | 第 31–59 行 |
| 5 | 模板工作台 | `.dt-fields` `#dtCopyAll` `#dtZip` `#dtNavToggle` `#dtNav` `#dtDetail` | 两个资料输入、整套复制 / ZIP、文件导航、骨架预览与单份复制 | 第 61–92 行 |
| 6 | 怎么用 | `.dt-steps` | 开工 → 设计 → 开发 → 变更 4 步 | 第 94–108 行 |
| 7 | 页脚说明 | `.dt-foot` | 本地存储范围与占位符说明 | 第 110 行 |

## 4. 布局

- **容器**：`.hub-wrap` `width: min(1140px, calc(100% - 48px))`。
- **目录结构**：`.dt-map-grid` 两栏 `minmax(0, 1.02fr) / minmax(260px, .98fr)`；左列树卡片按内容宽度收缩（`justify-self:start`），最大高 470px，超出内部滚动；右列为规则列表 + 命名速查。
- **模板工作台**：`.dt-work` 两栏 `276px + minmax(0, 1fr)`；左栏 `.dt-nav` 在桌面 `position: sticky; top: 18px`，最大高 `calc(100vh - 36px)`，内部滚动。
- **详情**：`.dt-detail` 左侧 1px 分隔线 + 22px 内边距；骨架区最大高 `min(58vh, 620px)`，超出内部滚动。
- **资料输入**：`.dt-fields` 两列，每列 `minmax(150px, 220px)`；标签在上、输入在下。
- **断点**：≤760px 目录两栏改单栏、树卡片撑满；≤900px 工作台单栏、导航变折叠选择器；≤620px 形态按钮撑满、详情元信息与流程单列。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `--bg` | `#101821` |
| 面板 | `--panel` | `#182530` |
| 正文 | `--text` | `#edf3f4` |
| 次要文字 | `--muted` | `#a0b2ba` |
| 分隔线 | `--line` | `#c5dedc26` |
| 薄荷主色 | `--mint` | `#80e0c1` |
| 荧光黄强调 | `--lime` | `#d4f178` |
| 树卡片底色 | `.dt-tree` | `#0d1720` |
| 树连接线 | `.dt-fs li::before/::after` | `#c5dedc33` |
| 未填占位提示 | `.dt-hint` | `#ffbd78` |
| 状态错误 | `.dt-status-error` | `#ffbd78` |
| 页脚文字 | `.dt-foot` | `#72858b` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(30px, 4.5vw, 48px)` / 700 | 字距 -.04em |
| 面板 `h2` | 20px / 650 | |
| 详情标题 `.dt-title` | 17px / 600 | |
| 文件名 `.dt-doc-path` | 11.5px 等宽 | 真实相对路径 |
| 骨架 `.dt-skeleton` | 12px / 1.8 等宽 | `#` 标题行分三级着色 |
| 路径 chip | 11.5px 等宽 | 薄荷色，可换行 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 面板圆角 | 18px（`.panel`） |
| 树卡片 / 骨架 / 文件项圆角 | 10px |
| 形态切换外壳 | 10px，按钮 8px |
| 面板内边距 | 24px |
| 树卡片内边距 | 16px 18px |
| 目录层级缩进 | 每级 18px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 形态切换 | 点击「页面 >5 / ≤5」 | 树、导航、计数、详情同时替换，无过渡 |
| 模板切换 | 点击文件项 | 详情替换，`aria-current` 高亮 |
| 移动端选完 | 点击文件项 | 收起列表并平滑滚动到详情 |
| 复制反馈 | 复制按钮 | `studio-toast` + 状态行字节数 |
| 减弱动效 | `prefers-reduced-motion` | 由 `work-hub.css` 全局关闭 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 密码门 | `js/gate.js` | 弱隔离，解锁后移除遮罩 |
| 形态切换 | `.dt-mode` `.dt-mode-btn` `setMode()` | 两个按钮，`aria-pressed` 标记当前形态 |
| 目录树 | `#dtTree` `.dt-fs` `.dt-fs-folder` `.dt-fs-file` `parseTree()` `treeList()` | 从纯文本树解析后渲染为嵌套列表，线用 CSS 画 |
| 结构规则 | `#dtRules` `.dt-rules` `renderRules()` | 4 条：同构 / 规模 / 变更留痕 / 代码同改 |
| 命名速查 | `.dt-naming` | 静态说明：变更记录、技术栈规范、归档、根入口 |
| 资料输入 | `#dtProjectName` `#dtStack` `.dt-fields` | 只替换两个占位符，实时刷新树、导航、详情 |
| 整套操作 | `#dtCopyAll` `#dtZip` `bundleText()` `downloadZip()` | 复制 13 份骨架 / 下载 ZIP |
| 文件导航 | `#dtNav` `.dt-doc` `renderNav()` | 按目录分组，显示路径与一句用途 |
| 折叠选择器 | `#dtNavToggle` `#dtNavCurrent` `applyNav()` | ≤900px 显示，`aria-expanded` 标记状态 |
| 详情预览 | `#dtDetail` `#dtDetailTitle` `#dtSkeleton` `paintSkeleton()` | 路径、标题、用途、何时写、谁引用、骨架 |
| 占位提示 | `#dtHint` | 未填资料时提示哪些占位符会原样保留 |
| 单份操作 | `#dtCopy` `#dtDownload` | 复制 / 下载当前骨架 |
| 流程说明 | `.dt-steps` `.dt-step` | 四步用法 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 密码门 | 解锁工作台 | `#gateBtn` | 校验密码 | 本页 |
| 导航 | 工作经验 / 问题排查 / 文档模板 / 命令片段 | `.hub-nav a` | 跳转 | 对应页面 |
| 形态 | 页面 >5 / 页面 ≤5 | `.dt-mode-btn` | 切换目录形态 | 本页 |
| 复制目录结构 | 复制目录结构 | `#dtCopyTree` | 复制纯文本树 | 剪贴板 |
| 整套复制 | 复制整套模板 | `#dtCopyAll` | 复制 13 份骨架，含文件分隔 | 剪贴板 |
| 下载骨架 | 下载 docs 骨架 .zip | `#dtZip` | 生成含目录条目的 ZIP | 本机 |
| 折叠选择器 | 选择模板 · 当前文件 · 切换 | `#dtNavToggle` | 展开 / 收起文件列表 | 本页 |
| 文件项 | 路径 + 一句用途 | `.dt-doc` | 切换详情 | 本页 |
| 复制单份 | 复制这份 | `#dtCopy` | 复制当前骨架 | 剪贴板 |
| 下载单份 | 下载 .md | `#dtDownload` | 下载当前骨架 | 本机 |

## 8. 交互与状态

- **形态模型**：`multi`（页面 >5）与 `slim`（页面 ≤5）各 13 个位置；`design / tasks / spec` 的页面模板成对（`pair`），切换形态时自动落到对应文件。
- **数据自检**：`js/project-doc-templates.js` 启动时检查 id 重复、未知形态、非法占位符、pair 缺半；失败时控制台报错，状态行显示「模板数据校验失败 N 项」。
- **占位符**：只支持 `{项目名称}` 与 `{技术栈}`；填充后实时替换树、导航、预览、复制与 ZIP。`{技术栈}` 在文件名中取短名（`Java 21 + Spring Boot` → `Java`），为空时回落 `xxx`。
- **空值**：输入为空时保留占位符，并在详情上方提示会原样保留哪些占位符。
- **复制降级**：优先 `BlogStudio.copy`；剪贴板不可用（如 `file://` 限制）时自动下载 `.md` 并在状态行说明。
- **整套复制**：`# 项目 · 文档骨架（13 份 · 形态）` + 4 条文档规则 + 13 段；分隔符为 `===== 文件 n/13：路径 =====`，不使用代码围栏；超过 200 KB 拒绝复制并提示改用 ZIP。
- **ZIP**：store 模式（不压缩），UTF-8 文件名（通用位 `0x0800`），额外写入 `docs/`、`docs/design/` 等目录条目，避免解压器漏建目录。
- **存储**：只写 `v2` 四个字段；读取时逐项校验，损坏则退回默认值。首次加载读取 `v1` 的 `projectName` / `techStack` 填入后删除旧键。
- **错误态**：存储不可用时状态行标红，不阻塞渲染；ZIP 生成失败给出原因。
- **无障碍**：文件导航是 `nav > div > h3 + ul > li > button`（不用 tablist）；文件项用 `aria-current="true"`；树与骨架均可聚焦滚动；折叠按钮有 `aria-expanded` / `aria-controls`；状态行 `role="status"`。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 760px` | 目录树与规则改单栏；树卡片撑满并降到最大高 360px |
| `max-width: 900px` | 工作台改单栏；导航变「选择模板」折叠器（默认收起）；详情改上分隔线；资料输入单列；流程两列 |
| `max-width: 620px` | 形态按钮撑满；详情元信息单列；树与文件项字号降到 11.5px；流程单列 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 模板骨架正文 | `js/project-doc-templates.js` 的 `items[].skeleton` |
| 文件路径 / 标题 / 用途 / 何时写 / 谁引用 | 同文件的 `items[]` 字段 |
| 两套目录树文案 | 同文件的 `trees.multi` / `trees.slim` |
| 结构规则 | 同文件的 `rules[]` |
| 命名速查 | `pages/doc-templates.html` 的 `.dt-naming` |
| 首屏标题 / 说明 / chip | `.hub-hero` |
| 页面样式 | `css/doc-templates.css` |
| 整套复制格式 / ZIP 逻辑 | `js/doc-templates.js` 的 `bundleText()` / `zipStore()` |
| 存储版本与迁移 | 同文件的 `STORAGE_KEY` / `migrateV1()` |

## 11. 修改须知

- **关联文件**：`pages/doc-templates.html`、`css/doc-templates.css`、`js/project-doc-templates.js`、`js/doc-templates.js`、`script/studio.js`、`js/gate.js`。
- **模板即产品**：骨架只写标题层级和必要的空表头，不写正文；新增文件必须同时改 `trees`、`items` 与本节文档。
- **占位符契约**：只允许 `{项目名称}` / `{技术栈}`；页面名统一写「页面名称」，避免与占位符语法冲突。
- **两套形态各 13 个位置**：增删模板时同步检查 `modes`、`pair`、目录树和导航计数。
- **版本兼容**：存储键有版本号，改数据结构要升版本并处理旧键；v1 草稿只用于迁移两个资料字段。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「开发文档模板台」小节。
