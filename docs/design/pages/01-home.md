# 首页 · index.html

> 个人作品集首页：用一屏讲清「我是谁、做过什么、怎么做事」，再把人引到项目细节与联系入口。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`index.html`](../../../index.html) |
| 线上路径 | `/`（GitHub Pages 根路径） |
| 页面类型 | 单页长滚动作品集（`<html lang="zh-CN">`） |
| `<title>` | 陈柏贤 \| 软件工程师 |
| 样式文件 | [`css/style.css`](../../../css/style.css)、[`css/blog.css`](../../../css/blog.css)（主样式）、[`css/transition.css`](../../../css/transition.css) |
| 脚本文件 | [`script/main.js`](../../../script/main.js)（粒子背景）、[`script/transition.js`](../../../script/transition.js)（页面转场）、页尾两段内联脚本（导航、彩蛋） |
| 依赖资源 | `images/projects/**`（项目截图）、无外部字体 |
| 数据来源 | 全部为静态 HTML 手写内容，无接口请求 |
| 访问控制 | 无；隐藏入口通过「连点头像 3 次」打开选择面板，跳转到各受保护子页 |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：招聘方、合作方、同行；30 秒内判断技术方向与交付能力。
- **核心任务**：建立「AI 应用 + 自动化 + 业务系统」的工程师形象；用数字（3.5 min、10×+、1 人）证明结果；提供 6 个可展开的项目案例。
- **叙事顺序**：定位 → 自我介绍与三个方向 → 项目 → 实践笔记 → 工作经历 → 技术栈 → 教育 → 奖项 → 组织经历 → 联系。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 加载层 | `#loading` | 全屏加载动画，页面就绪后淡出 | 第 12–14 行 |
| 2 | 滚动进度条 | `#scrollProgress` | 顶部 2px 进度条，按滚动百分比伸缩 | 第 17 行 |
| 3 | 胶囊吸顶导航 | `#siteNav` | Logo「陈柏贤」、6 个锚点、3 个工具入口、移动端菜单按钮 | 第 20–37 行 |
| 4 | 首屏 Hero | `#top` | 眉题、姓名、职位、标语、双 CTA、GitHub、深色 lab 面板、3 个成果数字 | 第 42–114 行 |
| 5 | 关于我 | `#about` | 左侧自我介绍卡 + 右侧 3 张能力卡 | 第 116–143 行 |
| 6 | 项目作品 | `#projects` | 6 张可展开项目卡（截图 / 数据 / 案例三步） | 第 145 行起 |
| 7 | 实践笔记 | `#practice` | 3 张实践卡（问题 → 做法 → 指标） | 第 145 行后段 |
| 8 | 交互实验 | `#lab` | 一条整宽横条：语义空间入口（Three.js 点云 + 向量检索） | 第 458 行前 |
| 9 | 工作经历 | `#experience` | 竖向时间线，2 段经历，可展开详情与全屏阅读 | 后段 |
| 10 | 技术栈 | `#skills` | 4 组技能工作台卡片 + 案例链接 | 后段 |
| 11 | 教育背景 | `#education` | 录取通知书式卡片、专业课程、学位章 | 后段 |
| 12 | 奖项荣誉 | `#awards` | 7 张荣誉卡（竞赛 / 写作 / 认证） | 后段 |
| 13 | 组织经历 | `#school` | 2 张校园角色卡（学习部部长、学生会主席） | 后段 |
| 14 | 联系我 | `#contact` | 深色邀请卡、GitHub 入口、复制地址 | 后段 |
| 15 | 页脚 | `footer` | 版权行 | 尾部 |
| 16 | 项目截图大图 | `dialog.project-image-dialog` | 点击项目截图后放大的图片弹窗 | 尾部 |
| 17 | 隐藏入口面板 | `#eggModal` | 6 个受保护页面的选择面板 | 尾部 |

## 4. 布局

