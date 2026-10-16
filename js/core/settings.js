/* ==========================================================================
   SETTINGS — what the control panels change. One object, persisted, with a
   change feed so the Desktop can apply each value where it belongs.
   ========================================================================== */
import { Store } from './store.js';

export const DEFAULTS = {
    pattern: 'dither',       // desktop pattern id (Desktop Patterns)
    clock24: false,          // 24-hour clock in the menu bar (General Controls)
    liveDrag: false,         // windows show their contents while dragged (General Controls)
    menuBlink: true,         // chosen menu items flash (General Controls)
    brightness: 100,         // % (Monitors)
    glass: true,             // scanlines and vignette (Monitors)
    volume: 7,               // 0..7 (Sound)
    alert: 'beep',           // alert sound (Sound)
    balloons: false,         // Balloon Help: balloons say what things are (the ? menu)
    dog: false,              // the dog that follows the pointer (Pear menu)
    saver: 3                 // screen saver after this many minutes without anything happening, 0 = never (General Controls)
};

const state = { ...DEFAULTS };
const saved = Store.get('settings', {});
Object.keys(DEFAULTS).forEach((k) => { if (k in saved) state[k] = saved[k]; });      // only what still exists: an old setting does not linger
const subs = new Set();

export const Settings = {
    get(key) { return state[key]; },
    all() { return { ...state }; },
    set(key, value) {
        if (!(key in DEFAULTS) || state[key] === value) return;
        state[key] = value;
        Store.set('settings', state);
        subs.forEach((fn) => fn(key, value));
    },
    /** call fn(key, value) on every change; with immediate = true also once per setting right now */
    on(fn, { immediate = false } = {}) {
        subs.add(fn);
        if (immediate) Object.keys(DEFAULTS).forEach((k) => fn(k, state[k]));
        return () => subs.delete(fn);
    },
    reset() {
        Object.keys(DEFAULTS).forEach((k) => { if (state[k] !== DEFAULTS[k]) { state[k] = DEFAULTS[k]; subs.forEach((fn) => fn(k, state[k])); } });
        Store.set('settings', state);
    }
};
