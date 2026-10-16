/* ==========================================================================
   BALLOON — the speech bubble of Balloon Help. showBalloon() puts one next to
   something on the glass; createBalloonHelp() is the "Show Balloons" mode of
   the Desktop: point at a thing and, after a moment, a balloon says what it is.
   coach.js uses the same bubble for its one-time tips.
   ========================================================================== */
import { reducedMotion } from './util.js';

/**
 * @param {{anchor: Element|{getBoundingClientRect: Function}|DOMRect, text: string, variant?: 'os'|'cli', role?: string, at?: {x: number}}} o
 *   `at.x` aims the tail at a point on a wide anchor (a title bar) instead of its middle
 * @returns {{el: HTMLElement, hide: (instant?: boolean) => void} | null}
 */
export function showBalloon({ anchor, text, variant = 'os', role = 'status', at = null }) {
    if (anchor.isConnected === false) return null;
    const r = anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : anchor;
    if (!r.width && !r.height) return null;

    const balloon = document.createElement('div');
    balloon.className = `balloon balloon--${variant}`;
    balloon.setAttribute('role', role);
    balloon.textContent = text;
    if (variant === 'cli') {
        // the balloon lives outside the Terminal, so it borrows the colours of the active theme
        const cs = getComputedStyle(document.getElementById('mode-cli'));
        balloon.style.setProperty('--bl-bg', cs.getPropertyValue('--panel').trim());
        balloon.style.setProperty('--bl-fg', cs.getPropertyValue('--ink-bright').trim());
        balloon.style.setProperty('--bl-line', cs.getPropertyValue('--ink').trim());
    }
    document.getElementById('screen').appendChild(balloon);

    const above = r.top > window.innerHeight / 2;
    balloon.classList.toggle('balloon--above', above);
    const w = balloon.offsetWidth;
    const aim = at ? at.x : r.left + r.width / 2;
    const left = Math.max(8, Math.min(window.innerWidth - w - 8, at ? aim - 40 : r.right - w + 4));
    balloon.style.left = left + 'px';
    balloon.style.setProperty('--tail', Math.max(14, Math.min(w - 28, aim - left - 8)) + 'px');
    if (above) balloon.style.bottom = window.innerHeight - r.top + 12 + 'px';
    else balloon.style.top = r.bottom + 12 + 'px';

    const animate = window.gsap && !reducedMotion();
    if (animate) gsap.from(balloon, { opacity: 0, y: above ? 6 : -6, duration: 0.28, ease: 'power2.out' });

    return {
        el: balloon,
        hide(instant = false) {
            if (!balloon.isConnected) return;
            if (animate && !instant) gsap.to(balloon, { opacity: 0, duration: 0.2, onComplete: () => balloon.remove() });
            else balloon.remove();
        }
    };
}

/**
 * Balloon Help: while it is on, resting the pointer on something that `resolve` knows
 * shows a balloon with its text. Touch never shows balloons (there is nothing to rest on).
 * @param {{root: HTMLElement, resolve: (target: Element, e: PointerEvent) => ({el: Element, text: string, aimed?: boolean, atPointer?: boolean}|null), delay?: number}} o
 *   a hit with `aimed` points the tail at the pointer along a wide thing; `atPointer` is for empty space:
 *   the balloon waits until the pointer has rested and then appears right there
 */
export function createBalloonHelp({ root, resolve, delay = 380 }) {
    let on = false;
    let timer = 0;
    let shown = null;
    let target = null;
    let px = 0;
    let py = 0;

    function hide() {
        clearTimeout(timer);
        timer = 0;
        if (shown) { shown.hide(true); shown = null; }
        target = null;
    }

    function move(e) {
        if (!on || e.pointerType === 'touch') return;
        px = e.clientX;
        py = e.clientY;
        const hit = e.target instanceof Element ? resolve(e.target, e) : null;
        if (!hit) { hide(); return; }
        if (hit.el === target && !hit.atPointer) return;
        hide();
        target = hit.el;
        timer = setTimeout(() => {
            const anchor = hit.atPointer ? { getBoundingClientRect: () => ({ left: px, right: px, top: py, bottom: py, width: 1, height: 1 }) } : hit.el;
            shown = showBalloon({ anchor, text: hit.text, role: 'tooltip', at: hit.aimed ? { x: px } : null });
        }, delay);
    }

    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', hide);
    root.addEventListener('pointerdown', hide, true);
    window.addEventListener('keydown', hide, true);
    root.addEventListener('wheel', hide, { passive: true });

    return {
        get on() { return on; },
        set(v) { on = !!v; if (!on) hide(); },
        hide,
        destroy() {
            hide();
            root.removeEventListener('pointermove', move);
            root.removeEventListener('pointerleave', hide);
            root.removeEventListener('pointerdown', hide, true);
            window.removeEventListener('keydown', hide, true);
            root.removeEventListener('wheel', hide);
        }
    };
}
