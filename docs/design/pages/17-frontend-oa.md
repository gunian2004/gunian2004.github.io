# HR / OA 审批 · pages/frontend-OA.html

> 暖色审批收件箱：左侧选申请，右侧读详情、写意见、做决策；状态与待办数量随本页操作一起变化。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-OA.html`](../../../pages/frontend-OA.html) |
| 线上路径 | `/pages/frontend-OA.html` |
| 页面类型 | 企业后台设计样例（FA 外壳 + 模块页面） |
| `<title>` | HR / OA 审批 · 前端设计规范库 |
| 样式文件 | [`pages/css/frontend-base.css`](../../../pages/css/frontend-base.css)、[`pages/css/frontend-experience.css`](../../../pages/css/frontend-experience.css)、[`pages/css/frontend-OA.css`](../../../pages/css/frontend-OA.css) |
| 脚本文件 | [`pages/js/frontend-core.js`](../../../pages/js/frontend-core.js)、[`pages/js/frontend-experience.js`](../../../pages/js/frontend-experience.js)、[`pages/js/frontend-OA.js`](../../../pages/js/frontend-OA.js) |
| 依赖资源 | 无图片；头像用姓氏圆片 |
| 数据来源 | 演示数据（申请人、金额、审批意见均为样例） |
| 访问控制 | 无（从规范库密码门进入） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：做审批流 / 员工自助后台的人，需要「收件箱 + 详情 + 时间线」的参考。
- **核心任务**：让人在一条水平线上完成「选任务 → 看详情 → 写意见 → 同意 / 退回」，并立即看到待办数量变化。
- **设计观点**：暖色留白降低审批的压迫感；决策按钮是页面的唯一强动作。

## 3. 页面结构

**外壳**：同 [ERP 页](13-frontend-erp.md) 的 FA 外壳。

**页面清单（7 个）**

| # | 页面 id | 标题 | 说明 | 主要组件 |
| --- | --- | --- | --- | --- |
| 1 | `workspace` | 我的审批空间 | 把精力留给重要的决定 | Hero、待处理计数、收件箱队列、申请信、审批时间线、意见框、决策按钮 |
| 2 | `todo` | 待办中心 | 需要你处理的审批与提醒 | KPI、待办列表 |
| 3 | `leave` | 请假申请 | 选择类型与时间，提交后按审批流流转 | 表单 |
| 4 | `expense` | 报销申请 | 票据、费用类型与分摊 | 表单、票据列表 |
| 5 | `payment` | 付款申请 | 填写金额与用途，附件可后补 | 表单、付款列表 |
| 6 | `org` | 通讯录 | 按部门查看汇报线 | 表格 |
| 7 | `flow` | 审批流设置 | 按金额与类型配置审批节点 | 表格 |

## 4. 布局

- **外壳**：OA 主题侧栏 264px（窄队列导航），主区常规两栏。
- **工作空间**：`.oa-overline` 待处理计数；`.oa-inbox` 两栏 `0.9fr / 1.3fr`（左队列、右申请信）。
- **队列项**：头像 + 姓名 / 类型 + 金额 + 部门日期 + 状态徽标，选中项左侧强调条。
- **申请信**：头部（单号 / 类型 / 状态）、金额大字、信息 `dl`、事由、三段时间线、意见框、决策按钮。
- **断点**：≤ 1100px 收件箱两栏变单栏；≤ 760px 时间线纵向、按钮整宽。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 暖色留白 | `directions.oa` | `#f8f5f1` |
| 卡片表面 | 同上 | `#ffffff` |
| 主色（陶土橙） | 同上 / accent | `#a95735` |
| 浅暖辅助 | 同上 | `#e8d5c7` |
| 描边 | `frontend-OA.css` | `#e7ddd3` / `#e4d9ce` |
| 次要文字 | 同上 | `#8d7e72` / `#a08a77` |
| 纸面 | 同上 | `#fffdf9` |
| 同意 / 退回 | 语义色 | success `#0f9d63` / danger `#d92d20` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 工作空间 `h1` | 30–36px / 700 | 两行 |
| 申请类型 `h2` | 22px / 650 | |
| 金额 | 30–34px / 750 | 等宽数字 |
| 正文 / 字段 | 12.5–13px | |
| 时间线 | 11–12px | |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 卡片圆角 | 16–18px |
| 申请信圆角 | 18px |
| 头像 | 圆形 30–36px |
| 队列项内边距 | 14–16px |
| 时间线节点 | 24px 圆点 |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 选择申请 | 点击队列项 | 右侧详情切换，选中态高亮 |
| 决策 | 同意 / 退回 | 状态徽标与待办计数更新，出现「撤销演示操作」 |
| 意见保留 | 切换申请 | 每份申请的意见分别保留 |
| Toast | 决策后 | 「已更新本页演示状态」 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 待处理计数 | `.oa-overline` | 待审批数量 |
| 收件箱 | `.oa-queue` `.oa-request` `.oa-avatar` | 申请列表 |
| 状态徽标 | `.oa-request em` / `.oa-status` | 待审批 / 已同意 / 已退回 |
| 申请信 | `.oa-letter` `.oa-letter-head` `.oa-letter-amount` | 单号、类型、金额 |
| 信息表 | `.oa-info` `dl` | 申请人、部门、日期、附件 |
| 事由 | `.oa-reason` | 申请说明 |
| 时间线 | `.oa-timeline` `.is-done` `.is-current` | 提交 → 审批 → 归档 |
| 意见框 | `#dsOpinion` `.oa-opinion` | 审批意见 |
| 决策 | `.oa-decisions` `[data-decision]` | 退回补充 / 同意申请 / 撤销 |
| 表单 / 表格 | `FA.form()` / `FA.table()` | 请假、报销、付款、通讯录、审批流 |
| 设计语言 | `.ds-guide` | 配色说明 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回规范库 | ← / ✕ | `.fa-home` / `#faClose` | 跳转 | `frontend-style.html` |
| 菜单 | ☰ | `#faMenuBtn` | 侧栏开关 | 本页 |
| 侧栏导航 | 待办中心 / 我的申请 / 请假申请 / 报销申请 / 付款申请 / 通讯录 / 审批流设置 | `.fa-nav` | 切换页面 | 本页 |
| 选择申请 | 队列项 | `[data-request]` | 切换详情 | 本页 |
| 发起申请 | 发起一份申请 | Hero 按钮 | 跳到请假申请 | 本页 |
| 同意 | 同意申请 ✓ | `[data-decision="已同意"]` | 更新状态与计数 | 本页 |
| 退回 | 退回补充 | `[data-decision="已退回"]` | 更新状态与计数 | 本页 |
| 撤销 | 撤销演示操作 | `[data-decision="待审批"]` | 恢复待审批 | 本页 |
| 提交 | 提交申请 / 保存 | `.sy-btn-primary` | 演示提交 | 本页 |

