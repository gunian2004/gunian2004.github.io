# 财务 / 费控 · pages/frontend-FIN.html

> 墨绿账簿与米白凭证：索引联动借贷明细，金额按币种单独列示，用规则线、对齐与印章感强调「可核对」。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-FIN.html`](../../../pages/frontend-FIN.html) |
| 线上路径 | `/pages/frontend-FIN.html` |
| 页面类型 | 企业后台设计样例（FA 外壳 + 模块页面） |
| `<title>` | 财务 / 费控 · 前端设计规范库 |
| 样式文件 | [`pages/css/frontend-base.css`](../../../pages/css/frontend-base.css)、[`pages/css/frontend-experience.css`](../../../pages/css/frontend-experience.css)、[`pages/css/frontend-FIN.css`](../../../pages/css/frontend-FIN.css) |
| 脚本文件 | [`pages/js/frontend-core.js`](../../../pages/js/frontend-core.js)、[`pages/js/frontend-experience.js`](../../../pages/js/frontend-experience.js)、[`pages/js/frontend-FIN.js`](../../../pages/js/frontend-FIN.js) |
| 依赖资源 | 无图片；印章、凭证表格用 CSS 实现 |
| 数据来源 | 演示数据（账户余额、凭证金额均为样例） |
| 访问控制 | 无（从规范库密码门进入） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：做财务 / 费控 / 资金后台的人，需要「账簿感 + 可核对」的界面参考。
- **核心任务**：用凭证索引联动借贷明细，展示余额、票据、对账、支付与报表；金额必须对齐、币种必须分列。
- **设计观点**：财务界面的信任来自秩序——等宽数字、规则线、明确的借贷方向。

## 3. 页面结构

**外壳**：同 [ERP 页](13-frontend-erp.md) 的 FA 外壳。

**页面清单（7 个）**

| # | 页面 id | 标题 | 说明 | 主要组件 |
| --- | --- | --- | --- | --- |
| 1 | `workspace` | 资金账簿 | 资金有序，账目清晰 | Hero、双币种余额、凭证索引、记账凭证、印章、复制摘要 |
| 2 | `overview` | 资金概览 | 账户余额、待付款与本月流出 | KPI、表格 |
| 3 | `invoices` | 票据采集 | OCR 识别、验真与查重 | 表单、票据列表 |
| 4 | `recon` | 票据对账 | 左侧票据队列，右侧明细与差异处理 | 双栏对账台 |
| 5 | `payments` | 支付批次 | 同类付款合并成批，一次授权 | 表格 |
| 6 | `fx` | 汇率快照 | 每日 09:00 抓取，用于本币折算 | 表格 |
| 7 | `reports` | 财务报表 | 利润表、现金流与费用结构 | 表格、柱状图 |

## 4. 布局

- **外壳**：FIN 主题侧栏 296px（宽账簿导航），主区常规两栏。
- **工作空间**：`.fin-balance` 双栏余额（人民币合计 + 外币单独列示）；`.fin-desk` 两栏（凭证索引 + 记账凭证）。
- **凭证索引**：`.fin-entry` 纵向列表，选中项左侧强调条；含单号 / 日期 / 摘要 / 金额。
- **记账凭证**：`.fin-voucher` 表格式，借贷两列、合计行；底部制单 / 复核与印章。
- **断点**：≤ 1100px 索引与凭证上下排列；≤ 760px 凭证表格横向滚动。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 账簿底色 | `directions.fin` | `#f3f3ec` |
| 凭证纸面 | 同上 | `#fffef9` |
| 主色（墨绿） | 同上 / accent | `#244e42` |
| 辅助（金棕） | 同上 | `#b29b6b` |
| 规则线 | `frontend-FIN.css` | `#d6d9c9` |
| 次要文字 | 同上 | `#7d8271` |
| 印章红 | `frontend-FIN.css` | `#a6705d` |
| 借贷 / 涨跌 | `--up` / `--down` | `#d92d20` / `#0f9d63` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 工作空间 `h1` | 30–36px / 700 | |
| 余额 | 34–40px / 750，等宽数字 | 人民币大字 |
| 凭证标题 | 18px / 650，字距 .2em | 「记账凭证」 |
| 表格 | 12–13px，金额右对齐等宽 | |
| 印章 | 12px，双行竖排 | 「借贷平衡」 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 凭证圆角 | 6–10px（克制） |
| 面板圆角 | 14px |
| 表格行高 | 38–40px |
| 规则线 | 1px `#d6d9c9` |
| 印章 | 圆形/椭圆描边，旋转 -8° |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 切换凭证 | 点击索引项 | 右侧借贷明细与合计重算 |
| 复制摘要 | 点击按钮 | 复制凭证摘要文本 |
| 页面切换 | 侧栏 | 主区替换 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 余额区 | `.fin-balance` | 人民币合计 + 外币单独列示 |
| 凭证索引 | `.fin-journal` `.fin-entry` | 单号、日期、摘要、金额 |
| 记账凭证 | `.fin-voucher` `.fin-voucher-table` | 科目、借方、贷方、合计 |
| 印章 | `.fin-stamp` | 「借贷平衡」 |
| 制单信息 | `.fin-voucher footer` | 制单 / 复核 / 样例声明 |
| 复制摘要 | `[data-copy-voucher]` | 拼接摘要到剪贴板 |
| KPI / 表格 / 柱状 | `FA.kpi()` / `FA.table()` / `FA.bars()` | 概览、支付、汇率、报表 |
| 对账台 | `.fin-*` + `Frontend-FIN.js` | 票据队列 + 明细 |
| 设计语言 | `.ds-guide` | 配色说明 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回规范库 | ← / ✕ | `.fa-home` / `#faClose` | 跳转 | `frontend-style.html` |
| 菜单 | ☰ | `#faMenuBtn` | 侧栏开关 | 本页 |
| 侧栏导航 | 资金概览 / 支付批次 / 票据管理 / 票据采集 / 票据对账 / 汇率快照 / 财务报表 | `.fa-nav` | 切换页面 | 本页 |
| 选择凭证 | 索引项 | `[data-voucher]` | 切换借贷明细 | 本页 |
| 复制摘要 | 复制凭证摘要 | `[data-copy-voucher]` | 复制文本 | 剪贴板 |
| 快捷入口 | 票据对账 / 财务报表 | `.fin-journal-foot button` | 切换页面 | 本页 |
| 表单 | 提交 / 保存 | `.sy-btn-primary` | 演示提交 | 本页 |
| 搜索 | 搜索当前页… | `#faSearch` | 过滤 | 本页 |

