# 设计文档索引 · Design Docs

> 本目录记录站点每个页面的内容、布局、样式、组件、按钮与颜色，是修改页面前的第一份事实来源。
> Agent 的完整工作流程与硬性边界见根目录 [`AGENT.md`](../../AGENT.md)。

---

## 1. 目录约定

```
docs/
├── change.md                  # 页面变更记录（每次改页面必须登记；chang.md 为别名入口）
└── design/
    ├── README.md              # 本文件：文档规范、全局设计语言、页面索引
    └── pages/                 # 一个页面一份文档，格式完全一致
        ├── 01-home.md
        ├── 02-demo.md
        └── ...
```

- **一个页面一份文档**，文件名使用 `序号-页面简称.md`，序号与下表一致。
- 所有页面文档使用同一套章节标题（见第 3 节），不得增删章节、不得改名。
- 修改页面后，必须同步更新：页面文档 + [`docs/change.md`](../change.md) + 必要时本文件的页面索引。

## 2. 页面索引

| # | 页面文档 | 页面文件 | 线上路径 | 一句话定位 |
| --- | --- | --- | --- | --- |
| 01 | [首页](pages/01-home.md) | `index.html` | `/` | 个人作品集首页，展示定位、项目、实践、经历与联系方式 |
| 02 | [项目演示](pages/02-demo.md) | `pages/demo.html` | `/pages/demo.html` | 项目截图展厅与流程视频演示 |
| 03 | [小工具](pages/03-tool.md) | `pages/tool.html` | `/pages/tool.html` | 八个日常开发小工具的工作台 |
| 04 | [小技能 · 知识手册](pages/04-ai-knowledge.md) | `pages/AI.html` | `/pages/AI.html` | 提示词、代理规则与方法笔记的检索手册 |
| 05 | [高性价比人生指南](pages/05-life-guide.md) | `pages/life-guide.html` | `/pages/life-guide.html` | 34 节、650 条建议的单文件离线读物 |
| 06 | [工作经验库](pages/06-work.md) | `pages/work.html` | `/pages/work.html` | 踩坑经验与开发规范的私有笔记 |
| 07 | [问题排查库](pages/07-troubleshooting.md) | `pages/troubleshooting.html` | `/pages/troubleshooting.html` | 现象 → 原因 → 验证的排查记录库 |
| 08 | [开发文档模板台](pages/08-doc-templates.md) | `pages/doc-templates.html` | `/pages/doc-templates.html` | 按 docs 目录规划输出 13 份 AI 文档骨架 |
| 09 | [命令与代码片段](pages/09-snippets.md) | `pages/snippets.html` | `/pages/snippets.html` | 可搜索、参数化的命令片段库 |
| 10 | [前端设计规范库](pages/10-frontend-style.md) | `pages/frontend-style.html` | `/pages/frontend-style.html` | 8 个设计类目的入口索引 |
| 11 | [金融类](pages/11-frontend-finance.md) | `pages/frontend-finance.html` | `/pages/frontend-finance.html` | 5 套金融账户皮肤与票据存根规范 |
| 12 | [系统级规范](pages/12-frontend-spec.md) | `pages/frontend-spec.html` | `/pages/frontend-spec.html` | 令牌实验台 + 13 节企业级 UI 规范 |
| 13 | [ERP 进销存](pages/13-frontend-erp.md) | `pages/frontend-ERP.html` | `/pages/frontend-ERP.html` | 采购、销售、库存、档案的工业工作台 |
| 14 | [CRM 销售](pages/14-frontend-crm.md) | `pages/frontend-CRM.html` | `/pages/frontend-CRM.html` | 线索、商机、客户与业绩预测 |
| 15 | [SOP 流程](pages/15-frontend-sop.md) | `pages/frontend-SOP.html` | `/pages/frontend-SOP.html` | 流程库、执行、异常与检查项模板 |
| 16 | [BI 经营分析](pages/16-frontend-bi.md) | `pages/frontend-BI.html` | `/pages/frontend-BI.html` | 深色数据观测台与指标订阅 |
| 17 | [HR / OA 审批](pages/17-frontend-oa.md) | `pages/frontend-OA.html` | `/pages/frontend-OA.html` | 待办审批、申请与组织架构 |
| 18 | [财务 / 费控](pages/18-frontend-fin.md) | `pages/frontend-FIN.html` | `/pages/frontend-FIN.html` | 资金、票据、对账与报表账簿 |

## 3. 页面文档统一格式

每份页面文档必须且只能包含以下章节：

1. `## 1. 元信息` —— 文件、路径、标题、样式/脚本依赖、数据来源、访问控制、更新时间。
2. `## 2. 页面定位` —— 这个页面解决什么问题、给谁看。
3. `## 3. 页面结构` —— 从上到下的区块清单（锚点、内容、源码位置）。
4. `## 4. 布局` —— 容器宽度、栅格、首屏、断点、层级。
5. `## 5. 视觉样式` —— 5.1 颜色 / 5.2 字体 / 5.3 间距与形状 / 5.4 动效。
6. `## 6. 组件清单` —— 组件名、关键类名或函数、说明。
7. `## 7. 按钮与入口` —— 文案、类名、行为、去向。
8. `## 8. 交互与状态` —— 交互、空态、加载态、键盘与无障碍。
9. `## 9. 响应式` —— 断点与布局变化。
10. `## 10. 内容维护` —— 「想改什么 → 改哪里」速查表。
11. `## 11. 修改须知` —— 关联文件、风险点、必须同步的文档。

