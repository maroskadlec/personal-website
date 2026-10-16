/* ==========================================================================
   CRASH — the system error: a bomb with a lit fuse over a frozen screen, and
   one button. It belongs to the machine, not to a mode, so it can happen on
   the Desktop and in the Terminal alike. Restart is the only way out.
   ========================================================================== */
import { Icons } from '../gfx/icons.js';
import { Sound } from './sound.js';
import { esc, reducedMotion } from './util.js';
import { bomb } from '../content/eggs.js';

let layer = null;
let restart = () => {};
let active = false;
let before = null;

function done() {
    if (!active) return;
    active = false;
    layer.hidden = true;
    layer.innerHTML = '';
    document.getElementById('modes').inert = false;
    restart();
}

export const Crash = {
    init({ onRestart }) {
        layer = document.getElementById('crash');
        restart = onRestart;
    },

    get active() { return active; },

    /** @param {string} detail the quoted line under the message (see bomb.detail in content/eggs.js) */
    show(detail = bomb.detail.generic) {
        if (active || !layer) return;
        active = true;
        before = document.activeElement;
        document.getElementById('modes').inert = true;         // the machine is frozen: nothing behind the box answers
        layer.hidden = false;
        layer.innerHTML =
            `<div class="dlg-backdrop"><div class="dlg dlg--bomb" role="alertdialog" aria-modal="true" aria-labelledby="crashMsg" aria-describedby="crashDetail">
                <div class="dlg-icon">${Icons.bomb('')}</div>
                <div class="dlg-text"><p class="dlg-msg" id="crashMsg">${esc(bomb.message)}</p><p class="dlg-detail" id="crashDetail">${esc(detail)}</p></div>
                <div class="dlg-buttons"><button class="btn is-default" type="button">${esc(bomb.restart)}</button></div>
            </div></div>`;
        if (!reducedMotion()) layer.classList.add('is-hit');
        setTimeout(() => layer.classList.remove('is-hit'), 360);
        Sound.crash();
        const btn = layer.querySelector('.btn');
        // the key or click that caused the error must not answer it: for a moment nothing counts
        const shown = performance.now();
        const ready = () => performance.now() - shown > 400;
        btn.addEventListener('click', () => { if (ready()) done(); });
        layer.onkeydown = (e) => {
            if (e.key === 'Tab' || e.key === 'Escape') e.preventDefault();      // there is one button and no way around it
            if ((e.key === 'Enter' || e.key === ' ') && document.activeElement !== btn) { e.preventDefault(); if (ready()) done(); }
        };
        btn.focus();
        document.getElementById('live')?.replaceChildren(document.createTextNode(`${bomb.message} ${detail}`));
    }
};
