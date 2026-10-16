/* ==========================================================================
   DOT GRID — the quiet dotted background of the Terminal.
   Ported from v6's Three.js points to two 2D canvases: a static layer drawn
   once, and a small live layer with only the dots near the pointer (they swell
   and glow). With no pointer (touch) a target wanders by itself, like in v6.
   ========================================================================== */

const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function createDotGrid(host, { animate = true } = {}) {
    const back = document.createElement('canvas');
    const front = document.createElement('canvas');
    host.append(back, front);

    const R = 150;                       // pointer influence radius (px)
    let rgb = [214, 214, 214];              // mono, the default theme; cli.js sets the real colour
    let sprite = null;
    let W = 0, H = 0, dpr = 1, step = 26, cols = 0, rows = 0, ox = 0, oy = 0;
    let raf = 0, running = false, hasPointer = false;
    const p = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    const fine = window.matchMedia('(pointer: fine)').matches;

    function makeSprite() {
        const s = 32;
        sprite = document.createElement('canvas');
        sprite.width = sprite.height = s;
        const g = sprite.getContext('2d');
        const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        grad.addColorStop(0, `rgba(${rgb},1)`);
        grad.addColorStop(0.5, `rgba(${rgb},0.85)`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = grad;
        g.fillRect(0, 0, s, s);
    }

    function drawStatic() {
        const g = back.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        g.globalAlpha = 0.12;
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) g.drawImage(sprite, ox + i * step - 2.2, oy + j * step - 2.2, 4.4, 4.4);
        }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = host.clientWidth;
        H = host.clientHeight;
        if (!W || !H) return;
        [back, front].forEach((c) => {
            c.width = Math.round(W * dpr);
            c.height = Math.round(H * dpr);
            c.style.width = W + 'px';
            c.style.height = H + 'px';
        });
        step = Math.max(20, Math.min(30, W / 54));
        cols = Math.ceil(W / step) + 2;
        rows = Math.ceil(H / step) + 2;
        ox = (W - (cols - 1) * step) / 2;
        oy = (H - (rows - 1) * step) / 2;
        if (!sprite) makeSprite();
        drawStatic();
    }

    function frame(now) {
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;
        const t = now / 1000;
        if (!hasPointer) {
            p.tx = W / 2 + Math.sin(t * 0.21) * W * 0.34;
            p.ty = H / 2 + Math.cos(t * 0.16) * H * 0.3;
        }
        p.x += (p.tx - p.x) * 0.1;
        p.y += (p.ty - p.y) * 0.1;

        const g = front.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        const i0 = Math.max(0, Math.floor((p.x - R - ox) / step));
        const i1 = Math.min(cols - 1, Math.ceil((p.x + R - ox) / step));
        const j0 = Math.max(0, Math.floor((p.y - R - oy) / step));
        const j1 = Math.min(rows - 1, Math.ceil((p.y + R - oy) / step));
        for (let j = j0; j <= j1; j++) {
            for (let i = i0; i <= i1; i++) {
                const x = ox + i * step;
                const y = oy + j * step;
                const d = Math.hypot(x - p.x, y - p.y);
                if (d >= R) continue;
                const k = 1 - d / R;
                const s = k * k * (3 - 2 * k);              // smoothstep
                const size = 4.4 + s * 9;
                g.globalAlpha = 0.1 + s * 0.55;
                g.drawImage(sprite, x - size / 2, y - size / 2, size, size);
            }
        }
    }

    const onMove = (e) => { hasPointer = true; p.tx = e.clientX; p.ty = e.clientY; };

    return {
        start() {
            if (running) return;
            running = true;
            resize();
            window.addEventListener('resize', resize);
            if (animate) {
                if (fine) window.addEventListener('pointermove', onMove, { passive: true });
                raf = requestAnimationFrame(frame);
            }
        },
        stop() {
            running = false;
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
        },
        setColor(hex) {
            rgb = hexToRgb(hex);
            makeSprite();
            if (W) drawStatic();
        },
        resize
    };
}
