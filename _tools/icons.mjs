#!/usr/bin/env node
/* ==========================================================================
   ICONS — derives every browser and home-screen icon from icons/mk.svg.

     icons/mk.svg             the source drawing, also used directly as the SVG favicon
     icons/icon.svg           a generated copy for the PNG icons
     icons/icon-maskable.svg  a generated full-bleed version with a safe inset
                              (Android masks it; Apple draws its own corners)

   and makes:  icon-512.png, icon-192.png, icon-maskable-512.png, apple-touch-icon-180.png,
               favicon-32.png and favicon-48.png
   and, at the root of the site, the two icons that browsers ask for whatever the <head> says
   (Safari fetches /favicon.ico, iOS /apple-touch-icon.png):  favicon.ico (16, 32 and 48 px) and apple-touch-icon.png

   What it needs: a Mac with Google Chrome (it draws the SVG; set CHROME=/path to use another)
   and sips (it resizes). Nothing is downloaded.

   Run from anywhere:   node _tools/icons.mjs
   Only the two root icons, from the PNGs already in icons/ (no Chrome):   node _tools/icons.mjs --root
   Run it again after icons/mk.svg changes. Do not edit the derived icons separately.
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(site, 'icons');
const rootOnly = process.argv.includes('--root');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!rootOnly && !existsSync(chrome)) { console.error('Google Chrome not found: set CHROME=/path/to/chrome'); process.exit(1); }

const work = mkdtempSync(join(tmpdir(), 'mk-icons-'));
process.on('exit', () => rmSync(work, { recursive: true, force: true }));

/** keep all icon variants tied to the approved 64 x 64 favicon drawing */
function prepareDrawings() {
    const svg = readFileSync(join(dir, 'mk.svg'), 'utf8');
    const contents = /<svg\b[^>]*>([\s\S]*?)<\/svg>/.exec(svg)?.[1];
    const background = /<rect\b[^>]*\bfill="([^"]+)"/.exec(svg)?.[1];
    if (!contents || !background || !/viewBox="0 0 64 64"/.test(svg)) {
        throw new Error('icons/mk.svg must have a 64 x 64 viewBox and a background rectangle.');
    }
    copyFileSync(join(dir, 'mk.svg'), join(dir, 'icon.svg'));
    writeFileSync(join(dir, 'icon-maskable.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="${background}"/>
    <g transform="translate(6.4 6.4) scale(.8)">${contents}
    </g>
</svg>\n`);
}

/** draw an SVG at 512 x 512 into a PNG (transparent outside the drawing) */
function render(svg, png) {
    const html = join(work, svg.replace(/\W/g, '_') + '.html');
    writeFileSync(html, `<!doctype html><html><body style="margin:0;background:transparent"><img src="${pathToFileURL(join(dir, svg)).href}" width="512" height="512" style="display:block"></body></html>`);
    execFileSync(chrome, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
        '--force-device-scale-factor=1', '--default-background-color=00000000',
        `--user-data-dir=${join(work, 'chrome-profile')}`, '--virtual-time-budget=1000',
        `--screenshot=${join(dir, png)}`, '--window-size=512,512', pathToFileURL(html).href
    ], { stdio: 'ignore' });
    console.log(`drew ${png}`);
}

/** resize a PNG */
function resize(from, size, to) {
    execFileSync('sips', ['-z', String(size), String(size), join(dir, from), '--out', join(dir, to)], { stdio: 'ignore' });
    console.log(`made ${to} (${size} px)`);
}

if (!rootOnly) {
    prepareDrawings();
    render('icon.svg', 'icon-512.png');
    render('icon-maskable.svg', 'icon-maskable-512.png');
    resize('icon-512.png', 192, 'icon-192.png');
    resize('icon-maskable-512.png', 180, 'apple-touch-icon-180.png');
    resize('icon-512.png', 32, 'favicon-32.png');
    resize('icon-512.png', 48, 'favicon-48.png');
}

/* the root icons */
copyFileSync(join(dir, 'apple-touch-icon-180.png'), join(site, 'apple-touch-icon.png'));
console.log('copied apple-touch-icon.png (180 px)');

/* favicon.ico: an ICO file is a small table of images; every browser reads PNG images inside it */
const sizes = [16, 32, 48];
const pngs = sizes.map((s) => {
    const out = join(work, `ico-${s}.png`);
    execFileSync('sips', ['-z', String(s), String(s), join(dir, 'icon-512.png'), '--out', out], { stdio: 'ignore' });
    return readFileSync(out);
});
const table = Buffer.alloc(6 + 16 * sizes.length);
table.writeUInt16LE(0, 0);                            // reserved
table.writeUInt16LE(1, 2);                            // type 1 = icon
table.writeUInt16LE(sizes.length, 4);
let offset = table.length;
sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    table.writeUInt8(s, e);                           // width
    table.writeUInt8(s, e + 1);                       // height
    table.writeUInt16LE(1, e + 4);                    // colour planes
    table.writeUInt16LE(32, e + 6);                   // bits per pixel
    table.writeUInt32LE(pngs[i].length, e + 8);       // size of the image
    table.writeUInt32LE(offset, e + 12);              // where it starts
    offset += pngs[i].length;
});
writeFileSync(join(site, 'favicon.ico'), Buffer.concat([table, ...pngs]));
console.log(`made favicon.ico (${sizes.join(', ')} px)`);
