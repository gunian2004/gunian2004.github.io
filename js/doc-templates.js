/* 开发文档模板台：纯本地草稿，正文中的活动变量使用区间跟踪保留手写内容。 */
(() => {
  'use strict';
  const STORAGE_KEY = 'work-hub.doc-templates.v1';
  const MAX_BYTES = 2 * 1024 * 1024;
  const MAX_BODY = 150000;
  const fieldNames = ['projectName', 'techStack', 'moduleName', 'ownerName', 'projectBackground'];
  const labels = { projectName: '项目名称', techStack: '技术栈', moduleName: '所属模块', ownerName: '负责人', projectBackground: '背景与目标' };
  const common = '# {{projectName}} · ';
  const templates = [
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
  const $ = id => document.getElementById(id);
  const inputs = Object.fromEntries(fieldNames.map(key => [key, $(key)]));
  const output = $('documentOutput');
  let drafts = {};
  let activeId = templates[0].id;
  let storageFailed = false;
  const notify = message => { window.BlogStudio?.notify(message); $('editStatus').textContent = message; };
  const valueFor = (fields, key) => fields[key].trim() || `待填写（${labels[key]}）`;
  function makeDefault(template) {
    const fields = Object.fromEntries(fieldNames.map(key => [key, '']));
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
      if (!draft.fields || !fieldNames.every(key => typeof draft.fields[key] === 'string' && draft.fields[key].length <= 2000)) throw new Error('项目资料字段缺失或超过 2000 字符。');
      if (!Array.isArray(draft.ranges) || draft.ranges.length > 100) throw new Error('变量区间格式错误。');
      let end = 0;
      const fields = Object.fromEntries(fieldNames.map(key => [key, draft.fields[key]]));
      const ranges = draft.ranges.map(range => {
        if (!range || !fieldNames.includes(range.key) || !Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start < end || range.end <= range.start || range.end > draft.content.length || draft.content.slice(range.start, range.end) !== valueFor(fields, range.key)) throw new Error('变量区间校验失败，文件可能已被修改。');
        end = range.end;
        return { key: range.key, start: range.start, end: range.end };
      });
      clean[id] = { fields, content: draft.content, ranges, updatedAt: typeof draft.updatedAt === 'string' && draft.updatedAt.length < 80 ? draft.updatedAt : new Date().toISOString() };
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
      const data = JSON.stringify({ version: 1, activeId, drafts });
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
  function render() {
    const template = templates.find(t => t.id === activeId);
    if (!drafts[activeId]) drafts[activeId] = makeDefault(template);
    const draft = drafts[activeId];
    fieldNames.forEach(key => { inputs[key].value = draft.fields[key]; });
    output.value = draft.content;
    $('templateTitle').textContent = template.name;
    $('templateDescription').textContent = template.brief;
    $('templateNumber').textContent = `TEMPLATE ${String(templates.indexOf(template) + 1).padStart(2, '0')}`;
    document.querySelectorAll('.template-choice').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === activeId)));
    $('editStatus').textContent = '可编辑 · 资料实时填充';
    updateCount();
  }
  templates.forEach((template, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'template-choice'; button.dataset.id = template.id;
    const title = document.createElement('strong'); title.textContent = `${String(index + 1).padStart(2, '0')}  ${template.name}`;
    const brief = document.createElement('small'); brief.textContent = template.brief;
    button.append(title, brief);
    button.addEventListener('click', () => { save(); activeId = template.id; render(); save(); });
    $('templateList').append(button);
  });
  fieldNames.forEach(key => inputs[key].addEventListener('input', () => {
    const draft = { ...drafts[activeId], fields: { ...drafts[activeId].fields }, ranges: drafts[activeId].ranges.map(range => ({ ...range })) };
    draft.fields[key] = inputs[key].value;
    let shift = 0;
    const content = draft.content;
    let next = '';
    let cursor = 0;
    for (const range of draft.ranges) {
      const start = range.start;
      const end = range.end;
      if (range.key === key) {
        const value = valueFor(draft.fields, key);
        next += content.slice(cursor, start) + value;
        cursor = end;
        range.start = start + shift;
        range.end = range.start + value.length;
        shift += value.length - (end - start);
      } else { range.start += shift; range.end += shift; }
    }
    draft.content = next + content.slice(cursor);
    if (draft.content.length > MAX_BODY) {
      inputs[key].value = drafts[activeId].fields[key];
      notify('替换后正文超过 150,000 字符，请先精简正文。');
      return;
    }
    drafts[activeId] = draft;
    output.value = draft.content;
    updateCount(); save();
  }));
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
  $('copyDocument').addEventListener('click', async () => {
    if (window.BlogStudio) await window.BlogStudio.copy(output.value, $('copyDocument'));
    else { output.focus(); output.select(); notify('请按 Ctrl/Cmd + C 复制正文'); }
  });
  $('downloadDocument').addEventListener('click', () => {
    const template = templates.find(t => t.id === activeId);
    download(output.value, template.filename, 'text/markdown;charset=utf-8'); notify('Markdown 下载已发起');
  });
  $('exportDrafts').addEventListener('click', () => {
    const data = JSON.stringify({ version: 1, activeId, drafts });
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
      if (templates.some(t => t.id === data.activeId)) activeId = data.activeId;
    }
    render();
    storageMessage(raw ? '已恢复当前浏览器草稿 · 修改将自动保存' : '草稿仅保存在当前浏览器 · 修改后自动保存');
  } catch (error) {
    render(); storageFailed = true;
    storageMessage('无法读取当前浏览器草稿。已加载默认模板；旧数据尚未覆盖，请先检查浏览器存储或导出当前内容。', true);
  }
})();
