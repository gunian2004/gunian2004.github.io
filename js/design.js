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
