/* ==========================================================================
   KONAMI — the old cheat code: up up down down left right left right B A.
   It only listens. It never cancels a key and never stops one travelling, so
   the arrow keys keep doing their normal job (moving between icons, turning
   the Scrapbook, sliding Puzzle tiles) while somebody types the code.
   Keys typed into a text field do not count, and neither does a key held down.
   ========================================================================== */
const CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const MODIFIERS = new Set(['shift', 'control', 'alt', 'altgraph', 'meta', 'os', 'capslock', 'fn', 'process', 'dead']);
const PATIENCE = 4000;                  // ms between two keys of the code

/**
 * @param {{onCode: () => void, enabled?: () => boolean}} o
 *   enabled: false while something else owns the keyboard (a dialog, an open menu)
 */
export function createKonami({ onCode, enabled = () => true }) {
    let at = 0;
    let last = 0;
    let armed = false;

    function onKey(e) {
        if (e.repeat || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
        const k = String(e.key).toLowerCase();
        if (MODIFIERS.has(k)) return;                                   // Shift on its way to a capital B is not a wrong key
        // a key that something earlier in the line already took (the screen saver's wake-up key) is not part of the code
        if (e.defaultPrevented || !enabled()) { at = 0; return; }
        if (e.target instanceof Element && e.target.closest('input:not([readonly]), textarea, select, [contenteditable="true"]')) { at = 0; return; }
        const now = performance.now();
        if (at && now - last > PATIENCE) at = 0;
        last = now;
        if (k === CODE[at]) at += 1;
        else at = k === CODE[0] ? 1 : 0;
        if (at === CODE.length) { at = 0; onCode(); }
    }

    return {
        arm() {
            if (armed) return;
            armed = true;
            at = 0;
            window.addEventListener('keydown', onKey, true);           // capture: it sees the key before anything that handles it, and changes nothing
        },
        disarm() {
            if (!armed) return;
            armed = false;
            window.removeEventListener('keydown', onKey, true);
        },
        get progress() { return at; }
    };
}
