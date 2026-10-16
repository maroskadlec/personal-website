/* ==========================================================================
   CLI MODE — the Terminal site (ported from version-6-cli-to-ui.html).
   First visit: a terminal "builds" the page section by section, then folds into
   a docked shell at the bottom. After that the finished site is there at once.
   Content comes from js/content/*, commands from ./shell.js.
   ========================================================================== */
import { profile, skills, skillCount, career, ai, links } from '../../content/index.js';
import { Sound } from '../../core/sound.js';
import { createTray } from '../../core/tray.js';
import { coach } from '../../core/coach.js';
import { esc, rich, local, reducedMotion, typeInto, params } from '../../core/util.js';
import { createDotGrid } from './dotgrid.js';
import { createShell, THEMES, PROMPT } from './shell.js';

const BUILT_KEY = 'mk10.cli.built';
const THEME_KEY = 'mk10.cli.themeChoice';       // only ever written by an explicit `theme <name>`
const DEFAULT_THEME = 'mono';

const STEPS = [
    { text: `▸ mounting hero <span class="dim">(1 designer, ${profile.years}y experience, git push included)</span>… <span class="ok">✓</span>`, step: 'hero' },
    { text: '▸ reading about.md <span class="dim">(design + code, AI in the loop)</span>… <span class="ok">✓</span>', step: 'about' },
    { text: `▸ installing skills@${skillCount}.0.0… <span class="ok">✓</span>`, step: 'skills' },
    { text: `▸ importing career <span class="dim">(${career.companies.length} redesigns)</span>… <span class="ok">✓</span>`, step: 'career' },
    { text: '▸ wiring ai-workflow <span class="dim">(tools rotate, method stays)</span>… <span class="ok">✓</span>', step: 'ai' },
    { text: '▸ deploying links… <span class="ok">✓</span>', step: 'links' },
    { text: '<span class="ok">✓ built in 3.2s</span> <span class="dim">— opening ~/portfolio</span>', step: 'footer' }
];

