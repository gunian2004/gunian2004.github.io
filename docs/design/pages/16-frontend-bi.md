# BI 经营分析 · pages/frontend-BI.html

> 深色观测台：大字号指标、青色曲线、通道筛选；亮色只留给数据与当前选择，让数字自己说话。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-BI.html`](../../../pages/frontend-BI.html) |
| 线上路径 | `/pages/frontend-BI.html` |
| 页面类型 | 企业后台设计样例（FA 外壳 + 模块页面） |
| `<title>` | BI 经营分析 · 前端设计规范库 |
| 样式文件 | [`pages/css/frontend-base.css`](../../../pages/css/frontend-base.css)、[`pages/css/frontend-experience.css`](../../../pages/css/frontend-experience.css)、[`pages/css/frontend-BI.css`](../../../pages/css/frontend-BI.css) |
| 脚本文件 | [`pages/js/frontend-core.js`](../../../pages/js/frontend-core.js)、[`pages/js/frontend-experience.js`](../../../pages/js/frontend-experience.js)、[`pages/js/frontend-BI.js`](../../../pages/js/frontend-BI.js) |
| 依赖资源 | 无图片；趋势图为内联 SVG，环图为 CSS `conic-gradient` |
| 数据来源 | 静态样例数据；筛选在本页重新计算，不发请求 |
| 访问控制 | 无（从规范库密码门进入） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：做数据看板 / 经营分析后台的人，想要「深色大屏但不脏」的参考。
- **核心任务**：让时段（近 4 / 8 / 12 周）与渠道（全部 / 自营 / 合作）筛选联动 KPI、曲线、环图与脚注。
- **设计观点**：图表占主导，装饰退到背景；只让数据发亮。

## 3. 页面结构

**外壳**：同 [ERP 页](13-frontend-erp.md) 的 FA 外壳；BI 主题隐藏侧栏，切页依靠顶部页签与快捷入口。

**页面清单（7 个）**

| # | 页面 id | 标题 | 说明 | 主要组件 |
| --- | --- | --- | --- | --- |
| 1 | `workspace` | 经营观测台 | 看见数字背后的方向 | Hero、时段筛选、3 个 KPI、SVG 趋势图、渠道环图、快捷入口 |
| 2 | `dash` | 经营看板 | 近 12 周 GMV、净收入与退款率 | KPI、折线 / 柱状、明细表 |
| 3 | `channel` | 渠道看板 | 自营与渠道的获客成本与转化 | KPI、表格 |
| 4 | `product` | 商品看板 | Top 商品的销量与毛利 | 表格 |
| 5 | `metrics` | 指标明细 | 按周与渠道拆分的原始指标 | 表格 |
| 6 | `dataset` | 数据集 | 数据源、更新频率与口径 | 表格 |
| 7 | `subs` | 报表订阅 | 把看板按周期发到邮箱 | 表单、订阅列表 |

## 4. 布局

- **外壳**：BI 主题**隐藏侧栏**，主区单栏铺满；切页依靠顶部页签与快捷入口。深色主区，边界用低对比描边。
- **工作空间**：`.bi-kpis` 三块指标（主 KPI 更大）；`.bi-grid` 左侧曲线卡 + 右侧渠道构成卡。
- **图表**：`viewBox="0 0 760 250"` 自适应宽度；网格线低透明度；曲线 3px、节点 4px。
- **环图**：`.bi-donut` 用 `conic-gradient` + 内圈文字，尺寸约 160px。
- **断点**：≤ 1100px 图表与环图上下排列；≤ 760px KPI 单列，图例换行。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 深色画布 | `directions.bi` | `#0c131b` |
| 卡片表面 | 同上 | `#141f2a` |
| 数据青 | 同上 / accent | `#6de4ca` |
| 辅助蓝紫 | 同上 | `#8d9de6` |
| 深色表格底 | `frontend-BI.css` | `#102a23` / `#101a24` |
| 次要文字 | 同上 | `#9db6c0` |
| 网格 / 描边 | 同上 | `#273641` / `#2a3945` |
| 涨跌 | `--up` / `--down` | `#d92d20` / `#0f9d63` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 主 KPI | 34–44px / 750，等宽数字 | GMV |
| 次 KPI | 22–26px / 700 | |
| 图表标题 | 14px / 600 | |
| 正文 / 图例 | 11–12px | `#9db6c0` |
| 轴标签 | 10–11px | SVG `font-size` |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 卡片圆角 | 12–14px（深色更克制） |
| 卡片内边距 | 16–20px |
| 图表高度 | 约 250–320px |
| 环图 | 160px |
| 网格间距 | 14–16px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 时段筛选 | 近 4 / 8 / 12 周 | 曲线、KPI、环图重算 |
| 渠道筛选 | 全部 / 自营 / 合作 | 同上，图例与脚注同步 |
| 图表刷新 | 筛选变化 | 路径与节点重绘 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| KPI 组 | `.bi-kpis` `.bi-primary` | 主指标 + 两个次指标 |
| 趋势图 | `.bi-chart` `.bi-svg` `.bi-line` | 面积渐变 + 折线 + 节点 |
| 时段筛选 | `[data-weeks]` `.ds-segment` | 4 / 8 / 12 周 |
| 渠道筛选 | `#dsChannel` `<select>` | 全部 / 自营 / 合作 |
| 环图 | `.bi-donut` `.bi-share-row` | 自营贡献占比 |
| 脚注 | `.bi-chart-foot` `.bi-note` | 口径与期末值 |
| 快捷入口 | `.ds-bottom-links` | 指标与口径 / 数据源管理 |
| 看板页 | `FA.kpi()` / `FA.line()` / `FA.bars()` / `FA.table()` | 各看板 |
| 订阅表单 | `FA.form()` | 报表订阅 |
| 设计语言 | `.ds-guide` `.ds-palette` | 配色说明 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回规范库 | ← / ✕ | `.fa-home` / `#faClose` | 跳转 | `frontend-style.html` |
| 页签 | 数据看板 / 经营看板 / 渠道看板 / 商品看板 / 指标明细 / 数据集 / 报表订阅 | `.fa-tabs` | 切换 / 关闭页签 | 本页 |
| 时段 | 近 4 周 / 近 8 周 / 近 12 周 | `[data-weeks]` | 重算图表 | 本页 |
| 渠道 | 全部渠道 / 自营 / 合作渠道 | `#dsChannel` | 重算图表 | 本页 |
| 快捷入口 | 指标与口径 / 数据源管理 | `.ds-bottom-links button` | 切换页面 | 本页 |
| 搜索 | 搜索当前页… | `#faSearch` | 过滤 | 本页 |

