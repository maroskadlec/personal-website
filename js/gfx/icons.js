/* ==========================================================================
   ICONS — original pixel art, drawn as crisp SVG on an integer grid.
   No Apple artwork: a happy compact computer, a drive, a folder, a bin.
   Every icon is a function returning an SVG string.
   ========================================================================== */

const r = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
/** 1px outline box with chamfered corners */
const box = (x, y, w, h, fill, line = '#000') =>
    r(x + 1, y, w - 2, 1, line) + r(x + 1, y + h - 1, w - 2, 1, line) +
    r(x, y + 1, 1, h - 2, line) + r(x + w - 1, y + 1, 1, h - 2, line) +
    r(x + 1, y + 1, w - 2, h - 2, fill);
/** pixel art from text: one character per pixel, `.` is empty; `palette` maps the other characters to colours */
export const pix = (rows, palette) => rows.map((row, y) => {
    let out = '';
    for (let x = 0; x < row.length;) {
        const c = row[x];
        let n = 1;
        while (row[x + n] === c) n++;
        if (palette[c]) out += r(x, y, n, 1, palette[c]);
        x += n;
    }
    return out;
}).join('');
/** 1px outline box with square corners */
const sbox = (x, y, w, h, fill, line = '#000') => r(x, y, w, h, line) + r(x + 1, y + 1, w - 2, h - 2, fill);

export const svg = (size, body, cls = '') =>
    `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`;

let pearCount = 0;
const TEAL = '#20b2aa';
const TEAL2 = '#40e0d0';

const CHAIN = [
        '................................',
        '................................',
        '................................',
        '....................kkkkkk......',
        '..................kkkggggkkk....',
        '.................kkggggggggkk...',
        '................kkggggggggggk...',
        '...............kkggggkkkkgggkk..',
        '..............kkggggkk..kkgggk..',
        '.............kkggggkk....kgggk..',
        '............kkggggkk.....kgggk..',
        '............kkkkkkk.....kkgggk..',
        '...........kkttttkk....kkgggkk..',
        '.........kkttttttttk..kkggggk...',
        '........kkttttttttttkkkggggkk...',
        '.......kkttttkkkttttkkggggkk....',
        '......kkttttkkk.kttkkggggkk.....',
        '.....kkttttkkggk.kkkggggkk......',
        '....kkttttkkggggkkkggggkk.......',
        '...kkttttkkkggggggggggkk........',
        '...kttttkk..kggggggggkk.........',
        '..kktttkk....kkggggkk...........',
        '..ktttkk.....kkkkkkk............',
        '..ktttk.....kkttttkk............',
        '..ktttk....kkttttkk.............',
        '..ktttkk..kkttttkk..............',
        '..kktttkkkkttttkk...............',
        '...kttttttttttkk................',
        '...kkttttttttkk.................',
        '....kkkttttkkk..................',
        '......kkkkkk....................',
        '................................'
];

/** the system-error bomb (`k` outline, `d` body, `m` rim light, `w` glint, `f` fuse, `y`/`o` spark, `s` shadow) */
const BOMB = [
    '................................',
    '...........................o....',
    '..........................oyo...',
    '.........................oyyyo..',
    '..........................yoo...',
    '........................ff.o....',
    '.......................f........',
    '.......................f........',
    '......................f.........',
    '...........kkkkk...kkkk.........',
    '.........kkkmmmkkk.kmmmk........',
    '.......kkmmmmmmmddkkkkkk........',
    '......kkmmmmmmmddddkk...........',
    '.....kkmmwwdddddddddkk..........',
    '.....kmmwwdddddddddddk..........',
    '....kmmmwdddddddddddddk.........',
    '....kmmdddddddddddddddk.........',
    '...kkmmdddddddddddddddkk........',
    '...kmmmddddddddddddddddk........',
    '...kmmmddddddddddddddddk........',
    '...kmmmddddddddddddddddk........',
    '...kkmddddddddddddddddkk........',
    '....kdddddddddddddddddk.........',
    '....kdddddddddddddddddk.........',
    '.....kdddddddddddddddk..........',
    '.....kkdddddddddddddkk..........',
    '......kkdddddddddddkk...........',
    '.......kkdddddddddkk............',
    '.........kkkdddkkk..............',
    '.......sssskkkkkssssss..........',
    '................................',
    '................................'
];

