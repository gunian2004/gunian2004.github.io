/* ER 图按需加载；其他工具不等待外部图库。 */
(() => {
    'use strict';
    let pending;
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const timer = setTimeout(() => finish(new Error('图库加载超时')), 12000);
            let settled = false;
            function finish(error) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                script.onload = script.onerror = null;
                if (error) { script.remove(); reject(error); }
                else resolve();
            }
            script.src = url;
            script.onload = () => finish(window.mermaid ? null : new Error('图库未就绪'));
            script.onerror = () => finish(new Error('图库暂时无法连接'));
            document.head.append(script);
        });
    }
    window.loadBlogMermaid = () => {
        if (!pending) {
            pending = (async () => {
                if (!window.mermaid) {
                    try { await loadScript('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js'); }
                    catch (_) { await loadScript('https://unpkg.com/mermaid/dist/mermaid.min.js'); }
                }
                window.mermaid.initialize({startOnLoad: false, theme: 'dark', er: {diagramPadding: 20, nodePadding: 15, rankSpacing: 30, edgePadding: 10}});
                return window.mermaid;
            })().catch(error => { pending = null; throw error; });
        }
        return pending;
    };
})();
