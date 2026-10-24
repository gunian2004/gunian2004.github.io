# 小工具 · pages/tool.html

> 日常开发小工具工作台：一个页面装下 8 个工具，左侧选工具、右侧即开即用，输入留在本机。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/tool.html`](../../../pages/tool.html) |
| 线上路径 | `/pages/tool.html` |
| 页面类型 | 工具工作台（单页多工具切换） |
| `<title>` | 小工具 · 工具工作台 \| 陈柏贤 |
| 样式文件 | [`css/tool.css`](../../../css/tool.css)、[`css/studio.css`](../../../css/studio.css)、[`css/tool-workbench.css`](../../../css/tool-workbench.css) |
| 脚本文件 | [`script/studio.js`](../../../script/studio.js)（复制 / 提示）、[`js/vendor/marked.min.js`](../../../js/vendor/marked.min.js)（Markdown 渲染）、[`js/mermaid-loader.js`](../../../js/mermaid-loader.js)（ER 图）、[`js/tool.js`](../../../js/tool.js)（工具逻辑）、[`js/tool-workbench.js`](../../../js/tool-workbench.js)（工作台切换） |
| 依赖资源 | 无图片依赖；Markdown / ER 图由本地 JS 渲染 |
| 数据来源 | 全部在浏览器本地处理，不上传；`localStorage` 只记住「上次使用的工具」 |
| 访问控制 | 无 |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：自己与同行，处理「临时要格式化一段 JSON / 转个编码 / 画个关系图」的碎片需求。
- **核心任务**：不装软件、不跳站点，在浏览器里完成 8 类高频操作；强调「不上传、仅本地」。
- **设计取向**：工作台（studio）风格，工具是卡片，但同一时刻只展开一个，避免页面过载。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 跳转链接 | `.studio-skip` | 直达工具操作区 | 第 14 行 |
| 2 | 站点头 | `.studio-header` | 返回首页、品牌、版本字样 | 第 15 行 |
| 3 | 首屏 Hero | `.studio-hero` | 眉题、大标题、说明、右侧「08 个工具」计数 | 第 17 行 |
| 4 | 工作台外壳 | `.tool-workbench` | 左侧栏 + 右侧工具区 | 第 18 行 |
| 5 | 工具侧栏 | `.tool-sidebar` `#toolCount` | 搜索、分类筛选、移动端下拉、8 个工具导航、空态 | 第 19–27 行 |
| 6 | 工具区 | `#toolWorkspace` `.tools-grid` | 8 张 `.tool-card`，默认展示 JSON | 第 28 行起 |
| 7 | JSON 卡 | `#cardJson` | 输入 / 输出双栏、复制、美化、压缩、清空 | 第 28–55 行 |
| 8 | Markdown 卡 | `#cardMarkdown` | 编辑 / 预览双栏、格式工具条、上传 `.md`、全屏、复制 HTML | 第 56–123 行 |
| 9 | JSON ↔ YAML 卡 | `#cardYaml` | 双向转换 | 第 124 行起 |
| 10 | Base64 卡 | `#cardBase64` | 编码 / 解码 | 后续 |
| 11 | URL 卡 | `#cardUrl` | 编码 / 解码 | 后续 |
| 12 | ER 图卡 | `#cardEr` | 语法输入 → Mermaid 预览 | 后续 |
| 13 | 翻译卡 | `#cardTranslate` | 文本翻译 | 后续 |
| 14 | 录制回放卡 | `#cardRecorder` | 录制 / 回放 / 速度 / 事件列表 | 后续 |

## 4. 布局