## 8. 交互与状态

- **筛选状态**：`store.weeks`（4/8/12）与 `store.channel`（all/direct/partner）驱动同一段计算，KPI、曲线、环图、脚注共享结果。
- **数据口径**：净收入按 GMV × 14.5% 的样例比例、退款率固定 1.8%，均在界面注明「样例」。
- **演示边界**：不请求接口；刷新恢复默认。
- **无障碍**：SVG 有 `role="img"` 与 `aria-label`；筛选按钮 `aria-pressed`；表格有表头。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1100px` | 图表与环图上下排列 |
| `max-width: 980px` | 顶部页签可横向滚动；主区单栏 |
| `max-width: 760px` | KPI 单列；图表高度降低；图例换行 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 品牌 / 主色 | `frontend-BI.js` 的 `name` / `accent`；`frontend-experience.js` 的 `directions.bi` |
| 工作空间图表 / KPI | `frontend-experience.js` 的 `bi()` |
| 页面清单 | `frontend-BI.js` 的 `nav` / `pages` |
| 单页内容 | 对应 `pages.<id>.render()` |
| 深色材质 | `frontend-BI.css` |
| 样例比例 / 文案 | `frontend-experience.js` 的 `bi()` 内计算与注释 |

## 11. 修改须知

- **关联文件**：`pages/js/frontend-BI.js`、`pages/css/frontend-BI.css`、`pages/js/frontend-experience.js`、`pages/js/frontend-core.js`。
- **口径必须标注**：任何派生指标（净收入、退款率）都要在界面写明「样例 / 口径」，不能装成真实数据。
- **颜色用途**：青色只给数据与当前选择，不要用于大面积背景。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「BI 经营分析（设计规范）」章节。
