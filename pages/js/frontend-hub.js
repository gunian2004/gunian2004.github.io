/* 规范库首页：密码门（复用通用逻辑） */
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

  var storageKey = 'frontend-style-library:authenticated';
  var forcePasswordPrompt = false;
  try {
    var currentUrl = new URL(window.location.href);
    forcePasswordPrompt = currentUrl.searchParams.get('requirePassword') === '1';
    if (forcePasswordPrompt) {
      currentUrl.searchParams.delete('requirePassword');
      window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
      try {
        window.sessionStorage.removeItem(storageKey);
      } catch (error) {
        // The password gate remains visible even when session storage is unavailable.
      }
    }
  } catch (error) {
    // If URL parsing is unavailable, preserve the regular password-gate behavior.
  }

  function unlock() {
    document.body.classList.remove('gate-locked');
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
  }

  function hasSessionUnlock() {
    try {
      return window.sessionStorage.getItem(storageKey) === '1';
    } catch (error) {
      return false;
    }
  }

  function rememberSessionUnlock() {
    try {
      window.sessionStorage.setItem(storageKey, '1');
    } catch (error) {
      // If session storage is unavailable, keep the existing per-load gate behavior.
    }
  }
  function tryUnlock() {
    if (!input) return;
    if (input.value === pw) {
      rememberSessionUnlock();
      unlock();
    } else {
      if (msg) msg.textContent = '密码错误，请重试。';
      input.value = '';
      input.focus();
    }
  }

  if (!forcePasswordPrompt && hasSessionUnlock()) {
    unlock();
    return;
  }
  if (input) input.focus();
  if (btn) btn.addEventListener('click', tryUnlock);
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });
  }
})();
