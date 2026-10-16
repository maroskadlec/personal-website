/* ==========================================================================
   PUZZLE — the old desk accessory: fifteen sliding tiles of a picture, here
   the dithered portrait of Marian Kadlec. It opens solved, so the picture is
   the first thing you see; Shuffle breaks it up. Click a tile next to the gap,
   or use the arrow keys (an arrow slides a tile in that direction into the gap).
   ========================================================================== */
import { Assets } from '../../../core/assets.js';
import { Sound } from '../../../core/sound.js';
import { reducedMotion } from '../../../core/util.js';
import { puzzle as T } from '../../../content/eggs.js';

const N = 4;
const TILE = 72;                         // a 24 px tile of the 96 px portrait, shown three times as big
const ID = 'puzzle';

function build() {
    const img = Assets.portraitBigURL || Assets.portraitURL;
    const tiles = Array.from({ length: N * N }, (_, i) => {
        const col = i % N;
        const row = Math.floor(i / N);
        return `<div class="pz-tile" data-i="${i}" style="background-position:${-col * TILE}px ${-row * TILE}px"></div>`;
    }).join('');
    const root = document.createElement('div');
    root.className = 'pz' + (reducedMotion() ? ' is-still' : '');
    root.style.setProperty('--pz-img', img ? `url("${img}")` : 'none');
    root.innerHTML =
        `<div class="pz-board" tabindex="0" role="application" aria-label="${T.label}">${tiles}</div>
        <div class="pz-bar"><button class="btn" type="button" data-act="shuffle">${T.shuffle}</button><span class="pz-status" aria-live="polite">${T.start}</span></div>`;
    return root;
}

function attach(sys, win) {
    const root = win.el.querySelector('.pz');
    const board = root.querySelector('.pz-board');
    const status = root.querySelector('.pz-status');
    const tiles = [...root.querySelectorAll('.pz-tile')];
    let slots = tiles.map((_, i) => i);              // slots[slot] = which tile is there; tile 15 is the gap while playing
    let moves = 0;
    let playing = false;
    let path = [];                                   // where the gap went while shuffling (the way back is the solution)

    const gapSlot = () => slots.indexOf(N * N - 1);
    const adjacent = (a, b) => Math.abs((a % N) - (b % N)) + Math.abs(Math.floor(a / N) - Math.floor(b / N)) === 1;

    function paint() {
        tiles.forEach((t, i) => {
            const s = slots.indexOf(i);
            t.style.transform = `translate(${(s % N) * TILE}px, ${Math.floor(s / N) * TILE}px)`;
            t.classList.toggle('is-gap', playing && i === N * N - 1);
        });
    }

    function move(slot) {
        const g = gapSlot();
        if (!playing || !adjacent(slot, g)) return false;
        [slots[slot], slots[g]] = [slots[g], slots[slot]];
        moves += 1;
        Sound.click();
        paint();
        if (slots.every((t, s) => t === s)) {
            playing = false;
            status.textContent = T.solved(moves);
            paint();                                   // the last tile comes back: the picture is whole
            Sound.glow(0.09);
            sys.announce?.(T.solved(moves));
        } else {
            status.textContent = T.moves(moves);
        }
        return true;
    }

    function shuffle() {
        slots = tiles.map((_, i) => i);
        let g = N * N - 1;
        let before = -1;
        path = [g];
        for (let i = 0; i < 160; i++) {                 // a random walk of the gap: every position it reaches can be solved
            const near = [g - N, g + N, g % N ? g - 1 : -1, g % N < N - 1 ? g + 1 : -1].filter((s) => s >= 0 && s < N * N && s !== before);
            const to = near[Math.floor(Math.random() * near.length)];
            [slots[g], slots[to]] = [slots[to], slots[g]];
            before = g;
            g = to;
            path.push(g);
        }
        moves = 0;
        playing = true;
        status.textContent = T.moves(0);
        Sound.crumple();
        paint();
        board.focus({ preventScroll: true });
    }

    board.addEventListener('pointerdown', (e) => {
        const t = e.target.closest('.pz-tile');
        if (t && playing) move(slots.indexOf(Number(t.dataset.i)));
    });
    board.addEventListener('keydown', (e) => {
        const g = gapSlot();
        const by = { ArrowLeft: g % N < N - 1 ? g + 1 : -1, ArrowRight: g % N ? g - 1 : -1, ArrowUp: g + N, ArrowDown: g - N }[e.key];
        if (by === undefined) return;
        e.preventDefault();
        if (by >= 0 && by < N * N) move(by);
    });
    root.querySelector('[data-act="shuffle"]').addEventListener('click', shuffle);
    paint();
    return { shuffle, move, get path() { return path.slice(); } };
}

export function openPuzzle(sys, { from } = {}) {
    const open = !!sys.wm.get(ID);
    const win = sys.openWindow({
        id: ID,
        title: 'Puzzle',
        kind: 'puzzle',
        mem: 380,
        w: 322,
        h: 382,
        resizable: false,
        scroll: false,
        content: open ? null : build(),
        from
    });
    if (!win) return null;
    if (!win.puzzle) win.puzzle = attach(sys, win);
    return win;
}
