# 问题排查库 · pages/troubleshooting.html

> 把「现象 → 原因 → 步骤 → 验证」写成可搜索的排查卡：8 条常见问题全部写在代码里，页面只做检索与阅读。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/troubleshooting.html`](../../../pages/troubleshooting.html) |
| 线上路径 | `/pages/troubleshooting.html` |
| 页面类型 | 私有知识库（纯只读检索） |
| `<title>` | 问题排查库 · 工作工具 |
| 样式文件 | [`css/work-hub.css`](../../../css/work-hub.css) |
| 脚本文件 | [`script/studio.js`](../../../script/studio.js)、[`js/gate.js`](../../../js/gate.js)（密码门）、[`js/troubleshooting.js`](../../../js/troubleshooting.js)（数据与交互） |
| 依赖资源 | 无图片；分类与条目由脚本渲染 |
| 数据来源 | 内置 8 条，写死在 `js/troubleshooting.js` 的 `builtins` 数组；页面不提供新增 / 编辑 / 删除，无导入导出 |
| 访问控制 | 密码门（`#gate` 上的 `data-pw-field="work-hub-PW"`，前端校验） |
| 文档更新 | 2026-10-25 |

## 2. 页面定位

- **给谁看**：自己（遇到报错先搜）、同事、接手者。
- **核心任务**：用「现象」而不是「标题」搜到排查路径；每条都给出可验证的结论，避免「试了但不知道好没好」。
- **产品特征**：只读展示、可收藏、条目随代码一起发布；不联网、不上传、不向浏览器写入内容。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 密码门 | `#gate` `#gatePw` `#gateBtn` | 访问密码 | 第 5 行 |
| 2 | 顶栏 | `.hub-header` | 品牌「WORK / 工作台」、返回主页 | 第 7 行 |
| 3 | 工作台导航 | `.hub-nav` | 工作经验 / 问题排查 / 文档模板 / 命令片段 | 第 8 行 |
| 4 | 首屏 | `.hub-hero` | 眉题、标题、说明、隐私提示 | 第 8 行 |
| 5 | 查找面板 | `.panel` | 搜索、分类 chips、只看收藏、结果与存储状态行 | 第 9 行 |
| 6 | 结果列表 | `#results` `.library-grid` | 排查卡片 | 第 10 行 |
| 7 | 空态 | `#empty` | 无匹配提示 | 第 10 行 |
| 8 | 页脚 | `.hub-footer` | 命令仅供复制、互链工作经验 | 第 11 行 |

## 4. 布局

