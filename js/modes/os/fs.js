/* ==========================================================================
   FS — the file system of this computer: a tree of nodes read from
   content/desktop.js, plus the folders the visitor creates.
   Everything the visitor does to the built-in items (rename, move, Trash)
   lasts for the session only; folders they make and icon positions are kept.
   A manifest item marked `secret` is not here at all until FS.unlock() finds
   it; what was found stays found (until Reset Desktop).
   ========================================================================== */
import { nodes as MANIFEST, BUILD_DATE } from '../../content/desktop.js';
import { Store } from '../../core/store.js';

export const ROOT = 'desktop';
export const TRASH = 'trash';

const KIND = {
    disk: 'Hard disk', trash: 'Trash', folder: 'Folder', sysfolder: 'System folder', doc: 'Text document',
    app: 'Application program', control: 'Control panel', stack: 'Project', alias: 'Alias'
};
const ICON = { disk: 'disk', trash: 'trash', folder: 'folder', sysfolder: 'sysfolder', doc: 'doc', app: 'app', control: 'controls', stack: 'stack' };

export const LABELS = [
    { name: 'None', color: null },
    { name: 'Essential', color: '#c8372d' },
    { name: 'In Progress', color: '#b25e00' },
    { name: 'Cool', color: '#1f7a44' },
    { name: 'Personal', color: '#2c62b8' },
    { name: 'Project', color: '#7a3fa8' }
];

const nodes = new Map();
const subs = new Set();

let seq = Store.get('userSeq', 0);
let places = Store.get('places', {});
let labels = Store.get('labels', {});

/* ---------- load ---------- */
function load() {
    nodes.clear();
    const found = Store.get('found', []);
    MANIFEST.forEach((n, i) => { if (!n.secret || found.includes(n.id)) nodes.set(n.id, { ...n, order: i }); });
    Store.get('userNodes', []).forEach((n) => nodes.set(n.id, { ...n, user: true }));
    const ov = Store.sget('ov', {});
    Object.keys(ov).forEach((id) => { const n = nodes.get(id); if (n) Object.assign(n, ov[id]); });
    Store.sget('removed', []).forEach((id) => nodes.delete(id));
}
load();

/* ---------- persistence ---------- */
const saveUser = () => Store.set('userNodes', [...nodes.values()].filter((n) => n.user).map((n) => ({
    id: n.id, name: n.name, kind: n.kind, parent: n.parent, from: n.from, order: n.order
})));

function commit(n, changes) {
    Object.assign(n, changes);
    if (n.user) {
        saveUser();
    } else {
        const ov = Store.sget('ov', {});
        ov[n.id] = { ...(ov[n.id] || {}), ...changes };
        Store.sset('ov', ov);
    }
}

function emit(parents) {
    const set = new Set(parents);
    subs.forEach((fn) => fn(set));
}

const savePlaces = () => Store.set('places', places);
const saveLabels = () => Store.set('labels', labels);

/* ---------- queries ---------- */
const sortByOrder = (a, b) => a.order - b.order;

function isInside(id, ancestorId) {
    let n = nodes.get(id);
    let guard = 0;
    while (n && guard++ < 50) {
        if (n.parent === ancestorId) return true;
        n = nodes.get(n.parent);
    }
    return false;
}

const validName = (parent, name, selfId) => {
    const s = String(name).replace(/\s+/g, ' ').trim();
    if (!s) return { error: 'empty' };
    if (s.length > 31) return { error: 'long' };
    if (s.includes(':')) return { error: 'colon' };
    const clash = [...nodes.values()].some((n) => n.parent === parent && n.id !== selfId && n.name.toLowerCase() === s.toLowerCase());
    if (clash) return { error: 'taken' };
    return { name: s };
};

