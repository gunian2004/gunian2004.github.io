/* 财务：资金 → 票据 → 支付 → 报表 */
FA.boot({
  name: '财务 / 费控', logo: 'F', accent: '#047857', chrome: 'fin', start: 'overview',
  nav: [
    { group: '资金', items: [
      { id: 'overview', icon: '◧', label: '资金概览' },
      { id: 'payments', icon: '⇢', label: '支付批次' }
    ] },
    { group: '票据', items: [
      { id: 'fin-inv', icon: '▤', label: '票据管理', children: [
        { id: 'invoices', icon: '·', label: '票据采集' },
        { id: 'recon', icon: '·', label: '票据对账' }
      ] }
    ] },
    { group: '基础', items: [
      { id: 'fx', icon: '＄', label: '汇率快照' },
      { id: 'reports', icon: '◔', label: '财务报表' }
    ] }
  ],
  pages: {
    overview: {
      title: '资金概览', desc: '账户余额、待付款与本月流出',
      render: function () {
        return FA.kpi([
          ['可用余额', '¥ 4.28M', '3 个账户'],
          ['待付款', '¥ 186k', '12 笔'],
          ['本月流出', '¥ 1.02M', '<span class="sy-up">▲ 9.1%</span>'],
          ['冻结金额', '¥ 64k', '保证金']
        ]) + '<div style="margin-top:14px">' +
          FA.panel('账户余额',
            FA.table(
              [{ label: '账户' }, { label: '银行' }, { label: '币种' }, { label: '余额', num: true }, { label: '状态' }],
              [['基本户 · 8821', '招商银行', 'CNY', '3,120,400.00', '<span class="sy-badge sy-badge-success"><i></i>正常</span>'],
               ['一般户 · 4410', '中国银行', 'CNY', '986,120.00', '<span class="sy-badge sy-badge-success"><i></i>正常</span>'],
               ['外币户 · 0032', '汇丰银行', 'USD', '24,860.00', '<span class="sy-badge sy-badge-warning"><i></i>待对账</span>']]),
            '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已刷新余额">刷新</button>') +
          '</div>';
      }
    },
    invoices: {
      title: '票据采集', desc: 'OCR 识别、验真与查重',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '发票代码', value: '044001900111', required: true },
            { label: '发票号码', value: '88210031', required: true },
            { label: '金额', value: '28,600.00', required: true },
            { label: '开票日期', value: '2026-10-12' }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">保存票据</button>') +
          FA.panel('待采集', '<div style="padding:12px 14px 14px">' +
            FA.rows([['￥', '阿里云 · 10-12', 'OCR 完成 · 待验真', '28,600'], ['$', 'AWS · 10-11', '已验真 · 待查重', '4,120']]) + '</div>') +
          '</div>';
      }
    },
    recon: {
      title: '票据对账', desc: '左侧票据队列，右侧明细与差异处理',
      render: function () {
        return '<div class="fa-grid2" style="grid-template-columns:320px minmax(0,1fr)">' +
          FA.panel('票据队列 · 41', '<div class="fa-queue">' +
            '<div class="fa-queue-item is-on"><div><b>INV-8821</b><small>阿里云 · 10-12 · CNY</small></div><span class="amt">28,600.00</span></div>' +
            '<div class="fa-queue-item"><div><b>INV-8820</b><small>AWS · 10-11 · USD</small></div><span class="amt">4,120.00</span></div>' +
            '<div class="fa-queue-item"><div><b>INV-8819</b><small>Stripe · 10-09 · EUR</small></div><span class="amt">1,860.00</span></div>' +
            '<div class="fa-queue-item"><div><b>INV-8818</b><small>顺丰 · 10-08 · CNY</small></div><span class="amt">860.00</span></div>' +
            '</div>') +
          '<div class="fa-stack">' +
          FA.panel('INV-8820 · AWS', '<div style="padding:4px 14px 14px">' +
            '<div class="fa-fact-row"><span>币种 / 汇率</span><b>USD · 7.0890</b></div>' +
            '<div class="fa-fact-row"><span>票面金额</span><b>4,120.00</b></div>' +
            '<div class="fa-fact-row"><span>本币金额</span><b>¥ 29,206.68</b></div>' +
            '<div class="fa-fact-row"><span>系统应付</span><b>¥ 30,446.68</b></div>' +
            '<div class="fa-fact-row"><span>差异</span><b style="color:#dc2626">-1,240.00</b></div>' +
            '<div class="fa-actions" style="margin-top:12px">' +
            '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="处理差异 -1,240.00" data-desc="确认后生成调整凭证，凭证号回写到该票据。" data-ok="生成凭证">生成调整凭证</button>' +
            '</div></div>') +
          FA.panel('本币折算', '<div style="padding:14px">' +
            '<div style="font-size:11px;color:var(--text-3)">合计</div>' +
            '<div style="font-size:24px;font-weight:600;margin:4px 0 10px">¥ 68,742.30</div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0"><span style="color:var(--text-2)">已匹配</span><b>38</b></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0"><span style="color:var(--text-2)">待确认</span><b style="color:#b45309">2</b></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0"><span style="color:var(--text-2)">缺回单</span><b style="color:#dc2626">1</b></div>' +
            '</div>') +
          '</div></div>';
      }
    },
    payments: {
      title: '支付批次', desc: '同类付款合并成批，一次授权',
      render: function () {
        return FA.panel('待支付批次 · 3',
          FA.table(
            [{ label: '批次' }, { label: '笔数', num: true }, { label: '金额', num: true }, { label: '计划日' }, { label: '状态' }],
            [['BATCH-1017A', '8', '86,400.00', '2026-10-18', '<span class="sy-badge sy-badge-warning"><i></i>待授权</span>'],
             ['BATCH-1016B', '4', '28,600.00', '2026-10-17', '<span class="sy-badge sy-badge-success"><i></i>已支付</span>']]),
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="授权支付" data-desc="授权后提交银行，回单将在 10 分钟内回传。" data-ok="确认授权">授权支付</button>');
      }
    },
    fx: {
      title: '汇率快照', desc: '每日 09:00 抓取，用于本币折算',
      render: function () {
        return FA.panel('汇率 · 2026-10-17',
          FA.table(
            [{ label: '币种' }, { label: '买入价', num: true }, { label: '卖出价', num: true }, { label: '中间价', num: true }, { label: '更新时间' }],
            [['USD / CNY', '7.0820', '7.0960', '7.0890', '09:00'],
             ['EUR / CNY', '7.7120', '7.7280', '7.7200', '09:00'],
             ['HKD / CNY', '0.9080', '0.9100', '0.9090', '09:00']]),
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="汇率已刷新">刷新汇率</button>');
      }
    },
    reports: {
      title: '财务报表', desc: '利润表、现金流与费用结构',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.panel('利润表 · 2026-10',
            FA.table(
              [{ label: '项目' }, { label: '本月', num: true }, { label: '上月', num: true }],
              [['营业收入', '2,840,000', '2,531,000'], ['营业成本', '1,986,000', '1,802,000'], ['费用合计', '442,000', '401,000'], ['净利润', '412,000', '328,000']])) +
          FA.panel('费用结构', '<div style="padding:14px">' + FA.bars([42, 26, 18, 9, 5], 0) + '</div>') +
          '</div>';
      }
    }
  }
});
