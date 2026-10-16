/* ==========================================================================
   MEMORY — the computer has a little, and every open window takes some.
   About This Computer draws it; opening too much ends with the classic
   "not enough memory" alert (the dialog itself is in os.js).
   ========================================================================== */
const TOTAL = 16384;           // K
const SYSTEM = 5400;           // K: Marian OS itself

const procs = new Map();       // key -> { name, kb }
const subs = new Set();
const emit = () => subs.forEach((fn) => fn());

const sum = () => { let n = 0; procs.forEach((p) => { n += p.kb; }); return n; };

export const Memory = {
    total: TOTAL,
    system: SYSTEM,

    list() { return Array.from(procs.entries()).map(([key, p]) => ({ key, name: p.name, kb: p.kb })); },
    used() { return SYSTEM + sum(); },
    free() { return TOTAL - SYSTEM - sum(); },
    /** the biggest block: free memory minus a little fragmentation per program */
    largest() { return Math.max(0, this.free() - procs.size * 24); },

    /** reserve memory for a window; false when it does not fit */
    alloc(key, name, kb) {
        if (procs.has(key)) return true;
        if (kb > this.free()) return false;
        procs.set(key, { name, kb });
        emit();
        return true;
    },
    release(key) {
        if (procs.delete(key)) emit();
    },
    clear() {
        procs.clear();
        emit();
    },

    on(fn) { subs.add(fn); return () => subs.delete(fn); }
};

/** 12345 -> "12,345K" */
export const kb = (n) => Math.round(n).toLocaleString('en-US') + 'K';
