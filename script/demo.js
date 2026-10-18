/* 项目演示页：渐进增强，原图和视频链接在无脚本时仍可使用。 */
(() => {
    'use strict';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const imageDialog = document.getElementById('screenDialog');
    const videoDialog = document.getElementById('videoDialog');
    const player = document.getElementById('videoPlayer');
    const videoStatus = document.getElementById('videoStatus');
    const canOpenDialog = typeof imageDialog.showModal === 'function';
    const pad = value => String(value).padStart(2, '0');
    const normalClick = event => event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
    let activeGallery = null;
    let opener = null;
    let previousOverflow = '';

    function openDialog(dialog, trigger) {
        opener = trigger;
        previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        dialog.querySelector('[data-close]').focus({ preventScroll: true });
    }

    [imageDialog, videoDialog].forEach(dialog => {
        dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
        let backdropStart = false;
        const outside = event => {
            const rect = dialog.getBoundingClientRect();
            return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
        };
        dialog.addEventListener('pointerdown', event => { backdropStart = event.target === dialog && outside(event); });
        dialog.addEventListener('click', event => {
            if (backdropStart && event.target === dialog && outside(event)) dialog.close();
            backdropStart = false;
        });
        dialog.addEventListener('close', () => {
            if (dialog === videoDialog) {
                player.pause();
                player.removeAttribute('src');
                player.load();
            }
            document.body.style.overflow = previousOverflow;
            // A modal can switch slides and hide the original link. Return to the current visible slide instead.
            const returnTarget = dialog === imageDialog && activeGallery ? activeGallery.links[activeGallery.index] : opener;
            returnTarget?.focus({ preventScroll: true });
            activeGallery = null;
        });
    });

    function renderImage() {
        if (!activeGallery) return;
        const { root: gallery, slides, links, index } = activeGallery;
        const slide = slides[index];
        const img = slide.querySelector('img');
        const title = slide.querySelector('h3').textContent;
        document.getElementById('screenDialogTitle').textContent = gallery.dataset.title;
        const largeImage = document.getElementById('dialogImage');
        largeImage.src = links[index].href;
        largeImage.alt = img.alt;
        document.getElementById('dialogCaption').textContent = title + ' · ' + slide.dataset.description;
        document.getElementById('originalImage').href = links[index].href;
        document.getElementById('dialogCounter').textContent = pad(index + 1) + ' / ' + pad(slides.length);
    }

    document.querySelectorAll('[data-gallery]').forEach(root => {
        const slides = Array.from(root.querySelectorAll('.screen-slide'));
        const links = slides.map(slide => slide.querySelector('.screen-open'));
        const strip = root.querySelector('.screen-filmstrip');
        const controls = root.querySelector('[data-gallery-controls]');
        const counter = root.querySelector('.screen-counter');
        const gallery = { root, slides, links, index: 0, select: null };
        const thumbs = slides.map((slide, index) => {
            const button = document.createElement('button');
            button.className = 'film-thumb';
            button.type = 'button';
            const title = slide.querySelector('h3').textContent;
            button.setAttribute('aria-label', '查看第 ' + (index + 1) + ' 张：' + title);
            const image = document.createElement('img');
            image.src = slide.querySelector('img').getAttribute('src');
            image.alt = '';
            image.loading = 'lazy';
            const label = document.createElement('span');
            const number = document.createElement('b');
            number.textContent = pad(index + 1);
            const name = document.createElement('em');
            name.textContent = title;
            label.append(number, name);
            button.append(image, label);
            button.addEventListener('click', () => gallery.select(index));
            strip.append(button);
            return button;
        });
        gallery.select = (next, focusThumb = false, scrollThumb = true) => {
            gallery.index = (next + slides.length) % slides.length;
            slides.forEach((slide, index) => { slide.hidden = index !== gallery.index; });
            slides[gallery.index].querySelector('img').loading = 'eager';
            thumbs.forEach((thumb, index) => {
                thumb.setAttribute('aria-pressed', String(index === gallery.index));
                thumb.tabIndex = index === gallery.index ? 0 : -1;
            });
            counter.textContent = pad(gallery.index + 1) + ' / ' + pad(slides.length);
            const thumb = thumbs[gallery.index];
            if (focusThumb) thumb.focus({ preventScroll: true });
            if (scrollThumb) {
                const left = thumb.offsetLeft - strip.offsetLeft;
                if (left < strip.scrollLeft || left + thumb.offsetWidth > strip.scrollLeft + strip.clientWidth) {
                    strip.scrollTo({ left: left - (strip.clientWidth - thumb.offsetWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
                }
            }
            if (imageDialog.open && activeGallery === gallery) renderImage();
        };
        root.querySelector('[data-prev]').addEventListener('click', () => gallery.select(gallery.index - 1));
        root.querySelector('[data-next]').addEventListener('click', () => gallery.select(gallery.index + 1));
        const navigate = (event, focusThumb) => {
            let next;
            if (event.key === 'ArrowLeft') next = gallery.index - 1;
            else if (event.key === 'ArrowRight') next = gallery.index + 1;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = slides.length - 1;
            else return;
            event.preventDefault();
            gallery.select(next, focusThumb);
            if (event.target.closest('.screen-open')) links[gallery.index].focus({ preventScroll: true });
        };
        root.addEventListener('keydown', event => navigate(event, event.target.closest('.film-thumb') !== null));
        let pointer = null;
        let suppressClickUntil = 0;
        const stage = root.querySelector('.screen-stage');
        stage.addEventListener('pointerdown', event => {
            if (event.pointerType !== 'mouse' && event.isPrimary) pointer = { x: event.clientX, y: event.clientY };
        });
        stage.addEventListener('pointercancel', () => { pointer = null; });
        stage.addEventListener('pointerup', event => {
            if (!pointer) return;
            const dx = event.clientX - pointer.x;
            const dy = event.clientY - pointer.y;
            pointer = null;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                suppressClickUntil = performance.now() + 400;
                gallery.select(gallery.index + (dx < 0 ? 1 : -1));
            }
        });
        links.forEach((link, index) => link.addEventListener('click', event => {
            if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
            if (!normalClick(event) || !canOpenDialog) return;
            event.preventDefault();
            activeGallery = gallery;
            gallery.select(index);
            renderImage();
            openDialog(imageDialog, link);
        }));
        gallery.select(0, false, false);
        controls.hidden = false;
        strip.hidden = false;
        root.classList.add('is-interactive');
    });

    document.getElementById('dialogPrev').addEventListener('click', () => activeGallery?.select(activeGallery.index - 1));
    document.getElementById('dialogNext').addEventListener('click', () => activeGallery?.select(activeGallery.index + 1));
    imageDialog.addEventListener('keydown', event => {
        if (!activeGallery) return;
        let next;
        if (event.key === 'ArrowLeft') next = activeGallery.index - 1;
        else if (event.key === 'ArrowRight') next = activeGallery.index + 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = activeGallery.slides.length - 1;
        else return;
        event.preventDefault();
        activeGallery.select(next);
    });

    document.querySelectorAll('[data-video]').forEach(card => card.addEventListener('click', event => {
        if (!normalClick(event) || !canOpenDialog) return;
        event.preventDefault();
        document.getElementById('videoDialogTitle').textContent = card.dataset.title;
        document.getElementById('directVideo').href = card.href;
        player.poster = card.dataset.poster;
        player.src = card.href;
        videoStatus.textContent = '使用播放器控制播放，按 Esc 退出。';
        openDialog(videoDialog, card);
        const play = player.play();
        if (play) play.catch(() => {
            if (videoDialog.open && !player.error) videoStatus.textContent = '点击播放器中的播放按钮开始观看。';
        });
    }));
    player.addEventListener('error', () => {
        if (videoDialog.open) videoStatus.textContent = '视频暂时无法播放，可以通过右侧链接直接打开。';
    });

    const nav = document.querySelector('.project-nav');
    const navLinks = Array.from(nav.querySelectorAll('a'));
    const sections = navLinks.map(link => document.querySelector(link.hash));
    let scheduled = false;
    const updateNav = () => {
        scheduled = false;
        let current = 0;
        const boundary = nav.getBoundingClientRect().height + 55;
        sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= boundary) current = index; });
        navLinks.forEach((link, index) => {
            if (index === current) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    };
    const scheduleNav = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateNav); } };
    window.addEventListener('scroll', scheduleNav, { passive: true });
    window.addEventListener('resize', scheduleNav);
    updateNav();

    if ('IntersectionObserver' in window && !reducedMotion.matches) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.remove('is-reveal-pending');
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, { threshold: .02 });
        document.querySelectorAll('.reveal').forEach(element => {
            element.classList.add('is-reveal-pending');
            observer.observe(element);
        });
    }
})();
