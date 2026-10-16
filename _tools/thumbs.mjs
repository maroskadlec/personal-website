#!/usr/bin/env node
/* ==========================================================================
   THUMBS — makes the small copies of the pictures the site shows (img/).

   The originals (1024 x 1024, 100 to 260 KB each) live in the repo root, where the classic
   site had them. This computer shows them at 256 px at most, so it uses copies: 512 px wide for the
   big ones (client tokens, Scrapbook, the 2008 site) and 224 px for the small cards (and the
   2008 Work page, which shows the tokens small).
   The list of pictures comes from js/content/*.js, and the names from the same function
   the site uses (thumbName in js/content/services.js), so the two can never disagree.

   Needs cwebp (libwebp):  brew install webp
   Run from anywhere:      node _tools/thumbs.mjs
   Run it again after a picture is added or changed; it skips what is already up to date.
   ========================================================================== */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { services, process as steps, whyme, thumbName, SIZES } from '../js/content/services.js';
import { work } from '../js/content/work.js';
import { profile } from '../js/content/profile.js';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');                 // the repo root: the site and, next to img/, the originals
const root = site;
const out = join(site, 'img');
mkdirSync(out, { recursive: true });

/* which pictures, and in which sizes: every picture in both (the tokens too: the 2008 Work page shows them as small cards) */
const tokens = new Set(work.roles.map((r) => r.image).filter(Boolean));
const files = new Set([
    ...services.items, ...steps.items, ...whyme.items
].map((i) => i.image));
Object.values(work.journey.images || {}).forEach((f) => files.add(f));
tokens.forEach((f) => files.add(f));

const quality = { 224: 80, 512: 76 };
const kb = (n) => (n / 1024).toFixed(0).padStart(4);
let before = 0;
let after = 0;
const made = new Map();

function fresh(src, dest) {
    return existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs;
}

for (const file of [...files].sort()) {
    const src = join(root, file);
    if (!existsSync(src)) { console.error(`missing original: ${file}`); process.exitCode = 1; continue; }
    before += statSync(src).size;
    if (/\.svg$/i.test(file)) {
        const dest = join(out, thumbName(file));
        copyFileSync(src, dest);
        after += statSync(dest).size;
        console.log(`${kb(statSync(src).size)} KB -> ${kb(statSync(dest).size)} KB  ${file} (copied)`);
        continue;
    }
    const sizes = SIZES;
    const row = [];
    for (const size of sizes) {
        const name = thumbName(file, size);
        if (made.has(name) && made.get(name) !== file) { console.error(`two pictures would share ${name}: ${made.get(name)} and ${file}`); process.exitCode = 1; }
        made.set(name, file);
        const dest = join(out, name);
        if (!fresh(src, dest)) execFileSync('cwebp', ['-quiet', '-m', '6', '-q', String(quality[size]), '-resize', String(size), '0', src, '-o', dest]);
        after += statSync(dest).size;
        row.push(`${size}px ${kb(statSync(dest).size)} KB`);
    }
    console.log(`${kb(statSync(src).size)} KB -> ${row.join(' · ')}  ${file}`);
}

/* the portrait: copied as it is (the Desktop crops it at exact pixels, so its size must not change) */
const photo = join(root, 'marian-kadlec-profile-image.webp');
copyFileSync(photo, join(out, profile.photo.replace(/^img\//, '')));

console.log(`\n${files.size} pictures: ${(before / 1048576).toFixed(2)} MB of originals, ${(after / 1048576).toFixed(2)} MB of copies in img/`);
