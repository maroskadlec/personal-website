/* ==========================================================================
   TRAY — the always-visible "Desktop | Terminal" switch (plus the sound
   button). The same component lives in the OS menu bar and in the Terminal's
   top bar, so the way back is always where you'd look for it.
   Semantics: the two buttons are tabs for the two modes (manual activation:
   arrows move focus, Enter/Space switches).
   ========================================================================== */
import { Modes } from './modes.js';
import { Sound } from './sound.js';

const ICON = {
    os: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="9" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 14h6M8 11.5V14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    cli: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M4.6 6.4l2.2 1.7-2.2 1.7M8.6 10.1h2.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    soundOn: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M2 6v4h2.6L8 12.6V3.4L4.6 6z" fill="currentColor"/><path d="M10.4 5.6a3.4 3.4 0 0 1 0 4.8M12.2 3.8a6 6 0 0 1 0 8.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    soundOff: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M2 6v4h2.6L8 12.6V3.4L4.6 6z" fill="currentColor"/><path d="M10.6 6l3.6 4M14.2 6l-3.6 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
};

const TIP = {
    os: 'Desktop: the portfolio as an operating system (press `)',
    cli: 'Terminal: the text-based version of this site (press `)'
};

/** @param {{variant: 'os'|'cli'}} opts */
export function createTray({ variant }) {
    const el = document.createElement('div');
    el.className = `tray tray--${variant}`;
    el.innerHTML = `
        <div class="tray-seg" role="tablist" aria-label="Interface">
            <button class="tray-tab" role="tab" type="button" data-mode="os" aria-controls="mode-os" title="${TIP.os}">${ICON.os}<span>Desktop</span></button>
            <button class="tray-tab" role="tab" type="button" data-mode="cli" aria-controls="mode-cli" title="${TIP.cli}">${ICON.cli}<span>Terminal</span></button>
        </div>
        <button class="tray-snd" type="button" title="Sound on or off"></button>`;

    const tabs = Array.from(el.querySelectorAll('.tray-tab'));
    const snd = el.querySelector('.tray-snd');

    const syncSound = () => {
        const on = !Sound.muted;
        snd.setAttribute('aria-pressed', String(on));
        snd.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
        snd.innerHTML = on ? ICON.soundOn : ICON.soundOff;
    };
    syncSound();

    tabs.forEach((b) => b.addEventListener('click', () => Modes.switch(b.dataset.mode, { via: 'tray' })));
    el.querySelector('.tray-seg').addEventListener('keydown', (e) => {
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        let n = -1;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n >= 0) { e.preventDefault(); tabs[n].focus(); }
    });

    snd.addEventListener('click', () => {
        Sound.unlock();
        Sound.setMuted(!Sound.muted);                  // fires mk:sound: all switches re-render
        if (!Sound.muted) Sound.click();
    });
    document.addEventListener('mk:sound', syncSound);

    Modes.on((cur) => {
        tabs.forEach((b, i) => {
            const sel = b.dataset.mode === cur;
            b.setAttribute('aria-selected', String(sel));
            b.tabIndex = sel || (!cur && i === 0) ? 0 : -1;
        });
    });

    el.tabs = tabs;
    return el;
}
