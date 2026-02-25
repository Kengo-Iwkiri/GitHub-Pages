/* ── パーティクル + 背景BLOB ── */
(function () {
    const cv = document.getElementById('bg-canvas');
    if (!cv) return;
    const cx = cv.getContext('2d');
    let W, H;
    function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    // blobs
    const blobs = [
        { x: W * 0.82, y: H * 0.3, r: 260, vx: 0.18, vy: 0.12, color: 'rgba(255,45,85,' },
        { x: W * 0.1, y: H * 0.7, r: 200, vx: -0.14, vy: -0.1, color: 'rgba(0,240,255,' },
        { x: W * 0.5, y: H * 0.15, r: 180, vx: 0.08, vy: 0.15, color: 'rgba(255,45,85,' },
    ];

    // particles
    const pts = [];
    for (let i = 0; i < 60; i++) pts.push({
        x: Math.random() * 1920, y: Math.random() * 1080,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        r: Math.random() * 1.4 + 0.3,
        red: Math.random() > .55
    });

    let t = 0;
    function draw() {
        t += 0.005;
        cx.clearRect(0, 0, W, H);

        // blobs
        blobs.forEach(b => {
            b.x += b.vx; b.y += b.vy;
            if (b.x < -b.r || b.x > W + b.r) b.vx *= -1;
            if (b.y < -b.r || b.y > H + b.r) b.vy *= -1;
            const g = cx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
            g.addColorStop(0, b.color + '0.06)');
            g.addColorStop(1, b.color + '0)');
            cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            cx.fillStyle = g; cx.fill();
        });

        // particles
        pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            cx.fillStyle = p.red ? 'rgba(255,45,85,0.5)' : 'rgba(0,240,255,0.4)';
            cx.fill();
        });

        // connections
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
            if (d < 130) {
                cx.beginPath(); cx.moveTo(pts[i].x, pts[i].y); cx.lineTo(pts[j].x, pts[j].y);
                cx.strokeStyle = `rgba(255,255,255,${(1 - d / 130) * 0.06})`; cx.lineWidth = .5; cx.stroke();
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

/* ── ナビスクロール ── */
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── スムーズスクロール ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        e.preventDefault();
        const id = this.getAttribute('href').slice(1);
        if (!id) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        const el = document.getElementById(id);
        const nav = document.querySelector('nav');
        if (el && nav) { 
            const h = nav.offsetHeight; 
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - h, behavior: 'smooth' }); 
        }
    });
});

/* ── FAQ ── */
document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (q) q.addEventListener('click', () => item.classList.toggle('open'));
});

/* ── マグネットボタン ── */
document.querySelectorAll('.btn-red,.btn-outline-cyan').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        btn.style.setProperty('--mx', x + '%');
        btn.style.setProperty('--my', y + '%');
        const inner = btn.querySelector('.btn-inner');
        if (inner) {
            const dx = (e.clientX - r.left - r.width / 2) * 0.12;
            const dy = (e.clientY - r.top - r.height / 2) * 0.12;
            inner.style.transform = `translate(${dx}px,${dy}px)`;
        }
    });
    btn.addEventListener('mouseleave', e => {
        const inner = btn.querySelector('.btn-inner');
        if (inner) inner.style.transform = 'translate(0,0)';
    });
});

/* ── スクロールリビール ── */
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('on');
            // VS行を順次リビール
            if (e.target.classList.contains('vs-wrap')) {
                e.target.querySelectorAll('.vs-row').forEach((r, i) => {
                    setTimeout(() => r.classList.add('on'), i * 80);
                });
            }
            // ステップラインをアニメ
            if (e.target.classList.contains('steps-row')) {
                e.target.classList.add('on');
            }
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale,.steps-row').forEach(el => obs.observe(el));
