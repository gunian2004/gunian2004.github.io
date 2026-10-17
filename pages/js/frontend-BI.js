/* BI：看板 → 分析 → 数据 → 订阅 */
FA.boot({
  name: 'BI 经营分析', logo: 'B', accent: '#0ea5e9', chrome: 'bi', start: 'dash',
  nav: [
    { group: '看板', items: [
      { id: 'bi-dash', icon: '◔', label: '数据看板', children: [
        { id: 'dash', icon: '·', label: '经营看板' },
        { id: 'channel', icon: '·', label: '渠道看板' },
        { id: 'product', icon: '·', label: '商品看板' }
      ] }
    ] },
    { group: '分析', items: [{ id: 'metrics', icon: '▤', label: '指标明细' }] },
    { group: '数据', items: [
      { id: 'dataset', icon: '▦', label: '数据集' },
      { id: 'subs', icon: '◷', label: '报表订阅' }
    ] }
  ],
  pages: {
    dash: {
      title: '经营看板', desc: '近 12 周 GMV、净收入与退款率',
      render: function () {
        return FA.kpi([
          ['GMV', '¥ 2.84M', '<span class="sy-up">▲ 12.4%</span>'],
          ['净收入', '¥ 412k', '<span class="sy-up">▲ 6.1%</span>'],
          ['退款率', '1.8%', '<span style="color:#16a34a">▼ 0.4pt</span>'],
          ['对账差异', '3', '待处理']
        ]) +
          '<div class="fa-grid2" style="margin-top:14px">' +
          FA.panel('近 12 周净收入', '<div style="padding:12px 14px 6px">' + FA.line([28, 31, 30, 38, 36, 44, 42, 51, 49, 58, 56, 64], '#22d3ee') + '</div>') +
          FA.panel('分渠道', '<div style="padding:14px">' + FA.bars([82, 64, 48, 36, 22], 2) + '</div>') +
          '</div>' +
          '<div style="margin-top:14px">' +
          FA.panel('周对比',
            FA.table(
              [{ label: '指标' }, { label: '本周', num: true }, { label: '上周', num: true }, { label: '变化' }],
              [['GMV', '2,840,000', '2,531,000', '<span class="sy-up">+12.2%</span>'],
               ['净收入', '412,000', '388,000', '<span class="sy-up">+6.2%</span>'],
               ['退款额', '51,200', '58,400', '<span class="sy-down">-12.3%</span>']]),
            '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出周报 PDF">导出周报</button>') +
          '</div>';
      }
    },
    channel: {
      title: '渠道看板', desc: '自营与渠道的获客成本与转化',
      render: function () {
        return FA.kpi([
          ['自营 GMV', '¥ 1.84M', '占 65%'],
          ['渠道 GMV', '¥ 998k', '占 35%'],
          ['获客成本', '¥ 86', '<span class="sy-up">▲ 4.2%</span>'],
          ['转化率', '3.1%', '<span class="sy-down">▼ 0.2pt</span>']
        ]) + '<div style="margin-top:14px">' +
          FA.panel('分渠道明细',
            FA.table(
              [{ label: '渠道' }, { label: 'GMV', num: true }, { label: '订单', num: true }, { label: '转化率', num: true }, { label: 'CAC', num: true }],
              [['自营小程序', '1,842,000', '8,420', '3.4%', '78'], ['渠道代理', '998,000', '4,180', '2.7%', '96'], ['线下', '186,000', '620', '1.8%', '142']])) +
          '</div>';
      }
    },
    product: {
      title: '商品看板', desc: 'Top 商品的销量与毛利',
      render: function () {
        return FA.panel('商品排行',
          FA.table(
            [{ label: '商品' }, { label: '销量', num: true }, { label: 'GMV', num: true }, { label: '毛利率', num: true }, { label: '趋势' }],
            [['稳盈 3 号', '1,240', '620,000', '18.4%', '<span class="sy-badge sy-badge-success">上升</span>'],
             ['稳盈 5 号', '860', '430,000', '21.2%', '<span class="sy-badge sy-badge-success">上升</span>'],
             ['安享 1 号', '320', '160,000', '12.6%', '<span class="sy-badge sy-badge-warning">持平</span>']]),
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出商品明细">导出</button>');
      }
    },
    metrics: {
      title: '指标明细', desc: '按周与渠道拆分的原始指标',
      render: function () {
        return FA.panel('指标 · 2026-W42',
          FA.table(
            [{ label: '指标' }, { label: '渠道' }, { label: '本周', num: true }, { label: '上周', num: true }, { label: '变化' }],
            [['GMV', '自营', '1,842,000', '1,610,000', '<span class="sy-up">+14.4%</span>'],
             ['GMV', '渠道', '998,000', '921,000', '<span class="sy-up">+8.4%</span>'],
             ['净收入', '自营', '286,000', '262,000', '<span class="sy-up">+9.2%</span>'],
             ['退款额', '渠道', '18,400', '24,100', '<span class="sy-down">-23.7%</span>']]),
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出 CSV">导出 CSV</button>');
      }
    },
    dataset: {
      title: '数据集', desc: '数据源、更新频率与口径',
      render: function () {
        return FA.panel('数据集 · 8 个',
          FA.table(
            [{ label: '数据集' }, { label: '来源库' }, { label: '更新频率' }, { label: '行数', num: true }, { label: '状态' }],
            [['订单明细', 'MySQL · zcyp_erp', '每 15 分钟', '1,284,320', '<span class="sy-badge sy-badge-success"><i></i>正常</span>'],
             ['库存快照', 'MySQL · zcyp_erp', '每小时', '86,400', '<span class="sy-badge sy-badge-success"><i></i>正常</span>'],
             ['汇率快照', '外部 API', '每日 09:00', '4,120', '<span class="sy-badge sy-badge-warning"><i></i>延迟</span>']]),
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="同步数据集" data-desc="立即拉取一次最新数据，同步期间看板显示缓存值。" data-ok="开始同步">立即同步</button>');
      }
    },
    subs: {
      title: '报表订阅', desc: '把看板按周期发到邮箱',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '接收邮箱', value: 'finance@example.com', required: true },
            { label: '频率', type: 'select', options: ['每周一 09:00', '每日 09:00'] },
            { label: '报表', type: 'select', options: ['经营看板', '指标明细'] }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">保存订阅</button>') +
          FA.panel('当前订阅', '<div style="padding:12px 14px 14px">' +
            FA.rows([['◷', '经营看板 · 每周一', 'finance@example.com', '启用'], ['◷', '对账差异 · 每日', 'ops@example.com', '启用']]) + '</div>') +
          '</div>';
      }
    }
  }
});
