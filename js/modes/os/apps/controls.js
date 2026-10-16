/* ==========================================================================
   CONTROL PANELS — General Controls, Monitors, Desktop Patterns and Sound.
   Each panel is a small fixed window of real form controls (checkboxes, radio
   buttons, sliders drawn in System 7 style) bound to Settings. Changes apply
   at once, like on the real thing; there is no Save button.
   ========================================================================== */
import { Settings } from '../../../core/settings.js';
import { Sound } from '../../../core/sound.js';
import { esc } from '../../../core/util.js';

/* ---------- desktop patterns: 1-bit tiles, drawn as tiny SVG so they stay crisp ---------- */
function tile(rows, colors, scale = 1) {
    const h = rows.length;
    const w = rows[0].length;
    let rects = '';
    rows.forEach((row, y) => {
        [...row].forEach((c, x) => {
            if (c !== '.' && colors[c]) rects += `<rect x='${x}' y='${y}' width='1' height='1' fill='${colors[c].replace('#', '%23')}'/>`;
        });
    });
    const bg = colors['.'] ? `<rect width='${w}' height='${h}' fill='${colors['.'].replace('#', '%23')}'/>` : '';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' shape-rendering='crispEdges'>${bg}${rects}</svg>`;
    return `url("data:image/svg+xml,${svg.replace(/"/g, "'")}") 0 0 / ${w * scale}px ${h * scale}px`;
}

const A = '#9a9a9a';
const B = '#c9c9c9';
export const PATTERNS = [
    { id: 'dither', name: 'Dither', css: `conic-gradient(${A} 25%, ${B} 0 50%, ${A} 0 75%, ${B} 0) 0 0 / 2px 2px` },
    { id: 'gray', name: 'Gray', css: '#b4b4b4' },
    { id: 'lines', name: 'Lines', css: tile(['k', '.'], { k: A, '.': B }, 1) },
    { id: 'diagonal', name: 'Diagonal', css: tile(['k...', '.k..', '..k.', '...k'], { k: '#8c8c8c', '.': '#d4d4d4' }, 2) },
    { id: 'dots', name: 'Dots', css: tile(['kk......', 'kk......', '........', '........', '....kk..', '....kk..', '........', '........'], { k: '#707070', '.': '#d0d0d0' }, 1) },
    { id: 'bricks', name: 'Bricks', css: tile(['kkkkkkkk', '...k....', '...k....', '...k....', 'kkkkkkkk', '.......k', '.......k', '.......k'], { k: '#8a8a8a', '.': '#c4c4c4' }, 1) },
    { id: 'weave', name: 'Weave', css: tile(['kk..', 'k.k.', '..kk', '.k.k'], { k: '#808080', '.': '#cfcfcf' }, 2) },
    {
        id: 'pear', name: 'Pears',
        css: tile([
            '....................', '....................', '....................', '.........s..........', '.........st.........',
            '........ttt.........', '.......ttttt........', '........ttt.........', '.......ttttt........', '......ttttttt.......',
            '......ttttttt.......', '......ttttttt.......', '.......ttttt........', '........ttt.........', '....................',
            '....................', '....................', '....................', '....................', '....................'
        ], { t: '#20b2aa', s: '#6b5232', '.': '#cdcdcd' }, 1)
    },
    { id: 'night', name: 'Night', css: 'conic-gradient(#262626 25%, #363636 0 50%, #262626 0 75%, #363636 0) 0 0 / 2px 2px' }
];
export const patternCSS = (id) => (PATTERNS.find((p) => p.id === id) || PATTERNS[0]).css;

/* ---------- small control builders (real inputs, drawn by CSS) ---------- */
const checkbox = (id, label, on) =>
    `<label class="chk"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><span class="chk-box"></span><span>${esc(label)}</span></label>`;
const radio = (name, value, label, on) =>
    `<label class="rad"><input type="radio" name="${name}" value="${esc(value)}"${on ? ' checked' : ''}><span class="rad-dot"></span><span>${esc(label)}</span></label>`;
const group = (title, body) => `<fieldset class="cp-group"><legend>${esc(title)}</legend>${body}</fieldset>`;

