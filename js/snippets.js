/* 命令仅展示与复制；用户文本只通过 textContent/value 进入 DOM。 */
(() => {
  'use strict';
  const STORAGE_KEY = 'work-hub.snippets.v1';
  const MAX_BYTES = 1024 * 1024;
  const MAX_CUSTOM = 200;
  const CATEGORIES = ['Git', 'Docker', 'PowerShell', 'SQL', 'JavaScript', 'Python', '其他'];
  const builtins = [
    ['git-status', '工作区状态与改动概览', 'Git', '提交前先检查分支、暂存区及尚未暂存的改动。以下命令只读。', ['提交前', '只读'], 'git status --short --branch\ngit diff --stat\ngit diff --cached --stat'],
    ['git-history', '查看最近提交', 'Git', '按图形查看最近 20 条提交，定位分支关系。', ['历史', '只读'], 'git log --oneline --graph --decorate -20'],
    ['git-branch', '检查分支与远端跟踪', 'Git', '查看本地分支、远端地址及跟踪状态，不修改远端配置。', ['分支', '远端', '只读'], 'git branch -vv\ngit remote -v'],
    ['git-file', '追踪单个文件的历史', 'Git', '路径含空格时保留引号；参数中的引号和特殊字符仍需手动核对。', ['历史', '文件'], 'git log --follow --oneline -- "{{file_path}}"\ngit diff -- "{{file_path}}"'],
    ['docker-ps', '查看容器与资源占用', 'Docker', '列出全部容器，再采集一次运行中容器的资源统计。', ['容器', '只读'], 'docker ps -a\ndocker stats --no-stream'],
    ['docker-logs', '查看容器近期日志', 'Docker', '只读取最近 30 分钟的 100 行日志；日志可能包含敏感信息，分享前检查。', ['日志', '只读'], 'docker logs --since 30m --tail 100 "{{container}}"'],
    ['docker-compose', '核对 Compose 配置', 'Docker', '验证配置并查看服务状态；配置输出可能包含已展开的环境变量。', ['Compose', '检查'], 'docker compose config --quiet\ndocker compose ps'],
    ['powershell-port', '查找监听端口与进程', 'PowerShell', 'Windows PowerShell：先填写数字端口；只查看监听连接，不结束进程。', ['网络', 'Windows', '只读'], 'Get-NetTCPConnection -State Listen -LocalPort {{port}} |\n  Select-Object LocalAddress, LocalPort, OwningProcess'],
    ['powershell-hash', '计算文件 SHA-256', 'PowerShell', '使用 LiteralPath 按字面路径读取文件，适合校验下载文件或备份。', ['校验', '文件', '只读'], 'Get-FileHash -Algorithm SHA256 -LiteralPath "{{file_path}}"'],
    ['powershell-large', '查找目录中最大的文件', 'PowerShell', '仅遍历指定目录并列出前 10 个大文件；大目录可能耗时，不删除任何内容。', ['磁盘', '只读'], 'Get-ChildItem -LiteralPath "{{directory}}" -File -Recurse -ErrorAction SilentlyContinue |\n  Sort-Object Length -Descending |\n  Select-Object -First 10 FullName, Length'],
    ['sql-duplicates', '定位重复业务键', 'SQL', '只读聚合查询。表名、字段名必须来自可信标识符，并按数据库方言核对。', ['质量检查', '只读'], 'SELECT {{column_name}}, COUNT(*) AS duplicate_count\nFROM {{table_name}}\nGROUP BY {{column_name}}\nHAVING COUNT(*) > 1;'],
    ['sql-preview', '预览满足条件的数据', 'SQL', '适用于 PostgreSQL / SQLite / MySQL。先看数据再考虑修改；外部输入应绑定参数。', ['查询', '只读'], 'SELECT *\nFROM {{table_name}}\nORDER BY {{id_column}}\nLIMIT 20;'],
    ['js-query', '安全构建 URL 查询参数', 'JavaScript', '使用 URLSearchParams 编码查询值，避免手工拼接。示例只构造 URL，不发送请求。', ['URL', '编码'], 'const url = new URL("https://example.com/search");\nurl.search = new URLSearchParams({ q: "{{keyword}}", page: "1" }).toString();\nconsole.log(url.href);'],
    ['js-json', '解析 JSON 并检查对象形状', 'JavaScript', '捕获语法错误，并排除 null 与数组。后续仍应按业务校验各字段类型。', ['JSON', '校验'], 'function parseObject(text) {\n  try {\n    const value = JSON.parse(text);\n    if (value === null || typeof value !== "object" || Array.isArray(value)) {\n      return { ok: false, error: "需要 JSON 对象" };\n    }\n    return { ok: true, value };\n  } catch {\n    return { ok: false, error: "JSON 格式无效" };\n  }\n}'],
    ['python-json', '读取 UTF-8 JSON 文件', 'Python', '捕获文件、编码和 JSON 错误。只读本地文件，不自动写回。', ['文件', 'JSON'], 'import json\nfrom pathlib import Path\n\ntry:\n    data = json.loads(Path("{{file_path}}").read_text(encoding="utf-8"))\n    print(json.dumps(data, ensure_ascii=False, indent=2))\nexcept (OSError, UnicodeError, json.JSONDecodeError) as exc:\n    print(f"读取失败：{exc}")'],
    ['python-count', '统计 CSV 行数', 'Python', '正确处理 CSV 引号与 UTF-8 BOM；逐行统计，避免一次性加载全部数据。', ['CSV', '只读'], 'import csv\nfrom pathlib import Path\n\ntry:\n    with Path("{{file_path}}").open(encoding="utf-8-sig", newline="") as stream:\n        reader = csv.reader(stream)\n        header = next(reader, None)\n        count = sum(1 for _ in reader)\n    print(f"表头：{header}\\n数据行：{count}")\nexcept (OSError, UnicodeError, csv.Error) as exc:\n    print(f"统计失败：{exc}")']
  ].map(([id, title, category, description, tags, code]) => ({ id: `builtin-${id}`, title, category, description, tags, code }));
  const builtinIds = new Set(builtins.map(item => item.id));
  const $ = id => document.getElementById(id);
  const status = $('snippetStatus');
  if (!status) return;
  let state = { schemaVersion: 1, snippets: [], favorites: [] };
  let editingId = null;
  let previewItem = null;
  let pendingImport = null;
  let importBusy = false;
  const textBytes = text => new TextEncoder().encode(text).length;
  const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
  const validString = (value, min, max) => typeof value === 'string' && value.length >= min && value.length <= max && (min === 0 || value.trim().length > 0);
  function validate(data) {
    if (!plainObject(data) || data.schemaVersion !== 1 || !Array.isArray(data.snippets) || !Array.isArray(data.favorites)) throw new Error('备份需包含 schemaVersion: 1、snippets 数组与 favorites 数组。');
    if (data.snippets.length > MAX_CUSTOM || data.favorites.length > MAX_CUSTOM + builtins.length) throw new Error('数量超限：最多 200 条自定义片段，收藏数量不得超过片段总上限。');
    const ids = new Set();
    const snippets = data.snippets.map(item => {
      if (!plainObject(item) || typeof item.id !== 'string' || !/^custom-[a-zA-Z0-9_-]{1,80}$/.test(item.id) || ids.has(item.id) || !validString(item.title, 1, 100) || !CATEGORIES.includes(item.category) || !validString(item.description, 1, 1000) || !validString(item.code, 1, 20000) || !Array.isArray(item.tags) || item.tags.length > 10 || !item.tags.every(tag => validString(tag, 1, 30))) throw new Error('片段字段无效、ID 重复或文本过长；请检查备份格式。');
      ids.add(item.id);
      return { id: item.id, title: item.title, category: item.category, description: item.description, tags: [...item.tags], code: item.code };
    });
    const favorites = [];
    const favoriteIds = new Set();
    for (const id of data.favorites) {
      if (typeof id !== 'string' || (!builtinIds.has(id) && !ids.has(id)) || favoriteIds.has(id)) throw new Error('收藏含重复或不存在的片段 ID。');
      favoriteIds.add(id);
      favorites.push(id);
    }
    return { schemaVersion: 1, snippets, favorites };
  }
  function announce(message) { status.textContent = message; window.BlogStudio?.notify(message); }
  function commit(next, message) {
    try {
      next = validate(next);
      const json = JSON.stringify(next);
      if (textBytes(json) > MAX_BYTES) throw new Error('本地数据超过 1 MiB，请减少片段或代码长度。');
      localStorage.setItem(STORAGE_KEY, json);
      state = next;
      render();
      announce(message);
      return true;
    } catch (error) { announce(`未保存：${error.message || '浏览器存储不可用或空间不足。'} 现有数据未变更，请先导出备份。`); return false; }
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      if (textBytes(saved) > MAX_BYTES) throw new Error('数据超过 1 MiB 限制');
      state = validate(JSON.parse(saved));
    }
  } catch { status.textContent = '无法读取本地片段（存储受限或数据格式异常）。已显示内置库；原存储未改动。保存新内容会替换异常数据，可先导出当前可用内容。'; }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(text, className, action) {
    const node = element('button', className, text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }
  function allItems() { return [...builtins, ...state.snippets]; }
  function render() {
    const query = $('snippetSearch').value.trim().toLocaleLowerCase();
    const category = $('snippetCategory').value;
    const onlyFavorites = $('snippetFavorites').checked;
    const favorites = new Set(state.favorites);
    const items = allItems().filter(item => (category === 'all' || item.category === category) && (!onlyFavorites || favorites.has(item.id)) && [item.title, item.description, item.category, item.tags.join(' '), item.code].join('\n').toLocaleLowerCase().includes(query));
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      const custom = !builtinIds.has(item.id);
      const card = element('article', 'card snippet-card');
      const meta = element('div', 'card-meta', `${item.category} / ${custom ? '自定义' : '内置'}`);
      const title = element('h3', '', item.title);
      const description = element('p', 'snippet-note', item.description);
      const chips = element('div', 'chips');
      item.tags.forEach(tag => chips.append(element('span', 'chip', tag)));
      const pre = element('pre', 'code-block');
      pre.append(element('code', '', item.code));
      const actions = element('div', 'card-actions');
      const favorite = button(favorites.has(item.id) ? '★ 已收藏' : '☆ 收藏', 'chip', () => {
        const next = state.favorites.includes(item.id) ? state.favorites.filter(id => id !== item.id) : [...state.favorites, item.id];
        commit({ ...state, favorites: next }, next.includes(item.id) ? '已加入收藏。' : '已取消收藏。');
      });
      favorite.setAttribute('aria-pressed', String(favorites.has(item.id)));
      favorite.setAttribute('aria-label', `${favorites.has(item.id) ? '取消收藏' : '收藏'}：${item.title}`);
      actions.append(button('填参 / 预览', 'btn', () => openPreview(item)), favorite);
      if (custom) {
        actions.append(button('编辑', 'btn secondary', () => openEditor(item)), button('删除', 'btn secondary danger', () => {
          if (window.confirm(`确认删除自定义片段“${item.title}”？删除后不可撤销。`)) commit({ ...state, snippets: state.snippets.filter(row => row.id !== item.id), favorites: state.favorites.filter(id => id !== item.id) }, '已删除自定义片段。');
        }));
      }
      card.append(meta, title, description, chips, pre, actions);
      fragment.append(card);
    }
    $('snippetGrid').replaceChildren(fragment);
    $('snippetEmpty').hidden = items.length > 0;
    $('snippetCount').textContent = `显示 ${items.length} / ${allItems().length} 条 · ${state.favorites.length} 条收藏 · ${state.snippets.length} 条自定义`;
  }
  function openEditor(item = null) {
    editingId = item?.id || null;
    $('snippetEditorForm').reset();
    $('snippetEditorTitle').textContent = item ? '编辑自定义片段' : '新增片段';
    $('editorStatus').textContent = '';
    if (item) {
      $('editTitle').value = item.title;
      $('editCategory').value = item.category;
      $('editDescription').value = item.description;
      $('editTags').value = item.tags.join(', ');
      $('editCode').value = item.code;
    }
    $('snippetEditor').showModal();
  }
  $('snippetEditorForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!editingId && state.snippets.length >= MAX_CUSTOM) { $('editorStatus').textContent = '最多保存 200 条自定义片段，请先整理或导出。'; return; }
    const item = {
      id: editingId || `custom-${window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`,
      title: $('editTitle').value.trim(), category: $('editCategory').value,
      description: $('editDescription').value.trim(), tags: $('editTags').value.split(',').map(tag => tag.trim()).filter(Boolean), code: $('editCode').value
    };
    const next = { ...state, snippets: editingId ? state.snippets.map(row => row.id === editingId ? item : row) : [...state.snippets, item] };
    try { validate(next); } catch (error) { $('editorStatus').textContent = error.message; return; }
    if (commit(next, '片段已保存到当前浏览器。')) $('snippetEditor').close();
    else $('editorStatus').textContent = status.textContent;
  });
  function openPreview(item) {
    previewItem = item;
    $('previewTitle').textContent = item.title;
    $('previewDescription').textContent = item.description;
    $('previewOriginal').textContent = item.code;
    $('previewCode').textContent = item.code;
    $('previewStatus').textContent = '';
    const names = [...new Set([...item.code.matchAll(/\{\{([A-Za-z][A-Za-z0-9_]{0,39})\}\}/g)].map(match => match[1]))];
    const fragment = document.createDocumentFragment();
    names.forEach((name, index) => {
      const label = element('label', '', name);
      const input = element('input', 'field');
      input.type = 'text'; input.maxLength = 2000; input.id = `snippet-param-${index}`; input.dataset.parameter = name;
      input.placeholder = `填写 ${name}`; input.autocomplete = 'off'; input.spellcheck = false;
      input.addEventListener('input', updatePreview);
      label.append(input); fragment.append(label);
    });
    $('parameterFields').replaceChildren(fragment);
    if (!names.length) $('parameterFields').append(element('p', 'snippet-note', '此片段无需填写参数，可直接核对并复制。'));
    $('snippetPreview').showModal();
  }
  function updatePreview() {
    if (!previewItem) return;
    const values = new Map([...$('parameterFields').querySelectorAll('input')].map(input => [input.dataset.parameter, input.value]));
    $('previewCode').textContent = previewItem.code.replace(/\{\{([A-Za-z][A-Za-z0-9_]{0,39})\}\}/g, (match, name) => values.get(name) || match);
    const unresolved = [...values.values()].some(value => value === '');
    $('previewStatus').textContent = unresolved ? '仍有参数未填写；复制预览将保留这些占位符。' : '参数已填入。执行前仍需核对转义、引号与环境。';
  }
  async function copyText(text, control) {
    if (typeof window.BlogStudio?.copy === 'function') {
      const copied = await window.BlogStudio.copy(text, control);
      if (!copied) $('previewStatus').textContent = '复制失败，请在代码框中选中文本手动复制。';
    } else $('previewStatus').textContent = '复制服务不可用，请选中文本手动复制。';
  }
  $('copyOriginal').addEventListener('click', event => copyText($('previewOriginal').textContent, event.currentTarget));
  $('copyPreview').addEventListener('click', event => {
    if (/\{\{[A-Za-z][A-Za-z0-9_]{0,39}\}\}/.test($('previewCode').textContent) && !window.confirm('预览仍含未填写的占位参数，确认按当前内容复制？')) return;
    copyText($('previewCode').textContent, event.currentTarget);
  });
  $('snippetAdd').addEventListener('click', () => openEditor());
  $('snippetSearch').addEventListener('input', render);
  $('snippetCategory').addEventListener('change', render);
  $('snippetFavorites').addEventListener('change', render);
  $('snippetReset').addEventListener('click', () => { $('snippetSearch').value = ''; $('snippetCategory').value = 'all'; $('snippetFavorites').checked = false; render(); $('snippetSearch').focus(); });
  document.querySelectorAll('[data-close]').forEach(control => control.addEventListener('click', () => $(control.dataset.close).close()));
  $('snippetExport').addEventListener('click', () => {
    let url;
    try {
      const blob = new Blob([JSON.stringify(state)], { type: 'application/json;charset=utf-8' });
      if (blob.size > MAX_BYTES) throw new Error('导出内容超过 1 MiB，请先减少数据。');
      url = URL.createObjectURL(blob);
      const link = element('a'); link.href = url; link.download = `work-snippets-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link); link.click(); link.remove();
      announce('已请求下载 JSON 备份，包含自定义片段和全部收藏。');
    } catch (error) { announce(`导出失败：${error.message}`); }
    finally { if (url) setTimeout(() => URL.revokeObjectURL(url), 1000); }
  });
  $('snippetImport').addEventListener('click', () => { if (!importBusy) $('snippetFile').click(); });
  $('snippetFile').addEventListener('change', async event => {
    const file = event.target.files[0]; event.target.value = '';
    if (!file || importBusy) return;
    importBusy = true; $('snippetImport').disabled = true;
    try {
      if (file.size > MAX_BYTES) throw new Error('文件不得超过 1 MiB。');
      const text = await file.text();
      if (textBytes(text) > MAX_BYTES) throw new Error('文件不得超过 1 MiB。');
      pendingImport = validate(JSON.parse(text));
      $('snippetImportForm').reset(); $('importStatus').textContent = '';
      $('importSummary').textContent = `校验通过：${pendingImport.snippets.length} 条自定义片段，${pendingImport.favorites.length} 条收藏。当前有 ${state.snippets.length} 条自定义片段。请选择处理方式，再确认。`;
      $('snippetImportDialog').showModal();
    } catch (error) { pendingImport = null; announce(`未导入：${error instanceof SyntaxError ? 'JSON 格式无效。' : error.message}`); }
    finally { importBusy = false; $('snippetImport').disabled = false; }
  });
  $('snippetImportDialog').addEventListener('close', () => { pendingImport = null; });
  $('snippetImportForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!pendingImport) return;
    const mode = new FormData(event.currentTarget).get('importMode');
    let next = pendingImport;
    if (mode === 'merge') {
      const merged = new Map(state.snippets.map(item => [item.id, item]));
      pendingImport.snippets.forEach(item => merged.set(item.id, item));
      next = { schemaVersion: 1, snippets: [...merged.values()], favorites: [...new Set([...state.favorites, ...pendingImport.favorites])] };
    } else if (mode !== 'replace') return;
    try { validate(next); } catch (error) { $('importStatus').textContent = error.message; return; }
    if (commit(next, mode === 'merge' ? '已合并片段与收藏。' : '已用备份覆盖自定义片段与收藏。')) $('snippetImportDialog').close();
    else $('importStatus').textContent = status.textContent;
  });
  render();
})();
