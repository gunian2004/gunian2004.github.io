// ========== 卡片折叠功能 ==========
function toggleCard(cardId) {
    const card = document.getElementById(cardId);
    const wasExpanded = card.classList.contains('expanded');
    
    // 切换展开状态
    card.classList.toggle('expanded');
    
    // 更新 badge 显示
    const badge = card.querySelector('.card-badge');
    if (cardId === 'cardRecorder') {
        // 录制卡片特殊处理
        updateRecorderBadge();
    } else {
        if (wasExpanded) {
            badge.textContent = '点击展开';
            badge.className = 'card-badge badge-collapsed';
        } else {
            badge.textContent = '';
            badge.className = 'card-badge';
        }
    }
}

function updateRecorderBadge() {
    const badge = document.getElementById('statusBadge');
    if (state.isPlaying) {
        badge.textContent = state.isPaused ? '已暂停' : '回放中...';
        badge.className = `card-badge badge-playing`;
    } else if (state.isRecording) {
        badge.textContent = '录制中...';
        badge.className = 'card-badge badge-recording';
    } else {
        badge.textContent = '空闲中';
        badge.className = 'card-badge badge-idle';
    }
}

// ========== 事件列表展开/收起 ==========
function toggleEventList() {
    const wrapper = elements.eventListWrapper;
    const toggleText = elements.toggleText;
    const isExpanded = wrapper.classList.toggle('expanded');

    if (isExpanded) {
        toggleText.textContent = '收起';
    } else {
        toggleText.textContent = '展开查看更多';
    }
}

// ========== 状态管理 ==========
const state = {
    isRecording: false,
    isPlaying: false,
    isPaused: false,
    events: [],
    startTime: null,
    playbackIndex: 0,
    playbackSpeed: 1,
    recordedData: null
};

// ========== DOM 元素 ==========
const elements = {
    btnRecord: document.getElementById('btnRecord'),
    btnStop: document.getElementById('btnStop'),
    btnPlay: document.getElementById('btnPlay'),
    btnPause: document.getElementById('btnPause'),
    btnClear: document.getElementById('btnClear'),
    btnExport: document.getElementById('btnExport'),
    btnImport: document.getElementById('btnImport'),
    fileImport: document.getElementById('fileImport'),
    statusBadge: document.getElementById('statusBadge'),
    eventList: document.getElementById('eventList'),
    eventListWrapper: document.getElementById('eventListWrapper'),
    eventListToggle: document.getElementById('eventListToggle'),
    toggleText: document.getElementById('toggleText'),
    eventCount: document.getElementById('eventCount'),
    eventCountText: document.getElementById('eventCountText'),
    totalTime: document.getElementById('totalTime'),
    currentIndex: document.getElementById('currentIndex'),
    speedRange: document.getElementById('speedRange'),
    speedValue: document.getElementById('speedValue'),
    progressFill: document.getElementById('progressFill')
};

// ========== 事件类型映射 ==========
const eventIcons = {
    'click': '🖱️',
    'dblclick': '🖱️×2',
    'mousedown': '⬇️',
    'mouseup': '⬆️',
    'mousemove': '✋',
    'keydown': '⌨️',
    'keyup': '⌨️↗',
    'input': '✏️',
    'change': '🔄',
    'scroll': '📜',
    'focus': '🔍',
    'blur': '👁️'
};

const eventNames = {
    'click': '点击',
    'dblclick': '双击',
    'mousedown': '按下',
    'mouseup': '松开',
    'mousemove': '移动',
    'keydown': '按下键',
    'keyup': '松开键',
    'input': '输入',
    'change': '变更',
    'scroll': '滚动',
    'focus': '聚焦',
    'blur': '失焦'
};

// ========== 核心功能 ==========

// 录制事件
function recordEvent(e) {
    if (!state.isRecording) return;

    const eventData = {
        type: e.type,
        x: e.clientX,
        y: e.clientY,
        targetXPath: getElementXPath(e.target),
        targetTag: e.target.tagName,
        targetId: e.target.id || null,
        targetClass: e.target.className || null,
        targetText: e.target.innerText?.substring(0, 30) || null,
        key: e.key || null,
        keyCode: e.keyCode || null,
        value: e.target.value || null,
        time: Date.now() - state.startTime,
        timestamp: new Date().toLocaleTimeString()
    };

    state.events.push(eventData);
    renderEventList();
    updateStats();
}

