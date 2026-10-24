# 金融类 · pages/frontend-finance.html

> 同一份资产、五种表达：财富社区 / 霓虹行情 / 机构终端 / 极简工作台 / 高净值财富，再加一张纸面票据存根。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-finance.html`](../../../pages/frontend-finance.html) |
| 线上路径 | `/pages/frontend-finance.html` |
| 页面类型 | 设计规范演示页（皮肤切换 + 组件规范 + 交互实验） |
| `<title>` | 金融类 · 前端设计规范库 |
| 样式文件 | [`pages/css/frontend-finance.css`](../../../pages/css/frontend-finance.css)、[`pages/css/frontend-ledger.css`](../../../pages/css/frontend-ledger.css) |
| 脚本文件 | [`pages/js/frontend-finance.js`](../../../pages/js/frontend-finance.js) |
| 依赖资源 | 无图片；所有示例用 HTML/CSS 拼装 |
| 数据来源 | 静态演示数据（金额、行情仅作展示） |
| 访问控制 | 无（从规范库密码门进入） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：做金融 / 财富 / 票据类界面的人，需要比较「同一业务、不同材质」的差异。
- **核心任务**：切换 5 套皮肤，观察按钮、输入、表格、导航、标签、提示、卡片、弹窗如何跟着变；再体验票据存根（金额、期限、风险、确认盖章）的完整流程。
- **设计观点**：业务结构可以不变，材质与排版决定界面性格。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 站点头 | `.fs-header` | 返回规范库、品牌「金融类」、提示「5 套皮肤试验卡 · 票据存根卡」 | 第 10–17 行 |
| 2 | 首屏 | `.fs-lab-intro` | 眉题、标题「同一份资产，五种表达方式」、说明 | 第 20 行 |
| 3 | 皮肤选择器 | `.fs-skin-deck` | 5 张缩略卡（01–05），点击切换 | 第 20 行 |
| 4 | 预览说明 | `#fsPreviewCopy` | 当前皮肤的一句话描述 | 第 20 行 |
| 5 | 类目头 | `.fs-cat-head` | 图标、名称、说明、徽标「2 张卡片」 | 第 22–30 行 |
| 6 | 舞台 | `.fs-stage` | 标题「同一业务域，两套组件语言」+ 两张卡 | 第 32–40 行 |
| 7 | 卡 A · 皮肤试验卡 | `#fsCardStage` | 账户示例：品牌、标签、净值、涨跌行、导航、搜索、按钮 | 第 44–95 行 |
| 8 | 卡 B · 票据存根卡 | `#ledgerCard` | 纸面票据 + 存根撕线 | 第 98 行起 |
| 9 | 详情层 | `#fsDetail` `#fsTheme` | 5 套皮肤 tab + 九组组件规范 | 第 100 行后 |
| 10 | 票据应用 | `#lgApp` | 金额、期限、风险、条款、存根、抽屉、弹窗 | 后半 |

## 4. 布局

- **容器**：`.fs-main` 基础 `max-width: 1240px`，宽屏覆盖为 1340px，左右 28px。
- **首屏**：标题两行，说明一行；下方皮肤选择器 5 列等宽（窄屏横滑）。
- **舞台**：`.fs-cards` 桌面两卡并排，最大宽 1000px、`grid-template-columns: minmax(0,1.15fr) minmax(0,1fr)`、间距 40px；≤ 980px 单列。
- **当前皮肤面板**：`.fs-stage-meta` 一行（标签 + 名称 + 点 + 灵感来源）；`.fs-demo` 为账户示例，含顶部、KPI、涨跌行、导航、控件。
- **详情层**：全屏覆盖，内部 `.fs-detail-inner` 最大宽 1180px；顶部标题 + 5 个 tab，下面是 `.fs-showcase` 网格（宽块 + 半宽块）。
- **票据**：`.ledger-card` 为竖版纸面，含抬头、金额、条款、存根；撕线用伪元素虚线。
- **断点**：≤ 980px 两卡单列；≤ 760px 详情网格单列、皮肤 tab 横滑。

## 5. 视觉样式

### 5.1 颜色

皮肤变量定义在 `frontend-finance.css` 的 `.theme-*`：

