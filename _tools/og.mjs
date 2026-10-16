#!/usr/bin/env node
/* ==========================================================================
   OG — draws the share image (og-image.jpg, 1200 x 630): what LinkedIn, Slack, iMessage and the
   rest show when the link to the site is pasted.

     a   the real machine: the Desktop with the "Marian Kadlec" window open (?phase=desktop&rm=1&nocoach&fx=0: no scanlines, so it stays sharp when it is shown small)
     b   a card: the pear, the name and "This portfolio is a computer." (_tools/og-card.html)

   What it needs: a Mac with Google Chrome (set CHROME=/path to use another), sips, and the site served
   over http (the dev server "portfolio" in .claude/launch.json). Nothing is downloaded.

   Draw both into a folder to look at them:
       node _tools/og.mjs --out /some/folder [--base http://localhost:8899/]
   Draw both and install one as og-image.jpg at the root of the site:
       node _tools/og.mjs --out /some/folder --use a      (or b; --quality 82 makes the file smaller)
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; };
const base = opt('--base', 'http://localhost:8899/').replace(/\/?$/, '/');
const out = opt('--out', '');
const use = opt('--use', '');
const quality = opt('--quality', '85');                 // JPEG quality: the pixel-art screen needs about 300 KB at 85
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!out) { console.error('Give a folder for the pictures: --out /some/folder'); process.exit(1); }
if (!existsSync(chrome)) { console.error('Google Chrome not found: set CHROME=/path/to/chrome'); process.exit(1); }
mkdirSync(out, { recursive: true });

const shots = {
    a: `${base}?phase=desktop&rm=1&nocoach&fx=0`,
    b: `${base}_tools/og-card.html`
};

for (const [key, url] of Object.entries(shots)) {
    const png = join(out, `og-${key}.png`);
    const jpg = join(out, `og-${key}.jpg`);
    // a long virtual-time budget: the machine builds the desktop, dithers the portrait and opens the window before the picture is taken
    execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=20000', `--screenshot=${png}`, url], { stdio: 'ignore' });
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', quality, png, '--out', jpg], { stdio: 'ignore' });
    console.log(`drew ${jpg}`);
}

if (use) {
    if (!shots[use]) { console.error('--use a or --use b'); process.exit(1); }
    copyFileSync(join(out, `og-${use}.jpg`), join(site, 'og-image.jpg'));
    console.log(`installed variant ${use} as og-image.jpg`);
}