// 获取元素 XPath
function getElementXPath(element) {
    if (element.id) return `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(' ').filter(c => c && !c.includes('demo-'));
        if (classes.length > 0) return `.${classes[0]}`;
    }
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = element.previousSibling;
        while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
                index++;
            }
            sibling = sibling.previousSibling;
        }
        path.unshift(`${element.tagName.toLowerCase()}[${index}]`);
        element = element.parentNode;
    }
    return path.join(' > ');
}

// 通过选择器查找元素
function findElement(eventData) {
    if (eventData.targetXPath) {
        try {
            const result = document.evaluate(
                eventData.targetXPath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            );
            if (result.singleNodeValue) return result.singleNodeValue;
        } catch (e) {}
    }

    if (eventData.targetId) {
        const el = document.getElementById(eventData.targetId);
        if (el) return el;
    }

    if (eventData.targetClass) {
        const classes = eventData.targetClass.split(' ').filter(c => c && !c.includes('demo-'));
        if (classes.length > 0) {
            const els = document.getElementsByClassName(classes[0]);
            if (els.length > 0) return els[0];
        }
    }

    if (eventData.x && eventData.y) {
        return document.elementFromPoint(eventData.x, eventData.y);
    }

    return null;
}

// 回放单个事件
async function playbackEvent(eventData) {
    return new Promise((resolve) => {
        const element = findElement(eventData);
        if (!element) {
            console.warn('无法找到元素:', eventData);
            resolve();
            return;
        }

        highlightEvent(state.playbackIndex);

        switch (eventData.type) {
            case 'click':
            case 'dblclick':
                element.click();
                break;

            case 'mousedown':
                element.dispatchEvent(new MouseEvent('mousedown', {
                    bubbles: true,
                    clientX: eventData.x,
                    clientY: eventData.y
                }));
                break;

            case 'mouseup':
                element.dispatchEvent(new MouseEvent('mouseup', {
                    bubbles: true,
                    clientX: eventData.x,
                    clientY: eventData.y
                }));
                break;

            case 'keydown':
            case 'keyup':
                if (eventData.key) {
                    const keyboardEvent = new KeyboardEvent(eventData.type, {
                        key: eventData.key,
                        code: eventData.keyCode,
                        bubbles: true
                    });
                    element.dispatchEvent(keyboardEvent);
                }
                break;

            case 'input':
            case 'change':
                if (eventData.value !== null && element.value !== undefined) {
                    element.value = eventData.value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                }
                break;

            case 'focus':
                element.focus();
                break;

            case 'blur':
                element.blur();
                break;

            default:
                console.log('未处理的事件类型:', eventData.type);
        }

        const baseDelay = 50;
        const nextEvent = state.events[state.playbackIndex + 1];
        let delay = nextEvent ? (nextEvent.time - eventData.time) / state.playbackSpeed : baseDelay;
        delay = Math.max(delay, baseDelay);
        delay = Math.min(delay, 3000);

        setTimeout(resolve, delay);
    });
}

// 回放所有事件
async function playAllEvents() {
    if (state.events.length === 0) return;

    state.isPlaying = true;
    state.isPaused = false;
    updateUI();
    elements.progressFill.style.width = '0%';

    for (let i = state.playbackIndex; i < state.events.length; i++) {
        if (!state.isPlaying || state.isPaused) break;

        state.playbackIndex = i;
        elements.currentIndex.textContent = `${i + 1}/${state.events.length}`;
        elements.progressFill.style.width = `${((i + 1) / state.events.length) * 100}%`;

        await playbackEvent(state.events[i]);
    }

    state.isPlaying = false;
    state.isPaused = false;
    updateUI();
}

// 停止回放
function stopPlayback() {
    state.isPlaying = false;
    state.isPaused = false;
    state.playbackIndex = 0;
    elements.progressFill.style.width = '0%';
    elements.currentIndex.textContent = '-';
    clearHighlights();
    updateUI();
}

// 高亮事件
function highlightEvent(index) {
    clearHighlights();
    const items = elements.eventList.querySelectorAll('.event-item');
    if (items[index]) {
        items[index].classList.add('playing');
        items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// 清除高亮
function clearHighlights() {
    elements.eventList.querySelectorAll('.event-item').forEach(item => {
        item.classList.remove('playing');
    });
}

// ========== UI 渲染 ==========

function renderEventList() {
    if (state.events.length === 0) {
        elements.eventList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>点击"开始录制"后，你在此页面的所有操作都会被记录</p>
            </div>
        `;
        return;
    }

    elements.eventList.innerHTML = state.events.map((evt, idx) => `
        <div class="event-item" data-index="${idx}">
            <span class="event-icon">${eventIcons[evt.type] || '📌'}</span>
            <span class="event-type">${eventNames[evt.type] || evt.type}</span>
            <span class="event-target" title="${evt.targetXPath || evt.targetTag}">
                ${evt.targetId ? `#${evt.targetId}` : evt.targetText || evt.targetTag}
                ${evt.key ? `[${evt.key}]` : ''}
                ${evt.value !== null && evt.value !== undefined ? `"${evt.value}"` : ''}
            </span>
            <span class="event-time">${evt.timestamp}</span>
        </div>
    `).join('');
}

function updateStats() {
    elements.eventCount.textContent = state.events.length;
    elements.eventCountText.textContent = state.events.length > 0
        ? `共 ${state.events.length} 个事件`
        : '暂无录制';

    if (state.events.length > 0) {
        const lastEvent = state.events[state.events.length - 1];
        const firstEvent = state.events[0];
        const duration = (lastEvent.time - firstEvent.time) / 1000;
        elements.totalTime.textContent = `${duration.toFixed(1)}s`;
    } else {
        elements.totalTime.textContent = '0.0s';
    }
}

function updateUI() {
    elements.btnRecord.disabled = state.isRecording || state.isPlaying;
    elements.btnStop.disabled = !state.isRecording;
    elements.btnPlay.disabled = state.events.length === 0 || state.isRecording || state.isPlaying;
    elements.btnPause.disabled = !state.isPlaying;
    elements.btnClear.disabled = state.events.length === 0 || state.isRecording || state.isPlaying;
    elements.btnExport.disabled = state.events.length === 0;

    updateRecorderBadge();
}

// ========== 事件监听 ==========

elements.btnRecord.addEventListener('click', () => {
    state.isRecording = true;
    state.events = [];
    state.startTime = Date.now();
    renderEventList();
    updateStats();
    updateUI();
});

elements.btnStop.addEventListener('click', () => {
    state.isRecording = false;
    updateUI();
});

elements.btnPlay.addEventListener('click', () => {
    if (state.isPaused) {
        state.isPaused = false;
        playAllEvents();
    } else {
        state.playbackIndex = 0;
        playAllEvents();
    }
});

elements.btnPause.addEventListener('click', () => {
    state.isPaused = true;
    updateUI();
});

elements.btnClear.addEventListener('click', () => {
    if (confirm('确定要清空所有录制内容吗？')) {
        state.events = [];
        state.playbackIndex = 0;
        renderEventList();
        updateStats();
        stopPlayback();
    }
});

elements.btnExport.addEventListener('click', () => {
    if (state.events.length === 0) return;

    const data = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        eventCount: state.events.length,
        events: state.events
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

elements.btnImport.addEventListener('click', () => {
    elements.fileImport.click();
});

elements.fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.events && Array.isArray(data.events)) {
                state.events = data.events;
                state.recordedData = data;
                renderEventList();
                updateStats();
                updateUI();
                alert(`成功导入 ${data.events.length} 个事件！`);
            } else {
                alert('文件格式不正确');
            }
        } catch (err) {
            alert('解析文件失败: ' + err.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

elements.speedRange.addEventListener('input', (e) => {
    state.playbackSpeed = parseFloat(e.target.value);
    elements.speedValue.textContent = `${state.playbackSpeed}x`;
});

// 全局事件监听 - 录制
document.addEventListener('click', recordEvent, true);
document.addEventListener('keydown', recordEvent, true);
document.addEventListener('keyup', recordEvent, true);
document.addEventListener('input', recordEvent, true);
document.addEventListener('change', recordEvent, true);
document.addEventListener('focus', recordEvent, true);
document.addEventListener('blur', recordEvent, true);

// 阻止测试区域按钮的默认行为
document.querySelectorAll('.demo-btn-sample').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!state.isRecording) return;
        e.stopPropagation();
    });
});

// 初始化
updateUI();

// ========== Markdown 预览功能 ==========
const mdInput = document.getElementById('mdInput');
const mdPreview = document.getElementById('mdPreview');

// 配置 marked.js
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
    });
}

// Markdown 实时预览
mdInput.addEventListener('input', updateMdPreview);

function updateMdPreview() {
    const text = mdInput.value.trim();
    if (!text) {
        mdPreview.innerHTML = '<div class="md-empty">👆 在左侧输入 Markdown 即可实时预览</div>';
        return;
    }
    try {
        if (typeof marked !== 'undefined') {
            mdPreview.innerHTML = marked.parse(text);
        } else {
            mdPreview.innerHTML = '<p style="color: var(--danger);">⚠️ Markdown 库加载失败，请刷新页面重试</p>';
        }
    } catch (e) {
        mdPreview.innerHTML = '<p style="color: var(--danger);">⚠️ 解析错误: ' + e.message + '</p>';
    }
}

// 插入文本到光标位置
function mdInsertText(text) {
    const start = mdInput.selectionStart;
    const end = mdInput.selectionEnd;
    const before = mdInput.value.substring(0, start);
    const after = mdInput.value.substring(end);
    mdInput.value = before + text + after;
    mdInput.focus();
    mdInput.selectionStart = mdInput.selectionEnd = start + text.length;
    updateMdPreview();
}

// 清空内容
function mdClear() {
    if (confirm('确定要清空编辑器内容吗？')) {
        mdInput.value = '';
        updateMdPreview();
    }
}

// 复制 HTML
function mdCopyHtml() {
    const html = mdPreview.innerHTML;
    if (html.includes('md-empty')) {
        alert('没有可复制的内容，请先输入 Markdown');
        return;
    }
    navigator.clipboard.writeText(html).then(() => {
        alert('HTML 已复制到剪贴板！');
    }).catch(() => {
        alert('复制失败，请手动选择内容复制');
    });
}

// 上传 .md 文件
function mdUploadFile() {
    document.getElementById('mdFileInput').click();
}

document.getElementById('mdFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件类型
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['md', 'markdown', 'txt'].includes(ext)) {
        alert('仅支持 .md、.markdown、.txt 格式的文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        mdInput.value = event.target.result;
        updateMdPreview();
        // 自动展开卡片（如果未展开）
        const card = document.getElementById('cardMarkdown');
        if (!card.classList.contains('expanded')) {
            card.classList.add('expanded');
        }
    };
    reader.onerror = function() {
        alert('文件读取失败，请重试');
    };
    reader.readAsText(file);

    // 重置 input，允许重复选择同一文件
    e.target.value = '';
});

// 全屏预览功能
function mdToggleFullscreen() {
    const preview = document.getElementById('mdPreview');
    const content = preview.innerHTML;

    // 检查是否已经全屏
    const existingOverlay = document.querySelector('.md-fullscreen-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
        return;
    }

    // 创建全屏覆盖层
    const overlay = document.createElement('div');
    overlay.className = 'md-fullscreen-overlay';
    overlay.innerHTML = `
        <button class="md-fullscreen-close" onclick="mdToggleFullscreen()">
            <span>✕</span> 关闭全屏
        </button>
        <div class="md-fullscreen-content">
            <div class="md-preview" style="max-height: none; overflow: visible;">
                ${content}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // ESC 键退出全屏
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// ========== JSON 格式化/压缩 ==========
const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');

jsonInput.addEventListener('input', function() {
    const val = this.value.trim();
    if (!val) {
        jsonOutput.textContent = '等待输入...';
        jsonOutput.style.color = 'var(--text-secondary)';
        return;
    }
    try {
        const obj = JSON.parse(val);
        jsonOutput.textContent = JSON.stringify(obj, null, 2);
        jsonOutput.style.color = 'var(--text-primary)';
    } catch (e) {
        jsonOutput.textContent = '⚠️ JSON 格式错误: ' + e.message;
        jsonOutput.style.color = 'var(--danger)';
    }
});

function jsonFormat() {
    try {
        const obj = JSON.parse(jsonInput.value);
        jsonOutput.textContent = JSON.stringify(obj, null, 2);
        jsonOutput.style.color = 'var(--text-primary)';
    } catch (e) {
        jsonOutput.textContent = '⚠️ JSON 格式错误: ' + e.message;
        jsonOutput.style.color = 'var(--danger)';
    }
}

function jsonMinify() {
    try {
        const obj = JSON.parse(jsonInput.value);
        jsonOutput.textContent = JSON.stringify(obj);
        jsonOutput.style.color = 'var(--text-primary)';
    } catch (e) {
        jsonOutput.textContent = '⚠️ JSON 格式错误: ' + e.message;
        jsonOutput.style.color = 'var(--danger)';
    }
}

function jsonCopy() {
    const text = jsonOutput.textContent;
    if (text.includes('⚠️') || text === '等待输入...') {
        alert('没有可复制的内容');
        return;
    }
    navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板！')).catch(() => alert('复制失败'));
}

function jsonClear() {
    if (confirm('确定要清空吗？')) {
        jsonInput.value = '';
        jsonOutput.textContent = '等待输入...';
        jsonOutput.style.color = 'var(--text-secondary)';
    }
}

// ========== JSON ↔ YAML 互转 ==========
const yamlJsonInput = document.getElementById('yamlJsonInput');
const yamlOutput = document.getElementById('yamlOutput');

// 简单的 JSON to YAML 转换
function jsonToYaml() {
    try {
        const obj = JSON.parse(yamlJsonInput.value);
        yamlOutput.value = jsonToYamlStr(obj, 0);
    } catch (e) {
        yamlOutput.value = '⚠️ JSON 格式错误: ' + e.message;
        yamlOutput.style.color = 'var(--danger)';
    }
}

function jsonToYamlStr(obj, indent) {
    const spaces = '  '.repeat(indent);
    if (obj === null) return 'null\n';
    if (typeof obj === 'boolean') return obj ? 'true\n' : 'false\n';
    if (typeof obj === 'number') return obj + '\n';
    if (typeof obj === 'string') {
        if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
            return '|' + '\n' + obj.split('\n').map(line => spaces + '  ' + line).join('\n');
        }
        return obj + '\n';
    }
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]\n';
        return obj.map(item => spaces + '- ' + jsonToYamlStr(item, indent + 1).trim()).join('\n') + '\n';
    }
    if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}\n';
        return keys.map(key => spaces + key + ': ' + jsonToYamlStr(obj[key], indent + 1).trim()).join('\n') + '\n';
    }
    return String(obj) + '\n';
}

