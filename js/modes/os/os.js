/* ==========================================================================
   OS MODE — the Desktop: a System 7-style computer that is the portfolio.
   This file wires the parts together: the menu bar and its commands, the
   desktop and its icons, the window manager, dialogs, the Trash, keyboard
   shortcuts and the settings the control panels change.
   ========================================================================== */
import { Assets } from '../../core/assets.js';
import { Icons } from '../../gfx/icons.js';
import { Sound } from '../../core/sound.js';
import { createTray } from '../../core/tray.js';
import { attachMenus } from '../../core/menus.js';
import { coach } from '../../core/coach.js';
import { createBalloonHelp, showBalloon } from '../../core/balloon.js';
import { createKonami } from '../../core/konami.js';
import { reducedMotion, slowConnection } from '../../core/util.js';
import { work, vcard } from '../../content/index.js';
import { balloons as B, saveAs as S, bomb, secret as X } from '../../content/eggs.js';
import { FS, ROOT, TRASH, LABELS } from './fs.js';
import { Store } from '../../core/store.js';
import { Settings } from '../../core/settings.js';
import { Memory } from './memory.js';
import { createWM } from './wm.js';
import { createIconView, artHTML } from './iconview.js';
import { createDialogs } from './dialog.js';
import { openDoc } from './apps/doc.js';
import { openFolder, setFolderView } from './apps/folder.js';
import { openAbout } from './apps/about.js';
import { openInfo } from './apps/info.js';
import { openBrowser } from './apps/browser.js';
import { openProject } from './apps/project.js';
import { openScrapbook } from './apps/scrapbook.js';
import { openPuzzle } from './apps/puzzle.js';
import { createDog, dogAvailable } from './dog.js';
import { createSaver, saverAvailable } from './saver.js';
import { Crash } from '../../core/crash.js';
import { openControl, patternCSS } from './apps/controls.js';

let root = null;
let ctx = null;
let tray = null;
let clockTimer = 0;
let cancelCoach = () => {};
let warmTimer = 0;
let help = null;
let dog = null;
let saver = null;
let konami = null;
let foundBalloon = null;
let foundTimer = 0;
let wm = null;
let dialogs = null;
let menus = null;
let desktop = null;
let desktopView = null;
let activeView = null;
let sys = null;
let offHash = () => {};
let announceTimer = 0;

/* ---------------------------------------------------------- small helpers */
const live = (text) => {
    const el = document.getElementById('live');
    if (!el) return;
    el.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { el.textContent = text; }, 60);
};

function tick() {
    const c = root && root.querySelector('#mbClock');
    if (c) c.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: !Settings.get('clock24') });
}

const selNodes = () => (activeView ? activeView.selection() : []);
const folderWin = () => { const w = wm.active(); return w && w.view ? w : null; };

/** where File > New Folder goes: the desktop, or the folder window in front (never the Trash) */
function newFolderParent() {
    const w = wm.active();
    if (w && w.view) return w.nodeId === TRASH ? null : w.nodeId;
    if (w) return null;
    return ROOT;
}

function memoryAlert(title) {
    dialogs.stop(`There is not enough memory to open “${title}”.`, 'Close a window or two and try again.');
}

/** a deep link has done its job: leave the plain address of the mode (so the same link works again) */
function settleHash() {
    try { history.replaceState({ mode: 'os' }, '', '#/os'); } catch (e) { /* file:// or sandbox */ }
}

/* ---------------------------------------------------------- opening things */
function openNode(node, { from } = {}) {
    if (node.kind === 'alias' && !FS.has(node.target)) {
        dialogs.stop(`The alias “${node.name}” can't be opened.`, 'The original item could not be found.');
        return null;
    }
    const t = FS.resolve(node);
    const o = t.open || (FS.isContainer(t) ? { type: 'folder' } : { type: 'soon' });
    switch (o.type) {
        case 'folder': return openFolder(sys, t, { from });
        case 'doc': return openDoc(sys, o.ref, { from });
        case 'browser': return openBrowser(sys, { from, page: o.page });
        case 'project': return openProject(sys, t, { from });
        case 'scrapbook': return openScrapbook(sys, { from });
        case 'alert': dialogs.stop(o.message, o.detail); return null;
        case 'crash': ctx.crash(bomb.detail[o.detail]); return null;
        case 'control': return openControl(sys, o.panel, { from });
        case 'mode': ctx.switchMode(o.mode, { via: 'icon' }); return null;
        default:
            Sound.beep();
            dialogs.alert(`“${t.name}” can't be opened yet.`, { detail: 'The full case study arrives with the next update of this computer.' });
            return null;
    }
}