| 皮肤 | 表面 | 文字 | 主色 | 边框 |
| --- | --- | --- | --- | --- |
| 财富社区 `theme-feed` | `#ffffff` / `#f6f6f7` | `#1b1b1f` / `#8b8b93` | `#ff2442` | `rgba(0,0,0,.06)` |
| 霓虹行情 `theme-neon` | `#0a0a0b` | `#f2f2f3` / `#8e8e93` | `#fe2c55` | `rgba(255,255,255,.11)` |
| 机构终端 `theme-terminal` | `#0f0f10` / `#151516` | `#e6e6e6` / `#8b8b8b` | `#ffb000` | `#2a2a2c` |
| 极简工作台 `theme-minimal` | `#ffffff` / `#fafafa` | `#111111` / `#8f8f8f` | `#111111` | `#ebebeb` |
| 高净值财富 `theme-luxe` | `#131a2a` | `#f5f6fa` / `#9aa3b8` | `#e8c87a` | `rgba(255,255,255,.1)` |

票据存根（`frontend-ledger.css`）：

| 用途 | 变量 | 色值 |
| --- | --- | --- |
| 纸面 | `--lg-paper` / `--lg-paper-2` | `#f7f3e9` / `#f1ebdc` |
| 墨色 | `--lg-ink` / `--lg-ink-2` | `#1c1a17` / `#5a5449` |
| 分隔线 | `--lg-rule` | `#cfc6b4` |
| 印章红 | `--lg-seal` | `#a8352a` |
| 鼠尾草绿 | `--lg-sage` | `#5c6b5a` |

涨跌口径：`--up` 红、`--down` 绿（A 股口径）。

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(34px, 4vw, 54px)` / 500 | 字距 -.05em |
| 详情标题 | 1.55rem（约 25px）/ 800 | `#fsTitle` |
| 金额 | 34–48px / 750，等宽数字 | `font-variant-numeric: tabular-nums` |
| 正文 | 13–14px / 400 | 无衬线 |
| 票据 | `--lg-serif`（宋体 / Songti SC） | 纸面感 |
| 终端皮肤 | `--font-mono` 全局等宽 | 机构终端专用 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 皮肤缩略卡圆角 | 14px |
| 舞台卡圆角 | 22px |
| 票据圆角 | 4–8px（纸面） |
| 按钮圆角 | 跟随皮肤（8 / 999px） |
| 详情面板内边距 | 24–32px |
| 卡片阴影 | 低对比、贴合皮肤（深色皮肤用发光替代阴影） |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 皮肤切换 | 点击缩略卡 / 详情 tab | 背景、文字、主色、圆角、字体整体过渡 |
| 详情层 | 点击卡 A | 全屏展开，Esc / ✕ 关闭 |
| 票据撕线 | 静态 | 虚线 + 半圆缺口 |
| 按钮按压 | 点击 | 轻微缩放 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 站点头 | `.fs-header` `.fs-back` `.fs-brand` `.fs-hint` | 返回、品牌、提示 |
| 皮肤选择器 | `.fs-skin-deck` `.fs-skin-sample` `.fs-sample-art` | 5 张缩略卡 |
| 账户示例 | `.fs-card-stage` `.fs-demo` `.fs-d-top` `.fs-d-kpi` `.fs-d-rows` `.fs-d-nav` `.fs-d-controls` | 品牌、标签、净值、涨跌、导航、控件 |
| 详情 tab | `#fsSwitcher` `.fs-detail-tab` | 5 套皮肤切换 |
| 规范分组 | `.fs-showcase` `.fs-block` | 配色、按钮、输入、表格、导航、标签、提示、卡片、弹窗 |
| 色板 | `.fs-swatches` `.fs-swatch` | 主色 / 涨 / 跌 / 危险 / 表面 / 文字 |
| 按钮组 | `.fs-btn` `.fs-btn-primary` `.fs-btn-ghost` `.fs-btn-danger` | 主 / 次 / 危险 |
| 输入 | `.fs-input` `.fs-select` | 跟随皮肤 |
| 表格 | `.fs-table` | 涨红跌绿 |
| 标签 / 开关 / 分段 | `.fs-tag` `.fs-switch` `.fs-seg` | 状态表达 |
| 提示条 | `.fs-banner` | 信息 / 警告 |
| 数据卡 | `.fs-data-card` | 指标 + 趋势 |
| 弹窗 | `.fs-modal` | 确认 / 表单 |
| 票据存根 | `.ledger-card` `.lg-stub` `.lg-head` | 纸面 + 撕线 |
| 票据应用 | `#lgApp` `#lgTabs` `#lgAmount` `#lgTerm` `#lgRisk` | 金额 / 期限 / 风险 / 确认 |
| 票据弹层 | `#lgSheet` `#lgDrawer` `#lgModal` `#lgVeil` | 上滑存根、抽屉、确认 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回规范库 | ← 返回规范库 | `.fs-back` | 跳转 | `frontend-style.html` |
| 皮肤卡 | 01 财富社区 / 02 霓虹行情 / 03 机构终端 / 04 极简工作台 / 05 高净值财富 | `.fs-skin-sample` | 切换预览皮肤 | 本页 |
| 打开详情 | 点击卡 A | `#fsOpenDetail` | 打开完整组件视图 | `#fsDetail` |
| 票据卡 | 点击存根 | `#ledgerCard` | 打开票据规范 | `#ledgerCard` |
| 详情 tab | 财富社区 / 行情短视频 / 机构终端 / 极简工作台 / 高净值财富 | `.fs-detail-tab` | 切换皮肤 | 本页 |
| 关闭 | ✕ | `#fsClose` | 关闭详情层 | 本页 |
| 示例按钮 | 主要按钮 / 次要按钮 / 危险操作 | `.fs-btn-*` | 仅演示 | 本页 |
| 票据 | 重置 / 确认认购 · 盖章提交 | `#lgReset` `#lgSubmit` | 重置表单 / 提交 | 本页 |
| 票据 | 返回修改 / 上滑存根 / 查看条款 | `#lgSheetBack` `#lgOpenSheet` `#lgOpenTerms` | 关闭 / 打开存根 / 打开条款 | 本页 |
| 票据 | 打开目录菜单 / 盖章主操作 / 下划线次操作 | `#lgOpenDrawer` 等 | 演示不同操作层级 | 本页 |
| 票据弹层 | 取消 / 确认 | `#lgSheetOk` 等 | 关闭 / 确认 | 本页 |

