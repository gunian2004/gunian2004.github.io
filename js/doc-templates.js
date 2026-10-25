/* 开发文档模板台：渲染 docs 骨架、切换页面规模、复制 / 下载给 AI Agent。
   只保存形态、当前模板与两个项目资料字段，不存正文草稿。 */
(() => {
  'use strict';
  const KIT = window.DocTemplateKit;
  const STORAGE_KEY = 'work-hub.doc-templates.v2';
  const LEGACY_KEY = 'work-hub.doc-templates.v1';
  const MAX_BUNDLE = 200 * 1024;
  const state = { mode: 'multi', activeId: '', fields: { projectName: '', stack: '' } };
  const $ = id => document.getElementById(id);
  const status = $('dtStatus');
  if (!KIT || !status) return;

  let storageWarned = false;
  const mobileQuery = window.matchMedia('(max-width: 900px)');
  let navCollapsed = mobileQuery.matches;

  /* ---------- 纯函数 ---------- */
  function stackToken(value) {
    const first = String(value || '').split(/\s+[+＋]\s+|\s*[／/、,，|·]\s*/)[0].trim();
    const token = first
      .replace(/\s*v?\d+(\.\d+)*/gi, '')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, '')
      .slice(0, 12);
    return token || 'xxx';
  }

  function resolveTokens(text) {
    const map = { 项目名称: state.fields.projectName.trim(), 技术栈: state.fields.stack.trim() };
    return String(text).replace(/\{(项目名称|技术栈)\}/g, (match, key) => map[key] || match);
  }

  function resolvePath(text) {
    return String(text)
      .replace(/\{技术栈\}/g, stackToken(state.fields.stack))
      .replace(/\{项目名称\}/g, state.fields.projectName.trim() || '{项目名称}');
  }

  function filePath(item) {
    return resolvePath(item.path);
  }

  const itemsFor = mode => KIT.items.filter(item => item.modes.includes(mode));
  const itemById = id => KIT.items.find(item => item.id === id) || null;
  const bytesOf = text => new Blob([text]).size;

  function formatBytes(size) {
    return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`;
  }

  function sanitizeName(value) {
    return String(value || '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').trim().slice(0, 60);
  }

  /* ---------- 渲染 ---------- */
  function announce(message, error = false) {
    status.textContent = message;
    status.classList.toggle('dt-status-error', Boolean(error));
  }

  function renderChips() {
    const label = $('dtChipMode');
    const count = $('dtChipCount');
    if (label) label.textContent = `${KIT.modes[state.mode].label} 形态`;
    if (count) count.textContent = `${itemsFor(state.mode).length} 个位置`;
  }

  function renderMode() {
    document.querySelectorAll('.dt-mode-btn').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode));
    });
  }

  function parseTree(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const root = { name: lines[0], children: [] };
    const stack = [root];
    for (const line of lines.slice(1)) {
      const prefix = line.match(/^((?:│   |    )*)/)[1];
      const depth = prefix.length / 4;
      const name = line.slice(prefix.length).replace(/^[├└]── /, '');
      const node = { name, folder: name.endsWith('/'), children: [] };
      while (stack.length > depth + 1) stack.pop();
      stack[depth].children.push(node);
      if (node.folder) {
        stack[depth + 1] = node;
        stack.length = depth + 2;
      } else {
        stack.length = depth + 1;
      }
    }
    return root;
  }

  function treeList(nodes) {
    const list = document.createElement('ul');
    list.className = 'dt-fs';
    for (const node of nodes) {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.className = node.folder ? 'dt-fs-folder' : 'dt-fs-file';
      name.textContent = node.name;
      item.append(name);
      if (node.children.length) item.append(treeList(node.children));
      list.append(item);
    }
    return list;
  }

  function renderTree() {
    const host = $('dtTree');
    const parsed = parseTree(resolvePath(KIT.trees[state.mode]));
    const root = document.createElement('p');
    root.className = 'dt-fs-root';
    root.textContent = parsed.name;
    host.replaceChildren(root, treeList(parsed.children));
  }

  function renderRules() {
    const list = $('dtRules');
    const frag = document.createDocumentFragment();
    for (const rule of KIT.rules) {
      const li = document.createElement('li');
      const title = document.createElement('b');
      title.textContent = rule.title;
      const text = document.createElement('span');
      text.textContent = rule.text;
      li.append(title, text);
      frag.append(li);
    }
    list.replaceChildren(frag);
  }

  function renderNav() {
    const wrap = $('dtNav');
    const frag = document.createDocumentFragment();
    for (const group of KIT.groups) {
      const items = itemsFor(state.mode).filter(item => item.group === group.id);
      if (!items.length) continue;
      const box = document.createElement('div');
      box.className = 'dt-group';
      const title = document.createElement('h3');
      title.className = 'dt-group-title';
      title.textContent = group.label;
      const count = document.createElement('span');
      count.className = 'dt-group-count';
      count.textContent = String(items.length);
      title.append(count);
      const list = document.createElement('ul');
      list.className = 'dt-list';
      for (const item of items) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dt-doc';
        button.dataset.id = item.id;
        if (item.id === state.activeId) button.setAttribute('aria-current', 'true');
        const path = document.createElement('span');
        path.className = 'dt-doc-path';
        path.textContent = filePath(item);
        const purpose = document.createElement('span');
        purpose.className = 'dt-doc-purpose';
        purpose.textContent = item.purpose;
        button.append(path, purpose);
        button.addEventListener('click', () => select(item.id));
        li.append(button);
        list.append(li);
      }
      box.append(title, list);
      frag.append(box);
    }
    wrap.replaceChildren(frag);
  }

  function paintSkeleton(host, text) {
    const lines = text.split('\n');
    const frag = document.createDocumentFragment();
    lines.forEach((line, index) => {
      const span = document.createElement('span');
      const tone = line.startsWith('### ') ? 'dt-l3'
        : line.startsWith('## ') ? 'dt-l2'
          : line.startsWith('# ') ? 'dt-l1'
            : line.startsWith('> ') ? 'dt-quote'
              : line.startsWith('|') ? 'dt-table'
                : '';
      if (tone) span.className = tone;
      span.textContent = index < lines.length - 1 ? `${line}\n` : line;
      frag.append(span);
    });
    host.replaceChildren(frag);
  }

  function renderDetail() {
    const item = itemById(state.activeId);
    if (!item) return;
    const skeleton = resolveTokens(item.skeleton);
    const path = filePath(item);
    $('dtDetailPath').textContent = path;
    $('dtDetailTitle').textContent = item.title;
    $('dtDetailPurpose').textContent = item.purpose;
    $('dtMetaWhen').textContent = item.when;
    $('dtMetaRef').textContent = item.refs;
    $('dtSkeleton').setAttribute('aria-label', `模板骨架：${item.title}`);
    paintSkeleton($('dtSkeleton'), skeleton);
    const missing = [...new Set([...(skeleton + path).matchAll(/\{(项目名称|技术栈)\}/g)].map(match => match[1]))];
    const hint = $('dtHint');
    if (missing.length) {
      hint.hidden = false;
      hint.textContent = `还没填 ${missing.join('、')}：复制和下载会原样保留 {${missing.join('}、{')}} 占位符。`;
    } else {
      hint.hidden = true;
      hint.textContent = '';
    }
  }

  function renderNaming() {
    $('dtNamingChange').textContent = state.mode === 'multi'
      ? 'design / tasks / spec 各一份，只追加不修改'
      : 'docs/变更记录.md 一份，统一记录三份文档的变更';
  }

  function render() {
    renderMode();
    renderChips();
    renderNaming();
    renderTree();
    renderNav();
    renderDetail();
    applyNav();
  }

  /* ---------- 交互 ---------- */
  function applyNav() {
    const collapsed = mobileQuery.matches && navCollapsed;
    $('dtNavPanel').hidden = collapsed;
    $('dtNavToggle').setAttribute('aria-expanded', String(!collapsed));
    const item = itemById(state.activeId);
    $('dtNavCurrent').textContent = item ? filePath(item) : '选择模板';
  }

  function markCurrent() {
    document.querySelectorAll('.dt-doc').forEach(button => {
      if (button.dataset.id === state.activeId) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  function select(id) {
    if (!itemById(id)) return;
    state.activeId = id;
    markCurrent();
    renderDetail();
    if (mobileQuery.matches) navCollapsed = true;
    applyNav();
    saveState();
    if (mobileQuery.matches) {
      $('dtDetail').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function setMode(mode) {
    if (!KIT.modes[mode] || mode === state.mode) return;
    const visible = itemsFor(mode);
    state.mode = mode;
    if (!visible.some(item => item.id === state.activeId)) {
      const current = itemById(state.activeId);
      const sibling = current && current.pair
        ? KIT.items.find(entry => entry.id !== current.id && entry.pair === current.pair && entry.modes.includes(mode))
        : null;
      state.activeId = sibling ? sibling.id : visible[0].id;
    }
    render();
    saveState();
    announce(`已切换到「${KIT.modes[mode].label}」，共 ${visible.length} 个位置。`);
  }

  function onFieldInput() {
    state.fields.projectName = $('dtProjectName').value;
    state.fields.stack = $('dtStack').value;
    renderTree();
    renderNav();
    renderDetail();
    saveState();
  }

  /* ---------- 复制 / 下载 ---------- */
  async function copyText(text, button) {
    if (window.BlogStudio) return window.BlogStudio.copy(text, button);
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        window.BlogStudio?.notify('已复制到剪贴板');
        return true;
      } catch { return false; }
    }
    return false;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadText(text, filename) {
    downloadBlob(new Blob([text], { type: 'text/markdown;charset=utf-8' }), filename);
  }

  async function copyCurrent() {
    const item = itemById(state.activeId);
    if (!item) return;
    const text = resolveTokens(item.skeleton);
    const path = filePath(item);
    if (await copyText(text, $('dtCopy'))) {
      announce(`已复制 ${path}（${formatBytes(bytesOf(text))}）`);
    } else {
      downloadText(text, path.split('/').pop());
      announce(`剪贴板不可用，已改为下载 ${path.split('/').pop()}`);
    }
  }

  async function copyTree() {
    const text = resolvePath(KIT.trees[state.mode]);
    const target = $('dtTreeStatus');
    if (await copyText(text, $('dtCopyTree'))) {
      target.textContent = '目录结构已复制';
      target.classList.remove('dt-status-error');
    } else {
      downloadText(text, 'docs-目录结构.txt');
      target.textContent = '剪贴板不可用，已改为下载目录结构';
      target.classList.add('dt-status-error');
    }
  }

  function bundleText() {
    const items = itemsFor(state.mode);
    const name = state.fields.projectName.trim() || '{项目名称}';
    const rules = KIT.rules.map((rule, index) => `${index + 1}. ${rule.title}：${rule.text}`).join('\n');
    const head = `# ${name} · 文档骨架（${items.length} 份 · ${KIT.modes[state.mode].label}）\n\n` +
      '> 按路径建文件，只补内容、不改标题结构；不确定的事实写「待确认」，不要编造。\n\n' +
      `## 文档规则\n${rules}\n\n`;
    const body = items.map((item, index) => {
      return `===== 文件 ${index + 1}/${items.length}：${filePath(item)} =====\n${resolveTokens(item.skeleton)}`;
    }).join('\n\n');
    return `${head}${body}\n`;
  }

  async function copyAll() {
    const text = bundleText();
    if (bytesOf(text) > MAX_BUNDLE) {
      announce('整套模板超过 200 KB，请改用 ZIP 下载。', true);
      return;
    }
    if (await copyText(text, $('dtCopyAll'))) {
      announce(`已复制 ${itemsFor(state.mode).length} 份骨架（${formatBytes(bytesOf(text))}）`);
    } else {
      downloadText(text, 'docs-模板骨架.md');
      announce('剪贴板不可用，已改为下载 docs-模板骨架.md');
    }
  }

  function downloadCurrent() {
    const item = itemById(state.activeId);
    if (!item) return;
    const name = filePath(item).split('/').pop();
    downloadText(resolveTokens(item.skeleton), name);
    announce(`已下载 ${name}`);
  }

  /* ---------- ZIP（store 模式，UTF-8 文件名 + 目录条目） ---------- */
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function zipStore(entries) {
    const encoder = new TextEncoder();
    const parts = [];
    const central = [];
    const dosDate = ((2026 - 1980) << 9) | (10 << 5) | 25;
    let offset = 0;
    let centralSize = 0;
    for (const entry of entries) {
      const name = encoder.encode(entry.name);
      const data = encoder.encode(entry.text || '');
      const crc = crc32(data);
      const local = new Uint8Array(30);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0x0800, true);
      lv.setUint16(12, dosDate, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, name.length, true);
      parts.push(local, name, data);
      const folder = new Uint8Array(46);
      const cv = new DataView(folder.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(14, dosDate, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint32(42, offset, true);
      central.push(folder, name);
      centralSize += 46 + name.length;
      offset += 30 + name.length + data.length;
    }
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  }

  function folderEntries(paths) {
    const folders = new Set();
    for (const path of paths) {
      const segments = path.split('/');
      segments.pop();
      let current = '';
      for (const segment of segments) {
        current += `${segment}/`;
        folders.add(current);
      }
    }
    return [...folders].sort().map(name => ({ name, text: '' }));
  }

  function downloadZip() {
    try {
      const items = itemsFor(state.mode);
      const files = items.map(item => ({ name: filePath(item), text: resolveTokens(item.skeleton) }));
      const entries = [...folderEntries(files.map(file => file.name)), ...files];
      const base = sanitizeName(state.fields.projectName) || 'project';
      const filename = `${base}-docs-骨架-${state.mode}.zip`;
      downloadBlob(zipStore(entries), filename);
      announce(`已导出 ${files.length} 份骨架：${filename}`);
    } catch (error) {
      announce(`ZIP 生成失败：${error.message}`, true);
    }
  }

  /* ---------- 存储 ---------- */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 2,
        mode: state.mode,
        activeId: state.activeId,
        projectName: state.fields.projectName,
        stack: state.fields.stack
      }));
      storageWarned = false;
    } catch {
      if (storageWarned) return;
      storageWarned = true;
      announce('本浏览器无法保存项目资料，刷新后需要重填。', true);
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || data.version !== 2) return;
      if (data.mode && KIT.modes[data.mode]) state.mode = data.mode;
      if (typeof data.projectName === 'string') state.fields.projectName = data.projectName.slice(0, 60);
      if (typeof data.stack === 'string') state.fields.stack = data.stack.slice(0, 60);
      if (itemsFor(state.mode).some(item => item.id === data.activeId)) state.activeId = data.activeId;
    } catch { /* 存储损坏时退回默认值 */ }
  }

  function migrateV1() {
    let raw = null;
    try {
      raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const drafts = data && data.drafts;
      if (drafts && typeof drafts === 'object') {
        for (const draft of Object.values(drafts)) {
          const fields = draft && draft.fields;
          if (!fields) continue;
          if (!state.fields.projectName && typeof fields.projectName === 'string') state.fields.projectName = fields.projectName.slice(0, 60);
          if (!state.fields.stack && typeof fields.techStack === 'string') state.fields.stack = fields.techStack.slice(0, 60);
        }
      }
      localStorage.removeItem(LEGACY_KEY);
    } catch { /* 旧草稿格式不认识就直接放弃，不影响新页面 */ }
  }

  /* ---------- 启动 ---------- */
  function bind() {
    document.querySelectorAll('.dt-mode-btn').forEach(button => {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    });
    $('dtProjectName').addEventListener('input', onFieldInput);
    $('dtStack').addEventListener('input', onFieldInput);
    $('dtCopy').addEventListener('click', copyCurrent);
    $('dtCopyTree').addEventListener('click', copyTree);
    $('dtCopyAll').addEventListener('click', copyAll);
    $('dtZip').addEventListener('click', downloadZip);
    $('dtDownload').addEventListener('click', downloadCurrent);
    $('dtNavToggle').addEventListener('click', () => {
      navCollapsed = !navCollapsed;
      applyNav();
    });
    mobileQuery.addEventListener('change', () => {
      navCollapsed = mobileQuery.matches;
      applyNav();
    });
  }

  function init() {
    loadState();
    migrateV1();
    if (!itemsFor(state.mode).some(item => item.id === state.activeId)) {
      state.activeId = itemsFor(state.mode)[0].id;
    }
    $('dtProjectName').value = state.fields.projectName;
    $('dtStack').value = state.fields.stack;
    renderRules();
    bind();
    render();
    saveState();
    if (KIT.problems && KIT.problems.length) {
      announce(`模板数据校验失败 ${KIT.problems.length} 项，详见浏览器控制台。`, true);
    }
  }

  init();
})();
