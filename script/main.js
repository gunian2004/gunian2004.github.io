const canvas = document.getElementById('canvas-bg');
const ctx = canvas ? canvas.getContext('2d') : null;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let particles = [];
let animationFrameId = null;

function resizeCanvas() {
    if (!canvas || !ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() { this.reset(); }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += 0.02;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }

    draw() {
        const glowSize = this.size + Math.sin(this.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize * 2);
        gradient.addColorStop(0, `rgba(99, 102, 241, ${this.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function initParticles() {
    if (!canvas || !ctx || motionPreference.matches) {
        particles = [];
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 22000);
    for (let i = 0; i < Math.min(particleCount, 90); i++) particles.push(new Particle());
}

function animate() {
    animationFrameId = null;
    if (!canvas || !ctx || motionPreference.matches || document.hidden) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => { particle.update(); particle.draw(); });
    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - dist / 150)})`;
                ctx.stroke();
            }
        });
    });
    animationFrameId = window.requestAnimationFrame(animate);
}

function startAnimation() {
    if (!animationFrameId && !motionPreference.matches && !document.hidden) {
        animationFrameId = window.requestAnimationFrame(animate);
    }
}

if (canvas && ctx) {
    resizeCanvas();
    initParticles();
    startAnimation();
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
        startAnimation();
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        } else {
            startAnimation();
        }
    });
    const onMotionPreferenceChange = () => {
        if (motionPreference.matches && animationFrameId) {
            window.cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        initParticles();
        startAnimation();
    };
    if (motionPreference.addEventListener) motionPreference.addEventListener('change', onMotionPreferenceChange);
    else if (motionPreference.addListener) motionPreference.addListener(onMotionPreferenceChange);
}

// Project cards get a gentle reveal and pointer-following light, with safe fallbacks.
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    const detail = card.querySelector('.project-detail');
    card.querySelectorAll('.project-expand-btn').forEach(button => {
        button.setAttribute('aria-expanded', 'false');
        if (detail && detail.id) button.setAttribute('aria-controls', detail.id);
    });
});

if (!motionPreference.matches && 'IntersectionObserver' in window) {
    const projectObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('is-reveal-pending');
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    projectCards.forEach(card => {
        card.classList.add('is-reveal-pending');
        projectObserver.observe(card);
    });
}

if (!motionPreference.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    projectCards.forEach(card => {
        card.addEventListener('pointermove', event => {
            const bounds = card.getBoundingClientRect();
            card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
            card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
        });
        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--pointer-x');
            card.style.removeProperty('--pointer-y');
        });
    });
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('hidden');
    }, 800);
});

const sections = document.querySelectorAll('.section');
if (motionPreference.matches || !('IntersectionObserver' in window)) {
    sections.forEach(section => {
        section.style.animationPlayState = 'running';
        if (motionPreference.matches) {
            section.style.opacity = '1';
            section.style.transform = 'none';
        }
    });
} else {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(section => {
        section.style.animationPlayState = 'paused';
        sectionObserver.observe(section);
    });
}

// ========== 工作经历展开与全屏阅读 ==========
function syncExpButtons(box, expanded) {
    const detail = box.querySelector('.exp-box-detail');
    box.querySelectorAll('.exp-box-toggle').forEach(button => {
        button.type = 'button';
        button.setAttribute('aria-expanded', String(expanded));
        if (detail?.id) button.setAttribute('aria-controls', detail.id);
        button.innerHTML = '<span class="toggle-icon" aria-hidden="true">' + (expanded ? '▲' : '▼') + '</span> ' + (expanded ? '收起详情' : '展开详情');
    });
}
document.querySelectorAll('.career-card .exp-box').forEach(box => syncExpButtons(box, false));
function toggleExpBox(boxId) {
    const box = document.getElementById(boxId);
    const detail = box?.querySelector('.exp-box-detail');
    if (!detail) return;
    const expanded = !detail.classList.contains('expanded');
    const focusWasInDetail = detail.contains(document.activeElement);
    detail.classList.toggle('expanded', expanded);
    detail.hidden = !expanded;
    syncExpButtons(box, expanded);
    if (!expanded) {
        if (focusWasInDetail) box.querySelector('.exp-box-toggle')?.focus({ preventScroll: true });
        box.closest('.career-card')?.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'start' });
    }
}
const expFullscreenModalEl = document.getElementById('expFullscreenModal');
let experienceOpener = null;
let experiencePreviousOverflow = '';
function openExpFullscreen(boxId) {
    const box = document.getElementById(boxId);
    const detailInner = box?.querySelector('.exp-box-detail-inner');
    if (!detailInner || !expFullscreenModalEl || typeof expFullscreenModalEl.showModal !== 'function' || expFullscreenModalEl.open) return;
    const item = box.closest('.experience-item');
    const body = document.getElementById('expFullscreenBody');
    document.getElementById('expFullscreenTitle').textContent = item.querySelector('.exp-title').textContent + ' — ' + item.querySelector('.exp-company').textContent;
    body.replaceChildren(...Array.from(detailInner.childNodes, node => node.cloneNode(true)));
    experienceOpener = document.activeElement;
    experiencePreviousOverflow = document.body.style.overflow;
    expFullscreenModalEl.showModal();
    document.body.classList.add('exp-fullscreen-open');
    document.body.style.overflow = 'hidden';
    body.scrollTop = 0;
    expFullscreenModalEl.querySelector('.exp-fullscreen-close').focus({ preventScroll: true });
}
function closeExpFullscreen() {
    if (expFullscreenModalEl?.open) expFullscreenModalEl.close();
}
expFullscreenModalEl?.addEventListener('close', () => {
    document.body.classList.remove('exp-fullscreen-open');
    document.body.style.overflow = experiencePreviousOverflow;
    if (experienceOpener?.isConnected) experienceOpener.focus({ preventScroll: true });
    experienceOpener = null;
});

