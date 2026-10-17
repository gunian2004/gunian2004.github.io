(function () {
  'use strict';

  // 5 套风格的元信息：键值必须与 CSS 的 .theme-<key> 及切换器 data-skin 一致
  var THEME_META = {
    feed:     { kicker: '灵感 · 小红书',            title: '财富社区',     sub: '内容驱动的 C 端理财社区 · 大圆角 · 多留白' },
    neon:     { kicker: '灵感 · 抖音',              title: '行情短视频',   sub: '短视频 / 直播行情 · 纯黑霓虹 · 玻璃卡' },
    terminal: { kicker: '灵感 · Bloomberg / Wind',  title: '机构交易终端', sub: '高频交易 · 等宽字体 · 全网格数据' },
    minimal:  { kicker: '灵感 · Linear / Notion',   title: '极简工作台',   sub: '投研 / 合规后台 · 发丝线 · 无阴影' },
    luxe:     { kicker: '灵感 · iOS / Revolut',     title: '高净值财富',   sub: '私行 App · 分组列表 · 金色玻璃' }
  };
  var SKINS = ['feed', 'neon', 'terminal', 'minimal', 'luxe'];
  var currentSkin = 'feed';

  var stage = document.getElementById('fsCardStage');
  var switcher = document.getElementById('fsSwitcher');
  var tabs = switcher ? Array.prototype.slice.call(switcher.querySelectorAll('.fs-detail-tab')) : [];
  var skinNameEl = document.getElementById('fsSkinName');
  var skinFromEl = document.getElementById('fsSkinFrom');

  var detail = document.getElementById('fsDetail');
  var themeInner = document.getElementById('fsTheme');
  var kickerEl = document.getElementById('fsKicker');
  var titleEl = document.getElementById('fsTitle');
  var subEl = document.getElementById('fsSub');
  var closeBtn = document.getElementById('fsClose');
  var cardHit = document.getElementById('fsOpenDetail');

  // ---------- 换肤：唯一状态入口；同时驱动详情层与卡片展示 ----------
  function setSkin(key, focusTab) {
    if (SKINS.indexOf(key) === -1) return;
    currentSkin = key;
    var meta = THEME_META[key];

    if (themeInner) themeInner.className = 'fs-detail-inner theme-' + key;
    if (stage) stage.className = 'fs-card-stage theme-' + key;

    if (kickerEl) kickerEl.textContent = meta.kicker;
    if (titleEl) titleEl.textContent = meta.title;
    if (subEl) subEl.textContent = meta.sub;
    if (skinNameEl) skinNameEl.textContent = meta.title;
    if (skinFromEl) skinFromEl.textContent = meta.kicker;

    tabs.forEach(function (t) {
      var on = t.getAttribute('data-skin') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      t.classList.toggle('is-active', on);
      if (on && focusTab) t.focus();
    });
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { setSkin(t.getAttribute('data-skin')); });
  });

  // 切换器键盘：←/→/↑/↓ 移动并换肤，Home/End 跳首尾，Enter/Space 选中
  if (switcher) {
    switcher.addEventListener('keydown', function (e) {
      var focusedSkin = document.activeElement && document.activeElement.getAttribute
        ? document.activeElement.getAttribute('data-skin') : null;
      var idx = SKINS.indexOf(focusedSkin || currentSkin);
      if (idx === -1) idx = 0;
      var next = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % SKINS.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + SKINS.length) % SKINS.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = SKINS.length - 1;

      if (next > -1) {
        e.preventDefault();
        setSkin(SKINS[next], true);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        if (focusedSkin) { e.preventDefault(); setSkin(focusedSkin, true); }
      }
    });
  }

  // ---------- 完整组件视图 ----------
  function openTheme(key) {
    if (!THEME_META[key] || !themeInner) return;
    setSkin(key);
    detail.classList.add('active');
    detail.setAttribute('aria-hidden', 'false');
    document.body.classList.add('fs-locked');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeTheme() {
    detail.classList.remove('active');
    detail.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('fs-locked');
    closeThemeModal();
    if (cardHit) cardHit.focus({ preventScroll: true });
  }

  if (cardHit) {
    cardHit.addEventListener('click', function () { openTheme(currentSkin); });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeTheme);
  if (detail) {
    detail.addEventListener('click', function (e) {
      if (e.target === detail) closeTheme();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (detail && detail.classList.contains('active')) { closeTheme(); }
  });

  // ---------- 详情内焦点限定：Tab 不跑到遮罩后面 ----------
  var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  if (detail) {
    detail.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !themeInner) return;
      var list = Array.prototype.filter.call(
        themeInner.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null; }
      );
      if (!list.length) return;
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // ---------- 主题内拟态框 ----------
  var themeModal = document.getElementById('fsThemeModal');
  var openModalBtn = document.getElementById('fsOpenModal');

  function openThemeModal() {
    if (!themeModal) return;
    themeModal.classList.add('active');
    themeModal.setAttribute('aria-hidden', 'false');
  }
  function closeThemeModal() {
    if (!themeModal) return;
    themeModal.classList.remove('active');
    themeModal.setAttribute('aria-hidden', 'true');
  }
  if (openModalBtn) openModalBtn.addEventListener('click', openThemeModal);
  if (themeModal) {
    themeModal.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-fs-modal-close')) closeThemeModal();
    });
  }

  // ---------- 开关 / 分段控件（详情层展示用交互） ----------
  document.addEventListener('click', function (e) {
    var sw = e.target.closest && e.target.closest('.fs-switch');
    if (sw) {
      sw.classList.toggle('is-on');
      sw.setAttribute('aria-pressed', sw.classList.contains('is-on') ? 'true' : 'false');
      return;
    }
    var seg = e.target.closest && e.target.closest('.fs-seg-item');
    if (seg) {
      var items = seg.parentNode.querySelectorAll('.fs-seg-item');
      Array.prototype.forEach.call(items, function (i) { i.classList.remove('is-active'); });
      seg.classList.add('is-active');
    }
  });

  // ---------- 按钮点击波纹（仅 feed / luxe 的详情面板） ----------
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', function (e) {
    if (prefersReduced) return;
    var btn = e.target.closest && e.target.closest('.fs-btn');
    if (!btn || !btn.closest('.theme-feed, .theme-luxe')) return;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = document.createElement('span');
    ripple.className = 'fs-ripple';
    ripple.style.cssText = 'position:absolute;border-radius:50%;pointer-events:none;background:rgba(255,255,255,.4);transform:scale(0);animation:fsRipple .55s ease-out;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'left:' + (e.clientX - rect.left - size / 2) + 'px;' +
      'top:' + (e.clientY - rect.top - size / 2) + 'px;';
    btn.appendChild(ripple);
    setTimeout(function () { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 600);
  });

  // 初始状态与 HTML 保持一致
  setSkin(currentSkin);

})();
(function () {
  'use strict';

  /* =========================================================
     票据存根式 · 卡 B 的交互
     与 js/design.js 完全独立：只操作 .lg-* 作用域内的节点
     ========================================================= */

  var card = document.getElementById('ledgerCard');
  var app = document.getElementById('lgApp');
  var panel = app ? app.querySelector('.lg-panel') : null;
  var closeBtn = document.getElementById('lgClose');
  if (!card || !app) return;

  var SCENES = ['info', 'form', 'confirm', 'dialog', 'spec'];
  var currentScene = 'info';

  var tabs = Array.prototype.slice.call(app.querySelectorAll('.lg-tab'));
  var scenes = Array.prototype.slice.call(app.querySelectorAll('.lg-scene'));

  var amountInput = document.getElementById('lgAmount');
  var amountCn = document.getElementById('lgAmountCn');
  var termSelect = document.getElementById('lgTerm');
  var riskWrap = document.getElementById('lgRisk');

  var recapTerm = document.getElementById('lgRecapTerm');
  var recapRisk = document.getElementById('lgRecapRisk');
  var recapAmount = document.getElementById('lgRecapAmount');
  var recapCn = document.getElementById('lgRecapCn');
  var stateEl = document.getElementById('lgState');

  var sheet = document.getElementById('lgSheet');
  var sheetAmount = document.getElementById('lgSheetAmount');
  var sheetCn = document.getElementById('lgSheetCn');
  var sheetTerm = document.getElementById('lgSheetTerm');
  var sheetRisk = document.getElementById('lgSheetRisk');
  var sheetBack = document.getElementById('lgSheetBack');
  var sheetOk = document.getElementById('lgSheetOk');

  var drawer = document.getElementById('lgDrawer');
  var modal = document.getElementById('lgModal');
  var veil = document.getElementById('lgVeil');

  var form = { amount: 500000, term: '365 天', risk: 'R3 平衡型' };

  /* ---------------- 金额：格式化 + 中文大写 ---------------- */
  var DIG = '零壹贰叁肆伍陆柒捌玖';
  var UNIT = ['', '拾', '佰', '仟'];
  var SEC = ['', '万', '亿', '万亿'];

  function sectionToCn(n) {
    var s = '', zero = false;
    for (var i = 0; i < 4; i++) {
      var p = 3 - i;
      var d = Math.floor(n / Math.pow(10, p)) % 10;
      if (d === 0) { zero = true; continue; }
      if (zero && s) s += '零';
      zero = false;
      s += DIG.charAt(d) + UNIT[p];
    }
    return s;
  }

  function intToCn(n) {
    if (n === 0) return '零';
    var secs = [], k = 0;
    while (n > 0) { secs.push(n % 10000); n = Math.floor(n / 10000); k++; }
    var out = '';
    for (var i = secs.length - 1; i >= 0; i--) {
      var v = secs[i];
      if (v === 0) { if (out && out.slice(-1) !== '零') out += '零'; continue; }
      if (out && v < 1000 && out.slice(-1) !== '零') out += '零';
      out += sectionToCn(v) + SEC[i];
    }
    return out.replace(/零+$/, '');
  }

  function toChineseAmount(num) {
    if (!isFinite(num) || num < 0) return '';
    var cents = Math.round(num * 100);
    var intPart = Math.floor(cents / 100);
    var dec = cents % 100;
    var jiao = Math.floor(dec / 10);
    var fen = dec % 10;
    var s = '人民币' + intToCn(intPart) + '元';
    if (dec === 0) return s + '整';
    if (jiao) s += DIG.charAt(jiao) + '角';
    if (fen) s += DIG.charAt(fen) + '分';
    return s;
  }

  function fmtMoney(n) {
    return '¥ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseAmount(str) {
    var v = String(str).replace(/[^\d.]/g, '');
    var n = parseFloat(v);
    return isFinite(n) ? n : 0;
  }

  /* ---------------- 场景切换 ---------------- */
  function setScene(key, focusTab) {
    if (SCENES.indexOf(key) === -1) return;
    currentScene = key;
    scenes.forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-scene') === key);
    });
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-scene') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      if (on && focusTab) t.focus();
    });
    if (key === 'confirm') syncRecap();
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { setScene(t.getAttribute('data-scene')); });
  });

  document.getElementById('lgTabs').addEventListener('keydown', function (e) {
    var idx = SCENES.indexOf(currentScene);
    var next = -1;
    if (e.key === 'ArrowRight') next = (idx + 1) % SCENES.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + SCENES.length) % SCENES.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = SCENES.length - 1;
    if (next > -1) { e.preventDefault(); setScene(SCENES[next], true); }
  });

  /* ---------------- 表单 ---------------- */
  function readForm() {
    form.amount = parseAmount(amountInput.value);
    form.term = termSelect.value;
    var on = riskWrap.querySelector('.lg-chip.is-on');
    if (on) form.risk = on.getAttribute('data-risk');
  }

  function paintAmountHint() {
    var n = parseAmount(amountInput.value);
    amountCn.textContent = toChineseAmount(n);
  }

  amountInput.addEventListener('input', paintAmountHint);
  amountInput.addEventListener('blur', function () {
    var n = parseAmount(amountInput.value);
    amountInput.value = n ? n.toFixed(2) : '0.00';
    paintAmountHint();
  });

  riskWrap.addEventListener('click', function (e) {
    var chip = e.target.closest('.lg-chip');
    if (!chip) return;
    Array.prototype.forEach.call(riskWrap.querySelectorAll('.lg-chip'), function (c) {
      c.classList.remove('is-on');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('is-on');
    chip.setAttribute('aria-pressed', 'true');
  });

  document.getElementById('lgReset').addEventListener('click', function () {
    amountInput.value = '500000';
    termSelect.value = '365 天';
    riskWrap.querySelectorAll('.lg-chip').forEach(function (c) {
      var on = c.getAttribute('data-risk') === 'R3 平衡型';
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    paintAmountHint();
  });

  function syncRecap() {
    readForm();
    var money = fmtMoney(form.amount);
    var cn = toChineseAmount(form.amount);
    if (recapAmount) recapAmount.textContent = money;
    if (recapCn) recapCn.textContent = cn;
    if (recapTerm) recapTerm.textContent = form.term;
    if (recapRisk) recapRisk.textContent = form.risk;
    if (sheetAmount) sheetAmount.textContent = money;
    if (sheetCn) sheetCn.textContent = cn;
    if (sheetTerm) sheetTerm.textContent = form.term;
    if (sheetRisk) sheetRisk.textContent = form.risk;
  }

  /* ---------------- 层：sheet / 抽屉 / 条款 ---------------- */
  function anyLayerOpen() {
    return (sheet && sheet.classList.contains('active')) ||
      (drawer && drawer.classList.contains('active')) ||
      (modal && modal.classList.contains('active'));
  }
  function syncVeil() {
    if (!veil) return;
    veil.classList.toggle('active', anyLayerOpen());
  }

  function openSheet() {
    syncRecap();
    if (sheet) { sheet.classList.add('active'); sheet.setAttribute('aria-hidden', 'false'); }
    syncVeil();
    if (sheetOk) sheetOk.focus({ preventScroll: true });
  }
  function closeSheet() {
    if (!sheet) return;
    sheet.classList.remove('active');
    sheet.setAttribute('aria-hidden', 'true');
    syncVeil();
  }
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    syncVeil();
    var first = drawer.querySelector('.lg-menu-item');
    if (first) first.focus({ preventScroll: true });
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    syncVeil();
    var trigger = document.getElementById('lgOpenDrawer');
    if (trigger) trigger.focus({ preventScroll: true });
  }
  function openModal() {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    syncVeil();
    var btn = modal.querySelector('[data-lg-modal-close]');
    if (btn) btn.focus({ preventScroll: true });
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    syncVeil();
  }

  if (document.getElementById('lgOpenSheet')) {
    document.getElementById('lgOpenSheet').addEventListener('click', openSheet);
  }
  if (document.getElementById('lgSubmit')) {
    document.getElementById('lgSubmit').addEventListener('click', function () {
      readForm();
      setScene('confirm');
      openSheet();
    });
  }
  if (sheetBack) {
    sheetBack.addEventListener('click', function () {
      closeSheet();
      setScene('form');
    });
  }
  if (sheetOk) {
    sheetOk.addEventListener('click', function () {
      closeSheet();
      if (stateEl) stateEl.hidden = false;
      var badge = document.querySelector('.ledger-card .lg-badge');
      if (badge) badge.textContent = '已存根';
    });
  }
  if (document.getElementById('lgOpenDrawer')) {
    document.getElementById('lgOpenDrawer').addEventListener('click', openDrawer);
  }
  if (document.getElementById('lgOpenTerms')) {
    document.getElementById('lgOpenTerms').addEventListener('click', openModal);
  }

  if (drawer) {
    drawer.addEventListener('click', function (e) {
      var item = e.target.closest('[data-lg-menu]');
      if (!item) return;
      var kind = item.getAttribute('data-lg-menu');
      closeDrawer();
      if (kind === 'terms') { openModal(); }
      else if (kind === 'stubs') { setScene('confirm'); if (stateEl) stateEl.hidden = false; }
      else { setScene('confirm'); }
    });
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.hasAttribute('data-lg-modal-close')) closeModal();
    });
  }
  if (veil) {
    veil.addEventListener('click', function () {
      if (modal && modal.classList.contains('active')) { closeModal(); return; }
      if (sheet && sheet.classList.contains('active')) { closeSheet(); return; }
      if (drawer && drawer.classList.contains('active')) { closeDrawer(); }
    });
  }

  /* ---------------- 打开 / 关闭详情 ---------------- */
  function openApp() {
    app.classList.add('active');
    app.setAttribute('aria-hidden', 'false');
    document.body.classList.add('fs-locked');
    syncRecap();
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }
  function closeApp() {
    closeModal();
    closeSheet();
    if (drawer) { drawer.classList.remove('active'); drawer.setAttribute('aria-hidden', 'true'); }
    syncVeil();
    app.classList.remove('active');
    app.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('fs-locked');
    card.focus({ preventScroll: true });
  }

  card.addEventListener('click', openApp);
  if (closeBtn) closeBtn.addEventListener('click', closeApp);
  app.addEventListener('click', function (e) {
    if (e.target === app) closeApp();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !app.classList.contains('active')) return;
    if (modal && modal.classList.contains('active')) { closeModal(); return; }
    if (sheet && sheet.classList.contains('active')) { closeSheet(); return; }
    if (drawer && drawer.classList.contains('active')) { closeDrawer(); return; }
    closeApp();
  });

  // 初始：大写回显
  paintAmountHint();

})();
/* ==========================================================================
   通用隐藏入口密码门逻辑 — 所有彩蛋页面共用
   密码由各页面直接装在自己命名的字段里（如 window['design-PW'] = 'design2026'），
   字段名通过 #gate 上的 data-pw-field 声明，本脚本据此读取。
   ========================================================================== */
