/* ==========================================================================
   BRIDGE — how the Terminal looks at the Desktop: the same items seen as a
   file tree, names a visitor can type (even half of one), and the words to
   describe an item. The Terminal never touches the OS itself: it gets this
   object from main.js (ctx.desktop) and asks it. Opening is done by the
   Desktop when the mode switches (Modes.switch(..., { open: id })).
   ========================================================================== */
import { FS, ROOT } from './fs.js';
import { Memory } from './memory.js';

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');

/** other ways to say an item: what is typed, normalised */
const ALIASES = {
    me: ['marian', 'mariankadlec', 'browser', 'web', 'website', '2008'],
    terminal: ['cli', 'shell'],
    controls: ['controlpanels', 'settings'],
    hd: ['disk', 'harddisk']
};

/** every item, depth first from the desktop; aliases are left out (they only point at items already in the list) */
function walk(id = ROOT, out = []) {
    FS.children(id).forEach((n) => {
        if (n.kind !== 'alias') out.push(n);
        if (FS.isContainer(n)) walk(n.id, out);
    });
    return out;
}

export const Bridge = {
    home: ROOT,

    /** the path as the Terminal writes it: ~, ~/Projects, ~/Marian HD/Applications */
    path(id) { return id === ROOT ? '~' : '~/' + FS.path(id).replace(/:/g, '/'); },
    parent(id) { const n = FS.node(id); return n && n.parent ? n.parent : ROOT; },

    list(id) {
        return FS.children(id).filter((n) => n.kind !== 'alias').map((n) => ({ id: n.id, name: n.name, folder: FS.isContainer(n) }));
    },

    /** the names that can be typed, for completion (folders only on request) */
    names({ folders = false } = {}) {
        return walk().filter((n) => !folders || FS.isContainer(n)).map((n) => n.name);
    },

    /** a folder by what was typed: "..", "~", "projects", "~/Marian HD/Applications"; looked for in `from` first, then anywhere. null if there is none */
    folder(text, from = ROOT) {
        const t = String(text || '').trim();
        if (!t || t === '~' || t === '~/') return ROOT;
        if (t === '.') return from;
        if (t === '..') return from === ROOT ? ROOT : Bridge.parent(from);
        const q = norm(t);
        const inside = FS.children(from).filter((n) => FS.isContainer(n));
        let hit = inside.find((n) => norm(n.name) === q) || inside.find((n) => norm(n.name).startsWith(q));
        if (!hit) hit = walk().find((n) => FS.isContainer(n) && (norm(n.name) === q || (ALIASES[n.id] || []).includes(q)));
        if (hit) return hit.id;
        if (t.includes('/')) {                                                    // a path: one folder after the other
            let cur = /^[~/]/.test(t) ? ROOT : from;
            for (const part of t.replace(/^[~/]+/, '').split('/').filter(Boolean)) {
                cur = Bridge.folder(part, cur);
                if (cur === null) return null;
            }
            return cur;
        }
        return null;
    },

    /** an item by what was typed: { id, name } for one, { ambiguous: [names] } for several, null for none */
    find(text) {
        const raw = String(text || '').trim();
        const q = norm(raw);
        if (!q) return null;
        const all = walk();
        const byId = all.find((n) => n.id === raw || norm(n.id) === q);
        if (byId) return { id: byId.id, name: byId.name };
        const tiers = [
            all.filter((n) => norm(n.name) === q),
            all.filter((n) => (ALIASES[n.id] || []).includes(q)),
            all.filter((n) => norm(n.name).startsWith(q)),
            all.filter((n) => norm(n.name).includes(q))
        ];
        for (const hits of tiers) {
            if (hits.length === 1) return { id: hits[0].id, name: hits[0].name };
            if (hits.length > 1) return { ambiguous: hits.map((n) => n.name) };
        }
        if (q === 'about' || q === 'aboutthiscomputer') return { id: 'about', name: 'About This Computer' };
        if (q === 'puzzle') return { id: 'puzzle', name: 'Puzzle' };
        return null;
    },

    /** what an item is, in the words the Desktop already has for it (role and years, the Get Info comment) */
    describe(id) {
        if (id === 'about') return { id, name: 'About This Computer', kind: 'Window', role: '', years: '', comment: 'What this computer is and how much memory it has.', folder: false };
        if (id === 'puzzle') return { id, name: 'Puzzle', kind: 'Program', role: '', years: '', comment: 'Fifteen tiles, one gap, one portrait.', folder: false };
        const n = FS.node(id);
        if (!n) return null;
        const t = FS.resolve(n);
        return { id: n.id, name: n.name, kind: FS.kindLabel(t), role: t.role || '', years: t.years || '', comment: t.comment || n.comment || '', folder: FS.isContainer(t) };
    },

    memory: () => ({ used: Memory.used(), total: Memory.total })
};
