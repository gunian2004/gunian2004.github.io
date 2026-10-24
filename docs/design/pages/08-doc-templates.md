# 开发文档模板台 · pages/doc-templates.html

> 把需求、设计、任务、数据库与规范写成模板：按项目规模选 3 / 5 / 8 / 10 份文档，填资料、改正文、整包下载给 AI。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/doc-templates.html`](../../../pages/doc-templates.html) |
| 线上路径 | `/pages/doc-templates.html` |
| 页面类型 | 文档生成工具（模板 + 表单变量 + Markdown 编辑器） |
| `<title>` | 开发文档模板台 · 工作台 |
| 样式文件 | [`css/work-hub.css`](../../../css/work-hub.css) + 页面内联 `<style>` |
| 脚本文件 | [`script/studio.js`](../../../script/studio.js)、[`js/project-doc-templates.js`](../../../js/project-doc-templates.js)（模板文本与项目资料）、[`js/doc-templates.js`](../../../js/doc-templates.js)（层级、渲染、导出）、[`js/gate.js`](../../../js/gate.js)（密码门） |
| 依赖资源 | 无外部依赖；ZIP 由前端库 / Blob 生成（见 `doc-templates.js`） |
| 数据来源 | 模板内置；用户编辑的草稿存 `localStorage`（仅当前浏览器），可导出 / 导入 JSON（上限 2 MB） |
| 访问控制 | 密码门（`data-pw-field="work-hub-PW"`，前端校验） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：准备启动新项目的自己 / 团队，以及要把需求交给 AI Agent 的人。
- **核心任务**：用一套递增的文档范围（3 → 5 → 8 → 10 份）快速产出「可直接开工」的文档包；正文可改，变量可批量替换。
- **产品特征**：左侧按层级切换模板，右侧表单 + Markdown 编辑器；下载整包 ZIP（内含 `AI-PROMPT.md`）；不调用在线 AI。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 密码门 | `#gate` | 访问密码 | 第 16–22 行 |
| 2 | 顶栏 / 导航 | `.hub-header` `.hub-nav` | 品牌、四页互链 | 第 23–25 行 |
| 3 | 首屏 | `.hub-hero` | 标题、说明、3 个特性 chip | 第 26 行 |
| 4 | 文档包面板 | `.package-panel` | 层级说明、推荐顺序、下载 ZIP、复制 AI 提示词、应用资料到全部模板 | 第 27–32 行 |
| 5 | 模板布局 | `.template-layout` | 左侧模板列表 + 右侧编辑器 | 第 33 行 |
| 6 | 左侧栏 | `#templateTabs` `#templateList` | 4 个层级 + 附加文档；模板选择；草稿导出 / 导入 | 第 34 行 |
| 7 | 右侧编辑器 | `#templateTitle` `#projectFields` `#documentOutput` | 标题、动态资料表单、Markdown 正文、复制 / 下载 / 恢复默认 | 第 35–44 行 |
| 8 | 状态行 | `#storageStatus` `#editStatus` | 草稿读取、保存状态 | 第 41–42 行 |

## 4. 布局

