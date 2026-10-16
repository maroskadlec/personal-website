/* ==========================================================================
   ABOUT THIS COMPUTER — the classic box: what the machine is, how much memory
   it has, and which windows (programs) are using it. Updates while you open
   and close things.
   ========================================================================== */
import { Icons } from '../../../gfx/icons.js';
import { Memory, kb } from '../memory.js';
import { esc } from '../../../core/util.js';
import { Sound } from '../../../core/sound.js';
import { openCredits } from './credits.js';
import { hints } from '../../../content/eggs.js';

export function openAbout(sys, { from } = {}) {
    let off = null;
    const win = sys.openWindow({
        id: 'about',
        title: 'About This Computer',
        kind: 'about',
        mem: 260,
        w: 420,
        h: 372,
        scroll: true,
        resizable: false,
        zoomable: false,
        from,
        onClose: () => { if (off) off(); }
    });
    if (!win || win.about) return win;
    win.about = true;

    const root = document.createElement('div');
    root.className = 'about';
    win.scroller.appendChild(root);

    function draw() {
        const procs = Memory.list();
        const total = Memory.total;
        const bar = (n) => `<span class="bar"><i style="width:${Math.max(1, Math.round((n / total) * 100))}%"></i></span>`;
        root.innerHTML =
            `<div class="about-head">
                <div class="about-pear">${Icons.pear('')}</div>
                <div>
                    <div class="about-title">Marian OS</div>
                    <div class="about-ver">Version 7.5.5, designed in Prague</div>
                </div>
            </div>
            <dl class="about-mem">
                <div><dt>Built-in Memory</dt><dd>${kb(total)}</dd></div>
                <div><dt>Largest Unused Block</dt><dd>${kb(Memory.largest())}</dd></div>
            </dl>
            <ul class="about-procs" aria-label="Memory in use">
                <li><span class="p-name">Marian OS</span><span class="p-kb">${kb(Memory.system)}</span>${bar(Memory.system)}</li>
                ${procs.map((p) => `<li><span class="p-name">${esc(p.name)}</span><span class="p-kb">${kb(p.kb)}</span>${bar(p.kb)}</li>`).join('')}
            </ul>
            <p class="about-copy">Made by Marian Kadlec. Type: Jersey 10 and Atkinson Hyperlegible Next, both open fonts.</p>
            <p class="about-hint">${esc(hints.about)}</p>`;
        win.sb?.sync();
    }
    // seven quick clicks on the pear: the credits (the box redraws itself, so the click is caught on the container)
    let clicks = 0;
    let lastClick = 0;
    root.addEventListener('click', (e) => {
        const pear = e.target.closest('.about-pear');
        if (!pear) return;
        const now = performance.now();
        clicks = now - lastClick < 1300 ? clicks + 1 : 1;
        lastClick = now;
        if (clicks >= 7) { clicks = 0; Sound.glow(0.1); openCredits(sys, { from: pear }); }
    });

    off = Memory.on(draw);
    draw();
    return win;
}
