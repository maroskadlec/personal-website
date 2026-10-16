#!/usr/bin/env node
/* ==========================================================================
   SEO — writes the portfolio as plain text into index.html.

   This computer builds its pages with JavaScript, so without it (or in a browser too old
   for it) there would be nothing to read, and a search engine would see an empty shell.
   This tool reads the same files the Desktop and the Terminal read (js/content/*) and
   writes the whole portfolio as a simple document:

     <article id="seo">   between  <!-- seo:start --> and <!-- seo:end -->
     the JSON-LD "knowsAbout" list (the skills) inside the existing schema.org block

   With the machine running, that text stays in the page for search engines, hidden from the
   eye and from screen readers (they use the Desktop or the Terminal). Without JavaScript, in
   an old browser, or if the machine does not start, css/plain.css shows it as the page itself.

   Run from anywhere:   node _tools/seo.mjs
   Check only:          node _tools/seo.mjs --check
   Run it again whenever a text in js/content/* changes.
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { profile, skills, ai, links, work, services, process as steps, whyme, contact } from '../js/content/index.js';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = join(site, 'index.html');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');           // **word** is the one piece of markup the content uses
const cap = (s) => (s === 'ai' ? 'AI' : s.charAt(0).toUpperCase() + s.slice(1));       // "ai" is an acronym, not a word
const ul = (items) => `<ul>\n${items.map((t) => `            <li>${t}</li>`).join('\n')}\n        </ul>`;
const paras = (list) => list.map((t) => `        <p>${t}</p>`).join('\n');

const plainNote = 'This is the plain text version of the portfolio. The interactive one is a computer, with a Desktop and a Terminal. It needs JavaScript and a recent browser (the last versions of Chrome, Edge, Firefox or Safari; on iPhone and iPad iOS 16.4 or newer).';

const sections = [];

/* ---- who ---- */
const header = `    <header>
        <img src="${esc(profile.photo)}" alt="Portrait of ${esc(profile.name)}" width="444" height="560">
        <h1>${esc(profile.name)}</h1>
        <p class="lead">${esc(profile.title)}</p>
        <p>${profile.tagline.map(esc).join(' ')}</p>
        <p class="meta">${esc(profile.place)} · ${esc(profile.years)}+ years in digital design · <a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></p>
    </header>`;

/* ---- about ---- */
sections.push(`    <section>
        <h2>About</h2>
${paras(profile.about.map((a) => rich(a.text)))}
    </section>`);

/* ---- skills ---- */
sections.push(`    <section>
        <h2>Skills</h2>
${skills.map((g) => `        <h3>${esc(cap(g.group))}</h3>\n        ${ul(g.items.map(rich))}`).join('\n')}
    </section>`);

/* ---- AI ---- */
sections.push(`    <section>
        <h2>How AI fits in</h2>
        <p>${esc(ai.lead)}</p>
        <ol>
${ai.workflow.map((w) => `            <li><strong>${esc(cap(w.stage))}:</strong> ${rich(w.text)}</li>`).join('\n')}
        </ol>
        <p>Delivery: ${esc(ai.delivery)}. Result: ${esc(ai.result.text)}, ${esc(ai.result.gain)}.</p>
    </section>`);

/* ---- work ---- */
const j = work.journey;
sections.push(`    <section>
        <h2>${esc(j.title)}</h2>
        <p>${esc(j.intro)} ${esc(j.industries.join(', '))}.</p>
        <p>${esc(j.setups)}</p>
        <p>${esc(j.process)}</p>
        <p>${esc(j.scale)}</p>
        <p>${esc(j.closing)}</p>
        <h3>Skills</h3>
        ${ul(j.skills.map(esc))}
${work.roles.map((r) => `        <h3>${esc(r.name)}: ${esc(r.role)}, ${esc(r.years)}</h3>\n${paras(r.text.map(esc))}`).join('\n')}
    </section>`);

/* ---- what is offered ---- */
const cards = (list) => list.items.map((i) => `        <h3>${esc(i.title)}</h3>\n        <p>${esc(i.text)}</p>`).join('\n');
sections.push(`    <section>
        <h2>${esc(services.title)}</h2>
        <p>${esc(services.intro)}</p>
${cards(services)}
    </section>`);
sections.push(`    <section>
        <h2>${esc(steps.title)}</h2>
        <p>${esc(steps.intro)}</p>
${cards(steps)}
    </section>`);
sections.push(`    <section>
        <h2>${esc(whyme.title)}</h2>
        <p>${esc(whyme.intro)}</p>
${cards(whyme)}
    </section>`);

/* ---- contact ---- */
sections.push(`    <section>
        <h2>Contact</h2>
        <p>Availability: ${esc(contact.status)} for ${esc(contact.offers)}. Response time: ${esc(contact.response)}.</p>
        <ul>
            <li><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></li>
${links.map((l) => `            <li><a href="${esc(l.url)}">${esc(l.label)}</a></li>`).join('\n')}
        </ul>
    </section>`);

const article = `<article id="seo" role="main">
    <div class="plain-only">
        <p>${esc(plainNote)}</p>
        <p class="plain-back"><a href="./">Open the interactive version</a></p>
    </div>
${header}
${sections.join('\n')}
</article>`;

const START = '<!-- seo:start (made by _tools/seo.mjs from js/content/*, do not edit by hand) -->';
const END = '<!-- seo:end -->';
const quote = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let html = readFileSync(htmlPath, 'utf8');
const original = html;

/* the article */
const block = new RegExp(`[ \\t]*${quote(START)}[\\s\\S]*?${quote(END)}`);
if (!block.test(html)) { console.error('index.html has no seo block: put the two marker comments where the text should go.'); process.exit(1); }
const indented = `    ${START}\n${article.split('\n').map((l) => (l ? '    ' + l : l)).join('\n')}\n    ${END}`;
html = html.replace(block, () => indented);

/* the skills in the schema.org block (the other fields stay as they are written in index.html) */
const ld = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/;
const m = html.match(ld);
if (!m) { console.error('index.html has no JSON-LD block.'); process.exit(1); }
const data = JSON.parse(m[2]);
const next = {};
Object.keys(data).forEach((k) => {
    if (k === 'knowsAbout') return;
    next[k] = data[k];
    if (k === 'description') next.knowsAbout = work.journey.skills;
});
if (!next.knowsAbout) next.knowsAbout = work.journey.skills;
const json = JSON.stringify(next, null, 4).split('\n').map((l) => '    ' + l).join('\n');
html = html.replace(ld, (all, open, body, close) => `${open}\n${json}\n    ${close}`);

const text = article.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
if (process.argv.includes('--check')) {
    if (html !== original) { console.error('The plain text in index.html is out of date: run _tools/seo.mjs'); process.exit(1); }
    console.log(`The plain text in index.html is up to date (${text.split(' ').length} words).`);
} else {
    if (html !== original) writeFileSync(htmlPath, html);
    console.log(`${text.split(' ').length} words written to index.html${html !== original ? '' : ' (no change)'}`);
}