// 简单的 YAML to JSON 转换
function yamlToJson() {
    try {
        const lines = yamlOutput.value.split('\n');
        const result = yamlToJsonParse(lines);
        yamlJsonInput.value = JSON.stringify(result, null, 2);
    } catch (e) {
        yamlJsonInput.value = '⚠️ YAML 格式错误: ' + e.message;
    }
}

function yamlToJsonParse(lines) {
    const result = {};
    let i = 0;
    let currentKey = null;
    let currentIndent = 0;
    let inArray = false;
    let arrayItems = [];

    while (i < lines.length) {
        let line = lines[i];
        if (!line.trim() || line.trim().startsWith('#')) {
            i++;
            continue;
        }
        const indent = line.search(/\S/);
        const trimmed = line.trim();

        if (trimmed.startsWith('- ')) {
            // 数组项
            const value = trimmed.substring(2).trim();
            if (value) {
                arrayItems.push(value.replace(/['"]/g, ''));
            } else {
                // 多行数组项
                i++;
                const subLines = [];
                while (i < lines.length) {
                    const nextLine = lines[i];
                    const nextIndent = nextLine.search(/\S/);
                    if (nextIndent <= indent) break;
                    subLines.push(nextLine.trim());
                    i++;
                }
                if (subLines.length > 0) {
                    arrayItems.push(subLines.join('\n'));
                }
            }
        } else if (trimmed.includes(':')) {
            // 对象属性
            const colonIndex = trimmed.indexOf(':');
            const key = trimmed.substring(0, colonIndex).trim();
            const value = trimmed.substring(colonIndex + 1).trim();

            if (arrayItems.length > 0) {
                result[currentKey] = arrayItems;
                arrayItems = [];
            }

            if (value) {
                result[key] = value.replace(/['"]/g, '');
            } else {
                currentKey = key;
                currentIndent = indent;
                i++;
                // 检查后续是否是数组
                const subLines = [];
                while (i < lines.length) {
                    const nextLine = lines[i];
                    const nextIndent = nextLine.search(/\S/);
                    if (nextIndent <= indent) break;
                    subLines.push(nextLine);
                    i++;
                }
                if (subLines.length > 0 && subLines[0].trim().startsWith('- ')) {
                    const parsed = yamlToJsonParse(subLines);
                    result[key] = Array.isArray(parsed) ? parsed : [parsed];
                } else if (subLines.length > 0) {
                    const parsed = yamlToJsonParse(subLines);
                    result[key] = parsed;
                }
            }
        }
        i++;
    }

    if (arrayItems.length > 0 && currentKey) {
        result[currentKey] = arrayItems;
    }

    return Object.keys(result).length === 0 && arrayItems.length > 0 ? arrayItems : result;
}

function yamlSwap() {
    const temp = yamlJsonInput.value;
    yamlJsonInput.value = yamlOutput.value;
    yamlOutput.value = temp;
}

function yamlClear() {
    if (confirm('确定要清空吗？')) {
        yamlJsonInput.value = '';
        yamlOutput.value = '';
    }
}

// ========== Base64 编解码 ==========
const base64Input = document.getElementById('base64Input');
const base64Output = document.getElementById('base64Output');

base64Input.addEventListener('input', function() {
    const val = this.value.trim();
    if (!val) {
        base64Output.textContent = '等待输入...';
        base64Output.style.color = 'var(--text-secondary)';
        return;
    }
    try {
        base64Output.textContent = btoa(unescape(encodeURIComponent(val)));
        base64Output.style.color = 'var(--text-primary)';
    } catch (e) {
        base64Output.textContent = '⚠️ 编码错误: ' + e.message;
        base64Output.style.color = 'var(--danger)';
    }
});

function base64Encode() {
    try {
        base64Output.textContent = btoa(unescape(encodeURIComponent(base64Input.value)));
        base64Output.style.color = 'var(--text-primary)';
    } catch (e) {
        base64Output.textContent = '⚠️ 编码错误: ' + e.message;
        base64Output.style.color = 'var(--danger)';
    }
}

function base64Decode() {
    try {
        base64Output.textContent = decodeURIComponent(escape(atob(base64Input.value.trim())));
        base64Output.style.color = 'var(--text-primary)';
    } catch (e) {
        base64Output.textContent = '⚠️ 解码错误: 无效的 Base64 字符串';
        base64Output.style.color = 'var(--danger)';
    }
}

function base64Copy() {
    const text = base64Output.textContent;
    if (text.includes('⚠️') || text === '等待输入...') {
        alert('没有可复制的内容');
        return;
    }
    navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板！')).catch(() => alert('复制失败'));
}

function base64Clear() {
    if (confirm('确定要清空吗？')) {
        base64Input.value = '';
        base64Output.textContent = '等待输入...';
        base64Output.style.color = 'var(--text-secondary)';
    }
}

// ========== URL 编解码 ==========
const urlInput = document.getElementById('urlInput');
const urlOutput = document.getElementById('urlOutput');

urlInput.addEventListener('input', function() {
    const val = this.value.trim();
    if (!val) {
        urlOutput.textContent = '等待输入...';
        urlOutput.style.color = 'var(--text-secondary)';
        return;
    }
    try {
        urlOutput.textContent = encodeURIComponent(val);
        urlOutput.style.color = 'var(--text-primary)';
    } catch (e) {
        urlOutput.textContent = '⚠️ 编码错误: ' + e.message;
        urlOutput.style.color = 'var(--danger)';
    }
});

function urlEncode() {
    try {
        urlOutput.textContent = encodeURIComponent(urlInput.value);
        urlOutput.style.color = 'var(--text-primary)';
    } catch (e) {
        urlOutput.textContent = '⚠️ 编码错误: ' + e.message;
        urlOutput.style.color = 'var(--danger)';
    }
}

function urlDecode() {
    try {
        urlOutput.textContent = decodeURIComponent(urlInput.value);
        urlOutput.style.color = 'var(--text-primary)';
    } catch (e) {
        urlOutput.textContent = '⚠️ 解码错误: 无效的 URL 编码字符串';
        urlOutput.style.color = 'var(--danger)';
    }
}

function urlCopy() {
    const text = urlOutput.textContent;
    if (text.includes('⚠️') || text === '等待输入...') {
        alert('没有可复制的内容');
        return;
    }
    navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板！')).catch(() => alert('复制失败'));
}

function urlClear() {
    if (confirm('确定要清空吗？')) {
        urlInput.value = '';
        urlOutput.textContent = '等待输入...';
        urlOutput.style.color = 'var(--text-secondary)';
    }
}

// ========== ER 图生成器 ==========
// 初始化 Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    er: {
        diagramPadding: 20,
        nodePadding: 15,
        rankSpacing: 30,
        edgePadding: 10
    }
});

// ER 数据结构
const erState = {
    entities: [], // { name: string, fields: [{ name, type, isPk, isFk }] }
    relations: [] // { from: string, to: string, type: string, label: string }
};

// 添加实体
function erAddEntity() {
    const nameInput = document.getElementById('erNewEntityName');
    const name = nameInput.value.trim();
    if (!name) {
        alert('请输入表名');
        return;
    }
    if (erState.entities.find(e => e.name === name)) {
        alert('该表名已存在');
        return;
    }
    // 检查是否是保留字
    const lowerName = name.toLowerCase();
    if (sqlKeywords.includes(lowerName)) {
        alert(`"${name}" 是 SQL 保留字，请使用其他表名`);
        return;
    }

    erState.entities.push({
        name: name,
        fields: [
            { name: 'id', type: 'INT', isPk: true, isFk: false }
        ]
    });
    nameInput.value = '';
    erRenderEntityList();
    erUpdateRelationSelects();
    erGenerateCode();
    erRefreshPreview();
}

// 删除实体
function erRemoveEntity(name) {
    if (!confirm(`确定要删除表 "${name}" 吗？`)) return;
    erState.entities = erState.entities.filter(e => e.name !== name);
    erState.relations = erState.relations.filter(r => r.from !== name && r.to !== name);
    erRenderEntityList();
    erUpdateRelationSelects();
    erGenerateCode();
    erRefreshPreview();
}

// 添加字段
function erAddField(entityName) {
    const fieldName = prompt('字段名：');
    if (!fieldName) return;
    const fieldType = prompt('字段类型（如：INT, VARCHAR(255), TEXT, DATE）：', 'VARCHAR(100)');
    if (!fieldType) return;

    const entity = erState.entities.find(e => e.name === entityName);
    if (entity) {
        entity.fields.push({ name: fieldName, type: fieldType, isPk: false, isFk: false });
        erRenderEntityList();
        erGenerateCode();
        erRefreshPreview();
    }
}

// 删除字段
function erRemoveField(entityName, fieldName) {
    const entity = erState.entities.find(e => e.name === entityName);
    if (entity && entity.fields.length > 1) {
        entity.fields = entity.fields.filter(f => f.name !== fieldName);
        erRenderEntityList();
        erGenerateCode();
        erRefreshPreview();
    } else if (entity && entity.fields.length <= 1) {
        alert('至少保留一个字段');
    }
}

// 切换主键
function erTogglePk(entityName, fieldName) {
    const entity = erState.entities.find(e => e.name === entityName);
    if (entity) {
        const field = entity.fields.find(f => f.name === fieldName);
        if (field) {
            // 取消其他字段的主键
            entity.fields.forEach(f => f.isPk = false);
            field.isPk = true;
            erRenderEntityList();
            erGenerateCode();
            erRefreshPreview();
        }
    }
}

// 切换外键
function erToggleFk(entityName, fieldName) {
    const entity = erState.entities.find(e => e.name === entityName);
    if (entity) {
        const field = entity.fields.find(f => f.name === fieldName);
        if (field) {
            field.isFk = !field.isFk;
            erRenderEntityList();
            erGenerateCode();
            erRefreshPreview();
        }
    }
}

// 渲染实体列表
function erRenderEntityList() {
    const container = document.getElementById('erEntityList');
    if (erState.entities.length === 0) {
        container.innerHTML = '<div class="er-empty-state">点击上方"添加实体"创建表，或点击"示例"加载示例数据</div>';
        return;
    }

    container.innerHTML = erState.entities.map((entity, idx) => `
        <div class="er-entity-item">
            <div class="er-entity-header" onclick="erToggleEntity('${entity.name}')" style="cursor:pointer;">
                <span class="er-entity-name">📁 ${entity.name} <span style="font-size:0.75rem;color:var(--text-secondary);">(${entity.fields.length} 字段)</span></span>
                <div style="display:flex;gap:0.3rem;align-items:center;" onclick="event.stopPropagation();">
                    <button class="er-btn" onclick="erAddField('${entity.name}')" title="添加字段">+ 字段</button>
                    <button class="er-btn-danger" onclick="erRemoveEntity('${entity.name}')" title="删除表">✕</button>
                    <span class="er-entity-toggle" id="er-toggle-${entity.name}">▼</span>
                </div>
            </div>
            <div class="er-entity-fields" id="er-fields-${entity.name}" style="display:none;">
                ${entity.fields.map(field => `
                    <div class="er-field-item">
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <span class="er-field-name">${field.name}</span>
                            <span class="er-field-type">${field.type}</span>
                        </div>
                        <div class="er-field-tags">
                            <span class="${field.isPk ? 'pk' : ''}" style="cursor:pointer;" onclick="erTogglePk('${entity.name}', '${field.name}')" title="点击设为主键">PK</span>
                            <span class="${field.isFk ? 'fk' : ''}" style="cursor:pointer;" onclick="erToggleFk('${entity.name}', '${field.name}')" title="点击设为外键">FK</span>
                            <button class="er-btn-danger" style="margin-left:0.3rem;" onclick="erRemoveField('${entity.name}', '${field.name}')">✕</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// 展开/折叠实体字段（手风琴效果）
function erToggleEntity(entityName) {
    const fieldsDiv = document.getElementById('er-fields-' + entityName);
    const toggleIcon = document.getElementById('er-toggle-' + entityName);
    const isHidden = fieldsDiv.style.display === 'none';

    // 先收起所有其他已展开的表
    erState.entities.forEach(entity => {
        if (entity.name !== entityName) {
            const otherFields = document.getElementById('er-fields-' + entity.name);
            const otherToggle = document.getElementById('er-toggle-' + entity.name);
            if (otherFields && otherFields.style.display !== 'none') {
                otherFields.style.display = 'none';
                if (otherToggle) otherToggle.textContent = '▼';
            }
        }
    });

    // 然后切换当前表的状态
    fieldsDiv.style.display = isHidden ? 'block' : 'none';
    toggleIcon.textContent = isHidden ? '▲' : '▼';
}

// 更新关系下拉框
function erUpdateRelationSelects() {
    const fromSelect = document.getElementById('erRelFrom');
    const toSelect = document.getElementById('erRelTo');
    const options = '<option value="">-- 选择表 --</option>' +
        erState.entities.map(e => `<option value="${e.name}">${e.name}</option>`).join('');

    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;
}

// 添加关系
function erAddRelation() {
    const from = document.getElementById('erRelFrom').value;
    const type = document.getElementById('erRelType').value;
    const to = document.getElementById('erRelTo').value;

    if (!from || !to) {
        alert('请选择两个表');
        return;
    }
    if (from === to) {
        alert('不能选择相同的表');
        return;
    }

    const relationLabel = prompt('关系描述（如：belongs to, has many）：', '');
    if (relationLabel === null) return;

    erState.relations.push({ from, type, to, label: relationLabel || '' });
    erRenderRelationList();
    erGenerateCode();
    erRefreshPreview();
}

// 删除关系
function erRemoveRelation(index) {
    erState.relations.splice(index, 1);
    erRenderRelationList();
    erGenerateCode();
    erRefreshPreview();
}

// 渲染关系列表
function erRenderRelationList() {
    const container = document.getElementById('erRelationList');
    if (erState.relations.length === 0) {
        container.innerHTML = '<div style="font-size:0.8rem;color:var(--text-secondary);">暂无关系</div>';
        return;
    }

    container.innerHTML = erState.relations.map((rel, idx) => `
        <div class="er-relation-item">
            <span>${rel.from} ${rel.type} ${rel.to}${rel.label ? ' : ' + rel.label : ''}</span>
            <button class="er-btn-danger" onclick="erRemoveRelation(${idx})">✕</button>
        </div>
    `).join('');
}

// SQL 保留字列表
const sqlKeywords = ['like', 'order', 'user', 'select', 'insert', 'update', 'delete', 'from', 'where', 'group', 'having', 'limit', 'offset', 'join', 'inner', 'outer', 'left', 'right', 'on', 'as', 'and', 'or', 'not', 'null', 'true', 'false', 'table', 'index', 'key', 'primary', 'foreign', 'unique', 'check', 'default', 'constraint', 'cascade'];

// 安全化实体名（如果是保留字则加引号）
function safeEntityName(name) {
    const lowerName = name.toLowerCase();
    if (sqlKeywords.includes(lowerName)) {
        return `"${name}"`;
    }
    return name;
}

// 生成 Mermaid 代码
function erGenerateCode() {
    const codeContent = document.getElementById('erCodeContent');
    if (erState.entities.length === 0) {
        codeContent.textContent = '添加实体后将在此显示 Mermaid 代码...';
        return;
    }

    let code = 'erDiagram\n';

    // 生成实体和字段
    erState.entities.forEach(entity => {
        code += `    ${safeEntityName(entity.name)} {\n`;
        entity.fields.forEach(field => {
            // Mermaid ER 图字段格式：type fieldName
            // pk (主键) 和 fk (外键) 作为额外标记放在类型后面
            const tags = [];
            if (field.isPk) tags.push('pk');
            if (field.isFk) tags.push('fk');
            // 将类型中的括号替换为下划线，避免 Mermaid 解析错误
            const safeType = field.type.replace(/[\(\),]/g, '_');
            const tagStr = tags.length > 0 ? ` ${tags.join(' ')}` : '';
            code += `        ${safeType} ${field.name}${tagStr}\n`;
        });
        code += `    }\n`;
    });

    // 生成关系
    erState.relations.forEach(rel => {
        code += `    ${safeEntityName(rel.from)} ${rel.type} ${safeEntityName(rel.to)}`;
        if (rel.label) {
            // 如果标签是纯数字或包含特殊字符，用引号包裹
            const needsQuotes = /^\d+$/.test(rel.label) || /["\n]/.test(rel.label);
            const safeLabel = needsQuotes ? `"${rel.label.replace(/"/g, '\\"')}"` : rel.label;
            code += ` : ${safeLabel}`;
        }
        code += '\n';
    });

    codeContent.textContent = code;
}

// 刷新预览
async function erRefreshPreview() {
    const previewArea = document.getElementById('erPreviewArea');
    if (erState.entities.length === 0) {
        previewArea.innerHTML = '<div class="er-preview-empty">👆 添加实体和关系后即可预览 ER 图</div>';
        return;
    }

    const code = document.getElementById('erCodeContent').textContent;
    if (code.includes('添加实体后')) return;

    try {
        const id = 'er-diagram-' + Date.now();
        const { svg } = await mermaid.render(id, code);
        // 包装 SVG 并添加样式修复
        previewArea.innerHTML = `<div class="mermaid er-diagram-fix">${svg}</div>`;
        
        const svgEl = previewArea.querySelector('svg');
        if (svgEl) {
            // 给所有文字元素添加白色 class
            const allTextEls = svgEl.querySelectorAll('text, tspan, span, p');
            allTextEls.forEach(el => {
                el.classList.add('er-text-white');
            });
            
            // 修复层级问题：给包含 foreignObject 的 g 元素设置更高的 z-index
            const allG = svgEl.querySelectorAll('g');
            allG.forEach(g => {
                const foreignObj = g.querySelector('foreignObject');
                if (foreignObj) {
                    g.style.zIndex = '100';
                }
            });
        }
        
        // 注入 CSS 样式
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .er-text-white {
                color: #ffffff !important;
                fill: #ffffff !important;
            }
            .er-diagram-fix svg {
                background-color: transparent !important;
            }
            .er-diagram-fix svg g[style*="z-index"] {
                position: relative;
            }
        `;
        previewArea.appendChild(styleEl);
    } catch (e) {
        previewArea.innerHTML = `<div style="color:var(--danger);padding:1rem;">⚠️ 渲染错误: ${e.message}</div>`;
    }
}

// 全屏预览
function erToggleFullscreen() {
    const previewArea = document.getElementById('erPreviewArea');
    const svg = previewArea.querySelector('svg');

    // 检查是否已经全屏
    const existingOverlay = document.querySelector('.er-fullscreen-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
        return;
    }

    if (!svg) {
        alert('请先生成 ER 图');
        return;
    }

    // 创建全屏覆盖层
    const overlay = document.createElement('div');
    overlay.className = 'er-fullscreen-overlay';
    overlay.innerHTML = `
        <div class="er-fullscreen-header">
            <span class="er-fullscreen-title">🔲 ER 图全屏预览</span>
            <button class="er-fullscreen-close" onclick="erToggleFullscreen()">
                <span>✕</span> 关闭全屏
            </button>
        </div>
        <div class="er-fullscreen-content">
            ${svg.outerHTML}
        </div>
    `;

    document.body.appendChild(overlay);

    // ESC 键退出全屏
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// 复制代码
function erCopyCode() {
    const code = document.getElementById('erCodeContent').textContent;
    if (code.includes('添加实体后')) {
        alert('没有可复制的内容');
        return;
    }
    navigator.clipboard.writeText(code).then(() => alert('代码已复制到剪贴板！')).catch(() => alert('复制失败'));
}

// 导出图片
function erExportImage() {
    const previewArea = document.getElementById('erPreviewArea');
    const svg = previewArea.querySelector('svg');
    if (!svg) {
        alert('请先生成 ER 图');
        return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const link = document.createElement('a');
        link.download = 'er-diagram.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// 加载示例数据
function erAddSampleData() {
    erState.entities = [
        {
            name: 'users',
            fields: [
                { name: 'id', type: 'INT', isPk: true, isFk: false },
                { name: 'username', type: 'VARCHAR_50', isPk: false, isFk: false },
                { name: 'email', type: 'VARCHAR_100', isPk: false, isFk: false },
                { name: 'password', type: 'VARCHAR_255', isPk: false, isFk: false },
                { name: 'created_at', type: 'DATETIME', isPk: false, isFk: false }
            ]
        },
        {
            name: 'orders',
            fields: [
                { name: 'id', type: 'INT', isPk: true, isFk: false },
                { name: 'user_id', type: 'INT', isPk: false, isFk: true },
                { name: 'total_amount', type: 'DECIMAL', isPk: false, isFk: false },
                { name: 'status', type: 'VARCHAR_20', isPk: false, isFk: false },
                { name: 'created_at', type: 'DATETIME', isPk: false, isFk: false }
            ]
        },
        {
            name: 'products',
            fields: [
                { name: 'id', type: 'INT', isPk: true, isFk: false },
                { name: 'name', type: 'VARCHAR_100', isPk: false, isFk: false },
                { name: 'price', type: 'DECIMAL', isPk: false, isFk: false },
                { name: 'stock', type: 'INT', isPk: false, isFk: false }
            ]
        },
        {
            name: 'order_items',
            fields: [
                { name: 'id', type: 'INT', isPk: true, isFk: false },
                { name: 'order_id', type: 'INT', isPk: false, isFk: true },
                { name: 'product_id', type: 'INT', isPk: false, isFk: true },
                { name: 'quantity', type: 'INT', isPk: false, isFk: false },
                { name: 'subtotal', type: 'DECIMAL', isPk: false, isFk: false }
            ]
        }
    ];

    erState.relations = [
        { from: 'users', type: '||--o{', to: 'orders', label: 'places' },
        { from: 'orders', type: '||--|{', to: 'order_items', label: 'contains' },
        { from: 'products', type: '||--o{', to: 'order_items', label: 'appears in' }
    ];

    erRenderEntityList();
    erUpdateRelationSelects();
    erRenderRelationList();
    erGenerateCode();
    erRefreshPreview();
}

// 清空所有
function erClearAll() {
    if (erState.entities.length === 0 && erState.relations.length === 0) return;
    if (!confirm('确定要清空所有实体和关系吗？')) return;

    erState.entities = [];
    erState.relations = [];
    erRenderEntityList();
    erUpdateRelationSelects();
    erRenderRelationList();
    erGenerateCode();
    erRefreshPreview();
}

// 初始化
erUpdateRelationSelects();
erRenderRelationList();
