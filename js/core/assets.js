/* Assets that more than one mode needs, prepared once. */
import { atkinson, atkinsonColor, loadImage } from '../gfx/dither.js';
import { illustration } from '../content/index.js';

const pending = new Map();         // file -> Promise<coin|null>
const done = new Map();            // file -> coin

/** the client tokens: a small dithered icon, a tiny one for lists, and the three steps of the "glow-up".
 *  The icons stretch the tones and boost the colour so a logo still reads at 32 px; the glow-up steps
 *  lean back toward the real picture, so each one is a believable step on the way to it. */
function makeCoin(img) {
    const url = (o) => atkinsonColor(img, o).toDataURL('image/png');
    return {
        img,
        icon: url({ size: 32, colors: 12, pad: 1, outline: true, levels: 1, sat: 1.1 }),
        tiny: url({ size: 16, colors: 8, pad: 1, outline: true, levels: 1, sat: 1.1 }),
        frames: [
            url({ size: 32, colors: 10, levels: 0.7, sat: 1.1 }),
            url({ size: 64, colors: 20, levels: 0.4, sat: 1.05 }),
            url({ size: 128, colors: 40, levels: 0.15 })
        ]
    };
}

export const Assets = {
    portrait: null,          // the 48px canvas
    portraitURL: '',         // the same pixels as a data URL: can be used by any number of <img>
    portraitBigURL: '',      // the same portrait at 96 px, for the Puzzle

    /** 1-bit Atkinson dither of the profile photo, used as the desktop icon */
    ready: loadImage('img/marian-kadlec-profile-image.webp')
        .then((img) => {
            Assets.portrait = atkinson(img, { sx: 58, sy: 50, sw: 296, sh: 296, size: 48, contrast: 1.45, bright: 10 });
            Assets.portraitURL = Assets.portrait.toDataURL('image/png');
            Assets.portraitBigURL = atkinson(img, { sx: 58, sy: 50, sw: 296, sh: 296, size: 96, contrast: 1.45, bright: 10 }).toDataURL('image/png');
        })
        .catch(() => { Assets.portrait = null; Assets.portraitURL = ''; Assets.portraitBigURL = ''; }),

    /**
     * The dithered versions of a client token (a file in the repo root), made the first time they are asked for.
     * Fires `mk:coin` when a token is ready so icons that show a placeholder can swap it.
     * @returns {Promise<object|null>} null when the picture can't be loaded
     */
    coin(file) {
        if (!pending.has(file)) {
            pending.set(file, loadImage(illustration(file))
                .then((img) => {
                    const c = makeCoin(img);
                    done.set(file, c);
                    window.dispatchEvent(new CustomEvent('mk:coin', { detail: file }));
                    return c;
                })
                .catch(() => null));
        }
        return pending.get(file);
    },

    /** the token if it is already made (never starts a download) */
    coinNow: (file) => done.get(file) || null
};
