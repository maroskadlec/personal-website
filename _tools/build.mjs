#!/usr/bin/env node
/* ==========================================================================
   BUILD — fingerprint the stylesheets and scripts linked from the homepage and validate the site.
   Use --check to verify without writing. Use --release to also update the sitemap date.
   ========================================================================== */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SIZES, thumbName } from '../js/content/services.js';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..');
const CHECK = process.argv.includes('--check');
const RELEASE = process.argv.includes('--release') && !CHECK;

/* what is part of the site. Anything else in the repository is not published (or not meant to be used by the page) */
const FILES = ['index.html', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', 'favicon.ico', 'apple-touch-icon.png', 'og-image.jpg'];
const DIRS = ['css', 'js', 'fonts', 'img', 'icons', 'vendor'];

const problems = [];
const bad = (msg) => problems.push(msg);
const sha = (data) => createHash('sha256').update(data).digest('hex').slice(0, 10);

function walk(rel) {
    return readdirSync(join(site, rel), { withFileTypes: true }).flatMap((e) =>
        e.name.startsWith('.') ? [] : e.isDirectory() ? walk(posix.join(rel, e.name)) : [posix.join(rel, e.name)]);
}
const siteFiles = [...FILES.filter((f) => existsSync(join(site, f))), ...DIRS.filter((d) => existsSync(join(site, d))).flatMap(walk)];
const exact = new Set(siteFiles);
const folded = new Map(siteFiles.map((f) => [f.toLowerCase(), f]));

/* what each file should contain when this is done (the text on disk until something changes it) */
const want = new Map();
const text = (rel) => (want.has(rel) ? want.get(rel) : readFileSync(join(site, rel), 'utf8'));
const set = (rel, value) => want.set(rel, value);

if (RELEASE) {
    const iso = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Prague' });
    set('sitemap.xml', text('sitemap.xml').replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${iso}</lastmod>`));
    console.log(`release date: ${iso}`);
}

const cssFiles = siteFiles.filter((f) => f.endsWith('.css'));
const jsFiles = siteFiles.filter((f) => f.startsWith('js/') && f.endsWith('.js')).sort();
const html = text('index.html').replace(
    /(<(?:link rel="stylesheet" href|script src)=")((?:css|js)\/[\w.-]+\.(?:css|js))(\?v=[0-9a-f]+)?(")/g,
    (match, start, file, version, end) => {
        if (!exact.has(file)) return match;
        return `${start}${file}?v=${sha(text(file))}${end}`;
    }
);
set('index.html', html);

/* ---------------------------------------------------------- write, or find out what is out of date */
const stale = [...want].filter(([rel, next]) => next !== readFileSync(join(site, rel), 'utf8')).map(([rel]) => rel);
if (CHECK) {
    if (stale.length) bad(`out of date: ${stale.join(', ')} (run _tools/build.mjs)`);
} else {
    for (const rel of stale) writeFileSync(join(site, rel), want.get(rel));
    console.log(stale.length ? `written: ${stale.join(', ')}` : 'nothing to write');
}

/* ---------------------------------------------------------- the checks */
const SITE_URL = (/\bsite:\s*'(https?:\/\/[^']+)'/.exec(text('js/content/contact.js')) || [])[1];
if (!SITE_URL) bad("js/content/contact.js has no site: '…'");
const ORIGIN = SITE_URL ? new URL(SITE_URL).origin : '';

/* every file the page can load must exist, with exactly this letter case, and be part of the site */
let checked = 0;
function ref(from, spec, what) {
    if (!spec || /^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(spec)) return;          // a scheme or a fragment: not a file of ours
    const path = spec.split('#')[0].split('?')[0];
    if (!path || path === './' || path === '.') return;
    const target = posix.normalize(path.startsWith('/') ? path.slice(1) : posix.join(posix.dirname(from), path));
    checked++;
    if (exact.has(target)) return;
    const hint = folded.get(target.toLowerCase());
    bad(`${from}: ${what} "${spec}" ${hint ? `has the wrong letter case (the file is ${hint})` : 'does not exist or is not part of the site'}`);
}

const htmlText = text('index.html');
for (const m of htmlText.matchAll(/\b(?:href|src)\s*=\s*"([^"]+)"/g)) ref('index.html', m[1], 'link');
if (existsSync(join(site, 'manifest.webmanifest'))) {
    try {
        const manifest = JSON.parse(text('manifest.webmanifest'));
        for (const i of manifest.icons || []) ref('manifest.webmanifest', i.src, 'icon');
    } catch (e) { bad(`manifest.webmanifest is not valid JSON (${e.message})`); }
}
for (const f of jsFiles) {
    const src = text(f);
    for (const m of src.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"](\.{1,2}\/[^'"]+)['"]/g)) ref(f, m[1], 'import');
    // a path written as a string is relative to the page, not to the module
    for (const m of src.matchAll(/['"`]((?:\.\.?\/)?(?:img|fonts|icons|vendor|css|js)\/[A-Za-z0-9_\-./&+%]+\.[a-z0-9]+)['"`]/g)) ref('index.html', m[1], 'file name');
}
for (const f of cssFiles) {
    for (const m of text(f).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) ref(f, m[1], 'url()');
}
// the images the content names (bare file names): the page asks for the small copies _tools/thumbs.mjs made
for (const f of ['js/content/services.js', 'js/content/work.js']) {
    for (const m of text(f).matchAll(/['"`]([A-Za-z0-9_\-&+.]+\.(?:webp|png|jpg|svg))['"`]/g)) {
        const files = /\.svg$/i.test(m[1]) ? [m[1]] : SIZES.map((s) => thumbName(m[1], s));
        for (const name of files) ref('index.html', `img/${name}`, `image "${m[1]}" needs`);
    }
}

/* the address of the site: one truth, in contact.site */
const runtime = ['index.html', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', ...jsFiles, ...cssFiles].filter((f) => exact.has(f));
for (const f of runtime) if (/mariankadlec\.com\b/i.test(text(f))) bad(`${f} mentions mariankadlec.com (the site is ${SITE_URL})`);
if (SITE_URL) {
    const need = (label, ok) => { if (!ok) bad(`index.html: ${label} is not ${SITE_URL}/ ...`); };
    need('<link rel="canonical">', htmlText.includes(`<link rel="canonical" href="${SITE_URL}/">`));
    need('og:url', htmlText.includes(`<meta property="og:url" content="${SITE_URL}/">`));
    need('og:image', htmlText.includes(`<meta property="og:image" content="${SITE_URL}/og-image.jpg">`));
    need('twitter:image', htmlText.includes(`<meta name="twitter:image" content="${SITE_URL}/og-image.jpg">`));
    need('the JSON-LD url', htmlText.includes(`"url": "${SITE_URL}/"`));
    if (exact.has('robots.txt') && !text('robots.txt').includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) bad('robots.txt: the Sitemap line does not match contact.site');
    if (exact.has('sitemap.xml') && !text('sitemap.xml').includes(`<loc>${SITE_URL}/</loc>`)) bad('sitemap.xml: <loc> does not match contact.site');
}
if (/noindex/i.test(htmlText)) bad('index.html has a noindex');
if (!htmlText.includes('<meta name="robots" content="index, follow">')) bad('index.html: <meta name="robots" content="index, follow"> is missing');

/* nothing from anyone else: no tracker, no font or script CDN, no cookie written, no other origin in a tag that loads something */
const BANNED = /clarity\.ms|googletagmanager|google-analytics|googleapis\.com|gstatic\.com|cdnjs\.cloudflare|cdn\.jsdelivr|unpkg\.com|facebook\.net|hotjar|plausible\.io|fullstory|mixpanel|segment\.(?:com|io)/i;
for (const f of ['index.html', ...jsFiles, ...cssFiles]) {
    const src = text(f);
    const hit = BANNED.exec(src);
    if (hit) bad(`${f} mentions ${hit[0]} (a third party)`);
    if (/document\.cookie\s*=/.test(src)) bad(`${f} writes a cookie`);
    if (/@import\s+(?:url\()?['"]?https?:/i.test(src) || (f.endsWith('.css') && /url\(\s*['"]?https?:/i.test(src))) bad(`${f} loads a file from another origin`);
    if (f.endsWith('.js') && /\b(?:fetch\(|\.src\s*=|new Worker\()\s*['"`]https?:/.test(src)) bad(`${f} loads a file from another origin`);
}
for (const m of htmlText.matchAll(/<(script|link|img|iframe|source|video|audio)\b[^>]*?\b(?:src|href)="(https?:\/\/[^"]+)"[^>]*>/g)) {
    if (new URL(m[2]).origin !== ORIGIN) bad(`index.html: <${m[1]}> loads ${m[2]} from another origin`);
}

/* what has to ship with the fonts, the share image, GitHub Pages */
for (const name of ['jersey-10', 'atkinson-hyperlegible-next', 'jetbrains-mono', 'mr-dafoe']) {
    const f = `fonts/OFL-${name}.txt`;
    if (!exact.has(f)) bad(`${f} is missing (the fonts' licence asks for it)`);
}
if (!exact.has('og-image.jpg')) bad('og-image.jpg is missing');
else {
    const buf = readFileSync(join(site, 'og-image.jpg'));
    let size = null;
    for (let i = 2; i + 9 < buf.length && buf[0] === 0xff && buf[1] === 0xd8;) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) { size = { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) }; break; }
        i += 2 + buf.readUInt16BE(i + 2);
    }
    if (!size || size.w !== 1200 || size.h !== 630) bad(`og-image.jpg is ${size ? `${size.w} x ${size.h}` : 'not a JPEG'}, not 1200 x 630`);
}
if (existsSync(join(site, 'CNAME'))) {                                  // this is the repository root: GitHub Pages builds it with Jekyll
    if (!existsSync(join(site, '_config.yml'))) bad('_config.yml is missing: Jekyll would publish docs/ and README.md');
    else for (const name of ['README.md', 'docs']) if (!new RegExp(`^\\s*-\\s*${name}\\s*$`, 'm').test(text('_config.yml'))) bad(`_config.yml does not exclude ${name}`);
}

console.log(`${checked} references checked`);
if (problems.length) {
    console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
}
console.log(CHECK ? 'the site is up to date and clean' : 'done: the site is up to date and clean');