> 新增页面时，复制任意一份现有页面文档作为骨架，只替换事实，不改章节结构。

## 4. 全局设计语言

站点整体是「纸感 + 墨色」的编辑部风格，不同工具页再叠加自己的材质。

### 4.1 主站色板（`css/blog.css`）

| 用途 | 变量 | 色值 |
| --- | --- | --- |
| 页面底色 | `--bg-dark` | `#f4f2ed`（米白纸） |
| 卡片表面 | `--bg-card` | `#fffefa` |
| 主色（链接、强调） | `--primary` | `#315ce8`（钴蓝） |
| 辅色（数据、标签） | `--secondary` | `#287e79`（墨绿） |
| 浅强调 | `--accent` | `#81a5ff` |
| 正文 | `--text-main` | `#172433` |
| 次要文字 | `--text-muted` | `#66727d` |
| 描边 | `--border-soft` | `rgba(23,36,51,.11)` |
| 深色面板 | `--ink-panel` | `#142333` |
| 品牌渐变 | `--grad-brand` | `112deg, #315ce8 → #287e79` |

圆角：`--radius-lg: 22px`、`--radius-md: 15px`、`--pill: 999px`。
阴影：`--shadow-sm/md/lg`，由 `rgba(27,39,52,.045/.085/.14)` 组成。
字体：系统无衬线（`-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei"`），等宽用 `Consolas / ui-monospace`。
导航高度：`--nav-h: 64px`。

### 4.2 工具页材质

| 页面族 | 主色 | 材质关键词 |
| --- | --- | --- |
| 首页 / 项目演示 | `#315ce8` + `#287e79` | 米白纸、细描边、深色 lab 面板 |
| 工作台四页（work / troubleshooting / doc-templates / snippets） | `#101821` + `#80e0c1` + `#d4f178` | 深夜蓝底、薄荷绿、荧光黄点缀、等宽字体 |
| 小工具 / 小技能 | `#172433` + `#315ce8` | 工作室（studio）版式、大标题、纸卡片 |
| 人生指南 | `#3451b2` | 阅读器：顶栏 + 侧栏目录 + 正文，明暗双主题 |
| 前端设计规范库 | 一页一色 | 每个类目独立的字体、材质与布局实验 |

### 4.3 企业级 UI 令牌（`pages/css/frontend-base.css`）

作用域 `.sy-scope`：

- 底色 `--bg:#f6f7f9`、表面 `--surface:#fff`、描边 `--border:#e4e7ec`
- 文字 `--text:#101828` / `--text-2:#5b6573` / `--text-3:#8a94a3`
- 主色 `--primary:#4f46e5`，语义色 success `#0f9d63`、warning `#b45309`、danger `#d92d20`、info `#0b6bcb`
- 涨跌：`--up:#d92d20`（涨红）、`--down:#0f9d63`（跌绿，A 股口径）
- 间距 4pt 栅格 `--s1…--s9`（4→56px），圆角 `--r-sm…--r-xl`（6→14px）
- 阴影 `--sh-1/2/3`，动效 `--t1:120ms`、`--t2:180ms`、`--t3:240ms`，缓动 `cubic-bezier(.2,.8,.2,1)`

通用组件类以 `sy-` 前缀：`sy-btn(-primary/-secondary/-ghost/-danger)`、`sy-input`、`sy-select`、`sy-check`、`sy-switch`、`sy-seg`、`sy-badge`、`sy-avatar`、`sy-tabs`、`sy-table`、`sy-pager`、`sy-modal`、`sy-drawer`、`sy-toast`、`sy-cmdk`、`sy-empty`、`sy-skel`、`sy-kpi`、`sy-kanban`、`sy-steps`、`sy-chart`。

页面骨架使用 `fa-` 前缀（`fa-shell`、`fa-top`、`fa-side`、`fa-main`、`fa-tabs`、`fa-crumbs`、`fa-search`、`fa-modal`、`fa-toast-wrap`），由 `pages/js/frontend-core.js` 的 `FA.boot()` 渲染；业务模块用 `FA.kpi / FA.panel / FA.table / FA.form` 组合页面。

## 5. 维护规则

1. **先读文档再改代码**：改任何页面前，先读对应页面文档与 `docs/change.md`。
2. **代码与文档同步**：代码改完，页面文档的「结构 / 样式 / 组件 / 按钮」四处必须复核，过时描述要一起改。
3. **变更必须落账**：每次改动在 `docs/change.md` 对应页面章节追加一条记录（日期、类型、改了什么、影响文件）。
4. **颜色不硬编码**：优先使用现有 CSS 变量；新增颜色先写进对应样式文件的 `:root`，再在页面文档登记。
5. **按钮不裸写**：优先复用现有的 `btn` / `sy-btn` / `studio-pill` / `chip` / `fs-d-btn` 等类，避免一页一套按钮。
6. **密码门只做弱隔离**：`gate` / `egg` 相关密码是前端明文校验，不是安全边界，文档中只描述机制、不记录密码值。
