/* 六类后台应用的公共外壳引擎：菜单、页面渲染、弹窗、Toast、搜索、批量选择 */
(function () {
  'use strict';

  var CFG = null;
  var state = { page: null };

  var shell, faName, faLogo, faCrumbs, faSide, faPage, faMain, faClose, faMenuBtn, faSearch, faModal, faModalCard, faToast, faTabs;
  var pendingOk = null;

  /* ---------------- 片段构造 ---------------- */
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
      '<button class="sy-btn sy-btn-primary sy-btn-sm" data-act="toast" data-msg="已批量处理所选记录">批量处理</button>' +
      '<button class="sy-btn sy-btn-secondary sy-btn-sm" data-act="toast" data-msg="已导出所选记录">导出</button></div>' : '';
    return bulk + '<div class="sy-table-wrap"><table class="sy-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function form(fields, actions) {
    var h = fields.map(function (f) {
      var ctl;
      if (f.type === 'select') ctl = '<select class="sy-select">' + (f.options || []).map(function (o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
      else if (f.type === 'textarea') ctl = '<textarea class="sy-textarea" rows="3" placeholder="' + (f.ph || '') + '">' + (f.value || '') + '</textarea>';
      else ctl = '<input class="sy-input" type="text" value="' + (f.value || '') + '" placeholder="' + (f.ph || '') + '"' + (f.required ? ' data-required' : '') + '>';
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
    var span = (max - min) || 1, step = w / (vals.length - 1);
    var d = vals.map(function (v, i) {
      var x = (i * step).toFixed(1);
      var y = (h - 8 - ((v - min) / span) * (h - 18)).toFixed(1);
      return (i ? 'L' : 'M') + x + ',' + y;
    }).join(' ');
    return '<svg viewBox="0 0 320 86" preserveAspectRatio="none" style="width:100%;height:104px;display:block" aria-hidden="true">' +
      '<defs><linearGradient id="faG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity=".22"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>' +
      '</linearGradient></defs><path d="' + d + ' L320,86 L0,86 Z" fill="url(#faG)"/>' +
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

  function setPage(id) {
    var page = CFG.pages[id];
    if (!page) return;
    state.page = id;
    Array.prototype.forEach.call(faSide.querySelectorAll('[data-page]'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-page') === id);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.fa-tab'), function (t) {
      t.classList.toggle('is-on', t.getAttribute('data-page') === id);
    });
    // 展开包含当前页的分组
    Array.prototype.forEach.call(faSide.querySelectorAll('[data-toggle]'), function (t) {
      var sub = faSide.querySelector('[data-sub="' + t.getAttribute('data-toggle') + '"]');
      if (!sub) return;
      if (sub.querySelector('[data-page="' + id + '"]')) sub.classList.add('open');
    });
    faCrumbs.innerHTML = '<span>' + CFG.name + '</span><span>/</span><b>' + page.title + '</b>';
    faPage.innerHTML = '<div class="fa-page-head"><div class="fa-page-title">' + page.title +
      '</div><div class="fa-page-desc">' + page.desc + '</div></div>' + page.render();
    faMain.scrollTop = 0;
    if (faSearch) faSearch.value = '';
  }

  function renderNav() {
    var html = '';
    CFG.nav.forEach(function (g) {
      html += '<div class="fa-group">' + g.group + '</div>';
      g.items.forEach(function (it) {
        if (it.children) {
          html += '<button class="fa-nav" type="button" data-toggle="' + it.id + '" aria-expanded="false">' +
            '<span class="ico">' + (it.icon || '·') + '</span>' + it.label + '<span class="caret">▶</span></button>';
          html += '<div class="fa-sub" data-sub="' + it.id + '">' + it.children.map(function (c) {
            return '<button class="fa-nav" type="button" data-page="' + c.id + '"><span class="ico">' + (c.icon || '·') + '</span>' + c.label + '</button>';
          }).join('') + '</div>';
        } else {
          html += '<button class="fa-nav" type="button" data-page="' + it.id + '"><span class="ico">' + (it.icon || '·') + '</span>' + it.label + '</button>';
        }
      });
    });
    faSide.innerHTML = html;
  }

  function renderTabs() {
    if (!faTabs) return;
    var items = [];
    (CFG.tabs || []).forEach(function (id) {
      var found = null;
      CFG.nav.forEach(function (g) {
        g.items.forEach(function (it) {
          if (it.id === id) found = it;
          (it.children || []).forEach(function (c) { if (c.id === id) found = c; });
        });
      });
      if (found) items.push(found);
    });
    faTabs.innerHTML = items.map(function (t) {
      return '<button class="fa-tab" type="button" data-page="' + t.id + '">' + t.label + '</button>';
    }).join('');
  }

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
  function closeModal() { faModal.classList.remove('active'); pendingOk = null; }

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

  function submitForm(btn) {
    var panelEl = btn.closest('.sy-panel') || faPage;
    var required = panelEl.querySelectorAll('[data-required]');
    var bad = 0;
    Array.prototype.forEach.call(required, function (f) {
      if (!f.value.trim()) { f.setAttribute('data-invalid', 'true'); bad++; }
      else f.removeAttribute('data-invalid');
    });
    if (bad) { toast('还有 ' + bad + ' 个必填项未填写'); return; }
    toast('提交成功 · 已进入后续流程');
  }

  function boot(cfg) {
    CFG = cfg;
    shell = document.getElementById('faShell');
    if (!shell) return;
    faName = document.getElementById('faName');
    faLogo = document.getElementById('faLogo');
    faCrumbs = document.getElementById('faCrumbs');
    faSide = document.getElementById('faSide');
    faPage = document.getElementById('faPage');
    faMain = document.getElementById('faMain');
    faClose = document.getElementById('faClose');
    faMenuBtn = document.getElementById('faMenuBtn');
    faSearch = document.getElementById('faSearch');
    faModal = document.getElementById('faModal');
    faModalCard = document.getElementById('faModalCard');
    faToast = document.getElementById('faToast');
    faTabs = document.getElementById('faTabs');

    shell.className = 'fa-shell chrome-' + (cfg.chrome || 'erp') + ' active';
    shell.style.setProperty('--fa-accent', cfg.accent);
    document.title = cfg.name + ' · 前端设计规范库';
    faName.textContent = cfg.name;
    faLogo.textContent = cfg.logo;
    faLogo.style.background = cfg.accent;

    renderNav();
    renderTabs();
    setPage(cfg.start || Object.keys(cfg.pages)[0]);

    document.addEventListener('click', function (e) {
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
      if (pageBtn) { setPage(pageBtn.getAttribute('data-page')); return; }

      var act = e.target.closest('[data-act]');
      if (act) {
        var kind = act.getAttribute('data-act');
        if (kind === 'toast') { toast(act.getAttribute('data-msg') || '操作成功'); return; }
        if (kind === 'modal') {
          openModal(act.getAttribute('data-title') || '确认操作', act.getAttribute('data-desc') || '',
            act.getAttribute('data-ok') || '确认',
            function () { toast(act.getAttribute('data-msg') || '操作已提交'); });
          return;
        }
        if (kind === 'submit') { submitForm(act); return; }
        if (kind === 'reset') {
          var p = act.closest('.sy-panel');
          if (p) Array.prototype.forEach.call(p.querySelectorAll('.sy-input'), function (i) { i.value = ''; i.removeAttribute('data-invalid'); });
          toast('已重置');
          return;
        }
      }
      if (e.target.hasAttribute('data-modal-cancel')) { closeModal(); return; }
      if (e.target.hasAttribute('data-modal-ok')) { var fn = pendingOk; closeModal(); if (fn) fn(); return; }
      if (e.target === faModal) closeModal();
    });

    document.addEventListener('change', function (e) {
      var t = e.target.closest('.sy-table');
      if (!t) return;
      if (e.target.hasAttribute('data-checkall')) {
        Array.prototype.forEach.call(t.querySelectorAll('[data-rowcheck]'), function (c) { c.checked = e.target.checked; });
      }
      var checks = Array.prototype.slice.call(t.querySelectorAll('[data-rowcheck]'));
      var on = checks.filter(function (c) { return c.checked; }).length;
      var bar = faPage.querySelector('[data-bulkbar]');
      if (bar) {
        var n = bar.querySelector('[data-bulkn]');
        if (n) n.textContent = on;
        bar.classList.toggle('active', on > 0);
      }
      var all = t.querySelector('[data-checkall]');
      if (all) { all.checked = on > 0 && on === checks.length; all.indeterminate = on > 0 && on < checks.length; }
    });

    if (faSearch) {
      faSearch.addEventListener('input', function () {
        var q = faSearch.value.trim().toLowerCase();
        var tbody = faPage.querySelector('.sy-table tbody');
        if (!tbody) return;
        var shown = 0;
        Array.prototype.forEach.call(tbody.querySelectorAll('tr'), function (tr) {
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

    if (faClose) faClose.addEventListener('click', function () { location.href = 'frontend-style.html'; });
    if (faMenuBtn) faMenuBtn.addEventListener('click', function () { faSide.classList.toggle('open'); });
    if (faMain) faMain.addEventListener('click', function () { faSide.classList.remove('open'); });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (faModal.classList.contains('active')) { closeModal(); return; }
      if (faSide.classList.contains('open')) { faSide.classList.remove('open'); }
    });

    // 支持页面直接跳转：frontend-ERP.html#po
    if (location.hash.length > 1) {
      var key = location.hash.slice(1);
      if (CFG.pages[key]) setPage(key);
    }
  }

  window.FA = {
    boot: boot, kpi: kpi, panel: panel, table: table, form: form,
    steps: steps, kanban: kanban, line: line, bars: bars, rows: rows, toast: toast
  };
})();
