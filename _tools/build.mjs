#!/usr/bin/env node
/* ==========================================================================
   BUILD — the one command to run before a commit.

   There is no build step for the browser: the files are served as they are. But a few things in
   index.html are made from the sources and must be kept in step with them:

     1. the portfolio as plain text, and the skills in the JSON-LD            (seo.mjs)
     2. file fingerprints. GitHub Pages lets a browser keep any file for 10 minutes and the files
        keep their names after every deploy, so a visitor could get a new page with old modules.
        Every .js and .css file gets ?v=<10 characters of its SHA-256> wherever it is loaded:
          the import map (every module, wherever it is imported from)    importmap:start / :end
          the list of modules fetched at start                           modulepreload:start / :end
          the <link rel=stylesheet> tags, the <script src> of GSAP, the loader's main.src,
          and the two loadCss('css/cli.css') in js/main.js
        Fonts and images are not fingerprinted: when one changes, give it a new name.
     3. with --release: today's date in BUILD_DATE (js/content/desktop.js, what Get Info shows)
        and in sitemap.xml.

   Then it checks the site. It fails (exit 1) when:
     - a file referenced by the HTML, the CSS, the manifest or the JavaScript does not exist, has the wrong
       letter case (GitHub Pages cares, macOS does not) or is not part of the site (see FILES and DIRS)
     - the site mentions mariankadlec.com (which does not exist), has a noindex, or its canonical,
       Open Graph address, JSON-LD, robots.txt and sitemap disagree with contact.site
     - a tracker, a font or script CDN or a cookie write is found, or a page loads something from another origin
     - the licences of the fonts, the 1200 x 630 og-image.jpg or the manifest are missing or broken

   Run from anywhere:   node _tools/build.mjs             write what is out of date, then check
                        node _tools/build.mjs --release   also set today's date
                        node _tools/build.mjs --check     write nothing; fail if anything is out of date or wrong
   ========================================================================== */
import { execFileSync } from 'node:child_process';
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

/* ---------------------------------------------------------- 1. the plain text version */
try {
    execFileSync(process.execPath, [join(here, 'seo.mjs'), ...(CHECK ? ['--check'] : [])], { stdio: 'inherit' });
} catch (e) {
    bad('index.html: the plain text version is out of date (run _tools/build.mjs)');
}

