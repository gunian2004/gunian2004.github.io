# 内容书架 · semantic-space 拆解重构设计

> 日期：2026-10-25
> 目标页面：[`pages/semantic-space.html`](../../pages/semantic-space.html)
> 状态：已实现（书架形态）

---

## 1. 背景

现有 `semantic-space.html` 用 Three.js 画了 78 个 sprite 点云：能转、能高亮、能连线，但**拆不动**，缺“实体感”，且访客看不出它表示什么。参考 `D:\OneDrive\Desktop\大疆three`（DJI Osmo Action 4 拆解 demo）后确认：震撼来自四件事——部件真的分离、拆解时相机自动重构图、引线标注跟随 3D 锚点、选中件描边发光。

本次把点云换成一台**可拆解的拟物装置**：一排立在书架上的书。每本书 = 一个内容主题（7 个主题 = 7 本书），书脊上的发光细条 = 该主题下的片段（共 78 条）。书架本身是“博客内容”的直白隐喻，访客不用读字就能认出“这是一摞文章”。

> 形态演变：初版设计为「内容引擎」（基座 + 导柱 + 层板 + 索引环 + 顶盖），评审后认为访客无法理解其含义，遂改为「内容书架」。本文档以书架为准。

## 2. 决策记录

| # | 议题 | 决定 |
| --- | --- | --- |
| 1 | 页面明暗 | **保持浅色纸感**，不改深色主题 |
| 2 | 模型形态 | **内容书架**：一块横板 + 两侧立板 + 7 本竖立的书（书脊朝前） |
| 3 | 部件划分 | **按 7 个内容主题**拆成 7 本书 |
| 4 | 检索关系 | **书脊光条**：每本书书脊上有 N 条细光条 = N 个片段，检索点亮对应光条 |
| 5 | 书尺寸 | **宽度 / 高度按片段数**成正比（sqrt 压缩），最小保底 |
| 6 | 布局 | **整宽舞台 + 浮层**，检索行移到舞台下方 |
| 7 | 代码组织 | **拆两个 JS**：`semantic-space.js`（数据与面板）/ `semantic-engine.js`（Three 引擎） |

## 3. 模型结构

坐标：`+Y` 向上，`+Z` 朝向观察者（书架正面）。1 场景单位 ≈ 100 px（相机 radius 约 4.4 时）。

| # | 部件 | 几何 | 关键常量 |
| --- | --- | --- | --- |
| 01 | 书架横板 SHELF | 圆角长板 `2.5 × 0.62 × 0.14`（r 0.06）+ 蚀刻铭牌 | `SHELF_W=2.5, SHELF_D=0.62, SHELF_H=0.14` |
| 02 | 两侧立板 ×2 | 圆角竖板 `0.05 × 0.62 × 1.22`，位于 `x = ±(SHELF_W/2 - 0.025)` | 高 1.22，托住书 |
| 03 | 书 ×7 | 竖立方块：封面（深金属）+ 书脊（主题色，朝 +Z）+ 书页侧边（浅色）+ 书脊光条（每片段 1 条） | `BOOK_H=1.18, BOOK_DEPTH=0.6` |
| 04 | 索引轨 RAIL | 横板前缘一条刻度轨，78 道刻度对应 78 片段 | 贴 `SHELF_D/2` 前缘 |
| 05 | 接触阴影 | 横板下方径向渐变平面，不用 shadow map | `y = -SHELF_H/2 - 0.048` |

**书尺寸公式**（MAXN = 最大片段数 = 44）：
- 宽度 `w = 0.17 + 0.22 · sqrt(count / MAXN)`
- 高度 `h = 0.96 + 0.24 · sqrt(count / MAXN)`

| 主题 | key | 片段 | w | h |
| --- | --- | --- | --- | --- |
| 代理规则 | rules | 44 | 0.39 | 1.20 |
| 项目实践 | project | 17 | 0.31 | 1.11 |
| 提示词 | prompts | 9 | 0.27 | 1.07 |
| 软件设计 | design | 2 | 0.22 | 1.01 |
| 智能体开发 | agent | 2 | 0.22 | 1.01 |
| 自动化工作流 | automation | 2 | 0.22 | 1.01 |
| 产品分析 | product | 2 | 0.22 | 1.01 |

**书的结构（由内到外）**：
- `cover`：深金属 `0x0d1219`，metalness 0.62 / roughness 0.5，书芯主体
- `spine`：整面主题色，朝 +Z，`emissive 0.42`，书的“正面”
- `accent`：书脊中央竖向高亮带，`emissive 0.95`
- `edge`（页面侧/顶边）：浅色 `0xe7e0d2`，拆解后露出，提示“这是书页”
- `cell`（书脊光条）：每片段一条 `0.014×0.022×0.006` 细条，`emissive 0.3`，检索命中时提亮 —— 这是拾取与高亮的最小单元

