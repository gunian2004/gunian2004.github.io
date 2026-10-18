(() => {
  'use strict';
  const sidebar = document.querySelector('.tool-sidebar');
  const cards = [...document.querySelectorAll('.tool-card')];
  const links = [...document.querySelectorAll('.tool-nav-item')];
  const search = document.getElementById('toolSearch');
  const picker = document.getElementById('toolSelect');
  if (!sidebar || !cards.length) return;
  let category = '全部';
  function selectTool(id, updateHash = true) {
    if (!cards.some(card => card.id === id)) return;
    cards.forEach(card => { card.hidden = card.id !== id; card.classList.toggle('is-selected', card.id === id); });
    links.forEach(link => { if (link.dataset.tool === id) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
    picker.value = id;
    try { localStorage.setItem('blog:last-tool', id); } catch (_) {}
    if (updateHash) history.replaceState(null, '', '#' + id);
  }
  function filterTools() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    links.forEach(link => {
      const card = document.getElementById(link.dataset.tool);
      const match = (category === '全部' || card.dataset.category === category) && (link.textContent + card.querySelector('.tool-panel-heading').textContent).toLocaleLowerCase().includes(query);
      link.hidden = !match;
      picker.querySelector('[value="' + card.id + '"]').hidden = !match;
      if (match) count++;
    });
    document.getElementById('toolCount').textContent = count + ' / ' + cards.length + ' TOOLS';
    document.getElementById('toolEmpty').hidden = count > 0;
    document.getElementById('clearToolSearch').hidden = !search.value;
    sidebar.classList.toggle('has-search', Boolean(query) || category !== '全部');
  }
  links.forEach(link => link.addEventListener('click', () => selectTool(link.dataset.tool)));
  picker.addEventListener('change', () => selectTool(picker.value));
  search.addEventListener('input', filterTools);
  document.querySelectorAll('[data-category].tool-categories button, .tool-categories button').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.category;
    document.querySelectorAll('.tool-categories button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterTools();
  }));
  document.getElementById('clearToolSearch').addEventListener('click', () => { search.value = ''; filterTools(); search.focus(); });
  document.getElementById('resetToolFilters').addEventListener('click', () => {
    search.value = ''; category = '全部';
    document.querySelectorAll('.tool-categories button').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.category === category)));
    filterTools();
  });
  function showView(card, view) {
    const split = card.querySelector('.workspace-split');
    if (!split) return;
    split.dataset.view = view;
    card.querySelectorAll('[data-view]').forEach(button => { if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.view === String(view))); });
  }
  document.querySelectorAll('.workspace-view-switch').forEach(control => {
    control.hidden = false;
    control.addEventListener('click', event => {
      const button = event.target.closest('button[data-view]');
      if (button) showView(control.closest('.tool-card'), button.dataset.view);
    });
  });
  // Switch only after an explicit operation; live typing keeps the editor in view.
  const resultActions = /^(jsonFormat|jsonMinify|base64Encode|base64Decode|urlEncode|urlDecode|erRefreshPreview|erAddSampleData|jsonToYaml|yamlToJson|translateText)\(/;
  document.addEventListener('click', event => {
    const button = event.target.closest('button[onclick]');
    if (!button || !resultActions.test(button.getAttribute('onclick'))) return;
    const card = button.closest('.tool-card');
    if (!card) return;
    requestAnimationFrame(() => {
      if (matchMedia('(max-width: 760px)').matches) showView(card, button.getAttribute('onclick').startsWith('yamlToJson') ? 0 : 1);
      const result = card.querySelector('.split-second');
      if (result) { result.classList.remove('result-updated'); void result.offsetWidth; result.classList.add('result-updated'); }
    });
  });
  let saved = '';
  try { saved = localStorage.getItem('blog:last-tool'); } catch (_) {}
  const initial = [location.hash.slice(1), saved, 'cardJson'].find(id => cards.some(card => card.id === id));
  selectTool(initial, false);
  addEventListener('hashchange', () => selectTool(location.hash.slice(1), false));
  sidebar.hidden = false;
  document.body.classList.add('is-workbench');
  filterTools();
})();
