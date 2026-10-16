/* ==========================================================================
   COACH — a one-time Balloon Help tip. Shown once per tip (remembered), dismissed
   by any click/key or after a while. Used to point at the Desktop|Terminal switch.
   ========================================================================== */
import { local } from './util.js';
import { showBalloon } from './balloon.js';

/**
 * @param {{anchor: HTMLElement, text: string, key: string, variant?: 'os'|'cli', delay?: number, ttl?: number, onDone?: () => void}} o
 *   onDone runs when the tip has been seen (dismissed or timed out) or was seen on an earlier visit
 * @returns {() => void} cancel (call when the mode is left; onDone does not run then)
 */
export function coach({ anchor, text, key, variant = 'os', delay = 1500, ttl = 12000, onDone = null }) {
    const storeKey = 'mk10.coach.' + key;
    if (/[?&]nocoach\b/.test(location.search)) return () => {};          // dev: no tips (for screenshots)
    if (local.get(storeKey)) {
        const t = onDone ? setTimeout(onDone, 0) : 0;
        return () => clearTimeout(t);
    }

    let balloon = null;
    let alive = true;
    let t1 = 0;
    let t2 = 0;

    const remove = (seen) => {
        alive = false;
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener('pointerdown', onAny, true);
        window.removeEventListener('keydown', onAny, true);
        if (balloon) { balloon.hide(); balloon = null; }
        if (seen) {
            local.set(storeKey, '1');
            if (onDone) onDone();
        }
    };
    function onAny() { remove(true); }

    t1 = setTimeout(() => {
        if (!alive || !anchor.isConnected) return;
        balloon = showBalloon({ anchor, text, variant });
        if (!balloon) return;
        window.addEventListener('pointerdown', onAny, true);
        window.addEventListener('keydown', onAny, true);
        t2 = setTimeout(() => remove(true), ttl);
    }, delay);

    return () => remove(false);
}
