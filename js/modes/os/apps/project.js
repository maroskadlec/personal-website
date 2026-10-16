/* ==========================================================================
   PROJECT WINDOWS — one per role: the client's token, what the role was and
   when, and the story in the words of the previous site.
   The first time a project opens in a visit its token "glows up": it arrives
   as the chunky dithered icon you double-clicked and resolves in three steps
   (more pixels, more colours) to the real picture, about half a second.
   Content comes from js/content/work.js, the same data the 2008 website shows.
   ========================================================================== */
import { work, illustration } from '../../../content/index.js';
import { Assets } from '../../../core/assets.js';
import { Sound } from '../../../core/sound.js';
import { Store } from '../../../core/store.js';
import { esc, reducedMotion, sleep } from '../../../core/util.js';
import { FS } from '../fs.js';

const STEP = 140;                  // ms for each step of the glow-up

async function glowUp(win, role) {
    const coin = win.el.querySelector('.pj-coin');
    const px = coin.querySelector('.pj-px');
    const lit = () => coin.classList.add('is-lit');
    const data = await Assets.coin(role.image);
    if (win.closed) return;
    if (!data) { lit(); return; }                                // the picture could not be made: just show the real one
    Sound.glow(STEP / 1000);
    for (const frame of data.frames) {
        px.src = frame;
        px.hidden = false;
        await sleep(STEP);
        if (win.closed) return;
    }
    await coin.querySelector('.pj-full').decode().catch(() => {});      // never swap to a picture that is not there yet
    if (!win.closed) lit();
}

export function openProject(sys, node, { from } = {}) {
    const t = FS.resolve(node);
    const role = work.roles.find((r) => r.id === t.id);
    if (!role) return null;

    const seen = Store.sget('glowSeen', []);                       // a restart of the machine forgets this (os.js reset)
    const glow = !!role.image && !reducedMotion() && !seen.includes(role.id);
    const now = role.image ? Assets.coinNow(role.image) : null;
    const first = glow && now ? now.frames[0] : '';
    let off = null;

    const win = sys.openWindow({
        id: 'project:' + role.id,
        title: t.name,
        kind: 'project',
        mem: 760,
        w: 560,
        h: 500,
        minW: 300,
        minH: 220,
        scroll: true,
        resizable: true,
        fit: true,                  // the zoom box fits the text, not the whole desktop
        idealW: 600,
        from,
        content:
            `<div class="pj">
                <div class="pj-in">
                    <div class="pj-top">
                        ${role.image
                            ? `<div class="pj-coin${glow ? ' is-glow' : ''}">
                            <img class="pj-full" src="${esc(illustration(role.image))}" alt="${esc(role.name)} logo" width="256" height="256" draggable="false">
                            <img class="pj-px"${first ? ` src="${first}"` : ' hidden'} alt="" aria-hidden="true" draggable="false">
                        </div>`
                            : ''}
                        <div class="pj-head">
                            <h2 class="pj-name">${esc(role.name)}</h2>
                            <p class="pj-role">${esc(role.role)}</p>
                            <p class="pj-meta">${esc(role.company)} · ${esc(role.years)}</p>
                        </div>
                    </div>
                    <div class="pj-text">${role.text.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
                </div>
            </div>`,
        onClose: () => off?.()
    });
    if (!win || win.drawn) return win;                                      // already open: it just came to the front
    win.drawn = true;

    // the window is called what its icon is called
    off = FS.on(() => {
        const n = FS.node(role.id);
        if (!n) win.close({ quiet: true });
        else if (n.name !== win.title) win.setTitle(n.name);
    });

    if (glow) {
        Store.sset('glowSeen', [...seen, role.id]);
        glowUp(win, role);
    }
    return win;
}