- **容器**：`.studio-wrap` `width: min(1200px, calc(100% - 64px))` 居中；首屏为「文案 + 计数」双栏。
- **工作台**：`.tool-workbench` 两栏 `244px + minmax(0,1fr)`，间距 22px；侧栏 `position: sticky; top: 20px`，工具区单列卡片。
- **工具卡**：一张卡占满工具区宽度；卡内用 `.workspace-split` 做输入 / 输出双栏（`1fr 1fr`），窄屏叠成单栏并用「输入 / 结果」切换。
- **侧栏**：标题行、搜索框、分类按钮组、移动端 `<select>`、工具导航列表；导航项为「图标 + 名称 + 分类/序号 + 箭头」四段。
- **断点**：≤ 980px 侧栏收起为顶部条；≤ 760px 工具卡单栏、出现视图切换；≤ 560px 隐藏次要说明。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `--bg-dark` | `#eef2f8` |
| 卡片 | `--bg-card` | `#ffffff` |
| 主色 | `--primary` | `#6366f1`（靛蓝） |
| 辅色 | `--secondary` | `#8b5cf6`（紫） |
| 成功 / 危险 / 警告 | `--success` / `--danger` / `--warning` | `#10b981` / `#ef4444` / `#f59e0b` |
| 正文 / 次要 | `--text-primary` / `--text-secondary` | `#1e293b` / `#64748b` |
| 工作室纸面 | `--paper` / `--card`（studio） | `#f4f2ed` / `#fffefa` |
| 主按钮 | `.data-tool-btn.primary` | 品牌渐变（靛蓝 → 紫） |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(1.8rem, 3.3vw, 2.8rem)`（约 29–45px）/ 700 | 第二行用主色 |
| 工具标题 `h2` | 20px / 650 | 卡片头 |
| 眉题 `.studio-eyebrow` | 10.5px / 600，字距 .2em | 分类 / 工作区 |
| 代码 / 文本域 | 13px / 400，等宽 | `--mono` |
| 正文 | 14px / 400，行高 1.7 | 系统无衬线 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 卡片圆角 | 18px；输入框 10–12px |
| 侧栏圆角 | 20px |
| 卡片内边距 | 20–24px |
| 阴影 | `0 20px 50px rgba(15,23,42,.08)` |
| 文本域高度 | 220–320px，可拖拽（`resize: vertical`） |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 工具切换 | 点击侧栏 / 下拉 | 旧卡隐藏、新卡淡入；`history.replaceState` 更新 hash |
| 结果更新 | 点击操作按钮 | 输出区 `result-updated` 闪一下 |
| 复制反馈 | 点击复制 | `studio.js` 弹出 toast「已复制」 |
| 卡片悬停 | 鼠标移入 | 侧栏项高亮、箭头位移 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 工作室头 | `.studio-header` `.studio-home` `.studio-brand` `.studio-edition` | 返回首页 + 品牌 |
| 首屏 | `.studio-hero` `.studio-eyebrow` `.studio-stat` | 标题、说明、数量 |
| 工作台 | `.tool-workbench` `.tool-sidebar` `.tools-grid` | 两栏骨架 |
| 搜索 | `.studio-search` `#toolSearch` `#clearToolSearch` | 按名称 / 说明过滤 |
| 分类筛选 | `.tool-categories` `[data-category]` | 全部 / 文本 / 数据 / 图表 / 自动化 |
| 移动端选择器 | `.tool-mobile-picker` `#toolSelect` | 窄屏替代侧栏 |
| 工具导航项 | `.tool-nav-item` `[data-tool]` | 图标、名称、分类序号、箭头 |
| 工具卡 | `.tool-card` `.tool-panel-heading` `.panel-symbol` | 标题、说明、符号 |
| 双栏工作区 | `.workspace-split` `.split-first` `.split-second` | 输入 / 输出 |
| 视图切换 | `.workspace-view-switch` | 窄屏「输入 / 结果」 |
| 操作按钮 | `.data-tool-btn` / `.md-btn` / `.btn-primary` | 美化、压缩、清空、复制等 |
| Markdown 工具条 | `.md-controls` `.md-btn` | 粗体、斜体、代码、代码块、上传、全屏 |
| 事件列表 | `.event-list` `.event-item` `.event-type` | 录制回放的事件流 |
| 空态 | `.studio-empty` `#toolEmpty` | 无匹配工具时提示 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回首页 | ↖ 返回首页 | `.studio-home` | 跳转 | `../index.html` |
| 清除搜索 | 清除 | `#clearToolSearch` | 清空关键词 | 本页 |
| 分类 | 全部 / 文本 / 数据 / 图表 / 自动化 | `[data-category]` | 过滤工具 | 本页 |
| 工具切换 | 8 个工具项 | `.tool-nav-item` | 只显示选中工具 | 本页 `#card…` |
| 空态恢复 | 查看全部工具 | `#resetToolFilters` | 重置筛选 | 本页 |
| JSON | ✨ 美化格式 / 🗜️ 压缩 / 🧹 清空 / 📋 复制 | `.data-tool-btn` | 格式化、压缩、清空、复制 | 本页 |
| Markdown | B / I / ` / ``` / 📁 上传 / 清空 | `.md-btn` | 插入语法、上传 `.md` | 本页 |
| Markdown | ⛶ 全屏 / 复制 HTML | `.md-btn` | 全屏预览、复制渲染结果 | 本页 |
| YAML | JSON → YAML / YAML → JSON | `.data-tool-btn` | 双向转换 | 本页 |
| Base64 / URL | 编码 / 解码 | `.data-tool-btn` | 编解码 | 本页 |
| ER 图 | 生成预览 / 示例数据 | `#cardEr` 内按钮 | 渲染 Mermaid | 本页 |
| 翻译 | 翻译 | `#cardTranslate` 内按钮 | 调用翻译逻辑 | 本页 |
| 录制 | 开始录制 / 停止 / 回放 / 清空 | `#cardRecorder` 内按钮 | 操作录制与回放 | 本页 |