**拆解位移**：沿 X 轴水平扇形展开，`dx = (i - 3) * 0.22`（i 为书序 0–6），叠加小幅 Y 抬升与 Z 前移，避免相互遮挡。

**相机**：`theta = -0.18, phi = 1.46`（接近水平、正对书脊），装配态 radius ≈ 4.4，拆解态自动增大并重算包围球。

## 4. 检索联动

```
查询 → hits[≤24]（现有向量 / BM25 逻辑不动）
     → 按 chunk.c 聚合到 7 本书
     → 书级：hitCount、maxScore、热度 = maxScore / 全局最高分
     → 条级：命中光条 emissive 提亮，未命中保持 0.3 基线
```

- 状态药丸（status pill）文案示例：`命中 24 段 · 分布在 5 本书 · 点亮处看详情`、`选中：代理规则 · 44 段 · 本次命中 11 段`。
- 召回列表 hover → 对应光条脉冲（`sin(t)` 缩放）；点击 → 片段详情 + 相机聚焦该书。
- 书脊光条既是“书被点亮”的视觉证据，也是唯一信息承载单元，保证“距离有意义”的诚实性（光条位置 = 该书在书架上的固定槽位）。

## 5. 交互规格

| 输入 | 行为 |
| --- | --- |
| 左键拖拽 | 旋转（theta / phi） |
| 滚轮 | 缩放（radius 限制区间） |
| 右键拖拽 | 平移 lookAt 的水平与 Y 偏移 |
| 单击书 | 拆解到 0.9 + 选中该书 + 打开部件详情 |
| 悬停书 | 上浮 + `cursor: pointer` + 名称气泡 |
| 单击光条（片段） | 选中该片段 + 打开片段详情 + 该书保持选中 |
| 双击书 | 相机聚焦该书（target 与 radius 插值） |
| `Esc` | 取消选中；已选中时再按一次复位视角 |

**拆解状态机**：`S.explode` 与 `S.explodeTarget` 每帧 `lerp`，阻尼系数约 6.0（`prefers-reduced-motion` 时直接赋值）。

**相机自动取景**：`explode` 变化超过阈值时重算包围球——装配态小半径、拆解态大半径，lookY 随之上移。这是“镜头跟着拆”的关键。

## 6. 页面布局

| 带 | 高度 | 内容 |
| --- | --- | --- |
| HUD | 浮层 | `内容书架 CONTENT SHELF` + `41 DOCS / 78 CHUNKS / 7 BOOKS` |
| 舞台 | 约 640px（整宽） | `#ssCanvas` + `#ssLabels`（SVG 引线层）+ `#ssStatus`（状态药丸）+ `#ssGuide`（首屏引导卡）+ `#ssDock`（5 按钮：翻开/合上书架、自动演示、标注、自转、复位） |
| 检索 | auto | 查询卡（含命中分布条）+ 召回列表 + 部件详情 / 片段详情面板 |

**首屏引导卡**：localStorage 记忆，说明拖拽旋转 / 滚轮缩放 / 输入问题检索，已读的访客不再弹出。

**工具条按钮文案**：`翻开书架` / `合上书架`（切换拆解）、`自动演示`、`标注`、`自转`、`复位`。

**部件详情字段**：名称、主题色、片段数、总字数、平均长度、本次命中数、代表片段（前 3 条标题）、原文入口。

## 7. 视觉规范

| 项 | 值 |
| --- | --- |
| 页面底色 | `#f4f2ed`（不变） |
| 舞台底色 | 纵向渐变 `#f8f6f1 → #e9e5dd` + 蓝图网格 1px `rgba(23,36,51,.035)` |
| 书架横板 / 立板 | 深墨 `#10161e`，metalness 0.42，roughness 0.85 |
| 书封面 | `#0d1219`，metalness 0.62，roughness 0.5 |
| 书脊 | 主题色，`emissive 0.42`；中央高亮带 `emissive 0.95` |
| 书页边 | 浅色 `#e7e0d2`（拆解时露出，提示“这是书”） |
| 书脊光条 | 主题色，`emissive` 基线 0.3，命中提亮 |
| 选中描边 | 主题色 `BackSide` 外扩壳（scale 1.03）+ 透明光晕 |
| 接触阴影 | 横板下方径向渐变，`rgba(23,36,51,.20) → 0`，不用 shadow map |
| 标注 | 虚线 1px `rgba(23,36,51,.35)` + 端点圆 + 卡片（纸白底、1px 边、等宽 10.5px） |

