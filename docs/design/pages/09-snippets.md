# 命令与代码片段 · pages/snippets.html

> 可搜索、可收藏、可参数化的命令片段库：内置 16 条常用命令，自定义片段存本机，复制前先核对。

---

## 1. 元信息

| 字段 | 内容 |
| --- | --- |
| 页面文件 | [`pages/snippets.html`](../../../pages/snippets.html) |
| 线上路径 | `/pages/snippets.html` |
| 页面类型 | 私有工具库（检索 + 本地增删改 + 参数预览） |
| `<title>` | 命令与代码片段 · 工作台 |
| 样式文件 | [`css/work-hub.css`](../../../css/work-hub.css) + 页面内联 `<style>` |
| 脚本文件 | [`script/studio.js`](../../../script/studio.js)、[`js/snippets.js`](../../../js/snippets.js)、[`js/gate.js`](../../../js/gate.js) |
| 依赖资源 | 无图片；内置片段写在 JS 里 |
| 数据来源 | 内置 16 条 + 自定义片段 / 收藏，存 `localStorage['work-hub.snippets.v1']`；JSON 备份导入导出 |
| 访问控制 | 密码门（`data-pw-field="work-hub-PW"`，前端校验） |
| 文档更新 | 2026-10-24 |

## 2. 页面定位

- **给谁看**：自己与同事，写脚本 / 排查问题时少查一次。
- **核心任务**：按场景找到片段 → 填参数 → 预览 → 复制；内置片段只读，自定义片段可编辑。
- **安全取向**：只复制、不执行；明确提示参数不做转义、数据库外部输入要用参数化查询。

## 3. 页面结构

| # | 区块 | 锚点 / 标识 | 主要内容 | 源码位置 |
| --- | --- | --- | --- | --- |
| 1 | 密码门 | `#gate` `#gatePw` `#gateBtn` | 访问密码 | 第 16–25 行 |
| 2 | 顶栏 | `.hub-header` | 品牌、返回主页 | 第 26–29 行 |
| 3 | 工作台导航 | `.hub-nav` | 工作经验 / 问题排查 / 文档模板 / 命令片段 | 第 31–37 行 |
| 4 | 首屏 | `.hub-hero` | 标题、说明、3 个 chip | 第 38–43 行 |
| 5 | 筛选与管理 | `.panel` `.snippet-tools` | 全文搜索、分类、只看收藏、新增、导出 / 导入、状态 | 第 44–56 行 |
| 6 | 计数行 | `#snippetCount` | 当前结果数 + 只读提示 | 第 57 行 |
| 7 | 片段列表 | `#snippetGrid` `.library-grid` | 片段卡 | 第 58 行 |
| 8 | 空态 | `#snippetEmpty` | 无匹配提示 + 重置 | 第 59 行 |
| 9 | 使用提示 | `.snippet-note` | 环境 / 权限 / 转义提醒 | 第 60 行 |
| 10 | 新增 / 编辑对话框 | `#snippetEditor` | 标题、分类、说明、标签、代码模板 | 第 63–75 行 |
| 11 | 预览对话框 | `#snippetPreview` | 参数输入、生成预览、原始模板、复制 | 第 76 行起 |
| 12 | 导入确认对话框 | `#snippetImportDialog` | 合并 / 覆盖二选一 | 尾部 |
| 13 | 页脚 | `<noscript>` 提示 | 无 JS 提示 | 第 61 行 |

## 4. 布局

- **容器**：`.hub-wrap` `width: min(1140px, calc(100% - 48px))`，左右间距由容器控制。
- **首屏**：单列；标题 `clamp`，chips 横排换行。
- **工具栏**：`.snippet-tools` flex 换行，搜索 `flex: 1 1 240px`，分类下拉，收藏复选，新增按钮。
- **摘要行**：提示文本 + 导出 / 导入按钮两端对齐。
- **列表**：`.library-grid` 两列（`repeat(2, minmax(0,1fr))`，间距 18px）；卡片纵向：标题、说明、代码块（最高 180px 滚动）、标签、操作。
- **对话框**：预览对话框 `min(780px, 100% - 28px)`，参数区 `repeat(auto-fit, minmax(190px,1fr))`。

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
| 收藏选中 | `.chip[aria-pressed=true]` | `--mint` |
| 代码块 | `.code-block` | 深色底 + 等宽 |

### 5.2 字体

| 角色 | 字号 / 字重 | 说明 |
| --- | --- | --- |
| 首屏 `h1` | `clamp(30px, 5vw, 52px)` / 700 | |
| 卡片 `h3` | 15px / 600 | |
| 正文 | 13–13.5px / 400，行高 1.7 | |
| 代码 / 参数 | `--mono` 12–13px | `ui-monospace / Consolas` |
| 提示 | 0.85rem / 400 | `--muted` |

### 5.3 间距与形状

| 项目 | 值 |
| --- | --- |
| 面板圆角 | 18px |
| 卡片圆角 | 14px |
| 代码块圆角 | 10px |
| 对话框圆角 | 20px |
| 卡片内边距 | 16–18px |
| 代码块最高 | 180px（编辑）/ 320px（预览） |

### 5.4 动效

| 动效 | 触发 | 说明 |
| --- | --- | --- |
| 筛选 | 搜索 / 分类 / 收藏 | 卡片即时显隐 |
| 对话框 | 打开 / 关闭 | 原生 `dialog` + 遮罩模糊 |
| 复制反馈 | 点击复制 | 按钮短暂显示「已复制」 |
| 收藏 | 点击星标 | 填充与计数变化 |
| 减弱动效 | `prefers-reduced-motion` | 关闭过渡 |

