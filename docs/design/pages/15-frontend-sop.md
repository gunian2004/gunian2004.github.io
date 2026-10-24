# SOP 流程 · pages/frontend-SOP.html

> 纸张手册式的流程页：编号目录、检查清单、下一步按钮；勾选驱动进度，像读一份可执行的工作手册。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-SOP.html`](../../../pages/frontend-SOP.html) |
| 线上路径 | `/pages/frontend-SOP.html` |
| 页面类型 | 企业后台设计样例（FA 外壳 + 模块页面） |
| `<title>` | SOP 流程 · 前端设计规范库 |
| 样式文件 | [`pages/css/frontend-base.css`](../../../pages/css/frontend-base.css)、[`pages/css/frontend-experience.css`](../../../pages/css/frontend-experience.css)、[`pages/css/frontend-SOP.css`](../../../pages/css/frontend-SOP.css) |
| 脚本文件 | [`pages/js/frontend-core.js`](../../../pages/js/frontend-core.js)、[`pages/js/frontend-experience.js`](../../../pages/js/frontend-experience.js)、[`pages/js/frontend-SOP.js`](../../../pages/js/frontend-SOP.js) |
| 依赖资源 | 无图片；纸张质感用渐变、描边、衬线字体实现 |
| 数据来源 | 演示数据（流程、责任人、检查项均为样例） |
| 访问控制 | 无（从规范库密码门进入） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：写 SOP、做流程执行 / 合规检查后台的人。
- **核心任务**：把「流程库 → 执行 → 检查项 → 异常 → 分析」串成一条线；用勾选与进度代替装饰。
- **设计观点**：流程文档应当像纸质手册一样可读、可核对。

## 3. 页面结构

**外壳**：同 [ERP 页](13-frontend-erp.md) 的 FA 外壳。

**页面清单（7 个）**

| # | 页面 id | 标题 | 说明 | 主要组件 |
| --- | --- | --- | --- | --- |
| 1 | `workspace` | 流程手册 | 把经验写成可执行步骤 | Hero、纸张式索引、检查清单、进度、下一步、书架入口 |
| 2 | `lib` | 流程库 | 流程、版本与负责人 | 表格 |
| 3 | `run` | 流程执行 | 月度对账 SOP · 当前第 3 步 | 步骤条、执行区 |
| 4 | `tasks` | 我的任务 | 按截止时间排序的待执行步骤 | 表格 |
| 5 | `exceptions` | 异常处理 | 执行中偏离标准的步骤与原因 | 表格 + 表单 |
| 6 | `templates` | 检查项模板 | 复用检查项，避免每次手写 | 表单、列表 |
| 7 | `analytics` | 执行分析 | 执行率、平均耗时与卡点步骤 | KPI、表格 |

## 4. 布局

- **外壳**：SOP 主题侧栏 236px（目录树），主区常规两栏。
- **工作空间**：`.sop-paper` 为「左索引 + 右纸张」两栏；左索引导航 4 个步骤 + 总进度，右侧为当前步骤详情。
- **纸张**：`.sop-sheet` 米白底、细描边、衬线标题、页码 `01 / 04`。
- **检查项**：`fieldset` + `label` 纵向，勾选后进度条与文案同步。
- **书架**：`.sop-shelves` 三列入口（执行工作台 / 检查项模板 / 执行分析）。
- **断点**：≤ 1100px 纸张两栏变单栏；≤ 760px 索引横排、书架单列。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 纸面底色 | `directions.sop` | `#f6f3eb` |
| 纸张表面 | 同上 | `#fffdf7` |
| 主色（墨绿） | 同上 / accent | `#476658` |
| 辅助（牛皮纸黄） | 同上 | `#d1b58a` |
| 描边 / 分隔 | `frontend-SOP.css` | `#ded9cc` / `#e5e1d5` |
| 次要文字 | 同上 | `#938b74` |
| 正文 / 墨色 | `--text` | `#101828` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 纸张标题 `h2` | 26–34px / 650 | 衬线（宋体 / Georgia） |
| 页码 | 13px 等宽 | `01 / 04` |
| 检查项 | 13–14px | |
| 正文 | 13px / 400，行高 1.8 | |
| 索引编号 | `--mono` 11px | |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 纸张圆角 | 4–8px（刻意接近纸） |
| 索引项圆角 | 8px |
| 纸张内边距 | 28–36px |
| 栏间距 | 18–22px |
| 检查项间距 | 10px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 勾选 | 点击检查项 | 进度条与「已完成」计数更新 |
| 下一步 | 点击「下一步 →」 | 当前步骤完成后才可点击，进入下一节 |
| 目录切换 | 点击左侧步骤 | 切换纸张内容 |
| Toast | 状态变化 | 演示提示 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 纸张索引 | `.sop-index` `.sop-total` `progress` | 步骤、检查数、总进度 |
| 纸张正文 | `.sop-sheet` `.sop-page-no` `.sop-callout` | 标题、页码、执行要点 |
| 检查清单 | `.sop-checks` `[data-sop-check]` | 勾选项 |
| 底部动作 | `.sop-foot` `#sopStatus` `#sopNext` | 状态 + 下一步 |
| 书架 | `.sop-shelves` `[data-page]` | 三个入口 |
| 步骤条 | `FA.steps()` | 流程执行页 |
| 表格 / 表单 | `FA.table()` / `FA.form()` | 流程库、任务、异常、模板 |
| KPI | `FA.kpi()` | 执行分析 |
| 设计语言 | `.ds-guide` | 配色与说明 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回规范库 | ← / ✕ | `.fa-home` / `#faClose` | 跳转 | `frontend-style.html` |
| 菜单 | ☰ | `#faMenuBtn` | 侧栏开关 | 本页 |
| 步骤目录 | 01 导出上月流水 / 02 匹配银行回单 / 03 差异复核 / 04 生成凭证 | `[data-step]` | 切换步骤 | 本页 |
| 检查项 | 复选框 | `[data-sop-check]` | 勾选 / 取消 | 本页 |
| 下一步 | 下一步 → / 返回第一步 | `#sopNext` | 未完成时禁用 | 本页 |
| 书架 | 执行工作台 / 检查项模板 / 执行分析 | `.sop-shelves button` | 切换页面 | 本页 |
| 搜索 | 搜索当前页… | `#faSearch` | 过滤 | 本页 |
| 表单 | 提交 / 保存 | `.sy-btn-primary` | 演示提交 | 本页 |

