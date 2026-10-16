/* ==========================================================================
   ZOOM RECTANGLES — the signature motion of System 7: a few outlines race from
   an icon to the window it opens (and back when it closes), leaving a short trail.
   Purely decorative: it never delays anything, and reduced motion skips it.
   ========================================================================== */
import { reducedMotion, sleep } from '../../core/util.js';

const lerp = (a, b, t) => a + (b - a) * t;

/**
 * @param {HTMLElement} layer   the element the outlines are drawn in (position: relative or absolute)
 * @param {DOMRect} from        client-space rectangle to start at
 * @param {DOMRect} to          client-space rectangle to end at
 */
export async function zoomRects(layer, from, to, { steps = 7, gap = 15, trail = 3 } = {}) {
    if (reducedMotion() || !from || !to || !layer.isConnected) return;
    const base = layer.getBoundingClientRect();
    const live = [];
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const e = 1 - (1 - t) * (1 - t);                       // fast at first, settling at the end
        const d = document.createElement('div');
        d.className = 'zoom-rect';
        d.style.left = lerp(from.left, to.left, e) - base.left + 'px';
        d.style.top = lerp(from.top, to.top, e) - base.top + 'px';
        d.style.width = Math.max(2, lerp(from.width, to.width, e)) + 'px';
        d.style.height = Math.max(2, lerp(from.height, to.height, e)) + 'px';
        layer.appendChild(d);
        live.push(d);
        if (live.length > trail) live.shift().remove();
        await sleep(gap);
    }
    await sleep(gap);
    live.forEach((d) => d.remove());
}