function template() {
    const p = profile;
    const about = p.about.map((x) => `<p${x.ai ? ' class="ai-line"' : ''}>${esc(x.text)}</p>`).join('');
    const skillGroups = skills.map((g) =>
        `<h3 class="skill-group">${esc(g.group)}<span aria-hidden="true">/</span></h3><ul class="skills">${g.items.map((s) => `<li>${rich(s)}</li>`).join('')}</ul>`).join('');
    const commits =
        `<li><span class="hash" aria-hidden="true">${career.head.hash}</span> <span class="feat">${esc(career.head.type)}:</span> <span class="co">${esc(career.head.text)}</span></li>` +
        career.companies.map((c) =>
            `<li><span class="hash" aria-hidden="true">${c.hash}</span> <span class="feat">feat(redesign):</span> <span class="co">${esc(c.name)}</span></li>`).join('') +
        `<li><span class="hash" aria-hidden="true">${career.init.hash}</span> <span class="feat">${esc(career.init.text)}</span></li>`;
    const flow = ai.workflow.map((w, i) => {
        const tree = i === 0 ? '┌' : i === ai.workflow.length - 1 ? '└' : '├';
        return `<div class="flow-row" role="listitem"><span class="flow-tree" aria-hidden="true">${tree}</span>` +
            `<span class="flow-stage">${esc(w.stage)}</span><span class="flow-text"><span aria-hidden="true">→ </span>${rich(w.text)}</span></div>`;
    }).join('');
    const linkBtns = links.map((l) => `<a class="link-btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}<span class="sr-only"> (opens in a new tab)</span></a>`).join('');

    return `
        <div class="cli-bg" aria-hidden="true"></div>
        <header class="cli-bar">
            <p class="cli-id"><span class="u">marian@kadlec</span> <span class="p">~/portfolio</span></p>
            <span data-tray></span>
        </header>
        <div class="cli-scroll" data-scroll>
            <main class="site" id="cliMain" aria-label="${esc(p.name)} — Terminal">
                <header class="hero reveal" data-step="hero">
                    <div class="hero-text">
                        <p class="crumb">~/portfolio <span class="ok">✓ build passing</span> · ${esc(p.place)}</p>
                        <h1 tabindex="-1">${esc(p.name)}</h1>
                        <p class="title">${esc(p.title)} <span class="tagline">${p.tagline.map((l) => `<span class="tl">${esc(l)}</span>`).join(' ')}</span></p>
                    </div>
                    <div class="hero-photo">
                        <img src="${esc(p.photo)}" alt="Portrait of ${esc(p.name)}" loading="eager">
                        <span class="tag">designer.webp · ${p.years}y+</span>
                    </div>
                </header>
                <section class="about reveal" data-step="about">
                    <h2 class="sec-h"><span class="sr-only">About</span><span aria-hidden="true">cat <b>about.md</b></span></h2>
                    ${about}
                </section>
                <section class="reveal" data-step="skills">
                    <h2 class="sec-h"><span class="sr-only">Skills</span><span aria-hidden="true">ls <b>./skills</b> --verbose <span>· ${skillCount} modules installed</span></span></h2>
                    ${skillGroups}
                </section>
                <section class="reveal" data-step="career">
                    <h2 class="sec-h"><span class="sr-only">Career</span><span aria-hidden="true">git log <b>./career</b> --oneline</span></h2>
                    <ul class="career">${commits}</ul>
                </section>
                <section class="reveal" data-step="ai">
                    <h2 class="sec-h"><span class="sr-only">How AI fits in</span><span aria-hidden="true">ai <b>--workflow</b></span></h2>
                    <p class="flow-lead">${esc(ai.lead)}</p>
                    <div class="flow" role="list">${flow}</div>
                    <p class="flow-note"><span class="k">delivery</span><span class="v">${esc(ai.delivery)}</span></p>
                    <p class="flow-note"><span class="k">result</span><span class="v">${esc(ai.result.text)} <span class="ok">${esc(ai.result.gain)}</span></span></p>
                </section>
                <section class="reveal" data-step="links">
                    <h2 class="sec-h"><span class="sr-only">Links</span><span aria-hidden="true">open <b>./links</b> --external</span></h2>
                    <div class="links-row">
                        ${linkBtns}
                        <a class="link-btn mail" href="mailto:${esc(p.email)}">marian --hire</a>
                    </div>
                </section>
                <footer class="reveal" data-step="footer">
                    <p>© ${new Date().getFullYear()} ${esc(p.name)} - made with vibe coding.</p>
                    <p class="cmd-hint">the terminal below works — try <b>help</b>, <b>theme claude</b> or <b>gui</b></p>
                </footer>
            </main>
        </div>

        <div class="intro-veil" aria-hidden="true"></div>
        <div class="intro-wrap">
            <div class="intro-term" role="group" aria-label="Build log">
                <div class="term-bar">
                    <span class="dot dot-r" aria-hidden="true"></span><span class="dot dot-y" aria-hidden="true"></span><span class="dot dot-g" aria-hidden="true"></span>
                    <span class="term-title">marian@kadlec: ~/portfolio — zsh</span>
                    <button class="skip-btn" type="button">skip<span aria-hidden="true"> ⏎</span></button>
                </div>
                <div class="intro-body" aria-hidden="true"></div>
            </div>
        </div>

        <div class="shell-out" aria-live="polite">
            <button class="shell-out-close" type="button"><span aria-hidden="true">✕</span> close</button>
            <div class="shell-log"></div>
        </div>
        <div class="dock" role="group" aria-label="Interactive terminal">
            <span class="p"><span class="u">marian@kadlec</span> <span class="dock-path">~</span> $</span>
            <span class="dock-typed" aria-hidden="true"></span>
            <span class="dock-caret" aria-hidden="true"></span>
            <span class="dock-hint">type <b>help</b> ⏎</span>
            <input class="shell-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command input">
        </div>`;
}

let root = null;
let ctx = null;
let q = null;                      // cached elements
let grid = null;
let shell = null;
let theme = DEFAULT_THEME;
let skip = false;
let introRunning = false;
let cancelCoach = () => {};
let removeTyping = () => {};
let removeKeyboardWatch = () => {};

const $ = (sel) => root.querySelector(sel);

/** persist only when the visitor chose the theme: the default must stay free to change */
function applyTheme(name, { persist = false } = {}) {
    if (!(name in THEMES)) return false;
    theme = name;
    if (name === DEFAULT_THEME) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', name);
    if (grid) grid.setColor(THEMES[name]);
    if (persist) local.set(THEME_KEY, name);
    return true;
}

/** print some lines; `gap: false` keeps the next print right below (a command that prints line by line) */
function print(lines, { gap = true } = {}) {
    // a gap that waits at the end is taken back, so output printed in pieces reads as one block
    const last = q.log.lastElementChild;
    if (last && last.classList.contains('gap') && gap === false) last.remove();
    lines.forEach((l) => {
        const d = document.createElement('div');
        d.className = 'line';
        d.innerHTML = l;
        q.log.appendChild(d);
    });
    if (gap) {
        const g = document.createElement('div');
        g.className = 'gap';
        q.log.appendChild(g);
    }
    q.out.classList.add('open');
    q.out.scrollTop = q.out.scrollHeight;
}