## 6. 组件清单

| 组件 | 关键类名 / 函数 | 说明 |
| --- | --- | --- |
| 密码门 | `js/gate.js` | 弱隔离 |
| 搜索 | `#snippetSearch` | 匹配标题、说明、标签、代码 |
| 分类 | `#snippetCategory` | Git / Docker / PowerShell / SQL / JavaScript / Python / 其他 |
| 只看收藏 | `#snippetFavorites` | 过滤收藏 |
| 新增 | `#snippetAdd` | 打开编辑对话框 |
| 导出 / 导入 | `#snippetExport` `#snippetImport` `#snippetFile` | JSON 备份 |
| 片段卡 | `.snippet-card` | 标题、说明、代码块、标签、收藏 / 编辑 / 删除 / 预览 |
| 空态 | `#snippetEmpty` `#snippetReset` | 无匹配 + 重置 |
| 编辑对话框 | `#snippetEditor` `#snippetEditorForm` | 标题、分类、说明、标签、代码模板 |
| 预览对话框 | `#snippetPreview` `#parameterFields` `#previewCode` | 参数替换与预览 |
| 原始模板 | `#previewOriginal` | 始终保留原始代码 |
| 导入确认 | `#snippetImportDialog` | 合并 / 覆盖 |
| 状态 | `#snippetStatus` `#editorStatus` `#previewStatus` | 操作反馈 |

## 7. 按钮与入口

| 按钮 / 入口 | 文案 | 类名 / 选择器 | 行为 | 去向 |
| --- | --- | --- | --- | --- |
| 密码门 | 解锁工作台 | `#gateBtn` | 校验密码 | 本页 |
| 返回主页 | 返回主页 ↗ | `.hub-header a` | 跳转 | `../index.html` |
| 导航 | 工作经验 / 问题排查 / 文档模板 / 命令片段 | `.hub-nav a` | 跳转 | 对应页面 |
| 搜索 | 搜索标题、说明、标签或代码… | `#snippetSearch` | 过滤 | 本页 |
| 分类 | 全部分类 / Git / Docker / … | `#snippetCategory` | 过滤 | 本页 |
| 收藏筛选 | 只看收藏 | `#snippetFavorites` | 过滤 | 本页 |
| 新增 | ＋ 新增片段 | `#snippetAdd` | 打开空白编辑器 | `#snippetEditor` |
| 导出 | 导出 JSON | `#snippetExport` | 下载备份 | 本机 |
| 导入 | 导入 JSON | `#snippetImport` | 打开导入确认 | `#snippetImportDialog` |
| 片段操作 | 预览 / 收藏 / 编辑 / 删除 | 卡片内按钮 | 打开预览、切换收藏、编辑、删除 | 本页 |
| 编辑器 | 保存到本地 / 取消 | `#snippetEditorForm` 按钮 | 保存或关闭 | 本页 |
| 预览 | 复制预览 / 复制原始模板 / 关闭 | `#copyPreview` `#copyOriginal` | 复制生成结果或原模板 | 剪贴板 |
| 导入确认 | 确认导入 / 取消 | `#snippetImportForm` 按钮 | 合并或覆盖 | 本页 |
| 空态 | 重置筛选 | `#snippetReset` | 清空条件 | 本页 |

## 8. 交互与状态

- **数据模型**：`{ id, title, category, description, tags[], code, builtin }`；内置片段 id 以 `builtin-` 开头，只读。
- **参数化**：代码模板用 `{{variable}}` 标记参数；参数名限英文字母、数字、下划线，以字母开头，最多 40 字；预览只做文本替换，不做 Shell / SQL 转义，未填参数保留占位符。
- **持久化**：自定义片段与收藏存 `localStorage`；上限 200 条自定义片段；内置片段始终保留。
- **导入**：支持「合并」与「覆盖」；覆盖会替换全部自定义片段与收藏，导入前确认。
- **空态**：无匹配显示 `#snippetEmpty`；`<noscript>` 提示需要 JS。
- **无障碍**：`role="status"` / `role="alert"` 播报；对话框原生焦点管理；收藏按钮 `aria-pressed`。

## 9. 响应式

| 断点 | 变化 |
| --- | --- |
| `max-width: 760px` | 工具栏纵向；列表单列；对话框全宽 |
| `prefers-reduced-motion` | 关闭过渡 |

## 10. 内容维护

| 想改什么 | 改哪里 |
| --- | --- |
| 首屏标题 / 说明 / chip | `.hub-hero` |
| 内置片段 | `js/snippets.js` 的 `builtins` 数组 |
| 分类选项 | `#snippetCategory` 与编辑框内的 `<select>` |
| 参数规则 | `js/snippets.js` 的参数解析与校验 |
| 存储键 / 上限 | `js/snippets.js` 的 `STORAGE_KEY`、`MAX_CUSTOM` |
| 导入合并 / 覆盖逻辑 | 同文件的导入函数 |
| 样式 | `css/work-hub.css` + 页面内联 `<style>` |

## 11. 修改须知

- **关联文件**：`css/work-hub.css`、`js/snippets.js`、`js/gate.js`、`script/studio.js`。
- **不要存入敏感信息**：页面已明确提示「不要保存密码、令牌或个人敏感信息」；文档与示例同样遵守。
- **转义责任在用户**：参数替换不转义，UI 必须继续保留这条提示，不能删除。
- **版本兼容**：存储键 `work-hub.snippets.v1`，改结构要升版本并兼容旧数据。
- **必须同步**：本文件 + [`docs/change.md`](../../change.md) 的「命令与代码片段」章节。
