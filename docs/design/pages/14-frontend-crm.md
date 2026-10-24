# CRM 销售 · pages/frontend-CRM.html

> 紫色销售画布：把「阶段」做成布局骨架，商机卡随推进移动，金额、负责人和下一步保持清晰层级。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-CRM.html`](../../../pages/frontend-CRM.html) |
| 线上路径 | `/pages/frontend-CRM.html` |
| 页面类型 | 企业后台设计样例（FA 外壳 + 模块页面） |
| `<title>` | CRM 销售 · 前端设计规范库 |
| 样式文件 | [`pages/css/frontend-base.css`](../../../pages/css/frontend-base.css)、[`pages/css/frontend-experience.css`](../../../pages/css/frontend-experience.css)、[`pages/css/frontend-CRM.css`](../../../pages/css/frontend-CRM.css) |
| 脚本文件 | [`pages/js/frontend-core.js`](../../../pages/js/frontend-core.js)、[`pages/js/frontend-experience.js`](../../../pages/js/frontend-experience.js)、[`pages/js/frontend-CRM.js`](../../../pages/js/frontend-CRM.js) |
| 依赖资源 | 无图片；头像用首字母圆片 |
| 数据来源 | 演示数据（客户、金额、负责人均为样例） |
| 访问控制 | 无（从规范库密码门进入） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：做 CRM / 销售管理后台的人，需要「关系推进」而不是「表格堆叠」的界面参考。
- **核心任务**：用看板表达商机阶段；每列显示数量与金额合计；点按钮推进 / 退回卡片，金额随之变化。
- **设计观点**：阶段即结构；卡片的层级是「客户 → 金额 → 下一步动作」。

## 3. 页面结构

**外壳**：同 [ERP 页](13-frontend-erp.md) 的 FA 外壳（顶栏、主区、弹窗、Toast），但 CRM 主题隐藏侧栏、启用顶部页签（`cfg.tabs`）导航。

**页面清单（8 个）**

| # | 页面 id | 标题 | 说明 | 主要组件 |
| --- | --- | --- | --- | --- |
| 1 | `workspace` | 销售工作空间 | 把关系推进一步 | Hero、业绩脉冲、三列商机看板、快捷入口、设计语言 |
| 2 | `overview` | 销售概览 | 本季度管道金额、赢单率与待跟进 | KPI、柱状图、待跟进列表 |
| 3 | `leads` | 线索池 | 未分配线索按来源与热度排序 | 表格 |
| 4 | `pipeline` | 商机管道 | 阶段推进与停留时长 | 看板 |
| 5 | `customers` | 客户列表 | 客户等级、负责人和最近联系 | 表格 |
| 6 | `contacts` | 联系人 | 决策链角色与联系方式 | 表格 |
| 7 | `activities` | 跟进记录 | 通话、拜访、邮件与下一步安排 | 表单、动态列表 |
| 8 | `forecast` | 业绩预测 | 按阶段概率加权，输出本季预测 | KPI、预测表 |

## 4. 布局

- **外壳**：CRM 主题**不显示侧栏**，主区单栏；导航依靠顶部页签（`.fa-tabs`）与快捷入口。主区两栏（表格 + 详情）为主。
- **工作空间**：`.crm-pulse` 顶部三块指标 + 说明；`.crm-board` 三列等宽看板（建立联系 / 方案与报价 / 合作达成）。
- **商机卡**：`.crm-deal` 纵向：阶段眉题、客户名、金额、跟进时间、负责人、推进按钮。
- **页签**：CRM 与 BI 启用顶部页签，方便在多个页面间来回。
- **断点**：≤ 1100px 看板三列变两列；≤ 760px 单列，表格横向滚动。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 画布底色 | `frontend-experience.js` 色板 | `#f5f2fa` |
| 卡片表面 | 同上 | `#ffffff` |
| 主色 | 同上 / accent | `#7654ba`（紫） |
| 浅紫辅助 | 同上 | `#d6c7ec` |
| 表格描边 | `frontend-CRM.css` | `#e2dce9` |
| 深紫文字 | 同上 | `#7b7486` |
| 成功 / 警告 | 语义色 | `#0f9d63` / `#b45309` |
| 正文 / 次要 | `--text` / `--text-2` | `#101828` / `#5b6573` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 工作空间 `h1` | 28–34px / 700 | 两行断句 |
| 看板列标题 | 13px / 600 | 附数量小标 |
| 商机名 | 15px / 600 | |
| 金额 | 18px / 700 | |
| 正文 | 12–13px | |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 卡片圆角 | 16–18px（本次方向偏柔和） |
| 看板列圆角 | 18px |
| 头像 | 圆形 26–32px |
| 列间距 | 14px |
| 卡片内边距 | 16–18px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 推进商机 | 点击「推进 →」/「返回报价 ↶」 | 卡片移到下一列，列计数与金额重算 |
| Toast | 推进后 | 「演示商机阶段已更新」 |
| 页面切换 | 页签 / 快捷入口 | 主区替换 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 业绩脉冲 | `.crm-pulse` `.crm-avatars` | 商机总额、目标、团队 |
| 看板 | `.crm-board` `.crm-column` `.crm-cardstack` | 三阶段列 |
| 商机卡 | `.crm-deal` `.crm-follow` `.crm-person` | 客户、金额、跟进、负责人、推进 |
| 空列 | `.crm-empty` | 该阶段暂无商机 |
| KPI | `FA.kpi()` | 概览 / 预测 |
| 柱状图 | `FA.bars()` | 销售概览 |
| 表格 | `FA.table()` | 线索 / 客户 / 联系人 / 预测 |
| 看板页 | `FA.kanban()` | 商机管道 |
| 表单 | `FA.form()` | 跟进记录 |
| 快捷入口 | `.ds-bottom-links` | 完整管道 / 客户 / 预测 |
| 设计语言 | `.ds-guide` `.ds-palette` | 配色说明 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回规范库 | ← / ✕ | `.fa-home` / `#faClose` | 跳转 | `frontend-style.html` |
| 页签 | 销售概览 / 线索池 / 商机管道 / 客户管理 / 业绩预测 | `.fa-tabs` | 切换 / 关闭页签 | 本页 |
| 推进商机 | 推进 → / 返回报价 ↶ | `[data-deal]` | 移动卡片并重算金额 | 本页 |
| 搜索 | 搜索当前页… | `#faSearch` | 过滤 | 本页 |
| 快捷入口 | 完整商机管道 / 客户与联系人 / 业绩预测 | `.ds-bottom-links button` | 切换页面 | 本页 |
| 表单提交 | 保存 / 提交 | `.sy-btn-primary` | 记录跟进 | 本页 |
| 设计语言 | 设计语言 ＋ | `.ds-guide summary` | 展开说明 | 本页 |