// ========== 项目卡片展开/收起 ==========
function toggleProject(projId) {
    const card = document.getElementById(projId);
    if (!card) return;
    setProjectExpanded(card, !card.classList.contains('expanded'));
}

function setProjectExpanded(card, expanded) {
    card.classList.toggle('expanded', expanded);
    const detail = card.querySelector('.project-detail');
    card.querySelectorAll('.project-expand-btn').forEach(button => {
        button.setAttribute('aria-expanded', String(expanded));
        if (detail && detail.id) button.setAttribute('aria-controls', detail.id);
    });
}
// ========== ERP 项目截图大图查看 ==========
const erpImageDialog = document.getElementById('erpImageDialog');
const erpImageTrigger = document.querySelector('.project-image-trigger[aria-controls="erpImageDialog"]');
const erpImageClose = erpImageDialog?.querySelector('.project-image-close');

if (erpImageDialog && erpImageTrigger && erpImageClose && typeof erpImageDialog.showModal === 'function') {
    let erpImageOpener = null;

    erpImageTrigger.addEventListener('click', () => {
        erpImageOpener = erpImageTrigger;
        erpImageDialog.showModal();
        erpImageClose.focus({ preventScroll: true });
    });

    erpImageClose.addEventListener('click', () => erpImageDialog.close());

    // 点击原生 dialog 的遮罩区域关闭；点击图片或内容区不会关闭。
    erpImageDialog.addEventListener('click', event => {
        if (event.target === erpImageDialog) erpImageDialog.close();
    });

    // 原生 Esc 取消事件会关闭 dialog，再把焦点交还给触发按钮。
    erpImageDialog.addEventListener('close', () => {
        if (erpImageOpener?.isConnected) erpImageOpener.focus({ preventScroll: true });
        erpImageOpener = null;
    });
}

// 首屏流程：手动切换，支持方向键与 Home / End。
const labTabList = document.querySelector('.lab-flow[role="tablist"]');
if (labTabList) {
    const tabs = Array.from(labTabList.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    const links = labTabList.querySelectorAll('.lab-flow-link');
    function selectLabTab(index, moveFocus = false) {
        tabs.forEach((tab, i) => {
            const selected = i === index;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            tab.classList.toggle('lab-flow-node-active', selected);
            panels[i].hidden = !selected;
        });
        links.forEach((link, i) => link.classList.toggle('is-complete', i < index));
        if (moveFocus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectLabTab(index));
        tab.addEventListener('keydown', event => {
            let next;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = tabs.length - 1;
            if (next === undefined) return;
            event.preventDefault();
            selectLabTab(next, true);
        });
    });
    selectLabTab(1);
    document.querySelector('.lab-stories').classList.add('is-interactive');
    labTabList.hidden = false;
}

// 分类使用现有项目数据；同一项目可以属于多个方向。
const projectToolbar = document.querySelector('.project-toolbar');
const projectFilters = Array.from(document.querySelectorAll('[data-project-filter]'));
const filterStatus = document.querySelector('.project-filter-status');
const filterAnimations = new WeakMap();
let activeProjectFilter = 'all';
function matchesProjectFilter(card, filter) {
    return filter === 'all' || (card.dataset.categories || '').split(' ').includes(filter);
}
function applyProjectFilter(filter, animate = true) {
    activeProjectFilter = filter;
    let count = 0;
    projectCards.forEach(card => {
        filterAnimations.get(card)?.cancel();
        const visible = matchesProjectFilter(card, filter);
        card.hidden = !visible;
        if (!visible) return;
        // 筛选展示的卡片直接可见，避免滚动观察器留下待显示状态。
        card.classList.remove('is-reveal-pending');
        card.classList.add('is-revealed');
        if (animate && !motionPreference.matches && typeof card.animate === 'function') {
            filterAnimations.set(card, card.animate([
                { opacity: 0, transform: 'translateY(10px)' },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 260, delay: Math.min(count * 30, 120), fill: 'backwards', easing: 'ease-out' }));
        }
        count++;
    });
    projectFilters.forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.projectFilter === filter));
    });
    if (filterStatus) filterStatus.textContent = filter === 'all'
        ? `展示全部 ${count} 个项目` : `展示 ${count} 个相关项目`;
}
if (projectToolbar) {
    projectFilters.forEach(button => {
        const filter = button.dataset.projectFilter;
        button.querySelector('.filter-count').textContent = Array.from(projectCards)
            .filter(card => matchesProjectFilter(card, filter)).length;
        button.addEventListener('click', () => applyProjectFilter(filter));
    });
    projectToolbar.hidden = false;
}

