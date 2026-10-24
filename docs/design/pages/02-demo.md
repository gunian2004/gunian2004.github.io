# 项目演示 · pages/demo.html

> 作品展厅：用「浏览器窗口」式截图走廊 + 两段实战录像，证明项目真的能跑起来。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/demo.html`](../../../pages/demo.html) |
| 线上路径 | `/pages/demo.html` |
| 页面类型 | 项目展示页（截图画廊 + 视频弹窗） |
| `<title>` | 项目演示 \| 陈柏贤 |
| 样式文件 | [`css/demo.css`](../../../css/demo.css) |
| 脚本文件 | [`script/demo.js`](../../../script/demo.js)（`defer`） |
| 依赖资源 | `images/projects/erp/*.png`（7 张）、`images/projects/auto-listing/*.png`（4 张）、`images/projects/demo/*.jpg`、`demo_video/customer-service-web.mp4`、`demo_video/ai-video-web.mp4` |
| 数据来源 | 静态 HTML + 图片 / 视频文件，无接口 |
| 访问控制 | 无 |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：想快速判断项目真实度的招聘方、客户、合作方。
- **核心任务**：把 ERP 与自动化上架系统的真实界面一次性铺开，再用视频补上「流程在动」的证据。
- **与首页关系**：首页讲项目价值与结果，本页提供界面证据；页尾把人送回首页 `#projects`。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 跳转链接 | `.skip-link` | 键盘用户直达作品内容 | 第 13 行 |
| 2 | 站点头 | `.showcase-header` | 返回首页、品牌「柏贤的作品展厅」、版本字样 | 第 14–18 行 |
| 3 | 展厅首屏 | `#top` `.showcase-hero` | 大标题、说明、CTA、右侧内容索引（01/02/03） | 第 20–34 行 |
| 4 | 作品分类导航 | `.project-nav` | ERP 系统 07 / 自动化上架 04 / 视频演示 02 | 第 35–40 行 |
| 5 | ERP 展区 | `#erp` | 项目介绍、3 步故事条、7 张截图画廊、标签 | 第 42–113 行 |
| 6 | 自动上架展区 | `#listing` | 项目介绍、3 步故事条、4 张截图画廊 | 第 115–165 行 |
| 7 | 视频展区 | `#videos` | 2 张视频卡（客服自动化、AI 视频生成） | 第 167–180 行 |
| 8 | 页尾引导 | `.showcase-end` | 「界面背后，还有实现的细节」+ 回首页按钮 | 第 181 行 |
| 9 | 页脚 | `.showcase-footer` | 版权、标语、回到顶部 | 第 183 行 |
| 10 | 截图大图弹窗 | `#screenDialog` | 单图放大、原图链接、上一张 / 下一张 | 第 185–191 行 |
| 11 | 视频弹窗 | `#videoDialog` | `<video>` 播放器、直接打开链接 | 第 192–198 行 |

## 4. 布局

- **容器**：`.wrap` `width: min(1160px, calc(100% - 64px))` 居中；窄屏左右间距收紧。
- **首屏**：`.showcase-hero` 双栏 `1.3fr / 1fr`，`gap: 60px`；索引卡为竖排 3 行链接，每行「编号 / 名称 / 数量」三段式。
- **分类导航**：横向胶囊条，滚动时吸附在视口顶部（`position` 由脚本切换）。
- **展区**：单列纵向；展区标题与「查看项目案例」链接左右对齐。
- **故事条**：`.story-strip` 三列等宽，编号 + 标题 + 一句说明。
- **画廊**：`.screen-gallery` 模拟浏览器窗口（顶栏 + 舞台 + 控制条 + 缩略图条），舞台内截图横向滑动；一次显示一张主图。
- **视频**：`.video-grid` 两列，卡片 = 海报 + 播放标记 + 时长 + 文案区。
- **层级**：`<dialog>` 使用原生顶层层（top layer），无需额外 `z-index`。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `--paper` | `#f4f2ed` |
| 卡片 / 画廊表面 | `--card` | `#fffefa` |
| 正文 | `--ink` | `#172433` |
| 次要文字 | `--muted` | `#65727d` |
| 主色（链接、编号） | `--blue` | `#315ce8` |
| 辅色（标签、数据） | `--teal` | `#287e79` |
| 描边 | `--line` | `rgba(23,36,51,.12)` |
| 阴影 | `--shadow` | `0 16px 44px rgba(27,39,52,.07)` |
| 海报遮罩 | `.video-poster::after` | 深墨色渐变 |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(2rem, 3.5vw, 3.1rem)`（约 32–50px）/ 750 | 两行，第二行蓝色 |
| 展区 `h2` | `clamp(1.5rem, 2.5vw, 2rem)`（约 24–32px）/ 650 | 前缀编号与英文眉题 |
| 眉题 `.eyebrow` | 11px / 600，字距 .18em | 大写英文 |
| 正文 | 15px / 400，行高 1.8 | 系统无衬线 |
| 编号 / 时长 | `--mono` | 等宽数字 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 画廊圆角 | 18–22px；外框带窗口顶栏 |
| 卡片圆角 | 18px |
| 胶囊 | 999px（分类导航、标签、按钮） |
| 展区间距 | `.exhibit` / `.video-section` 顶部 `padding-top: 76px` |
| 截图舞台高度 | 随图片比例，桌面约 520–640px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 展区入场 | 滚动进入视口 | `.reveal` 上移 + 淡入 |
| 画廊切换 | 缩略图 / 前后按钮 / 键盘 / 左右滑动 | 截图切换带淡入与位移 |
| 视频卡悬停 | 鼠标移入 | 海报轻微放大、播放标记放大 |
| 弹窗 | 打开 / 关闭 | 原生 `dialog` 淡入，点遮罩关闭 |
| 减弱动效 | `prefers-reduced-motion` | 关闭入场与位移 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 站点导航条 | `.project-nav` `.nav-label` | 三个锚点，滚动时当前展区高亮 |
| 内容索引卡 | `.exhibit-index` `.index-heading` `.index-no` `.index-count` | 01/02/03 编号 + 数量 |
| 展区标题 | `.exhibit-heading` `.exhibit-title` `.text-link` | 标题 + 右上角「查看项目案例 / 技术细节」 |
| 故事条 | `.story-strip` `.story-no` | 业务起点 / 实现路径 / 交付结果 |
| 截图画廊 | `.screen-gallery` `.screen-browser-bar` `.screen-stage` `.screen-slide` | 浏览器窗口式截图走廊 |
| 画廊控制 | `.screen-toolbar` `.screen-pagination` `.screen-counter` `.icon-button` | 上一张 / 下一张 / 计数 |
| 缩略图条 | `.screen-filmstrip` `.film-thumb` | 底部缩略图选择（脚本生成） |
| 放大按钮 | `.screen-open` `.screen-zoom` | 打开大图弹窗 |
| 图注 | `.screen-caption-index` | 01 / 02 编号 + 标题 + 说明 |
| 视频卡 | `.video-card` `.video-poster` `.play-mark` `.video-duration` `.video-copy` | 海报、播放标记、时长、标签 |
| 图片弹窗 | `#screenDialog` `.dialog-shell` `.dialog-header` `.dialog-footer` | 大图、原图链接、翻页 |
| 视频弹窗 | `#videoDialog` `#videoPlayer` `#videoStatus` | 原生播放器 + 状态提示 |
| 页尾引导 | `.showcase-end` `.pill-link` | 回首页看架构 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 返回首页 | ↖ 返回首页 | `.home-link` | 跳转 | `../index.html` |
| 品牌 | ✳ 柏贤的作品展厅 | `.showcase-brand` | 回到本页顶部 | `#top` |
| 首屏 CTA | 开始浏览作品 ↓ | `.hero-cta` | 滚动 | `#erp` |
| 索引 / 分类 | 01 跨境电商 ERP / 02 商品自动化上架 / 03 流程实战录像 | `.exhibit-index a` / `.project-nav a` | 滚动到展区 | `#erp` / `#listing` / `#videos` |
| 展区外链 | 查看项目案例 ↗ / 查看技术细节 ↗ | `.text-link` | 回首页对应项目卡 | `../index.html#projErp` 等 |
| 截图 | 点击截图 / ↗ 放大查看 | `.screen-open` | 打开大图弹窗 | `#screenDialog` |
| 画廊翻页 | ← / → | `[data-prev]` / `[data-next]` | 上一张 / 下一张 | 本页 |
| 视频卡 | 播放实战录像 ↗ | `.video-card[data-video]` | 打开视频弹窗并加载 | `#videoDialog` |
| 弹窗关闭 | 关闭 × | `[data-close]` | 关闭弹窗 | 本页 |
| 原图 / 原视频 | 打开原图 ↗ / 直接打开视频 ↗ | `#originalImage` / `#directVideo` | 新窗口打开资源 | 原始文件 |
| 页尾 | 查看项目笔记 ↗ | `.pill-link` | 回首页项目区 | `../index.html#projects` |
| 回到顶部 | 回到顶部 ↑ | `footer a` | 滚动 | `#top` |

## 8. 交互与状态

- **画廊**：脚本接管点击、键盘（←/→/Home/End）与指针滑动；`data-gallery` 标记的区块独立工作；`hidden` 的控制条与缩略图由脚本显隐。
- **图片弹窗**：打开时写入大图 `src`、图注、计数与原图链接；支持 Esc、点遮罩、关闭按钮；关闭后焦点回到触发元素。
- **视频弹窗**：点击视频卡后设置播放源并播放；出错时 `#videoStatus` 显示失败提示，可用「直接打开视频」兜底。
- **空态 / 错误态**：图片加载失败显示 `alt`；视频不支持时显示降级文案。
- **无障碍**：跳转链接、`aria-label`、`aria-live` 状态、`aria-current="location"` 标当前分类；弹窗使用原生 `dialog` 语义。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 980px` | 首屏索引卡移到文案下方；视频两列变一列 |
| `max-width: 700px` | 故事条纵向排列；画廊高度降低，图注字号下调 |
| `max-width: 360px` | 按钮与标签缩小，隐藏次要说明 |
| `hover: none` | 关闭依赖悬停的效果 |
| `prefers-reduced-motion` | 关闭揭示动画与平滑滚动 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏标题 / 说明 | `.showcase-hero .hero-copy` |
| 右侧索引数量 | `.exhibit-index` 的 `.index-count` |
| 分类导航数量 | `.project-nav a` 内的数字 |
| ERP / 上架项目介绍 | `#erp` / `#listing` 的 `.exhibit-intro`、`.project-tags`、`.story-strip` |
| 截图与图注 | 对应 `.screen-slide`：`img src`、`alt`、`figcaption` |
| 视频与海报 | `.video-card` 的 `href`、`data-poster`、`img src`、时长、文案 |
| 页尾引导 | `.showcase-end` |
| 弹窗文案 | `#screenDialog` / `#videoDialog` 的标题与说明 |

## 11. 修改须知

- **关联文件**：`css/demo.css`、`script/demo.js`。
- **画廊结构**：新增截图必须同时补 `img`、`figcaption`，并保持 `.screen-slide` 顺序；数量文案（如 `07 SCREENS`）要同步。
- **视频**：保证 `demo_video/*.mp4` 与 `images/projects/demo/*-poster.jpg` 存在，否则卡片空白。
- **不要**把大图直接内联为 base64；画廊依赖真实文件与原图链接。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「项目演示」章节；如首页项目卡文案变化，同步 `01-home.md`。
