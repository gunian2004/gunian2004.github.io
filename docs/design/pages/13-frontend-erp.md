# ERP 进销存 · pages/frontend-ERP.html

> 深色导航 + 紧凑网格的工业工作台：采购、销售、库存、档案在同一套操作平面上流转，异常用琥珀色单独拎出来。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-ERP.html`](../../../pages/frontend-ERP.html)（外壳 39 行，页面由 JS 渲染） |
| 线上路径 | `/pages/frontend-ERP.html` |
| 页面类型 | 企业后台设计样例（FA 外壳 + 模块页面） |
| `<title>` | ERP 进销存 · 前端设计规范库 |
| 样式文件 | [`pages/css/frontend-base.css`](../../../pages/css/frontend-base.css)（令牌与组件）、[`pages/css/frontend-experience.css`](../../../pages/css/frontend-experience.css)（六套业务视觉）、[`pages/css/frontend-ERP.css`](../../../pages/css/frontend-ERP.css)（ERP 专属） |
| 脚本文件 | [`pages/js/frontend-core.js`](../../../pages/js/frontend-core.js)（`FA.boot` 外壳）、[`pages/js/frontend-experience.js`](../../../pages/js/frontend-experience.js)（工作空间）、[`pages/js/frontend-ERP.js`](../../../pages/js/frontend-ERP.js)（11 个业务页） |
| 依赖资源 | 无图片；图表为内联 SVG |
| 数据来源 | 全部为演示数据（单号、金额、供应商均为样例），操作只在本页生效 |
| 访问控制 | 无（从规范库密码门进入） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：做进销存 / 供应链后台的人，想参考「高密度但可读」的工业界面。
- **核心任务**：用侧栏组织采购 → 入库 → 质检 → 销售 → 库存 → 档案的完整链路；每页给出 KPI、表格、表单与单据详情。
- **设计观点**：用密度、对齐、状态色组织信息，而不是堆大卡片。

## 3. 页面结构

**外壳（所有子页共用）**

| # | 区块 | 标识 | 内容 |
| --- | --- | --- | --- |
| 1 | 顶部栏 | `.fa-top` | 菜单按钮、返回规范库、品牌「ERP 进销存」、页签、面包屑、当前页搜索、关闭 |
| 2 | 侧栏 | `.fa-side` `#faSide` | 按业务分组的导航（工作空间 / 工作台 / 采购 / 销售 / 库存 / 档案） |
| 3 | 主区 | `.fa-main` `#faMain` | 当前页面渲染区 |
| 4 | 弹窗 / Toast | `#faModal` `#faToast` | 确认弹窗、操作反馈 |

**页面清单（12 个：1 个工作空间 + 11 个业务页）**

| # | 页面 id | 标题 | 说明 | 主要组件 |
| --- | --- | --- | --- | --- |
| 1 | `workspace` | 采购指挥台 | 每一笔流转都有迹可循 | Hero、4 项 KPI 条、5 步流程、库位矩阵、异常队列、设计语言 |
| 2 | `overview` | 经营概览 | 采购、在途、入库与异常一屏掌握 | KPI、折线图、待办列表、最近采购表 |
| 3 | `req` | 请购单 | 需求部门提报，审批通过后转采购订单 | 表单、待审批表 |
| 4 | `po` | 采购订单 | 按状态与交期筛选，支持批量审批与导出 | 表格（多选）、分页、单据详情 |
| 5 | `inbound` | 入库单 | 登记到货批次，提交后进入质检 | 表单、最近入库列表 |
| 6 | `qc` | 质检单 | 按抽样比例记录不良，判定整批是否放行 | 表单、质检表 |
| 7 | `so` | 销售订单 | 按客户与交期跟踪履约 | 表格 |
| 8 | `ship` | 发货单 | 按订单生成发货批次并回写库存 | 表单、发货列表 |
| 9 | `stock` | 库存查询 | 按仓库查看可用、在途与安全库存 | 表格 |
| 10 | `transfer` | 调拨单 | 仓间转移，出库与入库分别留痕 | 表单、调拨列表 |
| 11 | `supplier` | 供应商 | 合作状态、评级与交付表现 | 表格 |
| 12 | `item` | 物料 | SKU、单位与安全库存维护 | 表格 |

