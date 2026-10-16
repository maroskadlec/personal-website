/* ==========================================================================
   MODES — one machine, two ways to use it:
     os   Desktop   (System 7 desktop: the portfolio as an operating system)
     cli  Terminal  (the text-based site: a terminal builds the page)
   Everything that wants to switch (tray, boot menu, icon, menu, command, key)
   calls Modes.switch(to). The transition is a CRT "channel change".
   ========================================================================== */
import { Sound } from './sound.js';
import { showBalloon } from './balloon.js';
import { local, sleep, reducedMotion, typeInto } from './util.js';

export const LABEL = { os: 'Desktop', cli: 'Terminal' };

/**
 * A mode whose code (and stylesheet) is fetched the first time it is shown, so a visitor who stays on the
 * Desktop never pays for the Terminal. It answers the same calls as the real mode.
 * @param {() => Promise<object>} load  resolves with the real mode
 */
export function lazyMode(load) {
    let real = null;
    return {
        async mount(el, context) {
            real = await load();
            await real.mount(el, context);
        },
        enter: (...a) => real && real.enter && real.enter(...a),
        leave: (...a) => real && real.leave && real.leave(...a),
        reset: (...a) => real && real.reset && real.reset(...a),
        focusTarget: () => (real && real.focusTarget ? real.focusTarget() : null)
    };
}
const LINE = { os: 'launching Marian OS…', cli: 'exec marian-cli' };

const modes = {};
const subs = new Set();
let current = null;
let busy = false;
let refs = null;
let ctx = null;

const byId = (id) => document.getElementById(id);

function announce(name) {
    refs.live.textContent = '';
    setTimeout(() => { refs.live.textContent = `Switched to ${LABEL[name]} mode`; }, 60);
}

function setBody(name) {
    document.body.dataset.mode = name;
}

function emit() { subs.forEach((fn) => fn(current)); }

function remember(name, push) {
    local.set('mk10.mode', name);
    const url = '#/' + name;
    if (location.hash.startsWith(url + '/')) return;             // a deep link (#/os/open/<id>): the mode itself consumes it
    try {
        if (push && location.hash !== url) history.pushState({ mode: name }, '', url);
        else history.replaceState({ mode: name }, '', url);
    } catch (e) { /* file:// or sandbox */ }
}

async function ensureMounted(m) {
    if (m.mounted) return;
    await m.mod.mount(m.el, ctx);
    m.mounted = true;
}

function focusInto(m) {
    const target = (m.mod.focusTarget && m.mod.focusTarget()) || m.el;
    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT)$/.test(target.tagName)) target.tabIndex = -1;
    target.focus({ preventScroll: true });
}

/** leave() runs only for a mode that is actually lit, and a failing leave() must never wedge the machine */
function leave(m) {
    if (!m.active) return;
    m.active = false;
    try { m.mod.leave?.(); } catch (e) { console.error(`[modes] ${m.name}.leave() failed`, e); }
}

function swap(from, to) {
    if (from) {
        leave(from);
        from.el.hidden = true;
        from.el.inert = true;
    }
    to.el.hidden = false;
    to.el.inert = false;
    to.active = true;
}

