/* ==========================================================================
   THE 2008 WEBSITE — six pages, built from the shared content (js/content/*),
   so the Desktop, this old-school site and the Terminal never disagree.
   Only the look is 2008. The Browser (browser.js) shows these pages.
   ========================================================================== */
import { profile, skills, career, links, work, services, process, whyme, contact, illustration } from '../../../content/index.js';
import { esc, rich } from '../../../core/util.js';

export const SITE = 'http://www.mariankadlec.cz';           // only what the 2008 address bar shows

const NAV = [
    ['/', 'Home'],
    ['/services.html', 'Services'],
    ['/process.html', 'Process'],
    ['/why-me.html', 'Why me'],
    ['/work.html', 'Work'],
    ['/contact.html', 'Contact']
];

const pic = (file) => (file ? `<img src="${esc(illustration(file, 224))}" alt="" width="96" height="96" loading="lazy" draggable="false">` : '');

function frame(path, inner) {
    return `<div class="w8-frame">
        <header class="w8-hero">
            <img src="${esc(profile.photo)}" alt="Portrait of ${esc(profile.name)}" width="86" height="86" draggable="false">
            <div>
                <p class="w8-kicker">${esc(profile.kicker)}</p>
                <h1 class="w8-name">${esc(profile.name)}</h1>
                <p class="w8-title">${esc(profile.title)}</p>
                <p class="w8-tag">${profile.tagline.map((l) => `<span>${esc(l)}</span>`).join('')}</p>
            </div>
        </header>
        <table class="w8-nav" role="presentation"><tr>${NAV.map(([p, label]) =>
            `<td><a href="#" data-nav="${p}"${p === path ? ' aria-current="page"' : ''}>${label}</a></td>`).join('')}</tr></table>
        ${inner}
        <span class="w8-counter">You are visitor Nº 001337</span>
        <span class="w8-best">⭐ Best viewed in Internet Explorer 6 at 1024×768 resolution ⭐</span>
        <footer class="w8-foot">© ${new Date().getFullYear()} ${esc(profile.name)} - made with vibe coding.</footer>
    </div>`;
}

const section = (title, body) => `<section class="w8-sec"><h2 class="w8-h">${esc(title)}</h2>${body}</section>`;
const card = (it, label = '') => `<article class="w8-card">${pic(it.image)}<div><h3 class="w8-ct">${esc(label + it.title)}</h3><p>${esc(it.text)}</p></div></article>`;
const linkBtn = (l) => `<a class="w8-btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}<span class="sr-only"> (opens in a new tab)</span></a>`;

const home = () => frame('/',
    section('About', profile.about.map((p) => `<p class="w8-p">${p.ai ? '<span class="w8-new">NEW!</span>' : ''}${esc(p.text)}</p>`).join('')) +
    section('What I do', skills.map((g) => `<p class="w8-sub">${esc(g.group)}/</p><ul class="w8-skills">${g.items.map((i) => `<li>${rich(i)}</li>`).join('')}</ul>`).join('')) +
    section('Selected clients & products', `<ul class="w8-chips">${career.companies.map((c) => `<li>${esc(c.name)}</li>`).join('')}</ul>`));

const servicesPage = () => frame('/services.html',
    section(services.title, `<p class="w8-p">${esc(services.intro)}</p>${services.items.map((it) => card(it)).join('')}`));

const processPage = () => frame('/process.html',
    section(process.title, `<p class="w8-p">${esc(process.intro)}</p>${process.items.map((it, i) => card(it, `${i + 1}. `)).join('')}`));

const whymePage = () => frame('/why-me.html',
    section(whyme.title, `<p class="w8-p">${esc(whyme.intro)}</p>${whyme.items.map((it) => card(it)).join('')}`));

const workPage = () => {
    const j = work.journey;
    const tags = (list) => `<ul class="w8-chips">${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    const fig = (file) => `<figure class="w8-fig"><img src="${esc(illustration(file))}" alt="" width="260" height="260" loading="lazy" draggable="false"></figure>`;
    return frame('/work.html',
        section(j.title,
            `<p class="w8-p">${esc(j.intro)}</p>${tags(j.industries)}<p class="w8-p">${esc(j.setups)}</p>${fig(j.images.portfolio)}` +
            `<p class="w8-p">${esc(j.process)}</p>${tags(j.skills)}<p class="w8-p">${esc(j.scale)}</p>${fig(j.images.redesign)}` +
            `<p class="w8-p"><b>${esc(j.closing)}</b></p>`) +
        section('Selected Work and Professional Experience', work.roles.map((r) =>
            `<article class="w8-card">${pic(r.image)}<div><h3 class="w8-ct">${esc(r.role)}</h3>` +
            `<p class="w8-meta"><a href="#" data-open="${r.id}">${esc(r.company)}</a> · ${esc(r.years)}</p>` +
            `${r.text.map((t) => `<p>${esc(t)}</p>`).join('')}</div></article>`).join('')));
};

const contactPage = () => frame('/contact.html',
    section('Contact',
        `<p class="w8-p"><b>status:</b> ${esc(contact.status)} — ${esc(contact.offers)}</p>` +
        `<p class="w8-p"><b>response time:</b> ${esc(contact.response)}</p>` +
        `<div class="w8-btns"><a class="w8-btn" href="mailto:${esc(contact.email)}">E-mail me</a>${links.map(linkBtn).join('')}</div>`));

export const PAGES = {
    '/': { title: 'Marian Kadlec', render: home },
    '/services.html': { title: 'Services - Marian Kadlec', render: servicesPage },
    '/process.html': { title: 'Process - Marian Kadlec', render: processPage },
    '/why-me.html': { title: 'Why me - Marian Kadlec', render: whymePage },
    '/work.html': { title: 'Work - Marian Kadlec', render: workPage },
    '/contact.html': { title: 'Contact - Marian Kadlec', render: contactPage }
};
