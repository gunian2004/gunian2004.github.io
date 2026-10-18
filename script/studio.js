/* 小范围共享反馈，剪贴板失败时保留手动复制路径。 */
(() => {
    'use strict';
    const toast = document.createElement('div');
    toast.className = 'studio-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
    let timer;
    function notify(message) {
        clearTimeout(timer);
        toast.textContent = message;
        toast.classList.add('is-visible');
        timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
    }
    async function copy(text, button) {
        try {
            if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
            else {
                const previous = document.activeElement;
                const input = document.createElement('textarea');
                input.value = text;
                input.style.cssText = 'position:fixed;left:-9999px;top:0';
                document.body.append(input);
                input.select();
                let copied = false;
                try { copied = document.execCommand('copy'); } finally { input.remove(); previous?.focus({ preventScroll: true }); }
                if (!copied) throw new Error('Clipboard unavailable');
            }
            notify('已复制到剪贴板');
            if (button) {
                const label = button.textContent;
                button.textContent = '✓ 已复制';
                button.disabled = true;
                setTimeout(() => { button.textContent = label; button.disabled = false; }, 1600);
            }
            return true;
        } catch (error) { notify('复制未完成，请选中文本手动复制。'); return false; }
    }
    window.BlogStudio = { notify, copy };
})();