// 实践笔记与首屏案例链接共用定位逻辑。
let caseHighlightTimer;
let highlightedCase = null;
function revealProjectCase(card, moveFocus = false) {
    if (!matchesProjectFilter(card, activeProjectFilter)) applyProjectFilter('all', false);
    if (card.classList.contains('project-card-expandable')) setProjectExpanded(card, true);
    card.classList.remove('is-reveal-pending');
    card.classList.add('is-revealed');
    filterAnimations.get(card)?.cancel();
    highlightedCase?.classList.remove('is-case-target');
    clearTimeout(caseHighlightTimer);
    highlightedCase = card;
    card.classList.add('is-case-target');
    caseHighlightTimer = setTimeout(() => {
        card.classList.remove('is-case-target');
        highlightedCase = null;
    }, 2600);
    if (moveFocus) {
        const heading = card.querySelector('.project-title');
        if (heading) {
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
        }
    }
    card.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'start' });
}
function projectFromHash(hash) {
    if (!hash) return null;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
    const target = document.getElementById(id);
    return target?.matches('.project-card') ? target : null;
}
document.querySelectorAll('a[href^="#proj"]').forEach(link => {
    link.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const hash = link.getAttribute('href');
        const card = projectFromHash(hash);
        if (!card) return;
        event.preventDefault();
        if (window.location.hash !== hash) history.pushState(null, '', hash);
        revealProjectCase(card, true);
    });
});
window.addEventListener('hashchange', () => {
    const card = projectFromHash(window.location.hash);
    if (card) revealProjectCase(card);
});
const initialProjectCase = projectFromHash(window.location.hash);
if (initialProjectCase) {
    // 等待首次布局与浏览器的原生锚点定位后再校正位置。
    window.addEventListener('load', () => requestAnimationFrame(() => revealProjectCase(initialProjectCase)), { once: true });
}

// 关于我：观察器就绪后才启用依次入场，无 JS 时内容保持可读。
const aboutLayout = document.querySelector('.about-layout');
if (aboutLayout && !motionPreference.matches && 'IntersectionObserver' in window) {
    const aboutObserver = new IntersectionObserver((entries, observer) => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        aboutLayout.classList.remove('is-about-pending');
        aboutLayout.classList.add('is-about-visible');
        observer.disconnect();
    }, { threshold: 0.08 });
    aboutLayout.classList.add('is-about-pending');
    aboutObserver.observe(aboutLayout);
}

// 后半页卡片依次出现；减少动态效果或无观察器时直接展示。
const footerRevealCards = document.querySelectorAll('[data-footer-reveal]');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove('is-footer-pending');
            entry.target.classList.add('is-footer-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.05 });
    footerRevealCards.forEach((card, index) => {
        card.style.setProperty('--footer-delay', ((index % 3) * 55) + 'ms');
        card.classList.add('is-footer-pending');
        footerObserver.observe(card);
    });
}

// 复制仅在访客点击时执行；失败时展示可手动复制的地址。
const copyGithubButton = document.getElementById('copyGithub');
const contactCopyStatus = document.getElementById('contactCopyStatus');
if (copyGithubButton && contactCopyStatus) {
    const githubAddress = 'https://github.com/gunian2004';
    let copying = false;
    copyGithubButton.hidden = false;
    copyGithubButton.addEventListener('click', async () => {
        if (copying) return;
        copying = true;
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(githubAddress);
            contactCopyStatus.textContent = 'GitHub 地址已复制。';
            document.querySelector('.contact-copy-manual')?.remove();
        } catch {
            let manualAddress = document.querySelector('.contact-copy-manual');
            if (!manualAddress) {
                manualAddress = document.createElement('input');
                manualAddress.className = 'contact-copy-manual';
                manualAddress.type = 'text';
                manualAddress.readOnly = true;
                manualAddress.value = githubAddress;
                manualAddress.setAttribute('aria-label', '请手动复制 GitHub 地址');
                contactCopyStatus.after(manualAddress);
            }
            contactCopyStatus.textContent = '请手动复制下方已选中的地址。';
            manualAddress.focus({ preventScroll: true });
            manualAddress.select();
        } finally {
            copying = false;
        }
    });
}
