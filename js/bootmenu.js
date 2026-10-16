/* ==========================================================================
   BOOT MENU — a firmware-style startup screen (think GRUB): Desktop or
   Terminal, with a countdown that boots the default. Any key or pointer
   movement over the list stops the countdown, so nobody gets rushed.
   Shown on the very first start and after Restart; otherwise the machine
   boots straight into the last mode.
   The menu listens from the moment it is on the glass (mount), the countdown
   only starts once the tube is warm (run): a click during the warm-up counts.
   ========================================================================== */
import { esc } from './core/util.js';

// last known pointer position: the cursor often rests exactly where the menu appears
const last = { x: -1, y: -1 };
window.addEventListener('pointermove', (e) => { last.x = e.clientX; last.y = e.clientY; }, { passive: true, capture: true });
window.addEventListener('pointerdown', (e) => { last.x = e.clientX; last.y = e.clientY; }, { passive: true, capture: true });

const ENTRIES = [
    { id: 'os', name: 'Marian OS 7.5.5', sub: 'Desktop — the portfolio as an operating system' },
    { id: 'cli', name: 'Terminal', sub: 'marian@kadlec — the text-based version of this site' }
];

export const BootMenu = {
    el: null,
    st: null,
    result: null,

    /** build the DOM (so it is already on screen when the tube lights up) and start listening */
    mount(root, { selected = 0 } = {}) {
        this.el = document.createElement('div');
        this.el.className = 'bootmenu';
        this.el.setAttribute('role', 'dialog');
        this.el.setAttribute('aria-label', 'Choose how to start');
        this.el.innerHTML = `
            <div class="bm-box">
                <h2 class="bm-title">MARIAN BOOT MANAGER <span>1.0</span></h2>
                <ul class="bm-list" role="listbox" tabindex="0" aria-label="Startup options">
                    ${ENTRIES.map((e, i) => `
                        <li role="option" id="bm-${e.id}" data-id="${e.id}" aria-selected="${i === selected}">
                            <span class="bm-mark" aria-hidden="true">${i === selected ? '▸' : ''}</span>
                            <span class="bm-name">${esc(e.name)}</span>
                            <span class="bm-sub">${esc(e.sub)}</span>
                        </li>`).join('')}
                </ul>
                <p class="bm-help">↑ ↓ select &nbsp;·&nbsp; Enter boot &nbsp;·&nbsp; or click an entry</p>
                <p class="bm-count" id="bmCount" aria-live="off"></p>
            </div>`;
        root.appendChild(this.el);
        this.arm(selected);
        return this.el;
    },

    arm(selected) {
        const el = this.el;
        const list = el.querySelector('.bm-list');
        const rows = Array.from(list.children);
        const count = el.querySelector('#bmCount');
        const st = { sel: selected, left: 0, timer: 0, started: false, stopped: false, sound: null };
        this.st = st;

        this.result = new Promise((resolve) => {
            const paint = () => {
                rows.forEach((r, i) => {
                    r.setAttribute('aria-selected', String(i === st.sel));
                    r.querySelector('.bm-mark').textContent = i === st.sel ? '▸' : '';
                });
                list.setAttribute('aria-activedescendant', rows[st.sel].id);
            };
            const say = () => {
                if (st.stopped) count.textContent = 'Countdown stopped. Press Enter to boot the selected entry.';
                else if (st.started) count.textContent = `Booting ${ENTRIES[st.sel].name} in ${st.left}…`;
            };
            const stop = () => {
                if (st.stopped) return;
                st.stopped = true;
                clearInterval(st.timer);
                count.setAttribute('aria-live', 'polite');
                say();
            };
            const cleanup = () => {
                window.removeEventListener('keydown', onKey, true);
                list.removeEventListener('pointermove', onOver);
                list.removeEventListener('click', onClick);
            };
            const choose = (i) => {
                clearInterval(st.timer);
                cleanup();
                resolve(ENTRIES[i].id);
            };
            const move = (to) => {
                st.sel = (to + rows.length) % rows.length;
                paint();
                say();
                if (st.sound) st.sound.click();
            };

            const onKey = (e) => {
                if (e.metaKey || e.ctrlKey || e.altKey) return;
                const k = e.key;
                if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(st.sel); return; }
                stop();
                if (k === 'ArrowDown') { e.preventDefault(); move(st.sel + 1); }
                else if (k === 'ArrowUp') { e.preventDefault(); move(st.sel - 1); }
                else if (k === '1' || k === 'o' || k === 'O') { e.preventDefault(); choose(0); }
                else if (k === '2' || k === 't' || k === 'T') { e.preventDefault(); choose(1); }
            };
            const origin = { x: last.x, y: last.y };
            const onOver = (e) => {
                const r = e.target.closest('li');
                if (!r) return;
                if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) < 5) return;   // not a real movement
                stop();
                const i = rows.indexOf(r);
                if (i !== st.sel) move(i);
            };
            const onClick = (e) => {
                const r = e.target.closest('li');
                if (r) choose(rows.indexOf(r));
            };

            window.addEventListener('keydown', onKey, true);
            list.addEventListener('pointermove', onOver);
            list.addEventListener('click', onClick);

            // the countdown is started by run(); it needs the same helpers
            st.tick = () => {
                st.left -= 1;
                if (st.left <= 0) { choose(st.sel); return; }
                say();
            };
            st.say = say;
        });
    },

    /** the tube is warm: start the countdown. Resolves with 'os' | 'cli' */
    run({ seconds = 5, sound = null } = {}) {
        const st = this.st;
        const list = this.el.querySelector('.bm-list');
        st.sound = sound;
        st.left = seconds;
        st.started = true;
        list.focus({ preventScroll: true });
        list.setAttribute('aria-activedescendant', list.children[st.sel].id);
        st.say();
        if (!st.stopped) st.timer = setInterval(st.tick, 1000);
        return this.result;
    },

    dismiss() {
        if (this.st) clearInterval(this.st.timer);
        if (this.el) this.el.remove();
        this.el = null;
        this.st = null;
    }
};
