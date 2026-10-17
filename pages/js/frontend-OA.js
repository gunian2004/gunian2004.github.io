/* OA：待办 → 申请 → 组织 → 流程 */
FA.boot({
  name: 'HR / OA 审批', logo: 'O', accent: '#4f46e5', chrome: 'oa', start: 'todo',
  nav: [
    { group: '工作台', items: [{ id: 'todo', icon: '☑', label: '待办中心' }] },
    { group: '申请', items: [
      { id: 'oa-apply', icon: '◷', label: '我的申请', children: [
        { id: 'leave', icon: '·', label: '请假申请' },
        { id: 'expense', icon: '·', label: '报销申请' },
        { id: 'payment', icon: '·', label: '付款申请' }
      ] }
    ] },
    { group: '组织', items: [
      { id: 'org', icon: '◉', label: '通讯录' },
      { id: 'flow', icon: '⇄', label: '审批流设置' }
    ] }
  ],
  pages: {
    todo: {
      title: '待办中心', desc: '需要你处理的审批与提醒',
      render: function () {
        return FA.kpi([
          ['待我审批', '6', '2 条已等待超 4 小时'],
          ['我发起的', '3', '1 条待补充材料'],
          ['本月已办', '28', '平均 2.1 小时']
        ]) + '<div style="margin-top:14px">' +
          FA.panel('待办', '<div style="padding:10px 14px 14px">' +
            FA.rows([['◈', '付款申请 · 陈柏贤', '¥ 28,600 · 财务复核', '4h'], ['◈', '请假申请 · 张敏', '10-20 至 10-22', '1h'], ['◈', '采购订单 · 李洋', 'PO-1042 · 金额复核', '20m']]) +
            '<div class="fa-actions" style="margin-top:10px"><button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="批量通过 3 条待办" data-desc="批量通过会记录审批人与时间，可在审批历史追溯。" data-ok="全部通过">批量通过</button></div>' +
            '</div>') + '</div>';
      }
    },
    leave: {
      title: '请假申请', desc: '选择类型与时间，提交后按审批流流转',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '申请人', value: '陈柏贤' },
            { label: '假期类型', type: 'select', options: ['年假', '调休', '事假', '病假'] },
            { label: '开始日期', value: '2026-10-20', required: true },
            { label: '结束日期', value: '2026-10-22', required: true },
            { label: '请假事由', type: 'textarea', span: true, ph: '简要说明，病假需上传证明', required: true }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交申请</button>') +
          FA.panel('审批链', '<div style="padding:14px">' +
            '<div class="fa-chain">' +
            '<div class="fa-chain-node done"><span class="fa-chain-dot">✓</span><div><b>直属主管 · 张敏</b><small>10-16 14:02 通过</small></div></div>' +
            '<div class="fa-chain-node now"><span class="fa-chain-dot"></span><div><b>部门负责人 · 王敏</b><small>处理中 · 已等待 3 小时</small></div><span class="fa-chain-tag">会签 2/3</span></div>' +
            '<div class="fa-chain-node"><span class="fa-chain-dot"></span><div><b>HR 备案</b><small>系统自动</small></div></div>' +
            '</div><div class="fa-templates">' +
            '<button type="button" data-act="toast" data-msg="已填入：同意，无异议">同意，无异议</button>' +
            '<button type="button" data-act="toast" data-msg="已填入：请补充附件后重提">请补充附件</button>' +
            '</div></div>') +
          '</div>';
      }
    },
    expense: {
      title: '报销申请', desc: '票据、费用类型与分摊',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '报销人', value: '陈柏贤' },
            { label: '费用类型', type: 'select', options: ['差旅', '招待', '办公', '云服务'] },
            { label: '金额', value: '2,860.00', required: true },
            { label: '成本中心', type: 'select', options: ['资金运营部', '技术部'] },
            { label: '事由', type: 'textarea', span: true, ph: '说明费用用途', required: true }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交报销</button>') +
          FA.panel('票据', '<div style="padding:12px 14px 14px">' +
            FA.rows([['￥', '滴滴出行 · 10-12', '差旅 · 已验真', '126.00'], ['￥', '阿里云 · 10-10', '云服务 · 已验真', '2,400.00'], ['￥', '顺丰 · 10-09', '办公 · 待验真', '334.00']]) + '</div>') +
          '</div>';
      }
    },
    payment: {
      title: '付款申请', desc: '填写金额与用途，附件可后补',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '付款对象', value: '阿里云计算有限公司', required: true },
            { label: '付款金额', value: '28,600.00', required: true },
            { label: '用途', type: 'select', options: ['供应商货款', '云服务费'] },
            { label: '期望付款日', value: '2026-10-25', required: true }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交审批</button>') +
          FA.panel('近期付款', '<div style="padding:12px 14px 14px">' +
            FA.rows([['￥', '阿里云 · 9 月', '已付款 · 09-28', '27,400'], ['￥', '顺丰 · 9 月', '已付款 · 09-30', '860']]) + '</div>') +
          '</div>';
      }
    },
    org: {
      title: '通讯录', desc: '按部门查看汇报线',
      render: function () {
        return FA.panel('组织 · 资金运营部',
          FA.table(
            [{ label: '姓名' }, { label: '职位' }, { label: '汇报对象' }, { label: '工号' }],
            [['王敏', '部门负责人', '总经理', '10021'], ['张敏', '资金主管', '王敏', '10102'], ['陈柏贤', '开发工程师', '张敏', '10233'], ['李洋', '财务复核', '张敏', '10218']]),
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出通讯录">导出</button>');
      }
    },
    flow: {
      title: '审批流设置', desc: '按金额与类型配置审批节点',
      render: function () {
        return FA.panel('审批节点',
          FA.table(
            [{ label: '条件' }, { label: '节点' }, { label: '审批人' }, { label: '超时策略' }],
            [['金额 < ¥10,000', '1 级', '直属主管', '8 小时提醒'],
             ['¥10,000–50,000', '2 级', '主管 → 财务', '4 小时提醒'],
             ['> ¥50,000', '3 级', '主管 → 财务 → 总经理', '2 小时提醒']]),
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新增审批节点" data-desc="节点按顺序执行，可设置会签或或签。" data-ok="保存节点">新增节点</button>');
      }
    }
  }
});
