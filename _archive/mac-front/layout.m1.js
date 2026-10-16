/* ==========================================================================
   LAYOUT — how big the Mac is, and whether it is shown at all.

   mac        the compact Mac in front view, cropped by the viewport
   immersive  the Mac steps aside, the glass fills the viewport (⤢ / key F)
   pocket     phones and tiny windows: always immersive, no Mac

   The OS inside .screen always runs at the glass's native pixel size (no
   scaling), so text and 1px lines stay crisp at every size.
   ========================================================================== */

const MIN_W = 440;                         // below this the Mac gets too small to be useful
const refs = {};
let userImmersive = false;
let busy = false;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('rm');

function measure() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const top = Math.round(vh * 0.03);
    // visible part of the Mac is ≈ 125u (u = W/100): frame 11 + recess 83 + chin ≈ 31
    const byHeight = (vh * 0.97 - top) / 1.25;
    const byWidth = (vw * 0.96) / 1.30;
    const debugW = parseInt(new URLSearchParams(location.search).get('W'), 10);   // ?W=640 pins the size for design review
    if (debugW) return { vw, vh, top, W: debugW, forced: false };
    const W = Math.floor(Math.min(byHeight, byWidth));
    const forced = (coarse && vw < 900) || vh < 420 || W < MIN_W;
    return { vw, vh, top, W, forced };
}

function applyMetrics(m) {
    refs.mac.style.setProperty('--W', m.W + 'px');
    refs.mac.style.setProperty('--mac-top', m.top + 'px');
}

function setClasses(forced, immersive) {
    document.body.classList.toggle('is-pocket', forced);
    document.body.classList.toggle('is-immersive', immersive);
}

function pinGlass(rect) {
    const s = refs.glass.style;
    s.position = 'fixed';
    s.inset = 'auto';
    s.zIndex = '30';
    s.left = rect.left + 'px';
    s.top = rect.top + 'px';
    s.width = rect.width + 'px';
    s.height = rect.height + 'px';
}
const unpinGlass = () => refs.glass.removeAttribute('style');

function radii() {
    const cs = getComputedStyle(refs.glass).borderTopLeftRadius.split(' ');
    return [parseFloat(cs[0]) || 0, parseFloat(cs[1] || cs[0]) || 0];
}

/** glass rectangle: from -> to, resizing for real so the OS reflows while it grows.
 *  toZero: the corner radius shrinks to 0 (entering fullscreen) or grows back (leaving). */
function tweenGlass(from, to, [rx, ry], toZero, done) {
    const g = refs.glass.style;
    const p = { t: 0 };
    gsap.to(p, {
        t: 1,
        duration: 0.8,
        ease: 'power3.inOut',
        onUpdate() {
            const t = p.t;
            g.left = from.left + (to.left - from.left) * t + 'px';
            g.top = from.top + (to.top - from.top) * t + 'px';
            g.width = from.width + (to.width - from.width) * t + 'px';
            g.height = from.height + (to.height - from.height) * t + 'px';
            const k = toZero ? 1 - t : t;
            g.borderRadius = `${rx * k}px / ${ry * k}px`;
        },
        onComplete: done
    });
}

export const Layout = {
    get immersive() { return document.body.classList.contains('is-immersive'); },
    get forced() { return document.body.classList.contains('is-pocket'); },

    init({ mac, glass, slot }) {
        Object.assign(refs, { mac, glass, slot });
        const params = new URLSearchParams(location.search);
        userImmersive = params.get('view') === 'screen';
        this.refresh(true);
        let raf = 0;
        const again = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => this.refresh()); };
        window.addEventListener('resize', again);
        if (window.visualViewport) window.visualViewport.addEventListener('resize', again);
    },

    refresh() {
        if (busy) return;
        const m = measure();
        applyMetrics(m);
        setClasses(m.forced, m.forced || userImmersive);
    },

    toggleImmersive() {
        const m = measure();
        if (busy || m.forced) return;
        const goIn = !userImmersive;
        userImmersive = goIn;
        if (reduced() || !window.gsap) { setClasses(false, goIn); return; }

        busy = true;
        const r0 = radii();
        if (goIn) {
            const from = refs.slot.getBoundingClientRect();
            pinGlass(from);
            document.body.classList.add('is-immersive');
            tweenGlass(from, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }, r0, true, () => {
                unpinGlass();
                busy = false;
            });
        } else {
            pinGlass({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });
            document.body.classList.remove('is-immersive');
            const to = refs.slot.getBoundingClientRect();
            tweenGlass({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }, to, r0, false, () => {
                unpinGlass();
                busy = false;
                this.refresh();
            });
        }
    }
};