## 8. 交互与状态

- **皮肤状态**：`theme-feed / theme-neon / theme-terminal / theme-minimal / theme-luxe` 五个类挂在预览容器上；切换时同步标题、来源说明、tab 选中态。
- **票据流程**：金额 → 期限 → 风险等级 → 条款 → 存根确认；输入变化实时回写 `#lgRecap*` 与中文大写。
- **弹层**：遮罩 `#lgVeil` + `#lgSheet` / `#lgDrawer` / `#lgModal`，Esc 与点击遮罩关闭。
- **键盘**：详情 tab 支持方向键；按钮 `focus-visible` 有描边。
- **空态 / 错误态**：演示页无异步数据；输入非法时给出字段级提示。
- **无障碍**：tab 使用 `role="tablist"` / `aria-selected`；弹层有 `aria-hidden` 与焦点管理。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 980px` | 两卡单列；详情网格半宽块变整宽 |
| `max-width: 760px` | 皮肤选择器横滑；详情 tab 横滑；票据纸面收窄 |
| `prefers-reduced-motion` | 关闭皮肤过渡 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 5 套皮肤配色 / 字体 / 圆角 | `frontend-finance.css` 的 `.theme-*` 变量 |
| 皮肤名称 / 灵感来源 | 页面 `.fs-skin-sample` 与 `#fsSkinName` / `#fsSkinFrom` |
| 账户示例数据 | `.fs-demo` 内的标签、金额、涨跌行 |
| 组件规范示例 | `#fsDetail` 的 `.fs-block` |
| 票据模板 / 条款 | `#ledgerCard` 与 `#lgApp` |
| 票据金额 / 期限 / 风险选项 | `#lgAmount`、`#lgTerm`、`#lgRisk` 的选项与回写 |
| 交互逻辑 | `pages/js/frontend-finance.js` |

## 11. 修改须知

- **关联文件**：`pages/css/frontend-finance.css`、`pages/css/frontend-ledger.css`、`pages/js/frontend-finance.js`。
- **皮肤是变量驱动的**：新增皮肤只需加 `.theme-x` 变量组 + 一张缩略卡 + 一个 tab，不要在组件里写死颜色。
- **金额只作演示**：票据金额、行情数字仅用于界面展示，不得写成真实业务数据。
- **涨跌口径**：A 股「涨红跌绿」，不要改成欧美口径。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「金融类（设计规范）」章节。
