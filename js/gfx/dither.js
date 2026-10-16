/* ==========================================================================
   DITHER — turns modern images into old-Mac pixels.
   atkinson(): Bill Atkinson's error diffusion (MacPaint's look), 1-bit.
   atkinsonColor(): the same diffusion onto a small adaptive palette, for the
   client coins (icons, and the "glow-up" frames when a project window opens).
   Used for the "Marian Kadlec" icon and the project coins.
   ========================================================================== */

export function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image failed: ' + src));
        img.src = src;
    });
}

/**
 * @param {HTMLImageElement} img
 * @param {object} o  crop {sx,sy,sw,sh} in source px, output size in px, contrast/bright tweaks
 * @returns {HTMLCanvasElement} a size x size canvas, pure black and paper-white
 */
export function atkinson(img, { sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight, size = 48, contrast = 1.35, bright = 6, ink = [0, 0, 0], paper = [255, 255, 255] } = {}) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

    const data = ctx.getImageData(0, 0, size, size);
    const px = data.data;
    const g = new Float32Array(size * size);
    for (let i = 0; i < g.length; i++) {
        const v = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
        g[i] = Math.max(0, Math.min(255, (v - 128) * contrast + 128 + bright));
    }
    const spread = (x, y, e) => {
        if (x < 0 || x >= size || y >= size) return;
        g[y * size + x] += e;
    };
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = y * size + x;
            const old = g[i];
            const val = old < 128 ? 0 : 255;
            const e = (old - val) / 8;                 // Atkinson keeps only 6/8 of the error
            spread(x + 1, y, e); spread(x + 2, y, e);
            spread(x - 1, y + 1, e); spread(x, y + 1, e); spread(x + 1, y + 1, e);
            spread(x, y + 2, e);
            const o = i * 4;
            const col = val ? paper : ink;
            px[o] = col[0]; px[o + 1] = col[1]; px[o + 2] = col[2]; px[o + 3] = 255;
        }
    }
    ctx.putImageData(data, 0, 0);
    return c;
}


/* ==========================================================================
   COLOUR — a small palette taken from the picture itself, then Atkinson on it
   ========================================================================== */

/** shrink by halves, so even 1024 px down to 32 px stays clean */
function scaled(img, w, h) {
    let cur = img;
    let cw = img.naturalWidth || img.width;
    let ch = img.naturalHeight || img.height;
    while (cw > w * 2 || ch > h * 2) {
        const nw = Math.max(w, Math.ceil(cw / 2));
        const nh = Math.max(h, Math.ceil(ch / 2));
        const c = document.createElement('canvas');
        c.width = nw;
        c.height = nh;
        const x = c.getContext('2d');
        x.imageSmoothingQuality = 'high';
        x.drawImage(cur, 0, 0, nw, nh);
        cur = c; cw = nw; ch = nh;
    }
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const ox = out.getContext('2d');
    ox.imageSmoothingQuality = 'high';
    ox.drawImage(cur, 0, 0, w, h);
    return out;
}

const mean = (list) => [0, 1, 2].map((k) => Math.round(list.reduce((s, p) => s + p[k], 0) / list.length));
const chroma = (p) => Math.max(p[0], p[1], p[2]) - Math.min(p[0], p[1], p[2]);

/** median cut: n colours that stand for a list of [r,g,b]; wide colour ranges are split first, so a small bright logo keeps a colour of its own */
function medianCut(list, n) {
    const boxes = [list];
    const span = (b) => {
        const lo = [255, 255, 255];
        const hi = [0, 0, 0];
        b.forEach((p) => { for (let k = 0; k < 3; k++) { if (p[k] < lo[k]) lo[k] = p[k]; if (p[k] > hi[k]) hi[k] = p[k]; } });
        return [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
    };
    while (boxes.length < n) {
        let at = -1;
        let best = 0;
        let axis = 0;
        boxes.forEach((b, i) => {
            if (b.length < 2) return;
            const s = span(b);
            const m = Math.max(s[0], s[1], s[2]);
            const score = m * Math.sqrt(b.length);
            if (score > best) { best = score; at = i; axis = s.indexOf(m); }
        });
        if (at < 0) break;
        const b = boxes[at].sort((p, q) => p[axis] - q[axis]);
        const mid = b.length >> 1;
        boxes.splice(at, 1, b.slice(0, mid), b.slice(mid));
    }
    return boxes.map(mean);
}

/** the colour a client is known by: the most common vivid hue, as a mean of its pixels */
function brandColor(list) {
    const bins = Array.from({ length: 12 }, () => []);
    list.forEach((p) => {
        const c = chroma(p);
        if (c < 60 || Math.max(p[0], p[1], p[2]) < 90) return;
        const mx = Math.max(p[0], p[1], p[2]);
        let h;
        if (mx === p[0]) h = ((p[1] - p[2]) / c + 6) % 6;
        else if (mx === p[1]) h = (p[2] - p[0]) / c + 2;
        else h = (p[0] - p[1]) / c + 4;
        bins[Math.min(11, Math.floor(h * 2))].push(p);
    });
    const top = bins.reduce((a, b) => (b.length > a.length ? b : a), []);
    return top.length >= 3 ? mean(top) : null;
}

/** stretch the tones so a pale or flat picture still has something to dither: a luminance stretch between the 3rd and 97th percentile, plus a colour boost */
function stretch(px, solid, amount, sat) {
    const lum = [];
    for (let i = 0; i < solid.length; i++) if (solid[i]) lum.push(0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]);
    if (!lum.length) return;
    lum.sort((a, b) => a - b);
    const lo = lum[Math.floor(lum.length * 0.03)];
    const hi = lum[Math.min(lum.length - 1, Math.floor(lum.length * 0.97))];
    const k = hi - lo > 8 ? 255 / (hi - lo) : 1;
    for (let i = 0; i < solid.length; i++) {
        if (!solid[i]) continue;
        const o = i * 4;
        const l = 0.299 * px[o] + 0.587 * px[o + 1] + 0.114 * px[o + 2];
        for (let c = 0; c < 3; c++) {
            let v = px[o + c];
            v = l + (v - l) * sat;                                     // colour boost around the luminance
            v = v + ((v - lo) * k - v) * amount;                      // tone stretch, by how much was asked
            px[o + c] = v < 0 ? 0 : v > 255 ? 255 : v;
        }
    }
}