- **容器**：`.container` `max-width: 1000px`，左右 20px 内边距；首屏另加 `padding: 132px 0 54px` 给吸顶导航让位。
- **导航**：`.site-nav` 固定定位，`top: 14px`，`width: min(1040px, 94vw)`，`height: 64px`，胶囊圆角、毛玻璃。
- **首屏**：`.hero` 双栏 `minmax(0,.94fr) / minmax(450px,1.06fr)`，`gap: clamp(42px,7vw,96px)`，`min-height: min(790px, 100vh)`；移动端折叠为单栏。
- **关于我**：`.about-layout` 双栏 `minmax(0,.95fr) minmax(0,1.15fr)`；右侧 3 张能力卡纵向排列。
- **项目**：`.projects-grid` 两列 `repeat(2, minmax(0,1fr))`，首卡可跨列（featured）。
- **实验入口**：`.lab-entry` 单行三列 `1fr / auto / 126px`，整宽横条，不与作品卡混排。
- **实践**：`.practice-grid` 三列；**荣誉**：`.honor-gallery` 三列；**技能**：`.skill-workbench` 两列；**校园角色**：`.campus-roles` 两列。
- **经历**：`.career-timeline` 左内边距 27px 的竖向时间线，卡片内再分「预览 / 详情」。
- **联系**：`.contact-invitation` 双栏 `1.35fr / 1fr`，深色面板。
- **层级**：`#canvas-bg` 固定 `z-index: 0`；`.container` `z-index: 2`；导航 `z-index: 10000`；弹窗 / 对话框在最上层。

## 5. 视觉样式

### 5.1 颜色

