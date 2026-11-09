#!/usr/bin/env node
/* ==========================================================================
   OG — draws the share image (og-image.jpg, 1200 x 630): what LinkedIn, Slack, iMessage and the
   rest show when the link to the site is pasted.

     a   the homepage
     b   the share card (_tools/og-card.html)

   Requires Chrome and sips on macOS, and the website served over HTTP.

   Render both variants and install the share card:
       node _tools/og.mjs --out /some/folder --use b [--base http://localhost:8899/]
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; };
const base = opt('--base', 'http://localhost:8899/').replace(/\/?$/, '/');
const out = opt('--out', '');
const use = opt('--use', '');
const quality = opt('--quality', '85');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!out) { console.error('Give a folder for the pictures: --out /some/folder'); process.exit(1); }
if (!existsSync(chrome)) { console.error('Google Chrome not found: set CHROME=/path/to/chrome'); process.exit(1); }
mkdirSync(out, { recursive: true });

const shots = {
    a: base,
    b: `${base}_tools/og-card.html`
};

const profile = mkdtempSync(join(tmpdir(), 'marian-og-'));
try {
    for (const [key, url] of Object.entries(shots)) {
        const png = join(out, `og-${key}.png`);
        const jpg = join(out, `og-${key}.jpg`);
        execFileSync(chrome, [
            '--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1',
            `--user-data-dir=${profile}`, '--window-size=1200,630', '--virtual-time-budget=3000',
            `--screenshot=${png}`, url
        ], { stdio: 'ignore' });
        execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', quality, png, '--out', jpg], { stdio: 'ignore' });
        console.log(`drew ${jpg}`);
    }
} finally {
    rmSync(profile, { recursive: true, force: true });
}

if (use) {
    if (!shots[use]) { console.error('--use a or --use b'); process.exit(1); }
    copyFileSync(join(out, `og-${use}.jpg`), join(site, 'og-image.jpg'));
    console.log(`installed variant ${use} as og-image.jpg`);
}