function clearOut() {
    q.log.innerHTML = '';
    q.out.classList.remove('open');
}

/* ---------- the build intro ---------- */
const delay = (ms) => new Promise((r) => (skip ? r() : setTimeout(r, ms)));

function addLine(html) {
    const d = document.createElement('div');
    d.className = 'line';
    d.innerHTML = html;
    q.introBody.appendChild(d);
    return d;
}

function revealStep(name) {
    const el = root.querySelector(`.reveal[data-step="${name}"]`);
    if (el) el.classList.add('on');
}

function showBuilt() {
    root.querySelectorAll('.reveal').forEach((el) => el.classList.add('on'));
    root.classList.remove('is-pre');
    root.classList.add('is-built');
}

function finishBuild() {
    root.querySelectorAll('.reveal').forEach((el) => el.classList.add('on'));
    local.set(BUILT_KEY, '1');

    let finished = false;
    const done = () => {
        if (finished) return;
        finished = true;
        introRunning = false;
        root.classList.remove('is-pre');
        root.classList.add('is-built');
        if (window.gsap) gsap.set(q.introTerm, { clearProps: 'all' });
    };
    if (!window.gsap || reducedMotion() || skip) { done(); return Promise.resolve(); }

    return new Promise((resolve) => {
        setTimeout(() => { done(); resolve(); }, 1500);          // background tabs pause rAF: never get stuck
        const t = q.introTerm.getBoundingClientRect();
        q.dock.style.visibility = 'hidden';
        root.classList.add('is-built');
        const d = q.dock.getBoundingClientRect();
        root.classList.remove('is-built');
        q.dock.style.visibility = '';

        gsap.to(q.veil, { opacity: 0, duration: 0.5, ease: 'power2.out' });
        gsap.to(q.introTerm, {
            duration: 0.75,
            ease: 'power3.inOut',
            x: (d.left + d.width / 2) - (t.left + t.width / 2),
            y: (d.top + d.height / 2) - (t.top + t.height / 2),
            scaleX: d.width / t.width,
            scaleY: d.height / t.height,
            opacity: 0.25,
            onComplete: () => { done(); resolve(); }
        });
    });
}

async function runIntro() {
    introRunning = true;
    skip = false;
    q.introBody.innerHTML = '';
    if (window.gsap) gsap.set(q.veil, { clearProps: 'opacity' });
    root.classList.remove('is-built');
    root.classList.add('is-pre');

    const onKey = (e) => { if (e.key === 'Enter' || e.key === 'Escape') skip = true; };
    window.addEventListener('keydown', onKey);
    q.skipBtn.onclick = () => { skip = true; };

    const line = addLine(PROMPT);
    const span = document.createElement('span');
    span.className = 'c';
    line.appendChild(span);
    await delay(420);
    await typeInto(span, './build-portfolio.sh', { skip: () => skip, onChar: () => Sound.key() });
    await delay(340);
    for (let i = 0; i < STEPS.length; i++) {
        if (!introRunning) break;
        addLine(STEPS[i].text);
        revealStep(STEPS[i].step);
        await delay(i === STEPS.length - 1 ? 520 : 330);
    }
    window.removeEventListener('keydown', onKey);
    await finishBuild();
}

/** The on-screen keyboard covers the bottom of the page without resizing it (iOS, and Chrome on Android since version 108):
    only the visual viewport shrinks. Lift the dock by the covered height so the line you type stays in sight. */
function watchKeyboard() {
    const vv = window.visualViewport;
    if (!vv || !root) return () => {};
    const set = () => {
        const covered = Math.round(window.innerHeight - vv.height - vv.offsetTop);
        const pinched = vv.scale > 1.05;                                                 // a zoomed-in page also has a smaller visual viewport: that is not a keyboard
        root.style.setProperty('--kb', !pinched && covered > 80 ? covered + 'px' : '0px');    // less than 80 px is the browser's own bar moving
    };
    vv.addEventListener('resize', set);
    vv.addEventListener('scroll', set);
    set();
    return () => {
        vv.removeEventListener('resize', set);
        vv.removeEventListener('scroll', set);
        root.style.removeProperty('--kb');
    };
}