- **容器**：`.hub-wrap` `width: min(1140px, calc(100% - 48px))` 居中；顶栏、导航、主体、页脚同宽。
- **首屏**：单列，标题大字号，说明与状态行限宽。
- **工具面板**：整宽卡片；`.toolbar` 内只有搜索框，`flex:1` 撑满并设 `min-width:200px`，窄屏换行；分类 chips 换行排列；收藏筛选单独一行。
- **结果**：`.library-grid` 两列等宽（`repeat(2, minmax(0,1fr))`，间距 18px），每张卡是一个条目；窄屏单列。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `--bg` | `#101821` |
| 面板 | `--panel` | `#182530` |
| 正文 | `--text` | `#edf3f4` |
| 次要文字 | `--muted` | `#a0b2ba` |
| 分隔线 | `--line` | `#c5dedc26` |
| 薄荷主色 | `--mint` | `#80e0c1` |
| 荧光黄强调 | `--lime` | `#d4f178` |
| 焦点环 | `:focus-visible` | `#80e0c1` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(30px, 4.5vw, 48px)` / 700 | 两行断句，字距 -.04em |
| 区块 `h2` | 20px / 650 | |
| 正文 | 13.5–14px / 400，行高 1.75 | 系统无衬线 |
| 命令 / 编号 | `--mono` 11–12px | 等宽 |
| 眉题 | 11px / 600，字距 .2em | 大写英文 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 面板圆角 | 18px |
| 卡片圆角 | 14–16px |
| 输入框圆角 | 10px |
| 面板内边距 | 20–24px |
| 卡片间距 | 14–18px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 结果更新 | 搜索 / 筛选 | 列表重绘，状态行更新 |
| 卡片悬停 | 鼠标移入 | 描边提亮 |
| 收藏 | 点击星标 | 图标填充，计数变化 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 密码门 | `js/gate.js` | 读取 `window['work-hub-PW']` 校验，成功后移除遮罩 |
| 顶栏 / 导航 | `.hub-header` `.hub-nav` | 四页工作台互链 |
| 搜索 | `#search` | 匹配标题、现象、环境、步骤、办法、验证、命令 |
| 分类 chips | `#categories` | 动态生成「全部 + 各分类」 |
| 只看收藏 | `#favoritesOnly` | 过滤收藏项 |
| 状态 | `#resultStatus` `#storageStatus` | 结果数与总数、收藏保存状态 |
| 条目卡 | `#results` 内卡片 | 分类、标题、现象、折叠详情、命令块、收藏 / 复制完整记录 |
| 空态 | `#empty` | 无匹配提示 |
| 页脚 | `.hub-footer` | 免责与互链 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 密码门 | 进入排查库 | `#gateBtn` | 校验密码 | 本页 |
| 返回主页 | 返回主页 ↗ | `.hub-header a:last-child` | 跳转 | `../index.html` |
| 导航 | 工作经验 / 问题排查 / 文档模板 / 命令片段 | `.hub-nav a` | 跳转 | 对应页面 |
| 搜索 | 搜索现象、错误、命令，如：端口、CORS | `#search` | 实时过滤 | 本页 |
| 分类 | 全部 / Git / 网络 / 本地环境 / 部署… | `#categories` | 过滤 | 本页 |
| 收藏筛选 | 只看收藏 | `#favoritesOnly` | 只看已收藏 | 本页 |
| 条目操作 | ☆ 收藏 / ★ 已收藏、复制命令、复制完整记录 | 卡片内按钮 | 记录收藏标记或复制文本 | 本机 |
| 页脚互链 | 查看工作经验 ↗ | `.hub-footer a` | 跳转 | `work.html` |

## 8. 交互与状态

- **数据模型**：`{ id, title, category, symptom, environment, steps, solution, verification, command }`，全部来自 `builtins`，运行时只读，没有表单写入路径。
- **持久化**：只把收藏 id 数组写入 `localStorage['work-hub.troubleshooting.favorites.v1']`；首次加载会尝试从旧键 `work-hub.troubleshooting.v1` 迁移 `favorites`，并过滤掉已不存在的 id。存储不可用时降级为「本次页面内有效」，在 `#storageStatus` 提示。
- **搜索**：按输入串对 8 个字段做不区分大小写的包含匹配；分类与收藏条件可叠加。
- **排序**：按 `builtins` 数组顺序展示，不做二次排序。
- **空态**：无结果时显示 `#empty`。
- **无障碍**：`role="status"` / `aria-live` 播报结果数；分类 chips 用 `aria-pressed` 标记当前项。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 760px` | 顶栏与导航收紧；工具栏纵向；结果网格单列 |
| `prefers-reduced-motion` | 关闭过渡 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏标题 / 说明 | `.hub-hero` |
| 新增 / 修改条目 | `js/troubleshooting.js` 的 `builtins` 数组，id 用 `builtin-` 前缀 |
| 分类 | 条目的 `category` 字段（chips 自动生成） |
| 搜索范围 | `js/troubleshooting.js` 的 `fields` 数组 |
| 样式 | `css/work-hub.css` + 页面内少量覆盖 |

## 11. 修改须知

- **关联文件**：`css/work-hub.css`、`js/troubleshooting.js`、`js/gate.js`、`script/studio.js`。
- **本地数据版本**：收藏键 `work-hub.troubleshooting.favorites.v1`，只存 id 字符串数组；旧键 `work-hub.troubleshooting.v1` 仅作一次性收藏迁移来源，页面不再写入。改结构时升版本。
- **只读约束**：页面不提供任何新增 / 编辑 / 删除入口，条目变更只能改 `builtins` 并提交代码；渲染统一走 `textContent`，不拼 HTML。
- **密码门**：前端校验仅弱隔离；不要放真实凭据、内网地址。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「问题排查库」章节。
