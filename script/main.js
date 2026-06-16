const canvas = document.getElementById('canvas-bg');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }

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

        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        const glowSize = this.size + Math.sin(this.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowSize * 2
        );
        gradient.addColorStop(0, `rgba(0, 212, 255, ${this.opacity * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < Math.min(particleCount, 150); i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - dist / 150)})`;
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

resizeCanvas();
initParticles();
animate();

const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursor-dot');

document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX - 3 + 'px';
    cursorDot.style.top = e.clientY - 3 + 'px';

    setTimeout(() => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    }, 50);
});

document.querySelectorAll('a, button, .skill-tag').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.borderColor = '#ff00aa';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = '#00d4ff';
    });
});

window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 800);
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    section.style.animationPlayState = 'paused';
    observer.observe(section);
});

// ========== 实习经历折叠盒子交互 ==========
function toggleExpBox(boxId) {
    const box = document.getElementById(boxId);
    const detail = box.querySelector('.exp-box-detail');
    const previewActions = box.querySelector('.exp-box-preview .exp-box-actions');
    const isExpanded = detail.classList.contains('expanded');

    if (isExpanded) {
        detail.classList.remove('expanded');
        // 滚动到盒子位置
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        detail.classList.add('expanded');
    }
}

function openExpFullscreen(boxId) {
    const box = document.getElementById(boxId);
    const detailInner = box.querySelector('.exp-box-detail-inner');
    const modal = document.getElementById('expFullscreenModal');
    const body = document.getElementById('expFullscreenBody');
    const title = document.getElementById('expFullscreenTitle');

    // 获取经历标题
    const expItem = box.closest('.experience-item');
    const expTitle = expItem.querySelector('.exp-title').textContent;
    const expCompany = expItem.querySelector('.exp-company').textContent;
    title.textContent = expTitle + ' — ' + expCompany;

    // 克隆内容到模态框
    body.innerHTML = detailInner.innerHTML;

    // 显示模态框 + 隐藏导航按钮
    modal.classList.add('active');
    document.body.classList.add('exp-fullscreen-open');
    document.body.style.overflow = 'hidden';

    // 滚动到顶部
    body.scrollTop = 0;
}

function closeExpFullscreen() {
    const modal = document.getElementById('expFullscreenModal');
    modal.classList.remove('active');
    document.body.classList.remove('exp-fullscreen-open');
    document.body.style.overflow = '';
}

// ESC 关闭全屏
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeExpFullscreen();
    }
});

// 点击遮罩关闭全屏
document.getElementById('expFullscreenModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeExpFullscreen();
    }
});

// ========== 项目卡片展开/收起 ==========
function toggleProject(projId) {
    const card = document.getElementById(projId);
    card.classList.toggle('expanded');
}
