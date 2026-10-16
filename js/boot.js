/* ==========================================================================
   BOOT — the start-up screen. The row of "extensions" at the bottom is a
   real progress bar: it only fills up once fonts and icons are ready.
   ========================================================================== */
import { Icons } from './gfx/icons.js';

const EXT = ['font', 'image', 'gear', 'sound', 'cursor', 'clock', 'star'];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const Boot = {
    el: null,

    mount(screen) {
        this.el = document.createElement('div');
        this.el.className = 'boot';
        this.el.innerHTML =
            Icons.happy('boot-happy') +
            '<p class="boot-title">Welcome to Marian OS</p>' +
            '<p class="boot-sub">Version 7.5.5 · designed in Prague</p>' +
            '<div class="boot-ext"></div>';
        screen.appendChild(this.el);
        return this.el;
    },

    /** resolves once the row is full and every preload task has finished */
    async run({ tasks = [], fast = false, hold = false, sound = null } = {}) {
        const row = this.el.querySelector('.boot-ext');
        EXT.forEach((k) => row.insertAdjacentHTML('beforeend', Icons.ext(k)));
        const icons = Array.from(row.children);
        const minMs = fast ? 800 : 2600;
        const t0 = performance.now();
        let finished = 0;
        tasks.forEach((p) => Promise.resolve(p).catch(() => {}).then(() => { finished++; }));
        if (sound) sound.hdd(minMs / 1000);

        // Esc / Enter / click skips the wait (but never the real preload)
        let skipped = false;
        const skip = (e) => { if (!e.key || e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skipped = true; };
        window.addEventListener('keydown', skip);
        window.addEventListener('pointerdown', skip);

        await new Promise((resolve) => {
            let shown = 0;
            const tick = () => {
                const timeFrac = skipped ? 1 : Math.min(1, (performance.now() - t0) / minMs);
                const loaded = !tasks.length || finished >= tasks.length;
                const frac = Math.min(timeFrac, loaded ? 1 : 0.9);
                const target = Math.round(frac * icons.length);
                while (shown < target) icons[shown++].classList.add('in');
                if (loaded && timeFrac >= 1 && shown >= icons.length) return resolve();
                setTimeout(tick, 60);
            };
            tick();
        });
        window.removeEventListener('keydown', skip);
        window.removeEventListener('pointerdown', skip);

        if (hold) await new Promise(() => {});    // ?hold: freeze here for screenshots
        await wait(skipped ? 60 : fast ? 120 : 420);
    },

    dismiss() {
        if (this.el) this.el.remove();
        this.el = null;
    }
};