## 8. 交互与状态

- **工具选择**：URL hash（`#cardJson`）→ `localStorage` 上次工具 → 默认 JSON，三级回退；切换时 `window.history.replaceState` 更新地址。
- **侧栏显隐**：HTML 里侧栏默认 `hidden`，脚本初始化后移除，避免无 JS 时出现不可用导航。
- **筛选空态**：无匹配时显示 `#toolEmpty`，计数变为 `0 / 8 TOOLS`。
- **视图切换**：窄屏点击「美化 / 编码 / 翻译」等结果类操作后自动切到结果面板；手打输入不切，避免打断。
- **复制**：统一走 `BlogStudio.copy()`，失败时提示手动复制。
- **空态 / 加载态**：Markdown 预览初始显示「👆 在左侧输入 Markdown 即可实时预览」；ER 图有示例数据。
- **无障碍**：`aria-pressed` 标选中分类，`aria-current="page"` 标当前工具，`aria-controls` 关联卡片，跳转链接可键盘直达。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 980px` | 侧栏变为顶部横向工具条，工具区全宽 |
| `max-width: 760px` | `.workspace-split` 单栏 + 「输入 / 结果」切换；markdown 工具条换行 |
| `max-width: 560px` | 首屏计数移到标题下；按钮文字缩短；内边距减小 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏标题 / 说明 / 工具数量 | `.studio-hero`（`08` 需与工具数一致） |
| 新增 / 删除工具 | `#toolWorkspace` 加删 `.tool-card`，同步 `.tool-nav-item`、`#toolSelect`、`#toolCount` |
| 工具说明 / 顺序 | 对应 `.tool-card` 的 `.tool-heading-copy`、`data-category`、导航序号 |
| 分类 | `.tool-categories` 按钮 + 卡片 `data-category` |
| 操作按钮 | 卡片内 `.data-tool-actions` / `.md-controls` |
| 复制提示 | `script/studio.js` 的 toast 文案 |

## 11. 修改须知

- **关联文件**：`css/tool.css`、`css/studio.css`、`css/tool-workbench.css`、`js/tool.js`、`js/tool-workbench.js`、`script/studio.js`。
- **新增工具必须同步 4 处**：卡片、侧栏导航、移动端 `<select>`、首屏数量；否则筛选 / 切换会不一致。
- **按钮类名**：沿用 `.data-tool-btn`、`.md-btn`、`.studio-pill`；颜色由 `css/tool.css` 变量控制，不要新起按钮体系。
- **本地数据**：只允许 `localStorage` 存「上次工具」与用户主动保存的内容，禁止写入敏感信息。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「小工具」章节；工具数量变化时同步 `docs/design/README.md` 的页面索引描述。