(function () {
  'use strict';

  var gate = document.getElementById('gate');
  if (!gate) return;

  // 密码来源：#gate 上 data-pw-field 声明的字段名，对应 window[字段名]
  var field = gate.getAttribute('data-pw-field') || 'GATE_PW';
  var pw = (typeof window[field] === 'string') ? window[field] : '';

  var input = document.getElementById('gatePw');
  var btn = document.getElementById('gateBtn');
  var msg = document.getElementById('gateMsg');

  function unlock() {
    document.body.classList.remove('gate-locked');
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
  }

  function tryUnlock() {
    if (!input) return;
    if (input.value === pw) {
      unlock();
    } else {
      if (msg) msg.textContent = '密码错误，请重试。';
      input.value = '';
      input.focus();
    }
  }

  // 来自首页弹窗的令牌（用户输入的密码经 base64 转发，由本页校验）
  if (location.hash && location.hash.length > 1) {
    try {
      var submitted = atob(decodeURIComponent(location.hash.slice(1)));
      // 清除令牌，避免地址栏 / 历史记录残留密码
      history.replaceState(null, '', location.pathname + location.search);
      if (submitted === pw) {
        unlock();
        return;
      }
      if (msg) msg.textContent = '密码错误，请重试。';
    } catch (e) {
      /* 非法令牌：当作无令牌处理 */
    }
  }

  if (input) input.focus();
  if (btn) btn.addEventListener('click', tryUnlock);
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });
  }
})();