/** #/os/open/<id>: a link straight to a window (also what a link inside the Browser uses) */
function openById(id, opts) {
    if (id === 'about') { openAbout(sys); return; }
    if (id === 'puzzle') { openPuzzle(sys); return; }
    const n = FS.node(id);
    if (n) openNode(n, opts);
    else dialogs.stop('That item can\'t be found.', 'It may be in the Trash, or it may have been thrown away.');
}

function trash(ids) {
    const { moved, refused } = FS.trash(ids);
    if (moved.length) Sound.thud();
    if (!refused.length) return;
    const n = refused[0].node;
    if (n.kind === 'trash') dialogs.stop('The Trash can\'t be put in the Trash.');
    else if (n.kind === 'disk') dialogs.stop(`The disk “${n.name}” can't be put in the Trash.`, 'It is the startup disk: everything here lives on it.');
    else dialogs.stop(`The item “${n.name}” can't be put in the Trash because it's in use.`);
}

async function emptyTrash() {
    const n = FS.trashCount();
    if (!n) return;
    const ok = await dialogs.confirm(
        `The Trash contains ${n} item${n === 1 ? '' : 's'}. Are you sure you want to permanently remove ${n === 1 ? 'it' : 'them'}?`,
        { detail: 'You can\'t undo this.', ok: 'OK', cancel: 'Cancel' });
    if (!ok) return;
    FS.emptyTrash();
    Sound.crumple();
    live('Trash emptied');
}

async function resetDesktop() {
    const ok = await dialogs.confirm('Put the desktop back the way it was?', { detail: 'Your folders, icon positions, labels and control panel settings will be forgotten.', ok: 'Reset' });
    if (!ok) return;
    wm.closeAll();
    FS.reset();
    Settings.reset();
    desktopView.render();
    live('Desktop reset');
}