## 8. 交互与状态

- **步骤状态**：`store.step`（0–3）与 `store.checks`（每步的勾选数组）；只有当前步骤全部勾选，「下一步」才可用。
- **进度**：`done / all` 实时写入 `.sop-total` 与 `progress`。
- **演示边界**：刷新即重置；不上传、不写存储。
- **无障碍**：`aria-pressed` 标当前步骤；`progress` 有 `aria-label`；`role="status"` 播报状态。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1100px` | 纸张两栏变单栏，索引横向排列 |
| `max-width: 980px` | 侧栏抽屉化 |
| `max-width: 760px` | 书架单列；纸张内边距收紧；字号下调 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 品牌 / 主色 | `frontend-SOP.js` 的 `name` / `accent`；`frontend-experience.js` 的 `directions.sop` |
| 纸张步骤 / 检查项 | `frontend-experience.js` 的 `sopSteps` |
| 工作空间文案 | `frontend-experience.js` 的 `sop()` |
| 页面清单 | `frontend-SOP.js` 的 `nav` / `pages` |
| 单页内容 | 对应 `pages.<id>.render()` |
| 纸张材质 | `frontend-SOP.css` |

## 11. 修改须知

- **关联文件**：`pages/js/frontend-SOP.js`、`pages/css/frontend-SOP.css`、`pages/js/frontend-experience.js`、`pages/js/frontend-core.js`。
- **步骤与检查项是联动的**：改 `sopSteps` 的步骤数要同步页码 `0N / 04`、索引序号、`store.step` 边界与「返回第一步」逻辑。
- **衬线字体**：标题使用宋体 / Georgia，正文仍用无衬线；不要全局换字体。
- **演示数据**：流程版本、责任人、耗时均为样例。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「SOP 流程（设计规范）」章节。
