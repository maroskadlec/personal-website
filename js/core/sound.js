/* ==========================================================================
   SOUND — everything is synthesised with WebAudio. No audio files and no
   copy of any famous start-up chime: the boot chord below is original.
   The AudioContext is created on the first user gesture (the power key).
   ========================================================================== */

const KEY = 'mk10.muted';
let ctx = null;
let master = null;
let dry = null;
let wet = null;
let hum = null;
let muted = false;
try { muted = localStorage.getItem(KEY) === '1'; } catch (e) { /* storage blocked */ }

const LEVEL = 0.8;
let level = 1;                                   // system volume 0..1 (the Sound control panel)
const gainNow = () => (muted ? 0 : LEVEL * level);

function impulse(seconds = 2.0, decay = 3.2) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
}

function tone({ type = 'sine', f, f2, t = 0, dur = 0.3, vol = 0.2, attack = 0.006, detune = 0, send = 0, out = dry }) {
    const t0 = ctx.currentTime + t;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(out);
    if (send) {
        const s = ctx.createGain();
        s.gain.value = send;
        g.connect(s);
        s.connect(wet);
    }
    o.start(t0);
    o.stop(t0 + dur + 0.05);
}

function noise({ t = 0, dur = 0.05, vol = 0.2, freq = 1800, q = 1, type = 'bandpass', out = dry }) {
    const t0 = ctx.currentTime + t;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(out);
    src.start(t0);
}

const ready = () => ctx && !muted && ctx.state !== 'closed';

// a tab nobody is looking at goes quiet (otherwise the hum follows the visitor into every other tab) and wakes up when it is shown again
document.addEventListener('visibilitychange', () => {
    if (!ctx || ctx.state === 'closed') return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else if (!muted) ctx.resume().catch(() => {});
});

