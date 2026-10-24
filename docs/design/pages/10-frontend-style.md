# 前端设计规范库 · pages/frontend-style.html

> 8 个设计类目的入口索引：一页一色，用缩略图先看「界面性格」，再点进去动手操作。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/frontend-style.html`](../../../pages/frontend-style.html) |
| 线上路径 | `/pages/frontend-style.html` |
| 页面类型 | 设计规范库首页（带密码门） |
| `<title>` | 前端设计规范库 · Financial & Enterprise UI |
| 样式文件 | [`pages/css/frontend-hub.css`](../../../pages/css/frontend-hub.css) |
| 脚本文件 | [`pages/js/frontend-hub.js`](../../../pages/js/frontend-hub.js)（搜索 / 筛选）、[`pages/js/frontend-library.js`](../../../pages/js/frontend-library.js)（密码门） |
| 依赖资源 | 无图片；8 张缩略图全部用 HTML/CSS 拼出来 |
| 数据来源 | 静态 HTML |
| 访问控制 | 密码门（`#gate` 的 `data-pw-field="design-PW"`；校验逻辑在 `frontend-library.js`） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：需要后台 / 金融 / 企业中后台界面参考的人，以及自己复用设计语言时。
- **核心任务**：先按「皮肤 / 业务系统 / 系统规范」筛选，再点进某个类目看完整组件与交互。
- **产品特征**：每张卡有独立强调色 `--c`，缩略图用 CSS 微缩景观表达该类的布局特征。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 密码门 | `#gate` | 图标、标题、密码输入、进入、错误提示 | 第 9–18 行 |
| 2 | 站点头 | `.hub-top` | 返回首页、品牌「前端设计规范库」、副标题「8 个类目」、版本 `2026 · v3` | 第 22–32 行 |
| 3 | 首屏 | `.hub-hero` | 眉题、标题「八种场景，八种界面的性格」、导语 | 第 35 行 |
| 4 | 工具条 | `.hub-toolbar` | 搜索、3 个筛选（全部 08 / 卡片与皮肤 / 业务系统 / 系统规范）、计数 | 第 35 行 |
| 5 | 类目网格 | `.hub-grid` | 8 张 `.hub-card` | 第 37–101 行 |
| 6 | 空态 | `#hubEmpty` | 无匹配提示 + 查看全部 | 第 101 行 |

## 4. 布局

