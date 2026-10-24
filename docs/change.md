# 页面变更记录 · Change Log

> 站点每个页面的变更账本。**改页面必须记账**：代码改动与页面文档、本记录三者同步。
> 完整流程（必读顺序、文档同步矩阵、自检清单）见根目录 [`AGENT.md`](../AGENT.md)。

---

## 0. 使用规则

1. **一处改动，一条记录**：每次修改某个页面，就在本文对应页面的小节追加一行，不要合并多次无关改动。
2. **只写已发生的事实**：没做的改动不写；计划中的改动写到对应 OpenSpec change 里，不写进本文件。
3. **类型固定**：`新增` / `修改` / `修复` / `重构` / `删除` / `文档`。
4. **影响文件写全**：HTML / CSS / JS / 图片资源，多个用 `、` 分隔，路径相对仓库根。
5. **同步文档写全**：本次是否更新了 `docs/design/pages/*.md`、`docs/design/README.md`。
6. **最新在上**：每个页面小节内，新记录插在表格最上方。

记录格式（表格列不可增删）：

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |

## 1. 变更总览（最近 20 条）

| 日期 | 页面 | 类型 | 一句话说明 |
| --- | --- | --- | --- |
| 2026-10-24 | 全部页面 | 文档 | 建立 `docs/` 设计文档体系：18 份页面文档 + 变更记录 + `AGENT.md` 协作规范 |

---

## 2. 首页

页面文档：[01-home.md](design/pages/01-home.md) · 文件：`index.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立首页文档基线：整理 10 个区块、双栏/两列布局、纸感配色、16 类组件与按钮入口；代码未改动 | — | `docs/design/pages/01-home.md` | Agent |

## 3. 项目演示

页面文档：[02-demo.md](design/pages/02-demo.md) · 文件：`pages/demo.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立项目演示文档基线：ERP 7 图 + 上架 4 图 + 2 段视频，截图画廊与双弹窗交互；代码未改动 | — | `docs/design/pages/02-demo.md` | Agent |

## 4. 小工具

页面文档：[03-tool.md](design/pages/03-tool.md) · 文件：`pages/tool.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立小工具文档基线：8 个工具、侧栏筛选/搜索、hash 与 localStorage 记忆、窄屏输入/结果切换；代码未改动 | — | `docs/design/pages/03-tool.md` | Agent |

## 5. 小技能 · 知识手册

页面文档：[04-ai-knowledge.md](design/pages/04-ai-knowledge.md) · 文件：`pages/AI.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立知识手册文档基线：6 主题 35 条笔记、搜索/分类/复制全文/复制全部规则、手册封面；代码未改动 | — | `docs/design/pages/04-ai-knowledge.md` | Agent |

## 6. 高性价比人生指南

页面文档：[05-life-guide.md](design/pages/05-life-guide.md) · 文件：`pages/life-guide.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立人生指南文档基线：34 节 650 条、顶栏/侧栏目录、A 级与说人话筛选、明暗主题、收藏与续读；代码未改动 | — | `docs/design/pages/05-life-guide.md` | Agent |

## 7. 工作经验库

页面文档：[06-work.md](design/pages/06-work.md) · 文件：`pages/work.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立工作经验库文档基线：2 条经验、深夜蓝主题、折叠卡片、命令复制与撤销块；代码未改动 | — | `docs/design/pages/06-work.md` | Agent |

## 8. 问题排查库

页面文档：[07-troubleshooting.md](design/pages/07-troubleshooting.md) · 文件：`pages/troubleshooting.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立问题排查库文档基线：内置 8 条、搜索/分类/收藏、本地增删改、JSON 备份；代码未改动 | — | `docs/design/pages/07-troubleshooting.md` | Agent |

## 9. 开发文档模板台

页面文档：[08-doc-templates.md](design/pages/08-doc-templates.md) · 文件：`pages/doc-templates.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立文档模板台基线：4 层级 3/5/8/10 份、变量表单、Markdown 编辑器、ZIP 导出、草稿备份；代码未改动 | — | `docs/design/pages/08-doc-templates.md` | Agent |

## 10. 命令与代码片段