const dist = (a, b) => {
    const rm = (a[0] + b[0]) / 2;                 // "redmean": close to how the eye weighs the channels
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    return (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
};

function buildPalette(list, n) {
    if (!list.length) return [[0, 0, 0]];
    const pal = medianCut(list, n);
    const brand = brandColor(list);
    if (brand) {
        // keep the brand colour: take the place of the closest palette entry
        let at = 0;
        let near = Infinity;
        pal.forEach((p, i) => { const d = dist(p, brand); if (d < near) { near = d; at = i; } });
        if (near > 0) pal[at] = brand;
    }
    return pal;
}

/**
 * The picture as a small colour palette with Atkinson dithering. Transparent stays transparent.
 * @param {HTMLImageElement|HTMLCanvasElement} img
 * @param {{size?: number, colors?: number, pad?: number, outline?: boolean, edge?: number[], alphaCut?: number, levels?: number, sat?: number, method?: string}} o
 *   levels: how hard to stretch the tones (0 = as is), sat: colour boost, method: 'atkinson' or 'floyd'
 * @returns {HTMLCanvasElement} size x size
 */
export function atkinsonColor(img, { size = 32, colors = 8, pad = 0, outline = false, edge = [0, 0, 0], alphaCut = 120, levels = 0, sat = 1, method = 'atkinson' } = {}) {
    const inner = size - pad * 2;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(scaled(img, inner, inner), pad, pad);

    const data = ctx.getImageData(0, 0, size, size);
    const px = data.data;
    const n = size * size;
    const solid = new Uint8Array(n);
    const list = [];
    for (let i = 0; i < n; i++) {
        if (px[i * 4 + 3] >= alphaCut) { solid[i] = 1; list.push([px[i * 4], px[i * 4 + 1], px[i * 4 + 2]]); }
    }
    if (levels || sat !== 1) stretch(px, solid, levels, sat);
    list.length = 0;
    for (let i = 0; i < n; i++) if (solid[i]) list.push([px[i * 4], px[i * 4 + 1], px[i * 4 + 2]]);
    const pal = buildPalette(list, colors);

    const buf = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { buf[i * 3] = px[i * 4]; buf[i * 3 + 1] = px[i * 4 + 1]; buf[i * 3 + 2] = px[i * 4 + 2]; }
    const spread = (x, y, e) => {
        if (x < 0 || x >= size || y >= size || !solid[y * size + x]) return;
        const j = (y * size + x) * 3;
        buf[j] += e[0]; buf[j + 1] += e[1]; buf[j + 2] += e[2];
    };
    const out = new Uint8ClampedArray(n * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = y * size + x;
            if (!solid[i]) continue;
            const old = [Math.max(0, Math.min(255, buf[i * 3])), Math.max(0, Math.min(255, buf[i * 3 + 1])), Math.max(0, Math.min(255, buf[i * 3 + 2]))];
            let best = pal[0];
            let near = Infinity;
            for (const p of pal) { const d = dist(old, p); if (d < near) { near = d; best = p; } }
            const err = [old[0] - best[0], old[1] - best[1], old[2] - best[2]];
            if (method === 'floyd') {
                const q = (k) => err.map((v) => (v * k) / 16);
                spread(x + 1, y, q(7));
                spread(x - 1, y + 1, q(3)); spread(x, y + 1, q(5)); spread(x + 1, y + 1, q(1));
            } else {
                const e = err.map((v) => v / 8);                           // Atkinson keeps only 6/8 of the error
                spread(x + 1, y, e); spread(x + 2, y, e);
                spread(x - 1, y + 1, e); spread(x, y + 1, e); spread(x + 1, y + 1, e);
                spread(x, y + 2, e);
            }
            out[i * 4] = best[0]; out[i * 4 + 1] = best[1]; out[i * 4 + 2] = best[2]; out[i * 4 + 3] = 255;
        }
    }
    if (outline) {
        const ring = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!solid[y * size + x]) continue;
                const open = (nx, ny) => nx < 0 || ny < 0 || nx >= size || ny >= size || !solid[ny * size + nx];
                if (open(x - 1, y) || open(x + 1, y) || open(x, y - 1) || open(x, y + 1)) ring.push(y * size + x);
            }
        }
        ring.forEach((i) => { out[i * 4] = edge[0]; out[i * 4 + 1] = edge[1]; out[i * 4 + 2] = edge[2]; });
    }
    ctx.putImageData(new ImageData(out, size, size), 0, 0);
    return c;
}