| 用途 | 变量 / 类名 | 色值 |
| --- | --- | --- |
| 页面底色 | `--bg-dark` | `#f4f2ed` |
| 卡片表面 | `--bg-card` | `#fffefa` |
| 主色 | `--primary` | `#315ce8` |
| 辅色 | `--secondary` | `#287e79` |
| 浅强调 | `--accent` | `#81a5ff` |
| 正文 | `--text-main` | `#172433` |
| 次要文字 | `--text-muted` | `#66727d` |
| 描边 | `--border-soft` | `rgba(23,36,51,.11)` |
| 深色面板 | `--ink-panel` / `.lab-panel` / `.contact-invitation` | `#142333` / `#101c29` |
| 进度条 / 强调按钮 | `.scroll-progress` / `.btn-primary` | 品牌渐变 `112deg, #315ce8 → #287e79` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 姓名 `h1.name` | `clamp(3.4rem, 7vw, 6.5rem)`（约 54–104px）/ 780 | 两行排版，字距 -.075em，第二行品牌色 |
| 区块标题 `.section-title` | `clamp(1.65rem, 3vw, 2.35rem)`（约 26–38px）/ 800 | 字距 -.055em，前置 `✳` 图标 |
| 区块眉题 `.section-kicker` | 0.7rem / 700，字距 .14em | 等宽字体，大写英文 + 中文 |
| 正文 | 15px / 400，行高 1.75 | 系统无衬线 |
| 数字 / 代码 | `--mono`（Consolas / ui-monospace） | 指标、版本号、GitHub 地址 |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 大圆角 | `--radius-lg: 22px`；卡片常用 21–25px |
| 中圆角 | `--radius-md: 15px` |
| 胶囊 | `--pill: 999px` |
| 阴影 | `--shadow-sm/md/lg` = `rgba(27,39,52,.045/.085/.14)` |
| 卡片内边距 | 20–26px；联系面板 `clamp(25px,4vw,48px)` |
| 区块间距 | `.section` 上下 `margin: 96px`（≤ 700px 时 72px）；标题与内容间 24–36px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 粒子背景 | 页面加载 | `script/main.js` 在 `#canvas-bg` 上绘制低频粒子 |
| 入场淡入 | 滚动进入视口 | `data-footer-reveal` 等元素上移 + 淡入 |
| 卡片悬停 | 鼠标移入 | 项目卡上浮、描边加深、封面轻微缩放（`cubic-bezier(.2,.75,.25,1)`） |
| 导航指示器 | 悬停 / 滚动高亮 | `.nav-indicator` 按链接宽度与位置滑动 |
| 首屏 lab 面板 | 自动 | 光晕、轨道环缓慢旋转 |
| 转场 | 站内跳转 | `script/transition.js` 做页面淡出淡入 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 吸顶胶囊导航 | `.site-nav` `.nav-links` `.nav-indicator` `.nav-btn` | 6 个锚点 + 3 个工具入口；移动端 `.nav-toggle` 展开 |
| 首屏文案组 | `.hero-copy` `.hero-overline` `.name` `.title` `.tagline` `.hero-cta` | 姓名、职位、标语、双按钮 |
| 深色 Lab 面板 | `.lab-panel` `.lab-panel-top` `.lab-panel-main` `.avatar` `.hero-stats` | 品牌面板：标签、口号、头像轨道、3 个数字 |
| 能力卡 | `.about-capability` `.about-capability-icon` `.about-capability-copy` | 图标 + 英文眉题 + 标题 + 描述 + 案例链接 |
| 项目卡 | `.project-card` `.project-art` `.project-content` `.project-impact` `.project-case` | 封面、标题、描述、3 个指标、问题 / 做法 / 结果 |
| 展开按钮 | `.project-expand-btn` + `toggleProject()` | 展开 `.project-detail`，箭头翻转 |
| 实践卡 | `.practice-card` `.practice-index` `.practice-metrics` | 编号、类型、标题、摘要、两个指标 |
| 经历卡 | `.career-card` `.exp-box` `.exp-box-preview` `.exp-box-detail` `.exp-section` | 时间线 + 可折叠详情 + 全屏阅读 |
| 实验入口横条 | `.lab-entry` `.lab-entry-eyebrow` `.lab-entry-tags` `.lab-entry-go` | 眉题、标题、一句说明、三个技术标签、胶囊按钮 |
| 技能组 | `.skill-workbench-card` `.skill-tools` `.skill-practice` | 4 组技能 + 实践说明 |
| 教育卡 | `.education-pass` `.education-stamp` `.education-courses` | 通知书版式 |
| 荣誉卡 | `.honor-card` `.honor-seal` `.honor-category` `.honor-secondary` | 奖章、类别、级别 |
| 校园角色卡 | `.campus-card` `.campus-role-index` `.campus-metrics` | 角色、职责、指标 |
| 联系卡 | `.contact-invitation` `.contact-github` `.contact-copy` `.contact-address` | 深色邀请、GitHub、复制地址 |
| 图片弹窗 | `dialog.project-image-dialog` `.project-image-close` | 点击截图放大，Esc / 点遮罩关闭 |
| 彩蛋面板 | `#eggModal` `.egg-select-wrap` `.egg-modal-actions` | 隐藏入口选择器 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 导航链接 | 关于我 / 项目作品 / 实践笔记 / 工作经历 / 技术栈 / 联系我 | `.nav-links a` | 平滑滚动到锚点并高亮 | 本页 `#about` 等 |
| 导航工具 | 项目演示 | `.nav-btn` | 跳转 | `pages/demo.html` |
| 导航工具（主按钮） | 小技能 | `.nav-btn.is-primary` | 跳转 | `pages/AI.html` |
| 导航工具 | 小工具 | `.nav-btn` | 跳转 | `pages/tool.html` |
| 移动端菜单 | ☰ | `#navToggle` | 展开 / 收起导航 | 本页 |
| 首屏主 CTA | 探索项目案例 ↗ | `.btn.btn-primary` | 滚动 | `#projects` |
| 首屏次 CTA | 联系我 ↓ | `.btn.btn-ghost` | 滚动 | `#contact` |
| 首屏社交 | GitHub | `.hero-social` | 新窗口打开 | `github.com/gunian2004` |
| 项目筛选（隐藏） | 全部 / AI 应用 / 业务系统 / 自动化 | `.project-filter` | 按分类过滤卡片 | 默认 `hidden`，暂未启用 |
| 项目展开 | 展开案例细节 / 收起细节 | `.project-expand-btn` | 展开 / 收起案例三段 | 本页 |
| 项目截图 | 图片封面（⤢） | `.project-image-trigger` | 打开大图对话框 | `#erpImageDialog` |
| 实践卡 | 查看 ERP 项目 → 等 | `.practice-card` | 跳转对应项目卡 | 本页 `#proj…` |
| 实验入口 | 走进去 ↗ | `.lab-entry` | 打开语义空间可视页 | `pages/semantic-space.html` |
| 经历展开 | 展开详情 / 收起详情 | `.exp-box-toggle` | 展开工作详情 | 本页 |
| 经历全屏 | ⛶ 全屏查看 | `.exp-box-fullscreen` + `openExpFullscreen()` | 打开全屏阅读层 | 本页 |
| 联系 | 在 GitHub 找到我 ↗ | `.contact-github` | 新窗口 | GitHub |
| 联系 | 复制 GitHub 地址 ⧉ | `.contact-copy` | 写入剪贴板并提示 | 本页 |
| 隐藏入口 | 连点头像 3 次 → 选择内容 → 进入 | `.avatar` / `#eggConfirm` | 跳转到带密码门的子页 | `pages/*.html?requirePassword=1` |

