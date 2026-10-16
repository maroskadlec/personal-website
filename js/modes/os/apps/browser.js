/* ==========================================================================
   BROWSER — the "Marian Kadlec" icon opens a 2008 web browser showing the
   2008 version of this website (web08.js). The history is real: Back, Forward,
   Reload and Home work, the address bar follows, the status line says where a
   link goes. A project name in the page opens that project's window on the desktop.
   ========================================================================== */
import { Icons } from '../../../gfx/icons.js';
import { Sound } from '../../../core/sound.js';
import { reducedMotion, esc } from '../../../core/util.js';
import { attachScrollbar } from '../scroll.js';
import { FS } from '../fs.js';
import { SITE, PAGES } from './web08.js';

const ID = 'browser';
const LOAD_MS = 320;                 // a short, honest "loading": the progress bar fills in steps

/** "http://www.mariankadlec.cz/work.html#x", "work.html", "/" … -> a key of PAGES, or "/" */
function normalize(p) {
    let s = String(p || '/').replace(SITE, '').replace(/[?#].*$/, '');
    if (!s.startsWith('/')) s = '/' + s;
    s = s.replace(/\/index\.html$/, '/');
    return PAGES[s] ? s : '/';
}

function build() {
    const root = document.createElement('div');
    root.className = 'br';
    root.innerHTML =
        `<div class="br-bar" role="group" aria-label="Browser controls">
            <button class="br-btn" type="button" data-act="back" aria-label="Back" title="Back (Alt+←)" disabled>${Icons.tool('back')}</button>
            <button class="br-btn" type="button" data-act="forward" aria-label="Forward" title="Forward (Alt+→)" disabled>${Icons.tool('forward')}</button>
            <button class="br-btn" type="button" data-act="reload" aria-label="Reload" title="Reload">${Icons.tool('reload')}</button>
            <button class="br-btn" type="button" data-act="home" aria-label="Home" title="Home">${Icons.tool('home')}</button>
            <input class="br-addr" type="text" readonly spellcheck="false" aria-label="Address" value="${esc(SITE)}/">
            <div class="br-prog" aria-hidden="true"><i></i></div>
        </div>
        <div class="br-view"><div class="br-scroll" tabindex="-1" role="region" aria-label="Web page"></div></div>
        <div class="br-status" aria-hidden="true">Done</div>`;
    return root;
}

/** the browser behind one window: history, loading, links, status */
function attach(sys, win, startPage) {
    const root = win.el.querySelector('.br');
    const $ = (s) => root.querySelector(s);
    const btn = { back: $('[data-act="back"]'), forward: $('[data-act="forward"]') };
    const addr = $('.br-addr');
    const prog = $('.br-prog');
    const view = $('.br-view');
    const scroller = $('.br-scroll');
    const status = $('.br-status');
    const sb = attachScrollbar(scroller, view);

    const hist = [];                  // { path, scroll }
    let idx = -1;
    let pending = 0;                  // the timer of a page that is still loading
    let hover = '';                   // where the link under the pointer goes
    let base = 'Done';

    const url = (p) => SITE + p;
    const current = () => (idx >= 0 ? hist[idx].path : null);
    const paint = () => { status.textContent = hover || base; };

    function show(path, scrollTo = 0) {
        const page = PAGES[path];
        scroller.innerHTML = `<div class="w8${reducedMotion() ? ' is-still' : ''}">${page.render()}</div>`;
        sb.watch();
        scroller.scrollTop = scrollTo;
        addr.value = url(path);
        win.setTitle(page.title);
        btn.back.disabled = idx <= 0;
        btn.forward.disabled = idx >= hist.length - 1;
    }

    /** put focus back on the page when the link that was used is gone */
    function settleFocus(hadFocus) {
        const a = document.activeElement;
        if ((hadFocus && !win.el.contains(a)) || (a && a.disabled && win.el.contains(a))) scroller.focus({ preventScroll: true });
    }

    function cancel() {
        if (!pending) return;
        clearTimeout(pending);
        pending = 0;
        prog.classList.remove('is-on');
        root.removeAttribute('aria-busy');
        base = 'Done';
        paint();
    }

    /** a page takes a moment to arrive; `apply` swaps it in when it does */
    function load(path, apply) {
        cancel();
        Sound.click();
        const finish = () => {
            pending = 0;
            const hadFocus = win.el.contains(document.activeElement);
            apply();
            prog.classList.remove('is-on');
            root.removeAttribute('aria-busy');
            base = 'Done';
            hover = '';
            paint();
            settleFocus(hadFocus);
            sys.announce?.(`${PAGES[current()].title} loaded`);
        };
        if (reducedMotion()) { finish(); return; }
        base = `Opening page ${url(path)}…`;
        paint();
        root.setAttribute('aria-busy', 'true');
        prog.classList.remove('is-on');
        void prog.offsetWidth;                                   // restart the bar
        prog.classList.add('is-on');
        pending = setTimeout(finish, LOAD_MS);
    }

    function go(path) {
        if (path === current()) { reload(); return; }
        load(path, () => {
            hist[idx].scroll = scroller.scrollTop;
            hist.length = idx + 1;                                // a new page forgets the "forward" pages
            hist.push({ path, scroll: 0 });
            idx++;
            show(path, 0);
        });
    }
    function step(d) {
        const to = idx + d;
        if (to < 0 || to >= hist.length) return;
        load(hist[to].path, () => {
            hist[idx].scroll = scroller.scrollTop;
            idx = to;
            show(hist[idx].path, hist[idx].scroll);
        });
    }
    function reload() {
        const path = current();
        load(path, () => show(path, scroller.scrollTop));
    }

    /* the toolbar */
    const acts = { back: () => step(-1), forward: () => step(1), reload, home: () => go('/') };
    $('.br-bar').addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (b && !b.disabled) acts[b.dataset.act]();
    });
    addr.addEventListener('focus', () => addr.select());

    /* links in the page: pages change here, projects open a window, the rest is a normal link */
    view.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a || !view.contains(a)) return;
        if (a.dataset.nav) { e.preventDefault(); go(normalize(a.dataset.nav)); }
        else if (a.dataset.open) { e.preventDefault(); sys.openById?.(a.dataset.open, { from: a }); }
    });
    view.addEventListener('auxclick', (e) => { if (e.target.closest('a[data-nav], a[data-open]')) e.preventDefault(); });

    /* the status line shows where a link goes */
    const targetOf = (a) => {
        if (a.dataset.nav) return url(normalize(a.dataset.nav));
        if (a.dataset.open) { const n = FS.node(a.dataset.open); return n ? `Open “${n.name}” on this computer` : ''; }
        return a.getAttribute('href') || '';
    };
    const point = (a) => { const t = a ? targetOf(a) : ''; if (t !== hover) { hover = t; paint(); } };
    view.addEventListener('mouseover', (e) => point(e.target.closest('a')));
    view.addEventListener('mouseleave', () => point(null));
    view.addEventListener('focusin', (e) => point(e.target.closest?.('a')));
    view.addEventListener('focusout', () => point(null));

    /* keyboard: Alt+← / Alt+→ (and ⌘/Ctrl+[ / ]) walk the history */
    root.addEventListener('keydown', (e) => {
        const mod = e.metaKey || e.ctrlKey;
        if ((e.altKey && e.key === 'ArrowLeft') || (mod && e.key === '[')) { e.preventDefault(); step(-1); }
        else if ((e.altKey && e.key === 'ArrowRight') || (mod && e.key === ']')) { e.preventDefault(); step(1); }
    });

    /* the first page arrives at once */
    const first = normalize(startPage);
    hist.push({ path: first, scroll: 0 });
    idx = 0;
    show(first, 0);

    return {
        go: (p) => go(normalize(p)),
        back: () => step(-1),
        forward: () => step(1),
        reload,
        get path() { return current(); },
        destroy() { cancel(); sb.destroy(); }
    };
}

export function openBrowser(sys, { from, page } = {}) {
    const open = !!sys.wm.get(ID);
    // this window greets every start, so on a glass too narrow for the full size it gets only the room right of the two icon
    // columns (the window starts at 250 px) and left of the disk (about 100 px), and the icons stay in sight; on a tablet
    // standing up (under 900 px) only the first two columns are kept clear
    const glass = sys.wm.area().w;
    const room = glass - 250 - (glass >= 900 ? 100 : 8);
    const win = sys.openWindow({
        id: ID,
        title: PAGES['/'].title,
        kind: 'browser',
        mem: 1800,
        w: Math.max(320, Math.min(680, room)),
        h: 560,
        minW: 300,
        minH: 240,
        resizable: true,
        content: open ? null : build(),
        from,
        onClose: (w) => { w.browser?.destroy(); w.browser = null; }
    });
    if (!win) return null;
    if (win.browser) { if (page) win.browser.go(page); return win; }       // already open: it just came to the front
    win.browser = attach(sys, win, page);
    return win;
}