## 8. 交互与状态

- **看板状态**：`store.deals` 记录 4 张卡片的阶段；推进到最后阶段再点会退回「方案与报价」；每次操作触发 `refresh()` 重绘并聚焦按钮。
- **金额合计**：每列按当前卡片金额求和，空列显示提示。
- **演示边界**：所有操作只在当前页面内存中生效，不写存储、不发请求。
- **无障碍**：按钮带 `aria-label`；推进按钮可键盘操作；看板列有语义标题。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1100px` | 看板三列变两列 |
| `max-width: 980px` | 顶部页签可横向滚动；主区单栏 |
| `max-width: 760px` | 看板单列；脉冲区单列；表格横向滚动 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 品牌 / 主色 | `frontend-CRM.js` 的 `name` / `accent`；`frontend-experience.js` 的 `directions.crm` |
| 工作空间看板 | `frontend-experience.js` 的 `crm()` 与 `deals` 数组 |
| 页面清单 | `frontend-CRM.js` 的 `nav` / `pages` |
| 单页内容 | 对应 `pages.<id>.render()` |
| 紫色材质 | `frontend-CRM.css` |
| 阶段名称 | `frontend-experience.js` 的 `['建立联系','方案与报价','合作达成']` |

## 11. 修改须知

- **关联文件**：`pages/js/frontend-CRM.js`、`pages/css/frontend-CRM.css`、`pages/js/frontend-experience.js`、`pages/js/frontend-core.js`。
- **阶段顺序**：看板依赖固定三阶段，新增阶段要同步 `store.deals` 判定与卡片按钮文案。
- **金额格式**：统一用 `money()` 输出两位小数与千分位。
- **演示数据**：客户名、金额、负责人均为样例，不能替换为客户真实信息。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「CRM 销售（设计规范）」章节。
