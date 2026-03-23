(function() {
    const canvas = document.getElementById('stars-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    const PARTICLE_COUNT = 720;
    const PARTICLE_COLOR = '#22D3EE';
    const CONNECT_DISTANCE = 90;
    const MOUSE_RADIUS = 220;
    const TRAIL_ALPHA = 0.18;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    class Particle {
        constructor() {
            this.x = random(0, width);
            this.y = random(0, height);
            this.vx = (Math.random() - 0.5) * 1.05;
            this.vy = (Math.random() - 0.5) * 1.05;
            this.size = random(0.35, 1.6);
            this.opacity = random(0.08, 0.42);
            this.glow = 0;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle) * force * 15;
                this.y -= Math.sin(angle) * force * 15;
                this.glow = force * 0.8;
            } else {
                this.glow *= 0.9;
            }
        }

        draw() {
            const radius = this.size + this.glow * 1.7;
            const alpha = Math.min(1, this.opacity + this.glow);

            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = PARTICLE_COLOR;
            ctx.globalAlpha = alpha;
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        ctx.lineWidth = 0.6;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            let neighbors = [];

            for (let j = 0; j < particles.length; j++) {
                if (i === j) continue;
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DISTANCE) {
                    neighbors.push({ particle: p2, dist: dist });
                }
            }

            neighbors.sort((a, b) => a.dist - b.dist);

            const limit = Math.min(12, neighbors.length);
            for (let k = 0; k < limit; k++) {
                const p2 = neighbors[k].particle;
                const dist = neighbors[k].dist;

                const lineOpacity = Math.min(0.35,
                    (1 - dist / CONNECT_DISTANCE) * 0.12 +
                    (p1.glow + p2.glow) * 0.18
                );

                if (lineOpacity > 0.01) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = PARTICLE_COLOR;
                    ctx.globalAlpha = lineOpacity;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.fillStyle = `rgba(13, 14, 19, ${TRAIL_ALPHA})`;
        ctx.fillRect(0, 0, width, height);

        for (const particle of particles) {
            particle.update();
        }

        drawConnections();

        for (const particle of particles) {
            particle.draw();
        }

        ctx.globalAlpha = 1;

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        for (const p of particles) {
            if (p.x > width) p.x = random(0, width);
            if (p.y > height) p.y = random(0, height);
        }
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    init();
    animate();
})();
