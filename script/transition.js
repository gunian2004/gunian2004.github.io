(function() {
    'use strict';

    const TRANSITION_DURATION = 1000;
    const PARTICLE_COUNT = 24;

    let overlay = null;
    let portalCircle = null;
    let portalRing = null;
    let particleContainer = null;
    let energyBurst = null;
    let centerGlow = null;
    let flashOverlay = null;

    function createElements() {
        overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';

        const portalContainer = document.createElement('div');
        portalContainer.className = 'portal-container';

        portalCircle = document.createElement('div');
        portalCircle.className = 'portal-circle';

        portalRing = document.createElement('div');
        portalRing.className = 'portal-ring';

        particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';

        energyBurst = document.createElement('div');
        energyBurst.className = 'energy-burst';

        centerGlow = document.createElement('div');
        centerGlow.className = 'center-glow';

        flashOverlay = document.createElement('div');
        flashOverlay.className = 'flash-overlay';

        portalContainer.appendChild(portalCircle);
        portalContainer.appendChild(portalRing);
        portalContainer.appendChild(particleContainer);
        portalContainer.appendChild(energyBurst);
        portalContainer.appendChild(centerGlow);

        overlay.appendChild(portalContainer);
        overlay.appendChild(flashOverlay);
        document.body.appendChild(overlay);
    }

    function createParticles(isEntering, colorStyle) {
        particleContainer.innerHTML = '';
        
        const hueRange = colorStyle === 'gentle' ? 40 : 100;
        const hueStart = colorStyle === 'gentle' ? 200 : 180;
        
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (i / PARTICLE_COUNT) * 360;
            const radius = 100 + Math.random() * 50;
            const tx = Math.cos(angle * Math.PI / 180) * radius;
            const ty = Math.sin(angle * Math.PI / 180) * radius;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            const hue = hueStart + (i / PARTICLE_COUNT) * hueRange;
            particle.style.background = `hsl(${hue}, 80%, 65%)`;
            particle.style.boxShadow = `0 0 10px hsl(${hue}, 80%, 65%)`;
            
            const delay = Math.random() * 0.2;
            particle.style.animationDelay = `${delay}s`;
            
            particle.classList.add(isEntering ? 'spiral-in' : 'spiral-out');
            particleContainer.appendChild(particle);
        }
    }

    function setPortalPosition(x, y) {
        const container = portalCircle.parentElement;
        container.style.position = 'fixed';
        container.style.left = x + 'px';
        container.style.top = y + 'px';
    }

    function playEnterAnimation(targetUrl, startX, startY, colorStyle) {
        if (colorStyle === 'gentle') {
            overlay.classList.add('gentle');
        } else {
            overlay.classList.remove('gentle');
        }
        
        overlay.classList.add('active');
        
        setPortalPosition(startX, startY);
        
        createParticles(true, colorStyle);
        
        portalCircle.classList.add('expand');
        portalRing.classList.add('expand');
        
        setTimeout(() => {
            energyBurst.classList.add('active');
        }, 300);
        
        setTimeout(() => {
            flashOverlay.classList.add('active');
        }, TRANSITION_DURATION * 0.7);
        
        setTimeout(() => {
            window.location.href = targetUrl;
        }, TRANSITION_DURATION * 0.85);
    }

    function playExitAnimation(targetUrl, colorStyle) {
        if (colorStyle === 'gentle') {
            overlay.classList.add('gentle');
        } else {
            overlay.classList.remove('gentle');
        }
        
        overlay.classList.add('active');
        
        createParticles(false, colorStyle);
        
        centerGlow.classList.add('active');
        
        setTimeout(() => {
            portalCircle.classList.add('contract');
        }, 200);
        
        setTimeout(() => {
            portalRing.classList.add('expand');
        }, 300);
        
        setTimeout(() => {
            flashOverlay.classList.add('active');
        }, TRANSITION_DURATION * 0.7);
        
        setTimeout(() => {
            window.location.href = targetUrl;
        }, TRANSITION_DURATION * 0.85);
    }

    function resetElements() {
        overlay.classList.remove('active');
        portalCircle.classList.remove('expand', 'contract');
        portalRing.classList.remove('expand');
        energyBurst.classList.remove('active');
        centerGlow.classList.remove('active');
        flashOverlay.classList.remove('active');
        particleContainer.innerHTML = '';
    }

    window.TransitionManager = {
        init: function() {
            createElements();
        },
        
        toAI: function(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            const btn = event.currentTarget;
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            playEnterAnimation('AI.html', centerX, centerY, 'vibrant');
        },
        
        toDemo: function(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            const btn = event.currentTarget;
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            playEnterAnimation('demo.html', centerX, centerY, 'gentle');
        },
        
        toIndex: function(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            const btn = event.currentTarget;
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            playEnterAnimation('index.html', centerX, centerY, 'gentle');
        },

        toTool: function(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            const btn = event.currentTarget;
            const rect = btn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            playEnterAnimation('tool.html', centerX, centerY, 'vibrant');
        },

        isTransitioning: false
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.TransitionManager.init();
        });
    } else {
        window.TransitionManager.init();
    }
})();
