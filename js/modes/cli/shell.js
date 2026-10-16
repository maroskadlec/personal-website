/* ==========================================================================
   SHELL — the command interpreter of the Terminal mode (ported from v6).
   Everything it prints comes from js/content/*, so a new project or link shows
   up here without touching this file. It is made of three parts: this file
   (the site's own commands), humor.js (the commands nobody asked for) and
   files.js (ls, cd, cat, open: the Desktop seen as a file system).
   ========================================================================== */
import { profile, skills, career, ai, links, linkByKey, contact } from '../../content/index.js';
import { more } from '../../content/eggs.js';
import { esc, rich } from '../../core/util.js';
import { ok, dim, faint, hl, a } from './fmt.js';
import { createHumor } from './humor.js';
import { createFiles } from './files.js';

/** mono is the default theme, the first one listed */
export const THEMES = { mono: '#d6d6d6', green: '#4afa8b', amber: '#ffb454', blue: '#6cb6ff', light: '#0b7a48', claude: '#e8825a' };
const THEME_LIST = Object.keys(THEMES).join(' · ');

/** the prompt line: where you are is the Desktop folder you have cd'd into */
export const promptHTML = (path = '~') => `<span class="p"><span class="u">marian@kadlec</span> ${esc(path)} $ </span>`;
export const PROMPT = promptHTML();

/**
 * @param {{print: (lines: string[], opts?: {gap?: boolean}) => void, clear: () => void, ctx: object, getTheme: () => string, setTheme: (n: string) => boolean, rebuild: () => void, onPath?: (path: string) => void}} env
 *   ctx.desktop (the Bridge) is what ls, cd, cat and open look at; without it those commands do not exist
 */
