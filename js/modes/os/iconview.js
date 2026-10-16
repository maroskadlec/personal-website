/* ==========================================================================
   ICON VIEW — icons the way a Finder shows them. One component serves the
   desktop (free placement), folder windows (an icon grid or a list) and the
   Trash. Click selects, drag moves (outline ghosts, drop onto folders or the
   Trash), a rubber band selects many, double-click or Enter opens, F2 renames,
   the arrow keys walk between icons.
   `el` holds the icons; `host` receives the pointer (on the desktop that is the
   whole desktop, whose empty space starts the rubber band).
   ========================================================================== */
import { FS, ROOT, TRASH } from './fs.js';
import { Icons } from '../../gfx/icons.js';
import { Assets } from '../../core/assets.js';
import { Sound } from '../../core/sound.js';
import { esc } from '../../core/util.js';
import { kb } from './memory.js';

const GRID = 8;
const ITEM_W = 96;
const ITEM_H = 92;

/** the art of one item as an SVG (or <img>) string; `size` is 32, or 16 for the rows of a list */
export function artHTML(node, cls = 'icon-art', size = 32) {
    const key = FS.iconKey(node);
    if (key === 'portrait') return Assets.portraitURL ? `<img class="${cls}" src="${Assets.portraitURL}" alt="" draggable="false">` : Icons.doc(cls);
    if (node.image) {
        // a client token: dithered to a few colours. Until it is ready the plain stack shows, then `mk:coin` swaps it
        const coin = Assets.coinNow(node.image);
        if (coin) return `<img class="${cls}" src="${size <= 16 ? coin.tiny : coin.icon}" alt="" draggable="false">`;
        Assets.coin(node.image);
    }
    if (node.kind === 'trash' && FS.trashCount() > 0) return Icons.trashFull(cls);
    const fn = Icons[key];
    return typeof fn === 'function' ? fn(cls) : Icons.doc(cls);
}

const sizeText = (n) => {
    const s = FS.size(n);
    return s ? kb(s) : '—';
};

/**
 * @param {{el: HTMLElement, host?: HTMLElement, parentId: string, mode: 'desktop'|'icons'|'list', sys: object}} o
 */