/* ---------------------------------------------------------- 3. the date of a release (before the fingerprints: desktop.js is fingerprinted too) */
if (RELEASE) {
    const now = new Date();
    const long = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Europe/Prague' });
    const iso = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Prague' });
    set('js/content/desktop.js', text('js/content/desktop.js').replace(/(export const BUILD_DATE = ')[^']*(';)/, `$1${long}$2`));
    set('sitemap.xml', text('sitemap.xml').replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${iso}</lastmod>`));
    console.log(`release date: ${long} (${iso})`);
}

/* ---------------------------------------------------------- 2. fingerprints */
const cssHash = {};
for (const f of siteFiles.filter((f) => f.startsWith('css/') && f.endsWith('.css'))) cssHash[f] = sha(readFileSync(join(site, f)));
if (!cssHash['css/cli.css']) bad('css/cli.css is missing');

/* main.js names css/cli.css (the Terminal's stylesheet is fetched later), so it is fingerprinted before the modules are */
const mainBefore = text('js/main.js');
const mainAfter = mainBefore.replace(/loadCss\('css\/cli\.css(\?v=[0-9a-f]+)?'\)/g, `loadCss('css/cli.css?v=${cssHash['css/cli.css']}')`);
if (mainAfter === mainBefore && !/loadCss\('css\/cli\.css\?v=/.test(mainBefore)) bad("js/main.js: no loadCss('css/cli.css') found to fingerprint");
set('js/main.js', mainAfter);

const jsFiles = siteFiles.filter((f) => f.startsWith('js/') && f.endsWith('.js')).sort();
const jsHash = {};
for (const f of jsFiles) jsHash[f] = sha(Buffer.from(text(f)));
const vendorHash = sha(readFileSync(join(site, 'vendor/gsap.min.js')));
const url = (f) => `${f}?v=${jsHash[f]}`;

/* the modules needed at start, in the order the browser would meet them (main.js names its imports, they name theirs) */
const order = [];
{
    const seen = new Set();
    const queue = ['js/main.js'];
    while (queue.length) {
        const f = queue.shift();
        if (seen.has(f)) continue;
        seen.add(f);
        if (!exact.has(f)) { bad(`${f} is imported but does not exist`); continue; }
        order.push(f);
        const re = /^\s*(?:import|export)\s[^;]*?from\s+['"](\.[^'"]+)['"]|^\s*import\s+['"](\.[^'"]+)['"]/gm;
        const src = text(f);
        let m;
        while ((m = re.exec(src))) queue.push(posix.normalize(posix.join(posix.dirname(f), m[1] || m[2])));
    }
}

const importmap = `    <!-- importmap:start (made by _tools/build.mjs, do not edit by hand) -->
    <script type="importmap">
    {
        "imports": {
${jsFiles.map((f) => `            "./${f}": "./${url(f)}"`).join(',\n')}
        }
    }
    </script>
    <!-- importmap:end -->`;

const preload = `    <!-- modulepreload:start (made by _tools/build.mjs, do not edit by hand) -->
    <script>
        /* the files the machine needs at start, fetched at once (not for the text version, which never runs them, nor where import maps are missing) */
        if (window.__mkSupported && window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports('importmap')) {
            [${order.map((f) => `'${url(f)}'`).join(', ')}].forEach(function (h) {
                var l = document.createElement('link');
                l.rel = 'modulepreload';
                l.href = h;
                document.head.appendChild(l);
            });
        }
    </script>
    <!-- modulepreload:end -->`;

function block(html, name, body) {
    const re = new RegExp(`[ \\t]*<!-- ${name}:start[^]*?<!-- ${name}:end -->`);
    if (!re.test(html)) { bad(`index.html has no <!-- ${name}:start --> ... <!-- ${name}:end --> markers`); return html; }
    return html.replace(re, () => body);                              // a function: "$" in the body is not special
}

let html = text('index.html');
html = block(html, 'importmap', importmap);
html = block(html, 'modulepreload', preload);
html = html.replace(/(<link rel="stylesheet" href=")(css\/[\w.-]+\.css)(\?v=[0-9a-f]+)?(")/g, (m, a, f, q, z) => {
    if (!cssHash[f]) { bad(`index.html links ${f}, which does not exist`); return m; }
    return `${a}${f}?v=${cssHash[f]}${z}`;
});
html = html.replace(/(<script src=")(vendor\/gsap\.min\.js)(\?v=[0-9a-f]+)?(")/, (m, a, f, q, z) => `${a}${f}?v=${vendorHash}${z}`);
html = html.replace(/(main\.src = ')(js\/main\.js)(\?v=[0-9a-f]+)?(')/, (m, a, f, q, z) => `${a}${f}?v=${jsHash['js/main.js']}${z}`);
if (!/main\.src = 'js\/main\.js\?v=/.test(html)) bad("index.html: the loader's main.src was not found");
if (!/<script src="vendor\/gsap\.min\.js\?v=/.test(html)) bad('index.html: the GSAP script tag was not found');
set('index.html', html);

/* ---------------------------------------------------------- write, or find out what is out of date */
const stale = [...want].filter(([rel, next]) => next !== readFileSync(join(site, rel), 'utf8')).map(([rel]) => rel);
if (CHECK) {
    if (stale.length) bad(`out of date: ${stale.join(', ')} (run _tools/build.mjs)`);
} else {
    for (const rel of stale) writeFileSync(join(site, rel), want.get(rel));
    console.log(stale.length ? `written: ${stale.join(', ')}` : 'nothing to write');
}
console.log(`${jsFiles.length} modules (${order.length} at start) and ${Object.keys(cssHash).length} stylesheets fingerprinted`);

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
for (const f of siteFiles.filter((f) => f.endsWith('.css'))) {
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
const runtime = ['index.html', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', ...jsFiles, ...siteFiles.filter((f) => f.endsWith('.css'))].filter((f) => exact.has(f));
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
for (const f of ['index.html', ...jsFiles, ...siteFiles.filter((f) => f.endsWith('.css'))]) {
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
for (const f of ['fonts/OFL-jersey-10.txt', 'fonts/OFL-atkinson-hyperlegible-next.txt', 'fonts/OFL-jetbrains-mono.txt']) {
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
