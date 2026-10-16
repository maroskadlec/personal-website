/* ==========================================================================
   DOG — a Greater Swiss Mountain Dog (a "Sennenhund"): black, with a white
   blaze on the face, rust brows and cheeks, a white chest, white socks and a
   white tip on a low tail. It follows the pointer around the Desktop, sits
   down when it gets there (the tail wags, the tongue comes out), scratches
   behind its ear now and then, and falls asleep when nothing happens.
   Pear menu > Dog switches it on and off. Original pixel art (16 x 16, shown
   at 2x with a thin black line and a white edge); the dog never catches clicks.
   ========================================================================== */
import { svg, pix } from '../../gfx/icons.js';
import { reducedMotion } from '../../core/util.js';

/* `k` coat, `h` the gloss on it, `r` rust, `w` white, `e` hazel (the eyes, and the ! when it notices you), `p` tongue */
const DOG = {
    sit0: [
        '................',
        '.....hhkkhh.....',
        '....krkwwkrk....',
        '..khkekwwkekhk..',
        '..khkkkwwkkkhk..',
        '..khrkkwwkkrhk..',
        '..kkkkwkkwkkkk..',
        '..k...wwww...k..',
        '.....kkwwkk.....',
        '....krwwwwrk....',
        '...kkrwwwwrkk...',
        '...kkrrwwrrkk...',
        '...kkrrkkrrkk...',
        '...kkwwkkwwkkkk.',
        '....www..www..w.',
        '................'
    ],
    sit1: [
        '................',
        '.....hhkkhh.....',
        '....krkwwkrk....',
        '..khkekwwkekhk..',
        '..khkkkwwkkkhk..',
        '..khrkkwwkkrhk..',
        '..kkkkwkkwkkkk..',
        '..k...wwpw...k..',
        '.....kkwpkk.....',
        '....krwwwwrk..w.',
        '...kkrwwwwrkk.k.',
        '...kkrrwwrrkk.k.',
        '...kkrrkkrrkkk..',
        '...kkwwkkwwkk...',
        '....www..www....',
        '................'
    ],
    scratch0: [
        '................',
        '.....hhkkhh.....',
        '....krkwwkrk....',
        '..khkekwwkekhk..',
        '..khkkkwwkkkhkww',
        '..khrkkwwkkrhkww',
        '..kkkkwkkwkkkkr.',
        '..k...wwww...kr.',
        '.....kkwwkk..kr.',
        '....krwwwwrkkk..',
        '...kkrwwwwrkkk..',
        '...kkrrwwrrkk...',
        '...kkrrkkrrkk...',
        '...kkwwkkwwkkkk.',
        '....www..www..w.',
        '................'
    ],
    scratch1: [
        '................',
        '.....hhkkhh.....',
        '....krkwwkrk....',
        '..khkekwwkekhk..',
        '..khkkkwwkkkhk..',
        '..khrkkwwkkrhkww',
        '..kkkkwkkwkkkkww',
        '..k...wwww...kr.',
        '.....kkwwkk..kr.',
        '....krwwwwrkkk..',
        '...kkrwwwwrkkk..',
        '...kkrrwwrrkk...',
        '...kkrrkkrrkk...',
        '...kkwwkkwwkkkk.',
        '....www..www..w.',
        '................'
    ],
    alert: [
        '................',
        '..kk.hhkkhh.kk.e',
        '..khkrkwwkrkhk.e',
        '..khkekwwkekhk..',
        '..khkkkwwkkkhk.e',
        '..k.rkkwwkkr.k..',
        '....kkwkkwkk....',
        '......wwww......',
        '.....kkwwkk.....',
        '....krwwwwrk....',
        '...kkrwwwwrkk...',
        '...kkrrwwrrkk...',
        '...kkrrkkrrkk...',
        '...kkwwkkwwkkkk.',
        '....www..www..w.',
        '................'
    ],
    run0: [
        '................',
        '................',
        '................',
        '............kkr.',
        '...........kkew.',
        '...hhhhh..hhhkwk',
        '..kkkkkkkkkkkrwk',
        'kkkkkkkkkkkkkrww',
        'kkkkkkkkkkwwwkw.',
        'w.kkkkkkkkwwww..',
        '...rrkkkkkrr....',
        '..rrrr...rrrr...',
        '.wwww.....wwww..',
        'wwwww.....wwwww.',
        '................',
        '................'
    ],
    run1: [
        '................',
        '................',
        '............kkr.',
        '...........kkew.',
        '...hhhhh..hhhkwk',
        '..kkkkkkkkkkkrwk',
        'kkkkkkkkkkkkkrww',
        'kkkkkkkkkkwwwkw.',
        'w.kkkkkkkkwwww..',
        '...rrkkkkkrr....',
        '...rrrrrr.rr....',
        '...wwwwww.ww....',
        '..wwwwwww.www...',
        '................',
        '................',
        '................'
    ],
    sleep0: [
        '................',
        '................',
        '................',
        '..........kkkk..',
        '............k...',
        '...........k....',
        '..........kkkk..',
        '................',
        '................',
        '......hhhhhhh...',
        '..wrkhhkkkkkkk.w',
        '..wkhkkkkkkkkkkk',
        '.wwkkkkkkkkkkkkk',
        'kwwwwrrkkkkrrrrk',
        '.wwwwww....wwww.',
        '................'
    ],
    sleep1: [
        '................',
        '...........kkkk.',
        '.............k..',
        '............k...',
        '...........kkkk.',
        '................',
        '................',
        '................',
        '................',
        '......hhhhhhh...',
        '..wrkhhkkkkkkk.w',
        '..wkhkkkkkkkkkkk',
        '.wwkkkkkkkkkkkkk',
        'kwwwwrrkkkkrrrrk',
        '.wwwwww....wwww.',
        '................'
    ]
};