**不用 additive blending**：浅色底上叠加会发白，高亮靠 emissive + 描边 + 投影。

## 8. 工程结构

### 8.1 文件

| 文件 | 职责 | 变化 |
| --- | --- | --- |
| `pages/semantic-space.html` | 结构：舞台 / 浮层 / 检索带 | 重写为书架舞台与工具条 |
| `css/semantic-space.css` | 令牌、面板、标注、工具条、响应式 | 重写舞台相关 |
| `js/semantic-space.js` | 数据索引、分词、BM25、召回、面板、装配 | 接引擎回调，删点云 |
| `js/semantic-engine.js` | 场景、书架构建、相机、拾取、标注、渲染循环 | 新建 |
| `js/vendor/three/three.min.js` | Three r149 UMD | 不动 |

### 8.2 引擎 API

```js
const engine = SSEngine.create({
  canvas, stage, labelLayer, data,
  onSelectPart(key), onSelectChunk(index), onHoverPart(key | null), onReady()
});
engine.setHits([{ i, score }]);   // 检索结果 → 书脊光条
engine.selectPart(key | null);
engine.selectChunk(index);
engine.focusChunk(index);         // 聚焦某片段所在书
engine.setExplode(0 | 1);
engine.toggleExplode();
engine.tour();                    // 7 本书依次聚焦
engine.stopTour();
engine.setLabels(bool);
engine.setSpin(bool);
engine.setZoom(r);
engine.reset();
engine.deselect();
engine.resize();
engine.dispose();
```

引擎不读 DOM 面板，只通过回调上报；`semantic-space.js` 负责把回调翻译成面板状态与状态药丸文案。

### 8.3 渲染循环

- `requestAnimationFrame` 常驻，但维护 `dirty` 标记：无交互、无动画、无自转时停帧，静默后停止渲染；`pointerdown` / 检索更新 / resize 唤醒。
- `setPixelRatio(Math.min(dpr, 2))`；窄屏降到 1.5。
- 书脊光条共 78 个独立 Mesh（共享 BoxGeometry），每个独立材质以便逐条控制 emissive。

### 8.4 依赖红线

- 只用 Three r149 UMD 全局 `THREE`，**不引 addons、不引 ES module、不引 CDN**：`file://` 必须能直开。
- 环境贴图用 Canvas 程序化生成 equirect 渐变，经 `PMREMGenerator` 转换；无外部 HDR。
- 已踩坑：r149 下 `camera.updateMatrixWorld()` 不会刷新 `matrixWorldInverse`，取景计算需手动 `matrixWorldInverse.copy(matrixWorld).invert()`。

## 9. 降级与无障碍

| 场景 | 处理 |
| --- | --- |
| 无 WebGL | 舞台替换为 SVG 结构示意图（同一份 part 数据绘制）+ 文案；检索与面板全部可用 |
| ≤760px | 相机 radius +1.2、标注降到 3 个、工具条精简、首屏引导卡变窄 |
| `prefers-reduced-motion` | 拆解瞬时、关自转、关脉冲 |
| 键盘 | 舞台 `tabindex=0` + 方向键；部件清单可聚焦按钮列表，`aria-current` 标选中；canvas 不承载唯一信息 |

## 10. 验证计划

用 `playwright-core` + 本机 Edge 无头打开 `file://`，截图六态：装配、拆解、选中书、检索命中、760px、420px。

断言：

1. 书脊光条总数 = 78，且每本书光条数 = 该主题片段数。
2. 装配态整机包围盒 Y 跨度 < 1.45；拆解态相邻书包围盒不相交。
3. 点击书后 `aria-current` 与右侧详情标题一致。
4. 检索预设问题后，命中光条数 = 召回条数（截断到 24）。
5. 控制台零报错、零 Three 弃用警告。

## 11. 风险与取舍

| 风险 | 应对 |
| --- | --- |
| 浅色底上“发光”不明显 | 描边 + 阴影 + 高饱和 emissive 三重叠加；先截图验证再调参 |
| 44 段主书与 2 段薄书反差过大 | 宽度/高度按 `sqrt` 压缩，最薄仍可辨；配标注说明真实数量 |
| 拆解态超出画幅 | 相机自动取景 + 水平扇形展开系数可调 |
| 78 个材质拖慢低端机 | 窄屏降 pixelRatio、关闭自转；材质数固定不随时间增长 |
| 访客看不懂模型含义 | 改为“书架上的一排书”这一直白隐喻，HUD 与首屏引导卡双重说明 |

## 12. 不在本次范围

- 不引入神经 embedding，不改数据管线。
- 不做移动端 3D 手势（双指旋转缩放）。
- 不做模型导出、不做 AR。