## 4. 布局

- **外壳**：`.fa-shell` 满屏 flex 纵向；`.fa-top` 固定高 52px；`.fa-body` 为「侧栏 212px + 主区」（ERP 主题沿用默认侧栏宽度）。
- **侧栏**：分组标题 + 可折叠子项；子项有二级菜单（收货与入库 → 入库单 / 质检单）。
- **主区**：`padding: 18px`；页面多为 `fa-grid2` 两栏（`1.4fr / 1fr`：主表格 + 右侧单据详情）。
- **表格**：整宽、行高 40px、数字右对齐、状态用 `sy-badge`。
- **窄屏**：≤ 980px 侧栏抽屉化，顶部菜单按钮控制；≤ 760px 两栏叠成一栏，表格横向滚动。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 深色导航 | `.chrome-erp` 侧栏 | `#15252b` |
| 页面底色 / 浅表面 | `--bg` / `--surface` | `#f6f7f9` / `#ffffff` |
| 工业绿主色（实际渲染） | `frontend-experience.js` 覆盖后的 accent | `#345c52` |
| 模块配置主色 | `frontend-ERP.js` 的 `accent`（被 workspace 覆盖） | `#2563eb` |
| 网格线 / 描边 | `frontend-ERP.css` | `#d7ded6` |
| 异常琥珀 | `frontend-ERP.css` | `#e4a83b` / `#edc47a` |
| 正文 / 次要 | `--text` / `--text-2` | `#101828` / `#5b6573` |
| 状态色 | `--success` / `--warning` / `--danger` | `#0f9d63` / `#b45309` / `#d92d20` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 页面标题 | 22–28px / 650 | Hero 标题更大 |
| 面板标题 | 13px / 600 | `FA.panel` |
| 正文 / 表格 | 12–13px / 400 | 密度高，行高 1.5 |
| KPI 数字 | 22–28px / 700，等宽数字 | |
| 单号 / 金额 | `--mono` | `PO-1042`、`128,400.00` |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 圆角 | 面板 14px、按钮 8px、徽标 999px |
| 间距 | 4pt 栅格（`--s2…--s6`） |
| 表格行高 | 40px |
| 面板内边距 | 16–20px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 页面切换 | 点击侧栏 / 页签 | 主区内容替换，滚动位置保留 |
| 子菜单 | 点击「收货与入库」 | 展开 / 收起，`aria-expanded` |
| 操作反馈 | 提交 / 导出 | `FA.toast` 底部提示 |
| 弹窗 | 通过 / 新建 | `#faModal` 淡入 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| FA 外壳 | `FA.boot()` `.fa-shell` `.fa-top` `.fa-side` `.fa-main` | 导航、页签、面包屑、搜索、弹窗、Toast |
| KPI | `FA.kpi()` `.sy-kpi-row` `.sy-kpi` | 指标 + 变化 |
| 面板 | `FA.panel(title, body, actions)` `.sy-panel` | 标题 + 内容 + 右上操作 |
| 表格 | `FA.table(cols, rows, opts)` `.sy-table` | 支持多选、数字对齐、分页 |
| 表单 | `FA.form(fields, actions)` `.sy-form-grid` | 输入 / 下拉 / 文本域 |
| 列表 | `FA.rows()` `.fa-rows` | 紧凑行列表 |
| 折线 | `FA.line()` `.sy-chart` | 内联 SVG |
| 库位矩阵 | `.erp-matrix` `.erp-cell` | 24 格，低于 25% 标红 |
| 流程条 | `.erp-flow` | 请购 → 采购 → 入库 → 质检 → 发货 |
| 异常队列 | `.erp-alerts` | 需关注单据 |
| 单据详情 | `.fa-fact` `.fa-fact-row` `.fa-fact-total` | 右侧事实卡 |
| 徽标 | `.sy-badge-*` | 待复核 / 已入库 / 已驳回 / 在途 |
| 分页 | `.sy-pager` `.sy-page` | 表格分页 |
| 设计语言 | `.ds-guide` `.ds-palette` | 可折叠的配色与说明 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回规范库 | ← | `.fa-home` | 跳转 | `frontend-style.html` |
| 关闭 | ✕ | `#faClose` | 跳转 | `frontend-style.html` |
| 菜单 | ☰ | `#faMenuBtn` | 展开 / 收起侧栏 | 本页 |
| 侧栏导航 | 经营概览 / 请购单 / 采购订单 / … | `.fa-nav` `[data-page]` | 切换页面 | 本页 |
| 页签 | 已打开的页面 | `.fa-tabs` | 切换 / 关闭页签 | 本页 |
| 搜索 | 搜索当前页… | `#faSearch` | 过滤当前页表格 / 卡片 | 本页 |
| 主按钮 | 提交请购 / 提交入库 / 创建并提交 | `.sy-btn-primary` | 提交表单 / 打开弹窗 | 本页 |
| 次按钮 | 转采购 / 导出 / 退回 / 全部订单 | `.sy-btn-secondary` | 打开弹窗或提示 | 本页 |
| 弹窗确认 | 通过 / 创建并提交 / 确认 | `#faModal` 按钮 | 执行演示操作 | 本页 |
| 分页 | ‹ / 1 / 2 / › | `.sy-page` | 页码切换 | 本页 |
| 设计语言 | 设计语言 ＋ | `.ds-guide summary` | 展开配色说明 | 本页 |

