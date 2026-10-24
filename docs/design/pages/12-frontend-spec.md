# 系统级规范 · pages/frontend-spec.html

> 一套令牌撑起整个后台：先动手调圆角、密度、强调色看组件变化，再进入 13 节规范查阅完整状态与页面范式。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-spec.html`](../../../pages/frontend-spec.html)（约 900 行，13 节规范内联） |
| 线上路径 | `/pages/frontend-spec.html` |
| 页面类型 | 设计系统规范页（令牌实验台 + 文档覆盖层） |
| `<title>` | 系统级规范 · 前端设计规范库 |
| 样式文件 | [`pages/css/frontend-base.css`](../../../pages/css/frontend-base.css)（`.sy-scope` 令牌与组件）、[`pages/css/frontend-spec.css`](../../../pages/css/frontend-spec.css) |
| 脚本文件 | [`pages/js/frontend-spec.js`](../../../pages/js/frontend-spec.js)（目录、弹层、Toast）、[`pages/js/frontend-token-lab.js`](../../../pages/js/frontend-token-lab.js)（令牌实验台） |
| 依赖资源 | 无图片；示例全部用 HTML/CSS/SVG 拼装 |
| 数据来源 | 静态；实验台状态只存在当前页面 |
| 访问控制 | 无（从规范库密码门进入） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：要落地一套企业级后台的人；需要知道「一个变量改动会影响哪些组件」。
- **核心任务**：亲手调 `圆角 / 密度 / 强调色`，观察组件实时响应；再按 13 节目录查令牌、按钮、输入、反馈、表格与七类页面范式。
- **设计观点**：规范不是文档，是可操作的变量与可复用的类。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 站点头 | `.fa-top` | 返回规范库、品牌「系统级组件规范」、绿色 `S` 标 | 第 11–14 行 |
| 2 | 首屏 | `.spec-intro` | 眉题、标题「好的界面，从一套清晰的规则开始」、说明 | 第 16 行 |
| 3 | 令牌实验台 | `.spec-lab` | 圆角滑杆、密度（紧凑 / 舒展）、强调色（苔绿 / 鸢尾蓝 / 灰紫）、CSS 输出、复制按钮 | 第 17 行 |
| 4 | 实时预览 | `.spec-live-surface` `#specLive` | 一张会随令牌变化的组件卡 | 第 17 行 |
| 5 | 系统入口 | `.spec-systems` | 6 个页面范式链接（ERP / CRM / SOP / BI / OA / FIN） | 第 18 行 |
| 6 | 规范入口卡 | `.sy-entry` `#syEntry` | 一张卡概括 13 节，点击打开覆盖层 | 第 19–57 行 |
| 7 | 规范覆盖层 | `#syOverlay` `.sy-overlay-panel` | 左侧 13 节目录 + 右侧详情 | 第 61 行起 |
| 8 | 弹层组件 | `#veil` `#modal` `#drawer` `#cmdk` | 遮罩、弹窗、抽屉、命令面板 | 后半 |
| 9 | Toast | `.sy-toast` | 操作反馈 | 后半 |

## 4. 布局

