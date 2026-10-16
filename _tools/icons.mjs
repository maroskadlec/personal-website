#!/usr/bin/env node
/* ==========================================================================
   ICONS — draws the PNG icons of the machine from the two pear drawings in icons/.

     icons/icon.svg            the pear on a rounded black square (a normal icon)
     icons/icon-maskable.svg   the pear on a full-bleed square, kept inside the safe circle
                               (Android masks it; Apple draws its own corners)

   and makes:  icon-512.png, icon-192.png, icon-maskable-512.png, apple-touch-icon-180.png, favicon-32.png
   and, at the root of the site, the two icons that browsers ask for whatever the <head> says
   (Safari fetches /favicon.ico, iOS /apple-touch-icon.png):  favicon.ico (16, 32 and 48 px) and apple-touch-icon.png

   What it needs: a Mac with Google Chrome (it draws the SVG; set CHROME=/path to use another)
   and sips (it resizes). Nothing is downloaded.

   Run from anywhere:   node _tools/icons.mjs
   Only the two root icons, from the PNGs already in icons/ (no Chrome):   node _tools/icons.mjs --root
   Run it again after the pear in icons/*.svg changes (the manifest and the <head> already point at these names).
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(site, 'icons');
const rootOnly = process.argv.includes('--root');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!rootOnly && !existsSync(chrome)) { console.error('Google Chrome not found: set CHROME=/path/to/chrome'); process.exit(1); }

const work = mkdtempSync(join(tmpdir(), 'mk-icons-'));

/** draw an SVG at 512 x 512 into a PNG (transparent outside the drawing) */
function render(svg, png) {
    const html = join(work, svg.replace(/\W/g, '_') + '.html');
    writeFileSync(html, `<!doctype html><html><body style="margin:0;background:transparent"><img src="${pathToFileURL(join(dir, svg)).href}" width="512" height="512" style="display:block"></body></html>`);
    execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--default-background-color=00000000', `--screenshot=${join(dir, png)}`, '--window-size=512,512', pathToFileURL(html).href], { stdio: 'ignore' });
    console.log(`drew ${png}`);
}

/** resize a PNG */
function resize(from, size, to) {
    execFileSync('sips', ['-z', String(size), String(size), join(dir, from), '--out', join(dir, to)], { stdio: 'ignore' });
    console.log(`made ${to} (${size} px)`);
}

if (!rootOnly) {
    render('icon.svg', 'icon-512.png');
    render('icon-maskable.svg', 'icon-maskable-512.png');
    resize('icon-512.png', 192, 'icon-192.png');
    resize('icon-maskable-512.png', 180, 'apple-touch-icon-180.png');
    resize('icon-512.png', 32, 'favicon-32.png');
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