async function transition(fromName, toName, via, open = null) {
    const stage = refs.stage;
    const line = refs.crtLine;
    const overlay = refs.overlay;
    const text = refs.line;
    const from = modes[fromName];
    const to = modes[toName];

    await ensureMounted(to);                                   // build the new mode while the old one is still lit

    if (reducedMotion() || !window.gsap) {
        swap(from, to);
        await to.mod.enter?.({ via, first: to.entered++ === 0, open });
        return;
    }

    Sound.switch();
    // 1. the picture collapses to a white line, like a tube switching off
    gsap.set(line, { opacity: 1, scaleX: 1 });
    await gsap.to(stage, { clipPath: 'inset(49.6% 0% 49.6% 0%)', filter: 'brightness(2.6)', duration: 0.26, ease: 'power3.in' });
    gsap.set(stage, { clipPath: 'inset(50% 0% 50% 0%)' });
    gsap.to(line, { opacity: 0, duration: 0.12 });

    // 2. a line of shell on the black
    overlay.classList.add('on');
    text.textContent = '';
    await typeInto(text, LINE[toName], { speed: 16, jitter: 22, onChar: () => Sound.key() });
    await sleep(140);
    overlay.classList.remove('on');

    // 3. swap the modes behind the black, then light up the new one from the line
    swap(from, to);
    const first = to.entered++ === 0;
    gsap.set(line, { opacity: 1, scaleX: 1 });
    const enter = to.mod.enter?.({ via, first, open });
    await gsap.to(stage, { clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)', duration: 0.5, ease: 'expo.out' });
    gsap.to(line, { opacity: 0, duration: 0.25 });
    gsap.set(stage, { clearProps: 'clipPath,filter' });
    await enter;
}

export const Modes = {
    init(context) {
        ctx = context;
        refs = {
            stage: byId('stage'),
            crtLine: byId('crtLine'),
            overlay: byId('switchOverlay'),
            line: byId('switchLine'),
            live: byId('live')
        };
        window.addEventListener('popstate', () => {
            const to = Modes.parseHash();
            if (to && to !== current && !busy) Modes.switch(to, { via: 'history', push: false });
        });
    },

    register(name, mod) {
        modes[name] = { name, mod, el: byId('mode-' + name), mounted: false, entered: 0, active: false };
    },

    get current() { return current; },
    get busy() { return busy; },

    /** subscribe to mode changes; fires once immediately */
    on(fn) { subs.add(fn); fn(current); return () => subs.delete(fn); },

    parseHash() {
        const m = location.hash.match(/^#\/(os|cli)\b/);
        return m ? m[1] : null;
    },

    /** show a mode without a transition (used while booting) */
    async show(name, { via = 'boot' } = {}) {
        const m = modes[name];
        if (!m) return;
        await ensureMounted(m);
        Object.keys(modes).forEach((k) => { if (k !== name) { leave(modes[k]); modes[k].el.hidden = true; modes[k].el.inert = true; } });
        m.el.hidden = false;
        m.el.inert = false;
        m.active = true;
        current = name;
        setBody(name);
        const first = m.entered++ === 0;
        remember(name, false);
        emit();
        await m.mod.enter?.({ via, first });
        focusInto(m);
    },

    /** switch with the CRT channel-change transition */
    /** `open` is an item of the Desktop to open when the switch lands there (the Terminal's `open <name>`) */
    async switch(to, { via = 'ui', push = true, open = null } = {}) {
        if (!modes[to] || to === current || busy) return;
        busy = true;
        const from = current;
        try {
            await transition(from, to, via, open);
            current = to;
            setBody(to);
            remember(to, push);
            emit();
            focusInto(modes[to]);
            announce(to);
        } catch (err) {
            // the other mode could not be built (a file of the Terminal did not come over the network): the current one is still lit, say what happened
            console.error(`[modes] could not switch to ${to}`, err);
            const text = `${LABEL[to]} could not be loaded. Check the connection and reload the page.`;
            refs.live.textContent = text;
            const tab = document.querySelector(`#mode-${from} .tray-tab[data-mode="${to}"]`);
            const b = tab && showBalloon({ anchor: tab, text, variant: from === 'cli' ? 'cli' : 'os', role: 'alert' });
            if (b) setTimeout(() => b.hide(), 7000);
        } finally {
            busy = false;
        }
    },

    /** leave the current mode and hide everything (restart / shut down) */
    hideAll() {
        Object.values(modes).forEach((m) => {
            leave(m);
            if (m.mounted) {
                try { m.mod.reset?.(); } catch (e) { console.error(`[modes] ${m.name}.reset() failed`, e); }
                m.entered = 0;                         // the next start is a first start again
            }
            m.el.hidden = true;
            m.el.inert = true;
        });
        current = null;
        emit();
    }
};
