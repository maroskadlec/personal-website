/* ==========================================================================
   QA — runs the machine at a given screen size and measures what a person would check:
   does anything stick out, run off the glass or get cut off; do the windows open inside the
   desktop; do the dialogs, the tray, the dock and the output panel fit; is anything unnamed or
   too pale. It loads the page in an iframe of exactly that size (so media and container
   queries answer to that size), from the console of any page of this site:

     const Q = await import('/_tools/qa.js');
     await Q.all();                           // every size in Q.SIZES: only problems are listed
     await Q.all([[1440, 900]]);              // one size
     await Q.desktop(1024, 768);              // the details of the Desktop at one size
     await Q.cli(375, 812);                   // ... of the Terminal
     await Q.simple(2560, 1440);              // ... of the gate, the boot manager and the text page

   Each size takes about half a minute. The iframe is removed afterwards (Q.close() does it by hand).
   The iframe cannot have a finger: the touch rules (pointer: coarse) are checked in the Browser pane
   with a phone size, see docs/M6-kroky.md. Nothing here is loaded by the site.
   ========================================================================== */
import { run as audit, targets } from './audit.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const inside = (r, box, tol = 1) => r.left >= box.left - tol && r.right <= box.right + tol && r.top >= box.top - tol && r.bottom <= box.bottom + tol;
const R = (r) => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
const here = new URL('..', import.meta.url).pathname;                       // / (the root of the site)

export const SIZES = [[320, 568], [375, 812], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [2560, 1440], [812, 375], [568, 320]];

let frame = null;

export function close() { if (frame) { frame.remove(); frame = null; } }

/** load index.html with a query in an iframe of W x H and give back its window */
export async function open(W, H, query, wait = 3000) {
    close();
    const f = document.createElement('iframe');
    f.style.cssText = `position:fixed;left:0;top:0;width:${W}px;height:${H}px;border:0;z-index:99999;background:#050403;`;
    f.src = `${here}index.html?${query}&x=${Math.floor(Math.random() * 1e6)}`;
    document.body.appendChild(f);
    frame = f;
    await new Promise((r) => { f.onload = r; });
    await sleep(wait);
    return f.contentWindow;
}

/** the Desktop: icons, menu bar, nine windows, a dialog, the tray */
export async function desktop(W, H) {
    localStorage.clear(); sessionStorage.clear();
    const w = await open(W, H, 'phase=desktop&fx=0', 3500);
    const d = w.document;
    const os = w.__mk.os;
    const m = { size: `${W}x${H}`, problems: [] };
    const problem = (t) => m.problems.push(t);
    m.narrow = os.wm.narrow();
    if (d.documentElement.scrollWidth > w.innerWidth) problem('the page is wider than the glass');
    const scr = d.getElementById('screen').getBoundingClientRect();
    const bar = d.querySelector('.menubar');
    if (bar.scrollWidth > bar.clientWidth + 1) problem('the menu bar is cut off');
    const dk = d.querySelector('.desktop').getBoundingClientRect();
    const out = [...d.querySelectorAll('.desk-icons .icon')].filter((i) => !inside(i.getBoundingClientRect(), dk, 2)).map((i) => i.dataset.id);
    if (out.length) problem('icons outside the desktop: ' + out.join(', '));
    os.wm.closeAll();
    await sleep(300);
    m.windows = {};
    for (const id of ['readme', 'me', 'projects', 'services', 'about', 'cp-general', 'puzzle', 'whyme', 'p-generali']) {
        os.wm.closeAll(); os.dialogs.closeAll();
        await sleep(150);
        os.openById(id);
        await sleep(700);
        const win = d.querySelector('.win');
        if (!win) { problem(`${id}: no window`); continue; }
        const r = win.getBoundingClientRect();
        m.windows[id] = R(r);
        if (!inside(r, dk, 2)) problem(`${id}: the window sticks out of the desktop ${R(r)}`);
        const a = audit(win);
        if (a.contrast.failing) problem(`${id}: pale text (${a.contrast.minRatio}:1)`);
        if (a.names.unnamed.length) problem(`${id}: unnamed ${a.names.unnamed.join(', ')}`);
        const t = targets(win, 24);
        if (t.smallerThanMin.length) problem(`${id}: small targets ${t.smallerThanMin.join(', ')}`);
    }
    os.wm.closeAll();
    await sleep(200);
    os.dialogs.confirm('A question?', { detail: 'Some detail text for the dialog box.' });
    await sleep(600);
    const dlg = d.querySelector('.dlg');
    if (!dlg || !inside(dlg.getBoundingClientRect(), scr, 1)) problem('the dialog does not fit the glass');
    os.dialogs.closeAll();
    await sleep(200);
    const tray = d.querySelector('.tray--os');
    if (!tray || !inside(tray.getBoundingClientRect(), scr, 1)) problem('the tray is outside the glass');
    close();
    return m;
}