## 8. 交互与状态

- **凭证状态**：`store.voucher` 索引；切换重绘右侧表格与摘要，合计自动等于借方 = 贷方。
- **复制**：摘要格式 `单号 | 日期 | 摘要` 加借贷两行，金额带千分位。
- **演示边界**：不连接真实账户 / 票据系统；金额与凭证均为样例，页面明确标注。
- **无障碍**：索引项 `aria-pressed`；表格有表头与合计行；复制成功有提示。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1100px` | 索引与凭证上下排列 |
| `max-width: 980px` | 侧栏抽屉化 |
| `max-width: 760px` | 凭证表格横向滚动；余额区单列 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 品牌 / 主色 | `frontend-FIN.js` 的 `name` / `accent`；`frontend-experience.js` 的 `directions.fin` |
| 工作空间余额 / 凭证数据 | `frontend-experience.js` 的 `vouchers` 与 `fin()` |
| 页面清单 | `frontend-FIN.js` 的 `nav` / `pages` |
| 单页内容 | 对应 `pages.<id>.render()` |
| 账簿材质 | `frontend-FIN.css` |
| 复制摘要格式 | `frontend-experience.js` 的 `data-copy-voucher` 处理 |

## 11. 修改须知

- **关联文件**：`pages/js/frontend-FIN.js`、`pages/css/frontend-FIN.css`、`pages/js/frontend-experience.js`、`pages/js/frontend-core.js`。
- **金额规则**：所有金额用 `money()` 两位小数 + 千分位；借贷必须平衡；外币单独列示，不混入人民币合计。
- **演示声明**：页面上「本凭证为界面样例，仅供演示」不能删除。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「财务 / 费控（设计规范）」章节。
