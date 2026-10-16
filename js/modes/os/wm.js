/* ==========================================================================
   WINDOW MANAGER — opening, stacking, dragging, resizing, zooming and rolling
   up the windows of the Desktop.
   The System 7 way: dragging and resizing move an outline and the window
   follows when you let go (switch on "Show contents" in General Controls for
   live dragging). A double-click on the title bar rolls the window up.
   On a narrow glass (a phone) every window fills the screen, one at a time.
   ========================================================================== */
import { Sound } from '../../core/sound.js';
import { Memory } from './memory.js';
import { Store } from '../../core/store.js';
import { Settings } from '../../core/settings.js';
import { attachScrollbar } from './scroll.js';
import { zoomRects } from './zoomrects.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rectOf = (src) => (src instanceof Element ? src.getBoundingClientRect() : src || null);

export function createWM({ desktop, screen }) {
    const wins = [];                 // bottom -> top
    const byId = new Map();
    const subs = new Set();
    let active = null;
    let cascade = 0;

    const narrow = () => screen.clientWidth <= 560;
    const area = () => ({ w: desktop.clientWidth, h: desktop.clientHeight });
    const emit = (type, win) => subs.forEach((fn) => fn(type, win));

    const geom = () => Store.get('geom', {});
    function saveGeom(win) {
        if (win.zoomed || win.shaded) return;
        const g = geom();
        g[win.id] = { x: win.x, y: win.y, ...(win.resizable ? { w: win.w, h: win.h } : {}) };
        Store.set('geom', g);
    }

    /* ----- geometry ----- */
    function place(win, x, y) {
        x = Math.round(x);                       // whole pixels only: a half pixel would blur the 1px System 7 borders
        y = Math.round(y);
        win.x = x;
        win.y = y;
        win.el.style.left = x + 'px';
        win.el.style.top = y + 'px';
    }
    function size(win, w, h) {
        w = Math.round(w);
        h = Math.round(h);
        win.w = w;
        win.h = h;
        win.el.style.width = w + 'px';
        win.el.style.height = h + 'px';
        win.sb?.sync();
    }
    /** the title bar must always stay reachable */
    function clampPos(win, x, y) {
        const a = area();
        return { x: clamp(x, 64 - win.w, a.w - 64), y: clamp(y, 0, Math.max(0, a.h - 24)) };
    }
    const clientRect = (win) => win.el.getBoundingClientRect();
    /** the "standard" size a zoom box goes to: the whole desktop, or for a document just what its text needs */
    const ideal = (win) => {
        const a = area();
        if (!win.opts.fit) return { x: 8, y: 6, w: a.w - 24, h: a.h - 18 };
        const chrome = win.el.offsetHeight - win.scroller.clientHeight;
        const w = Math.min(win.opts.idealW || 560, a.w - 24);
        const h = Math.min(a.h - 18, Math.max(win.opts.minH || 80, win.scroller.scrollHeight + chrome + 2));
        return { x: clamp(win.x, 6, Math.max(6, a.w - w - 8)), y: clamp(win.y, 6, Math.max(6, a.h - h - 8)), w, h };
    };

    function ghost(win, x, y, w, h) {
        const g = document.createElement('div');
        g.className = 'ghost-rect';
        g.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
        desktop.appendChild(g);
        return g;
    }

    /* ----- stacking ----- */
    function focus(win, { silent = false } = {}) {
        if (!win || win.closed) return;
        const changed = active !== win;
        const i = wins.indexOf(win);
        if (i !== wins.length - 1) { wins.splice(i, 1); wins.push(win); }
        wins.forEach((w, n) => {
            w.el.style.zIndex = 10 + n;
            w.el.classList.toggle('is-active', w === win);
        });
        active = win;
        if (!silent && !win.el.contains(document.activeElement)) win.el.focus({ preventScroll: true });
        if (changed) emit('active', win);
    }
    function blurAll() {
        if (!active) return;
        active = null;
        wins.forEach((w) => w.el.classList.remove('is-active'));
        emit('active', null);
    }

    /* ----- the window object ----- */
    function open(opts) {
        const id = opts.id;
        const old = byId.get(id);
        if (old) {
            if (old.shaded) old.shade(false);
            focus(old);
            Sound.click();
            return old;
        }

        const { title = 'Untitled', kind = 'doc', mem = 300, scroll = false, resizable = false, info = false } = opts;
        if (!Memory.alloc(id, title, mem)) return null;

        const win = {
            id, kind, opts, title, closed: false,
            resizable, zoomable: opts.zoomable ?? resizable, shaded: false, zoomed: false, prev: null,
            x: 0, y: 0, w: 0, h: 0
        };

        const el = document.createElement('section');
        el.className = `win win--${kind}${resizable ? ' is-resizable' : ''}${win.zoomable ? ' is-zoomable' : ''}${scroll ? ' has-scroll' : ''}`;
        el.setAttribute('role', 'group');
        el.setAttribute('aria-label', title);
        el.tabIndex = -1;
        el.dataset.win = id;
        el.innerHTML =
            `<div class="win-title"><button class="win-close" type="button" aria-label="Close window"></button>` +
            `<span class="win-name"></span><button class="win-zoom" type="button" aria-label="Zoom window"></button></div>` +
            (info ? '<div class="win-info"><span class="wi-l"></span><span class="wi-r"></span></div>' : '') +
            `<div class="win-pane"><div class="win-scroll"></div>${resizable ? '<i class="grow" aria-hidden="true"></i>' : ''}</div>`;
        win.el = el;
        win.titlebar = el.querySelector('.win-title');
        win.scroller = el.querySelector('.win-scroll');
        win.pane = el.querySelector('.win-pane');
        el.querySelector('.win-name').textContent = title;

        win.scroller.setAttribute('role', 'group');            // a scroller the Tab key can reach (scroll.js) needs a name
        win.scroller.setAttribute('aria-label', `${title}, contents`);
        win.setTitle = (t) => {
            win.title = t;
            el.setAttribute('aria-label', t);
            win.scroller.setAttribute('aria-label', `${t}, contents`);
            el.querySelector('.win-name').textContent = t;
        };
        win.setInfo = (l, r = '') => {
            const li = el.querySelector('.wi-l');
            const ri = el.querySelector('.wi-r');
            if (li) li.textContent = l;
            if (ri) ri.textContent = r;
        };
        win.setContent = (c) => {
            win.scroller.replaceChildren();
            if (typeof c === 'string') win.scroller.innerHTML = c; else if (c) win.scroller.appendChild(c);
            win.sb?.watch();
            if (!win.sb) win.watchOverflow?.();
        };

        /* geometry: remembered, else cascaded; always inside the desktop */
        const a = area();
        const saved = geom()[id];
        const w = clamp((resizable && saved && saved.w) || opts.w || 420, opts.minW || 160, Math.max(160, a.w - 12));
        const h = clamp((resizable && saved && saved.h) || opts.h || 300, opts.minH || 80, Math.max(80, a.h - 12));
        const step = cascade++ % 6;
        // a new window opens right of the two icon columns, or as far right as fits; on a big glass it opens in the middle (upper third)
        const big = a.w >= 1100 && a.h >= 560;
        const baseX = big ? Math.max(250, Math.round((a.w - w) / 2)) : 250;
        const baseY = big ? Math.max(36, Math.round((a.h - h) / 3)) : 36;
        const x0 = saved ? saved.x : opts.x ?? Math.max(8, Math.min(baseX + step * 28, a.w - w - 8));
        const fitY = Math.max(0, a.h - h - 6);                    // where a window of this height still fits inside the desktop
        const y0 = Math.min(saved ? saved.y : opts.y ?? baseY + step * 26, fitY);
        win.w = w;
        win.h = h;
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        const p = clampPos(win, x0, y0);
        place(win, p.x, p.y);

        /* ----- methods ----- */
        win.focus = () => focus(win);
        win.rect = () => ({ x: win.x, y: win.y, w: win.w, h: win.h });
        win.close = (o) => close(win, o);
        win.shade = (on = !win.shaded) => {
            if (on === win.shaded) return;
            win.shaded = on;
            el.classList.toggle('is-shaded', on);
            if (!on) win.sb?.sync();
            Sound.click();
        };
        win.zoom = () => {
            if (!win.zoomable || win.shaded || narrow()) return;
            const cur = { x: win.x, y: win.y, w: win.w, h: win.h };
            const from = clientRect(win);
            let to;
            if (win.zoomed) { to = win.prev; win.zoomed = false; } else { win.prev = cur; to = ideal(win); win.zoomed = true; }
            place(win, to.x, to.y);
            size(win, to.w, to.h);
            zoomRects(desktop, from, clientRect(win));
            if (!win.zoomed) saveGeom(win);
        };

        desktop.appendChild(el);
        if (scroll) win.sb = attachScrollbar(win.scroller, win.pane);
        else {
            // a window that does not scroll by design (a control panel) must still never cut its content off:
            // when the content turns out taller than the window (a short screen, larger text), it scrolls after all
            const watch = new ResizeObserver(() => {
                const s = win.scroller;
                if (win.sb || win.closed || s.scrollHeight <= s.clientHeight + 1) return;
                requestAnimationFrame(() => {                              // not inside the observer: the new bar changes the layout it is watching
                    if (win.sb || win.closed) return;
                    el.classList.add('has-scroll');
                    win.sb = attachScrollbar(s, win.pane);
                    watch.disconnect();
                });
            });
            win.watchOverflow = () => {
                watch.disconnect();
                watch.observe(win.scroller);
                if (win.scroller.firstElementChild) watch.observe(win.scroller.firstElementChild);
            };
            const content = new MutationObserver(() => win.watchOverflow());       // content added later (a control panel appends its own)
            content.observe(win.scroller, { childList: true });
            win.stopWatch = () => { watch.disconnect(); content.disconnect(); };
        }
        if (opts.content) win.setContent(opts.content);
        win.watchOverflow?.();

        bind(win);
        wins.push(win);
        byId.set(id, win);
        focus(win);
        Sound.pop();
        if (opts.from) zoomRects(desktop, rectOf(opts.from), clientRect(win));
        opts.onOpen?.(win);
        emit('open', win);
        return win;
    }

    function close(win, { quiet = false } = {}) {
        if (win.closed) return;
        win.closed = true;
        const from = clientRect(win);
        const i = wins.indexOf(win);
        if (i >= 0) wins.splice(i, 1);
        byId.delete(win.id);
        win.sb?.destroy();
        win.stopWatch?.();
        win.el.remove();
        Memory.release(win.id);
        const wasActive = active === win;
        if (wasActive) active = null;
        win.opts.onClose?.(win);
        if (!quiet) {
            Sound.pop();
            const to = win.opts.from instanceof Element && win.opts.from.isConnected ? win.opts.from.getBoundingClientRect() : null;
            if (to) zoomRects(desktop, from, to);
        }
        if (wasActive) {
            const next = wins[wins.length - 1];
            if (next) focus(next, { silent: true }); else emit('active', null);
        }
        emit('close', win);
    }

    /* ----- pointer behaviour ----- */
    function bind(win) {
        const el = win.el;

        // anything inside the window brings it to the front
        el.addEventListener('pointerdown', () => { if (active !== win) focus(win, { silent: true }); }, true);

        el.querySelector('.win-close').addEventListener('click', () => close(win));
        el.querySelector('.win-zoom').addEventListener('click', () => win.zoom());

        // title bar: drag, or double-click to roll up
        let drag = null;
        win.titlebar.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 || e.target.closest('.win-close, .win-zoom') || narrow()) return;
            try { win.titlebar.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is already gone */ }
            drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: win.x, y: win.y, moved: false, ghost: null, pos: null };
        });
        win.titlebar.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            const dx = e.clientX - drag.sx;
            const dy = e.clientY - drag.sy;
            if (!drag.moved && Math.hypot(dx, dy) < 3) return;
            drag.moved = true;
            const p = clampPos(win, drag.x + dx, drag.y + dy);
            drag.pos = p;
            if (Settings.get('liveDrag')) { place(win, p.x, p.y); return; }
            if (!drag.ghost) drag.ghost = ghost(win, win.x, win.y, el.offsetWidth, el.offsetHeight);
            drag.ghost.style.left = p.x + 'px';
            drag.ghost.style.top = p.y + 'px';
        });
        const endDrag = (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            if (drag.ghost) drag.ghost.remove();
            if (drag.moved && drag.pos) {
                place(win, drag.pos.x, drag.pos.y);
                win.zoomed = false;
                saveGeom(win);
                Sound.click();
            }
            drag = null;
        };
        win.titlebar.addEventListener('pointerup', endDrag);
        win.titlebar.addEventListener('pointercancel', endDrag);
        win.titlebar.addEventListener('dblclick', (e) => {
            if (e.target.closest('.win-close, .win-zoom') || narrow()) return;
            win.shade();
        });

        // grow box: resize
        const grow = el.querySelector('.grow');
        if (grow) {
            let rs = null;
            grow.addEventListener('pointerdown', (e) => {
                if (e.button !== 0 || narrow()) return;
                e.preventDefault();
                try { grow.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is already gone */ }
                rs = { id: e.pointerId, sx: e.clientX, sy: e.clientY, w: win.w, h: win.h, ghost: null, to: null };
            });
            grow.addEventListener('pointermove', (e) => {
                if (!rs || e.pointerId !== rs.id) return;
                const a = area();
                const nw = clamp(rs.w + e.clientX - rs.sx, win.opts.minW || 160, Math.max(win.opts.minW || 160, a.w - win.x));
                const nh = clamp(rs.h + e.clientY - rs.sy, win.opts.minH || 80, Math.max(win.opts.minH || 80, a.h - win.y));
                rs.to = { w: nw, h: nh };
                if (Settings.get('liveDrag')) { size(win, nw, nh); return; }
                if (!rs.ghost) rs.ghost = ghost(win, win.x, win.y, win.w, win.h);
                rs.ghost.style.width = nw + 'px';
                rs.ghost.style.height = nh + 'px';
            });
            const endRs = (e) => {
                if (!rs || e.pointerId !== rs.id) return;
                if (rs.ghost) rs.ghost.remove();
                if (rs.to) { size(win, rs.to.w, rs.to.h); win.zoomed = false; saveGeom(win); }
                rs = null;
            };
            grow.addEventListener('pointerup', endRs);
            grow.addEventListener('pointercancel', endRs);
        }
    }

    /* keep windows reachable when the glass changes size */
    new ResizeObserver(() => {
        if (narrow()) return;
        const a = area();
        wins.forEach((w) => {
            const p = clampPos(w, w.x, w.y);
            if (p.x !== w.x || p.y !== w.y) place(w, p.x, p.y);
            if (w.zoomed) { const t = ideal(w); place(w, t.x, t.y); size(w, t.w, t.h); }
            else if (w.w > a.w - 8 && w.resizable) size(w, Math.max(w.opts.minW || 160, a.w - 12), w.h);
        });
    }).observe(desktop);

    return {
        open,
        focus,
        blurAll,
        get: (id) => byId.get(id) || null,
        list: () => wins.slice(),
        active: () => active,
        onChange(fn) { subs.add(fn); return () => subs.delete(fn); },
        /** close everything at once (Restart) */
        closeAll() { wins.slice().forEach((w) => close(w, { quiet: true })); },
        narrow,
        /** the size of the desktop: what a window has to fit into */
        area
    };
}
