/* ==========================================================================
   HUMOR — the commands nobody asked for: fortune, ping client, neofetch, a
   teapot, a sudo that says no, and one rm that takes the whole machine down.
   The words are in js/content/eggs.js.
   ========================================================================== */
import { profile } from '../../content/index.js';
import { fortunes, ping as P, neofetch as N, coffee as C, sudo as S, git as G, bomb } from '../../content/eggs.js';
import { esc, reducedMotion } from '../../core/util.js';
import { ok, dim, faint, hl } from './fmt.js';

const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? 0 : ms));       // the lines of ping and sudo arrive at once for people who asked for less motion (never in the same turn as the Enter that asked)

/** rm -rf / in any of its spellings (-rf, -fr, -r -f), with or without the star */
const isRmRf = (line) => /^rm\s+(-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*|-r\s+-f|-f\s+-r)\s+\/\*?\s*$/i.test(line.trim());

export function createHumor({ print, ctx, getTheme, bridge, commands }) {
    let lastFortune = -1;

    return {
        fortune() {
            let i;
            do { i = Math.floor(Math.random() * fortunes.length); } while (i === lastFortune && fortunes.length > 1);
            lastFortune = i;
            print([esc(fortunes[i])]);
        },

        async ping(arg) {
            const host = (arg || '').trim().toLowerCase();
            if (!host) { print([dim(P.usage)]); return; }
            if (host !== 'client') { print([dim(esc(P.unknown(host))) + ' ' + faint(P.hint)]); return; }
            print([dim(P.head)], { gap: false });
            for (let i = 0; i < P.replies.length; i++) {
                await wait(480);
                const r = P.replies[i];
                print([`64 bytes from client: icmp_seq=${i} ttl=64 time=${r.ms} ms  ` + faint(esc('“' + r.say + '”'))], { gap: false });
            }
            await wait(480);
            print([dim(P.stats[0]), P.stats[1].replace(/one more small change pending/, ok('one more small change pending'))]);
        },

        neofetch() {
            const mem = bridge ? bridge.memory() : { used: 5400, total: 16384 };
            const k = (n) => Math.round(n).toLocaleString('en-US') + 'K';
            const field = (name, value) => ok(esc(name.padEnd(11))) + esc(value);
            const info = [
                hl('marian') + faint('@') + hl('kadlec'),
                '<span aria-hidden="true">' + faint('─'.repeat(13)) + '</span>',
                field('OS', N.os),
                field('Host', N.host),
                field('Shell', N.shell),
                field('Uptime', `${profile.years}+ years`),
                field('Theme', getTheme()),
                field('Resolution', `${window.innerWidth}×${window.innerHeight}`),
                field('Fonts', N.fonts),
                field('Memory', `${k(mem.used)} / ${k(mem.total)}`),
                field('Coffee', N.coffee)
            ];
            // beside the pear when the glass is wide enough, below it on a phone
            if (window.innerWidth < 760) { print(info); return; }
            const rows = Math.max(N.art.length, info.length);
            const out = [];
            for (let i = 0; i < rows; i++) out.push('<span aria-hidden="true">' + ok(esc(N.art[i] || ' '.repeat(N.art[0].length))) + '</span>' + (info[i] || ''));
            print(out);
        },

        coffee() { print([dim(esc(C.brew)) + ' ' + ok(esc(C.error)), faint(esc(C.teapot))]); },

        rm(arg) {
            const line = 'rm ' + (arg || '');
            if (isRmRf(line)) print([dim(esc(S.rmDenied)), faint(esc(S.rmHint))]);
            else if (!(arg || '').trim()) print([dim('rm: missing operand')]);
            else print([dim('rm: ' + esc(arg.trim().split(/\s+/).filter((w) => !w.startsWith('-')).join(' ') || arg.trim()) + ': no such file or directory')]);
        },

        async sudo(arg) {
            const line = (arg || '').trim();
            if (isRmRf(line)) {
                for (const l of S.rmLines) { print([dim(esc(l))], { gap: false }); await wait(420); }
                if (ctx.crash) ctx.crash(bomb.detail.rm);
                return;
            }
            if (/^make\s+me\s+a\s+sandwich$/i.test(line)) { print([esc(S.sandwich)]); return; }
            print([ok(esc(S.nope[0])) + ' ' + dim(esc(S.nope[1]))]);
        },

        git(arg) {
            const t = (arg || '').trim().toLowerCase();
            if (!t) print([dim(G.usage)]);
            else if (t === 'log' || t.startsWith('log ')) commands.career();
            else print([dim(esc(G.only))]);
        }
    };
}
