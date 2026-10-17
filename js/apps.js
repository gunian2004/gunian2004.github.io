(function () {
  'use strict';

  /* =====================================================================
     六类系统的应用外壳：多级侧边菜单 + 真实子页面 + 可交互组件
     数据驱动的页面渲染，组件复用 systems.css 里的 sy-* 样式
     ===================================================================== */

  var shell = document.getElementById('faShell');
  if (!shell) return;

  var faName = document.getElementById('faName');
  var faLogo = document.getElementById('faLogo');
  var faCrumbs = document.getElementById('faCrumbs');
  var faSide = document.getElementById('faSide');
  var faPage = document.getElementById('faPage');
  var faMain = document.getElementById('faMain');
  var faClose = document.getElementById('faClose');
  var faMenuBtn = document.getElementById('faMenuBtn');
  var faSearch = document.getElementById('faSearch');
  var faModal = document.getElementById('faModal');
  var faModalCard = document.getElementById('faModalCard');
  var faToast = document.getElementById('faToast');

  var state = { app: null, page: null };
  var lastCard = null;
  var pendingOk = null;

  /* ---------------- 组件片段 ---------------- */
  function kpi(items) {
    return '<div class="sy-kpi-row">' + items.map(function (it) {
      return '<div class="sy-kpi"><div class="sy-kpi-label">' + it[0] + '</div>' +
        '<div class="sy-kpi-val">' + it[1] + '</div>' +
        '<div class="sy-kpi-delta">' + (it[2] || '') + '</div></div>';
    }).join('') + '</div>';
  }

  function panel(title, body, actions) {
    var head = '';
    if (title || actions) {
      head = '<div class="sy-toolbar"><b style="font-size:13px">' + (title || '') + '</b>' +
        '<span class="sy-spacer"></span>' + (actions || '') + '</div>';
    }
    return '<div class="sy-panel">' + head + body + '</div>';
  }

  function table(cols, rows, opts) {
    opts = opts || {};
    var sel = !!opts.select;
    var head = (sel ? '<th style="width:34px"><label class="sy-check"><input type="checkbox" data-checkall aria-label="全选"><span class="sy-box"></span></label></th>' : '') +
      cols.map(function (c) { return '<th' + (c.num ? ' class="num"' : '') + '>' + c.label + '</th>'; }).join('');
    var body = rows.map(function (r) {
      return '<tr>' + (sel ? '<td><label class="sy-check"><input type="checkbox" data-rowcheck aria-label="选择"><span class="sy-box"></span></label></td>' : '') +
        r.map(function (cell, i) { return '<td' + (cols[i].num ? ' class="num"' : '') + '>' + cell + '</td>'; }).join('') + '</tr>';
    }).join('');
    var bulk = sel ? '<div class="sy-bulkbar" data-bulkbar><b>已选 <span data-bulkn>0</span> 项</b>' +
      '<button class="sy-btn sy-btn-primary sy-btn-sm" data-act="toast" data-msg="已批量通过 2 条记录">批量通过</button>' +
      '<button class="sy-btn sy-btn-secondary sy-btn-sm" data-act="toast" data-msg="已导出所选记录">导出所选</button></div>' : '';
    return bulk + '<div class="sy-table-wrap"><table class="sy-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function form(fields, actions) {
    var h = fields.map(function (f) {
      var ctl;
      if (f.type === 'select') {
        ctl = '<select class="sy-select">' + (f.options || []).map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
      } else if (f.type === 'textarea') {
        ctl = '<textarea class="sy-textarea" rows="3" placeholder="' + (f.ph || '') + '">' + (f.value || '') + '</textarea>';
      } else {
        ctl = '<input class="sy-input" type="text" value="' + (f.value || '') + '" placeholder="' + (f.ph || '') + '"' + (f.required ? ' data-required' : '') + '>';
      }
      return '<div class="sy-field' + (f.span ? ' span2' : '') + '"><span class="sy-label">' + f.label +
        (f.required ? '<span class="req">*</span>' : '') + '</span>' + ctl +
        (f.hint ? '<span class="sy-help">' + f.hint + '</span>' : '') + '</div>';
    }).join('');
    var foot = actions || '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交</button>' +
      '<button class="sy-btn sy-btn-secondary" type="button" data-act="reset">重置</button>';
    return '<div class="sy-panel sy-panel-pad"><div class="sy-form-grid">' + h + '</div>' +
      '<div class="fa-actions" style="margin-top:18px">' + foot + '</div></div>';
  }

  function steps(items) {
    return '<div class="sy-steps">' + items.map(function (it) {
      var st = it[2] || '';
      var cls = st === 'done' ? ' done' : (st === 'now' ? ' now' : '');
      return '<div class="sy-step' + cls + '"><span class="sy-step-dot">' + (st === 'done' ? '✓' : (it[3] || '')) + '</span>' +
        '<div class="sy-step-body"><b>' + it[0] + '</b><span>' + it[1] + '</span></div></div>';
    }).join('') + '</div>';
  }

  function kanban(cols) {
    return '<div class="sy-kanban">' + cols.map(function (c) {
      return '<div class="sy-kcol"><div class="sy-kcol-head">' + c[0] + '<em>' + c[1] + '</em></div>' +
        c[2].map(function (k) {
          return '<div class="sy-kcard"><b>' + k[0] + '</b><div class="amt">' + k[1] + '</div>' +
            '<div class="sy-kcard-foot">' + k[2] + '</div></div>';
        }).join('') + '</div>';
    }).join('') + '</div>';
  }

  function line(vals, color) {
    color = color || '#4f46e5';
    var w = 320, h = 86;
    var max = Math.max.apply(null, vals), min = Math.min.apply(null, vals);
    var span = (max - min) || 1;
    var step = w / (vals.length - 1);
    var d = vals.map(function (v, i) {
      var x = (i * step).toFixed(1);
      var y = (h - 8 - ((v - min) / span) * (h - 18)).toFixed(1);
      return (i ? 'L' : 'M') + x + ',' + y;
    }).join(' ');
    return '<svg viewBox="0 0 320 86" preserveAspectRatio="none" style="width:100%;height:104px;display:block" aria-hidden="true">' +
      '<defs><linearGradient id="faG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity=".22"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      '<path d="' + d + ' L320,86 L0,86 Z" fill="url(#faG)"/>' +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/></svg>';
  }

  function bars(vals, onIndex) {
    var max = Math.max.apply(null, vals);
    return '<div class="sy-bars">' + vals.map(function (v, i) {
      return '<i style="height:' + Math.round((v / max) * 100) + '%"' + (i === onIndex ? ' class="is-on"' : '') + '></i>';
    }).join('') + '</div>';
  }

  function rows(list) {
    return '<div style="padding:4px 0">' + list.map(function (r) {
      return '<div class="sy-invoice"><span class="sy-invoice-ico">' + r[0] + '</span>' +
        '<div><b>' + r[1] + '</b><span>' + r[2] + '</span></div>' +
        '<span class="amt">' + (r[3] || '') + '</span></div>';
    }).join('') + '</div>';
  }

  function money(n) {
    return '¥ ' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }


  /* ---------------- 各类专属片段 ---------------- */
  function factbox() {
    return '<div class="fa-stack">' +
      '<div class="fa-fact"><h5>当前单据 · PO-2026-1042</h5>' +
      '<div class="fa-fact-row"><span>供应商</span><b>华东电子元件</b></div>' +
      '<div class="fa-fact-row"><span>已入库</span><b>800 / 1,200</b></div>' +
      '<div class="fa-fact-row"><span>交期</span><b>2026-10-24</b></div>' +
      '<div class="fa-fact-row"><span>状态</span><b style="color:#b45309">待复核</b></div>' +
      '<div class="fa-fact-total">¥ 128,400.00</div>' +
      '<div class="fa-actions" style="margin-top:12px">' +
      '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="通过复核" data-desc="通过后订单下发供应商，预计 10-24 到货。" data-ok="通过">通过</button>' +
      '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已退回申请人补充材料">退回</button>' +
      '</div></div></div>';
  }

  function pathBar() {
    var steps = [['线索', '12'], ['资格', '8'], ['商机', '5'], ['报价', '3'], ['成交', '1']];
    return '<div class="fa-path">' + steps.map(function (s, i) {
      var cls = i === 4 ? ' is-now' : (i < 3 ? ' is-done' : '');
      return '<div class="fa-path-step' + cls + '">' + s[0] + '<span>' + s[1] + '</span></div>';
    }).join('') + '</div>';
  }

  function chainHtml() {
    var nodes = [
      ['直属主管 · 张敏', '10-16 14:02 通过', 'done'],
      ['部门负责人 · 王敏', '处理中 · 已等待 3 小时', 'now', '会签 2/3'],
      ['HR 备案', '系统自动', '']
    ];
    return '<div class="fa-chain">' + nodes.map(function (n) {
      return '<div class="fa-chain-node ' + n[2] + '"><span class="fa-chain-dot">' + (n[2] === 'done' ? '✓' : '') + '</span>' +
        '<div><b>' + n[0] + '</b><small>' + n[1] + '</small></div>' +
        (n[3] ? '<span class="fa-chain-tag">' + n[3] + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }

  function queueItem(no, meta, amt, on, tag) {
    return '<div class="fa-queue-item' + (on ? ' is-on' : '') + '">' +
      '<div><b>' + no + '</b><small>' + meta + '</small></div>' +
      '<span class="amt">' + amt + '</span></div>';
  }

  /* ---------------- 六个系统 ---------------- */
  var APPS = {};

  /* ============ ERP ============ */
  APPS.erp = {
    name: 'ERP 进销存', logo: 'E', accent: '#2563eb', start: 'overview', chrome: 'erp',
    nav: [
      { group: '工作台', items: [{ id: 'overview', icon: '▤', label: '经营概览' }] },
      { group: '采购', items: [
        { id: 'po', icon: '☰', label: '采购订单' },
        { id: 'inbound', icon: '⇥', label: '入库单' },
        { id: 'supplier', icon: '⬒', label: '供应商管理', children: [
          { id: 'suppliers', icon: '·', label: '供应商列表' },
          { id: 'eval', icon: '·', label: '供应商评估' }
        ] }
      ] },
      { group: '库存', items: [{ id: 'stock', icon: '▦', label: '库存查询' }] }
    ],
    pages: {
      overview: {
        title: '经营概览', desc: '本月采购、在途与入库的整体情况',
        render: function () {
          return kpi([
            ['本月采购额', '¥ 2.84M', '<span class="sy-up">▲ 12.4%</span> 环比'],
            ['在途订单', '18', '5 条今日到港'],
            ['待入库', '7', '需仓库确认'],
            ['异常单据', '3', '<span style="color:#b45309">2 条金额差异</span>']
          ]) +
            '<div class="fa-grid2" style="margin-top:14px">' +
            panel('近 12 周采购额', '<div style="padding:12px 14px 6px">' + line([42, 48, 45, 61, 58, 72, 69, 84, 78, 92, 88, 104]) + '</div>') +
            panel('待办', '<div style="padding:10px 14px 14px">' +
              rows([['!', 'PO-1042 待复核', '金额与合同差 0.8%', '128,400'], ['⇥', 'INV-8821 待入库', '华东电子 · 3 托', '—'], ['▲', '库存预警', 'SKU-3391 低于安全线', '—']]) +
              '<button class="sy-btn sy-btn-secondary sy-btn-sm" style="margin-top:8px" type="button" data-act="modal" data-title="批量处理待办" data-desc="将 3 条待办标记为已读？已读后仍可在单据详情中查看。">全部标为已读</button>' +
              '</div>') +
            '</div>' +
            '<div style="margin-top:14px">' +
            panel('最近采购',
              table(
                [{ label: '单号' }, { label: '供应商' }, { label: '数量', num: true }, { label: '金额', num: true }, { label: '状态' }],
                [
                  ['<span class="sy-mono">PO-2026-1042</span>', '华东电子元件', '1,200', '128,400.00', '<span class="sy-badge sy-badge-warning"><i></i>待复核</span>'],
                  ['<span class="sy-mono">PO-2026-1041</span>', '深圳捷创科技', '800', '86,120.00', '<span class="sy-badge sy-badge-success"><i></i>已入库</span>'],
                  ['<span class="sy-mono">PO-2026-1038</span>', '苏州瑞泰', '150', '12,050.00', '<span class="sy-badge sy-badge-danger"><i></i>已驳回</span>']
                ]),
              '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已跳转到采购订单列表">全部订单</button>') +
            '</div>';
        }
      },
      po: {
        title: '采购订单', desc: '按状态与交期筛选，支持批量审批与导出',
        render: function () {
          return '<div class="fa-grid2">' + panel('采购订单 · 128 条',
            table(
              [{ label: '单号' }, { label: '供应商' }, { label: '状态' }, { label: '金额', num: true }, { label: '交期' }],
              [
                ['<span class="sy-mono">PO-2026-1042</span>', '华东电子元件', '<span class="sy-badge sy-badge-warning"><i></i>待复核</span>', '128,400.00', '2026-10-24'],
                ['<span class="sy-mono">PO-2026-1041</span>', '深圳捷创科技', '<span class="sy-badge sy-badge-success"><i></i>已入库</span>', '86,120.00', '2026-10-20'],
                ['<span class="sy-mono">PO-2026-1038</span>', '苏州瑞泰', '<span class="sy-badge sy-badge-danger"><i></i>已驳回</span>', '12,050.00', '2026-10-18'],
                ['<span class="sy-mono">PO-2026-1035</span>', '华东电子元件', '<span class="sy-badge sy-badge-info"><i></i>在途</span>', '64,300.00', '2026-10-26']
              ], { select: true }) +
            '<div class="sy-pager"><span>共 128 条</span><span class="sy-spacer"></span>' +
            '<button class="sy-page" type="button">‹</button><button class="sy-page" type="button" aria-current="page">1</button>' +
            '<button class="sy-page" type="button">2</button><button class="sy-page" type="button">3</button>' +
            '<button class="sy-page" type="button">›</button></div>',
            '<div class="fa-table-actions"><button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出 128 条订单">导出</button>' +
            '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新建采购订单" data-desc="订单创建后进入采购负责人复核，复核通过才会下发供应商。" data-ok="创建并提交">新建订单</button></div>') + factbox() + '</div>';
        }
      },
      inbound: {
        title: '入库单', desc: '登记到货批次，选择仓库后提交质检',
        render: function () {
          return '<div class="fa-grid2">' +
            form([
              { label: '入库单号', value: 'IN-2026-0388', required: true },
              { label: '供应商', type: 'select', options: ['华东电子元件', '深圳捷创科技', '苏州瑞泰'] },
              { label: '到货数量', value: '1,200', required: true },
              { label: '仓库', type: 'select', options: ['深圳中心仓', '东莞分仓', '香港中转仓'] },
              { label: '备注', type: 'textarea', span: true, ph: '质检要求、批次号等' }
            ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交入库</button>' +
              '<button class="sy-btn sy-btn-secondary" type="button" data-act="modal" data-title="暂存草稿" data-desc="草稿会保留 7 天，可在入库单列表继续编辑。" data-ok="暂存">暂存</button>') +
            panel('最近入库', '<div style="padding:12px 14px 14px">' +
              rows([['⇥', 'IN-2026-0387', '华东电子 · 800 件', '已质检'], ['⇥', 'IN-2026-0386', '捷创科技 · 420 件', '待质检'], ['⇥', 'IN-2026-0385', '苏州瑞泰 · 150 件', '已入库']]) +
              '</div>') +
            '</div>';
        }
      },
      suppliers: {
        title: '供应商列表', desc: '合作状态、评级与最近一次交付',
        render: function () {
          return panel('供应商 · 36 家',
            table(
              [{ label: '供应商' }, { label: '等级' }, { label: '合作年限' }, { label: '最近交付' }, { label: '状态' }],
              [
                ['华东电子元件', '<span class="sy-badge sy-badge-success">A</span>', '6 年', '2026-10-15', '<span class="sy-badge sy-badge-success"><i></i>合作中</span>'],
                ['深圳捷创科技', '<span class="sy-badge sy-badge-success">A</span>', '3 年', '2026-10-12', '<span class="sy-badge sy-badge-success"><i></i>合作中</span>'],
                ['苏州瑞泰', '<span class="sy-badge sy-badge-warning">B</span>', '1 年', '2026-09-28', '<span class="sy-badge sy-badge-warning"><i></i>观察期</span>'],
                ['广州宏达', '<span class="sy-badge">C</span>', '4 年', '2026-06-11', '<span class="sy-badge sy-badge-danger"><i></i>已暂停</span>']
              ]),
            '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新增供应商" data-desc="新增后需要上传营业执照与开户许可证，审核通过后可用于下单。" data-ok="提交审核">新增供应商</button>');
        }
      },
      eval: {
        title: '供应商评估', desc: '按交付、质量、价格三个维度打分',
        render: function () {
          return '<div class="fa-grid2">' +
            form([
              { label: '供应商', type: 'select', options: ['华东电子元件', '深圳捷创科技', '苏州瑞泰'] },
              { label: '评估周期', type: 'select', options: ['2026 Q4', '2026 Q3'] },
              { label: '交付准时率', value: '96', required: true, hint: '百分比，保留整数' },
              { label: '来料合格率', value: '99.2', required: true, hint: '百分比，可保留一位小数' },
              { label: '综合评语', type: 'textarea', span: true, ph: '记录本次评估的主要问题与改进要求' }
            ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交评估</button>' +
              '<button class="sy-btn sy-btn-secondary" type="button" data-act="toast" data-msg="已生成评估报告草稿">生成报告</button>') +
            panel('评估记录', '<div style="padding:12px 14px 14px">' +
              rows([['A', '华东电子元件', '2026 Q3 · 交付 98%', '96.4'], ['A', '深圳捷创科技', '2026 Q3 · 交付 95%', '94.1'], ['B', '苏州瑞泰', '2026 Q3 · 交付 88%', '82.7']]) +
              '</div>') +
            '</div>';
        }
      },
      stock: {
        title: '库存查询', desc: '按仓库查看可用与在途数量',
        render: function () {
          return panel('库存 · 1,204 个 SKU',
            table(
              [{ label: 'SKU' }, { label: '品名' }, { label: '仓库' }, { label: '可用', num: true }, { label: '在途', num: true }, { label: '状态' }],
              [
                ['<span class="sy-mono">SKU-3391</span>', '贴片电容 0603', '深圳中心仓', '120', '800', '<span class="sy-badge sy-badge-danger"><i></i>低于安全线</span>'],
                ['<span class="sy-mono">SKU-3388</span>', '稳压二极管', '深圳中心仓', '2,400', '0', '<span class="sy-badge sy-badge-success"><i></i>正常</span>'],
                ['<span class="sy-mono">SKU-3377</span>', '连接器 4P', '东莞分仓', '860', '1,200', '<span class="sy-badge sy-badge-info"><i></i>补货中</span>'],
                ['<span class="sy-mono">SKU-3350</span>', '铝电解电容', '香港中转仓', '0', '0', '<span class="sy-badge"><i></i>已停用</span>']
              ]),
            '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出库存快照">导出快照</button>');
        }
      }
    }
  };

  /* ============ CRM ============ */
  APPS.crm = {
    name: 'CRM 销售', logo: 'C', accent: '#7c3aed', start: 'overview', chrome: 'crm',
    nav: [
      { group: '工作台', items: [{ id: 'overview', icon: '▤', label: '销售概览' }] },
      { group: '销售', items: [
        { id: 'pipeline', icon: '◫', label: '销售管道' },
        { id: 'customers', icon: '☷', label: '客户列表' }
      ] },
      { group: '跟进', items: [{ id: 'followups', icon: '◷', label: '跟进记录' }] }
    ],
    pages: {
      overview: {
        title: '销售概览', desc: '本季度管道金额与赢单率',
        render: function () {
          return kpi([
            ['管道金额', '¥ 1.13M', '<span class="sy-up">▲ 8.2%</span> 环比'],
            ['本季赢单', '¥ 512k', '7 单'],
            ['赢单率', '38%', '<span class="sy-up">▲ 4pt</span>'],
            ['平均周期', '21 天', '<span style="color:#16a34a">▼ 3 天</span>']
          ]) +
            '<div class="fa-grid2" style="margin-top:14px">' +
            panel('近 8 周管道金额', '<div style="padding:14px">' + bars([240, 300, 268, 380, 342, 512, 460, 390], 5) + '</div>') +
            panel('本周待跟进', '<div style="padding:10px 14px 14px">' +
              rows([['陈', '恒信资产 · 开户咨询', '3 天未跟进', '80,000'], ['张', '东岸家办 · 渠道合作', '今天 14:00', '160,000'], ['李', '瑞和信托 · 报价', '明天上午', '380,000']]) +
              '</div>') +
            '</div>' +
            '<div style="margin-top:14px">' +
            panel('最近活动',
              table(
                [{ label: '时间' }, { label: '客户' }, { label: '类型' }, { label: '负责人' }, { label: '结果' }],
                [
                  ['10-16 14:02', '瑞和信托', '电话', '李洋', '<span class="sy-badge sy-badge-success"><i></i>已确认需求</span>'],
                  ['10-16 10:30', '恒信资产', '拜访', '陈柏贤', '<span class="sy-badge sy-badge-warning"><i></i>待补充材料</span>'],
                  ['10-15 16:45', '东岸家办', '微信', '张敏', '<span class="sy-badge"><i></i>已发资料</span>']
                ]),
              '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出活动记录">导出</button>') +
            '</div>';
        }
      },
      pipeline: {
        title: '销售管道', desc: '拖动卡片可更改阶段（示例为点选）',
        render: function () {
          return pathBar() + panel('Q4 管道 · 看板',
            '<div style="padding:12px">' + kanban([
              ['线索', '¥ 240k', [
                ['恒信资产·开户咨询', '¥ 80,000 · 3 天未跟进', '<span class="sy-avatar">陈</span><span class="sy-badge sy-badge-primary">热</span>'],
                ['东岸家族办公室', '¥ 160,000 · 今天', '<span class="sy-avatar" style="background:#0f9d63">张</span>']
              ]],
              ['报价', '¥ 380k', [
                ['瑞和信托·渠道合作', '¥ 380,000 · 报价已发', '<span class="sy-avatar" style="background:#b45309">李</span><span class="sy-badge sy-badge-warning"><i></i>待回</span>']
              ]],
              ['成交', '¥ 512k', [
                ['明德资本·年度顾问', '¥ 512,000 · 已签约', '<span class="sy-avatar" style="background:#4f46e5">王</span><span class="sy-badge sy-badge-success"><i></i>赢单</span>']
              ]]
            ]) + '</div>',
            '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新建商机" data-desc="商机需要绑定客户与预计金额，创建后默认进入「线索」阶段。" data-ok="创建商机">新建商机</button>');
        }
      },
      customers: {
        title: '客户列表', desc: '按客户等级与负责人筛选',
        render: function () {
          return panel('客户 · 214 家',
            table(
              [{ label: '客户' }, { label: '等级' }, { label: '负责人' }, { label: '最近联系' }, { label: '状态' }],
              [
                ['明德资本', '<span class="sy-badge sy-badge-success">KA</span>', '王敏', '2026-10-16', '<span class="sy-badge sy-badge-success"><i></i>已签约</span>'],
                ['瑞和信托', '<span class="sy-badge sy-badge-primary">A</span>', '李洋', '2026-10-15', '<span class="sy-badge sy-badge-warning"><i></i>跟进中</span>'],
                ['恒信资产', '<span class="sy-badge sy-badge-primary">A</span>', '陈柏贤', '2026-10-12', '<span class="sy-badge sy-badge-warning"><i></i>跟进中</span>'],
                ['东岸家办', '<span class="sy-badge">B</span>', '张敏', '2026-10-09', '<span class="sy-badge"><i></i>待激活</span>']
              ], { select: true }),
            '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已同步企业信息">同步工商信息</button>');
        }
      },
      followups: {
        title: '跟进记录', desc: '记录沟通内容，可安排下次提醒',
        render: function () {
          return '<div class="fa-grid2">' +
            form([
              { label: '客户', type: 'select', options: ['瑞和信托', '恒信资产', '东岸家办'] },
              { label: '方式', type: 'select', options: ['电话', '拜访', '微信', '邮件'] },
              { label: '下次提醒', value: '2026-10-20', required: true },
              { label: '沟通摘要', type: 'textarea', span: true, ph: '客户关注点、异议与下一步动作', required: true }
            ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">保存跟进</button>') +
            panel('最近跟进', '<div style="padding:10px 14px 14px">' +
              rows([['电', '瑞和信托 · 电话', '客户希望增加季度报告', '10-15'], ['访', '恒信资产 · 拜访', '确认开户材料清单', '10-12'], ['微', '东岸家办 · 微信', '发送产品说明书', '10-09']]) +
              '</div>') +
            '</div>';
        }
      }
    }
  };

  /* ============ SOP ============ */
  APPS.sop = {
    name: 'SOP 流程', logo: 'S', accent: '#0d9488', start: 'lib', chrome: 'sop',
    nav: [
      { group: '流程', items: [
        { id: 'lib', icon: '☰', label: '流程库' },
        { id: 'run', icon: '▷', label: '流程执行' }
      ] },
      { group: '模板', items: [{ id: 'tmpl', icon: '⬒', label: '检查项模板' }] }
    ],
    pages: {
      lib: {
        title: '流程库', desc: '所有可执行的 SOP 与负责人',
        render: function () {
          return panel('流程 · 12 个',
            table(
              [{ label: '流程' }, { label: '负责人' }, { label: '版本' }, { label: '最近执行' }, { label: '状态' }],
              [
                ['月度对账 SOP', '张敏', 'v3.2', '2026-10-16', '<span class="sy-badge sy-badge-success"><i></i>启用</span>'],
                ['客户开户尽调', '陈柏贤', 'v1.8', '2026-10-14', '<span class="sy-badge sy-badge-success"><i></i>启用</span>'],
                ['异常交易处置', '李洋', 'v2.0', '2026-09-30', '<span class="sy-badge sy-badge-warning"><i></i>修订中</span>'],
                ['季度合规自查', '王敏', 'v1.1', '2026-07-01', '<span class="sy-badge"><i></i>已归档</span>']
              ]),
            '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新建流程" data-desc="流程创建后需要添加步骤与检查项，发布后才能被执行。" data-ok="创建流程">新建流程</button>');
        }
      },
      run: {
        title: '流程执行', desc: '月度对账 SOP · 当前第 3 步',
        render: function () {
          return '<div class="fa-three">' +
            panel('步骤', '<div style="padding:14px">' + steps([
              ['导出上月流水', '系统自动 · 09:00 完成', 'done'],
              ['匹配银行回单', '张敏 · 09:12 完成', 'done'],
              ['差异复核', '待你处理 · 3 条差异', 'now', '3'],
              ['生成凭证', '未开始', '']
            ]) + '</div>') +
            panel('当前步骤检查项', '<div style="padding:14px">' +
              '<label class="sy-check" style="display:flex;margin-bottom:10px"><input type="checkbox" checked><span class="sy-box"></span>核对差异金额 ≤ 0.01</label>' +
              '<label class="sy-check" style="display:flex;margin-bottom:10px"><input type="checkbox" checked><span class="sy-box"></span>确认回单影像齐全</label>' +
              '<label class="sy-check" style="display:flex;margin-bottom:14px"><input type="checkbox"><span class="sy-box"></span>差异说明已填写</label>' +
              '<textarea class="sy-textarea" rows="3" placeholder="差异说明（必填）"></textarea>' +
              '<div class="fa-actions" style="margin-top:12px"><button class="sy-btn sy-btn-primary" type="button" data-act="modal" data-title="提交差异复核" data-desc="提交后流程进入「生成凭证」，差异说明会附在凭证备注中。" data-ok="提交并继续">完成本步</button></div>' +
              '</div>') +
            panel('运行日志', '<div style="padding:14px;font-family:var(--mono);font-size:11px;line-height:1.9;color:var(--text-2)">' +
              '09:00 系统导出上月流水 1,284 条<br>' +
              '09:12 张敏匹配回单 1,281 条<br>' +
              '09:13 差异 3 条进入队列<br>' +
              '09:15 已通知财务复核人</div>') +
            '</div>';
        }
      },
      tmpl: {
        title: '检查项模板', desc: '复用检查项，避免每次手写',
        render: function () {
          return '<div class="fa-grid2">' +
            form([
              { label: '模板名称', value: '月度对账 · 差异复核', required: true },
              { label: '适用流程', type: 'select', options: ['月度对账 SOP', '客户开户尽调', '异常交易处置'] },
              { label: '检查项（每行一条）', type: 'textarea', span: true, value: '核对差异金额 ≤ 0.01\n确认回单影像齐全\n差异说明已填写', required: true }
            ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">保存模板</button>') +
            panel('已有模板', '<div style="padding:12px 14px 14px">' +
              rows([['⬒', '对账 · 差异复核', '5 个检查项 · 月度对账', 'v3'], ['⬒', '开户 · 材料清单', '8 个检查项 · 尽调', 'v2'], ['⬒', '异常交易 · 处置', '4 个检查项 · 风控', 'v1']]) +
              '</div>') +
            '</div>';
        }
      }
    }
  };

  /* ============ BI ============ */
  APPS.bi = {
    name: 'BI 经营分析', logo: 'B', accent: '#0ea5e9', start: 'dash', chrome: 'bi',
    nav: [
      { group: '看板', items: [{ id: 'dash', icon: '◔', label: '经营看板' }] },
      { group: '分析', items: [
        { id: 'metrics', icon: '▤', label: '指标明细' },
        { id: 'sub', icon: '◷', label: '报表订阅' }
      ] }
    ],
    pages: {
      dash: {
        title: '经营看板', desc: '近 12 周 GMV、净收入与退款率',
        render: function () {
          return kpi([
            ['GMV', '¥ 2.84M', '<span class="sy-up">▲ 12.4%</span>'],
            ['净收入', '¥ 412k', '<span class="sy-up">▲ 6.1%</span>'],
            ['退款率', '1.8%', '<span style="color:#16a34a">▼ 0.4pt</span>'],
            ['对账差异', '3', '待处理']
          ]) +
            '<div class="fa-grid2" style="margin-top:14px">' +
            panel('近 12 周净收入', '<div style="padding:12px 14px 6px">' + line([28, 31, 30, 38, 36, 44, 42, 51, 49, 58, 56, 64], '#22d3ee') + '</div>') +
            panel('分渠道', '<div style="padding:14px">' + bars([82, 64, 48, 36, 22], 2) + '</div>') +
            '</div>' +
            '<div style="margin-top:14px">' +
            panel('周对比',
              table(
                [{ label: '指标' }, { label: '本周', num: true }, { label: '上周', num: true }, { label: '变化' }],
                [
                  ['GMV', '2,840,000', '2,531,000', '<span class="sy-up">+12.2%</span>'],
                  ['净收入', '412,000', '388,000', '<span class="sy-up">+6.2%</span>'],
                  ['退款额', '51,200', '58,400', '<span class="sy-down">-12.3%</span>'],
                  ['对账差异', '3', '7', '<span class="sy-down">-4</span>']
                ]),
              '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出周报 PDF">导出周报</button>') +
            '</div>';
        }
      },
      metrics: {
        title: '指标明细', desc: '按周与渠道拆分的原始指标',
        render: function () {
          return panel('指标 · 2026-W42',
            table(
              [{ label: '指标' }, { label: '渠道' }, { label: '本周', num: true }, { label: '上周', num: true }, { label: '变化' }],
              [
                ['GMV', '自营', '1,842,000', '1,610,000', '<span class="sy-up">+14.4%</span>'],
                ['GMV', '渠道', '998,000', '921,000', '<span class="sy-up">+8.4%</span>'],
                ['净收入', '自营', '286,000', '262,000', '<span class="sy-up">+9.2%</span>'],
                ['退款额', '渠道', '18,400', '24,100', '<span class="sy-down">-23.7%</span>']
              ]),
            '<div class="fa-table-actions"><button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导出 CSV">导出 CSV</button>' +
            '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="modal" data-title="自定义指标" data-desc="可选择维度与时间粒度，保存后会出现在指标明细的筛选中。" data-ok="保存指标">自定义指标</button></div>');
        }
      },
      sub: {
        title: '报表订阅', desc: '把看板按周期发到邮箱',
        render: function () {
          return '<div class="fa-grid2">' +
            form([
              { label: '接收邮箱', value: 'finance@example.com', required: true },
              { label: '频率', type: 'select', options: ['每周一 09:00', '每日 09:00', '每月 1 日'] },
              { label: '报表', type: 'select', options: ['经营看板', '指标明细', '对账差异'] },
              { label: '备注', type: 'textarea', span: true, ph: '可填写附加说明' }
            ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">保存订阅</button>') +
            panel('当前订阅', '<div style="padding:12px 14px 14px">' +
              rows([['◷', '经营看板 · 每周一', 'finance@example.com', '启用'], ['◷', '对账差异 · 每日', 'ops@example.com', '启用']]) +
              '</div>') +
            '</div>';
        }
      }
    }
  };

  /* ============ OA ============ */
  APPS.oa = {
    name: 'HR / OA 审批', logo: 'O', accent: '#4f46e5', start: 'todo', chrome: 'oa',
    nav: [
      { group: '工作台', items: [{ id: 'todo', icon: '☑', label: '待办中心' }] },
      { group: '申请', items: [
        { id: 'leave', icon: '◷', label: '请假申请' },
        { id: 'expense', icon: '￥', label: '付款申请' }
      ] },
      { group: '设置', items: [{ id: 'flow', icon: '⇄', label: '审批流设置' }] }
    ],
    pages: {
      todo: {
        title: '待办中心', desc: '需要你处理的审批与提醒',
        render: function () {
          return kpi([
            ['待我审批', '6', '2 条已等待超 4 小时'],
            ['我发起的', '3', '1 条待补充材料'],
            ['本月已办', '28', '平均 2.1 小时']
          ]) +
            '<div style="margin-top:14px">' + panel('待办',
              '<div style="padding:10px 14px 14px">' +
              rows([['◈', '付款申请 · 陈柏贤', '¥ 28,600 · 财务复核', '4h'], ['◈', '请假申请 · 张敏', '10-20 至 10-22 · 主管审批', '1h'], ['◈', '采购订单 · 李洋', 'PO-1042 · 金额复核', '20m']]) +
              '<div class="fa-actions" style="margin-top:10px">' +
              '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="批量通过 3 条待办" data-desc="批量通过后系统会记录审批人与时间，可在审批历史中追溯。" data-ok="全部通过">批量通过</button>' +
              '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已切换为「只看超时」">只看超时</button>' +
              '</div></div>') + '</div>';
        }
      },
      leave: {
        title: '请假申请', desc: '选择类型与时间，提交后按审批流流转',
        render: function () {
          return '<div class="fa-grid2">' +
            form([
              { label: '申请人', value: '陈柏贤' },
              { label: '假期类型', type: 'select', options: ['年假', '调休', '事假', '病假'] },
              { label: '开始日期', value: '2026-10-20', required: true },
              { label: '结束日期', value: '2026-10-22', required: true },
              { label: '请假事由', type: 'textarea', span: true, ph: '简要说明，病假需上传证明', required: true }
            ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交申请</button>' +
              '<button class="sy-btn sy-btn-secondary" type="button" data-act="toast" data-msg="已保存草稿">存草稿</button>') +
            panel('审批链', '<div style="padding:14px">' + chainHtml() +
              '<div class="fa-templates">' +
              '<button type="button" data-act="toast" data-msg="已填入：同意，无异议">同意，无异议</button>' +
              '<button type="button" data-act="toast" data-msg="已填入：请补充附件后重提">请补充附件</button>' +
              '<button type="button" data-act="toast" data-msg="已催办，已通知当前审批人">催办</button>' +
              '</div></div>') +
            '</div>';
        }
      },
      expense: {
        title: '付款申请', desc: '填写金额与用途，附件可后补',
        render: function () {
          return '<div class="fa-grid2">' +
            form([
              { label: '付款对象', value: '阿里云计算有限公司', required: true },
              { label: '付款金额', value: '28,600.00', required: true, hint: '含税金额' },
              { label: '用途', type: 'select', options: ['供应商货款', '云服务费', '差旅报销'] },
              { label: '期望付款日', value: '2026-10-25', required: true },
              { label: '事由说明', type: 'textarea', span: true, value: '10 月云服务费用结算，合同编号 CT-2026-088。' }
            ], '<button class="sy-btn sy-btn-primary" type="button" data-act="submit">提交审批</button>' +
              '<button class="sy-btn sy-btn-secondary" type="button" data-act="modal" data-title="删除草稿" data-desc="草稿删除后不可恢复，确定删除？" data-ok="删除">删除草稿</button>') +
            panel('近期付款', '<div style="padding:12px 14px 14px">' +
              rows([['￥', '阿里云 · 9 月', '已付款 · 09-28', '27,400'], ['￥', '顺丰 · 9 月', '已付款 · 09-30', '860']]) +
              '</div>') +
            '</div>';
        }
      },
      flow: {
        title: '审批流设置', desc: '按金额与类型配置审批节点',
        render: function () {
          return panel('审批节点',
            table(
              [{ label: '条件' }, { label: '节点' }, { label: '审批人' }, { label: '超时策略' }],
              [
                ['金额 < ¥10,000', '1 级', '直属主管', '8 小时提醒'],
                ['¥10,000–50,000', '2 级', '主管 → 财务', '4 小时提醒'],
                ['> ¥50,000', '3 级', '主管 → 财务 → 总经理', '2 小时提醒']
              ]),
            '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="新增审批节点" data-desc="节点按顺序执行，可设置会签或或签。保存后对新提交的单据生效。" data-ok="保存节点">新增节点</button>');
        }
      }
    }
  };

  /* ============ 财务 ============ */
  APPS.fin = {
    name: '财务 / 费控', logo: 'F', accent: '#047857', start: 'overview', chrome: 'fin',
    nav: [
      { group: '资金', items: [{ id: 'overview', icon: '◧', label: '资金概览' }] },
      { group: '对账', items: [
        { id: 'recon', icon: '⇄', label: '票据对账' },
        { id: 'fx', icon: '＄', label: '汇率快照' }
      ] }
    ],
    pages: {
      overview: {
        title: '资金概览', desc: '账户余额、待付款与本月流出',
        render: function () {
          return kpi([
            ['可用余额', '¥ 4.28M', '3 个账户'],
            ['待付款', '¥ 186k', '12 笔'],
            ['本月流出', '¥ 1.02M', '<span class="sy-up">▲ 9.1%</span>'],
            ['冻结金额', '¥ 64k', '保证金']
          ]) +
            '<div style="margin-top:14px">' +
            panel('账户余额',
              table(
                [{ label: '账户' }, { label: '银行' }, { label: '币种' }, { label: '余额', num: true }, { label: '状态' }],
                [
                  ['基本户 · 8821', '招商银行', 'CNY', '3,120,400.00', '<span class="sy-badge sy-badge-success"><i></i>正常</span>'],
                  ['一般户 · 4410', '中国银行', 'CNY', '986,120.00', '<span class="sy-badge sy-badge-success"><i></i>正常</span>'],
                  ['外币户 · 0032', '汇丰银行', 'USD', '24,860.00', '<span class="sy-badge sy-badge-warning"><i></i>待对账</span>']
                ]),
              '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已刷新余额">刷新</button>') +
            '</div>';
        }
      },
      recon: {
        title: '票据对账', desc: '左侧票据队列，右侧当前票据明细与差异处理',
        render: function () {
          return '<div class="fa-grid2" style="grid-template-columns:320px minmax(0,1fr)">' +
            panel('票据队列 · 41', '<div class="fa-queue">' +
              queueItem('INV-8821', '阿里云 · 10-12 · CNY', '28,600.00', true) +
              queueItem('INV-8820', 'AWS · 10-11 · USD', '4,120.00', false) +
              queueItem('INV-8819', 'Stripe · 10-09 · EUR', '1,860.00', false) +
              queueItem('INV-8818', '顺丰 · 10-08 · CNY', '860.00', false) +
              '</div>',
              '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已导入 12 张票据">导入</button>') +
            '<div class="fa-stack">' +
            panel('INV-8820 · AWS',
              '<div style="padding:4px 14px 14px">' +
              '<div class="fa-fact-row"><span>币种 / 汇率</span><b>USD · 7.0890</b></div>' +
              '<div class="fa-fact-row"><span>票面金额</span><b>4,120.00</b></div>' +
              '<div class="fa-fact-row"><span>本币金额</span><b>¥ 29,206.68</b></div>' +
              '<div class="fa-fact-row"><span>系统应付</span><b>¥ 30,446.68</b></div>' +
              '<div class="fa-fact-row"><span>差异</span><b style="color:#dc2626">-1,240.00</b></div>' +
              '<div class="sy-help" style="margin-top:8px">差异可能来自银行手续费，需人工确认后生成调整凭证。</div>' +
              '<div class="fa-actions" style="margin-top:12px">' +
              '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="处理差异 -1,240.00" data-desc="确认后生成调整凭证，凭证号将回写到此票据。" data-ok="生成凭证">生成调整凭证</button>' +
              '<button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="已标记为「待供应商确认」">标记待确认</button>' +
              '</div></div>') +
            panel('本币折算', '<div style="padding:14px">' +
              '<div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-3)">合计</div>' +
              '<div style="font-size:24px;font-weight:600;font-variant-numeric:tabular-nums;margin:4px 0 10px">¥ 68,742.30</div>' +
              '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0"><span style="color:var(--text-2)">已匹配</span><b>38</b></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0"><span style="color:var(--text-2)">待确认</span><b style="color:#b45309">2</b></div>' +
              '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0"><span style="color:var(--text-2)">缺回单</span><b style="color:#dc2626">1</b></div>' +
              '<div class="sy-help" style="margin-top:8px">汇率快照 2026-10-17 09:00</div>' +
              '</div>') +
            '</div></div>';
        }
      },
      fx: {
        title: '汇率快照', desc: '每日 09:00 抓取，用于本币折算',
        render: function () {
          return panel('汇率 · 2026-10-17',
            table(
              [{ label: '币种' }, { label: '买入价', num: true }, { label: '卖出价', num: true }, { label: '中间价', num: true }, { label: '更新时间' }],
              [
                ['USD / CNY', '7.0820', '7.0960', '7.0890', '09:00'],
                ['EUR / CNY', '7.7120', '7.7280', '7.7200', '09:00'],
                ['HKD / CNY', '0.9080', '0.9100', '0.9090', '09:00'],
                ['JPY / CNY', '0.0472', '0.0476', '0.0474', '09:00']
              ]),
            '<div class="fa-table-actions"><button class="sy-btn sy-btn-secondary sy-btn-sm" type="button" data-act="toast" data-msg="汇率已刷新">刷新汇率</button>' +
            '<button class="sy-btn sy-btn-primary sy-btn-sm" type="button" data-act="modal" data-title="锁定汇率" data-desc="锁定后 24 小时内所有折算使用该汇率，适用于月末关账。" data-ok="锁定今日汇率">锁定今日汇率</button></div>');
        }
      }
    }
  };

  /* ---------------- 渲染 ---------------- */
  function renderTabs(app) {
    var el = document.getElementById('faTabs');
    if (!el) return;
    var items = [];
    app.nav.forEach(function (g) {
      g.items.forEach(function (it) {
        if (it.children) it.children.forEach(function (c) { items.push(c); });
        else items.push(it);
      });
    });
    el.innerHTML = items.map(function (t) {
      return '<button class="fa-tab" type="button" data-page="' + t.id + '">' + t.label + '</button>';
    }).join('');
  }

  function renderNav(app) {
    var html = '';
    app.nav.forEach(function (g) {
      html += '<div class="fa-group">' + g.group + '</div>';
      g.items.forEach(function (it) {
        if (it.children) {
          html += '<button class="fa-nav" type="button" data-toggle="' + it.id + '" aria-expanded="false">' +
            '<span class="ico">' + it.icon + '</span>' + it.label + '<span class="caret">▶</span></button>';
          html += '<div class="fa-sub" data-sub="' + it.id + '">' + it.children.map(function (c) {
            return '<button class="fa-nav" type="button" data-page="' + c.id + '"><span class="ico">' + c.icon + '</span>' + c.label + '</button>';
          }).join('') + '</div>';
        } else {
          html += '<button class="fa-nav" type="button" data-page="' + it.id + '"><span class="ico">' + it.icon + '</span>' + it.label + '</button>';
        }
      });
    });
    faSide.innerHTML = html;
  }

  function go(id) {
    var app = APPS[state.app];
    var page = app.pages[id];
    if (!page) return;
    state.page = id;

    Array.prototype.forEach.call(faSide.querySelectorAll('[data-page]'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-page') === id);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.fa-tab'), function (t) {
      t.classList.toggle('is-on', t.getAttribute('data-page') === id);
    });
    faCrumbs.innerHTML = '<span>' + app.name + '</span><span>/</span><b>' + page.title + '</b>';
    faPage.innerHTML = '<div class="fa-page-head"><div class="fa-page-title">' + page.title +
      '</div><div class="fa-page-desc">' + page.desc + '</div></div>' + page.render();
    faMain.scrollTop = 0;
    faSearch.value = '';
    if (window.innerWidth <= 760) faSide.classList.remove('open');
  }

  function open(key, trigger) {
    var app = APPS[key];
    if (!app) return;
    state.app = key;
    lastCard = trigger || null;
    shell.className = 'fa-shell chrome-' + app.chrome;
    shell.style.setProperty('--fa-accent', app.accent);
    renderTabs(app);
    faName.textContent = app.name;
    faLogo.textContent = app.logo;
    faLogo.style.background = app.accent;
    renderNav(app);
    go(app.start);
    shell.classList.add('active');
    shell.setAttribute('aria-hidden', 'false');
    document.body.classList.add('fs-locked');
    if (faClose) faClose.focus({ preventScroll: true });
  }

  function close() {
    shell.classList.remove('active');
    shell.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('fs-locked');
    closeModal();
    if (lastCard) { lastCard.focus({ preventScroll: true }); lastCard = null; }
  }

  /* ---------------- 弹窗 / Toast ---------------- */
  function openModal(title, desc, okText, onOk) {
    faModalCard.innerHTML = '<div class="fa-modal-title">' + title + '</div>' +
      '<div class="fa-modal-desc">' + (desc || '') + '</div>' +
      '<div class="fa-modal-foot"><button class="sy-btn sy-btn-secondary" type="button" data-modal-cancel>取消</button>' +
      '<button class="sy-btn sy-btn-primary" type="button" data-modal-ok>' + (okText || '确认') + '</button></div>';
    faModal.classList.add('active');
    pendingOk = onOk || null;
    var okBtn = faModalCard.querySelector('[data-modal-ok]');
    if (okBtn) okBtn.focus();
  }
  function closeModal() {
    faModal.classList.remove('active');
    pendingOk = null;
  }
  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'fa-toast';
    el.textContent = msg;
    faToast.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 240);
    }, 2200);
  }

  /* ---------------- 交互绑定 ---------------- */
  document.addEventListener('click', function (e) {
    var card = e.target.closest('.fs-app-card');
    if (card) { open(card.getAttribute('data-app'), card); return; }

    if (!shell.classList.contains('active')) return;

    var toggle = e.target.closest('[data-toggle]');
    if (toggle) {
      var id = toggle.getAttribute('data-toggle');
      var sub = faSide.querySelector('[data-sub="' + id + '"]');
      var on = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', on ? 'false' : 'true');
      if (sub) sub.classList.toggle('open', !on);
      return;
    }

    var pageBtn = e.target.closest('[data-page]');
    if (pageBtn) { go(pageBtn.getAttribute('data-page')); return; }

    var act = e.target.closest('[data-act]');
    if (act) {
      var kind = act.getAttribute('data-act');
      if (kind === 'toast') { toast(act.getAttribute('data-msg') || '操作成功'); return; }
      if (kind === 'modal') {
        openModal(act.getAttribute('data-title') || '确认操作',
          act.getAttribute('data-desc') || '',
          act.getAttribute('data-ok') || '确认',
          function () { toast(act.getAttribute('data-msg') || '操作已提交'); });
        return;
      }
      if (kind === 'submit') { submitForm(act); return; }
      if (kind === 'reset') {
        var panel = act.closest('.sy-panel');
        if (panel) Array.prototype.forEach.call(panel.querySelectorAll('.sy-input'), function (i) {
          i.value = ''; i.removeAttribute('data-invalid');
        });
        toast('已重置');
        return;
      }
    }

    if (e.target.hasAttribute('data-modal-cancel')) { closeModal(); return; }
    if (e.target.hasAttribute('data-modal-ok')) {
      var fn = pendingOk;
      closeModal();
      if (fn) fn();
      return;
    }
    if (e.target === faModal) closeModal();
  });

  function submitForm(btn) {
    var panel = btn.closest('.sy-panel') || faPage;
    var required = panel.querySelectorAll('[data-required]');
    var bad = 0;
    Array.prototype.forEach.call(required, function (f) {
      if (!f.value.trim()) { f.setAttribute('data-invalid', 'true'); bad++; }
      else f.removeAttribute('data-invalid');
    });
    if (bad) { toast('还有 ' + bad + ' 个必填项未填写'); return; }
    toast('提交成功 · 已进入审批流程');
  }

  document.addEventListener('change', function (e) {
    if (!shell.classList.contains('active')) return;
    var table = e.target.closest('.sy-table');
    if (!table) return;

    if (e.target.hasAttribute('data-checkall')) {
      Array.prototype.forEach.call(table.querySelectorAll('[data-rowcheck]'), function (c) { c.checked = e.target.checked; });
    }
    var checks = Array.prototype.slice.call(table.querySelectorAll('[data-rowcheck]'));
    var on = checks.filter(function (c) { return c.checked; }).length;
    var bar = faPage.querySelector('[data-bulkbar]');
    if (bar) {
      var n = bar.querySelector('[data-bulkn]');
      if (n) n.textContent = on;
      bar.classList.toggle('active', on > 0);
    }
    var all = table.querySelector('[data-checkall]');
    if (all) {
      all.checked = on > 0 && on === checks.length;
      all.indeterminate = on > 0 && on < checks.length;
    }
  });

  if (faSide) {
    faSide.addEventListener('click', function (e) {
      var b = e.target.closest('[data-page]');
      if (!b) return;
      var subs = b.closest('.fa-sub');
      if (subs) subs.classList.add('open');
    });
  }

  if (faMain) {
    faMain.addEventListener('click', function () {
      if (faSide.classList.contains('open')) faSide.classList.remove('open');
    });
  }

  if (faClose) faClose.addEventListener('click', close);
  if (faMenuBtn) faMenuBtn.addEventListener('click', function () { faSide.classList.toggle('open'); });

  if (faSearch) {
    faSearch.addEventListener('input', function () {
      var q = faSearch.value.trim().toLowerCase();
      var tbody = faPage.querySelector('.sy-table tbody');
      if (!tbody) return;
      var rowsEl = tbody.querySelectorAll('tr');
      var shown = 0;
      Array.prototype.forEach.call(rowsEl, function (tr) {
        var hit = !q || tr.textContent.toLowerCase().indexOf(q) > -1;
        tr.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      var empty = faPage.querySelector('.fa-empty');
      if (empty) empty.remove();
      if (!shown) {
        var div = document.createElement('div');
        div.className = 'fa-empty';
        div.textContent = '没有匹配「' + faSearch.value + '」的记录';
        var wrap = faPage.querySelector('.sy-table-wrap');
        if (wrap) wrap.appendChild(div);
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!shell.classList.contains('active')) return;
    if (faModal.classList.contains('active')) { closeModal(); return; }
    if (faSide.classList.contains('open')) { faSide.classList.remove('open'); return; }
    close();
  });

})();