/** a 3x5 pixel font, just the letters file-type labels need */
const GLYPH = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'],
    F: ['###', '#..', '##.', '#..', '#..'],
    G: ['###', '#..', '#.#', '#.#', '###'],
    I: ['###', '.#.', '.#.', '.#.', '###'],
    P: ['##.', '#.#', '##.', '#..', '#..'],
    S: ['###', '#..', '###', '..#', '###'],
    W: ['#.#', '#.#', '#.#', '###', '#.#']
};
const label = (text, x, y, fill) => {
    let out = '';
    [...text].forEach((ch, i) => {
        (GLYPH[ch] || []).forEach((row, dy) => {
            for (let dx = 0; dx < 3; dx++) if (row[dx] === '#') out += r(x + i * 4 + dx, y + dy, 1, 1, fill);
        });
    });
    return out;
};
/** a document with a coloured band and its file type across it: the relics in the Trash */
const fileIcon = (ext, color, cls) =>
    svg(32,
        `<polygon points="7.5,3.5 20.5,3.5 26.5,9.5 26.5,28.5 7.5,28.5" fill="#fff" stroke="#000"/>` +
        `<polygon points="20.5,3.5 20.5,9.5 26.5,9.5" fill="#d6d6d6" stroke="#000"/>` +
        r(10, 12, 8, 1, '#000') + r(10, 26, 11, 1, '#000') +
        r(8, 15, 18, 9, '#000') + r(8, 16, 18, 7, color) +
        label(ext, 17 - Math.round((ext.length * 4 - 1) / 2), 17, '#fff'),
        cls);

