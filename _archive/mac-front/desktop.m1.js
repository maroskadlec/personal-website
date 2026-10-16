/* ==========================================================================
   DESKTOP — M1 skeleton: menu bar, a few icons and one window, all static.
   M2 turns these into real components (window manager, drag, menus).
   ========================================================================== */
import { Icons } from '../gfx/icons.js';

const icon = ({ id, label, art, style, cls = '' }) =>
    `<div class="icon ${cls}" data-id="${id}" style="${style}" tabindex="0">` +
    `<span class="icon-art-slot">${art}</span><span class="icon-label">${label}</span></div>`;

function startClock(el) {
    const tick = () => {
        el.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 20000);
}

export function buildDesktop(screen, { portrait = null } = {}) {
    let os = screen.querySelector('.os');
    if (os) return os;

    os = document.createElement('div');
    os.className = 'os';
    os.innerHTML = `
        <div class="menubar" role="menubar">
            <div class="mb-item mb-logo" aria-label="Marian menu">${Icons.pear('mb-pear')}</div>
            <div class="mb-item">File</div>
            <div class="mb-item">Edit</div>
            <div class="mb-item">View</div>
            <div class="mb-item">Label</div>
            <div class="mb-item">Special</div>
            <div class="mb-right"><span class="mb-clock" id="mbClock"></span></div>
        </div>
        <div class="desktop" id="desktop">
            ${icon({ id: 'me', label: 'Marian Kadlec', art: Icons.doc('icon-art'), style: 'left: 22px; top: 20px;', cls: 'icon--hero' })}
            ${icon({ id: 'projects', label: 'Projects', art: Icons.folder('icon-art'), style: 'left: 22px; top: 116px;' })}
            ${icon({ id: 'hd', label: 'Macintosh HD', art: Icons.disk('icon-art'), style: 'right: 14px; top: 14px;' })}
            ${icon({ id: 'trash', label: 'Trash', art: Icons.trash('icon-art'), style: 'right: 14px; bottom: 16px;' })}

            <section class="win win--readme is-active" aria-label="Read Me">
                <div class="win-title"><i class="win-close"></i><span>Read Me</span><i class="win-zoom"></i></div>
                <div class="win-body">
                    <h2>Welcome to Marian OS</h2>
                    <p>This computer holds the portfolio of <b>Marian Kadlec</b>, a senior digital designer from Prague with 15+ years of making products look and work better.</p>
                    <ul>
                        <li>Double-click <b>Marian Kadlec</b> to begin.</li>
                        <li>Press <b>F</b> to fill the whole screen.</li>
                    </ul>
                    <p>Funnily enough, I often ended up working on redesigns.</p>
                    <div class="sb"><i class="sb-btn up"></i><i class="sb-thumb"></i><i class="sb-btn down"></i></div>
                </div>
                <i class="grow"></i>
            </section>
        </div>`;
    screen.appendChild(os);

    if (portrait) {
        portrait.classList.add('icon-art');
        os.querySelector('[data-id="me"] .icon-art-slot').replaceChildren(portrait);
    }
    startClock(os.querySelector('#mbClock'));
    return os;
}
