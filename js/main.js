/* ==========================================================================
   MAIN — the machine: power gate → CRT warms up → (boot menu) → boot → a mode.
   Debug URLs:  ?phase=desktop   ?phase=boot&hold   ?phase=menu   ?mode=cli
                ?boot=menu   ?skip   ?rm=1   ?fx=0   ?rebuild
   ========================================================================== */
import { Sound } from './core/sound.js';
import { Modes, lazyMode } from './core/modes.js';
import { Assets } from './core/assets.js';
import { initScreen } from './core/screen.js';
import { Crash } from './core/crash.js';
import { local, session, sleep, params, reducedMotion, loadCss, whenIdle, slowConnection } from './core/util.js';
import { Boot } from './boot.js';
import { BootMenu } from './bootmenu.js';
import { OSMode } from './modes/os/os.js';
import { Bridge } from './modes/os/bridge.js';
import { hints } from './content/eggs.js';

/* the machine is running: from now on the plain text of the page (#seo) is only for search engines (it is hidden and inert here) */
window.__mkAlive = true;
try { sessionStorage.removeItem('mk10.retried'); } catch (e) { /* storage is blocked */ }
document.documentElement.classList.remove('no-js', 'failed');
document.documentElement.classList.add('js');

/* for whoever opens the console */
console.info('%c Marian OS %c ' + hints.console, 'background:#20b2aa;color:#00110f;font-weight:700;border-radius:3px', 'color:inherit');

const $ = (s) => document.querySelector(s);
const body = document.body;
const reduced = reducedMotion();

const refs = {
    stage: $('#stage'),
    bootRoot: $('#bootRoot'),
    crtLine: $('#crtLine'),
    gate: $('#gate'),
    gatePower: $('#gatePower'),
    gateSound: $('#gateSound')
};

initScreen();                              // brightness, glass, volume and alert sound from the control panels

let state = 'off';                       // off | busy | on