export const Sound = {
    get muted() { return muted; },

    unlock() {
        if (ctx) {
            if (ctx.state === 'suspended') ctx.resume();
            return;
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try {
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = gainNow();
            master.connect(ctx.destination);
            dry = ctx.createGain();
            dry.connect(master);
            const conv = ctx.createConvolver();
            conv.buffer = impulse();
            wet = ctx.createGain();
            wet.gain.value = 0.3;
            wet.connect(conv);
            conv.connect(master);
        } catch (e) { ctx = null; }
    },

    setMuted(m) {
        muted = !!m;
        try { localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ }
        if (master) master.gain.setTargetAtTime(gainNow(), ctx.currentTime, 0.04);
        if (muted) this.hum(false);
        document.dispatchEvent(new CustomEvent('mk:sound'));      // every sound switch (gate, both trays) renders from Sound.muted
    },

    /** system volume, 0..1 */
    get level() { return level; },
    setLevel(v) {
        level = Math.max(0, Math.min(1, v));
        if (master) master.gain.setTargetAtTime(gainNow(), ctx.currentTime, 0.04);
    },

    /** which alert sound beep() makes: set from the Sound control panel */
    alertKind: 'beep',

    /** mains relay clunk when the machine is switched on */
    relay() {
        if (!ready()) return;
        noise({ dur: 0.022, vol: 0.55, freq: 2600, q: 0.8 });
        tone({ f: 120, f2: 44, dur: 0.17, vol: 0.6 });
        noise({ t: 0.06, dur: 0.035, vol: 0.22, freq: 900, q: 1.2 });
    },

    /** the tube's degauss "bwoong" */
    degauss() {
        if (!ready()) return;
        tone({ f: 34, f2: 96, dur: 0.24, vol: 0.38 });
        tone({ t: 0.22, f: 96, f2: 46, dur: 0.78, vol: 0.32 });
        noise({ dur: 0.55, vol: 0.12, freq: 220, q: 0.4, type: 'lowpass' });
    },

    /** original boot chord: a warm Dmaj9 with a little sparkle on top */
    chime() {
        if (!ready()) return;
        const notes = [146.83, 220.0, 329.63, 369.99, 554.37, 659.25];
        notes.forEach((f, i) => {
            tone({ type: i < 3 ? 'sine' : 'triangle', f, t: i * 0.018, dur: 2.7 - i * 0.12, vol: 0.14 / (1 + i * 0.22), attack: 0.03, detune: i % 2 ? 5 : -5, send: 0.55 });
        });
        tone({ f: 1318.5, t: 0.26, dur: 1.5, vol: 0.035, attack: 0.02, send: 0.8 });
        tone({ f: 1760, t: 0.34, dur: 1.1, vol: 0.02, attack: 0.02, send: 0.8 });
    },

    /** steady, very quiet mains hum + fan while the Mac is on */
    hum(on) {
        if (!ctx) return;
        if (!on) {
            if (hum) {
                hum.g.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
                const h = hum;
                setTimeout(() => { try { h.o1.stop(); h.o2.stop(); h.n.stop(); } catch (e) { /* done */ } }, 900);
                hum = null;
            }
            return;
        }
        if (hum || muted) return;
        const g = ctx.createGain();
        g.gain.value = 0.0001;
        g.connect(master);
        const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 60;
        const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 120;
        const len = ctx.sampleRate * 2;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
        const n = ctx.createBufferSource(); n.buffer = buf; n.loop = true;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
        const og = ctx.createGain(); og.gain.value = 0.35;
        o1.connect(og); o2.connect(og); og.connect(g);
        n.connect(lp); lp.connect(g);
        o1.start(); o2.start(); n.start();
        g.gain.setTargetAtTime(0.018, ctx.currentTime, 0.6);
        hum = { g, o1, o2, n };
    },

    /** hard-disk chatter: a burst of tiny clicks */
    hdd(seconds = 1) {
        if (!ready()) return;
        const n = Math.round(seconds * 16);
        for (let i = 0; i < n; i++) {
            const t = (i / n) * seconds + Math.random() * 0.04;
            noise({ t, dur: 0.007, vol: 0.10 + Math.random() * 0.12, freq: 1100 + Math.random() * 1600, q: 3 });
            if (Math.random() < 0.18) tone({ t, f: 80 + Math.random() * 60, f2: 130, dur: 0.05, vol: 0.05 });
        }
    },

    /** the system alert; the three kinds are the choices in the Sound control panel */
    beep(kind = this.alertKind) {
        if (!ready()) return;
        if (kind === 'boing') {
            tone({ type: 'triangle', f: 330, f2: 700, dur: 0.14, vol: 0.14 });
            tone({ type: 'triangle', t: 0.13, f: 700, f2: 300, dur: 0.24, vol: 0.12 });
        } else if (kind === 'bleep') {
            tone({ type: 'square', f: 1320, dur: 0.05, vol: 0.05 });
            tone({ type: 'square', t: 0.08, f: 990, dur: 0.08, vol: 0.05 });
        } else {
            tone({ type: 'square', f: 880, f2: 740, dur: 0.12, vol: 0.07 });
        }
    },

    click() {
        if (!ready()) return;
        noise({ dur: 0.01, vol: 0.18, freq: 3200, q: 2 });
    },

    /** a window opening or closing: a small, soft tick */
    pop() {
        if (!ready()) return;
        noise({ dur: 0.012, vol: 0.12, freq: 1700, q: 1.4 });
        tone({ f: 190, f2: 120, dur: 0.06, vol: 0.08 });
    },

    /** a token resolving from chunky pixels to the real picture: one rising note per step */
    glow(step = 0.14) {
        if (!ready()) return;
        [392, 523.25, 659.25, 987.77].forEach((f, i) => {
            const last = i === 3;
            tone({ type: last ? 'sine' : 'triangle', f, t: i * step, dur: last ? 0.55 : 0.18, vol: last ? 0.07 : 0.05, attack: 0.008, send: last ? 0.6 : 0.15 });
        });
    },

    /** a secret found: a quick run of chip-tune blips going up, and a bell on top */
    secret() {
        if (!ready()) return;
        [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
            tone({ type: 'square', f, t: i * 0.06, dur: 0.1, vol: 0.04, attack: 0.004 });
        });
        tone({ type: 'triangle', f: 1046.5, t: 0.32, dur: 0.75, vol: 0.07, attack: 0.01, send: 0.6 });
        tone({ type: 'sine', f: 2093, t: 0.32, dur: 0.95, vol: 0.04, attack: 0.01, send: 0.8 });
    },

    /** the system error: a burst, a falling buzz, a low rumble */
    crash() {
        if (!ready()) return;
        noise({ dur: 0.2, vol: 0.5, freq: 900, q: 0.6 });
        tone({ type: 'sawtooth', f: 440, f2: 66, dur: 0.55, vol: 0.16 });
        tone({ type: 'square', t: 0.07, f: 220, f2: 52, dur: 0.65, vol: 0.09 });
        noise({ t: 0.2, dur: 0.55, vol: 0.12, freq: 240, q: 0.5, type: 'lowpass' });
    },

    /** an icon dropped somewhere */
    thud() {
        if (!ready()) return;
        tone({ f: 120, f2: 62, dur: 0.1, vol: 0.2 });
        noise({ dur: 0.03, vol: 0.1, freq: 520, q: 0.7 });
    },

    /** the Trash being emptied */
    crumple() {
        if (!ready()) return;
        for (let i = 0; i < 10; i++) {
            noise({ t: i * 0.04 + Math.random() * 0.02, dur: 0.045, vol: 0.1 + Math.random() * 0.05, freq: 900 + Math.random() * 2600, q: 1.1 });
        }
        tone({ t: 0.05, f: 90, f2: 50, dur: 0.3, vol: 0.12 });
    },

    /** a keystroke on a good keyboard (very quiet) */
    key() {
        if (!ready()) return;
        noise({ dur: 0.007, vol: 0.05, freq: 2400 + Math.random() * 900, q: 2 });
    },

    /** changing the channel: Desktop <-> Terminal */
    switch() {
        if (!ready()) return;
        noise({ dur: 0.02, vol: 0.34, freq: 2200, q: 0.9 });
        tone({ f: 90, f2: 210, dur: 0.15, vol: 0.26 });
        noise({ t: 0.1, dur: 0.32, vol: 0.07, freq: 260, q: 0.5, type: 'lowpass' });
    },

    /** the tube switching off */
    off() {
        if (!ready()) return;
        tone({ f: 210, f2: 38, dur: 0.34, vol: 0.34 });
        noise({ dur: 0.2, vol: 0.1, freq: 900, q: 0.8 });
    }
};