const PANELS = {
    general: {
        title: 'General Controls',
        w: 340,
        h: 488,
        build(root) {
            root.innerHTML =
                group('Time', radio('clock', '12', '12 hour', !Settings.get('clock24')) + radio('clock', '24', '24 hour', Settings.get('clock24'))) +
                group('Moving windows', radio('drag', 'outline', 'Move an outline', !Settings.get('liveDrag')) + radio('drag', 'live', 'Show the window while moving', Settings.get('liveDrag'))) +
                group('Menus', checkbox('blink', 'Blink the menu item you choose', Settings.get('menuBlink'))) +
                group('Screen saver',
                    [[0, 'Never'], [1, 'After 1 minute'], [3, 'After 3 minutes'], [5, 'After 5 minutes']]
                        .map(([m, label]) => radio('saver', String(m), label, Settings.get('saver') === m)).join(''));
            root.addEventListener('change', (e) => {
                const t = e.target;
                if (t.name === 'clock') Settings.set('clock24', t.value === '24');
                else if (t.name === 'drag') Settings.set('liveDrag', t.value === 'live');
                else if (t.name === 'saver') Settings.set('saver', Number(t.value));
                else if (t.id === 'blink') Settings.set('menuBlink', t.checked);
                Sound.click();
            });
        }
    },

    monitors: {
        title: 'Monitors',
        w: 340,
        h: 236,
        build(root) {
            root.innerHTML =
                group('Brightness',
                    `<div class="sld-row"><span class="sld-end" aria-hidden="true">dim</span><input class="sld" type="range" id="bright" min="40" max="100" step="1" value="${Settings.get('brightness')}" aria-label="Brightness"><span class="sld-end" aria-hidden="true">bright</span></div>` +
                    `<p class="cp-note" id="brightVal">${Settings.get('brightness')}%</p>`) +
                group('The glass', checkbox('glass', 'Scanlines and a soft vignette', Settings.get('glass')));
            const val = root.querySelector('#brightVal');
            root.querySelector('#bright').addEventListener('input', (e) => {
                Settings.set('brightness', Number(e.target.value));
                val.textContent = e.target.value + '%';
            });
            root.querySelector('#glass').addEventListener('change', (e) => { Settings.set('glass', e.target.checked); Sound.click(); });
        }
    },

    patterns: {
        title: 'Desktop Patterns',
        w: 368,
        h: 322,
        build(root) {
            const cur = Settings.get('pattern');
            root.innerHTML =
                `<p class="cp-lead">Pick what the desktop is made of.</p>
                <div class="pat-grid" role="radiogroup" aria-label="Desktop pattern"></div>
                <p class="cp-note" id="patName">${esc((PATTERNS.find((p) => p.id === cur) || PATTERNS[0]).name)}</p>`;
            const grid = root.querySelector('.pat-grid');
            PATTERNS.forEach((p) => {
                const b = document.createElement('button');
                b.className = 'pat';
                b.type = 'button';
                b.setAttribute('role', 'radio');
                b.setAttribute('aria-checked', String(p.id === cur));
                b.setAttribute('aria-label', p.name);
                b.dataset.id = p.id;
                b.style.background = p.css;               // set on the element: the value contains quotes
                grid.appendChild(b);
            });
            const name = root.querySelector('#patName');
            root.addEventListener('click', (e) => {
                const b = e.target.closest('.pat');
                if (!b) return;
                root.querySelectorAll('.pat').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
                Settings.set('pattern', b.dataset.id);
                name.textContent = b.getAttribute('aria-label');
                Sound.click();
            });
        }
    },

    sound: {
        title: 'Sound',
        w: 340,
        h: 316,
        build(root, win) {
            root.innerHTML =
                group('System volume',
                    `<div class="sld-row"><span class="sld-end" aria-hidden="true">0</span><input class="sld sld--ticks" type="range" id="vol" min="0" max="7" step="1" value="${Settings.get('volume')}" aria-label="System volume"><span class="sld-end" aria-hidden="true">7</span></div>` +
                    checkbox('mute', 'Sound off', Sound.muted)) +
                group('Alert sound',
                    radio('alert', 'beep', 'Simple Beep', Settings.get('alert') === 'beep') +
                    radio('alert', 'boing', 'Boing', Settings.get('alert') === 'boing') +
                    radio('alert', 'bleep', 'Bleep', Settings.get('alert') === 'bleep'));
            const vol = root.querySelector('#vol');
            vol.addEventListener('input', () => Settings.set('volume', Number(vol.value)));
            vol.addEventListener('change', () => { Sound.unlock(); Sound.click(); });
            const mute = root.querySelector('#mute');
            mute.addEventListener('change', () => { Sound.unlock(); Sound.setMuted(mute.checked); });
            const sync = () => { mute.checked = Sound.muted; };
            document.addEventListener('mk:sound', sync);
            win.cleanup = () => document.removeEventListener('mk:sound', sync);       // the tray can switch sound too
            root.addEventListener('change', (e) => {
                if (e.target.name !== 'alert') return;
                Settings.set('alert', e.target.value);
                Sound.unlock();
                Sound.beep(e.target.value);
            });
        }
    }
};

export function openControl(sys, panel, { from } = {}) {
    const def = PANELS[panel];
    if (!def) return null;
    const win = sys.openWindow({
        id: 'cp:' + panel,
        title: def.title,
        kind: 'control',
        mem: 240,
        w: def.w,
        h: def.h,
        scroll: false,
        resizable: false,
        from,
        onClose: (w) => w.cleanup && w.cleanup()
    });
    if (!win || win.built) return win;
    win.built = true;
    const root = document.createElement('div');
    root.className = 'cp';
    win.scroller.appendChild(root);
    def.build(root, win);
    return win;
}