/** the contact as a file: File > Save Contact As… asks for a name in the classic Save box, then the browser downloads it */
async function saveContact() {
    const items = FS.children(ROOT).filter((n) => n.id !== TRASH).map((n) => ({ name: n.name, folder: FS.isContainer(n), art: artHTML(FS.resolve(n), '', 16) }));
    const name = await dialogs.save({ prompt: S.prompt, name: S.file, where: S.where, items, save: S.save, cancel: S.cancel });
    if (!name) return;
    const file = /\.[a-z0-9]{2,4}$/i.test(name) ? name : name + '.vcf';
    const url = URL.createObjectURL(new Blob([vcard()], { type: 'text/vcard;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: file });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    Sound.pop();
    live(`Saved ${file}`);
}

/** a balloon that points at something for a few seconds (or until the next click) and then goes away */
function say(anchor, text, ttl = 5200) {
    hideSaid();
    live(text);                                                     // the screen reader hears it once, through the live region
    foundBalloon = showBalloon({ anchor, text, variant: 'os', role: 'none' });
    if (!foundBalloon) return;
    const gone = () => hideSaid();
    foundTimer = setTimeout(gone, ttl);
    window.addEventListener('pointerdown', gone, { capture: true, once: true });
}
function hideSaid() {
    clearTimeout(foundTimer);
    if (foundBalloon) { foundBalloon.hide(); foundBalloon = null; }
}

/** the Konami code was typed: Do Not Open appears on the desktop (or, if it is already there, is pointed out) */
function unlockSecret() {
    const r = FS.unlock(X.id);
    if (!r) return;
    Sound.secret();
    const icon = desktopView.byId(X.id);
    if (!icon) return;
    const animate = !reducedMotion() && window.gsap;
    if (animate) {
        if (r.was !== 'here') gsap.from(icon, { opacity: 0, scale: 0.3, duration: 0.32, ease: 'steps(4)', transformOrigin: '50% 40%', clearProps: 'opacity,transform' });
        // it flashes the way a found file does, then goes back to whatever it was (selected or not)
        [0, 1, 2, 3, 4, 5].forEach((i) => setTimeout(() => {
            icon.classList.toggle('is-selected', i < 5 ? i % 2 === 0 : desktopView.selection().some((n) => n.id === X.id));
        }, 360 + i * 120));
    }
    setTimeout(() => {
        const again = desktopView.byId(X.id);
        if (again && root && !root.hidden) say(again, r.was === 'here' ? X.here : X.found);      // the whole icon, so a balloon below it does not cover its name
    }, animate ? 380 : 0);
}

/** Balloon Help: what is under the pointer, in a few words (null = nothing to say) */
function balloonFor(t, e) {
    if (menus && menus.isOpen()) return null;
    const hit = (sel, text, extra = {}) => {
        const el = t.closest(sel);
        return el ? { el, text: typeof text === 'function' ? text(el) : text, ...extra } : null;
    };
    const iconText = (el) => {
        const n = FS.node(el.dataset.id);
        if (!n) return '';
        const r = FS.resolve(n);
        if (n.kind === 'alias') return B.alias;
        return r.comment || n.comment || (r.role ? `${r.role} · ${r.years}` : FS.isContainer(r) ? B.folder : FS.kindLabel(r));
    };
    return hit('.win-close', B.close) || hit('.win-zoom', B.zoom) || hit('.grow', B.grow) || hit('.sb-btn, .sb-thumb', B.scroll) ||
        hit('.win-title', B.title, { aimed: true }) ||
        hit('.menubar .mb-item[data-menu]', (el) => B.menus[el.dataset.menu]) ||
        hit('.mb-clock', B.clock) ||
        hit('.icon[data-id], .row[data-id]', iconText) ||
        (t === desktop || t.classList.contains('desk-icons') ? { el: desktop, text: B.desktop, atPointer: true } : null);
}

/* ---------------------------------------------------------- menu commands */
const COMMANDS = {
    about: () => openAbout(sys),
    contact: () => openBrowser(sys, { page: '/contact.html' }),             // the Contact page of the website: e-mail, response time, links
    newFolder() {
        const parent = newFolderParent();
        if (parent === null) return;
        const n = FS.create(parent);
        const view = parent === ROOT ? desktopView : activeView;
        if (parent === ROOT) desktopView.placeNew(n.id);
        view.select([n.id]);
        view.rename(n.id);
    },
    open() { selNodes().slice(0, 6).forEach((n) => openNode(n, { from: activeView.byId(n.id) })); },
    getInfo() {
        const sel = selNodes();
        if (sel.length) { sel.slice(0, 4).forEach((n) => openInfo(sys, n, { from: activeView.byId(n.id) })); return; }
        const w = folderWin();
        if (w && FS.node(w.nodeId)) openInfo(sys, FS.node(w.nodeId));
    },
    rename() { const sel = selNodes(); if (sel.length === 1) activeView.rename(sel[0].id); },
    putAway() {
        const moved = FS.putAway(selNodes().map((n) => n.id));
        if (moved.length) Sound.thud();
    },
    trash() { trash(selNodes().map((n) => n.id)); },
    close() { const w = wm.active(); if (w) w.close(); },
    selectAll() { if (activeView) activeView.selectAll(); },
    cleanUp() { desktopView.cleanUp(); },
    emptyTrash,
    eject: () => dialogs.stop('The disk can\'t be ejected because it is the startup disk.', 'Marian OS is running from it.'),
    erase: () => dialogs.caution('Nice try.', 'The startup disk can\'t be erased. This portfolio would be a lot less fun without it.'),
    reset: resetDesktop,
    restart: () => ctx.restart({ menu: true }),
    'restart-cli': () => ctx.restart({ to: 'cli' }),
    shutdown: () => ctx.shutdown(),
    'to-cli': () => ctx.switchMode('cli', { via: 'menu' }),
    saveContact,
    puzzle: () => openPuzzle(sys),
    dog: () => Settings.set('dog', !Settings.get('dog')),
    saver: () => saver.start(),
    balloons: () => Settings.set('balloons', !Settings.get('balloons')),
    'balloons-about': () => dialogs.alert(B.about.message, { detail: B.about.detail })
};

function runCommand(id) {
    if (COMMANDS[id]) { COMMANDS[id](); return; }
    if (id.startsWith('open:')) { openById(id.slice(5)); return; }
    if (id.startsWith('label-')) { FS.setLabel(selNodes().map((n) => n.id), Number(id.slice(6))); return; }
    if (id === 'view-icons') setFolderView(folderWin(), 'icons');
    else if (id === 'view-list') setFolderView(folderWin(), 'list');
}

/* what each menu shows right now */
const MENUS = {
    pear: () => [
        { id: 'about', label: 'About This Computer…' },
        { id: 'contact', label: 'Contact…' },
        { sep: true },
        { id: 'open:controls', label: 'Control Panels' },
        { id: 'open:readme', label: 'Read Me' },
        { sep: true },
        { id: 'puzzle', label: 'Puzzle' },
        ...(dogAvailable() ? [{ id: 'dog', label: 'Dog', checked: Settings.get('dog') }] : []),
        ...(saverAvailable() ? [{ id: 'saver', label: 'Screen Saver' }] : []),
        { sep: true },
        { id: 'to-cli', label: 'Terminal' }
    ],
    file() {
        const sel = selNodes();
        const w = wm.active();
        const inTrash = sel.length > 0 && sel.every((n) => n.parent === TRASH);
        const hasInfo = sel.length > 0 || !!(folderWin() && FS.node(folderWin().nodeId));
        return [
            { id: 'newFolder', label: 'New Folder', disabled: newFolderParent() === null },
            { id: 'open', label: 'Open', hint: '⌘O', disabled: !sel.length },
            { id: 'getInfo', label: 'Get Info', hint: '⌘I', disabled: !hasInfo },
            { id: 'rename', label: 'Rename', hint: 'F2', disabled: sel.length !== 1 || !!sel[0].protected },
            { sep: true },
            { id: 'putAway', label: 'Put Away', hint: '⌘Y', disabled: !inTrash },
            { id: 'trash', label: 'Move to Trash', hint: '⌘⌫', disabled: !sel.length || inTrash },
            { sep: true },
            { id: 'close', label: 'Close Window', hint: 'esc', disabled: !w },
            { sep: true },
            { id: 'saveContact', label: 'Save Contact As…' }
        ];
    },
    edit: () => [
        { id: 'undo', label: 'Undo', hint: '⌘Z', disabled: true },
        { sep: true },
        { id: 'cut', label: 'Cut', hint: '⌘X', disabled: true },
        { id: 'copy', label: 'Copy', hint: '⌘C', disabled: true },
        { id: 'paste', label: 'Paste', hint: '⌘V', disabled: true },
        { id: 'clear', label: 'Clear', disabled: true },
        { sep: true },
        { id: 'selectAll', label: 'Select All', hint: '⌘A', disabled: !activeView }
    ],
    view() {
        const w = folderWin();
        const mode = w ? w.view.mode : null;
        return [
            { id: 'view-icons', label: 'by Icon', checked: mode === 'icons', disabled: !w },
            { id: 'view-list', label: 'by Name', checked: mode === 'list', disabled: !w }
        ];
    },
    label() {
        const sel = selNodes();
        const first = sel.length ? FS.label(sel[0].id) : 0;
        const same = sel.length > 0 && sel.every((n) => FS.label(n.id) === first);
        return LABELS.map((l, i) => ({ id: 'label-' + i, label: l.name, swatch: l.color, checked: same && i === first, disabled: !sel.length }));
    },
    special() {
        const sel = selNodes();
        const hd = sel.length === 1 && sel[0].kind === 'disk';
        const onDesk = !!activeView && activeView.parentId === ROOT;
        return [
            { id: 'cleanUp', label: 'Clean Up Desktop', disabled: !onDesk },
            { id: 'emptyTrash', label: 'Empty Trash…', disabled: !FS.trashCount() },
            { sep: true },
            { id: 'eject', label: 'Eject Disk', hint: '⌘E', disabled: !hd },
            { id: 'erase', label: 'Erase Disk…', disabled: !hd },
            { sep: true },
            { id: 'reset', label: 'Reset Desktop…' },
            { sep: true },
            { id: 'restart', label: 'Restart' },
            { id: 'restart-cli', label: 'Restart in Terminal…' },
            { id: 'shutdown', label: 'Shut Down' }
        ];
    },
    help: () => [
        { id: 'balloons-about', label: 'About Balloon Help…' },
        { sep: true },
        { id: 'balloons', label: Settings.get('balloons') ? 'Hide Balloons' : 'Show Balloons' }
    ]
};

/* ---------------------------------------------------------- keyboard */
function onKey(e) {
    if (e.target.closest('.dlg-layer')) return;
    const typing = e.target.closest('input:not([readonly]), textarea, select, [contenteditable="true"]');
    const mod = e.metaKey || e.ctrlKey;
    const k = e.key.toLowerCase();
    if (e.key === 'Escape') {
        if (typing) return;
        if (menus.isOpen()) { menus.close(); return; }
        const w = wm.active();
        if (w) { e.preventDefault(); w.close(); }
        return;
    }
    if (!mod || typing) return;
    const map = { o: 'open', i: 'getInfo', y: 'putAway', e: 'eject', backspace: 'trash', delete: 'trash' };
    const cmd = map[k];
    if (!cmd || !activeView && cmd !== 'getInfo' && cmd !== 'eject') return;
    e.preventDefault();
    COMMANDS[cmd]();
}

/* ---------------------------------------------------------- settings applied to the desktop */
function applySetting(k, v) {
    if (k === 'pattern') desktop.style.setProperty('--desk-pattern', patternCSS(v));
    else if (k === 'clock24') tick();
    else if (k === 'balloons' && help) help.set(v);
    else if (k === 'dog' && dog && root && !root.hidden) { if (v) dog.start(); else dog.stop(); }
}

/* ---------------------------------------------------------- the mode */
export const OSMode = {
    async mount(el, context) {
        root = el;
        ctx = context;
        await Assets.ready;

        el.innerHTML = `
            <div class="menubar" role="menubar" aria-label="Menu bar">
                <div class="mb-item mb-logo" data-menu="pear" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-label="Marian menu" tabindex="0">${Icons.pear('mb-pear')}</div>
                <div class="mb-item" data-menu="file" role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="-1">File</div>
                <div class="mb-item" data-menu="edit" role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="-1">Edit</div>
                <div class="mb-item" data-menu="view" role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="-1">View</div>
                <div class="mb-item" data-menu="label" role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="-1">Label</div>
                <div class="mb-item" data-menu="special" role="menuitem" aria-haspopup="true" aria-expanded="false" tabindex="-1">Special</div>
                <div class="mb-right"><span class="mb-tray" data-tray></span><span class="mb-clock" id="mbClock"></span><div class="mb-item mb-help" data-menu="help" role="menuitem" aria-haspopup="true" aria-expanded="false" aria-label="Help" tabindex="-1">?</div></div>
            </div>
            <div class="desktop" id="desktop" tabindex="-1" role="group" aria-label="Desktop"><div class="desk-icons"></div></div>
            <div class="os-layer" aria-hidden="true"></div>
            <div class="dlg-layer"></div>`;

        const screen = document.getElementById('screen');
        desktop = el.querySelector('#desktop');
        const layer = el.querySelector('.os-layer');
        const menubar = el.querySelector('.menubar');

        wm = createWM({ desktop, screen });
        dialogs = createDialogs({ layer: el.querySelector('.dlg-layer'), behind: [menubar, desktop] });

        sys = {
            wm,
            desktop,
            layer,
            dialog: dialogs,
            openWindow(opts) {
                const w = wm.open(opts);
                if (!w) memoryAlert(opts.title);
                return w;
            },
            open: openNode,
            openById,
            announce: live,
            trash,
            setActiveView(v) { activeView = v; },
            onSelect() {},
            renameError(err, value) {
                if (err === 'taken') dialogs.stop(`The name “${value.trim()}” is already taken.`, 'Please use a different name.');
                else if (err === 'colon') dialogs.stop('Names can\'t contain a colon (:).');
                else if (err === 'protected') dialogs.stop('That item can\'t be renamed.');
            }
        };

        desktopView = createIconView({ el: el.querySelector('.desk-icons'), host: desktop, parentId: ROOT, mode: 'desktop', sys });
        activeView = desktopView;

        // the desktop is a place keys can go to
        desktop.addEventListener('pointerdown', (e) => {
            if (!e.target.closest('.win, .icon')) desktop.focus({ preventScroll: true });
        });
        el.addEventListener('keydown', onKey);

        tray = createTray({ variant: 'os' });
        el.querySelector('[data-tray]').replaceWith(tray);

        menus = attachMenus(menubar, MENUS, runCommand, { blink: () => Settings.get('menuBlink') });

        wm.onChange((type, win) => {
            if (type === 'active') {
                activeView = win ? (win.view || null) : desktopView;
            } else if (type === 'open') {
                live(`${win.title} opened`);
            } else if (type === 'close') {
                live(`${win.title} closed`);
                // focus goes back to the icon that opened the window; failing that to the window now in front, or the desktop
                const from = win.opts && win.opts.from;
                const next = wm.active();
                if (from instanceof Element && from.isConnected && from.closest('[role="listbox"]')) from.focus({ preventScroll: true });
                else if (next) next.el.focus({ preventScroll: true });
                else desktop.focus({ preventScroll: true });
            }
        });

        help = createBalloonHelp({ root: el, resolve: balloonFor });
        dog = createDog({ layer, frozen: () => Crash.active });
        saver = createSaver({ parent: document.getElementById('screen'), getMinutes: () => Settings.get('saver'), busy: () => dialogs.open || Crash.active });
        konami = createKonami({ onCode: unlockSecret, enabled: () => !dialogs.open && !Crash.active && !menus.isOpen() });

        // the same secret without a keyboard: five quick taps (or clicks) on the clock
        const clock = el.querySelector('#mbClock');
        let taps = [];
        clock.addEventListener('click', () => {
            if (dialogs.open || Crash.active || menus.isOpen()) return;
            const now = performance.now();
            taps = taps.filter((t) => now - t < 2500);
            taps.push(now);
            if (taps.length >= 5) { taps = []; unlockSecret(); }
        });
        Settings.on(applySetting, { immediate: true });
        if (window.__mk) window.__mk.os = { runCommand, openById, wm, FS, Memory, dialogs, crash: (d) => ctx.crash(d), unlock: unlockSecret, get saver() { return saver; }, get dog() { return dog; }, get konami() { return konami; }, get view() { return activeView; } };   // console handle for testing
    },

    enter({ first, open, via }) {
        tick();
        clockTimer = setInterval(tick, 20000);
        if (first && !reducedMotion() && window.gsap) {
            // `top`, never a transform: a transformed menu bar becomes the containing block of the
            // narrow-screen tray, which is position: fixed to the glass
            gsap.from(root.querySelector('.menubar'), { top: -24, duration: 0.24, ease: 'steps(3)', clearProps: 'top' });
            gsap.from(root.querySelectorAll('.desk-icons .icon'), { opacity: 0, scale: 0.6, duration: 0.2, ease: 'steps(3)', stagger: 0.08, delay: 0.1, transformOrigin: '50% 40%', clearProps: 'opacity,transform' });
        }

        // every start is greeted by the website itself: the "Marian Kadlec" window opens by itself (on a phone it fills the glass)
        const link = location.hash.match(/^#\/os\/open\/([\w-]+)/) || (open ? [null, open] : null);
        if (link) {
            setTimeout(() => { openById(link[1]); settleHash(); }, reducedMotion() ? 0 : 350);
        } else if (first) {
            const me = desktopView.byId('me');
            setTimeout(() => { if (root && !root.hidden) openById('me', { from: me || undefined }); }, reducedMotion() ? 0 : 700);
        }

        const onHash = () => {
            const m = location.hash.match(/^#\/os\/open\/([\w-]+)/);
            if (m && !root.hidden) { openById(m[1]); settleHash(); }
        };
        window.addEventListener('hashchange', onHash);
        offHash = () => window.removeEventListener('hashchange', onHash);

        if (Settings.get('dog')) dog.start();
        saver.arm();
        konami.arm();                                   // after the saver: a key that wakes the saver is not the first key of the code

        // the client tokens dither while nobody is looking, so the Projects folder opens with its icons ready
        warmTimer = setTimeout(() => {
            if (slowConnection()) return;                      // not on a data saver, 2G or 3G: the icons dither when the Projects folder is first opened
            work.roles.filter((r) => r.image).reduce((chain, r) => chain.then(() => Assets.coin(r.image)), Promise.resolve());
        }, first ? 2600 : 1000);

        // one tip, once: where the Terminal is (the website is already open, so no one needs telling which icon to open)
        const knowsSwitch = !!via && !['boot', 'recover'].includes(via);       // someone who just switched modes does not need telling where the switch is
        if (!knowsSwitch) {
            cancelCoach = coach({
                anchor: tray.tabs[1],
                text: 'Prefer a terminal? Switch to the text-based version of this site here.',
                key: 'tray-os',
                variant: 'os',
                delay: first ? 1500 : 1400
            });
        }
    },

    leave() {
        clearInterval(clockTimer);
        clearTimeout(warmTimer);
        if (dog) dog.stop();
        if (saver) saver.disarm();
        if (konami) konami.disarm();
        hideSaid();
        cancelCoach();
        if (help) help.hide();
        offHash();
        if (menus) menus.close();
        if (dialogs) dialogs.closeAll();
    },

    /** the machine was switched off or restarted: nothing stays open */
    reset() {
        if (!wm) return;
        wm.closeAll();
        dialogs.closeAll();
        Memory.clear();
        Store.sset('glowSeen', []);
        activeView = desktopView;
        desktopView.clear();
    },

    focusTarget() { return desktop; }
};
