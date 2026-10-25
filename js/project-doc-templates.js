// docs 文档骨架：只放标题层级，不放正文。
// 占位符只有 {项目名称} / {技术栈}；页面名一律写「页面名称」，避免与占位符语法混淆。
(() => {
  'use strict';

  const trees = {
    multi: `项目根/
├── AGENT.md
├── README.md
└── docs/
    ├── README.md
    ├── {技术栈}编码规范.md
    ├── 版本管理规范.md
    ├── database.md
    ├── design/
    │   ├── 变更记录.md
    │   └── pages/
    ├── tasks/
    │   ├── 变更记录.md
    │   └── pages/
    ├── spec/
    │   ├── 变更记录.md
    │   └── pages/
    └── archive/`,
    slim: `项目根/
├── AGENT.md
├── README.md
└── docs/
    ├── README.md
    ├── {技术栈}编码规范.md
    ├── 版本管理规范.md
    ├── database.md
    ├── design.md
    ├── tasks.md
    ├── spec.md
    ├── 变更记录.md
    └── archive/`
  };

  const changeSkeleton = (label) => `# ${label} 变更记录

> 只追加不修改；改一次就记一条，旧记录不删。

## 1. 记录规则
## 2. 变更记录

| 变更时间 | 修改前 | 修改后 | 变更原因 | 变更文件 |
| --- | --- | --- | --- | --- |

## 3. 归档`;

  const kit = {
    version: 2,
    updatedAt: '2026-10-25',
    modes: {
      multi: { label: '页面 >5', hint: 'design / tasks / spec 各建文件夹，页面放 pages/ 一页一份' },
      slim: { label: '页面 ≤5', hint: '不建三个文件夹，docs 下直接放 design.md、tasks.md、spec.md 和一份 变更记录.md' }
    },
    groups: [
      { id: 'root', label: '项目根目录' },
      { id: 'docs', label: 'docs/' },
      { id: 'design', label: 'docs/design/' },
      { id: 'tasks', label: 'docs/tasks/' },
      { id: 'spec', label: 'docs/spec/' },
      { id: 'archive', label: 'docs/archive/' }
    ],
    trees,
    rules: [
      { title: '设计→任务→验收', text: 'design 写页面设计，tasks 拆任务，spec 定规范与验收；同一个页面在三处用同一个编号。' },
      { title: '两种规模', text: '页面 >5 时 design / tasks / spec 各建文件夹，页面放 pages/；≤5 时三个文件夹都不建，docs 下直接放 design.md、tasks.md、spec.md 和一份 变更记录.md。' },
      { title: '变更留痕', text: '每次动文档，在 变更记录.md 记一条：变更时间、修改前、修改后、变更原因、变更文件；>5 页放各自目录，≤5 页统一放 docs/。' },
      { title: '代码同改', text: '代码改了，design / tasks / spec 与变更记录必须同改；archive/ 只装被替换的旧内容，只追加不修改。' }
    ],
    items: [
      {
        id: 'agent',
        pair: null,
        modes: ['multi', 'slim'],
        group: 'root',
        path: 'AGENT.md',
        title: 'Agent 工作入口',
        purpose: 'Agent 接手项目时先读的规则文件：读什么、守什么、改完同步什么',
        when: '项目初始化时写；协作规则变化时改',
        refs: 'docs/README.md、变更记录.md',
        skeleton: `# {项目名称} · AGENT 工作入口

> 接手项目先读这里，再读 docs/README.md。只写规则，不写项目宣传。

## 1. 项目概况
## 2. 开工前必读
## 3. 目录与文档职责
## 4. 设计与规范来源
## 5. 代码修改边界
## 6. 文档同步规则
## 7. 提交与交付
## 8. 禁止事项
## 9. 待确认事项`
      },
      {
        id: 'readme',
        pair: null,
        modes: ['multi', 'slim'],
        group: 'root',
        path: 'README.md',
        title: '项目说明',
        purpose: '项目是干什么的、怎么跑起来；不写业务细节',
        when: '初始化时写；运行方式或依赖变化时改',
        refs: 'AGENT.md、docs/README.md',
        skeleton: `# {项目名称}

> 一句话说明这个项目做什么、给谁用。

## 1. 项目简介
## 2. 技术栈
## 3. 目录结构
## 4. 本地运行
### 4.1 环境要求
### 4.2 安装依赖
### 4.3 启动命令
### 4.4 访问地址
## 5. 常用命令
## 6. 文档导航`
      },
      {
        id: 'docs-readme',
        pair: null,
        modes: ['multi', 'slim'],
        group: 'docs',
        path: 'docs/README.md',
        title: 'docs 导航',
        purpose: '每个目录管什么、先读哪份、编号怎么排',
        when: '新增或删除文档时同步',
        refs: 'AGENT.md',
        skeleton: `# {项目名称} · 文档导航

> docs 下每个目录管什么、按什么顺序读。

## 1. 目录索引

| 路径 | 作用 | 什么时候更新 |
| --- | --- | --- |

## 2. 阅读顺序
## 3. 命名与编号
## 4. 页面规模与目录形态
## 5. 变更同步规则
## 6. 归档规则`
      },
      {
        id: 'coding',
        pair: null,
        modes: ['multi', 'slim'],
        group: 'docs',
        path: 'docs/{技术栈}编码规范.md',
        title: '编码规范',
        purpose: '技术栈、命名、方法与函数写法、代码质量、AI 写码红线',
        when: '技术栈或团队约定变化时改',
        refs: 'AGENT.md、docs/spec/',
        skeleton: `# {技术栈} · 编码规范

> 只写能落地的规则；写不出正例和反例的条款不要写。

## 1. 技术栈与版本
## 2. 目录与分层
## 3. 命名规范
### 3.1 文件与目录
### 3.2 变量与常量
### 3.3 方法与函数
### 3.4 类与组件
### 3.5 接口与数据表
## 4. 方法与函数规范
## 5. 类型、空值与校验
## 6. 注释与文档
## 7. 错误处理与日志
## 8. 代码质量
## 9. AI 写码规范
## 10. 正例与反例
## 11. 提交前自检`
      },
      {
        id: 'git',
        pair: null,
        modes: ['multi', 'slim'],
        group: 'docs',
        path: 'docs/版本管理规范.md',
        title: '版本管理规范',
        purpose: '分支模型、提交标识、-m 与 -s、发布与回滚',
        when: '协作流程变化时改',
        refs: 'AGENT.md',
        skeleton: `# 版本管理规范

> 提交统一用 git commit -s -m "标识：说明"：-s 补 Signed-off-by，-m 写清单行说明。

## 1. 分支模型
## 2. 提交信息格式
## 3. 提交标识

| 标识 | 用途 | 示例 |
| --- | --- | --- |
| feat | 新增功能 | feat：新增订单导出 |
| update | 修改已有功能 | update：调整订单筛选条件 |
| get | 查询、读取类改动 | get：补充订单详情查询 |
| delete | 删除功能或文件 | delete：移除旧版导出入口 |
| cancel | 撤销、废弃 | cancel：废弃重复审批入口 |
| fix | 修复缺陷 | fix：修正金额精度 |
| docs | 文档 | docs：补充数据库字段说明 |
| refactor | 重构 | refactor：拆分订单服务 |
| style | 格式调整 | style：统一缩进 |
| test | 测试 | test：补充下单用例 |
| chore | 构建与杂务 | chore：升级依赖 |

## 4. 提交命令与参数
## 5. 提交粒度
## 6. 合并与评审
## 7. 版本号与发布
## 8. 回滚
## 9. 禁止事项`
      },
      {
        id: 'db',
        pair: null,
        modes: ['multi', 'slim'],
        group: 'docs',
        path: 'docs/database.md',
        title: '数据库设计',
        purpose: '每张表每个字段的类型、长度、约束、校验与备注',
        when: '表结构变化时改，并在文件末尾记一条变更',
        refs: 'docs/design/、docs/spec/',
        skeleton: `# 数据库设计 · {项目名称}

> 每个字段都写清类型、约束、校验与备注，不写“同上”。

## 1. 数据库与版本
## 2. 表清单

| 表名 | 用途 | 关联页面 |
| --- | --- | --- |

## 3. 通用字段约定
## 4. 表结构
### 4.1 示例表

| 字段 | 类型 / 长度 | 必填 | 默认值 | 约束 | 校验 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |

### 4.2 索引与唯一键
### 4.3 外键与关联
### 4.4 枚举与状态
## 5. 事务与并发
## 6. 迁移与回滚
## 7. 变更记录`
      },
      {
        id: 'design-change',
        pair: 'change',
        modes: ['multi'],
        group: 'design',
        path: 'docs/design/变更记录.md',
        title: 'design 变更记录',
        purpose: '设计每次变更的时间、前后差异、原因与文件',
        when: '每次改 design 后追加',
        refs: 'docs/README.md',
        skeleton: changeSkeleton('design')
      },
      {
        id: 'design-page',
        pair: 'design',
        modes: ['multi'],
        group: 'design',
        path: 'docs/design/pages/01-示例页面.md',
        title: '页面设计（一页一份）',
        purpose: '页面的内容、组件、按钮、排版、字段、校验与视觉',
        when: '写页面前先写；页面变更时同步',
        refs: 'docs/tasks/pages/、docs/spec/pages/',
        skeleton: `# 页面设计 · 「页面名称」

> 一个页面一份；页面数 ≤5 时并入 docs/design/design.md。

## 1. 页面信息
## 2. 页面内容
## 3. 页面组件
## 4. 页面按钮
## 5. 页面排版
## 6. 页面样式
## 7. 主色调与风格
## 8. 页面字段

| 字段 | 控件 | 类型 | 必填 | 默认值 | 校验 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |

## 9. 字段校验逻辑
## 10. 电脑端视觉效果
## 11. 移动端视觉效果
## 12. 页面业务逻辑
## 13. 关联文档`
      },
      {
        id: 'design-single',
        pair: 'design',
        modes: ['slim'],
        group: 'docs',
        path: 'docs/design.md',
        title: '页面设计（合并版）',
        purpose: '页面 ≤5 个时，全部页面设计写在同一个文件里',
        when: '写页面前先写；页面变更时同步',
        refs: 'docs/tasks.md、docs/spec.md',
        skeleton: `# 系统设计 · {项目名称}

> 页面 ≤5 个：全部写在本文件；超过 5 个改为 pages/ 一页一份。

## 1. 设计说明
## 2. 页面索引

| 页面 | 路由 | 一句话说明 |
| --- | --- | --- |

## 3. 全局设计
### 3.1 布局与栅格
### 3.2 颜色与字体
### 3.3 公共组件
### 3.4 断点与适配
## 4. 页面设计
### 4.1 「页面名称」
#### 页面信息
#### 页面内容
#### 页面组件
#### 页面按钮
#### 页面字段
#### 页面排版与样式
#### 电脑端与移动端效果
#### 页面业务逻辑`
      },
      {
        id: 'tasks-change',
        pair: 'change',
        modes: ['multi'],
        group: 'tasks',
        path: 'docs/tasks/变更记录.md',
        title: 'tasks 变更记录',
        purpose: '任务拆分每次调整的时间、前后差异、原因与文件',
        when: '每次改 tasks 后追加',
        refs: 'docs/README.md',
        skeleton: changeSkeleton('tasks')
      },
      {
        id: 'tasks-page',
        pair: 'tasks',
        modes: ['multi'],
        group: 'tasks',
        path: 'docs/tasks/pages/01-示例页面.md',
        title: '页面任务清单（一页一份）',
        purpose: '把设计拆成可勾选、可验证的任务',
        when: '设计确认后拆；开发中更新状态',
        refs: 'docs/design/pages/、docs/spec/pages/',
        skeleton: `# 任务清单 · 「页面名称」

> 任务来自 design 同名页面；一条任务对应一个可验证的结果。

## 1. 任务来源
## 2. 任务拆解
### T-001 示例任务
- [ ] 任务说明
- [ ] 涉及文件
- [ ] 依赖
- [ ] 完成标准
## 3. 执行顺序
## 4. 阻塞与风险
## 5. 完成定义
## 6. 进度`
      },
      {
        id: 'tasks-single',
        pair: 'tasks',
        modes: ['slim'],
        group: 'docs',
        path: 'docs/tasks.md',
        title: '任务清单（合并版）',
        purpose: '页面 ≤5 个时，全部任务按页面分节写在同一个文件',
        when: '设计确认后拆；开发中更新状态',
        refs: 'docs/design.md、docs/spec.md',
        skeleton: `# 任务清单 · {项目名称}

> 页面 ≤5 个：全部任务写在本文件，按页面分节。

## 1. 任务总览
## 2. 按页面拆解
### 2.1 「页面名称」
#### T-001 示例任务
- [ ] 任务说明
- [ ] 涉及文件
- [ ] 依赖
- [ ] 完成标准
## 3. 执行顺序
## 4. 阻塞与风险
## 5. 进度`
      },
      {
        id: 'spec-change',
        pair: 'change',
        modes: ['multi'],
        group: 'spec',
        path: 'docs/spec/变更记录.md',
        title: 'spec 变更记录',
        purpose: '规范与验收标准每次调整的时间、原因与文件',
        when: '每次改 spec 后追加',
        refs: 'docs/README.md',
        skeleton: changeSkeleton('spec')
      },
      {
        id: 'spec-page',
        pair: 'spec',
        modes: ['multi'],
        group: 'spec',
        path: 'docs/spec/pages/01-示例页面.md',
        title: '页面规范与验收（一页一份）',
        purpose: '开发约束、边界、验收标准与自测清单',
        when: '设计确定后写；验收前补齐',
        refs: 'docs/design/pages/、docs/tasks/pages/',
        skeleton: `# 规范开发与验收 · 「页面名称」

> 先写约束，再写验收；每条验收都能判定通过或失败。

## 1. 规范范围
## 2. 开发约束
## 3. 实现要点
## 4. 边界与异常
## 5. 性能与安全
## 6. 验收标准
### AC-001 示例验收项
- 前置条件
- 操作步骤
- 预期结果
## 7. 自测清单
## 8. 验收结论`
      },
      {
        id: 'spec-single',
        pair: 'spec',
        modes: ['slim'],
        group: 'docs',
        path: 'docs/spec.md',
        title: '规范与验收（合并版）',
        purpose: '页面 ≤5 个时，全部规范与验收按页面分节写在同一个文件',
        when: '设计确定后写；验收前补齐',
        refs: 'docs/design.md、docs/tasks.md',
        skeleton: `# 规范开发与验收 · {项目名称}

> 页面 ≤5 个：全部写在本文件，按页面分节。

## 1. 说明
## 2. 全局规范
## 3. 按页面规范
### 3.1 「页面名称」
#### 开发约束
#### 验收标准
#### 自测清单
## 4. 验收结论`
      },
      {
        id: 'change-single',
        pair: 'change',
        modes: ['slim'],
        group: 'docs',
        path: 'docs/变更记录.md',
        title: '变更记录（统一）',
        purpose: '页面 ≤5 个时，design / tasks / spec 的变更统一记在这一份',
        when: '每次动 design.md / tasks.md / spec.md 后追加',
        refs: 'docs/design.md、docs/tasks.md、docs/spec.md',
        skeleton: `# 变更记录 · {项目名称}

> 页面 ≤5 个：design / tasks / spec 的变更统一记在本文件，只追加不修改。

## 1. 记录规则
## 2. 变更记录

| 变更时间 | 修改前 | 修改后 | 变更原因 | 变更文件 |
| --- | --- | --- | --- | --- |

## 3. 归档`
      },
      {
        id: 'archive',
        pair: null,
        modes: ['multi', 'slim'],
        group: 'archive',
        path: 'docs/archive/README.md',
        title: '归档索引',
        purpose: '被替换的旧文档怎么归档、放在哪、怎么恢复',
        when: '文档大改或定版本基线时',
        refs: 'docs/README.md',
        skeleton: `# 归档区 · {项目名称}

> 只装被替换的旧内容，只追加不修改。

## 1. 归档规则
## 2. 命名规则
## 3. 归档索引

| 归档时间 | 原路径 | 替代文档 | 归档原因 |
| --- | --- | --- | --- |

## 4. 恢复方式`
      }
    ]
  };

  // 启动自检：数据写错时宁可显性报错，也不静默渲染半套。
  function assertKit(data) {
    const problems = [];
    const ids = new Set();
    const allowed = new Set(['项目名称', '技术栈']);
    for (const item of data.items) {
      if (ids.has(item.id)) problems.push(`id 重复：${item.id}`);
      ids.add(item.id);
      if (!Array.isArray(item.modes) || !item.modes.length) problems.push(`${item.id} 缺少 modes`);
      else if (item.modes.some(mode => !data.modes[mode])) problems.push(`${item.id} 含未知形态`);
      if (!data.groups.some(group => group.id === item.group)) problems.push(`${item.id} 的 group 不存在`);
      if (!item.path.endsWith('.md')) problems.push(`${item.id} 路径不是 .md`);
      if (!item.skeleton.trim().startsWith('# ')) problems.push(`${item.id} 骨架缺少一级标题`);
      if (/```/.test(item.skeleton)) problems.push(`${item.id} 骨架含代码围栏`);
      const tokens = [...item.skeleton.matchAll(/\{([^{}\n]*)\}/g)].map(match => match[1]);
      const bad = tokens.filter(token => !allowed.has(token));
      if (bad.length) problems.push(`${item.id} 含非约定占位符：${bad.join('、')}`);
    }
    const pairs = new Map();
    for (const item of data.items.filter(entry => entry.pair)) {
      if (!pairs.has(item.pair)) pairs.set(item.pair, []);
      pairs.get(item.pair).push(item);
    }
    for (const [pair, group] of pairs) {
      for (const mode of Object.keys(data.modes)) {
        if (!group.some(item => item.modes.includes(mode))) problems.push(`pair ${pair} 缺少 ${mode} 形态`);
      }
    }
    for (const mode of Object.keys(data.modes)) {
      if (!data.items.some(item => item.modes.includes(mode))) problems.push(`形态 ${mode} 没有任何模板`);
    }
    return problems;
  }

  window.DocTemplateKit = kit;
  kit.problems = assertKit(kit);
  if (kit.problems.length) console.error('[doc-templates] 模板数据校验失败：\n' + kit.problems.join('\n'));
})();