- **容器**：`.spec-main` `max-width: 1340px`，左右 28px，顶部 48px。
- **实验台**：`.spec-lab` 两栏 `minmax(250px,.8fr) / minmax(0,1.5fr)`；左控制、右预览。
- **预览卡**：`width: min(410px, 100%)`，随圆角 / 间距变量变化。
- **系统入口**：`.spec-systems` 三列网格（≤ 1000px 两列，≤ 760px 单列），每格「编号 + 名称」。
- **覆盖层**：全屏 `.sy-overlay`；内部左目录 240px、右详情自适应，最大宽约 1240px；目录可滚动。
- **断点**：≤ 1000px 实验台单栏、系统入口两列；≤ 760px 系统入口单列、覆盖层目录收起为顶部横条。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `body` | `#fdfef9` 系浅米白 |
| 主色 | `--primary` | `#476658`（苔绿） |
| 主色弱底 | `--primary-weak` | `#e6ebe1` |
| 实验台强调 | `--lab-accent` | `#476658`（可切 `#465db2` / `#8761a5`） |
| 实验台圆角 | `--lab-radius` | `12px`（可调 0–24） |
| 实验台密度 | `--lab-gap` | `12px` / `20px` |
| 入口卡 | `.sy-entry` | 深绿 `#1c322a` + 米白字 |
| 覆盖层纸面 | `.sy-overlay-panel` | `#fdfef9` |
| 描边 | `#dce1d3` / `#d9dece` | 浅橄榄灰 |
| 企业级令牌 | `.sy-scope` | 见 [design/README.md](../README.md) 第 4.3 节 |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(30px, 3.6vw, 48px)` / 500 | 两行，字距 -.05em |
| 规范标题 | 24–32px / 650 | |
| 正文 | 13–14px / 400 | 系统无衬线 |
| 令牌名 / CSS | `--mono` 12px | 等宽 |
| 色板标签 | 11px | |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 实验台圆角 | 14px |
| 预览卡圆角 | 变量 `--lab-radius` |
| 覆盖层圆角 | 18px |
| 详情分组间距 | 24–32px |
| 令牌间距 | `--s1…--s9`（4→56px） |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 令牌变化 | 拖动滑杆 / 选密度 / 选色 | 预览卡圆角、间距、强调色实时过渡 |
| 覆盖层 | 点击入口卡 | 全屏展开，目录切换详情 |
| 弹层 | 打开 modal / drawer / cmdk | 遮罩淡入，焦点进入 |
| Toast | 保存 / 复制 | 底部浮出 2 秒 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 站点头 | `.fa-top` `.fa-home` `.fa-brand` `.fa-logo` | 返回与品牌 |
| 首屏 | `.spec-intro` | 标题与说明 |
| 实验台 | `.spec-controls` `#specRadius` `[data-lab-density]` `.spec-color` `#specTokenCode` `#specCopyTokens` | 圆角 / 密度 / 强调色 / CSS 输出 |
| 实时预览 | `#specLive` `.spec-live-top` `.spec-live-list` `#specPreviewAction` | 组件随令牌变化 |
| 系统入口 | `.spec-systems a` | 6 个页面范式 |
| 规范入口卡 | `.sy-entry` `.sy-entry-preview` `.sy-entry-go` | 13 节概览 |
| 覆盖层 | `#syOverlay` `.sy-ov-head` `.sy-doc-nav` `.sy-nav-item` `.sy-detail` | 目录 + 详情 |
| 令牌展示 | `.sy-spec-grid` `.sy-swatch-row` `.sy-swatch-item` `.sy-type-row` | 色板、字阶 |
| 组件规范 | `.sy-btn` `.sy-input` `.sy-table` `.sy-modal` `.sy-drawer` `.sy-toast` `.sy-cmdk` | 见 `frontend-base.css` |
| 弹层 | `#veil` `#modal` `#drawer` `#cmdk` | 打开 / 关闭 / 焦点回收 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回规范库 | ← | `.fa-home` | 跳转 | `frontend-style.html` |
| 圆角 | 圆角 0–24px | `#specRadius` | 改变预览圆角 | 本页 |
| 密度 | 紧凑 / 舒展 | `[data-lab-density="12"/"20"]` | 改变间距 | 本页 |
| 强调色 | 苔绿色 / 鸢尾蓝 / 灰紫色 | `.spec-color` | 改变强调色 | 本页 |
| 复制令牌 | 复制这组 CSS 令牌 ↗ | `#specCopyTokens` | 复制 CSS 变量 | 剪贴板 |
| 预览按钮 | 选择这套风格 | `#specPreviewAction` | 切换选中态 | 本页 |
| 页面范式 | 工业工作台 / 销售画布 / 纸张手册 / 数据观测台 / 审批收件箱 / 资金账簿 | `.spec-systems a` | 跳转 | 对应 `frontend-*.html` |
| 打开规范 | 点击入口卡 | `#syEntry` | 打开覆盖层 | `#syOverlay` |
| 目录 | A1–A13 | `.sy-nav-item` | 切换详情 | 本页 |
| 关闭 | ✕ | `#syClose` | 关闭覆盖层 | 本页 |
| 弹层 | 打开 modal / drawer / cmdk | `[data-open]` | 演示弹层 | 本页 |

## 8. 交互与状态

- **令牌实验台**：`frontend-token-lab.js` 把圆角、密度、强调色写入 CSS 变量，并同步 `#specTokenCode` 的 CSS 文本；复制按钮复制这段令牌。
- **目录切换**：`frontend-spec.js` 按 `data-sy` 切换 `data-sy-panel`，当前项 `aria-current="true"`。
- **弹层**：modal / drawer / cmdk 共用 `#veil`，Esc 关闭最上层，关闭后焦点回到触发元素。
- **命令面板**：`#cmdk` 支持输入过滤与方向键选择。
- **Toast**：保存草稿、复制等操作给出 2 秒提示。
- **无障碍**：覆盖层 `role="dialog"` + `aria-modal`；焦点进入弹层；目录按钮可键盘操作。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1000px` | 实验台单栏，预览卡居中 |
| `max-width: 760px` | 系统入口两列；覆盖层目录变为顶部横条，详情全宽 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏标题 / 说明 | `.spec-intro` |
| 实验台可调范围 / 默认值 | `frontend-token-lab.js` 与 `#specRadius` 的 `min/max/value` |
| 可选强调色 | `.spec-color` 的 `data-lab-color` 与 `--choice` |
| 13 节目录 | `.sy-doc-nav` 与对应 `.sy-detail[data-sy-panel]` |
| 令牌值 | `frontend-base.css` 的 `.sy-scope` |
| 系统入口 | `.spec-systems` 的 6 个链接 |
| 弹层示例 | `#modal` / `#drawer` / `#cmdk` |

## 11. 修改须知

- **关联文件**：`pages/css/frontend-base.css`、`pages/css/frontend-spec.css`、`pages/js/frontend-spec.js`、`pages/js/frontend-token-lab.js`。
- **令牌是单一事实来源**：组件只允许引用 `.sy-scope` 变量，禁止在 spec 页写死新色值。
- **13 节必须与目录一致**：新增 / 删除一节要同时改目录、面板、`data-sy`，并更新「13 节」文案。
- **实验台是演示**：不要把它接到真实主题系统；它只改当前预览卡。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「系统级规范」章节；令牌变化同步 `docs/design/README.md` 第 4.3 节。
