/* SOP：流程库 → 执行 → 检查项 → 分析 */
FA.boot({
  name: 'SOP 流程', logo: 'S', accent: '#0d9488', chrome: 'sop', start: 'lib',
  nav: [
    { group: '流程', items: [
      { id: 'sop-flow', icon: '☰', label: '流程管理', children: [
        { id: 'lib', icon: '·', label: '流程库' },
        { id: 'run', icon: '·', label: '流程执行' }
      ] }
    ] },
    { group: '任务', items: [
      { id: 'tasks', icon: '☑', label: '我的任务' },
      { id: 'exceptions', icon: '⚠', label: '异常处理' }
    ] },
    { group: '配置', items: [
      { id: 'templates', icon: '⬒', label: '检查项模板' },
      { id: 'analytics', icon: '◔', label: '执行分析' }
    ] }
  ],
  pages: {
    lib: {
      title: '流程库', desc: '流程、版本与负责人',
      render: function () {
        return FA.panel('流程 · 12 个',
          FA.table(
            [{ label: '流程' }, { label: '负责人' }, { label: '版本' }, { label: '最近执行' }, { label: '状态' }],
            [
              ['月度对账 SOP', '张敏', 'v3.2', '2026-10-16', '<span class="sy-badge sy-badge-success"><i></i>启用</span>'],
              ['客户开户尽调', '陈柏贤', 'v1.8', '2026-10-14', '<span class="sy-badge sy-badge-success"><i></i>启用</span>'],
              ['异常交易处置', '李洋', 'v2.0', '2026-09-30', '<span class="sy-badge sy-badge-warning"><i></i>修订中</span>'],
              ['季度合规自查', '王敏', 'v1.1', '2026-07-01', '<span class="sy-badge"><i></i>已归档</span>']
            ]),
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新建流程" data-desc="创建后需添加步骤与检查项，发布后才能被执行。" data-ok="创建">新建流程</button>');
      }
    },
    run: {
      title: '流程执行', desc: '月度对账 SOP · 当前第 3 步',
      render: function () {
        return '<div class="fa-three">' +
          FA.panel('步骤', '<div style="padding:14px">' + FA.steps([
            ['导出上月流水', '系统自动 · 09:00 完成', 'done'],
            ['匹配银行回单', '张敏 · 09:12 完成', 'done'],
            ['差异复核', '待你处理 · 3 条差异', 'now', '3'],
            ['生成凭证', '未开始', '']
          ]) + '</div>') +
          FA.panel('当前步骤检查项', '<div style="padding:14px">' +
            '<label class="sy-check" style="display:flex;margin-bottom:10px"><input type="checkbox" checked><span class="sy-box"></span>核对差异金额 ≤ 0.01</label>' +
            '<label class="sy-check" style="display:flex;margin-bottom:10px"><input type="checkbox" checked><span class="sy-box"></span>确认回单影像齐全</label>' +
            '<label class="sy-check" style="display:flex;margin-bottom:14px"><input type="checkbox"><span class="sy-box"></span>差异说明已填写</label>' +
            '<textarea class="sy-textarea" rows="3" placeholder="差异说明（必填）"></textarea>' +
            '<div class="fa-actions" style="margin-top:12px"><button class="sy-btn sy-btn-primary" type="button" data-act="modal" data-title="提交差异复核" data-desc="提交后进入「生成凭证」，差异说明会附在凭证备注。" data-ok="提交并继续">完成本步</button></div>' +
            '</div>') +
          FA.panel('运行日志', '<div style="padding:14px;font-family:var(--mono);font-size:11px;line-height:1.9;color:var(--text-2)">09:00 导出流水 1,284 条<br>09:12 匹配回单 1,281 条<br>09:13 差异 3 条入队<br>09:15 通知复核人</div>') +
          '</div>';
      }
    },
    tasks: {
      title: '我的任务', desc: '按截止时间排序的待执行步骤',
      render: function () {
        return FA.panel('待执行 · 5 项',
          FA.table(
            [{ label: '流程' }, { label: '步骤' }, { label: '截止' }, { label: '状态' }],
            [
              ['月度对账 SOP', '差异复核', '今天 18:00', '<span class="sy-badge sy-badge-warning"><i></i>进行中</span>'],
              ['客户开户尽调', '材料齐全性检查', '明天', '<span class="sy-badge"><i></i>待开始</span>'],
              ['异常交易处置', '上报合规', '10-20', '<span class="sy-badge sy-badge-danger"><i></i>已逾期</span>']
            ]),
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已按截止时间排序">按截止排序</button>');
      }
    },
    exceptions: {
      title: '异常处理', desc: '执行中偏离标准的步骤与原因',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.panel('异常 · 4 条',
            FA.table(
              [{ label: '流程' }, { label: '步骤' }, { label: '原因' }, { label: '处理人' }],
              [
                ['月度对账', '差异复核', '差异 3 条超阈值', '张敏'],
                ['开户尽调', '材料检查', '缺营业执照副本', '陈柏贤'],
                ['异常交易', '上报合规', '超时未上报', '李洋']
              ])) +
          FA.form([
            { label: '异常类型', type: 'select', options: ['数据缺失', '超时', '超标', '系统错误'] },
            { label: '处理说明', type: 'textarea', span: true, ph: '说明原因与补救动作', required: true }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交处理</button>') +
          '</div>';
      }
    },
    templates: {
      title: '检查项模板', desc: '复用检查项，避免每次手写',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '模板名称', value: '月度对账 · 差异复核', required: true },
            { label: '适用流程', type: 'select', options: ['月度对账 SOP', '客户开户尽调'] },
            { label: '检查项（每行一条）', type: 'textarea', span: true, value: '核对差异金额 ≤ 0.01\n确认回单影像齐全\n差异说明已填写', required: true }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">保存模板</button>') +
          FA.panel('已有模板', '<div style="padding:12px 14px 14px">' +
            FA.rows([['⬒', '对账 · 差异复核', '5 个检查项', 'v3'], ['⬒', '开户 · 材料清单', '8 个检查项', 'v2']]) + '</div>') +
          '</div>';
      }
    },
    analytics: {
      title: '执行分析', desc: '执行率、平均耗时与卡点步骤',
      render: function () {
        return FA.kpi([
          ['本月执行', '38 次', '<span class="sy-up">▲ 6 次</span>'],
          ['按时完成率', '86%', '<span class="sy-up">▲ 3pt</span>'],
          ['平均耗时', '2.4 天', '<span style="color:#16a34a">▼ 0.3 天</span>'],
          ['卡点步骤', '差异复核', '占 42% 耗时']
        ]) + '<div style="margin-top:14px">' +
          FA.panel('各流程耗时',
            FA.table(
              [{ label: '流程' }, { label: '执行次数', num: true }, { label: '平均耗时', num: true }, { label: '按时率', num: true }],
              [['月度对账', '12', '2.4 天', '86%'], ['客户开户尽调', '9', '3.1 天', '78%'], ['异常交易处置', '4', '0.8 天', '100%']])) +
          '</div>';
      }
    }
  }
});
