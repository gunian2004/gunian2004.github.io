document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.ai-section');
    
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        
        header.addEventListener('click', function() {
            const isActive = section.classList.contains('active');
            
            sections.forEach(s => {
                s.classList.remove('active');
            });
            
            if (!isActive) {
                section.classList.add('active');
            }
        });
    });
    
    const loading = document.getElementById('loading');
    if (loading) {
        setTimeout(() => {
            loading.classList.add('hidden');
        }, 800);
    }
});

function copyPromptContent(event, button) {
    event.stopPropagation();
    
    const card = button.closest('.prompt-card');
    const cardText = card.querySelector('.card-text').innerText;
    
    navigator.clipboard.writeText(cardText).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ 已复制';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('复制失败: ', err);
        alert('复制失败，请手动复制');
    });
}

function toggleCard(card) {
    card.classList.toggle('expanded');
    const toggleText = card.querySelector('.card-toggle');
    if (card.classList.contains('expanded')) {
        toggleText.textContent = '▲ 收起';
    } else {
        toggleText.textContent = '...（点击展开）';
    }
}

/* ===== 规则复制相关 ===== */

// 提取元素内的纯文本：把 <br> 还原为换行，去掉多余空行和行尾空白
function extractCardText(element) {
    if (!element) return '';
    const clone = element.cloneNode(true);
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    return clone.textContent
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// 把一张规则卡片整理成「规则 N · 标题 + 正文」的纯文本
function getCardPlainText(card) {
    const heading = ['.card-index', '.card-title']
        .map(selector => card.querySelector(selector))
        .filter(Boolean)
        .map(el => el.textContent.trim())
        .filter(Boolean)
        .join(' · ');

    const body = extractCardText(card.querySelector('.card-text') || card.querySelector('.card-content'));
    return heading ? heading + '\n' + body : body;
}

// 统一的写入剪贴板逻辑（含非 https/file 协议下的兜底方案）
function writeClipboard(text, button, copiedLabel) {
    if (!text) {
        alert('没有可复制的内容');
        return;
    }

    const originalText = button.textContent;
    const showCopied = () => {
        button.textContent = copiedLabel || '✓ 已复制';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    };

    const fallbackCopy = () => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-1000px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            success = false;
        }
        document.body.removeChild(textarea);
        if (success) {
            showCopied();
        } else {
            alert('复制失败，请手动复制');
        }
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}

// 复制单条规则
function copyRuleContent(event, button) {
    event.stopPropagation();

    const card = button.closest('.prompt-card');
    writeClipboard(getCardPlainText(card), button);
}

// 一键复制全部规则
function copyAllRules(event, button) {
    event.stopPropagation();

    const section = button.closest('.ai-section');
    if (!section) return;

    const fullText = Array.from(section.querySelectorAll('.prompt-card'))
        .map(getCardPlainText)
        .filter(text => text)
        .join('\n\n');

    writeClipboard(fullText, button, '✓ 已复制全部规则');
}
