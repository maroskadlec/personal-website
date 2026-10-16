/* ==========================================================================
   MENUS — pull-down menus for the OS menu bar.
   defs[name] is a list of rows, or a function returning one: it runs every time
   the menu opens, so a row can be greyed out, checked or relabelled for the
   situation. A chosen row blinks twice before it acts, like the real thing.
   row: { id, label, hint, disabled, checked, swatch, sep }
   ========================================================================== */
import { esc, sleep, reducedMotion } from './util.js';
import { Sound } from './sound.js';

/**
 * @param {HTMLElement} menubar   element with .mb-item[data-menu]
 * @param {Record<string, Array|Function>} defs
 * @param {(id: string) => void} onAction
 * @param {{blink?: () => boolean}} [opts]
 */
export function attachMenus(menubar, defs, onAction, { blink = () => true } = {}) {
    let openItem = null;
    let menu = null;
    let busy = false;

    const items = () => Array.from(menubar.querySelectorAll('.mb-item[data-menu]'));

    function close({ refocus = false } = {}) {
        if (!menu) return;
        menu.remove();
        menu = null;
        if (openItem) {
            openItem.classList.remove('is-open');
            openItem.setAttribute('aria-expanded', 'false');
            if (refocus) openItem.focus();
        }
        openItem = null;
    }

    function open(item, { focusFirst = false } = {}) {
        const def = defs[item.dataset.menu];
        const rows = typeof def === 'function' ? def() : def;
        if (!rows) return;
        close();
        openItem = item;
        item.classList.add('is-open');
        item.setAttribute('aria-expanded', 'true');

        menu = document.createElement('div');
        menu.className = 'menu';
        menu.setAttribute('role', 'menu');
        menu.innerHTML = rows.map((r) => r.sep
            ? '<div class="menu-sep" role="separator"></div>'
            : `<button class="menu-row" role="menuitem${r.checked !== undefined ? 'checkbox' : ''}" type="button" data-id="${esc(r.id || '')}"` +
              `${r.checked !== undefined ? ` aria-checked="${r.checked}"` : ''}${r.disabled ? ' disabled aria-disabled="true"' : ''}>` +
              `${r.checked ? '<span class="menu-check" aria-hidden="true">✓</span>' : ''}` +
              `<span>${r.swatch ? `<i class="menu-swatch" style="background:${esc(r.swatch)}"></i>` : ''}${esc(r.label)}</span>${r.hint ? `<kbd>${esc(r.hint)}</kbd>` : ''}</button>`
        ).join('');
        const bar = menubar.getBoundingClientRect();
        const box = item.getBoundingClientRect();
        menu.style.left = Math.max(0, box.left - bar.left) + 'px';
        menu.style.top = bar.height + 'px';
        menubar.appendChild(menu);
        // a menu must never hang off the right edge of the glass
        const over = menu.getBoundingClientRect().right - bar.right;
        if (over > 0) menu.style.left = Math.max(0, box.left - bar.left - over) + 'px';
        if (focusFirst) menu.querySelector('.menu-row:not([disabled])')?.focus();
    }

    async function choose(row) {
        if (busy) return;
        const id = row.dataset.id;
        busy = true;
        if (blink() && !reducedMotion()) {
            row.classList.add('is-flash', 'is-off');
            for (let i = 0; i < 3; i++) {
                await sleep(55);
                row.classList.toggle('is-off');
            }
            await sleep(55);
        }
        busy = false;
        close();
        if (id) onAction(id);
    }

    menubar.addEventListener('pointerdown', (e) => {
        const item = e.target.closest('.mb-item[data-menu]');
        if (!item || e.target.closest('.menu')) return;
        e.preventDefault();
        if (openItem === item) close(); else { Sound.click(); open(item); }
    });

    menubar.addEventListener('pointerover', (e) => {
        if (!openItem || busy || e.pointerType !== 'mouse') return;      // a finger has no hover: its tap (pointerdown) switches menus
        const item = e.target.closest('.mb-item[data-menu]');
        if (item && item !== openItem) open(item);
    });

    menubar.addEventListener('click', (e) => {
        const row = e.target.closest('.menu-row');
        if (!row || row.disabled) return;
        choose(row);
    });

    menubar.addEventListener('keydown', (e) => {
        const item = e.target.closest('.mb-item[data-menu]');
        const row = e.target.closest('.menu-row');
        if (e.key === 'Escape') { if (menu) { e.preventDefault(); e.stopPropagation(); close({ refocus: true }); } return; }
        if (item && !row) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); open(item, { focusFirst: true }); }
            else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const list = items();
                const n = list[(list.indexOf(item) + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
                e.preventDefault();
                n.focus();
                if (menu) open(n, { focusFirst: true });
            }
        } else if (row) {
            const rows = Array.from(menu.querySelectorAll('.menu-row:not([disabled])'));
            const i = rows.indexOf(row);
            if (e.key === 'ArrowDown') { e.preventDefault(); rows[(i + 1) % rows.length]?.focus(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); rows[(i - 1 + rows.length) % rows.length]?.focus(); }
            else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const list = items();
                const n = list[(list.indexOf(openItem) + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
                e.preventDefault();
                open(n, { focusFirst: true });
            }
        }
    });

    document.addEventListener('pointerdown', (e) => {
        if (menu && !e.target.closest('.menubar')) close();
    }, true);

    return { close, isOpen: () => !!menu };
}
