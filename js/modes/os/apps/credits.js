/* ==========================================================================
   CREDITS — who made this, and with what. Seven quick clicks on the pear in
   About This Computer open it. The credits roll slowly (and stop while the
   pointer is over them); for people who asked for less motion they are a
   plain, scrollable page. The words are in js/content/eggs.js.
   ========================================================================== */
import { credits } from '../../../content/eggs.js';
import { esc, reducedMotion } from '../../../core/util.js';

const lines = () => credits.lines.map((l) => {
    if (l.head) return `<h2 class="cr-head">${esc(l.head)}</h2>`;
    if (l.key) return `<p><span class="cr-key">${esc(l.key)}</span> ${esc(l.text)}</p>`;
    return `<p>${esc(l.text)}</p>`;
}).join('');

export function openCredits(sys, { from } = {}) {
    const still = reducedMotion();
    const win = sys.openWindow({
        id: 'credits',
        title: credits.title,
        kind: 'credits',
        mem: 120,
        w: 360,
        h: 300,
        resizable: false,
        zoomable: false,
        scroll: still,
        from,
        content: still
            ? `<div class="win-body cr cr--still">${lines()}</div>`
            : `<div class="cr-stage"><div class="cr cr-roll" tabindex="0" role="region" aria-label="${esc(credits.title)}">${lines()}</div></div>`
    });
    const roll = win?.el.querySelector('.cr-roll');
    if (roll) {
        requestAnimationFrame(() => {                       // the roll starts just below the window and moves at the same speed in a small window and on a phone
            const h = roll.parentElement.clientHeight;
            roll.style.setProperty('--cr-h', h + 'px');
            roll.style.animationDuration = Math.round((h + roll.scrollHeight) / 28) + 's';
        });
    }
    return win;
}
