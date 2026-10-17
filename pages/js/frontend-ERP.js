/* ERP 进销存：采购 / 销售 / 库存 / 档案 四条主线 */
FA.boot({
  name: 'ERP 进销存', logo: 'E', accent: '#2563eb', chrome: 'erp', start: 'overview',
  nav: [
    { group: '工作台', items: [{ id: 'overview', icon: '▤', label: '经营概览' }] },
    { group: '采购', items: [
      { id: 'req', icon: '◫', label: '请购单' },
      { id: 'po', icon: '☰', label: '采购订单' },
      { id: 'inbound', icon: '⇥', label: '收货与入库', children: [
        { id: 'inbound', icon: '·', label: '入库单' },
        { id: 'qc', icon: '·', label: '质检单' }
      ] }
    ] },
    { group: '销售', items: [
      { id: 'so', icon: '⇤', label: '销售订单' },
      { id: 'ship', icon: '⇢', label: '发货单' }
    ] },
    { group: '库存', items: [
      { id: 'stock', icon: '▦', label: '库存查询' },
      { id: 'transfer', icon: '⇄', label: '调拨单' }
    ] },
    { group: '档案', items: [
      { id: 'supplier', icon: '⬒', label: '供应商' },
      { id: 'item', icon: '◈', label: '物料' }
    ] }
  ],
  pages: {
    overview: {
      title: '经营概览', desc: '采购、在途、入库与异常一屏掌握',
      render: function () {
        return FA.kpi([
          ['本月采购额', '¥ 2.84M', '<span class="sy-up">▲ 12.4%</span> 环比'],
          ['在途订单', '18', '5 条今日到港'],
          ['待入库', '7', '需仓库确认'],
          ['异常单据', '3', '<span style="color:#b45309">2 条金额差异</span>']
        ]) +
          '<div class="fa-grid2" style="margin-top:14px">' +
          FA.panel('近 12 周采购额', '<div style="padding:12px 14px 6px">' + FA.line([42, 48, 45, 61, 58, 72, 69, 84, 78, 92, 88, 104]) + '</div>') +
          FA.panel('待办', '<div style="padding:10px 14px 14px">' +
            FA.rows([['!', 'PO-1042 待复核', '金额与合同差 0.8%', '128,400'], ['⇥', 'INV-8821 待入库', '华东电子 · 3 托', '—'], ['▲', '库存预警', 'SKU-3391 低于安全线', '—']]) +
            '</div>') +
          '</div>' +
          '<div style="margin-top:14px">' +
          FA.panel('最近采购',
            FA.table(
              [{ label: '单号' }, { label: '供应商' }, { label: '数量', num: true }, { label: '金额', num: true }, { label: '状态' }],
              [
                ['<span class="sy-mono">PO-1042</span>', '华东电子元件', '1,200', '128,400.00', '<span class="sy-badge sy-badge-warning"><i></i>待复核</span>'],
                ['<span class="sy-mono">PO-1041</span>', '深圳捷创科技', '800', '86,120.00', '<span class="sy-badge sy-badge-success"><i></i>已入库</span>'],
                ['<span class="sy-mono">PO-1038</span>', '苏州瑞泰', '150', '12,050.00', '<span class="sy-badge sy-badge-danger"><i></i>已驳回</span>']
              ]),
            '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已跳转采购订单">全部订单</button>') +
          '</div>';
      }
    },
    req: {
      title: '请购单', desc: '需求部门提报，审批通过后转采购订单',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '需求部门', type: 'select', options: ['生产部', '研发部', '仓储部'] },
            { label: '需求日期', value: '2026-10-30', required: true },
            { label: '物料名称', value: '贴片电容 0603', required: true },
            { label: '需求数量', value: '2,000', required: true },
            { label: '用途说明', type: 'textarea', span: true, ph: '用于 11 月产线备料' }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交请购</button>' +
            '<button class="sy-btn sy-btn-secondary" type="button" data-act="modal" data-title="转采购订单" data-desc="系统将按供应商分组生成采购订单，重复物料会合并。">转采购</button>') +
          FA.panel('待审批请购',
            FA.table(
              [{ label: '单号' }, { label: '部门' }, { label: '物料' }, { label: '数量', num: true }, { label: '状态' }],
              [
                ['<span class="sy-mono">PR-3081</span>', '生产部', '贴片电容 0603', '2,000', '<span class="sy-badge sy-badge-warning"><i></i>待审批</span>'],
                ['<span class="sy-mono">PR-3079</span>', '研发部', '稳压二极管', '500', '<span class="sy-badge sy-badge-success"><i></i>已转单</span>']
              ])) +
          '</div>';
      }
    },
    po: {
      title: '采购订单', desc: '按状态与交期筛选，支持批量审批与导出',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.panel('采购订单 · 128 条',
            FA.table(
              [{ label: '单号' }, { label: '供应商' }, { label: '状态' }, { label: '金额', num: true }, { label: '交期' }],
              [
                ['<span class="sy-mono">PO-1042</span>', '华东电子元件', '<span class="sy-badge sy-badge-warning"><i></i>待复核</span>', '128,400.00', '2026-10-24'],
                ['<span class="sy-mono">PO-1041</span>', '深圳捷创科技', '<span class="sy-badge sy-badge-success"><i></i>已入库</span>', '86,120.00', '2026-10-20'],
                ['<span class="sy-mono">PO-1038</span>', '苏州瑞泰', '<span class="sy-badge sy-badge-danger"><i></i>已驳回</span>', '12,050.00', '2026-10-18'],
                ['<span class="sy-mono">PO-1035</span>', '华东电子元件', '<span class="sy-badge sy-badge-info"><i></i>在途</span>', '64,300.00', '2026-10-26']
              ], { select: true }) +
            '<div class="sy-pager"><span>共 128 条</span><span class="sy-spacer"></span><button class="sy-page" type="button">‹</button><button class="sy-page" type="button" aria-current="page">1</button><button class="sy-page" type="button">2</button><button class="sy-page" type="button">›</button></div>',
            '<div class="fa-table-actions"><button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出 128 条订单">导出</button>' +
            '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新建采购订单" data-desc="订单创建后进入采购负责人复核，复核通过才会下发供应商。" data-ok="创建并提交">新建订单</button></div>') +
          '<div class="fa-fact"><h5>当前单据 · PO-1042</h5>' +
          '<div class="fa-fact-row"><span>供应商</span><b>华东电子元件</b></div>' +
          '<div class="fa-fact-row"><span>已入库</span><b>800 / 1,200</b></div>' +
          '<div class="fa-fact-row"><span>交期</span><b>2026-10-24</b></div>' +
          '<div class="fa-fact-row"><span>状态</span><b style="color:#b45309">待复核</b></div>' +
          '<div class="fa-fact-total">¥ 128,400.00</div>' +
          '<div class="fa-actions" style="margin-top:12px">' +
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="通过复核" data-desc="通过后订单下发供应商，预计 10-24 到货。" data-ok="通过">通过</button>' +
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已退回申请人">退回</button>' +
          '</div></div></div>';
      }
    },
    inbound: {
      title: '入库单', desc: '登记到货批次，提交后进入质检',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '入库单号', value: 'IN-2026-0388', required: true },
            { label: '供应商', type: 'select', options: ['华东电子元件', '深圳捷创科技'] },
            { label: '到货数量', value: '1,200', required: true },
            { label: '仓库', type: 'select', options: ['深圳中心仓', '东莞分仓', '香港中转仓'] },
            { label: '备注', type: 'textarea', span: true, ph: '批次号、质检要求' }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交入库</button>') +
          FA.panel('最近入库', '<div style="padding:12px 14px 14px">' +
            FA.rows([['⇥', 'IN-0387', '华东电子 · 800 件', '已质检'], ['⇥', 'IN-0386', '捷创科技 · 420 件', '待质检']]) + '</div>') +
          '</div>';
      }
    },
    qc: {
      title: '质检单', desc: '按抽样比例记录不良，判定整批是否放行',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '关联入库单', type: 'select', options: ['IN-2026-0388', 'IN-2026-0387'] },
            { label: '抽样数量', value: '120', required: true },
            { label: '不良数量', value: '2', required: true },
            { label: '判定', type: 'select', options: ['整批放行', '让步接收', '整批退回'] },
            { label: '不良描述', type: 'textarea', span: true, ph: '焊盘偏移、容值偏差等' }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交质检</button>') +
          FA.panel('质检记录',
            FA.table(
              [{ label: '入库单' }, { label: '抽样', num: true }, { label: '不良', num: true }, { label: '判定' }],
              [['IN-0387', '80', '0', '<span class="sy-badge sy-badge-success"><i></i>放行</span>'],
               ['IN-0385', '60', '3', '<span class="sy-badge sy-badge-warning"><i></i>让步接收</span>']])) +
          '</div>';
      }
    },
    so: {
      title: '销售订单', desc: '按客户与交期跟踪履约',
      render: function () {
        return FA.panel('销售订单 · 96 条',
          FA.table(
            [{ label: '单号' }, { label: '客户' }, { label: '金额', num: true }, { label: '交期' }, { label: '状态' }],
            [
              ['<span class="sy-mono">SO-2201</span>', '瑞和科技', '240,000.00', '2026-10-28', '<span class="sy-badge sy-badge-info"><i></i>备货中</span>'],
              ['<span class="sy-mono">SO-2198</span>', '明德资本', '86,400.00', '2026-10-22', '<span class="sy-badge sy-badge-success"><i></i>已发货</span>'],
              ['<span class="sy-mono">SO-2195</span>', '恒信资产', '18,600.00', '2026-10-19', '<span class="sy-badge sy-badge-warning"><i></i>待确认</span>']
            ], { select: true }),
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新建销售订单" data-desc="选择客户与商品后自动带出价格与库存可用量。" data-ok="创建">新建订单</button>');
      }
    },
    ship: {
      title: '发货单', desc: '按订单生成发货批次并回写库存',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '关联订单', type: 'select', options: ['SO-2201', 'SO-2198'] },
            { label: '发货仓库', type: 'select', options: ['深圳中心仓', '东莞分仓'] },
            { label: '物流商', type: 'select', options: ['顺丰', '德邦', '自有车队'] },
            { label: '运单号', value: 'SF-7788123' }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">确认发货</button>') +
          FA.panel('待发货', '<div style="padding:12px 14px 14px">' +
            FA.rows([['⇢', 'SO-2201 · 瑞和科技', '3 个 SKU · 已备货', '240,000'], ['⇢', 'SO-2195 · 恒信资产', '待确认库存', '18,600']]) + '</div>') +
          '</div>';
      }
    },
    stock: {
      title: '库存查询', desc: '按仓库查看可用、在途与安全库存',
      render: function () {
        return FA.panel('库存 · 1,204 个 SKU',
          FA.table(
            [{ label: 'SKU' }, { label: '品名' }, { label: '仓库' }, { label: '可用', num: true }, { label: '在途', num: true }, { label: '状态' }],
            [
              ['<span class="sy-mono">SKU-3391</span>', '贴片电容 0603', '深圳中心仓', '120', '800', '<span class="sy-badge sy-badge-danger"><i></i>低于安全线</span>'],
              ['<span class="sy-mono">SKU-3388</span>', '稳压二极管', '深圳中心仓', '2,400', '0', '<span class="sy-badge sy-badge-success"><i></i>正常</span>'],
              ['<span class="sy-mono">SKU-3377</span>', '连接器 4P', '东莞分仓', '860', '1,200', '<span class="sy-badge sy-badge-info"><i></i>补货中</span>']
            ]),
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出库存快照">导出</button>');
      }
    },
    transfer: {
      title: '调拨单', desc: '仓间转移，出库与入库分别留痕',
      render: function () {
        return '<div class="fa-grid2">' +
          FA.form([
            { label: '调出仓', type: 'select', options: ['深圳中心仓', '东莞分仓'] },
            { label: '调入仓', type: 'select', options: ['香港中转仓', '东莞分仓'] },
            { label: 'SKU', value: 'SKU-3377', required: true },
            { label: '数量', value: '200', required: true }
          ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交调拨</button>') +
          FA.panel('在途调拨', '<div style="padding:12px 14px 14px">' +
            FA.rows([['⇄', 'TR-0912', '深圳 → 香港 · 连接器 4P', '200'], ['⇄', 'TR-0911', '东莞 → 深圳 · 电解电容', '150']]) + '</div>') +
          '</div>';
      }
    },
    supplier: {
      title: '供应商', desc: '合作状态、评级与交付表现',
      render: function () {
        return FA.panel('供应商 · 36 家',
          FA.table(
            [{ label: '供应商' }, { label: '等级' }, { label: '合作年限' }, { label: '交付准时率', num: true }, { label: '状态' }],
            [
              ['华东电子元件', '<span class="sy-badge sy-badge-success">A</span>', '6 年', '96%', '<span class="sy-badge sy-badge-success"><i></i>合作中</span>'],
              ['深圳捷创科技', '<span class="sy-badge sy-badge-success">A</span>', '3 年', '95%', '<span class="sy-badge sy-badge-success"><i></i>合作中</span>'],
              ['苏州瑞泰', '<span class="sy-badge sy-badge-warning">B</span>', '1 年', '88%', '<span class="sy-badge sy-badge-warning"><i></i>观察期</span>']
            ]),
          '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新增供应商" data-desc="新增后需上传营业执照与开户许可证，审核通过才可下单。" data-ok="提交审核">新增供应商</button>');
      }
    },
    item: {
      title: '物料', desc: 'SKU、单位与安全库存维护',
      render: function () {
        return FA.panel('物料 · 1,204 条',
          FA.table(
            [{ label: 'SKU' }, { label: '名称' }, { label: '单位' }, { label: '安全库存', num: true }, { label: '状态' }],
            [
              ['<span class="sy-mono">SKU-3391</span>', '贴片电容 0603', '个', '500', '<span class="sy-badge sy-badge-success"><i></i>启用</span>'],
              ['<span class="sy-mono">SKU-3388</span>', '稳压二极管', '个', '300', '<span class="sy-badge sy-badge-success"><i></i>启用</span>'],
              ['<span class="sy-mono">SKU-3350</span>', '铝电解电容', '个', '200', '<span class="sy-badge"><i></i>停用</span>']
            ]),
          '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="modal" data-title="新增物料" data-desc="物料编码需唯一，保存后可在请购与订单中选择。" data-ok="保存">新增物料</button>');
      }
    }
  }
});
