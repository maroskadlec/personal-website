/* ==========================================================================
   MAIN — the power-on story:  off → CRT warms up → boot → desktop.
   Debug URLs:  ?phase=boot&hold   ?phase=desktop   ?skip   ?rm   ?view=screen
   ========================================================================== */
import { Layout } from './core/layout.js';
import { Sound } from './core/sound.js';
import { Boot } from './boot.js';
import { buildDesktop } from './core/desktop.js';
import { atkinson, loadImage } from './gfx/dither.js';

const $ = (s) => document.querySelector(s);
const body = document.body;
const root = document.documentElement;
const params = new URLSearchParams(location.search);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('rm');

const refs = {
    mac: $('#mac'),
    glass: $('#glass'),
    slot: $('#glassSlot'),
    screen: $('#screen'),
    fx: $('#glassFx'),
    crtLine: $('#crtLine'),
    sticky: $('#stickyText'),
    powerKey: $('#powerKey'),
    pocketPower: $('#pocketPower'),
    zoomBtn: $('#zoomBtn'),
    soundBtn: $('#soundBtn')
};

let phase = 'off';
let portrait = null;
const light = { v: 0 };

const store = {
    get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } }
};

/* ---------- the room's light follows the screen ---------- */
function tweenLight(to, dur = 1.2, rgb) {
    if (rgb) root.style.setProperty('--glow-rgb', rgb);
    if (reduced) { light.v = to; root.style.setProperty('--lit', to); return; }
    gsap.to(light, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => root.style.setProperty('--lit', light.v.toFixed(3)) });
}

function setPhase(p) {
    phase = p;
    body.classList.remove('is-off', 'is-on', 'is-boot', 'is-desktop');
    if (p === 'off') body.classList.add('is-off');
    else body.classList.add('is-on', p === 'boot' ? 'is-boot' : 'is-desktop');
    refs.powerKey.setAttribute('aria-label', p === 'off' ? 'Power on' : 'Power');
}

function setSticky(html) { refs.sticky.innerHTML = html; }

/* ---------- the portrait icon (1-bit Atkinson dither of the profile photo) ---------- */
const portraitReady = loadImage('../marian-kadlec-profile-image.webp')
    .then((img) => { portrait = atkinson(img, { sx: 58, sy: 50, sw: 296, sh: 296, size: 48, contrast: 1.45, bright: 10 }); })
    .catch(() => { portrait = null; });

const fontsReady = Promise.all([
    document.fonts.load('16px "Jersey 10"'),
    document.fonts.load('400 14px "Atkinson Hyperlegible Next"'),
    document.fonts.load('700 14px "Atkinson Hyperlegible Next"'),
    document.fonts.load('32px "Reenie Beanie"')
]).catch(() => {});

/* ---------- power-on ---------- */
function crtTurnOn() {
    return new Promise((resolve) => {
        const s = refs.screen;
        const line = refs.crtLine;
        gsap.set(s, { clipPath: 'inset(49.6% 0% 49.6% 0%)', filter: 'brightness(3.2)' });
        gsap.set(line, { opacity: 1, scaleX: 0 });
        Sound.degauss();
        gsap.timeline({
            onComplete() {
                gsap.set(s, { clearProps: 'clipPath,filter,transform' });
                gsap.set(line, { opacity: 0 });
                resolve();
            }
        })
            .to(line, { scaleX: 1, duration: 0.16, ease: 'power2.out' })
            .add(() => Sound.chime(), 0.14)
            .to(s, { clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)', duration: 0.55, ease: 'expo.out' }, 0.16)
            .to(line, { opacity: 0, duration: 0.3 }, 0.28)
            .fromTo(s, { scaleX: 1.025, scaleY: 0.985 }, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.3)' }, 0.18);
    });
}

function showDesktop() {
    buildDesktop(refs.screen, { portrait });
    Boot.dismiss();
    setPhase('desktop');
    tweenLight(0.8, 1.0, '236, 244, 240');
    setSticky('double-click<br><em>Marian<br>Kadlec</em>');
    if (!reduced) {
        gsap.from('.menubar', { yPercent: -100, duration: 0.24, ease: 'steps(3)' });
        gsap.from('.icon', { opacity: 0, scale: 0.6, duration: 0.2, ease: 'steps(3)', stagger: 0.08, delay: 0.1, transformOrigin: '50% 40%' });
        gsap.from('.os .win', { opacity: 0, duration: 0.22, delay: 0.55, ease: 'steps(2)' });
    }
}

async function powerOn({ quiet = false } = {}) {
    if (phase !== 'off') return;
    const fast = reduced || params.has('skip') || store.get('mk10.booted') === '1';
    if (!quiet) { Sound.unlock(); Sound.relay(); }
    setPhase('boot');
    Boot.mount(refs.screen);
    tweenLight(0.55, 1.6, '232, 240, 238');
    setSticky('…');

    if (reduced) {
        await portraitReady;
        showDesktop();
        return;
    }
    await crtTurnOn();
    if (!quiet) Sound.hum(true);
    await Boot.run({ tasks: [fontsReady, portraitReady], fast, hold: params.has('hold'), sound: quiet ? null : Sound });
    store.set('mk10.booted', '1');
    showDesktop();
}

/* ---------- controls ---------- */
refs.powerKey.addEventListener('click', () => powerOn());
refs.pocketPower.addEventListener('click', () => powerOn());
refs.zoomBtn.addEventListener('click', () => Layout.toggleImmersive());

const syncSoundBtn = () => refs.soundBtn.classList.toggle('is-muted', Sound.muted);
refs.soundBtn.addEventListener('click', () => { Sound.unlock(); Sound.setMuted(!Sound.muted); syncSoundBtn(); if (!Sound.muted) Sound.click(); });
syncSoundBtn();

window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'f' || e.key === 'F') Layout.toggleImmersive();
    if ((e.key === 'Enter' || e.key === ' ') && phase === 'off' && t === document.body) { e.preventDefault(); powerOn(); }
});

/* the highlight on the glass drifts against the mouse, like a real reflection */
let glarePending = false;
window.addEventListener('pointermove', (e) => {
    if (glarePending) return;
    glarePending = true;
    requestAnimationFrame(() => {
        glarePending = false;
        const r = refs.glass.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
        refs.fx.style.setProperty('--gx', (30 + (0.5 - x) * 44).toFixed(1) + '%');
        refs.fx.style.setProperty('--gy', (18 + (0.5 - y) * 34).toFixed(1) + '%');
    });
}, { passive: true });

/* ---------- go ---------- */
Layout.init({ mac: refs.mac, glass: refs.glass, slot: refs.slot });
setPhase('off');
setSticky('Press<br>⏻ to<br>start');

const start = params.get('phase');
if (start === 'desktop') {
    Promise.all([portraitReady, fontsReady]).then(() => {
        tweenLight(0.8, 0, '236, 244, 240');
        buildDesktop(refs.screen, { portrait });
        setPhase('desktop');
        setSticky('double-click<br><em>Marian<br>Kadlec</em>');
    });
} else if (start === 'boot') {
    powerOn({ quiet: true });
}