/* ---------- the tube ---------- */
function crtTurnOn(sound) {
    return new Promise((resolve) => {
        const s = refs.stage;
        const line = refs.crtLine;
        gsap.set(s, { clipPath: 'inset(49.6% 0% 49.6% 0%)', filter: 'brightness(3.2)' });
        gsap.set(line, { opacity: 1, scaleX: 0 });
        if (sound) Sound.degauss();
        gsap.timeline({
            onComplete() {
                gsap.set(s, { clearProps: 'clipPath,filter,transform' });
                gsap.set(line, { opacity: 0 });
                resolve();
            }
        })
            .to(line, { scaleX: 1, duration: 0.16, ease: 'power2.out' })
            .add(() => { if (sound) Sound.chime(); }, 0.14)
            .to(s, { clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)', duration: 0.55, ease: 'expo.out' }, 0.16)
            .to(line, { opacity: 0, duration: 0.3 }, 0.28)
            .fromTo(s, { scaleX: 1.02, scaleY: 0.985 }, { scaleX: 1, scaleY: 1, duration: 0.8, ease: 'elastic.out(1, 0.3)' }, 0.18);
    });
}

async function crtTurnOff() {
    Sound.hum(false);
    if (reduced || !window.gsap) return;
    Sound.off();
    gsap.set(refs.crtLine, { opacity: 1, scaleX: 1 });
    await gsap.to(refs.stage, { clipPath: 'inset(49.6% 0% 49.6% 0%)', filter: 'brightness(2.4)', duration: 0.28, ease: 'power3.in' });
    gsap.set(refs.stage, { clipPath: 'inset(50% 0% 50% 0%)' });
    await gsap.to(refs.crtLine, { scaleX: 0, duration: 0.22, ease: 'power2.in' });
    await gsap.to(refs.crtLine, { opacity: 0, duration: 0.3 });
}

/* ---------- the gate ---------- */
async function hideGate(instant) {
    const g = refs.gate;
    if (g.hidden) return;
    if (!instant && !reduced) { g.classList.add('is-leaving'); await sleep(260); }
    g.hidden = true;
}

function showGate() {
    const g = refs.gate;
    g.hidden = false;
    g.classList.remove('is-leaving');
    requestAnimationFrame(() => g.classList.add('is-ready'));
    refs.gatePower.focus();
}

const syncGateSound = () => {
    const on = !Sound.muted;
    refs.gateSound.textContent = on ? 'Sound: on' : 'Sound: off';
    refs.gateSound.setAttribute('aria-pressed', String(on));
};

/* ---------- what to start ---------- */
function fontsFor(mode) {
    const list = [
        document.fonts.load('16px "Jersey 10"'),
        document.fonts.load('400 14px "Atkinson Hyperlegible Next"'),
        document.fonts.load('700 14px "Atkinson Hyperlegible Next"')
    ];
    if (mode === 'cli') list.push(document.fonts.load('400 14px "JetBrains Mono"'), document.fonts.load('800 40px "JetBrains Mono"'));
    return Promise.race([Promise.all(list).catch(() => {}), sleep(2000)]);
}

function startPlan({ forceMenu = false, forceMode = null } = {}) {
    const paramMode = ['os', 'cli'].includes(params.get('mode')) ? params.get('mode') : null;
    const mode = forceMode || paramMode || Modes.parseHash() || local.get('mk10.mode');
    const menu = forceMenu || params.get('boot') === 'menu' || (!mode && !params.has('skip'));
    return { menu, mode: mode === 'cli' ? 'cli' : 'os' };
}

/* ---------- the machine ---------- */
const Machine = {
    get state() { return state; },

    async powerOn({ gesture = true, forceMenu = false, forceMode = null, instant = false, skipBoot = false, hold = false, fast = null } = {}) {
        if (state !== 'off') return;
        state = 'busy';
        try {
            if (gesture) { Sound.unlock(); Sound.relay(); }
            await hideGate(!gesture);

            const plan = startPlan({ forceMenu, forceMode });
            body.classList.replace('is-off', 'is-on');

            const startBoot = (m) => {
                const quick = fast ?? (reduced || params.has('skip') || session.get('mk10.booted') === '1');
                return Boot.run({ tasks: [fontsFor(m), Assets.ready], fast: quick, hold, sound: gesture ? Sound : null });
            };

            // what the tube shows the moment it lights up
            let bootShown = false;
            if (plan.menu) BootMenu.mount(refs.bootRoot);
            else if (plan.mode === 'os' && !skipBoot) { Boot.mount(refs.bootRoot); bootShown = true; }

            if (!instant && !reduced && window.gsap) await crtTurnOn(gesture);
            if (gesture) Sound.hum(true);

            let mode = plan.mode;
            if (plan.menu) {
                mode = await BootMenu.run({ seconds: 5, sound: gesture ? Sound : null });
                BootMenu.dismiss();
                if (mode === 'os' && !skipBoot) { Boot.mount(refs.bootRoot); bootShown = true; }
            }

            // the start-up screen runs once the tube is lit, as it always did
            if (bootShown) await startBoot(mode);
            else await fontsFor(mode);

            await Modes.show(mode, { via: 'boot' });
            if (bootShown) Boot.dismiss();
            session.set('mk10.booted', '1');
        } catch (err) {
            // a machine that cannot finish booting must never stay dark: light the tube and show the desktop
            console.error('[boot] failed, falling back to the desktop', err);
            try {
                BootMenu.dismiss();
                Boot.dismiss();
                body.classList.replace('is-off', 'is-on');
                if (window.gsap) gsap.set([refs.stage, refs.crtLine], { clearProps: 'all' });
                await Modes.show('os', { via: 'recover' });
            } catch (e2) { console.error('[boot] recovery failed too', e2); }
        }
        state = 'on';
        warmTerminal();
    },

    async restart({ menu = true, to = null } = {}) {
        if (state !== 'on') return;
        state = 'busy';
        Modes.hideAll();
        await crtTurnOff();
        body.classList.replace('is-on', 'is-off');
        await sleep(reduced ? 60 : 650);
        state = 'off';
        await Machine.powerOn({ gesture: true, forceMenu: menu && !to, forceMode: to, fast: false });
    },

    async shutdown() {
        if (state !== 'on') return;
        state = 'busy';
        Modes.hideAll();
        await crtTurnOff();
        body.classList.replace('is-on', 'is-off');
        state = 'off';
        showGate();
    }
};

/* ---------- wiring ---------- */
/* The Terminal (its code and its stylesheet) is fetched the first time it is shown, or quietly once the Desktop is up. */
const loadCli = () => import('./modes/cli/cli.js').then((m) => m.CLIMode);
function warmTerminal() {
    if (slowConnection() || Modes.current !== 'os') return;
    whenIdle(() => { loadCss('css/cli.css?v=5e596b2340'); loadCli(); }, 8000);
}

Modes.register('os', OSMode);
Modes.register('cli', lazyMode(() => Promise.all([loadCss('css/cli.css?v=5e596b2340'), loadCli()]).then(([, mode]) => mode)));
Modes.init({
    switchMode: (to, opts) => Modes.switch(to, opts),
    restart: (opts) => Machine.restart(opts),
    shutdown: () => Machine.shutdown(),
    crash: (detail) => Crash.show(detail),
    desktop: Bridge                                    // what the Terminal can see of the Desktop (ls, cd, cat, open)
});
Crash.init({ onRestart: () => Machine.restart({ menu: true }) });

refs.gatePower.addEventListener('click', () => Machine.powerOn());
refs.gateSound.addEventListener('click', () => {
    Sound.setMuted(!Sound.muted);                  // fires mk:sound
    if (!Sound.muted) { Sound.unlock(); Sound.click(); }
});
document.addEventListener('mk:sound', syncGateSound);
syncGateSound();

// the gate fades in once its font is ready (no flash of fallback type)
Promise.race([document.fonts.load('28px "Jersey 10"'), sleep(1500)]).then(() => refs.gate.classList.add('is-ready'));

window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (Crash.active) return;                      // after a system error only Restart works
    if (e.key === '`' && !typing && state === 'on') {
        e.preventDefault();
        Modes.switch(Modes.current === 'os' ? 'cli' : 'os', { via: 'key' });
    } else if ((e.key === 'Enter' || e.key === ' ') && state === 'off' && !refs.gate.hidden && t === document.body) {
        e.preventDefault();
        Machine.powerOn();
    }
}, true);

window.__mk = { Machine, Modes, Crash };            // handy in the console

/* ---------- go ---------- */
const phase = params.get('phase');
if (phase === 'desktop') Machine.powerOn({ gesture: false, forceMode: 'os', instant: true, skipBoot: true });
else if (phase === 'boot') Machine.powerOn({ gesture: false, forceMode: 'os', instant: true, hold: params.has('hold'), fast: false });
else if (phase === 'menu') Machine.powerOn({ gesture: false, forceMenu: true, instant: true });
else if (['os', 'cli'].includes(params.get('mode'))) Machine.powerOn({ gesture: false, instant: true, skipBoot: true });
