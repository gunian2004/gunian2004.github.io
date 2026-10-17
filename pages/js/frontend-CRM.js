/* CRM：线索 → 商机 → 客户 → 活动 → 预测 */
FA.boot({
  name: 'CRM 销售', logo: 'C', accent: '#7c3aed', chrome: 'crm', start: 'overview',
  tabs: ['overview', 'pipeline', 'customers', 'activities'],
  nav: [
    { group: '工作台', items: [{ id: 'overview', icon: '▤', label: '销售概览' }] },
    { group: '获客', items: [
      { id: 'leads', icon: '◈', label: '线索池' },
      { id: 'pipeline', icon: '◫', label: '商机管道' }
    ] },
    { group: '客户', items: [
      { id: 'crm-customer', icon: '☷', label: '客户管理', children: [
        { id: 'customers', icon: '·', label: '客户列表' },
        { id: 'contacts', icon: '·', label: '联系人' }
      ] }
    ] },
    { group: '行动', items: [
      { id: 'activities', icon: '◷', label: '跟进记录' },
      { id: 'forecast', icon: '◔', label: '业绩预测' }
    ] }
  ],
  pages: {
    overview: {
      title: '销售概览', desc: '本季度管道金额、赢单率与待跟进',
      render: function () {
        return FA.kpi([
          ['管道金额', '¥ 1.13M', '<span class="sy-up">▲ 8.2%</span> 环比'],
          ['本季赢单', '¥ 512k', '7 单'],
          ['赢单率', '38%', '<span class="sy-up">▲ 4pt</span>'],
          ['平均周期', '21 天', '<span style="color:#16a34a">▼ 3 天</span>']
        ]) +
          '<div class="fa-path" style="margin-top:14px">' +
          ['线索 12', '资格 8', '商机 5', '报价 3', '成交 1'].map(function (t, i) {
            return '<div class="fa-path-step' + (i === 4 ? ' is-now' : (i < 3 ? ' is-done' : '')) + '">' + t + '</div>';
          }).join('') + '</div>' +
          '<div class="fa-grid2">' +
          FA.panel('近 8 周管道金额', '<div style="padding:14px">' + FA.bars([240, 300, 268, 380, 342, 512, 460, 390], 5) + '</div>') +
          FA.panel('本周待跟进', '<div style="padding:10px 14px 14px">' +
            FA.rows([['陈', '恒信资产 · 开户咨询', '3 天未跟进', '80,000'], ['张', '东岸家办 · 渠道合作', '今天 14:00', '160,000'], ['李', '瑞和信托 · 报价', '明天上午', '380,000']]) +
            '</div>') +
          '</div>';
      }
    },
    leads: {
      title: '线索池', desc: '未分配线索按来源与热度排序',
      render: function () {
        return FA.panel('线索 · 42 条',
          FA.table(
            [{ label: '线索' }, { label: '来源' }, { label: '热度' }, { label: '负责人' }, { label: '状态' }],
            [
              ['恒信资产 · 开户咨询', '官网表单', '<span class="sy-badge sy-badge-danger">热</span>', '未分配', '<span class="sy-badge sy-badge-warning"><i></i>待领取</span>'],
              ['东岸家族办公室', '转介绍', '<span class="sy-badge sy-badge-warning">温</span>', '张敏', '<span class="sy-badge sy-badge-info"><i></i>跟进中</span>'],
              ['南岭资本', '展会', '<span class="sy-badge">冷</span>', '李洋', '<span class="sy-badge"><i></i>培育池</span>']
            ], { select: true }),
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="分配线索" data-desc="按区域与行业自动匹配负责人，也可手动指定。" data-ok="分配">分配线索</button>');
      }
    },
    pipeline: {
      title: '商机管道', desc: '阶段推进与停留时长',
      render: function () {
        return FA.panel('Q4 管道 · 看板',
          '<div style="padding:12px">' + FA.kanban([
            ['线索', '¥ 240k', [['恒信资产·开户咨询', '¥ 80,000 · 3 天未跟进', '<span class="sy-avatar">陈</span>'], ['东岸家办', '¥ 160,000 · 今天', '<span class="sy-avatar" style="background:#0f9d63">张</span>']]],
            ['报价', '¥ 380k', [['瑞和信托·渠道合作', '¥ 380,000 · 报价已发', '<span class="sy-avatar" style="background:#b45309">李</span><span class="sy-badge sy-badge-warning"><i></i>待回</span>']]],
            ['成交', '¥ 512k', [['明德资本·年度顾问', '¥ 512,000 · 已签约', '<span class="sy-avatar" style="background:#4f46e5">王</span><span class="sy-badge sy-badge-success"><i></i>赢单</span>']]]
          ]) + '</div>',
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新建商机" data-desc="商机需绑定客户与预计金额，创建后进入「线索」阶段。" data-ok="创建商机">新建商机</button>');
      }
    },
    customers: {
      title: '客户列表', desc: '客户等级、负责人和最近联系',
      render: function () {
        return FA.panel('客户 · 214 家',
          FA.table(
            [{ label: '客户' }, { label: '等级' }, { label: '负责人' }, { label: '最近联系' }, { label: '状态' }],
            [
              ['明德资本', '<span class="sy-badge sy-badge-success">KA</span>', '王敏', '10-16', '<span class="sy-badge sy-badge-success"><i></i>已签约</span>'],
              ['瑞和信托', '<span class="sy-badge sy-badge-primary">A</span>', '李洋', '10-15', '<span class="sy-badge sy-badge-warning"><i></i>跟进中</span>'],
              ['恒信资产', '<span class="sy-badge sy-badge-primary">A</span>', '陈柏贤', '10-12', '<span class="sy-badge sy-badge-warning"><i></i>跟进中</span>']
            ], { select: true }),
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已同步工商信息">同步工商信息</button>');
      }
    },
    contacts: {
      title: '联系人', desc: '决策链角色与联系方式',
      render: function () {
        return FA.panel('联系人 · 486 人',
          FA.table(
            [{ label: '姓名' }, { label: '公司' }, { label: '角色' }, { label: '手机' }, { label: '最近互动' }],
            [
              ['王建国', '明德资本', '投资总监 · 决策人', '138****6621', '10-16'],
              ['李思', '瑞和信托', '渠道经理 · 影响者', '139****8820', '10-15'],
              ['张倩', '恒信资产', '财务负责人', '137****3312', '10-12']
            ]),
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新增联系人" data-desc="联系人需绑定客户，可标记决策链角色。" data-ok="保存">新增联系人</button>');
      }
    },
    activities: {
      title: '跟进记录', desc: '通话、拜访、邮件与下一步安排',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '客户', type: 'select', options: ['瑞和信托', '恒信资产'] },
            { label: '方式', type: 'select', options: ['电话', '拜访', '微信', '邮件'] },
            { label: '下次提醒', value: '2026-10-20', required: true },
            { label: '摘要', type: 'textarea', span: true, ph: '关注点、异议与下一步', required: true }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">保存跟进</button>') +
          FA.panel('最近活动', '<div style="padding:10px 14px 14px">' +
            FA.rows([['电', '瑞和信托 · 电话', '客户希望增加季度报告', '10-15'], ['访', '恒信资产 · 拜访', '确认开户材料清单', '10-12']]) + '</div>') +
          '</div>';
      }
    },
    forecast: {
      title: '业绩预测', desc: '按阶段概率加权，输出本季预测',
      render: function () {
        return FA.kpi([
          ['承诺金额', '¥ 512k', '已签约'],
          ['最佳场景', '¥ 892k', '含报价阶段'],
          ['加权预测', '¥ 646k', '按阶段概率'],
          ['缺口', '¥ -154k', '距目标 ¥800k']
        ]) + '<div style="margin-top:14px">' +
          FA.panel('分阶段贡献',
            FA.table(
              [{ label: '阶段' }, { label: '商机数', num: true }, { label: '金额', num: true }, { label: '概率', num: true }, { label: '加权', num: true }],
              [['线索', '12', '240,000', '20%', '48,000'], ['报价', '3', '380,000', '60%', '228,000'], ['成交', '1', '512,000', '100%', '512,000']])) +
          '</div>';
      }
    }
  }
});