/** typing anywhere starts typing into the shell, like a real terminal */
function captureTyping() {
    const onKey = (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (!root.classList.contains('is-built')) return;
        q.input.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
}

export const CLIMode = {
    async mount(el, context) {
        root = el;
        ctx = context;
        el.innerHTML = template();
        q = {
            introBody: $('.intro-body'),
            introTerm: $('.intro-term'),
            veil: $('.intro-veil'),
            skipBtn: $('.skip-btn'),
            dock: $('.dock'),
            path: $('.dock-path'),
            typed: $('.dock-typed'),
            input: $('.shell-input'),
            out: $('.shell-out'),
            log: $('.shell-log'),
            close: $('.shell-out-close')
        };

        $('[data-tray]').replaceWith(createTray({ variant: 'cli' }));
        grid = createDotGrid($('.cli-bg'), { animate: !reducedMotion() });
        local.del('mk10.cli.theme');                 // the old key stored the default as if it were a choice
        applyTheme(local.get(THEME_KEY) || DEFAULT_THEME);

        shell = createShell({
            print,
            clear: clearOut,
            ctx,
            getTheme: () => theme,
            setTheme: (name) => applyTheme(name, { persist: true }),
            rebuild: () => CLIMode.rebuild(),
            onPath: (path) => { q.path.textContent = path; }
        });

        q.dock.addEventListener('click', () => q.input.focus({ preventScroll: true }));
        q.close.addEventListener('click', (e) => { e.stopPropagation(); q.out.classList.remove('open'); });
        q.input.addEventListener('input', () => { q.typed.textContent = q.input.value; });

        // history with the arrow keys, completion with Tab (which keeps its normal job when there is nothing to complete)
        let at = -1;
        let draft = '';
        let lastList = '';
        const put = (v) => { q.input.value = v; q.typed.textContent = v; q.input.setSelectionRange(v.length, v.length); };
        q.input.addEventListener('keydown', (e) => {
            const h = shell.history;
            if (e.key === 'Enter') {
                const v = q.input.value;
                at = -1;
                put('');
                shell.run(v);
            } else if (e.key === 'Escape') {
                q.out.classList.remove('open');
            } else if (e.key === 'ArrowUp' && h.length) {
                e.preventDefault();
                if (at === -1) { draft = q.input.value; at = h.length; }
                at = Math.max(0, at - 1);
                put(h[at]);
            } else if (e.key === 'ArrowDown' && at !== -1) {
                e.preventDefault();
                at += 1;
                if (at >= h.length) { at = -1; put(draft); } else put(h[at]);
            } else if (e.key === 'Tab' && !e.shiftKey && q.input.value.trim()) {
                const r = shell.complete(q.input.value);
                if (!r) return;
                e.preventDefault();
                const same = r.line === q.input.value;
                put(r.line);
                const list = r.options.join('   ');
                if (r.options.length > 1 && same && list !== lastList) {            // a second Tab on the same spot does not print the same list again
                    print([`<span class="dim">${esc(list)}</span>`]);
                    lastList = list;
                } else if (!same) lastList = '';
            }
        });
        q.skipBtn.addEventListener('keydown', (e) => e.stopPropagation());
    },

    async enter({ first }) {
        grid.start();
        removeTyping = captureTyping();
        removeKeyboardWatch = watchKeyboard();
        const builtBefore = local.get(BUILT_KEY) === '1' && !params.has('rebuild');
        const tray = $('.tray');

        if (!builtBefore && !reducedMotion() && window.gsap) {
            // do not block the caller: the intro is skippable and may take several seconds
            runIntro().then(() => {
                cancelCoach = coach({ anchor: tray.tabs[0], text: 'Back to the desktop? Switch here.', key: 'tray-cli', variant: 'cli', delay: 1600 });
            });
        } else {
            showBuilt();
            local.set(BUILT_KEY, '1');
            cancelCoach = coach({ anchor: tray.tabs[0], text: 'Back to the desktop? Switch here.', key: 'tray-cli', variant: 'cli', delay: first ? 2600 : 1400 });
        }
    },

    leave() {
        grid?.stop();
        removeTyping();
        removeKeyboardWatch();
        cancelCoach();
        if (introRunning) { skip = true; }
        if (q) {
            q.input.blur();
            q.out.classList.remove('open');
        }
    },

    /** run the build again (the `rebuild` command) */
    async rebuild() {
        local.del(BUILT_KEY);
        root.querySelectorAll('.reveal').forEach((el) => el.classList.remove('on'));
        q.out.classList.remove('open');
        await runIntro();
    },

    focusTarget() { return $('#cliMain h1') || root; }
};