## 8. 交互与状态

- **状态模型**：`store.statuses` 三份申请的状态；`store.request` 当前选中；`store.opinions` 分别保存意见。
- **待办计数**：每次决策后按 `statuses` 中「待审批」的数量重算。
- **时间线**：当前节点随状态变化（待审批显示 2，已同意显示 ✓）。
- **演示边界**：不写存储、不发请求；刷新恢复初始。
- **无障碍**：队列项 `aria-pressed`；意见框有 label；决策结果 `role="status"` 播报。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1100px` | 收件箱两栏变单栏，先队列后详情 |
| `max-width: 980px` | 侧栏抽屉化 |
| `max-width: 760px` | 决策按钮整宽；时间线纵向；表单单列 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 品牌 / 主色 | `frontend-OA.js` 的 `name` / `accent`；`frontend-experience.js` 的 `directions.oa` |
| 工作空间申请数据 | `frontend-experience.js` 的 `requests` 数组 |
| 页面清单 | `frontend-OA.js` 的 `nav` / `pages` |
| 单页内容 | 对应 `pages.<id>.render()` |
| 暖色材质 | `frontend-OA.css` |
| 审批流节点 | `frontend-experience.js` 的 `oa()` 时间线部分 |

## 11. 修改须知

- **关联文件**：`pages/js/frontend-OA.js`、`pages/css/frontend-OA.css`、`pages/js/frontend-experience.js`、`pages/js/frontend-core.js`。
- **演示数据**：申请人姓名是真实感样例，但与真实业务无关；不要填入真实员工信息。
- **状态语义**：待审批 / 已同意 / 已退回三态固定；新增状态要同步徽标样式、计数逻辑与时间线。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「HR / OA 审批（设计规范）」章节。