- **容器**：`.hub-wrap` `width: min(1140px, calc(100% - 48px))`；模板区为两栏 `260px + minmax(0,1fr)`。
- **文档包面板**：顶部整宽卡片，内部 `minmax(230px,320px) / 1fr` 两栏：左侧层级刻度，右侧说明与按钮。
- **左侧栏**：层级 tab 两列网格；模板列表纵向排列；底部备份按钮。
- **右侧**：标题区 + 资料表单（`1fr 1fr` 两列，`.wide` 跨列）+ Markdown 编辑器（最小高 610px，可拖拽）+ 操作行。
- **断点**：≤ 800px 两栏变单栏，层级 tab 两列；≤ 600px 资料表单单列、标题区换行。

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
| 当前层级高亮 | `.package-list[data-current="true"] b` | `#d4f178` |
| 错误状态 | `.template-storage[data-error="true"]` | `#ffbd78` |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(30px, 4.5vw, 48px)` / 700 | 字距 -.04em |
| 面板 `h2` | 20px / 650 | |
| 模板标题 | 16px / 600 | |
| 正文 / 标签 | 12.5–13px / 400，行高 1.7 | |
| Markdown 编辑器 | `13px/1.85` 等宽 | `ui-monospace / Consolas` |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 面板圆角 | 18px |
| 模板项圆角 | 12px |
| 层级 tab 圆角 | 9px |
| 编辑器圆角 | 12px |
| 面板内边距 | 20–24px |
| 编辑器最小高 | 610px |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 层级切换 | 点击 tab / 层级 | 模板列表与说明切换 |
| 模板切换 | 点击模板项 | 右侧内容替换，`aria-pressed` 高亮 |
| 保存提示 | 输入 / 导入 | 状态行更新「已保存 / 保存失败」 |
| 对话框 | 导入确认 | 原生 `confirm` / `dialog` |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 密码门 | `js/gate.js` | 弱隔离 |
| 文档包面板 | `.package-panel` `.package-options` `.level-scale` `#packageSummary` | 层级说明与操作 |
| 下载包 | `#downloadPackage` | 生成当前层级 ZIP（含 `AI-PROMPT.md`） |
| 复制提示词 | `#copyPrompt` | 复制交给 AI 的生成提示词 |
| 应用资料 | `#applyProject` | 把当前项目资料写入所有仍关联的变量 |
| 层级 tab | `#templateTabs` `.template-tab` | 精简 3 / 进阶 5 / 专业 8 / 完整 10 / 附加 |
| 模板列表 | `#templateList` `.template-choice` | 10 份主文档 + 5 份附加 |
| 资料表单 | `#projectFields` `.template-fields` | 随模板变化的变量输入 |
| Markdown 编辑器 | `#documentOutput` `.template-editor` | 可编辑正文，实时记字符数 |
| 复制 / 下载 | `#copyDocument` `#downloadDocument` | 复制 Markdown / 下载 `.md` |
| 恢复默认 | `#resetTemplate` | 还原当前模板 |
| 草稿备份 | `#exportDrafts` `#importDrafts` `#draftFile` | JSON 导入导出 |
| 状态 | `#editStatus` `#storageStatus` | 就绪 / 已保存 / 错误 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 密码门 | 解锁工作台 | `#gateBtn` | 校验密码 | 本页 |
| 导航 | 工作经验 / 问题排查 / 文档模板 / 命令片段 | `.hub-nav a` | 跳转 | 对应页面 |
| 下载整包 | 下载当前层级 .zip | `#downloadPackage` | 生成并下载 ZIP | 本机 |
| 复制提示词 | 复制 AI 生成提示词 | `#copyPrompt` | 复制提示词 | 剪贴板 |
| 应用资料 | 将当前资料应用到全部模板 | `#applyProject` | 批量替换变量 | 本页 |
| 层级 | 精简版 3 / 进阶版 5 / 专业版 8 / 完整版 10 / 附加文档 | `.template-tab` | 切换文档范围 | 本页 |
| 模板 | 10 份文档 | `.template-choice` | 打开对应模板 | 本页 |
| 复制正文 | 复制 Markdown | `#copyDocument` | 复制编辑器内容 | 剪贴板 |
| 下载单篇 | 下载 .md | `#downloadDocument` | 下载单个文件 | 本机 |
| 恢复默认 | 恢复当前模板默认 | `#resetTemplate` | 还原模板 | 本页 |
| 草稿备份 | 导出全部草稿 JSON / 导入草稿 JSON | `#exportDrafts` / `#importDrafts` | 备份 / 恢复 | 本机 |

## 8. 交互与状态

- **层级模型**：精简 `spec / design / tasks`；进阶加 `database / readme`；专业加 `agents / standards / version`；完整加 `dictionary / api`；附加 `change / archive / acceptance / release / legacy-change` 不随层级变化。
- **变量渲染**：模板正文用 `{{变量}}`；用户手改过的片段会变成「自定义内容」，不再被资料批量覆盖。
- **草稿**：每次编辑写入 `localStorage`（键见 `doc-templates.js`）；只在本浏览器、本站点有效；导入上限 2 MB，格式版本 1，覆盖前二次确认。
- **ZIP**：优先使用各文档已保存的编辑内容；未编辑的沿用项目资料；包内附 `AI-PROMPT.md`。
- **错误态**：存储不可用时 `#storageStatus` 标红提示；导入失败给出原因。
- **无障碍**：tab 使用 `role="tablist"` / `aria-selected`；按钮有明确文案；编辑器有 `aria-describedby`。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 800px` | 模板区单栏；左侧列表两列；资料表单单列 |
| `max-width: 600px` | 文档包面板单栏；标题区换行；编辑器高度降低 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏标题 / 说明 / chip | `.hub-hero` |
| 文档模板正文 | `js/project-doc-templates.js` / `js/doc-templates.js` 的模板定义 |
| 层级与文档组合 | `js/doc-templates.js` 的 `levels` |
| 资料字段 | `js/doc-templates.js` 的字段定义与 `#projectFields` 渲染 |
| 提示词 | 同文件的 `copyPrompt` 文案 |
| ZIP 内容 | 同文件的打包逻辑 |
| 草稿版本 / 上限 | 同文件的存储与导入校验 |

## 11. 修改须知

- **关联文件**：`css/work-hub.css`、`js/project-doc-templates.js`、`js/doc-templates.js`、`js/gate.js`、`script/studio.js`。
- **模板即产品**：改模板正文等于改交付物，必须保证变量名、章节结构、示例一致；不要把未确认的假设写成既定事实。
- **版本兼容**：草稿格式有版本号，改结构要升版本并兼容旧草稿，否则用户草稿会失效。
- **安全**：导入 JSON 只接受本工具格式；渲染 Markdown 到 HTML 时注意转义。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「开发文档模板台」章节。