- **容器**：`.hub-main` `max-width: 1180px`，左右 28px；站点头同宽。
- **首屏**：单列，标题占据 2 行。
- **网格**：`.hub-grid` 桌面三列，间距 18px；≤ 1000px 两列；≤ 640px 单列。
- **卡片**：上半部为 140px 高的缩略图舞台，下半部为「编号 / 名称 / 描述 / 标签 / 打开示例」。
- **工具条**：搜索框 + 胶囊筛选按钮横排，窄屏换行。
- **断点**：≤ 1000px 网格两列；≤ 640px 单列，工具条纵向。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `--bg` | `#f4f2ed` |
| 卡片表面 | `--surface` | `#fffefa` |
| 描边 | `--border` | `#17243321` |
| 正文 | `--text` | `#172433` |
| 次要文字 | `--text-2` | `#65727d` |
| 弱化文字 | `--text-3` | `#79858e` |
| 金融类强调 | `.hub-card[--c]` | `#ff2442` |
| ERP 强调 | 同上 | `#2563eb` |
| CRM 强调 | 同上 | `#7c3aed` |
| SOP 强调 | 同上 | `#0d9488` |
| BI 强调 | 同上 | `#22d3ee` |
| OA 强调 | 同上 | `#4f46e5` |
| FIN 强调 | 同上 | `#047857` |
| 系统规范强调 | 同上 | `#64748b` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(30px, 4vw, 48px)` / 700 | 两行，字距 -.05em |
| 卡片名称 | 18px / 700 | |
| 卡片描述 | 12px / 400，行高 1.9 | `--text-2` |
| 标签 | 10px / 500 | 胶囊 |
| 编号 | 11px 等宽 | `01`–`08` |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 卡片圆角 | 18px |
| 缩略图圆角 | 9px |
| 胶囊 | 999px |
| 卡片内边距 | 18px |
| 网格间距 | 18px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 卡片悬停 | 鼠标移入 | 上浮、描边染上 `--c`、缩略图放大 |
| 筛选 | 搜索 / 分类 | 卡片显隐，计数更新 |
| 密码门 | 解锁 | 遮罩移除，页面淡入 |
| 减弱动效 | `prefers-reduced-motion` | 关闭位移 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 密码门 | `#gate` `.gate-card` `.gate-input` `.gate-btn` | 弱隔离 |
| 站点头 | `.hub-top` `.hub-back` `.hub-brand` `.hub-logo` `.hub-meta` | 返回、品牌、版本 |
| 搜索 | `#hubSearch` `#hubClear` | 搜场景 / 组件关键词 |
| 筛选 | `.hub-filters` `[data-group]` | all / skin / system / spec |
| 计数 | `#hubCount` | 当前可见类目数 |
| 类目卡 | `.hub-card` `.hub-preview` `.hub-no` `.hub-name` `.hub-desc` `.hub-tags` `.hub-go` | 缩略图 + 名称 + 描述 + 标签 |
| 缩略图 | `.hub-art.art-0…art-7` `.mini-*` | 8 套纯 CSS 微缩景观 |
| 空态 | `#hubEmpty` `#hubReset` | 无匹配 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 密码门 | 进入 | `#gateBtn` | 校验密码 | 本页 |
| 返回首页 | ← 返回首页 | `.hub-back` | 跳转 | `../index.html` |
| 搜索 | 搜索场景、组件… | `#hubSearch` | 过滤卡片 | 本页 |
| 清除搜索 | 清除 | `#hubClear` | 清空 | 本页 |
| 筛选 | 全部 08 / 卡片与皮肤 / 业务系统 / 系统规范 | `.hub-filters button` | 分类过滤 | 本页 |
| 类目卡 | 打开示例 ↗ / 查阅规范 ↗ | `.hub-card` | 跳转 | 见下 |
| 金融类 | 打开示例 | `.hub-card` | 跳转 | `frontend-finance.html` |
| ERP / CRM / SOP / BI / OA / 财务 | 打开示例 | `.hub-card` | 跳转 | 对应 `frontend-*.html` |
| 系统规范 | 查阅规范 | `.hub-card` | 跳转 | `frontend-spec.html` |
| 空态 | 查看全部 | `#hubReset` | 重置筛选 | 本页 |

## 8. 交互与状态

- **密码门**：`frontend-library.js` 读取 `window['design-PW']` 校验，成功后移除遮罩与 `gate-locked`。
- **搜索**：匹配名称、描述、标签；与分类筛选叠加。
- **筛选计数**：`#hubCount` 实时更新；无结果显示 `#hubEmpty`。
- **无障碍**：卡片是链接，可键盘 Tab；`aria-pressed` 标筛选选中；缩略图 `aria-hidden="true"`。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 1000px` | 网格两列，站点头与工具条收紧 |
| `max-width: 640px` | 单列；工具条纵向；标题字号下调 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏标题 / 导语 | `.hub-hero` |
| 新增类目 | `.hub-grid` 复制一张 `.hub-card`，改 `href`、`--c`、编号、名称、描述、标签、缩略图类 |
| 缩略图 | `.hub-preview` 内的 `.mini-*` 结构或 `frontend-hub.css` 的 `.art-N` |
| 筛选分组 | 卡片 `data-group` 与 `.hub-filters` 按钮 |
| 版本号 | `.hub-meta` |

## 11. 修改须知

- **关联文件**：`pages/css/frontend-hub.css`、`pages/js/frontend-hub.js`、`pages/js/frontend-library.js`。
- **一页一色**：新类目必须指定 `--c`，且与目标页面主色一致；不要复用相邻色导致识别困难。
- **缩略图**：全部用 HTML/CSS，不引入截图；保持与真实页面结构同构。
- **密码门**：前端校验仅弱隔离，不记录密码。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「前端设计规范库」章节；新增类目同步 `docs/design/README.md` 页面索引。
