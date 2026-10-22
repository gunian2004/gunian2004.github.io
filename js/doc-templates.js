/* 开发文档模板台：纯本地草稿，正文中的活动变量使用区间跟踪保留手写内容。 */
(() => {
  'use strict';
  const STORAGE_KEY = 'work-hub.doc-templates.v1';
  const MAX_BYTES = 2 * 1024 * 1024;
  const MAX_BODY = 150000;
  const fieldRegistry = {
    projectName: '项目名称', techStack: '技术栈', moduleName: '所属模块', ownerName: '负责人 / 团队', projectBackground: '项目背景与目标',
    targetUser: '目标用户', acceptanceOwner: '验收负责人',
    pageCount: '页面 / 弹层数量', userRoles: '角色与权限',
    cadence: '迭代节奏', taskOwner: '执行人',
    dbEngine: '数据库与版本', mainEntities: '核心实体', txRequirement: '事务与并发要求',
    repoPath: '仓库 / 目录', runCommand: '启动命令',
    forbidden: '禁止操作', ciCommand: 'CI 命令',
    languageVersion: '语言 / 框架版本', lintTool: '检查工具',
    branchModel: '分支模型', releaseCycle: '发布节奏',
    fieldScope: '字段来源范围',
    apiStyle: '接口风格', authScheme: '鉴权方式',
    changeOwner: '记录人', archiveRoot: '归档目录', testEnv: '测试环境', releaseWindow: '发布窗口'
  };
  const baseFields = ['projectName', 'techStack', 'moduleName', 'ownerName', 'projectBackground'];
  const extraFields = {
    spec: ['targetUser', 'acceptanceOwner'],
    design: ['pageCount', 'userRoles'],
    tasks: ['cadence', 'taskOwner'],
    database: ['dbEngine', 'mainEntities', 'txRequirement'],
    readme: ['repoPath', 'runCommand'],
    agents: ['forbidden', 'ciCommand'],
    standards: ['languageVersion', 'lintTool'],
    version: ['branchModel', 'releaseCycle'],
    dictionary: ['fieldScope'],
    api: ['apiStyle', 'authScheme'],
    change: ['changeOwner'],
    archive: ['archiveRoot'],
    acceptance: ['testEnv'],
    release: ['releaseWindow']
  };
  const fieldHints = {
    projectName: '如：客户服务平台', techStack: '语言、框架、数据库及版本', moduleName: '如：订单管理 / 用户认证', ownerName: '填写实际负责人或团队', projectBackground: '服务谁、解决什么问题，以及本次工作边界',
    targetUser: '如：一线客服、门店店长', acceptanceOwner: '验收由谁签字确认',
    pageCount: '如：8 个页面 + 3 个弹层', userRoles: '如：游客 / 会员 / 运营 / 管理员',
    cadence: '如：2 周一个迭代', taskOwner: '默认执行人，可在任务表内覆盖',
    dbEngine: '如：MySQL 8.0 / PostgreSQL 16', mainEntities: '如：订单、支付、退款', txRequirement: '如：下单扣库存同一事务，峰值 200 QPS',
    repoPath: '如：仓库根目录 / apps/web', runCommand: '如：pnpm dev',
    forbidden: '如：不改生产配置、不直连生产库', ciCommand: '如：pnpm lint && pnpm test',
    languageVersion: '如：Java 21 + Spring Boot 3.3', lintTool: '如：ESLint + Prettier / Checkstyle',
    branchModel: '如：main + feature/*，发布用 release/*', releaseCycle: '如：每周二灰度、周四全量',
    fieldScope: '字段来源：design 的 PAGE 清单 / 现有表单',
    apiStyle: '如：REST + JSON，统一 /api/v1', authScheme: '如：Bearer JWT，按角色 + 资源鉴权',
    changeOwner: '负责回写变更记录的人', archiveRoot: '如：docs/archive', testEnv: '如：staging（数据脱敏）', releaseWindow: '如：周四 22:00–23:00'
  };
  const fieldNames = [...baseFields, ...Object.keys(fieldRegistry).filter(key => !baseFields.includes(key))];
  const labels = fieldRegistry;
  const common = '# {{projectName}} · ';
  const legacyTemplates = [
    { id: 'agents', name: 'AGENTS.md', brief: 'AI 协作边界与仓库工作约定', filename: 'AGENTS.md', text: common + `Agent 协作说明

## 1. 项目上下文
- 技术栈：{{techStack}}
- 当前模块：{{moduleName}}
- 维护责任：{{ownerName}}
- 背景与目标：{{projectBackground}}

## 2. 开始任务前
1. 阅读 README、当前目录及上级 AGENTS.md，确认局部规则。
2. 检查工作区已有改动；不得覆盖、回退其他人的修改。
3. 搜索现有实现、调用方和测试，先复用已有能力。
4. 明确需求范围、输入输出、验收标准；缺失的事实记录为待确认。

## 3. 代码修改原则
- 以完成需求所需的最小改动为边界，不顺带重构无关模块。
- 遵循仓库的命名、格式化、错误处理和日志约定。
- 新增依赖前说明必要性、兼容性、许可证和维护成本。
- 不把密钥、令牌、用户数据写入代码、日志或提交记录。
- 对外部输入做边界校验；保留错误上下文，避免静默吞错。

## 4. 命令与验证
- 安装命令：待填写（从仓库实际脚本确认）
- 启动命令：待填写
- 静态检查 / 构建命令：待填写
- 相关测试命令：待填写
- 先运行受影响范围的验证；失败时说明命令、原因与影响。
- 未执行的验证必须明确标注，不得把推测写成已通过。

## 5. 需要人工确认的操作
- 数据删除、数据库迁移与不可逆操作。
- 生产配置变更、对外发布和新增外部服务。
- 认证授权、计费规则或敏感数据处理策略变更。

## 6. 交付说明
列出行为变化、关键文件、验证结果、已知限制及后续事项。
提交信息描述目的；评审中明确兼容性与回滚方式。
` },
    { id: 'standards', name: '项目开发规范', brief: '目录、质量、分支与评审基线', filename: 'development-guide.md', text: common + `项目开发规范

## 1. 适用范围
- 模块：{{moduleName}}
- 技术栈：{{techStack}}
- 规范维护人：{{ownerName}}
- 业务背景：{{projectBackground}}

## 2. 工程与环境
| 项目 | 约定 | 检查方式 |
| --- | --- | --- |
| 运行时与工具链版本 | 待填写；与锁文件、CI 保持一致 | 本地及 CI 版本检查 |
| 目录职责 | 待填写入口、领域、基础设施、测试目录 | 评审检查依赖方向 |
| 环境配置 | 提供不含密钥的示例配置 | 新环境启动演练 |
| 格式与静态检查 | 待填写实际脚本 | 提交前 / CI 执行 |

## 3. 编码约定
- 使用语义化命名；避免魔法数字和重复业务规则。
- 函数保持职责单一；跨模块调用依赖公开接口。
- 注释解释业务约束与取舍，不复述代码。
- 异步操作提供超时、取消与失败反馈；重试必须考虑幂等。
- 日期、金额、时区、精度及空值语义在边界统一。

## 4. 数据与安全
- 在服务端执行权限校验；客户端校验用于体验改善。
- 入口进行类型、长度与允许值校验；查询使用参数化方式。
- 日志脱敏，禁止输出凭证；记录关联 ID 便于追踪。
- 数据结构变更写明兼容窗口、迁移步骤与回滚限制。

## 5. Git 与评审
- 分支格式：待填写；主分支通过评审后合入。
- 提交保持单一目的，附需求或缺陷编号。
- PR 说明问题、行为变化、验证证据与风险。
- 涉及 API、配置和数据结构时同步文档与调用方。

## 6. 完成标准
- [ ] 核心路径、失败路径与边界条件已验证
- [ ] 静态检查及构建通过，无新增阻断问题
- [ ] 文档、配置示例及变更记录同步
- [ ] 监控指标、告警与回滚方案明确
- [ ] 评审人批准；例外情况记录负责人及失效日期
` },
    { id: 'dictionary', name: '字段字典', brief: '字段含义、约束与数据治理', filename: 'data-dictionary.md', text: common + `字段字典

## 1. 数据集说明
- 所属模块：{{moduleName}}
- 技术栈 / 存储：{{techStack}}
- 数据责任人：{{ownerName}}
- 背景与用途：{{projectBackground}}
- 实体 / 表 / 消息名称：待填写
- 唯一标识与业务主键：待填写
- 更新方式与频率：待填写

## 2. 字段定义
下列行是结构示例，请以真实字段替换后评审。

| 字段名 | 中文含义 | 类型 / 长度 / 精度 | 必填 | 默认值 | 允许值 / 约束 | 来源 | 敏感级别 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 待填写 | 待填写 | 待填写 | 是 / 否 | 区分无默认与空值 | 唯一性、范围、格式 | 系统 / 人工 / 派生 | 公开 / 内部 / 敏感 |

## 3. 枚举与状态
| 字段 | 枚举值 | 展示名称 | 业务语义 | 是否终态 |
| --- | --- | --- | --- | --- |
| 待填写 | 待填写 | 待填写 | 允许的前置状态与转换条件 | 是 / 否 |

## 4. 口径与关联
- 计算字段：记录公式、聚合维度、去重规则及舍入方式。
- 金额：币种、计量单位、精度及退款 / 冲正口径待填写。
- 时间：时区、格式、业务时间和写入时间的差异待填写。
- 关联：外键、关联基数、删除行为及孤立记录处理待填写。
- 空值：分别定义缺失、未知、不适用与空字符串。

## 5. 质量与生命周期
| 检查 | 阈值 | 失败处理 | 责任人 |
| --- | --- | --- | --- |
| 完整性 / 唯一性 / 有效性 | 待填写 | 隔离、告警或阻断 | 待填写 |

- 数据保留期限、归档与删除策略：待填写
- 敏感字段展示脱敏、导出权限与审计策略：待填写

## 6. 变更记录
| 日期 | 字段 | 变更原因 | 兼容与迁移方案 | 审核人 |
| --- | --- | --- | --- | --- |
| 待填写 | 待填写 | 待填写 | 待填写 | 待填写 |
` },
    { id: 'api', name: 'API 接口文档', brief: '请求响应、错误码与接口契约', filename: 'api-specification.md', text: common + `API 接口文档

## 1. 接口概述
- 模块：{{moduleName}}
- 实现技术：{{techStack}}
- 接口负责人：{{ownerName}}
- 使用背景：{{projectBackground}}
- 接口名称 / 版本：待填写
- 方法与路径：待填写（例如实际采用的 GET / POST 路径）
- 环境与基础地址：待填写；禁止记录访问密钥

## 2. 认证与权限
- 认证方式及凭证传递位置：待填写。
- 所需角色 / 权限范围：待填写；服务端必须校验资源归属。
- 速率限制、超时、重试与幂等键规则：待填写。

## 3. 请求契约
| 位置 | 参数 | 类型 | 必填 | 约束 | 说明 |
| --- | --- | --- | --- | --- | --- |
| path / query / header / body | 待填写 | 待填写 | 是 / 否 | 长度、范围、枚举 | 空值及默认行为 |

请求示例（以下是待补齐的结构，不代表真实接口）：
\`\`\`json
{
  "TODO_request_field": "待填写"
}
\`\`\`

## 4. 响应契约
| 字段路径 | 类型 | 必有 | 业务含义 | 空值语义 |
| --- | --- | --- | --- | --- |
| 待填写 | 待填写 | 是 / 否 | 待填写 | 待填写 |

响应示例：
\`\`\`json
{
  "TODO_response_field": "待填写"
}
\`\`\`

## 5. 错误与边界
| HTTP 状态 | 业务错误码 | 触发条件 | 调用方处理 | 是否可重试 |
| --- | --- | --- | --- | --- |
| 待填写 | 待填写 | 参数 / 认证 / 权限 / 冲突 / 服务故障 | 待填写 | 是 / 否 |

- 分页、排序、过滤与最大返回量：待填写。
- 日期时区、金额精度与字符编码：待填写。
- 并发更新、重复提交与部分成功语义：待填写。

## 6. 验证与兼容
- [ ] 成功、非法参数、越权、超时与重复请求已验证
- [ ] 契约与实际实现一致，示例可复现
- [ ] 破坏性变更、弃用日期及迁移指引已公布
- 关联需求 / 用例 / 变更记录：待填写
` },
    { id: 'acceptance', name: '测试验收', brief: '覆盖范围、执行证据与放行结论', filename: 'test-acceptance.md', text: common + `测试与验收方案

## 1. 验收对象
- 模块：{{moduleName}}
- 技术栈：{{techStack}}
- 验收负责人：{{ownerName}}
- 业务背景与目标：{{projectBackground}}
- 需求编号 / 构建版本 / 测试环境：待填写
- 纳入范围与明确排除项：待填写

## 2. 前置条件
- 测试账号、角色与权限已准备；不在本文记录密码。
- 数据集可复现且脱敏；说明初始化与清理方式。
- 外部依赖、配置开关、浏览器 / 系统版本已确认。
- 入口条件：构建可部署、冒烟通过、阻断问题已解决。

## 3. 测试用例
| 编号 | 场景 / 关联需求 | 前置与输入 | 操作步骤 | 预期结果 | 实际 / 证据 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| TC-001 | 核心成功路径 | 待填写 | 待填写 | 可观察、可判定 | 链接 / 日志编号 | 未执行 |
| TC-002 | 空值、边界与非法输入 | 待填写 | 待填写 | 校验与反馈明确 | 待填写 | 未执行 |
| TC-003 | 权限与资源隔离 | 待填写 | 待填写 | 越权被拒绝 | 待填写 | 未执行 |
| TC-004 | 失败、重试与恢复 | 待填写 | 待填写 | 无重复数据且可恢复 | 待填写 | 未执行 |

## 4. 非功能检查
- [ ] 性能：写明并发、数据量、延迟及资源指标阈值
- [ ] 兼容：目标设备、浏览器与不同尺寸
- [ ] 安全：认证授权、输入校验、敏感数据及审计
- [ ] 可用性：键盘操作、可访问名称、错误反馈
- [ ] 回归：关联模块及历史缺陷复测

## 5. 缺陷与退出标准
| 缺陷编号 | 严重度 | 影响 | 负责人 | 状态 / 复测证据 |
| --- | --- | --- | --- | --- |
| 待填写 | 待填写 | 待填写 | 待填写 | 待填写 |

放行标准：关键需求通过；阻断 / 严重缺陷清零；剩余风险由责任人书面接受。

## 6. 验收结论
- 结论：待验收（通过 / 有条件通过 / 不通过）
- 已执行 / 通过 / 失败 / 未执行用例数：待填写
- 剩余风险、豁免理由、责任人及截止日期：待填写
- 验收人 / 日期 / 证据位置：待填写
` },
    { id: 'change', name: '变更申请', brief: '影响评估、实施步骤与审批记录', filename: 'change-request.md', text: common + `变更申请

## 1. 基本信息
- 变更编号 / 申请日期：待填写
- 模块：{{moduleName}}
- 技术栈：{{techStack}}
- 申请人与实施负责人：{{ownerName}}
- 业务背景：{{projectBackground}}
- 期望窗口 / 紧急程度：待填写

## 2. 问题与目标
- 当前行为、缺陷或限制：待填写，附事实与证据。
- 目标行为与收益：待填写，给出可衡量的成功指标。
- 不在本次变更范围内的事项：待填写。
- 不实施的影响、替代方案及取舍：待填写。

## 3. 影响评估
| 维度 | 涉及对象 | 具体影响 | 应对措施 | 责任人 |
| --- | --- | --- | --- | --- |
| 用户 / 业务流程 | 待填写 | 待填写 | 通知与培训 | 待填写 |
| API / 调用方 | 待填写 | 待填写 | 版本及兼容窗口 | 待填写 |
| 数据 / 配置 | 待填写 | 待填写 | 备份、迁移、校验 | 待填写 |
| 安全 / 性能 / 成本 | 待填写 | 待填写 | 验证与限制 | 待填写 |

## 4. 实施计划
| 顺序 | 操作 | 执行人 | 预估耗时 | 成功检查 | 失败动作 |
| --- | --- | --- | --- | --- | --- |
| 1 | 备份并核验可恢复性 | 待填写 | 待填写 | 待填写 | 暂停变更 |
| 2 | 按经评审的脚本实施 | 待填写 | 待填写 | 待填写 | 启动回滚评估 |
| 3 | 冒烟与业务指标检查 | 待填写 | 待填写 | 待填写 | 回滚 / 降级 |

## 5. 回滚与观察
- 触发阈值与决策人：待填写。
- 回滚步骤、制品、配置及数据兼容要求：待填写。
- 不可逆环节及补偿方案：待填写。
- 观察时长、指标、告警与值班人：待填写。

## 6. 审批与关闭
- [ ] 需求方、研发、测试及运维完成评审
- [ ] 验证证据、实施资源与维护窗口已确认
- [ ] 用户通知、应急联系和回滚准备已完成
- 审批结论 / 审批人 / 日期：待填写
- 实际结果、偏差、遗留项与关闭人：待填写
` },
    { id: 'release', name: '版本发布', brief: '发布检查、灰度观察与回滚清单', filename: 'release-plan.md', text: common + `版本发布计划

## 1. 发布概要
- 版本号 / 发布日期：待填写
- 模块：{{moduleName}}
- 技术栈：{{techStack}}
- 发布负责人：{{ownerName}}
- 业务背景：{{projectBackground}}
- 代码提交 / 标签 / 制品校验值：待填写
- 发布环境、窗口及预计影响：待填写

## 2. 版本内容
| 类型 | 需求 / 缺陷编号 | 用户可感知变化 | 影响范围 |
| --- | --- | --- | --- |
| 新增 / 优化 / 修复 | 待填写 | 待填写 | 待填写 |

- 破坏性变更与迁移说明：待填写；没有时明确记录“无”。
- 已知问题、限制及规避方法：待填写。

## 3. 发布前检查
- [ ] 评审通过，分支、标签与制品来源可追溯
- [ ] 测试验收通过，剩余风险获得责任人接受
- [ ] 配置、权限、密钥引用及环境差异复核
- [ ] 数据迁移完成演练，备份验证可恢复
- [ ] 监控、告警、值班和通知渠道就绪
- [ ] 上一稳定制品及回滚步骤可用

## 4. 发布步骤
| 顺序 | 操作 | 责任人 | 校验 / 观察阈值 | 失败处理 |
| --- | --- | --- | --- | --- |
| 1 | 再次确认窗口、依赖与备份 | 待填写 | 待填写 | 暂停 |
| 2 | 执行兼容性迁移与部署 | 待填写 | 待填写 | 评估回滚 |
| 3 | 小流量 / 灰度验证 | 待填写 | 错误率、延迟、业务指标待填写 | 停止扩量 |
| 4 | 分阶段扩量并复核 | 待填写 | 待填写 | 回滚 / 降级 |
| 5 | 全量完成并发送通知 | 待填写 | 冒烟与核心业务通过 | 持续观察 |

## 5. 回滚预案
- 触发条件、决策人及最长决策时间：待填写。
- 上一稳定版本、恢复命令与配置快照：待填写。
- 数据回滚限制与向前修复方案：待填写。
- 回滚后验证与用户通知：待填写。

## 6. 发布记录
- 开始 / 完成时间：待填写
- 发布结论：待执行（成功 / 部分成功 / 已回滚）
- 观察指标、异常、处置与证据：待填写
- 遗留事项、负责人、截止日期：待填写
- 复盘时间与行动项：待填写
` }
  ];
  const withOwnFields = template => {
    const extra = extraFields[template.id] || [];
    const line = extra.length ? `> 本文档专用资料：${extra.map(key => `${fieldRegistry[key]}={{${key}}}`).join('；')}\n\n` : '';
    return { ...template, extra, text: line + template.text };
  };
  const templates = [...window.ProjectDocTemplates, ...legacyTemplates.filter(t => ['acceptance', 'release'].includes(t.id)), { ...legacyTemplates.find(t => t.id === 'change'), id: 'legacy-change', name: '变更申请（旧版）' }].map(withOwnFields);
  const selectedTemplates = () => (levels[activeLevel] ? levelItems(activeLevel) : []);
  const $ = id => document.getElementById(id);
  const inputs = {};
  const output = $('documentOutput');
  let drafts = {};
  let activeId = templates.some(t => t.id === 'spec') ? 'spec' : templates[0].id;
  let storageFailed = false;
  const notify = message => { window.BlogStudio?.notify(message); $('editStatus').textContent = message; };
  const valueFor = (fields, key) => fields[key].trim() || `待填写（${labels[key]}）`;
  function makeDefault(template, projectFields = {}) {
    const fields = Object.fromEntries(fieldNames.map(key => [key, projectFields[key] || '']));
    const ranges = [];
    let content = '';
    let end = 0;
    const pattern = /\{\{(\w+)\}\}/g;
    for (const match of template.text.matchAll(pattern)) {
      content += template.text.slice(end, match.index);
      const value = valueFor(fields, match[1]);
      ranges.push({ key: match[1], start: content.length, end: content.length + value.length });
      content += value;
      end = match.index + match[0].length;
    }
    content += template.text.slice(end);
    return { fields, content, ranges, updatedAt: new Date().toISOString() };
  }
  function validateDrafts(data) {
    if (!data || data.version !== 1 || !data.drafts || typeof data.drafts !== 'object' || Array.isArray(data.drafts)) throw new Error('格式不正确：需要本工具的版本 1 草稿文件。');
    const clean = {};
    const entries = Object.entries(data.drafts);
    if (!entries.length || entries.length > templates.length) throw new Error('草稿数量不正确。');
    for (const [id, draft] of entries) {
      if (!templates.some(t => t.id === id) || !draft || typeof draft !== 'object' || typeof draft.content !== 'string' || draft.content.length > MAX_BODY) throw new Error('模板标识或正文长度不符合要求。');
      if (!draft.fields || typeof draft.fields !== 'object' || !fieldNames.every(key => draft.fields[key] === undefined || (typeof draft.fields[key] === 'string' && draft.fields[key].length <= 2000))) throw new Error('项目资料字段类型错误或超过 2000 字符。');
      if (!Array.isArray(draft.ranges) || draft.ranges.length > 200) throw new Error('变量区间格式错误。');
      let end = 0;
      const fields = Object.fromEntries(fieldNames.map(key => [key, draft.fields[key] || '']));
      const ranges = draft.ranges.map(range => {
        if (!range || !fieldNames.includes(range.key) || !Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start < end || range.end <= range.start || range.end > draft.content.length || draft.content.slice(range.start, range.end) !== valueFor(fields, range.key)) throw new Error('变量区间校验失败，文件可能已被修改。');
        end = range.end;
        return { key: range.key, start: range.start, end: range.end };
      });
      const targetId = data.templateSet !== 'project-kit' && id === 'change' ? 'legacy-change' : id;
      clean[targetId] = { fields, content: draft.content, ranges, updatedAt: typeof draft.updatedAt === 'string' && draft.updatedAt.length < 80 ? draft.updatedAt : new Date().toISOString() };
    }
    return clean;
  }
  function storageMessage(message, error = false) {
    $('storageStatus').textContent = message;
    $('storageStatus').dataset.error = String(error);
  }
  function save() {
    drafts[activeId].updatedAt = new Date().toISOString();
    try {
      const data = JSON.stringify({ version: 1, templateSet: 'project-kit', activeId, drafts });
      if (new Blob([data]).size > MAX_BYTES) throw new Error('草稿总量超过 2 MB');
      localStorage.setItem(STORAGE_KEY, data);
      storageFailed = false;
      storageMessage(`已保存到当前浏览器 · ${new Date().toLocaleTimeString('zh-CN')} · 建议定期导出 JSON 备份`);
    } catch (error) {
      storageFailed = true;
      storageMessage('当前浏览器保存失败（存储不可用、空间不足或超过 2 MB）。内容暂留本页，请立即导出 JSON 或下载 Markdown。', true);
    }
  }
  function updateCount() { $('characterCount').textContent = `${output.value.length.toLocaleString('zh-CN')} 字符`; }
  function renderFields(template, draft) {
    const wrap = $('projectFields');
    wrap.innerHTML = '';
    Object.keys(inputs).forEach(key => { delete inputs[key]; });
    [...baseFields, ...template.extra].forEach(key => {
      const label = document.createElement('label');
      if (key === 'projectBackground') label.className = 'wide';
      label.append(document.createTextNode(labels[key]));
      const input = key === 'projectBackground' ? document.createElement('textarea') : document.createElement('input');
      input.className = 'field'; input.maxLength = 2000;
      if (key === 'projectBackground') { input.rows = 3; } else { input.autocomplete = 'off'; }
      if (fieldHints[key]) input.placeholder = fieldHints[key];
      input.value = draft.fields[key] || '';
      input.addEventListener('input', () => updateField(key, input.value));
      label.append(input);
      inputs[key] = input;
      wrap.append(label);
    });
    const note = document.createElement('p');
    note.className = 'template-help wide';
    note.textContent = template.extra.length
      ? `本文档专用资料：${template.extra.map(key => labels[key]).join('、')}。留空时正文显示“待填写”，并原样写入导出文件。`
      : '本文档只使用通用资料，没有额外专用字段。';
    wrap.append(note);
  }
  function render() {
    const template = templates.find(t => t.id === activeId);
    const seed = Object.fromEntries(fieldNames.map(key => [key, inputs[key] ? inputs[key].value : '']));
    if (!drafts[activeId]) drafts[activeId] = makeDefault(template, seed);
    const draft = drafts[activeId];
    renderFields(template, draft);
    output.value = draft.content;
    $('templateTitle').textContent = template.name;
    $('templateDescription').textContent = `${template.brief} · 导出文件：${template.filename}`;
    $('templateNumber').textContent = `TEMPLATE ${numbers.get(template.id) || ''}`.trim();
    document.querySelectorAll('.template-choice').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === activeId)));
    if (!levels[activeLevel].ids.includes(activeId)) {
      const levelIndex = levels.findIndex(level => level.ids.includes(activeId));
      if (levelIndex !== -1) showLevel(levelIndex);
    }
    $('editStatus').textContent = '可编辑 · 资料实时填充';
    updateCount();
  }
  const levels = [
    { tab: '精简版', title: '精简版 · 3 份文档', hint: '只够开工：需求、设计、任务。没有数据库与规范文件。', ids: ['spec', 'design', 'tasks'] },
    { tab: '进阶版', title: '进阶版 · 5 份文档', hint: '精简版 + 数据库设计与项目导航 README。', ids: ['spec', 'design', 'tasks', 'database', 'readme'] },
    { tab: '专业版', title: '专业版 · 8 份文档', hint: '进阶版 + AI 协作规范、技术栈编码规范、版本与发布管理。', ids: ['spec', 'design', 'tasks', 'database', 'readme', 'agents', 'standards', 'version'] },
    { tab: '完整版', title: '完整版 · 10 份文档', hint: '专业版 + 把 design 里的字段与接口抽成独立文件，适合长期多人维护。', ids: ['spec', 'design', 'tasks', 'database', 'readme', 'agents', 'standards', 'version', 'dictionary', 'api'] },
    { tab: '附加文档', title: '附加文档 · 不随层级变化', hint: '变更记录、旧档快照与发布类模板，任何层级都可单独取用。', ids: ['change', 'archive', 'acceptance', 'release', 'legacy-change'] }
  ];
  const fullOrder = ['spec', 'design', 'tasks', 'database', 'readme', 'agents', 'standards', 'version', 'dictionary', 'api', 'change', 'archive', 'acceptance', 'release', 'legacy-change'];
  const numbers = new Map(fullOrder.map((id, index) => [id, String(index + 1).padStart(2, '0')]));
  const tabButtons = [];
  const panels = [];
  let activeLevel = 0;
  const levelItems = index => levels[index].ids.map(id => templates.find(template => template.id === id)).filter(Boolean);
  function showLevel(index, focus) {
    activeLevel = index;
    tabButtons.forEach((button, i) => {
      const selected = i === index;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    if (focus && tabButtons[index]) tabButtons[index].focus();
    refreshPackage();
  }
  levels.forEach((level, levelIndex) => {
    const items = levelItems(levelIndex);
    const tab = document.createElement('button');
    tab.type = 'button'; tab.className = 'template-tab'; tab.id = `templateTab${levelIndex}`;
    tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', `templatePanel${levelIndex}`);
    tab.textContent = level.tab;
    tab.addEventListener('click', () => showLevel(levelIndex));
    tab.addEventListener('keydown', event => {
      const last = levels.length - 1;
      const next = { ArrowRight: levelIndex === last ? 0 : levelIndex + 1, ArrowLeft: levelIndex === 0 ? last : levelIndex - 1, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault(); showLevel(next, true);
    });
    tabButtons.push(tab);
    $('templateTabs').append(tab);

    const section = document.createElement('section');
    section.className = 'template-group'; section.id = `templatePanel${levelIndex}`;
    section.setAttribute('role', 'tabpanel'); section.setAttribute('aria-labelledby', `templateTab${levelIndex}`);
    const heading = document.createElement('h3');
    heading.className = 'template-group-title';
    heading.textContent = level.title.split(' · ')[0];
    const count = document.createElement('span'); count.textContent = `${items.length} 份`;
    heading.append(count);
    const hint = document.createElement('p'); hint.className = 'template-group-hint'; hint.textContent = level.hint;
    section.append(heading, hint);
    items.forEach(template => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'template-choice'; button.dataset.id = template.id;
      const title = document.createElement('strong');
      title.textContent = `${numbers.get(template.id)}  ${template.name}`;
      const meta = document.createElement('small');
      const file = document.createElement('span'); file.className = 'template-file-name'; file.textContent = template.filename;
      meta.append(file, document.createTextNode(` · ${template.brief}`));
      button.append(title, meta);
      button.addEventListener('click', () => { save(); activeId = template.id; render(); save(); });
      section.append(button);
    });
    panels.push(section);
    $('templateList').append(section);
  });
  showLevel(0);
  function updateField(key, value) {
    const draft = { ...drafts[activeId], fields: { ...drafts[activeId].fields }, ranges: drafts[activeId].ranges.map(range => ({ ...range })) };
    draft.fields[key] = value;
    let shift = 0;
    const content = draft.content;
    let next = '';
    let cursor = 0;
    for (const range of draft.ranges) {
      const start = range.start;
      const end = range.end;
      if (range.key === key) {
        const nextValue = valueFor(draft.fields, key);
        next += content.slice(cursor, start) + nextValue;
        cursor = end;
        range.start = start + shift;
        range.end = range.start + nextValue.length;
        shift += nextValue.length - (end - start);
      } else { range.start += shift; range.end += shift; }
    }
    draft.content = next + content.slice(cursor);
    if (draft.content.length > MAX_BODY) {
      if (inputs[key]) inputs[key].value = drafts[activeId].fields[key];
      notify('替换后正文超过 150,000 字符，请先精简正文。');
      return;
    }
    drafts[activeId] = draft;
    output.value = draft.content;
    updateCount(); save();
  }
  output.addEventListener('input', () => {
    const draft = drafts[activeId];
    const before = draft.content;
    const after = output.value;
    let start = 0;
    while (start < before.length && start < after.length && before[start] === after[start]) start++;
    let oldEnd = before.length;
    let newEnd = after.length;
    while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) { oldEnd--; newEnd--; }
    const shift = newEnd - oldEnd;
    draft.ranges = draft.ranges.filter(range => {
      if (range.end <= start) return true;
      if (range.start >= oldEnd) { range.start += shift; range.end += shift; return true; }
      return false;
    });
    draft.content = after;
    $('editStatus').textContent = '正文已编辑'; updateCount(); save();
  });
  $('resetTemplate').addEventListener('click', () => {
    if (!window.confirm('恢复当前模板默认内容及空白项目资料？当前模板的手写修改将被覆盖，其他模板不受影响。')) return;
    drafts[activeId] = makeDefault(templates.find(t => t.id === activeId)); render(); save(); notify('当前模板已恢复默认');
  });
  function download(text, filename, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename;
    document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function promptText() {
    const fields = drafts[activeId].fields;
    const detailed = levels[activeLevel].ids.includes('dictionary');
    const extraLines = selectedTemplates().filter(t => (drafts[t.id]?.fields) && t.extra.some(key => (drafts[t.id].fields[key] || '').trim())).map(t => `- ${t.filename}：${t.extra.filter(key => (drafts[t.id].fields[key] || '').trim()).map(key => `${labels[key]}=${drafts[t.id].fields[key].trim()}`).join('；')}`);
    const extraBlock = extraLines.length ? `\n### 各文档专用资料\n${extraLines.join('\n')}` : '';
    return `# 项目文档生成指令（${levels[activeLevel].tab}）\n\n请按附件模板为我的项目生成实际开发文档。本批共 ${selectedTemplates().length} 份文件。\n\n## 项目资料\n${baseFields.map(key => `- ${labels[key]}：${valueFor(fields, key)}`).join('\n')}${extraBlock}\n\n## 输出范围\n${selectedTemplates().map(t => `- ${t.filename}：${t.brief}`).join('\n')}\n\n## 生成要求\n1. 先阅读全部模板及已有项目资料，再按 spec → design / database → tasks 的顺序规划，最后同步 README、Agent 与开发、版本规范。\n2. 保留模板的章节、表格列和文件路径，每份文档单独输出完整 Markdown 文件。项目整体规划简洁实用，不堆砌无关流程；页面、字段、按钮、数据和事务必须具体到可实现。\n3. 缺失事实标注“待确认”，明确建议与已确认事实；优先集中询问会影响方案的关键问题。不要擅自发明技术版本、业务规则、性能指标或审批结果。不适用章节注明原因。\n4. spec 使用 REQ / AC 编号，design 使用 PAGE / FIELD / ACTION 编号，接口使用 API 编号，tasks 使用 TASK 编号；跨文件引用一致，任务覆盖设计和验收标准。\n5. 每个页面逐项定义内容、字段类型、必填、默认值、校验与错误文案、布局样式；按钮写清样式、权限、可用条件、加载态、触发行为、成功与失败结果、防重复提交和跳转。\n6. database 写清每张表每个字段、主外键、索引、唯一性、关系、事务范围、隔离、并发、幂等、迁移与回滚。按实际技术栈生成函数、变量、类命名及代码质量规则，给出正反例与可执行检查命令；未知命令不得伪造为已验证。\n7. ${detailed ? 'fields.md 为页面字段明细的唯一维护来源，api.md 为接口契约与接口开发规范的唯一维护来源；design 保留页面结构、交互和对应编号链接，避免重复维护。' : '字段明细保留在 design.md；接口清单和关键契约保留在 design.md，不新增 fields.md 或 api.md。'}\n8. change 仅记录真实的模块变更，archive 仅索引真实存在的旧版本；新项目保留空记录格式，不伪造历史。所有任务初始为未完成，未实施、未测试、未发布的事项不得写成已完成。\n9. 本轮只生成规划与规范文档，不自动实施、提交代码或部署。输出末尾列出待确认项和文档一致性检查结果。\n`;
  }
  // ZIP store format: UTF-8 filenames, CRC32, no external dependencies.
  function zipFiles(files) {
    const encoder = new TextEncoder();
    const parts = [], central = [];
    let offset = 0, centralSize = 0;
    function header(size) { const bytes = new Uint8Array(size); return { bytes, view: new DataView(bytes.buffer) }; }
    function crc32(bytes) {
      let crc = 0xffffffff;
      for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
      return (crc ^ 0xffffffff) >>> 0;
    }
    for (const file of files) {
      const name = encoder.encode(file.name), data = encoder.encode(file.text), crc = crc32(data);
      const local = header(30);
      local.view.setUint32(0, 0x04034b50, true); local.view.setUint16(4, 20, true); local.view.setUint16(6, 0x800, true);
      local.view.setUint16(12, 33, true); local.view.setUint32(14, crc, true); local.view.setUint32(18, data.length, true); local.view.setUint32(22, data.length, true); local.view.setUint16(26, name.length, true);
      parts.push(local.bytes, name, data);
      const entry = header(46);
      entry.view.setUint32(0, 0x02014b50, true); entry.view.setUint16(4, 20, true); entry.view.setUint16(6, 20, true); entry.view.setUint16(8, 0x800, true);
      entry.view.setUint16(14, 33, true); entry.view.setUint32(16, crc, true); entry.view.setUint32(20, data.length, true); entry.view.setUint32(24, data.length, true); entry.view.setUint16(28, name.length, true); entry.view.setUint32(42, offset, true);
      central.push(entry.bytes, name); centralSize += 46 + name.length; offset += 30 + name.length + data.length;
    }
    const end = header(22);
    end.view.setUint32(0, 0x06054b50, true); end.view.setUint16(8, files.length, true); end.view.setUint16(10, files.length, true); end.view.setUint32(12, centralSize, true); end.view.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end.bytes], { type: 'application/zip' });
  }
  function refreshPackage() {
    const list = ids => ids.map(id => templates.find(template => template.id === id)?.filename).filter(Boolean).join('、');
    $('packageSummary').innerHTML = '';
    levels.slice(0, 4).forEach((level, index) => {
      const row = document.createElement('p');
      row.className = 'package-list';
      if (index === activeLevel) row.dataset.current = 'true';
      row.innerHTML = `<b>${level.tab} · ${level.ids.length} 份${index === activeLevel ? '（当前）' : ''}</b>${list(level.ids)}`;
      $('packageSummary').append(row);
    });
    const note = document.createElement('p');
    note.className = 'package-list';
    note.innerHTML = `<b>附加文档 · 不随层级变化</b>${list(levels[4].ids)}<span class="package-current">当前层级：${levels[activeLevel].tab}，导出 ${selectedTemplates().length} 份文档 + AI-PROMPT.md</span>`;
    $('packageSummary').append(note);
  }
  refreshPackage();
  $('copyPrompt').addEventListener('click', async () => {
    const text = promptText();
    if (window.BlogStudio) await window.BlogStudio.copy(text, $('copyPrompt'));
    else if (navigator.clipboard?.writeText) { try { await navigator.clipboard.writeText(text); notify('AI 生成提示词已复制'); } catch { download(text, 'AI-PROMPT.md', 'text/markdown;charset=utf-8'); notify('剪贴板不可用，已下载提示词'); } }
    else { download(text, 'AI-PROMPT.md', 'text/markdown;charset=utf-8'); notify('已下载 AI 生成提示词'); }
  });
  $('applyProject').addEventListener('click', () => {
    const source = drafts[activeId].fields;
    if (!window.confirm('把当前模板的通用资料（项目名称、技术栈、模块、负责人、背景）应用到全部模板？各文档的专用资料与手写正文保留。')) return;
    for (const template of templates) {
      const fields = { ...(drafts[template.id]?.fields || {}), ...Object.fromEntries(baseFields.map(key => [key, source[key]])) };
      if (!drafts[template.id]) { drafts[template.id] = makeDefault(template, fields); continue; }
      const draft = drafts[template.id];
      let content = '', cursor = 0;
      const ranges = draft.ranges.map(range => {
        content += draft.content.slice(cursor, range.start);
        const start = content.length; content += valueFor(fields, range.key); cursor = range.end;
        return { key: range.key, start, end: content.length };
      });
      content += draft.content.slice(cursor);
      if (content.length > MAX_BODY) { notify(`批量应用在 ${template.name} 停止：正文超过长度限制，之前更新已保留`); render(); save(); return; }
      drafts[template.id] = { fields: { ...fields }, content, ranges, updatedAt: new Date().toISOString() };
    }
    render(); save(); notify('已将当前项目资料应用到整包，手写正文保留');
  });
  $('downloadPackage').addEventListener('click', () => {
    try {
      const fields = drafts[activeId].fields;
      const files = selectedTemplates().map(template => ({ name: template.filename, text: (drafts[template.id] || makeDefault(template, fields)).content }));
      files.push({ name: 'AI-PROMPT.md', text: promptText() });
      const blob = zipFiles(files);
      const name = (fields.projectName.trim() || 'project').replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').slice(0, 60);
      download(blob, `${name}-${levels[activeLevel].tab}-templates.zip`, 'application/zip');
      notify(`已导出 ${files.length - 1} 份文档模板和 AI 生成提示词`);
    } catch (error) { notify(`模板包导出失败：${error.message}`); }
  });
  $('copyDocument').addEventListener('click', async () => {
    if (window.BlogStudio) await window.BlogStudio.copy(output.value, $('copyDocument'));
    else { output.focus(); output.select(); notify('请按 Ctrl/Cmd + C 复制正文'); }
  });
  $('downloadDocument').addEventListener('click', () => {
    const template = templates.find(t => t.id === activeId);
    download(output.value, template.filename, 'text/markdown;charset=utf-8'); notify('Markdown 下载已发起');
  });
  $('exportDrafts').addEventListener('click', () => {
    const data = JSON.stringify({ version: 1, templateSet: 'project-kit', activeId, drafts });
    download(data, 'work-hub-document-drafts.json', 'application/json;charset=utf-8'); notify('全部草稿备份下载已发起');
  });
  $('importDrafts').addEventListener('click', () => $('draftFile').click());
  $('draftFile').addEventListener('change', async event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > MAX_BYTES) throw new Error('文件超过 2 MB，请选择较小的草稿备份。');
      const data = JSON.parse(await file.text());
      const incoming = validateDrafts(data);
      const merged = { ...drafts, ...incoming };
      if (new Blob([JSON.stringify({ version: 1, drafts: merged })]).size > MAX_BYTES) throw new Error('合并后的草稿超过 2 MB，无法导入。');
      const names = Object.keys(incoming).map(id => templates.find(t => t.id === id).name).join('、');
      if (!window.confirm(`将导入 ${Object.keys(incoming).length} 份草稿（${names}），并覆盖当前浏览器中对应模板的内容。其他模板保留。是否继续？建议先导出备份。`)) return;
      drafts = merged;
      render(); save(); notify(storageFailed ? '已导入本页，但浏览器保存失败，请导出备份' : '草稿已导入并保存在当前浏览器');
    } catch (error) { notify(`导入失败：${error instanceof SyntaxError ? 'JSON 语法不正确。' : error.message}`); }
  });
  window.addEventListener('beforeunload', event => {
    if (storageFailed) { event.preventDefault(); event.returnValue = ''; }
  });
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      if (new Blob([raw]).size > MAX_BYTES) throw new Error('已存草稿超过大小限制');
      const data = JSON.parse(raw);
      drafts = validateDrafts(data);
      const restoredId = data.templateSet !== 'project-kit' && data.activeId === 'change' ? 'legacy-change' : data.activeId;
      if (templates.some(t => t.id === restoredId)) activeId = restoredId;
    }
    render();
    storageMessage(raw ? '已恢复当前浏览器草稿 · 修改将自动保存' : '草稿仅保存在当前浏览器 · 修改后自动保存');
  } catch (error) {
    render(); storageFailed = true;
    storageMessage('无法读取当前浏览器草稿。已加载默认模板；旧数据尚未覆盖，请先检查浏览器存储或导出当前内容。', true);
  }
})();
