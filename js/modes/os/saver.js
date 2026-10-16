/* ==========================================================================
   SCREEN SAVER — after a few minutes of nothing, winged cursors fly across a
   black screen, nose first, flapping. Any key, click, wheel turn or real
   movement of the mouse ends it (and is swallowed, so it does not click
   anything). General Controls sets when it starts; Pear menu > Screen Saver
   starts it now. It never runs for people who asked for less motion.
   ========================================================================== */
import { reducedMotion } from '../../core/util.js';

const ARROW = [
    'k...........', 'kk..........', 'kwk.........', 'kwwk........', 'kwwwk.......', 'kwwwwk......', 'kwwwwwk.....', 'kwwwwwwk....', 'kwwwwwwwk...',
    'kwwwwwwwwk..', 'kwwwwwwwwwk.', 'kwwwwwwkkkkk', 'kwwkwwk.....', 'kwk.kwwk....', 'kk..kwwk....', 'k....kwwk...', '.....kwwk...', '......kk....'
];
const LEAF = [[0, 0], [2, -2.4], [6, -4.4], [10.5, -4.6], [14, -3.2], [12.2, -1.6], [14.4, 0.2], [10.8, 1.4], [6.2, 2.4], [2, 1.8]];
const FW = 40;
const FH = 26;

const inPoly = (px, py, poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
};

/** one wing, as pixels: a leaf turned `deg` degrees around where it joins the cursor */
function wing(deg, flip) {
    const a = (deg * Math.PI) / 180;
    const poly = LEAF.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]);
    const out = [];
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            const lx = flip ? 15 - x - 0.5 : x + 0.5;
            if (inPoly(lx, y + 0.5 - 8, poly)) out.push([x, y]);
        }
    }
    return out;
}

/** the four steps of a flap: level, up, level, down; each a small canvas, and a twice-as-big copy for the near ones */
let SPRITES = null;
function sprites() {
    if (SPRITES) return SPRITES;
    const make = (deg) => {
        const c = document.createElement('canvas');
        c.width = FW;
        c.height = FH;
        const x = c.getContext('2d');
        x.fillStyle = '#c4c4c4';
        wing(deg, false).forEach(([px, py]) => x.fillRect(16 + px, py + 1, 1, 1));
        wing(deg, true).forEach(([px, py]) => x.fillRect(px - 2, py + 4, 1, 1));
        ARROW.forEach((row, y) => [...row].forEach((ch, xx) => {
            if (ch === '.') return;                                           // k is the black outline: it parts the cursor from its wings
            x.fillStyle = ch === 'w' ? '#ffffff' : '#000000';
            x.fillRect(14 + xx, 4 + y, 1, 1);
        }));
        const big = document.createElement('canvas');
        big.width = FW * 2;
        big.height = FH * 2;
        const bx = big.getContext('2d');
        bx.imageSmoothingEnabled = false;
        bx.drawImage(c, 0, 0, FW * 2, FH * 2);
        return { small: c, big };
    };
    const level = make(-6);
    SPRITES = [level, make(-42), level, make(38)];
    return SPRITES;
}

export const saverAvailable = () => !reducedMotion() && !window.matchMedia('(pointer: coarse)').matches;

/**
 * @param {{parent: HTMLElement, getMinutes: () => number, busy: () => boolean}} o
 *   parent: the screen it covers; getMinutes: 0 = never; busy: true while something (a dialog) must not be covered
 */
export function createSaver({ parent, getMinutes, busy }) {
    let layer = null;
    let cv = null;
    let g = null;
    let items = [];
    let raf = 0;
    let running = false;
    let armed = false;
    let poll = 0;
    let last = Date.now();
    let startedAt = 0;
    let pos = { x: 0, y: 0 };
    let from = { x: 0, y: 0 };
    let prev = 0;

    function spawn(scatter) {
        const w = cv.width;
        const h = cv.height;
        const near = Math.random() < 0.4;
        return {
            near,
            x: scatter ? Math.random() * (w + 40) : w + Math.random() * 120,
            y: scatter ? Math.random() * (h + 20) : Math.random() * h + 40,
            v: near ? 34 + Math.random() * 14 : 18 + Math.random() * 10,       // low-res pixels a second
            phase: Math.random() * 4
        };
    }

    function frame(now) {
        if (!running) return;
        const dt = Math.min(0.1, (now - (prev || now)) / 1000);
        prev = now;
        g.fillStyle = '#000';
        g.fillRect(0, 0, cv.width, cv.height);
        const step = Math.floor(now / 150);
        items.sort((a, b) => a.near - b.near).forEach((it, i) => {
            it.x -= it.v * dt * 0.86;
            it.y -= it.v * dt * 0.52;
            const sp = sprites()[(step + Math.floor(it.phase)) % 4];
            const s = it.near ? sp.big : sp.small;
            if (it.x < -s.width || it.y < -s.height) Object.assign(it, spawn(false), { near: it.near });
            g.drawImage(s, Math.round(it.x), Math.round(it.y));
        });
        raf = requestAnimationFrame(frame);
    }

    function fit() {
        cv.width = Math.ceil(window.innerWidth / 2);                             // one pixel of art is two on the glass
        cv.height = Math.ceil(window.innerHeight / 2);
        g.imageSmoothingEnabled = false;
    }

    function end(e) {
        if (!running) return;
        window.removeEventListener('resize', fit);
        if (e) { e.stopPropagation(); if (e.cancelable && e.type !== 'pointermove') e.preventDefault(); }
        running = false;
        cancelAnimationFrame(raf);
        layer.hidden = true;
        last = Date.now();
    }

    function onActivity(e) {
        if (e.type === 'pointermove' || e.type === 'pointerdown') pos = { x: e.clientX, y: e.clientY };
        if (!running) { last = Date.now(); return; }
        if (Date.now() - startedAt < 450) return;                                // a hand that is still moving from before
        if (e.type === 'pointermove' && Math.hypot(e.clientX - from.x, e.clientY - from.y) < 8) return;
        end(e);
    }

    function check() {
        const min = getMinutes();
        if (running || !min || document.hidden || busy() || !saverAvailable()) return;
        if (Date.now() - last >= min * 60000) start();
    }

    function start() {
        if (running || !saverAvailable()) return;
        if (!layer) {
            layer = document.createElement('div');
            layer.className = 'saver';
            layer.setAttribute('aria-hidden', 'true');
            cv = document.createElement('canvas');
            layer.appendChild(cv);
            parent.appendChild(layer);
            g = cv.getContext('2d');
        }
        fit();
        window.addEventListener('resize', fit);
        const n = Math.max(6, Math.min(16, Math.round((cv.width * cv.height) / 9000)));
        items = Array.from({ length: n }, () => spawn(true));
        layer.hidden = false;
        running = true;
        startedAt = Date.now();
        from = { ...pos };
        prev = 0;
        raf = requestAnimationFrame(frame);
    }

    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'];
    return {
        get running() { return running; },
        start,
        arm() {
            if (armed) return;
            armed = true;
            last = Date.now();
            events.forEach((t) => window.addEventListener(t, onActivity, { capture: true, passive: false }));
            poll = setInterval(check, 4000);
        },
        disarm() {
            if (!armed) return;
            armed = false;
            clearInterval(poll);
            events.forEach((t) => window.removeEventListener(t, onActivity, { capture: true }));
            if (running) end();
        }
    };
}
