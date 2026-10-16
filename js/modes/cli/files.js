/* ==========================================================================
   FILES — ls, cd, cat, pwd and open: the Desktop seen as a file system from
   the Terminal. Everything comes from the Bridge (ctx.desktop); `open` hands
   the item to the Desktop by switching to it. Nothing here writes new content:
   it prints names, roles, years and the texts the pages already have.
   ========================================================================== */
import { profile } from '../../content/index.js';
import { esc } from '../../core/util.js';
import { ok, dim, faint, hl } from './fmt.js';

const EXTERNAL = ['linkedin', 'github', 'dribbble', 'market'];
const SECTIONS = { 'about.md': 'about', skills: 'skills', career: 'career', links: 'links', hire: 'hire', contact: 'hire' };

export function createFiles({ print, ctx, bridge, state, setCwd, commands }) {
    if (!bridge) return { commands: {}, completions: () => [] };      // no Desktop attached: these commands do not exist

    const which = (names) => print([dim('which one?') + ' ' + names.map((n) => hl(esc(n))).join(dim(', '))]);

    const cmds = {
        pwd() { print([esc('~/portfolio' + (state.cwd === bridge.home ? '' : bridge.path(state.cwd).slice(1)))]); },

        ls(arg) {
            const t = (arg || '').trim();
            const target = t ? bridge.folder(t, state.cwd) : state.cwd;
            if (target === null) {
                const f = bridge.find(t);
                if (f && f.id) print([esc(f.name)]);
                else print([dim('ls: cannot access ') + esc(t) + dim(': no such file or directory')]);
                return;
            }
            const items = bridge.list(target);
            if (!items.length) { print([faint('(empty)')]); return; }
            const info = items.map((it) => bridge.describe(it.id));
            let rows;
            if (info.every((d) => d.role) && window.innerWidth < 640) {
                // on a phone the columns would wrap: one line per project instead
                rows = info.map((d) => hl(esc(d.name)) + ' ' + dim(esc(d.role + ' · ' + d.years)));
            } else if (info.every((d) => d.role)) {
                // the projects: name, role, years, in columns
                const w1 = Math.max(...info.map((d) => d.name.length)) + 2;
                const w2 = Math.max(...info.map((d) => d.role.length)) + 2;
                rows = info.map((d) => hl(esc(d.name.padEnd(w1))) + dim(esc(d.role.padEnd(w2))) + faint(esc(d.years)));
            } else {
                rows = [items.map((it) => (it.folder ? ok(esc(it.name) + '/') : esc(it.name))).join('   ')];
            }
            print([...rows, faint('open &lt;name&gt; shows it on the Desktop.')]);
        },

        cd(arg) {
            const t = (arg || '').trim();
            const id = bridge.folder(t, state.cwd);
            if (id === null) {
                const f = bridge.find(t);
                print([dim('cd: ') + esc(t) + dim(f && f.id ? ': not a directory' : ': no such file or directory')]);
                return;
            }
            setCwd(id);
        },

        cat(arg) {
            const raw = (arg || '').trim();
            const low = raw.toLowerCase();
            if (!raw) { print([dim('usage:') + ' cat &lt;name&gt; ' + faint('— try: cat about.md')]); return; }
            if (low === 'about.md' || low === 'about') { print(profile.about.map((p) => esc(p.text))); return; }
            if (SECTIONS[low]) { commands[SECTIONS[low]](); return; }
            const f = bridge.find(raw);
            if (!f) { print([dim('cat: ') + esc(raw) + dim(': no such file or directory')]); return; }
            if (f.ambiguous) { which(f.ambiguous); return; }
            const d = bridge.describe(f.id);
            const head = hl(esc(d.name)) + (d.role ? ' ' + dim(esc(d.role) + (d.years ? ' · ' + d.years : '')) : '');
            print([head, ...(d.comment ? [esc(d.comment)] : []), faint('open ' + esc(d.name.toLowerCase()) + ' shows it on the Desktop.')]);
        },

        open(arg) {
            const raw = (arg || '').trim();
            const low = raw.toLowerCase();
            if (!raw) { print([dim('usage:') + ' open &lt;name&gt; ' + faint('— try: open projects, open atmoskop, open services')]); return; }
            if (['os', 'desktop', 'gui'].includes(low)) { commands.gui(); return; }
            if (EXTERNAL.includes(low)) { commands[low](); return; }
            const f = bridge.find(raw);
            if (!f) { print([dim('cannot open:') + ' ' + esc(raw) + ' ' + faint('— try ls')]); return; }
            if (f.ambiguous) { which(f.ambiguous); return; }
            if (f.id === 'terminal') { print([dim('you are in the Terminal already.') + ' ' + faint('gui takes you to the Desktop')]); return; }
            print([dim('opening') + ' ' + ok(esc(f.name)) + dim(' on the Desktop…')]);
            setTimeout(() => ctx.switchMode('os', { via: 'cmd', open: f.id }), 300);
        },

    };

    /** what Tab may complete for a command's argument (lower case, as it is typed) */
    const completions = (cmd) => {
        const names = bridge.names().map((n) => n.toLowerCase());
        const folders = bridge.names({ folders: true }).map((n) => n.toLowerCase());
        if (cmd === 'open') return [...names, 'os', ...EXTERNAL];
        if (cmd === 'cd') return ['..', '~', ...folders];
        if (cmd === 'ls') return folders;
        if (cmd === 'cat') return [...names, ...Object.keys(SECTIONS)];
        return [];
    };

    return { commands: cmds, completions };
}