const PALETTE = { k: '#18181a', h: '#4a4a50', r: '#b8541f', w: '#ffffff', e: '#dea846', p: '#ff8fa6' };
const url = (rows) => 'data:image/svg+xml,' + encodeURIComponent(svg(16, pix(rows, PALETTE)));
const IMG = Object.fromEntries(Object.entries(DOG).map(([k, rows]) => [k, url(rows)]));

const SIZE = 32;                        // on screen: 16 px of art shown twice as big
const TICK = 140;                       // ms: eight steps a second, like a pixel animation should
const SPEED = 15;                       // px per step while running
const NEAR = 46;                        // it stops this far from the pointer

export const dogAvailable = () => !reducedMotion() && !window.matchMedia('(pointer: coarse)').matches;

/**
 * @param {{layer: HTMLElement, frozen?: () => boolean}} o  the layer that clips things to the glass (.os-layer);
 *   frozen: true while the machine is stopped (a system error): the dog holds still too
 */
export function createDog({ layer, frozen = () => false }) {
    let el = null;
    let timer = 0;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let facing = 1;
    let mode = 'sit';                   // sit | scratch | sleep | alert | run
    let since = 0;                      // steps spent in this mode
    let idle = 0;                       // steps since the pointer last moved
    let step = 0;
    let running = false;

    const show = (frame) => { if (el.dataset.f !== frame) { el.dataset.f = frame; el.src = IMG[frame]; } };
    const place = () => { el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) scaleX(${facing})`; };
    const set = (m) => { mode = m; since = 0; };

    function onMove(e) {
        if (e.pointerType === 'touch') return;
        tx = e.clientX;
        ty = e.clientY;
        idle = 0;
        const d = Math.hypot(tx - x - SIZE / 2, ty - y - SIZE / 2);
        if (d > NEAR + 30 && mode !== 'run' && mode !== 'alert') set('alert');
        else if (mode === 'sleep' && d > NEAR) set('alert');
    }

    function tick() {
        if (frozen()) return;
        step += 1;
        since += 1;
        idle += 1;
        const cx = x + SIZE / 2;
        const cy = y + SIZE / 2;
        const dx = tx - cx;
        const dy = ty - cy;
        const d = Math.hypot(dx, dy);

        if (mode === 'alert') {
            show('alert');                                              // ears up
            if (since >= 3) set('run');
        } else if (mode === 'run') {
            if (d <= NEAR + 1.5) { set('sit'); show('sit0'); }          // the last step lands on NEAR, give or take a rounding error
            else {
                const k = Math.min(SPEED, d - NEAR) / d;
                x += dx * k;
                y += dy * k;
                if (Math.abs(dx) > 6) facing = dx < 0 ? -1 : 1;
                show(step % 2 ? 'run0' : 'run1');
            }
        } else if (mode === 'sit') {
            show(step % 6 < 3 ? 'sit0' : 'sit1');                      // the tail wags and the tongue goes in and out
            if (since > 12 && Math.random() < 0.12) set('scratch');
            if (idle > 70) set('sleep');                                // about ten seconds of nothing
        } else if (mode === 'scratch') {
            show(since % 2 ? 'scratch0' : 'scratch1');
            if (since > 12) set('sit');
            if (idle > 70) set('sleep');
        } else if (mode === 'sleep') {
            show(step % 8 < 4 ? 'sleep0' : 'sleep1');
        }
        x = Math.max(0, Math.min(window.innerWidth - SIZE, x));
        y = Math.max(22, Math.min(window.innerHeight - SIZE, y));          // not over the menu bar
        place();
    }

    return {
        get on() { return running; },
        start() {
            if (running || !dogAvailable()) return;
            running = true;
            el = document.createElement('img');
            el.className = 'dog';
            el.alt = '';
            el.draggable = false;
            el.setAttribute('aria-hidden', 'true');
            layer.appendChild(el);
            x = window.innerWidth * 0.4;
            y = window.innerHeight - 110;
            tx = x + SIZE / 2;
            ty = y + SIZE / 2;
            set('sit');
            show('sit0');
            place();
            window.addEventListener('pointermove', onMove, true);
            timer = setInterval(tick, TICK);
        },
        stop() {
            if (!running) return;
            running = false;
            clearInterval(timer);
            window.removeEventListener('pointermove', onMove, true);
            el.remove();
            el = null;
        }
    };
}
