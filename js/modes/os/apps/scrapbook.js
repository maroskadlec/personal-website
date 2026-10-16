/* ==========================================================================
   SCRAPBOOK — the "Why Me" icon: eight reasons to work together, one on each
   page, an illustration and its words. Flip with the two arrow buttons or the
   ← and → keys; the corner says which page you are on.
   The words come from js/content/services.js, the same ones the 2008 website shows.
   ========================================================================== */
import { whyme, illustration } from '../../../content/index.js';
import { Icons } from '../../../gfx/icons.js';
import { Sound } from '../../../core/sound.js';
import { Store } from '../../../core/store.js';
import { esc, reducedMotion } from '../../../core/util.js';
import { attachScrollbar } from '../scroll.js';

const ID = 'scrapbook';

function build() {
    const root = document.createElement('div');
    root.className = 'sc';
    root.innerHTML =
        `<div class="sc-bar" role="group" aria-label="Pages">
            <button class="br-btn" type="button" data-act="prev" aria-label="Previous page" title="Previous page (←)">${Icons.tool('back')}</button>
            <button class="br-btn" type="button" data-act="next" aria-label="Next page" title="Next page (→)">${Icons.tool('forward')}</button>
            <span class="sc-title">${esc(whyme.title)}</span>
            <span class="sc-count" aria-hidden="true"></span>
        </div>
        <div class="sc-view"><div class="sc-scroll" tabindex="-1" role="region" aria-label="Page"></div></div>`;
    return root;
}

const pageHTML = (it, i, n) =>
    `<div class="sc-in">
        <p class="sc-intro">${esc(whyme.intro)}</p>
        <article class="sc-page" aria-label="${esc(it.title)}, ${i + 1} of ${n}">
            <div class="sc-clip"><img class="sc-pic" src="${esc(illustration(it.image))}" alt="" width="208" height="208" draggable="false"></div>
            <div class="sc-text"><h2>${esc(it.title)}</h2><p>${esc(it.text)}</p></div>
        </article>
    </div>`;

function attach(sys, win) {
    const root = win.el.querySelector('.sc');
    const scroller = root.querySelector('.sc-scroll');
    const count = root.querySelector('.sc-count');
    const prev = root.querySelector('[data-act="prev"]');
    const next = root.querySelector('[data-act="next"]');
    const sb = attachScrollbar(scroller, root.querySelector('.sc-view'));
    const items = whyme.items;
    const n = items.length;
    let idx = Math.max(0, Math.min(n - 1, Store.sget('scrapPage', 0)));          // it remembers its page for the visit

    function show(i, { flip = true } = {}) {
        idx = i;
        Store.sset('scrapPage', i);
        scroller.innerHTML = pageHTML(items[i], i, n);
        scroller.scrollTop = 0;
        sb.watch();
        count.textContent = `${i + 1} of ${n}`;
        prev.disabled = i === 0;
        next.disabled = i === n - 1;
        if (flip && !reducedMotion()) scroller.querySelector('.sc-page').classList.add('is-flip');
        [i - 1, i + 1].forEach((j) => { if (items[j]) new Image().src = illustration(items[j].image); });     // the next page is ready before it is turned to
    }

    function go(d) {
        const to = idx + d;
        if (to < 0 || to >= n) return;
        Sound.click();
        show(to);
        sys.announce?.(`${items[to].title}, ${to + 1} of ${n}`);
        const a = document.activeElement;
        if (a && a.disabled && win.el.contains(a)) scroller.focus({ preventScroll: true });          // the button that was used just switched itself off
    }

    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    win.el.addEventListener('keydown', (e) => {
        if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });

    show(idx, { flip: false });
    return { go, get page() { return idx; }, destroy() { sb.destroy(); } };
}

export function openScrapbook(sys, { from } = {}) {
    const open = !!sys.wm.get(ID);
    const win = sys.openWindow({
        id: ID,
        title: 'Why Me',
        kind: 'scrapbook',
        mem: 900,
        w: 600,
        h: 440,
        minW: 320,
        minH: 260,
        resizable: true,
        content: open ? null : build(),
        from,
        onClose: (w) => { w.scrap?.destroy(); w.scrap = null; }
    });
    if (!win) return null;
    if (!win.scrap) win.scrap = attach(sys, win);                           // already open: it just came to the front
    return win;
}