页面文档：[09-snippets.md](design/pages/09-snippets.md) · 文件：`pages/snippets.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立片段库基线：16 条内置、6 类分类、参数化预览、收藏与 JSON 导入导出；代码未改动 | — | `docs/design/pages/09-snippets.md` | Agent |

## 11. 前端设计规范库

页面文档：[10-frontend-style.md](design/pages/10-frontend-style.md) · 文件：`pages/frontend-style.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立规范库入口文档基线：8 个类目、一页一色、搜索与三类筛选、纯 CSS 缩略图；代码未改动 | — | `docs/design/pages/10-frontend-style.md` | Agent |

## 12. 金融类（设计规范）

页面文档：[11-frontend-finance.md](design/pages/11-frontend-finance.md) · 文件：`pages/frontend-finance.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立金融类文档基线：5 套皮肤、九组组件规范、票据存根与确认流程；代码未改动 | — | `docs/design/pages/11-frontend-finance.md` | Agent |

## 13. 系统级规范

页面文档：[12-frontend-spec.md](design/pages/12-frontend-spec.md) · 文件：`pages/frontend-spec.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立系统级规范基线：令牌实验台、13 节目录、6 个页面范式入口、弹层与命令面板；代码未改动 | — | `docs/design/pages/12-frontend-spec.md` | Agent |

## 14. ERP 进销存（设计规范）

页面文档：[13-frontend-erp.md](design/pages/13-frontend-erp.md) · 文件：`pages/frontend-ERP.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立 ERP 文档基线：工作空间 + 11 个业务页、工业绿/琥珀视觉、库位矩阵与异常队列；代码未改动 | — | `docs/design/pages/13-frontend-erp.md` | Agent |

## 15. CRM 销售（设计规范）

页面文档：[14-frontend-crm.md](design/pages/14-frontend-crm.md) · 文件：`pages/frontend-CRM.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立 CRM 文档基线：工作空间 + 7 个业务页、紫色画布、三阶段商机看板与金额联动；代码未改动 | — | `docs/design/pages/14-frontend-crm.md` | Agent |

## 16. SOP 流程（设计规范）

页面文档：[15-frontend-sop.md](design/pages/15-frontend-sop.md) · 文件：`pages/frontend-SOP.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立 SOP 文档基线：工作空间 + 6 个业务页、纸张手册、检查清单驱动进度；代码未改动 | — | `docs/design/pages/15-frontend-sop.md` | Agent |

## 17. BI 经营分析（设计规范）

页面文档：[16-frontend-bi.md](design/pages/16-frontend-bi.md) · 文件：`pages/frontend-BI.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立 BI 文档基线：工作空间 + 6 个业务页、深色观测台、时段/渠道筛选联动图表；代码未改动 | — | `docs/design/pages/16-frontend-bi.md` | Agent |

## 18. HR / OA 审批（设计规范）

页面文档：[17-frontend-oa.md](design/pages/17-frontend-oa.md) · 文件：`pages/frontend-OA.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立 OA 文档基线：工作空间 + 6 个业务页、暖色收件箱、审批时间线与状态联动；代码未改动 | — | `docs/design/pages/17-frontend-oa.md` | Agent |

## 19. 财务 / 费控（设计规范）

页面文档：[18-frontend-fin.md](design/pages/18-frontend-fin.md) · 文件：`pages/frontend-FIN.html`

| 日期 | 类型 | 变更内容 | 影响文件 | 同步文档 | 记录人 |
| --- | --- | --- | --- | --- | --- |
| 2026-10-24 | 文档 | 建立财务文档基线：工作空间 + 6 个业务页、墨绿账簿、凭证索引联动借贷明细；代码未改动 | — | `docs/design/pages/18-frontend-fin.md` | Agent |

---

## 20. 示例：一次合格的变更记录

需求：把首页首屏主按钮文案从「探索项目案例」改为「查看项目作品」。

1. 改代码：`index.html` 第 49 行 `.btn-primary` 文案。
2. 改页面文档：`docs/design/pages/01-home.md` 第 7 节「按钮与入口」同步文案。
3. 记变更：在「2. 首页」表格最上方插入：

| 2026-11-02 | 修改 | 首屏主 CTA 文案改为「查看项目作品」，锚点不变 | `index.html` | `docs/design/pages/01-home.md` | 你的名字 |

4. 若该改动影响多个页面（例如导航入口统一改名），在每个受影响页面小节各记一条，并在总览加一行汇总。