export const FS = {
    ROOT,
    TRASH,

    node: (id) => nodes.get(id) || null,
    has: (id) => nodes.has(id),
    children(id) { return [...nodes.values()].filter((n) => n.parent === id).sort(sortByOrder); },

    /** an alias shows another item; opening it opens the original */
    resolve(n) { return n && n.kind === 'alias' ? (nodes.get(n.target) || n) : n; },
    kindLabel: (n) => n.label || (n.role ? 'Project: ' + n.role : KIND[n.kind] || 'Document'),
    iconKey(n) { const t = FS.resolve(n); return t.icon || ICON[t.kind] || 'doc'; },
    isContainer: (n) => ['disk', 'trash', 'folder', 'sysfolder'].includes(FS.resolve(n).kind),
    isTrashed: (id) => id === TRASH || isInside(id, TRASH),
    isInside,

    /** "Marian HD:System Folder:Control Panels" */
    path(id) {
        const parts = [];
        let n = nodes.get(id);
        let guard = 0;
        while (n && n.id !== ROOT && guard++ < 50) { parts.unshift(n.name); n = nodes.get(n.parent); }
        return parts.join(':');
    },

    /** size in K; folders add up what is inside */
    size(n) {
        const t = FS.resolve(n);
        if (FS.isContainer(t)) return FS.children(t.id).reduce((s, c) => s + FS.size(c), 0);
        return t.size || 0;
    },
    modified: (n) => n.modified || FS.resolve(n).modified || BUILD_DATE,
    years: (n) => n.years || '',

    /** the fiction of the disk: 80 MB, some of it taken by the system */
    disk() {
        const total = 81920;
        const used = 41200 + FS.children('hd').reduce((s, c) => s + FS.size(c), 0);
        return { total, used, free: total - used };
    },

    /* ----- the Trash ----- */
    canTrash(id) {
        const n = nodes.get(id);
        if (!n) return { ok: false, reason: 'missing' };
        if (n.protected) return { ok: false, reason: 'protected' };
        if (FS.isTrashed(id)) return { ok: false, reason: 'already' };
        return { ok: true };
    },
    trash(ids) {
        const moved = [];
        const refused = [];
        const parents = new Set([TRASH]);
        ids.forEach((id) => {
            const c = FS.canTrash(id);
            const n = nodes.get(id);
            if (!c.ok) { if (n && c.reason !== 'already') refused.push({ node: n, reason: c.reason }); return; }
            parents.add(n.parent);
            commit(n, { from: n.parent, parent: TRASH });
            moved.push(n);
        });
        if (moved.length) emit(parents);
        return { moved, refused };
    },
    putAway(ids) {
        const moved = [];
        const parents = new Set([TRASH]);
        ids.forEach((id) => {
            const n = nodes.get(id);
            if (!n || n.parent !== TRASH) return;
            const back = nodes.has(n.from) && !FS.isTrashed(n.from) ? n.from : ROOT;
            const free = validName(back, n.name, n.id);
            commit(n, { parent: back, from: undefined, ...(free.error === 'taken' ? { name: n.name + ' copy' } : {}) });
            parents.add(back);
            moved.push(n);
        });
        if (moved.length) emit(parents);
        return moved;
    },
    emptyTrash() {
        const doomed = [];
        const collect = (id) => FS.children(id).forEach((c) => { doomed.push(c.id); collect(c.id); });
        collect(TRASH);
        if (!doomed.length) return 0;
        const removed = Store.sget('removed', []);
        doomed.forEach((id) => {
            const n = nodes.get(id);
            if (!n) return;
            if (!n.user) removed.push(id);
            nodes.delete(id);
            delete places[id];
            delete labels[id];
        });
        Store.sset('removed', removed);
        saveUser();
        savePlaces();
        saveLabels();
        emit([TRASH]);
        return doomed.length;
    },
    trashCount: () => FS.children(TRASH).length,

    /* ----- moving, making, naming ----- */
    move(ids, parentId) {
        const target = parentId === ROOT ? { kind: 'folder' } : nodes.get(parentId);       // the desktop is a folder without a node
        if (!target || !FS.isContainer(target)) return [];
        const moved = [];
        const parents = new Set([parentId]);
        ids.forEach((id) => {
            const n = nodes.get(id);
            if (!n || n.protected && parentId !== n.parent) return;
            if (id === parentId || isInside(parentId, id)) return;
            if (parentId === TRASH) return;
            if (n.parent === parentId) return;
            const free = validName(parentId, n.name, n.id);
            parents.add(n.parent);
            commit(n, { parent: parentId, from: undefined, ...(free.error === 'taken' ? { name: n.name + ' copy' } : {}) });
            moved.push(n);
        });
        if (moved.length) emit(parents);
        return moved;
    },
    create(parentId, base = 'untitled folder') {
        // a name that can never become valid by adding a number (too long, empty, a colon) must not loop for ever
        const stem = String(base).replace(/\s+/g, ' ').replace(/:/g, '-').trim().slice(0, 26) || 'untitled folder';
        let name = stem;
        for (let i = 2; !validName(parentId, name).name && i < 1000; i++) name = `${stem} ${i}`;
        seq += 1;
        Store.set('userSeq', seq);
        const n = { id: 'u' + seq, name, kind: 'folder', parent: parentId, order: 1000 + seq, user: true };
        nodes.set(n.id, n);
        saveUser();
        emit([parentId]);
        return n;
    },
    rename(id, name) {
        const n = nodes.get(id);
        if (!n || n.protected) return { error: 'protected' };
        const v = validName(n.parent, name, id);
        if (v.error) return v;
        if (v.name !== n.name) { commit(n, { name: v.name }); emit([n.parent]); }
        return { ok: true };
    },

    /* ----- where an icon sits on the desktop, and its label ----- */
    place(id) { return places[id] || (nodes.get(id) && nodes.get(id).place) || null; },
    setPlace(id, p) { places[id] = p; savePlaces(); },
    clearPlaces(ids) { ids.forEach((id) => { delete places[id]; }); savePlaces(); },
    label: (id) => labels[id] || 0,
    setLabel(ids, i) {
        ids.forEach((id) => { if (i) labels[id] = i; else delete labels[id]; });
        saveLabels();
        emit([...new Set(ids.map((id) => (nodes.get(id) || {}).parent))]);
    },

    /**
     * find a secret item: it appears where the manifest puts it, even if it was thrown away since
     * @returns {{node: object, was: 'new'|'here'|'moved'}|null}  `here`: it was already on the desktop
     */
    unlock(id) {
        const i = MANIFEST.findIndex((n) => n.id === id && n.secret);
        if (i < 0) return null;
        const m = MANIFEST[i];
        const found = Store.get('found', []);
        if (!found.includes(id)) Store.set('found', [...found, id]);
        Store.sset('removed', Store.sget('removed', []).filter((x) => x !== id));
        const have = nodes.get(id);
        if (have && have.parent === m.parent) return { node: have, was: 'here' };
        const parents = new Set([m.parent]);
        if (have) {
            parents.add(have.parent);
            commit(have, { parent: m.parent, from: undefined });
        } else {
            nodes.set(id, { ...m, order: i });
        }
        emit(parents);
        return { node: nodes.get(id), was: have ? 'moved' : 'new' };
    },

    /** back to the factory state (Special > Reset Desktop) */
    reset() {
        Store.reset();
        seq = 0;
        places = {};
        labels = {};
        load();
        emit([ROOT, TRASH, 'hd']);
    },

    on(fn) { subs.add(fn); return () => subs.delete(fn); }
};