## 8. 交互与状态

- **状态容器**：`frontend-experience.js` 用内存 `store` 保存库位、商机、步骤、筛选等状态；刷新页面即重置，不写本地存储。
- **页面切换**：`FA.setPage()` 渲染目标页面、更新页签与面包屑、恢复滚动位置、重新应用搜索。
- **表单**：提交后 `FA.toast` 提示；危险操作走 `FA.modal()` 二次确认。
- **搜索**：仅过滤当前页的行 / 卡片，不跨页。
- **空态 / 错误态**：表格无数据显示空行提示；弹窗可取消。
- **无障碍**：`aria-expanded` / `aria-current` / `aria-label` 齐全；Esc 关闭抽屉 / 弹窗；焦点在弹窗内。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1100px` | 两栏页面变单栏，单据详情移到表格下方 |
| `max-width: 980px` | 侧栏抽屉化，顶部菜单按钮出现 |
| `max-width: 760px` | 表格横向滚动；KPI 两列；表单单列 |
| `prefers-reduced-motion` | 关闭过渡 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 品牌名 / 首字母 | `frontend-ERP.js` 的 `name` / `logo` |
| 主色 / 视觉方向 | `frontend-experience.js` 的 `directions.erp` 与 `frontend-ERP.css` |
| 导航分组 / 页面 | `frontend-ERP.js` 的 `nav` 与 `pages` |
| 单个页面内容 | 对应 `pages.<id>.render()` |
| 工作空间 | `frontend-experience.js` 的 `erp()` |
| 表格 / 表单样式 | `frontend-base.css` 的 `sy-table` / `sy-form-grid` |
| ERP 专属样式 | `frontend-ERP.css` |

## 11. 修改须知

- **关联文件**：`pages/js/frontend-ERP.js`、`pages/css/frontend-ERP.css`、`pages/js/frontend-experience.js`、`pages/js/frontend-core.js`、`pages/css/frontend-base.css`。
- **新增页面**：在 `pages` 加 render + 在 `nav` 加项；`workspace` 由 `frontend-experience.js` 注入，不要重复定义。
- **演示数据**：所有金额 / 单号 / 供应商均为样例，不得替换成真实业务数据。
- **状态色语义**：待复核=warning、已入库=success、已驳回=danger、在途=info，不要混用。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「ERP 进销存（设计规范）」章节。
