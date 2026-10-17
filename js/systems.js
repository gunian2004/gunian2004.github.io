(function () {
  'use strict';

  /* ---------- 通用弹层 ---------- */
  var veil = document.getElementById('veil');
  var modal = document.getElementById('modal');
  var drawer = document.getElementById('drawer');
  var cmdk = document.getElementById('cmdk');
  var lastTrigger = null;

  function anyOpen() {
    return (modal && modal.classList.contains('active')) ||
      (drawer && drawer.classList.contains('active')) ||
      (cmdk && cmdk.classList.contains('active'));
  }
  function syncVeil() {
    if (!veil) return;
    veil.classList.toggle('active', anyOpen());
  }
  function openLayer(name, trigger) {
    var el = name === 'modal' ? modal : name === 'drawer' ? drawer : name === 'cmdk' ? cmdk : null;
    if (!el) return;
    lastTrigger = trigger || null;
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
    syncVeil();
    var focusEl = el.querySelector('input, button, [tabindex]');
    if (focusEl) focusEl.focus({ preventScroll: true });
  }
  function closeLayer(name) {
    var el = name === 'modal' ? modal : name === 'drawer' ? drawer : name === 'cmdk' ? cmdk : null;
    if (!el || !el.classList.contains('active')) return;
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
    if (name === 'cmdk' && cmdkInput) { cmdkInput.value = ''; filterCmdk(''); }
    syncVeil();
    if (lastTrigger) { lastTrigger.focus({ preventScroll: true }); lastTrigger = null; }
  }
  function closeTop() {
    if (cmdk && cmdk.classList.contains('active')) { closeLayer('cmdk'); return true; }
    if (modal && modal.classList.contains('active')) { closeLayer('modal'); return true; }
    if (drawer && drawer.classList.contains('active')) { closeLayer('drawer'); return true; }
    return false;
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open]');
    if (opener) {
      var name = opener.getAttribute('data-open');
      if (name === 'toast') { toast('已保存草稿 · 2 秒前'); return; }
      openLayer(name, opener);
      return;
    }
    if (e.target.hasAttribute('data-close') || e.target === veil) {
      closeTop();
      var t = e.target.getAttribute('data-toast');
      if (t) toast(t);
    }
  });

  if (veil) veil.addEventListener('click', closeTop);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (closeTop()) { e.preventDefault(); return; }
      if (closeSyLayer()) { e.preventDefault(); return; }
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdk && cmdk.classList.contains('active')) closeLayer('cmdk');
      else openLayer('cmdk', null);
    }
  });

  /* ---------- Toast ---------- */
  var toasts = document.getElementById('toasts');
  function toast(text) {
    if (!toasts) return;
    var el = document.createElement('div');
    el.className = 'sy-toast';
    el.innerHTML = '<i>✓</i><span></span>';
    el.querySelector('span').textContent = text;
    toasts.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 240);
    }, 2400);
  }

  /* ---------- 分段控件：滑块指示器 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.sy-seg'), function (seg) {
    var ind = seg.querySelector('.sy-seg-ind');
    var btns = Array.prototype.slice.call(seg.querySelectorAll('.sy-seg-btn'));

    function move() {
      var on = seg.querySelector('.sy-seg-btn[aria-selected="true"]') || btns[0];
      if (!on || !ind) return;
      ind.style.width = on.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + (on.offsetLeft - 3) + 'px)';
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        b.setAttribute('aria-selected', 'true');
        move();
      });
    });

    seg._move = move;
    move();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(move);
    setTimeout(move, 120);
  });

  /* ---------- 开关 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.sy-switch'), function (sw) {
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', on ? 'false' : 'true');
    });
  });

  /* ---------- 表格批量选择 ---------- */
  var table = document.getElementById('demoTable');
  var bulkbar = document.getElementById('bulkbar');
  var bulkCount = document.getElementById('bulkCount');
  var checkAll = document.getElementById('checkAll');
  var bulkClear = document.getElementById('bulkClear');

  function syncBulk() {
    if (!table || !bulkbar) return;
    var checks = Array.prototype.slice.call(table.querySelectorAll('.sy-rowcheck'));
    var selected = checks.filter(function (c) { return c.checked; });
    checks.forEach(function (c) {
      var tr = c.closest('tr');
      if (tr) tr.setAttribute('aria-selected', c.checked ? 'true' : 'false');
    });
    if (bulkCount) bulkCount.textContent = selected.length;
    bulkbar.classList.toggle('active', selected.length > 0);
    if (checkAll) {
      checkAll.checked = selected.length > 0 && selected.length === checks.length;
      checkAll.indeterminate = selected.length > 0 && selected.length < checks.length;
    }
  }

  if (table) {
    table.addEventListener('change', function (e) {
      if (e.target.classList.contains('sy-rowcheck')) syncBulk();
    });
  }
  if (checkAll) {
    checkAll.addEventListener('change', function () {
      Array.prototype.forEach.call(table.querySelectorAll('.sy-rowcheck'), function (c) {
        c.checked = checkAll.checked;
      });
      syncBulk();
    });
  }
  if (bulkClear) {
    bulkClear.addEventListener('click', function () {
      Array.prototype.forEach.call(table.querySelectorAll('.sy-rowcheck'), function (c) { c.checked = false; });
      syncBulk();
    });
  }

  /* ---------- 命令面板 ---------- */
  var cmdkInput = document.getElementById('cmdkInput');
  var cmdkItems = Array.prototype.slice.call(document.querySelectorAll('.sy-cmdk-item'));

  function filterCmdk(q) {
    var kw = (q || '').trim().toLowerCase();
    var visible = cmdkItems.filter(function (it) {
      var hit = !kw || it.textContent.toLowerCase().indexOf(kw) > -1;
      it.style.display = hit ? '' : 'none';
      return hit;
    });
    cmdkItems.forEach(function (it) { it.classList.remove('is-on'); });
    if (visible[0]) visible[0].classList.add('is-on');
    return visible;
  }

  if (cmdkInput) {
    cmdkInput.addEventListener('input', function () { filterCmdk(cmdkInput.value); });
    cmdkInput.addEventListener('keydown', function (e) {
      var visible = cmdkItems.filter(function (it) { return it.style.display !== 'none'; });
      if (!visible.length) return;
      var idx = visible.findIndex(function (it) { return it.classList.contains('is-on'); });
      if (e.key === 'ArrowDown') { e.preventDefault(); visible[(idx + 1) % visible.length].classList.add('is-on'); visible[idx].classList.remove('is-on'); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); visible[(idx - 1 + visible.length) % visible.length].classList.add('is-on'); visible[idx].classList.remove('is-on'); }
      else if (e.key === 'Enter') { e.preventDefault(); closeLayer('cmdk'); toast('已跳转：' + visible[idx].textContent.trim()); }
    });
  }
  cmdkItems.forEach(function (it) {
    it.addEventListener('click', function () {
      closeLayer('cmdk');
      toast('已跳转：' + it.textContent.trim());
    });
  });

  /* ---------- 动效重放 ---------- */
  var replay = document.getElementById('motionReplay');
  if (replay) {
    replay.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('[data-motion]'), function (el) {
        el.classList.remove('is-live');
        void el.offsetWidth;
        el.classList.add('is-live');
      });
    });
  }


  /* ---------- 卡片 → 详情覆盖层 ---------- */
  var overlay = document.getElementById('syOverlay');
  var syClose = document.getElementById('syClose');
  var syCards = Array.prototype.slice.call(document.querySelectorAll('.sy-entry'));
  var syDetails = Array.prototype.slice.call(document.querySelectorAll('.sy-detail'));
  var syNav = document.getElementById('syNav');
  var navItems = syNav ? Array.prototype.slice.call(syNav.querySelectorAll('.sy-nav-item')) : [];
  var syLastCard = null;

  function relayoutSegs() {
    Array.prototype.forEach.call(document.querySelectorAll('.sy-seg'), function (s) {
      if (s._move) s._move();
    });
  }

  function openSy(key, trigger) {
    if (!overlay) return;
    syLastCard = trigger || null;
    syDetails.forEach(function (d) {
      d.classList.toggle('active', d.getAttribute('data-sy-panel') === key);
    });
    navItems.forEach(function (n) {
      var on = n.getAttribute('data-sy') === key;
      if (on) n.setAttribute('aria-current', 'true');
      else n.removeAttribute('aria-current');
    });
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.scrollTop = 0;
    document.body.classList.add('fs-locked');
    requestAnimationFrame(relayoutSegs);
    if (syClose) syClose.focus({ preventScroll: true });
  }

  // 目录切换：只换面板，不关闭覆盖层
  function switchSy(key, focusNav) {
    syDetails.forEach(function (d) {
      d.classList.toggle('active', d.getAttribute('data-sy-panel') === key);
    });
    navItems.forEach(function (n) {
      var on = n.getAttribute('data-sy') === key;
      if (on) {
        n.setAttribute('aria-current', 'true');
        if (focusNav) n.focus({ preventScroll: true });
      } else {
        n.removeAttribute('aria-current');
      }
    });
    if (overlay) overlay.scrollTop = 0;
    requestAnimationFrame(relayoutSegs);
  }

  navItems.forEach(function (n) {
    n.addEventListener('click', function () { switchSy(n.getAttribute('data-sy'), false); });
  });

  if (syNav) {
    syNav.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
      var idx = navItems.indexOf(document.activeElement);
      if (idx === -1) return;
      var next = idx;
      if (e.key === 'ArrowDown') next = Math.min(idx + 1, navItems.length - 1);
      else if (e.key === 'ArrowUp') next = Math.max(idx - 1, 0);
      else if (e.key === 'Home') next = 0;
      else next = navItems.length - 1;
      e.preventDefault();
      switchSy(navItems[next].getAttribute('data-sy'), true);
    });
  }

  function closeSy() {
    if (!overlay || !overlay.classList.contains('active')) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('fs-locked');
    if (syLastCard) { syLastCard.focus({ preventScroll: true }); syLastCard = null; }
  }

  // 供 Esc 使用：返回 true 表示确实关掉了覆盖层
  function closeSyLayer() {
    if (overlay && overlay.classList.contains('active')) { closeSy(); return true; }
    return false;
  }

  syCards.forEach(function (c) {
    c.addEventListener('click', function () { openSy(c.getAttribute('data-sy'), c); });
  });
  if (syClose) syClose.addEventListener('click', closeSy);
  if (overlay) {
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSy(); });
    // Tab 不跑到覆盖层后面的画廊
    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var list = Array.prototype.filter.call(
        overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
        function (el) { return el.offsetParent !== null; }
      );
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- 初始 ---------- */
  syncBulk();
  syncVeil();

})();