export const Icons = {
    /** the boot-screen mascot: a smiling compact computer */
    happy(cls = '') {
        return svg(32,
            r(8, 29, 16, 1, 'rgba(0,0,0,.28)') +
            box(5, 2, 22, 27, '#e6dfca') +
            r(6, 3, 20, 1, '#fffdf4') +
            sbox(8, 5, 16, 14, '#2a2a2a') +
            r(9, 6, 14, 12, '#ffffff') +
            r(13, 9, 2, 3, '#000') + r(18, 9, 2, 3, '#000') +
            r(12, 13, 1, 1, '#000') + r(13, 14, 1, 1, '#000') + r(14, 15, 5, 1, '#000') + r(19, 14, 1, 1, '#000') + r(20, 13, 1, 1, '#000') +
            r(8, 20, 16, 1, TEAL) + r(8, 21, 16, 1, TEAL2) +
            r(11, 24, 10, 1, '#000') + r(11, 25, 10, 1, '#fff') +
            r(22, 23, 1, 1, '#2ee05a'),
            cls);
    },

    /** hard disk: the startup volume */
    disk(cls = '') {
        return svg(32,
            r(5, 27, 24, 1, 'rgba(0,0,0,.30)') +
            box(2, 9, 28, 18, '#d8d8d8') +
            r(3, 10, 26, 1, '#ffffff') +
            r(3, 25, 26, 1, '#a0a0a0') +
            sbox(5, 13, 22, 8, '#9a9a9a') +
            r(8, 15, 16, 1, '#4e4e4e') + r(8, 17, 16, 1, '#4e4e4e') + r(8, 19, 16, 1, '#4e4e4e') +
            r(5, 22, 12, 2, TEAL) +
            r(24, 22, 3, 2, '#2ee05a'),
            cls);
    },

    folder(cls = '') {
        return svg(32,
            r(5, 27, 24, 1, 'rgba(0,0,0,.30)') +
            box(3, 6, 12, 6, '#7f9bc9') +
            box(3, 9, 26, 18, '#a9c1e6') +
            r(4, 10, 24, 1, '#e6effd') +
            r(4, 25, 24, 1, '#7f9bc9'),
            cls);
    },

    trash(cls = '') {
        return svg(32,
            r(10, 29, 14, 1, 'rgba(0,0,0,.28)') +
            r(13, 3, 6, 1, '#000') + r(12, 4, 1, 2, '#000') + r(19, 4, 1, 2, '#000') +
            sbox(7, 6, 18, 3, '#d4d4d4') +
            `<polygon points="8.5,9.5 23.5,9.5 22.5,28.5 9.5,28.5" fill="#dcdcdc" stroke="#000"/>` +
            r(12, 12, 1, 14, '#8a8a8a') + r(16, 12, 1, 14, '#8a8a8a') + r(20, 12, 1, 14, '#8a8a8a'),
            cls);
    },

    doc(cls = '') {
        return svg(32,
            `<polygon points="7.5,3.5 20.5,3.5 26.5,9.5 26.5,28.5 7.5,28.5" fill="#fff" stroke="#000"/>` +
            `<polygon points="20.5,3.5 20.5,9.5 26.5,9.5" fill="#d6d6d6" stroke="#000"/>` +
            r(10, 13, 13, 1, '#000') + r(10, 16, 13, 1, '#000') + r(10, 19, 13, 1, '#000') + r(10, 22, 9, 1, '#000'),
            cls);
    },

    /** a little terminal window: the doorway to the Terminal mode */
    terminal(cls = '') {
        return svg(32,
            r(5, 28, 24, 1, 'rgba(0,0,0,.30)') +
            box(3, 5, 26, 22, '#101512') +
            r(4, 6, 24, 4, '#2c352f') +
            r(6, 7, 2, 2, '#ff5f57') + r(10, 7, 2, 2, '#febc2e') + r(14, 7, 2, 2, '#28c840') +
            r(7, 14, 2, 1, '#d6d6d6') + r(9, 15, 2, 1, '#d6d6d6') + r(11, 16, 2, 1, '#d6d6d6') + r(9, 17, 2, 1, '#d6d6d6') + r(7, 18, 2, 1, '#d6d6d6') +
            r(14, 18, 6, 1, '#d6d6d6') +
            r(7, 22, 14, 1, '#7d7d7d'),
            cls);
    },

    /** the Trash with something in it: crumpled paper above the rim */
    trashFull(cls = '') {
        return svg(32,
            r(10, 29, 14, 1, 'rgba(0,0,0,.28)') +
            `<polygon points="9.5,7.5 11.5,2.5 15.5,5.5 18.5,1.5 22.5,5.5 24.5,3.5 24.5,7.5" fill="#fff" stroke="#000"/>` +
            r(12, 4, 3, 1, '#9a9a9a') + r(19, 4, 3, 1, '#9a9a9a') +
            sbox(7, 6, 18, 3, '#d4d4d4') +
            `<polygon points="8.5,9.5 23.5,9.5 22.5,28.5 9.5,28.5" fill="#dcdcdc" stroke="#000"/>` +
            r(12, 12, 1, 14, '#8a8a8a') + r(16, 12, 1, 14, '#8a8a8a') + r(20, 12, 1, 14, '#8a8a8a'),
            cls);
    },

    /** a control panel: three sliders */
    controls(cls = '') {
        return svg(32,
            r(5, 28, 24, 1, 'rgba(0,0,0,.30)') +
            box(3, 4, 26, 23, '#e8e8e8') + r(4, 5, 24, 1, '#ffffff') +
            r(7, 10, 18, 1, '#000') + r(7, 16, 18, 1, '#000') + r(7, 22, 18, 1, '#000') +
            sbox(10, 8, 4, 5, '#fff') + sbox(18, 14, 4, 5, '#fff') + sbox(13, 20, 4, 5, '#fff'),
            cls);
    },

    /** a stack of cards: a project */
    stack(cls = '') {
        return svg(32,
            r(6, 29, 22, 1, 'rgba(0,0,0,.30)') +
            sbox(9, 3, 18, 22, '#e6effd') +
            sbox(6, 6, 18, 22, '#f2f2f2') +
            sbox(3, 9, 18, 19, '#ffffff') +
            r(6, 13, 12, 1, '#000') + r(6, 16, 12, 1, '#000') + r(6, 19, 8, 1, '#000') + r(6, 22, 10, 1, '#000'),
            cls);
    },

    /** the System Folder: a folder with a gear */
    sysfolder(cls = '') {
        return svg(32,
            r(5, 27, 24, 1, 'rgba(0,0,0,.30)') +
            box(3, 6, 12, 6, '#9aa7b8') +
            box(3, 9, 26, 18, '#bcc8d8') +
            r(4, 10, 24, 1, '#eef2f8') + r(4, 25, 24, 1, '#9aa7b8') +
            r(15, 13, 2, 10, '#2c3e50') + r(11, 17, 10, 2, '#2c3e50') + r(12, 14, 8, 8, '#2c3e50') + r(14, 16, 4, 4, '#bcc8d8'),
            cls);
    },

    /** a generic program */
    app(cls = '') {
        return svg(32,
            r(5, 28, 24, 1, 'rgba(0,0,0,.30)') +
            box(3, 5, 26, 22, '#ffffff') +
            r(4, 6, 24, 4, '#d6d6d6') + r(4, 10, 24, 1, '#000') +
            r(6, 7, 2, 2, '#000') + r(10, 7, 8, 2, '#8a8a8a') +
            r(11, 14, 10, 8, TEAL) + r(12, 15, 8, 2, TEAL2),
            cls);
    },

    /** alert icons (32px): the stop sign, the caution triangle and the note bubble */
    stop(cls = '') {
        return svg(32,
            `<polygon points="10.5,2.5 21.5,2.5 29.5,10.5 29.5,21.5 21.5,29.5 10.5,29.5 2.5,21.5 2.5,10.5" fill="#d8392b" stroke="#000"/>` +
            r(15, 8, 2, 10, '#fff') + r(15, 21, 2, 3, '#fff'),
            cls);
    },
    caution(cls = '') {
        return svg(32,
            `<polygon points="16.5,3.5 29.5,28.5 3.5,28.5" fill="#f7d23e" stroke="#000"/>` +
            r(15, 12, 2, 9, '#000') + r(15, 23, 2, 3, '#000'),
            cls);
    },
    note(cls = '') {
        return svg(32,
            `<polygon points="3.5,5.5 28.5,5.5 28.5,21.5 14.5,21.5 8.5,27.5 8.5,21.5 3.5,21.5" fill="#fff" stroke="#000"/>` +
            r(15, 9, 2, 2, '#000') + r(15, 13, 2, 6, '#000'),
            cls);
    },

    /** Services: a service bell */
    services(cls = '') {
        return svg(32,
            r(5, 29, 22, 1, 'rgba(0,0,0,.30)') +
            box(3, 24, 26, 5, '#d6d9de') + r(4, 25, 24, 1, '#ffffff') + r(4, 27, 24, 1, '#a4a8b0') +
            `<polygon points="5.5,24.5 5.5,21.5 6.5,18.5 8.5,15.5 11.5,12.5 14.5,11.5 17.5,11.5 20.5,12.5 23.5,15.5 25.5,18.5 26.5,21.5 26.5,24.5" fill="${TEAL}" stroke="#000"/>` +
            r(8, 18, 2, 5, TEAL2) + r(10, 15, 3, 2, TEAL2) + r(13, 13, 3, 1, TEAL2) +
            r(22, 18, 3, 6, '#168a84') +
            sbox(13, 7, 6, 5, '#d6d9de') + r(14, 8, 4, 1, '#ffffff'),
            cls);
    },

    /** Process: four steps up, a flag on the top one */
    process(cls = '') {
        const steps = ['#d3ecea', '#9fd6d0', '#5fbfb6', TEAL];
        return svg(32,
            r(3, 29, 26, 1, 'rgba(0,0,0,.30)') +
            sbox(3, 22, 7, 7, steps[0]) + sbox(9, 17, 7, 12, steps[1]) + sbox(15, 12, 7, 17, steps[2]) + sbox(21, 8, 8, 21, steps[3]) +
            r(4, 23, 5, 1, '#ffffff') + r(10, 18, 5, 1, '#ffffff') + r(16, 13, 5, 1, '#ffffff') + r(22, 9, 6, 1, '#ffffff') +
            r(25, 1, 1, 7, '#000') + `<polygon points="26,1.5 31,3.5 26,5.5" fill="#d8392b" stroke="#000" stroke-width=".8"/>`,
            cls);
    },

    /** Why Me: a scrapbook, open, with pictures mounted on its pages */
    scrapbook(cls = '') {
        return svg(32,
            r(4, 28, 24, 1, 'rgba(0,0,0,.30)') +
            sbox(3, 6, 14, 21, '#fbf6e8') + sbox(16, 6, 14, 21, '#fbf6e8') +
            r(16, 7, 1, 19, '#9a8f74') + r(15, 7, 1, 19, '#cfc6ae') +
            sbox(6, 10, 8, 9, '#bfe3ff') + r(10, 11, 2, 2, '#ffcf3a') + `<polygon points="7,18 9,15 11,17 12,16 13,18" fill="#3c8b4f"/>` +
            r(6, 22, 8, 1, '#000') + r(6, 24, 5, 1, '#000') +
            sbox(19, 9, 8, 6, '#ffd9b0') + sbox(19, 17, 8, 6, '#c9e8c6') + r(19, 25, 6, 1, '#000'),
            cls);
    },

    /** Links: two links of a chain (drawn on a 45 degree grid, `k` black, `t` teal, `g` grey) */
    links(cls = '') {
        return svg(32, r(5, 29, 22, 1, 'rgba(0,0,0,.30)') + pix(CHAIN, { k: '#000', t: TEAL, g: '#d6d9de' }), cls);
    },

    /** the relics: a Photoshop-style layered file, an old animation, a logo, a banner */
    psd(cls = '') { return fileIcon('PSD', '#2a6db0', cls); },
    swf(cls = '') { return fileIcon('SWF', '#c8372d', cls); },
    ai(cls = '') { return fileIcon('AI', '#d9761a', cls); },
    gif(cls = '') { return fileIcon('GIF', '#2f8f5b', cls); },

    /** Commands: a document with a little screen on it, `>_` */
    commands(cls = '') {
        return svg(32,
            `<polygon points="7.5,3.5 20.5,3.5 26.5,9.5 26.5,28.5 7.5,28.5" fill="#fff" stroke="#000"/>` +
            `<polygon points="20.5,3.5 20.5,9.5 26.5,9.5" fill="#d6d6d6" stroke="#000"/>` +
            r(10, 12, 8, 1, '#000') +
            r(9, 15, 16, 11, '#101512') + r(10, 16, 14, 1, '#2c352f') +
            r(11, 19, 1, 1, '#d6d6d6') + r(12, 20, 1, 1, '#d6d6d6') + r(11, 21, 1, 1, '#d6d6d6') +
            r(14, 22, 4, 1, '#d6d6d6'),
            cls);
    },

    /** Do Not Open: a document with caution tape across it (a band at 45 degrees, black and yellow stripes) */
    donotopen(cls = '') {
        let tape = '';
        for (let y = 2; y < 30; y++) {
            for (let x = 3; x < 31; x++) {
                const across = x - y - 1;                      // 0 is the middle of the band
                const along = x + y;                           // where on the band: cut square at both ends
                if (Math.abs(across) > 4 || along < 11 || along > 51) continue;
                const edge = Math.abs(across) === 4 || along === 11 || along === 51;
                tape += r(x, y, 1, 1, edge ? '#000' : ((along >> 2) & 1) ? '#141414' : '#f7d23e');
            }
        }
        return svg(32,
            r(9, 29, 18, 1, 'rgba(0,0,0,.28)') +
            `<polygon points="7.5,3.5 20.5,3.5 26.5,9.5 26.5,28.5 7.5,28.5" fill="#fff" stroke="#000"/>` +
            `<polygon points="20.5,3.5 20.5,9.5 26.5,9.5" fill="#d6d6d6" stroke="#000"/>` +
            r(10, 12, 8, 1, '#000') +
            tape,
            cls);
    },

    /** the system error: a bomb with a lit fuse */
    bomb(cls = '') {
        return svg(32, pix(BOMB, { k: '#000', d: '#2b2b2b', m: '#5c5c5c', w: '#ffffff', f: '#8a6a3a', y: '#ffd23a', o: '#ff7a1a', s: 'rgba(0,0,0,.28)' }), cls);
    },

    /** toolbar glyphs (16px) for the Browser: Back, Forward, Reload, Home */
    tool(name) {
        const g = {
            back: '<polygon points="1,8 8,1 8,5 15,5 15,11 8,11 8,15" fill="#000"/>',
            forward: '<polygon points="15,8 8,1 8,5 1,5 1,11 8,11 8,15" fill="#000"/>',
            reload: '<path d="M13 8A5 5 0 1 1 8 3" fill="none" stroke="#000" stroke-width="2"/><polygon points="7,0 12,3 7,6" fill="#000"/>',
            home: '<polygon points="8,1 15,8 13,8 13,15 10,15 10,10 6,10 6,15 3,15 3,8 1,8" fill="#000"/>'
        };
        return svg(16, g[name] || '', 'tool');
    },

    /** tiny glyphs for the boot "extensions" row (24px) */
    ext(kind) {
        const tile = box(1, 1, 22, 22, '#ffffff');
        const glyphs = {
            font: r(8, 7, 2, 11, '#000') + r(14, 7, 2, 11, '#000') + r(10, 6, 4, 2, '#000') + r(10, 12, 4, 2, '#000'),
            image: sbox(4, 5, 16, 13, '#bfe3ff') + r(15, 8, 3, 3, '#ffcf3a') +
                `<polygon points="5,17 10,11 14,15 16,13 19,17" fill="#3c8b4f"/>`,
            gear: r(11, 4, 2, 16, '#000') + r(4, 11, 16, 2, '#000') + r(7, 7, 10, 10, '#000') + r(9, 9, 6, 6, '#fff'),
            sound: r(6, 10, 4, 4, '#000') + `<polygon points="10,10 15,6 15,18 10,14" fill="#000"/>` + r(17, 9, 1, 6, '#000') + r(19, 7, 1, 10, '#000'),
            cursor: `<polygon points="8,5 8,18 11,15 13,20 15,19 13,14 17,14" fill="#000" stroke="#fff" stroke-width=".8"/>`,
            clock: sbox(5, 5, 14, 14, '#fff') + r(11, 8, 1, 5, '#000') + r(11, 12, 4, 1, '#000'),
            star: `<polygon points="12,4 14,10 20,12 14,14 12,20 10,14 4,12 10,10" fill="#ffcf3a" stroke="#000"/>`
        };
        return svg(24, tile + (glyphs[kind] || glyphs.star), 'ext');
    },

    /** the pear: the brand mark of this computer (menu bar version; each call gets its own gradient ids) */
    pear(cls = '') {
        const id = 'pear' + (pearCount++);
        return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 78" width="14" height="17" aria-hidden="true">` +
            `<defs><linearGradient id="${id}b" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#7cf0e2"/><stop offset=".5" stop-color="#27bdb2"/><stop offset="1" stop-color="#0f7770"/></linearGradient>` +
            `<linearGradient id="${id}l" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0f7770"/><stop offset="1" stop-color="#40e0d0"/></linearGradient></defs>` +
            `<path d="M32 14C26 14 22.5 19 22.5 25c0 6-4 9.5-8 16C9 50 8.5 62 17 69c5 4.5 11 5.5 15 5.5s10-1 15-5.5c8.5-7 8-19 2.5-28-4-6.5-8-10-8-16 0-6-3.5-11-9.5-11z" fill="url(#${id}b)"/>` +
            `<path d="M32 14C32 9 34 5 38 2" fill="none" stroke="#5b4326" stroke-width="3.6" stroke-linecap="round"/>` +
            `<path d="M35.5 9C40 1 51 1.5 55 6c-4 8-14 9.5-19.5 3z" fill="url(#${id}l)"/></svg>`;
    }
};
