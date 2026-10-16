/* ==========================================================================
   SCROLL BARS — the classic arrows-track-thumb bar on a native scroller.
   The content keeps scrolling by itself (wheel, touch, keys, Page Down), the
   bar only mirrors it and can drive it: arrows, track clicks, dragging the thumb.
   ========================================================================== */

export function attachScrollbar(scroller, host) {
    const bar = document.createElement('div');
    bar.className = 'sb';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<i class="sb-btn up"></i><div class="sb-track"><i class="sb-thumb"></i></div><i class="sb-btn down"></i>';
    host.appendChild(bar);

    const track = bar.querySelector('.sb-track');
    const thumb = bar.querySelector('.sb-thumb');
    const up = bar.querySelector('.up');
    const down = bar.querySelector('.down');

    const max = () => scroller.scrollHeight - scroller.clientHeight;
    const geometry = () => {
        const trackH = track.clientHeight;
        const h = Math.max(16, Math.round(trackH * scroller.clientHeight / Math.max(1, scroller.scrollHeight)));
        return { trackH, h, room: Math.max(1, trackH - h) };
    };

    function sync() {
        const m = max();
        const idle = m <= 1;
        bar.classList.toggle('is-idle', idle);
        scroller.tabIndex = idle ? -1 : 0;                     // a scrollable area must be reachable by keyboard
        if (idle) return;
        const g = geometry();
        thumb.style.height = g.h + 'px';
        thumb.style.top = Math.round(g.room * (scroller.scrollTop / m)) + 'px';
    }

    /* arrows: hold to keep scrolling */
    function hold(btn, dir) {
        let t1 = 0;
        let t2 = 0;
        const step = () => scroller.scrollBy({ top: dir * 28, behavior: 'instant' });
        const stop = () => { clearTimeout(t1); clearInterval(t2); window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop); };
        btn.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            step();
            t1 = setTimeout(() => { t2 = setInterval(step, 55); }, 320);
            window.addEventListener('pointerup', stop);
            window.addEventListener('pointercancel', stop);
        });
    }
    hold(up, -1);
    hold(down, 1);

    /* the track: a click pages toward the pointer */
    track.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || e.target === thumb) return;
        e.preventDefault();
        const r = thumb.getBoundingClientRect();
        const dir = e.clientY < r.top ? -1 : 1;
        scroller.scrollBy({ top: dir * (scroller.clientHeight - 28), behavior: 'instant' });
    });

    /* the thumb: drag */
    let drag = null;
    thumb.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        try { thumb.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is already gone */ }
        drag = { id: e.pointerId, y: e.clientY, top: scroller.scrollTop };
    });
    thumb.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const g = geometry();
        scroller.scrollTop = drag.top + ((e.clientY - drag.y) / g.room) * max();
    });
    const end = (e) => { if (drag && e.pointerId === drag.id) drag = null; };
    thumb.addEventListener('pointerup', end);
    thumb.addEventListener('pointercancel', end);

    scroller.addEventListener('scroll', sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(scroller);
    if (scroller.firstElementChild) ro.observe(scroller.firstElementChild);
    sync();

    return {
        sync,
        /** call after replacing the content so the new first child is watched too */
        watch() {
            ro.disconnect();
            ro.observe(scroller);
            if (scroller.firstElementChild) ro.observe(scroller.firstElementChild);
            sync();
        },
        destroy() { ro.disconnect(); scroller.removeEventListener('scroll', sync); bar.remove(); }
    };
}
