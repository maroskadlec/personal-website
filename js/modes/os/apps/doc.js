/* ==========================================================================
   DOCUMENT WINDOWS — text you read, starting with the Read Me.
   Content comes from js/content/*, so both modes tell the same story.
   ========================================================================== */
import { profile, links, services, process as steps, commands, illustration } from '../../../content/index.js';
import { esc } from '../../../core/util.js';

/** a document of cards: a small picture and its words, one after another (Services, Process) */
const cards = (heading, intro, items, tag = 'ul') =>
    `<div class="dc"><div class="dc-in">
        <h2>${esc(heading)}</h2>
        <p class="dc-intro">${esc(intro)}</p>
        <${tag} class="dc-list">${items.map((it) =>
            `<li class="dc-item">
                <img class="dc-pic" src="${esc(illustration(it.image, 224))}" alt="" width="104" height="104" loading="lazy" draggable="false">
                <div class="dc-text"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>
            </li>`).join('')}
        </${tag}>
    </div></div>`;

const pretty = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const row = (href, label, shown, external) =>
    `<li><a class="dl-row" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}><span class="dl-label">${esc(label)}</span><span class="dl-url">${esc(shown)}</span>${external ? '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a></li>`;

const DOCS = {
    readme: () => ({
        title: 'Read Me',
        w: 440,
        h: 400,
        mem: 320,
        html:
            `<div class="win-body">
                <h2>Welcome to Marian OS</h2>
                <p>This computer holds the portfolio of <b>${esc(profile.name)}</b>, a senior digital designer from Prague with 15+ years of making products look and work better.</p>
                <h3>Getting around</h3>
                <ul>
                    <li>Double-click an icon to open it. Drag icons and windows around, and drop things on the Trash.</li>
                    <li>Open <b>Marian Kadlec</b> for the 2008 version of this website, and <b>Projects</b> for the work itself.</li>
                    <li>Double-click the title bar of a window to roll it up.</li>
                    <li>The menus work. Try <b>File</b>, <b>View</b> and <b>Special</b>.</li>
                    <li>Switch between <b>Desktop</b> and <b>Terminal</b> with the <b>Desktop | Terminal</b> switch, or press <kbd>\`</kbd> on a keyboard. The <b>Commands</b> file lists everything the Terminal understands.</li>
                    <li>On a keyboard: arrows walk between icons, <kbd>Enter</kbd> opens, <kbd>F2</kbd> renames, <kbd>Delete</kbd> throws away and <kbd>Esc</kbd> closes a window.</li>
                </ul>
                <p>Funnily enough, I often ended up working on redesigns.</p>
            </div>`
    }),

    services: () => ({ title: 'Services', w: 540, h: 470, mem: 520, html: cards(services.title, services.intro, services.items) }),

    process: () => ({ title: 'Process', w: 540, h: 470, mem: 480, html: cards(steps.title, steps.intro, steps.items, 'ol') }),

    commands: () => ({
        title: 'Commands',
        w: 520,
        h: 500,
        mem: 340,
        html:
            `<div class="dc"><div class="dc-in">
                <h2>${esc(commands.title)}</h2>
                <p class="dc-intro">${esc(commands.intro)}</p>
                ${commands.groups.map((g) =>
                    `<h3 class="cmd-h">${esc(g.title)}</h3>
                    <dl class="cmds">${g.items.map((it) =>
                        `<dt>${esc(it.cmd)}${it.alias ? `<span class="cmd-alias"> · ${esc(it.alias)}</span>` : ''}</dt><dd>${esc(it.note)}</dd>`).join('')}</dl>`).join('')}
                <p class="cmd-keys">${esc(commands.keys)}</p>
                <p class="cmd-secret">${esc(commands.secret)}</p>
            </div></div>`
    }),

    links: () => ({
        title: 'Links',
        w: 440,
        h: 418,
        mem: 280,
        html:
            `<div class="dc"><div class="dc-in">
                <h2>Links</h2>
                <ul class="dl-list">${links.map((l) => row(l.url, l.label, pretty(l.url), true)).join('')}${row('mailto:' + profile.email, 'E-mail', profile.email, false)}</ul>
            </div></div>`
    })
};

export function openDoc(sys, ref, { from } = {}) {
    const make = DOCS[ref];
    if (!make) return null;
    const d = make();
    return sys.openWindow({
        id: 'doc:' + ref,
        title: d.title,
        kind: 'doc',
        mem: d.mem,
        w: d.w,
        h: d.h,
        minW: 260,
        minH: 160,
        scroll: true,
        resizable: true,
        fit: true,                 // the zoom box fits the text, not the whole desktop
        idealW: 540,
        content: d.html,
        from
    });
}