export function createIconView({ el, host = el, parentId, mode, sys }) {
    const sel = new Set();
    let pending = null;
    let drag = null;
    let renameTimer = 0;
    let lastTap = { id: '', t: 0 };
    let typed = '';
    let typedTimer = 0;
    let focusId = '';
    const isDesktop = mode === 'desktop';

    host.dataset.container = parentId;
    el.setAttribute('role', 'listbox');
    el.setAttribute('aria-multiselectable', 'true');
    el.setAttribute('aria-label', isDesktop ? 'Desktop' : `${(FS.node(parentId) || {}).name || 'Folder'} contents`);
    if (!isDesktop) el.classList.add('iconview');

    const items = () => Array.from(el.querySelectorAll(':scope > [data-id], :scope > .lv-rows > [data-id]'));
    const byId = (id) => items().find((i) => i.dataset.id === id) || null;

    /* ---------------------------------------------------------- render */
    /** what a screen reader says: "Marian HD, Disk"; the Trash is only "Trash" (its kind is the same word) */
    const spoken = (n, t) => {
        const kind = FS.kindLabel(t);
        return kind.toLowerCase() === n.name.toLowerCase() ? n.name : `${n.name}, ${kind}`;
    };

    function iconEl(n) {
        const t = FS.resolve(n);
        const d = document.createElement('div');
        d.className = `icon${n.hero ? ' icon--hero' : ''}${n.kind === 'alias' ? ' is-alias' : ''}`;
        d.dataset.id = n.id;
        d.dataset.kind = n.kind;
        d.setAttribute('role', 'option');
        d.setAttribute('aria-label', spoken(n, t));
        d.tabIndex = -1;
        const lab = FS.label(n.id);
        if (lab) d.dataset.label = lab;
        d.innerHTML = `<span class="icon-art-slot">${artHTML(t)}</span><span class="icon-label">${esc(n.name)}</span>`;
        if (isDesktop) positionIcon(d, n);
        return d;
    }

    function rowEl(n) {
        const t = FS.resolve(n);
        const d = document.createElement('div');
        d.className = `row${n.kind === 'alias' ? ' is-alias' : ''}`;
        d.dataset.id = n.id;
        d.dataset.kind = n.kind;
        d.setAttribute('role', 'option');
        d.setAttribute('aria-label', spoken(n, t));
        d.tabIndex = -1;
        const lab = FS.label(n.id);
        if (lab) d.dataset.label = lab;
        d.innerHTML =
            `<span class="row-name"><span class="row-icon">${artHTML(t, '', 16)}</span><span class="icon-label">${esc(n.name)}</span></span>` +
            `<span class="row-size">${sizeText(n)}</span>` +
            `<span class="row-kind">${esc(t.role || FS.kindLabel(t))}</span>` +
            `<span class="row-mod">${esc(FS.years(t) || FS.modified(n))}</span>`;
        return d;
    }

    function positionIcon(d, n) {
        const p = FS.place(n.id) || {};
        const set = (k, v) => { if (v === undefined || v === null) d.style.removeProperty(k); else d.style.setProperty(k, v + 'px'); };
        set('--l', p.left);
        set('--t', p.top);
        set('--r', p.right);
        set('--b', p.bottom);
        if (p.left === undefined && p.right === undefined) d.dataset.free = '1'; else delete d.dataset.free;
    }

    function render() {
        const keepSel = new Set(sel);
        const keepFocus = focusId;
        const kids = FS.children(parentId);
        Array.from(el.children).forEach((c) => { if (c.matches('[data-id], .lv-head, .lv-rows')) c.remove(); });
        if (mode === 'list') {
            const head = document.createElement('div');
            head.className = 'lv-head';
            head.setAttribute('role', 'presentation');
            head.innerHTML = '<span>Name</span><span>Size</span><span>Kind</span><span>Last Modified</span>';
            const rows = document.createElement('div');
            rows.className = 'lv-rows';
            rows.setAttribute('role', 'presentation');
            kids.forEach((n) => rows.appendChild(rowEl(n)));
            el.append(head, rows);
            el.classList.add('iconview--list');
            el.classList.remove('iconview--icons');
        } else {
            kids.forEach((n) => el.appendChild(iconEl(n)));
            if (!isDesktop) { el.classList.add('iconview--icons'); el.classList.remove('iconview--list'); }
        }
        sel.clear();
        keepSel.forEach((id) => { if (kids.some((n) => n.id === id)) sel.add(id); });
        paint();
        const target = byId(keepFocus && kids.some((n) => n.id === keepFocus) ? keepFocus : '') || items()[0];
        items().forEach((i) => { i.tabIndex = i === target ? 0 : -1; });
        sys.onViewRender?.(view);
    }

    function paint() {
        items().forEach((i) => {
            const on = sel.has(i.dataset.id);
            i.classList.toggle('is-selected', on);
            i.setAttribute('aria-selected', String(on));
        });
    }

    /* ---------------------------------------------------------- selection */
    function select(ids, { focus = true } = {}) {
        sel.clear();
        ids.forEach((id) => sel.add(id));
        paint();
        if (focus && ids.length) focusItem(byId(ids[ids.length - 1]));
        sys.onSelect?.(view);
    }
    function toggle(id) {
        if (sel.has(id)) sel.delete(id); else sel.add(id);
        paint();
        sys.onSelect?.(view);
    }
    function focusItem(item) {
        if (!item) return;
        items().forEach((i) => { i.tabIndex = i === item ? 0 : -1; });
        focusId = item.dataset.id;
        item.focus({ preventScroll: false });
    }
    const selectedNodes = () => [...sel].map((id) => FS.node(id)).filter(Boolean);

    function openItem(item) {
        const n = FS.node(item.dataset.id);
        if (n) sys.open(n, { from: item });
    }

    /* ---------------------------------------------------------- pointer */
    host.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('input.rename')) return;
        if (isDesktop && e.target.closest('.win, .os-layer')) return;
        sys.setActiveView?.(view);
        if (isDesktop) sys.wm.blurAll();                     // the desktop takes the focus: every window goes inactive
        const item = e.target.closest('[data-id]');
        if (!item || !el.contains(item)) { startMarquee(e); return; }

        const id = item.dataset.id;
        const additive = e.shiftKey || e.metaKey || e.ctrlKey;
        const wasOnlyThis = sel.size === 1 && sel.has(id);
        const collapse = !additive && sel.size > 1 && sel.has(id);
        if (additive) toggle(id);
        else if (!sel.has(id)) select([id], { focus: false });
        else sys.onSelect?.(view);
        focusId = id;
        items().forEach((i) => { i.tabIndex = i === item ? 0 : -1; });
        clearTimeout(renameTimer);
        pending = { id, item, sx: e.clientX, sy: e.clientY, pt: e.pointerType, wasOnlyThis: wasOnlyThis && !additive, collapse, onLabel: !!e.target.closest('.icon-label') };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
        if (e.pointerType === 'mouse') item.focus({ preventScroll: true });
    });

    function onMove(e) {
        if (!pending) return;
        if (!drag) {
            if (Math.hypot(e.clientX - pending.sx, e.clientY - pending.sy) < 5) return;
            if (!beginDrag()) { endPointer(); return; }
        }
        moveDrag(e);
    }
    function onUp(e) {
        const p = pending;
        const d = drag;
        endPointer();
        if (d) { drop(d); return; }
        if (!p) return;
        if (p.collapse) select([p.id], { focus: false });
        // a tap with touch or pen: the second tap opens
        if (p.pt !== 'mouse') {
            const now = performance.now();
            if (lastTap.id === p.id && now - lastTap.t < 450) { lastTap = { id: '', t: 0 }; openItem(p.item); return; }
            lastTap = { id: p.id, t: now };
            return;
        }
        // a click on the name of the only selected item renames it, a moment later (a double-click cancels it)
        const n = FS.node(p.id);
        if (p.wasOnlyThis && p.onLabel && n && !n.protected) renameTimer = setTimeout(() => rename(p.id), 650);
    }
    function onCancel() { cancelDrag(); endPointer(); }
    function endPointer() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        pending = null;
    }

    host.addEventListener('dblclick', (e) => {
        if (e.target.closest('input.rename')) return;
        if (isDesktop && e.target.closest('.win')) return;
        clearTimeout(renameTimer);
        const item = e.target.closest('[data-id]');
        if (item && el.contains(item)) { e.preventDefault(); openItem(item); }
    });

    /* ---------------------------------------------------------- dragging */
    function beginDrag() {
        if (sys.wm.narrow()) return false;
        const ids = sel.has(pending.id) ? [...sel] : [pending.id];
        const els = ids.map(byId).filter(Boolean);
        if (!els.length) return false;
        const layer = sys.layer.getBoundingClientRect();
        const ghosts = els.map((it) => {
            const r = it.getBoundingClientRect();
            const g = it.cloneNode(true);
            g.removeAttribute('data-id');
            g.removeAttribute('role');
            g.removeAttribute('aria-label');
            g.removeAttribute('aria-selected');
            if (it.classList.contains('row')) {
                g.className = 'icon icon-ghost';
                g.innerHTML = `<span class="icon-art-slot">${artHTML(FS.resolve(FS.node(it.dataset.id)))}</span><span class="icon-label">${it.querySelector('.icon-label').innerHTML}</span>`;
                g.style.width = '90px';
            } else {
                g.classList.remove('is-selected');
                g.classList.add('icon-ghost');
                g.style.width = r.width + 'px';
            }
            g.style.left = r.left - layer.left + 'px';
            g.style.top = r.top - layer.top + 'px';
            ['--l', '--t', '--r', '--b'].forEach((k) => g.style.removeProperty(k));
            sys.layer.appendChild(g);
            return { el: g, rect: r, id: it.dataset.id };
        });
        drag = { ids: ghosts.map((g) => g.id), ghosts, sx: pending.sx, sy: pending.sy, dx: 0, dy: 0, over: null };
        clearTimeout(renameTimer);
        return true;
    }

    function moveDrag(e) {
        drag.dx = e.clientX - drag.sx;
        drag.dy = e.clientY - drag.sy;
        drag.ghosts.forEach((g) => { g.el.style.transform = `translate(${drag.dx}px, ${drag.dy}px)`; });
        const t = targetAt(e.clientX, e.clientY);
        if (drag.over && (!t || t.el !== drag.over.el)) drag.over.el.classList.remove('is-drop');
        if (t && t.type === 'item' && (!drag.over || drag.over.el !== t.el)) t.el.classList.add('is-drop');
        drag.over = t;
    }

    function cancelDrag() {
        if (!drag) return;
        if (drag.over) drag.over.el.classList.remove('is-drop');
        drag.ghosts.forEach((g) => g.el.remove());
        drag = null;
    }

    /** what is under the pointer: a folder icon, the Trash, or a container to drop into */
    function targetAt(x, y) {
        for (const e of document.elementsFromPoint(x, y)) {
            if (e.closest('.menubar')) return null;
            const win = e.closest('.win');
            const holder = win || e.closest('.desktop');
            if (!holder) continue;
            const it = e.closest('.icon[data-id], .row[data-id]');
            if (it && !drag.ids.includes(it.dataset.id)) {
                const n = FS.node(it.dataset.id);
                const r = n && FS.resolve(n);
                if (r && FS.isContainer(r) && !drag.ids.some((id) => id === r.id || FS.isInside(r.id, id))) {
                    return { type: 'item', id: r.id, el: it };
                }
            }
            const cont = win ? win.querySelector('[data-container]') : holder;
            if (cont && cont.dataset.container) {
                if (win) {
                    const r = win.querySelector('.win-scroll').getBoundingClientRect();
                    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
                }
                return { type: 'container', id: cont.dataset.container, el: cont };
            }
            return null;
        }
        return null;
    }

    function drop(d) {
        if (d.over) d.over.el.classList.remove('is-drop');
        const t = d.over;
        d.ghosts.forEach((g) => g.el.remove());
        drag = null;
        if (!t) return;

        if (t.id === TRASH) { sys.trash(d.ids); return; }
        if (t.type === 'item') {
            if (FS.move(d.ids, t.id).length) Sound.thud();
            return;
        }
        if (t.id === parentId) {
            // the same place: on the desktop that means "leave it there"; folder windows arrange themselves
            if (isDesktop) { placeAtDrop(d.ids, d); render(); Sound.thud(); }
            return;
        }
        if (t.id === ROOT) placeAtDrop(d.ids, d);            // remember the spot before the move redraws the desktop
        if (FS.move(d.ids, t.id).length) Sound.thud();
    }

    const snap = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v / GRID) * GRID));
    /** icons dropped on the desktop land where their outlines were */
    function placeAtDrop(ids, d) {
        const desk = sys.desktop.getBoundingClientRect();
        d.ghosts.forEach((g) => {
            if (!ids.includes(g.id)) return;
            FS.setPlace(g.id, {
                left: snap(g.rect.left + d.dx - desk.left, 0, desk.width - ITEM_W),
                top: snap(g.rect.top + d.dy - desk.top, 0, desk.height - ITEM_H)
            });
        });
    }

    /* ---------------------------------------------------------- the rubber band */
    function startMarquee(e) {
        const additive = e.shiftKey || e.metaKey || e.ctrlKey;
        if (!additive && sel.size) { sel.clear(); paint(); sys.onSelect?.(view); }
        const base = new Set(sel);
        const box = document.createElement('div');
        box.className = 'marquee';
        const x0 = e.clientX;
        const y0 = e.clientY;
        let started = false;
        const move = (ev) => {
            if (!started) {
                if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 4) return;
                started = true;
                host.appendChild(box);
            }
            const r = host.getBoundingClientRect();
            const left = Math.min(x0, ev.clientX);
            const top = Math.min(y0, ev.clientY);
            const w = Math.abs(ev.clientX - x0);
            const h = Math.abs(ev.clientY - y0);
            box.style.left = left - r.left + 'px';
            box.style.top = top - r.top + 'px';
            box.style.width = w + 'px';
            box.style.height = h + 'px';
            sel.clear();
            base.forEach((id) => sel.add(id));
            items().forEach((it) => {
                const b = it.getBoundingClientRect();
                if (b.left < left + w && b.right > left && b.top < top + h && b.bottom > top) sel.add(it.dataset.id);
            });
            paint();
        };
        const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            box.remove();
            if (started) sys.onSelect?.(view);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        if (document.activeElement && document.activeElement.blur && el.contains(document.activeElement)) document.activeElement.blur();
    }

    /* ---------------------------------------------------------- keyboard */
    function neighbor(from, dir) {
        const cur = from.getBoundingClientRect();
        let best = null;
        let bestScore = Infinity;
        items().forEach((it) => {
            if (it === from) return;
            const r = it.getBoundingClientRect();
            const dx = r.left + r.width / 2 - (cur.left + cur.width / 2);
            const dy = r.top + r.height / 2 - (cur.top + cur.height / 2);
            const ok = dir === 'left' ? dx < -2 : dir === 'right' ? dx > 2 : dir === 'up' ? dy < -2 : dy > 2;
            if (!ok) return;
            const horizontal = dir === 'left' || dir === 'right';
            const score = (horizontal ? Math.abs(dx) : Math.abs(dy)) + (horizontal ? Math.abs(dy) : Math.abs(dx)) * 2.4;
            if (score < bestScore) { best = it; bestScore = score; }
        });
        return best;
    }

    host.addEventListener('keydown', (e) => {
        if (e.target.closest('input.rename')) return;
        const item = e.target.closest('[data-id]');
        if (!item || !el.contains(item)) return;
        const mod = e.metaKey || e.ctrlKey;
        const k = e.key;
        const arrow = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[k];
        if (arrow) {
            e.preventDefault();
            const dir = mode === 'list' ? (arrow === 'left' ? 'up' : arrow === 'right' ? 'down' : arrow) : arrow;
            const n = neighbor(item, dir);
            if (!n) return;
            if (e.shiftKey) { sel.add(item.dataset.id); sel.add(n.dataset.id); paint(); sys.onSelect?.(view); focusItem(n); } else select([n.dataset.id]);
        } else if (k === 'Home' || k === 'End') {
            e.preventDefault();
            const list = items();
            const n = k === 'Home' ? list[0] : list[list.length - 1];
            if (n) select([n.dataset.id]);
        } else if (k === 'Enter' && !mod) {
            e.preventDefault();
            if (!sel.has(item.dataset.id)) select([item.dataset.id], { focus: false });
            selectedNodes().slice(0, 6).forEach((n) => sys.open(n, { from: byId(n.id) }));
        } else if (k === 'F2') {
            e.preventDefault();
            rename(item.dataset.id);
        } else if (k === 'Delete' || k === 'Backspace') {
            e.preventDefault();
            if (!sel.has(item.dataset.id)) select([item.dataset.id], { focus: false });
            sys.trash([...sel]);
        } else if (mod && (k === 'a' || k === 'A')) {
            e.preventDefault();
            selectAll();
        } else if (k === 'Escape' && sel.size) {
            e.stopPropagation();                                // a selection is cleared first; the next Escape closes the window
            sel.clear();
            paint();
            sys.onSelect?.(view);
        } else if (k.length === 1 && !mod && !e.altKey) {
            // type-ahead: jump to the first name that starts with what was typed
            typed += k.toLowerCase();
            clearTimeout(typedTimer);
            typedTimer = setTimeout(() => { typed = ''; }, 800);
            const hit = items().find((i) => ((FS.node(i.dataset.id) || {}).name || '').toLowerCase().startsWith(typed));
            if (hit) select([hit.dataset.id]);
        }
    });

    /* ---------------------------------------------------------- renaming */
    function rename(id) {
        const n = FS.node(id);
        const item = byId(id);
        if (!n || !item || n.protected) return;
        clearTimeout(renameTimer);
        const label = item.querySelector('.icon-label');
        const input = document.createElement('input');
        input.className = 'rename';
        input.type = 'text';
        input.value = n.name;
        input.maxLength = 31;
        input.spellcheck = false;
        input.autocomplete = 'off';
        input.setAttribute('aria-label', `Name of ${n.name}`);
        label.replaceChildren(input);
        input.focus();
        input.select();
        let done = false;
        const finish = (commit) => {
            if (done) return;
            done = true;
            const value = input.value;
            let err = null;
            if (commit && value.trim() !== n.name) {
                const r = FS.rename(id, value);
                if (r.error) err = r.error;
            }
            render();
            const again = byId(id);
            if (again) focusItem(again);
            if (err && err !== 'empty') sys.renameError?.(err, value);
        };
        input.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
        });
        input.addEventListener('blur', () => finish(true));
        input.addEventListener('pointerdown', (e) => e.stopPropagation());
    }

    const selectAll = () => select(items().map((i) => i.dataset.id), { focus: false });

    /* ---------------------------------------------------------- desktop helpers */
    /** the first free spot, scanning down the columns from the top left */
    function freeSpot() {
        const desk = host.getBoundingClientRect();
        const taken = items().filter((i) => !i.dataset.free).map((i) => i.getBoundingClientRect());
        for (let x = 22; x < desk.width - ITEM_W; x += ITEM_W + 4) {
            for (let y = 20; y < desk.height - ITEM_H; y += ITEM_H + 4) {
                const box = { left: desk.left + x, top: desk.top + y, right: desk.left + x + ITEM_W, bottom: desk.top + y + ITEM_H };
                const hit = taken.some((r) => r.left < box.right - 8 && r.right > box.left + 8 && r.top < box.bottom - 8 && r.bottom > box.top + 8);
                if (!hit) return { left: x, top: y };
            }
        }
        return { left: 22, top: 20 };
    }

    /** every desktop icon back in tidy columns */
    function cleanUp() {
        if (!isDesktop) return;
        const kids = FS.children(parentId);
        FS.clearPlaces(kids.map((n) => n.id));
        render();
        kids.filter((n) => !n.place).forEach((n) => { FS.setPlace(n.id, freeSpot()); render(); });
    }

    /** a token finished dithering: swap the plain placeholder for it */
    const onCoin = (e) => {
        items().forEach((d) => {
            const n = FS.node(d.dataset.id);
            const t = n && FS.resolve(n);
            if (!t || t.image !== e.detail) return;
            const slot = d.querySelector('.icon-art-slot');
            const row = d.querySelector('.row-icon');
            if (slot) slot.innerHTML = artHTML(t);
            if (row) row.innerHTML = artHTML(t, '', 16);
        });
    };
    window.addEventListener('mk:coin', onCoin);

    const unsub = FS.on((parents) => {
        if (parents.has(parentId)) {
            render();
        } else if (isDesktop && parents.has(TRASH)) {
            const t = byId(TRASH);
            if (t) t.querySelector('.icon-art-slot').innerHTML = artHTML(FS.node(TRASH));
        }
    });

    const view = {
        el, host, parentId,
        get mode() { return mode; },
        setMode(m) { mode = m; render(); },
        render,
        selection: selectedNodes,
        select, selectAll,
        clear() { sel.clear(); paint(); },
        items,
        byId,
        focusFirst() { const f = items()[0]; if (f) focusItem(f); },
        rename,
        cleanUp,
        placeNew(id) { FS.setPlace(id, freeSpot()); render(); },
        destroy() { unsub(); window.removeEventListener('mk:coin', onCoin); cancelDrag(); endPointer(); }
    };
    render();
    return view;
}