## 8. 交互与状态

- **滚动**：进度条实时更新；导航在滚动 40px 后加 `.visible`；当前区块链接加 `.is-active` 并移动指示器。
- **悬停**：项目卡按鼠标位置更新 `--pointer-x/y`，形成局部高光。
- **加载**：`.loading-screen` 覆盖全屏，`load` 后移除。
- **空态 / 错误态**：无异步数据，无空态；图片缺失时显示 alt 文案。
- **键盘 / 无障碍**：导航有 `aria-label`；展开按钮带 `aria-expanded` / `aria-controls`；图片对话框支持 Esc 关闭；装饰元素标 `aria-hidden="true"`。
- **彩蛋**：800ms 内连点 `.avatar` 3 次打开面板；Esc / 遮罩 / 取消关闭；确认后按下拉项跳转。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 980px` | 首屏、关于我、联系区由双栏转单栏；项目两列变一列 |
| `max-width: 860px` | 导航收起为菜单按钮，锚点链接纵向展开 |
| `max-width: 700px` | 实践三列、荣誉三列折叠；字号下调 |
| `max-width: 560px` | 卡片内边距收紧，首屏 CTA 纵向排列 |
| `max-width: 420px` | 极限窄屏：数字、按钮、标签进一步缩小 |
| `prefers-reduced-motion` | 关闭入场、粒子、悬停位移等动画 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 姓名、职位、标语、首屏 CTA | `index.html` 第 42–57 行 `.hero-copy` |
| 首屏 3 个成果数字 | `.hero-stats`（第 108–112 行） |
| 关于我文案 | `#about` 的 `.about-intro` |
| 三个能力方向 | `.about-capabilities` 三张 `.about-capability` |
| 项目标题 / 描述 / 指标 / 案例 | 对应 `#projErp`、`#projAssistant` 等 `.project-card` |
| 实践笔记 | `#practice` 的 `.practice-card` |
| 实验入口文案 / 标签 | `#lab` 的 `.lab-entry`（眉题、标题、说明、三个 `<i>` 标签、按钮文案） |
| 工作经历 | `#experience` 的 `.career-card` 与 `.exp-box-detail` |
| 技术栈分组 | `#skills` 的 `.skill-workbench-card` |
| 教育 / 奖项 / 校园 | `#education`、`#awards`、`#school` |
| 联系方式 | `#contact` 的 `.contact-invitation` |
| 导航入口 | `.site-nav` 的 `.nav-links` 与 `.nav-actions` |
| 彩蛋下拉项 | `#eggSelect` 的 `<option>` 与页尾 `ROUTES` 映射 |

## 11. 修改须知

- **关联文件**：`css/style.css`、`css/blog.css`、`css/transition.css`、`script/main.js`、`script/transition.js`。
- **颜色**：新增颜色先写进 `css/blog.css` 的 `:root`，再在本文件 5.1 登记；不要在行内写死新色值（现有少量行内色值仅用于强调）。
- **按钮**：继续使用 `.btn.btn-primary` / `.btn.btn-ghost`，不要另起一套按钮类。
- **风险点**：导航高亮依赖 `href="#id"` 与目标区块 id 一致；改 id 必须同步 `script` 与本文档第 3、7 节。
- **密码门**：本站密码门是前端明文校验，不构成安全边界；文档中只描述机制，不记录密码。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「首页」章节。