export function createShell({ print, clear, ctx, getTheme, setTheme, rebuild, onPath = () => {} }) {
    const history = [];
    const bridge = ctx.desktop || null;
    const state = { cwd: bridge ? bridge.home : null };
    const where = () => (bridge ? bridge.path(state.cwd) : '~');
    const setCwd = (id) => { state.cwd = id; onPath(where()); };

    function gitLog() {
        const lines = [faint(career.head.hash) + ' ' + dim(esc(career.head.type) + ':') + ' ' + hl(esc(career.head.text))];
        career.companies.forEach((c) => lines.push(faint(c.hash) + ' ' + dim('feat(redesign):') + ' ' + hl(esc(c.name))));
        lines.push(faint(career.init.hash) + ' ' + dim(esc(career.init.text)));
        return lines;
    }

    function hire() {
        const li = linkByKey('linkedin');
        return [
            dim('status:') + ' ' + ok(esc(contact.status)) + ' — ' + esc(contact.offers),
            faint('→') + ' ' + a('mailto:' + contact.email, contact.email),
            faint('→') + ' ' + a(li.url, li.label) + ' ' + faint('↗'),
            dim('response time:') + ' ' + esc(contact.response) + ' ' + faint('— faster than your CI pipeline')
        ];
    }

    function openExternal(key) {
        const l = linkByKey(key);
        print([dim('Opening') + ' ' + a(l.url, l.label) + dim('…')]);
        window.open(l.url, '_blank', 'noopener');
    }

    const commands = {
        help() {
            print([
                dim('available commands:'),
                `  ${ok('whoami')}      ${faint('who is this guy anyway')}`,
                `  ${ok('skills')}      ${faint('design / build / ai')}`,
                `  ${ok('ai')}          ${faint('how the AI workflow actually works')}`,
                `  ${ok('stack')}       ${faint('what is in the toolbox this month')}`,
                `  ${ok('career')}      ${faint('git log of the redesigns')}`,
                `  ${ok('hire')}        ${faint('availability &amp; contact')}`,
                `  ${ok('links')}       ${faint('linkedin / github / dribbble / market')}`,
                ...(bridge ? [
                    `  ${ok('open')} ${faint('&lt;name&gt;')} ${faint('open something on the Desktop (try: open projects)')}`,
                    `  ${ok('ls')} ${ok('cd')} ${ok('cat')}   ${faint('look around the Desktop like a file system')}`
                ] : []),
                `  ${ok('gui')}         ${faint('switch to the Desktop (also: startx, or press `)')}`,
                `  ${ok('theme')}       ${faint(THEME_LIST)}`,
                `  ${ok('rebuild')}     ${faint('watch the site build itself again')}`,
                `  ${ok('reboot')}      ${faint('restart the machine (boot menu)')}`,
                `  ${ok('vibe')} ${ok('clear')} ${ok('exit')}`,
                faint(esc(more))
            ]);
        },
        whoami() { print([hl(esc(profile.name)) + ' — ' + esc(profile.title) + ' ' + ok(esc(profile.tagline.join(' ')))]); },
        skills() {
            const out = [];
            skills.forEach((g) => {
                out.push(dim(esc(g.group) + '/'));
                g.items.forEach((s) => out.push('  ' + faint('▸') + ' ' + rich(s)));
            });
            print(out);
        },
        stack() {
            print([dim('# ' + esc(ai.stackNote)), ...ai.stack.map((t) => faint(t.path) + hl(t.name) + '  ' + faint(esc(t.note)))]);
        },
        ai() {
            const rows = ai.workflow.map((w, i) => {
                const tree = i === 0 ? '┌' : i === ai.workflow.length - 1 ? '└' : '├';
                return `<span aria-hidden="true">${tree} </span>${esc(w.stage).padEnd(9, ' ')} <span aria-hidden="true">→</span> ${rich(w.text)}`;
            });
            print([
                esc(ai.lead),
                ...rows,
                dim('delivery:') + ' ' + esc(ai.delivery),
                dim('result:') + ' ' + esc(ai.result.text) + ' ' + ok(esc(ai.result.gain))
            ]);
        },
        career() { print(gitLog()); },
        hire() { print(hire()); },
        contact() { print(hire()); },
        links() {
            print(links.map((l) => faint('→') + ' ' + a(l.url, l.label) + ' ' + faint('↗')));
        },
        linkedin() { openExternal('linkedin'); },
        github() { openExternal('github'); },
        dribbble() { openExternal('dribbble'); },
        market() { openExternal('market'); },
        theme(arg) {
            const t = (arg || '').trim().toLowerCase();
            if (!t) print([dim('themes:') + ' ' + THEME_LIST + ' ' + faint('(now: ' + getTheme() + ')')]);
            else if (setTheme(t)) print([dim('theme set →') + ' ' + ok(esc(t))]);
            else print([dim('unknown theme:') + ' ' + esc(t) + ' ' + faint('— available: ' + THEME_LIST)]);
        },
        rebuild() { print([dim('rebuilding…')]); setTimeout(rebuild, 350); },
        gui() {
            print([dim('starting') + ' ' + ok('Marian OS') + dim('…')]);
            setTimeout(() => ctx.switchMode('os', { via: 'cmd' }), 250);
        },
        reboot() {
            print([dim('rebooting…') + ' ' + faint('(boot menu next)')]);
            setTimeout(() => ctx.restart({ menu: true }), 500);
        },
        shutdown() {
            print([dim('powering off…') + ' ' + faint('see you')]);
            setTimeout(() => ctx.shutdown(), 500);
        },
        history() { print(history.map((h, i) => faint(String(i + 1).padStart(3, ' ')) + '  ' + esc(h))); },
        vibe() { print(['vibe levels: ' + ok('████████░░') + ' 87% ' + faint('— acceptable for a Wednesday')]); },
        clear() { clear(); },
        exit() { print([dim('There is no exit. This is a portfolio, not a session.') + ' ' + faint('But there is a GUI: type') + ' ' + ok('gui')]); }
    };
    const files = createFiles({ print, ctx, bridge, state, setCwd, commands });
    Object.assign(commands, createHumor({ print, ctx, getTheme, bridge, commands }), files.commands);
    commands.startx = commands.gui;
    commands.desktop = commands.gui;

    function run(raw) {
        const input = raw.trim();
        if (!input) return;
        history.push(input);
        const parts = input.split(/\s+/);
        const name = parts[0].toLowerCase();
        print([promptHTML(where()) + '<span class="c">' + esc(input) + '</span>'], { gap: false });
        const fn = Object.prototype.hasOwnProperty.call(commands, name) ? commands[name] : null;
        if (fn) fn(parts.slice(1).join(' '));
        else print([dim('command not found:') + ' ' + esc(name) + ' ' + faint('— try') + ' ' + ok('help')]);
    }

    /**
     * Tab: complete the command, or what a command takes. One match fills it in; several fill in
     * what they share. Returns null when there is nothing to complete, so Tab can keep its normal job.
     * @returns {{line: string, options: string[]}|null}
     */
    function complete(line) {
        const m = line.match(/^(\s*)(\S+)(\s+)?(.*)$/);
        if (!m) return null;
        const [, lead, cmdRaw, gap, rest] = m;
        const cmd = cmdRaw.toLowerCase();
        let pool;
        let head;
        let word;
        if (!gap) {                                                       // still typing the command
            pool = Object.keys(commands).filter((n) => !['startx', 'desktop'].includes(n));
            head = lead;
            word = cmd;
        } else {
            pool = cmd === 'theme' ? Object.keys(THEMES) : cmd === 'ping' ? ['client'] : files.completions(cmd);
            head = lead + cmdRaw + gap;
            word = rest.toLowerCase();
        }
        const options = [...new Set(pool.filter((n) => n.toLowerCase().startsWith(word) && n.toLowerCase() !== word))].sort();
        if (!options.length) return null;
        if (options.length === 1) return { line: head + options[0] + (gap ? '' : ' '), options };
        let common = options[0];
        options.forEach((o) => { while (!o.toLowerCase().startsWith(common.toLowerCase())) common = common.slice(0, -1); });
        return { line: head + (common.length > word.length ? common : word), options };
    }
    return { run, commands, history, complete, get path() { return where(); } };
}