/** the Terminal: the page, the dock, the tray and the output of a few commands */
export async function cli(W, H) {
    localStorage.clear(); sessionStorage.clear();
    localStorage.setItem('mk10.cli.built', '1');
    const w = await open(W, H, 'mode=cli&fx=0', 4000);
    const d = w.document;
    const m = { size: `${W}x${H}`, problems: [] };
    const problem = (t) => m.problems.push(t);
    const root = d.querySelector('.mode-cli');
    const scr = d.getElementById('screen').getBoundingClientRect();
    if (d.documentElement.scrollWidth > w.innerWidth) problem('the page is wider than the glass');
    const sc = root.querySelector('.cli-scroll');
    if (sc.scrollWidth > sc.clientWidth + 1) problem('the page scrolls sideways');
    const h1 = root.querySelector('.hero h1');
    if (h1.scrollWidth > h1.clientWidth + 1) problem('the name is cut off');
    if (!inside(root.querySelector('.dock').getBoundingClientRect(), scr, 1)) problem('the dock is outside the glass');
    if (!inside(root.querySelector('.tray').getBoundingClientRect(), scr, 1)) problem('the tray is outside the glass');
    const site = root.querySelector('.site').getBoundingClientRect();
    if (![...root.querySelectorAll('.link-btn')].every((b) => { const r = b.getBoundingClientRect(); return r.right <= site.right + 1 && r.left >= site.left - 1; })) problem('a link button sticks out');
    const input = root.querySelector('.shell-input');
    for (const c of ['help', 'neofetch', 'ls', 'links']) {
        input.focus();
        input.value = c;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await sleep(450);
    }
    const out = root.querySelector('.shell-out');
    if (!inside(out.getBoundingClientRect(), scr, 1)) problem('the output panel is outside the glass');
    if (out.scrollWidth > out.clientWidth + 1) problem('the output scrolls sideways');
    const a = audit(root);
    if (a.contrast.failing) problem(`pale text (${a.contrast.minRatio}:1)`);
    if (a.names.unnamed.length) problem(`unnamed ${a.names.unnamed.join(', ')}`);
    close();
    return m;
}

/** the gate, the boot manager and the text page */
export async function simple(W, H) {
    localStorage.clear(); sessionStorage.clear();
    const m = { size: `${W}x${H}`, problems: [] };
    const problem = (t) => m.problems.push(t);
    let w = await open(W, H, 'fx=0', 2600);
    let d = w.document;
    let scr = d.getElementById('screen').getBoundingClientRect();
    const kids = [...d.querySelectorAll('#gate .gate-power, #gate .gate-name, #gate .gate-sound, #gate .gate-plain')].map((e) => e.getBoundingClientRect());
    if (!kids.every((r) => inside(r, scr, 1))) problem('the gate sticks out of the glass');
    if (d.documentElement.scrollWidth > w.innerWidth) problem('the gate page is wider than the glass');
    w = await open(W, H, 'phase=menu&fx=0', 2600);
    d = w.document;
    scr = d.getElementById('screen').getBoundingClientRect();
    const box = d.querySelector('.bm-box');
    if (!box || !inside(box.getBoundingClientRect(), scr, 1)) problem('the boot manager sticks out of the glass');
    w = await open(W, H, 'plain', 800);
    d = w.document;
    if (d.documentElement.scrollWidth > w.innerWidth) problem('the text page is wider than the window');
    close();
    return m;
}

/** every size, Desktop + Terminal + the simple screens; only the problems are reported */
export async function all(sizes = SIZES) {
    const report = {};
    for (const [W, H] of sizes) {
        const t0 = performance.now();
        const parts = [await desktop(W, H), await cli(W, H), await simple(W, H)];
        const problems = parts.flatMap((p, i) => p.problems.map((x) => ['Desktop', 'Terminal', 'Gate/text'][i] + ': ' + x));
        report[`${W}x${H}`] = problems.length ? problems : 'ok';
        report[`${W}x${H} (s)`] = Math.round((performance.now() - t0) / 1000);
    }
    return report;
}
