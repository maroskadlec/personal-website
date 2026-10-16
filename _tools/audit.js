/* ==========================================================================
   AUDIT — an accessibility check you run from the console of the running machine.

   It reads what is on the screen right now (open windows, dialogs, menus, the Terminal
   in its current theme) and reports what a reviewer would look for:

     contrast()   every visible piece of text against the colour behind it (WCAG 1.4.3)
     names()      buttons, links, icons, fields: has each one a name, and is it not said twice
     structure()  duplicate ids, the heading outline, landmarks, pictures without alt
     targets()    how big the things you click or tap are (WCAG 2.5.8: at least 24 px)
     focus()      what the Tab key reaches, in which order
     run()        all of the above in one go, short

   Use it from the console (the dev server serves the whole repo):

     const A = await import('/_tools/audit.js');
     A.run();                       // or A.contrast(document.querySelector('.win'))

   Nothing here is loaded by the site. It only reads the page; it changes nothing.
   Text on a picture or a dither pattern cannot be measured this way: those places are listed
   as "unknownBg" and need an eye.
   ========================================================================== */

const parse = (c) => {
    const m = String(c).match(/-?[\d.]+(?:e-?\d+)?/g);
    if (!m) return [0, 0, 0, 0];
    const [r, g, b, a = 1] = m.map(Number);
    if (/^color\(srgb/.test(c)) return [r * 255, g * 255, b * 255, a];                 // color-mix() comes back as color(srgb 0.97 0.98 0.96 / 0.82)
    return [r, g, b, a];
};
const over = (top, under) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3]));
const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (hi + 0.05) / (lo + 0.05);
};
const hex = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const css = (el) => getComputedStyle(el);
const label = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');

/** is this element drawn on the screen (not display:none, not hidden, not the 1 px "sr-only" kind)? */
function shown(el) {
    if (!el.getClientRects().length) return false;
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
        if (a.hidden || a.inert) return false;
        const cs = css(a);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        if (cs.overflow === 'hidden' && cs.position === 'absolute') {                 // the "sr-only" kind: a 1 px box that clips everything inside
            const b = a.getBoundingClientRect();
            if (b.width <= 1 && b.height <= 1) return false;
        }
    }
    const r = el.getBoundingClientRect();
    return r.width > 1 || r.height > 1;
}

/** the colour a plain two-or-more-stop linear gradient has at a point (vertical or horizontal only), or null */
function gradientAt(box, cs, x, y) {
    const m = cs.backgroundImage.match(/^linear-gradient\((.*)\)$/);
    if (!m || /,\s*(?:url|radial|conic)/.test(cs.backgroundImage)) return null;
    const parts = m[1].match(/(?:to (?:top|bottom|left|right)|-?[\d.]+deg)|rgba?\([^)]*\)(?:\s+[\d.]+%)?/g);
    if (!parts) return null;
    let dir = 'to bottom';
    if (!/^rgb/.test(parts[0])) dir = parts.shift();
    const stops = parts.map((p) => { const c = parse(p.match(/rgba?\([^)]*\)/)[0]); const pos = p.match(/\s([\d.]+)%$/); return { c, pos: pos ? Number(pos[1]) / 100 : null }; });
    if (stops.length < 2 || stops.some((st) => st.c[3] < 0.99)) return null;
    stops.forEach((st, i) => { if (st.pos === null) st.pos = i / (stops.length - 1); });
    const axis = { 'to bottom': [0, 1], '180deg': [0, 1], 'to top': [0, -1], '0deg': [0, -1], 'to right': [1, 0], '90deg': [1, 0], 'to left': [-1, 0], '270deg': [-1, 0] }[dir];
    if (!axis) return null;
    let t = axis[1] ? (y - box.top) / box.height : (x - box.left) / box.width;
    if (axis[1] < 0 || axis[0] < 0) t = 1 - t;
    t = Math.min(1, Math.max(0, t));
    for (let i = 1; i < stops.length; i++) {
        if (t <= stops[i].pos || i === stops.length - 1) {
            const a = stops[i - 1], b = stops[i];
            const k = b.pos === a.pos ? 1 : Math.min(1, Math.max(0, (t - a.pos) / (b.pos - a.pos)));
            return [0, 1, 2].map((j) => a.c[j] + (b.c[j] - a.c[j]) * k);
        }
    }
    return null;
}

/** the colour behind an element: the translucent layers on the way up, down to the first opaque one;
    a plain gradient is measured at the middle of the text (point = [x, y]) */
function backdrop(el, point) {
    const layers = [];
    let image = null;
    let base = null;
    for (let a = el; a; a = a.parentElement) {
        const cs = css(a);
        if (cs.backgroundImage !== 'none' && !base && !image) {
            const g = point && cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? gradientAt(a.getBoundingClientRect(), cs, point[0], point[1]) : null;
            if (g) { base = g; break; }
            image = label(a);
        }
        const bg = parse(cs.backgroundColor);
        if (bg[3] > 0) layers.push(bg);
        if (bg[3] >= 0.99) { base = bg.slice(0, 3); break; }
    }
    if (!base) base = [0, 0, 0];
    let out = base;
    for (let i = layers.length - 1; i >= 0; i--) if (layers[i][3] < 0.99) out = over(layers[i], out);
    return { color: out, image };
}

/** opacity of the element and everything above it (1 = fully there; < 1 usually means it is fading) */
function opacityOf(el) {
    let o = 1;
    for (let a = el; a; a = a.parentElement) o *= Number(css(a).opacity);
    return o;
}

/* ------------------------------------------------------------------ contrast */
export function contrast(root = document.body, { skipFading = true } = {}) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const seen = new Map();
    const groups = new Map();
    const unknown = new Map();
    let checked = 0;
    let fading = 0;
    let disabled = 0;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.nodeValue.trim()) continue;
        const el = n.parentElement;
        if (!el || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) continue;
        if (!seen.has(el)) seen.set(el, shown(el));
        if (!seen.get(el)) continue;
        if (el.closest(':disabled, [aria-disabled="true"]')) { disabled++; continue; }       // WCAG 1.4.3 leaves inactive controls out
        const cs = css(el);
        const size = parseFloat(cs.fontSize);
        const weight = parseInt(cs.fontWeight, 10) || 400;
        const o = opacityOf(el);
        if (skipFading && o < 0.95) { fading++; continue; }
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const tr = rg.getBoundingClientRect();
        const bd = backdrop(el, [tr.left + tr.width / 2, tr.top + tr.height / 2]);
        const fgRaw = parse(cs.color);
        fgRaw[3] *= o;
        const fg = over(fgRaw, bd.color);
        const r = ratio(fg, bd.color);
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const need = large ? 3 : 4.5;
        checked++;
        const text = n.nodeValue.trim().replace(/\s+/g, ' ').slice(0, 40);
        if (bd.image) {
            const k = bd.image;
            if (!unknown.has(k)) unknown.set(k, { where: k, example: text, count: 0 });
            unknown.get(k).count++;
            continue;
        }
        if (r >= need) continue;
        const key = [hex(fg), hex(bd.color), size, weight].join('|');
        if (!groups.has(key)) groups.set(key, { ratio: +r.toFixed(2), need, fg: hex(fg), bg: hex(bd.color), size, weight, example: text, where: label(el), count: 0 });
        groups.get(key).count++;
    }
    const failures = [...groups.values()].sort((a, b) => a.ratio - b.ratio);
    return { checked, failing: failures.reduce((s, f) => s + f.count, 0), minRatio: failures[0] ? failures[0].ratio : null, failures, unknownBg: [...unknown.values()], fading, disabled };
}

/* ------------------------------------------------------------------ names */
const INTERACTIVE = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=menuitem], [role=menuitemradio], [role=menuitemcheckbox], [role=option], [role=tab], [role=switch], [role=checkbox], [role=radio], [role=slider], [role=scrollbar], [role=radiogroup] > *, [tabindex]:not([tabindex="-1"])';
const FROM_CONTENT = /^(button|link|menuitem|menuitemradio|menuitemcheckbox|option|tab|switch|checkbox|radio|heading|cell|gridcell|row|columnheader|rowheader|tooltip|treeitem|listitem)$/;

function fromContent(n) {
    if (n.nodeType === 3) return n.nodeValue;
    if (n.nodeType !== 1) return '';
    if (n.hidden || n.getAttribute('aria-hidden') === 'true') return '';
    const cs = css(n);
    if (cs.display === 'none' || cs.visibility === 'hidden') return '';
    const own = n.getAttribute('aria-label');
    if (own && own.trim()) return own;
    if (n.tagName === 'IMG') return n.getAttribute('alt') || '';
    if (n.tagName.toLowerCase() === 'svg') { const t = n.querySelector(':scope > title'); return t ? t.textContent : ''; }
    return Array.from(n.childNodes).map(fromContent).join(cs.display.startsWith('inline') ? '' : ' ');
}

/** an approximation of the accessible name (aria-labelledby, aria-label, label, alt, content, title) */
export function nameOf(el) {
    const by = el.getAttribute('aria-labelledby');
    if (by) {
        const t = by.split(/\s+/).map((id) => document.getElementById(id)).filter(Boolean).map((e) => fromContent(e)).join(' ').trim();
        if (t) return t.replace(/\s+/g, ' ');
    }
    const al = el.getAttribute('aria-label');
    if (al && al.trim()) return al.trim();
    const tag = el.tagName;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
        const l = (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest('label');
        if (l) return fromContent(l).replace(/\s+/g, ' ').trim();
        if (el.type === 'button' || el.type === 'submit') return el.value || '';
        return el.getAttribute('placeholder') || el.title || '';
    }
    if (tag === 'IMG' || tag === 'AREA') return (el.getAttribute('alt') || '').trim() || el.title || '';
    const role = el.getAttribute('role') || ({ A: 'link', BUTTON: 'button', SUMMARY: 'button', H1: 'heading', H2: 'heading', H3: 'heading', H4: 'heading', H5: 'heading', H6: 'heading', LI: 'listitem' })[tag] || '';
    if (FROM_CONTENT.test(role) || /^(A|BUTTON|SUMMARY)$/.test(tag)) {
        const t = fromContent(el).replace(/\s+/g, ' ').trim();
        if (t) return t;
    }
    return (el.title || '').trim();
}

export function names(root = document.body) {
    const unnamed = [];
    const twice = [];
    const hiddenButFocusable = [];
    let count = 0;
    const seen = new Set();
    for (const el of root.querySelectorAll(INTERACTIVE)) {
        if (seen.has(el)) continue;
        seen.add(el);
        if (!shown(el)) continue;
        const ariaHidden = el.closest('[aria-hidden="true"]');
        if (ariaHidden && !el.matches('[tabindex="-1"]') && el.tabIndex >= 0) { hiddenButFocusable.push(label(el)); continue; }
        if (ariaHidden) continue;
        count++;
        const nm = nameOf(el);
        if (!nm) unnamed.push(label(el));
        else if (/^(.{2,}?)(?:,\s*| )\1$/i.test(nm)) twice.push({ el: label(el), name: nm });
    }
    return { interactive: count, unnamed, saidTwice: twice, hiddenButFocusable };
}

/* ------------------------------------------------------------------ structure */
export function structure(root = document.body) {
    const ids = new Map();
    document.querySelectorAll('[id]').forEach((e) => ids.set(e.id, (ids.get(e.id) || 0) + 1));
    const duplicateIds = [...ids].filter(([, n]) => n > 1).map(([id]) => id);
    const visible = (e) => shown(e) && !e.closest('[aria-hidden="true"]');
    const headings = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')].filter(visible)
        .map((h) => ({ level: Number(h.getAttribute('aria-level') || (h.tagName.match(/^H(\d)$/) || [0, 2])[1]), text: fromContent(h).replace(/\s+/g, ' ').trim().slice(0, 50) }));
    const skipped = headings.filter((h, i) => i > 0 && h.level > headings[i - 1].level + 1).map((h) => h.text);
    const landmarks = [...root.querySelectorAll('main,nav,aside,header,footer,[role=main],[role=navigation],[role=banner],[role=contentinfo],[role=region],[role=complementary],section[aria-label],section[aria-labelledby]')]
        .filter(visible).map((e) => label(e) + (e.getAttribute('aria-label') ? ` "${e.getAttribute('aria-label')}"` : ''));
    const noAlt = [...root.querySelectorAll('img:not([alt])')].filter(visible).map(label);
    const unnamedImages = [...root.querySelectorAll('[role=img]')].filter(visible).filter((e) => !nameOf(e)).map(label);
    return { lang: document.documentElement.lang, title: document.title, duplicateIds, headings, skippedLevels: skipped, landmarks, imagesWithoutAlt: noAlt, imageRolesWithoutName: unnamedImages };
}

/* ------------------------------------------------------------------ targets */
/** the area that answers a click: the element, or a larger invisible ::before / ::after laid over it (a hit area) */
function hitRect(el) {
    const r = el.getBoundingClientRect();
    let box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    for (const pseudo of ['::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        if (cs.content === 'none' || cs.position !== 'absolute') continue;
        const w = parseFloat(cs.width);
        const h = parseFloat(cs.height);
        if (!(w > 0 && h > 0)) continue;
        const left = r.left + parseFloat(cs.left || 0) - 0;     // relative to the element's padding box: good enough for a hit area
        const top = r.top + parseFloat(cs.top || 0);
        if (w * h > (box.right - box.left) * (box.bottom - box.top)) box = { left, top, right: left + w, bottom: top + h };
    }
    return box;
}

/** WCAG 2.5.8: a target is at least 24 x 24 px, or small but with room around it (a 24 px circle on its middle touches no other target) */
export function targets(root = document.body, min = 24) {
    const list = [];
    const seen = new Set();
    for (const el of root.querySelectorAll(INTERACTIVE)) {
        if (seen.has(el)) continue;
        seen.add(el);
        if (!shown(el) || el.closest('[aria-hidden="true"]')) continue;
        if (el.tagName === 'A' && css(el).display === 'inline' && el.closest('p, li')) continue;     // a link inside a sentence is exempt
        if (el.matches('[role=group], [role=region], [role=listbox], [role=radiogroup]') && el.querySelector(INTERACTIVE)) continue;     // a scroll area or a list holding the real targets is not one itself
        const row = el.matches('input[type=checkbox], input[type=radio]') && el.closest('label');            // the real box is a hidden overlay: the whole labelled row answers
        list.push({ el, box: hitRect(row || el) });
    }
    const w = (b) => b.right - b.left;
    const h = (b) => b.bottom - b.top;
    let under44 = 0;
    const small = list.filter((t) => w(t.box) < min || h(t.box) < min);
    list.forEach((t) => { if (w(t.box) < 44 || h(t.box) < 44) under44++; });
    const bad = [];
    let bySpacing = 0;
    for (const t of small) {
        const cx = (t.box.left + t.box.right) / 2;
        const cy = (t.box.top + t.box.bottom) / 2;
        const touches = list.some((o) => {
            if (o === t) return false;
            const dx = Math.max(o.box.left - cx, 0, cx - o.box.right);
            const dy = Math.max(o.box.top - cy, 0, cy - o.box.bottom);
            if (Math.hypot(dx, dy) < min / 2) return true;                                          // the circle reaches another target
            return small.includes(o) && Math.hypot((o.box.left + o.box.right) / 2 - cx, (o.box.top + o.box.bottom) / 2 - cy) < min;   // two undersized circles overlap
        });
        if (touches) bad.push(`${label(t.el)} ${Math.round(w(t.box))}x${Math.round(h(t.box))}`); else bySpacing++;
    }
    return { checked: list.length, under44, smallerThanMin: bad, passedBySpacing: bySpacing };
}

/* ------------------------------------------------------------------ focus */
export function focus(root = document.body) {
    const out = [];
    const positive = [];
    for (const el of root.querySelectorAll(INTERACTIVE)) {
        if (!shown(el) || el.tabIndex < 0 || el.closest('[aria-hidden="true"]')) continue;
        if (el.tabIndex > 0) positive.push(label(el));
        out.push(`${label(el)} "${nameOf(el).slice(0, 30)}"`);
    }
    return { tabStops: out.length, positiveTabindex: positive, order: out };
}

/* ------------------------------------------------------------------ all of it, short */
export function run(root = document.body) {
    const c = contrast(root);
    const n = names(root);
    const s = structure(root);
    const t = targets(root);
    const f = focus(root);
    return {
        contrast: { checked: c.checked, failing: c.failing, minRatio: c.minRatio, worst: c.failures.slice(0, 5), unknownBg: c.unknownBg.slice(0, 5), skippedWhileFading: c.fading, skippedDisabled: c.disabled },
        names: { interactive: n.interactive, unnamed: n.unnamed, saidTwice: n.saidTwice, hiddenButFocusable: n.hiddenButFocusable },
        structure: { duplicateIds: s.duplicateIds, skippedLevels: s.skippedLevels, imagesWithoutAlt: s.imagesWithoutAlt, imageRolesWithoutName: s.imageRolesWithoutName, headings: s.headings.length, landmarks: s.landmarks },
        targets: { checked: t.checked, under44: t.under44, smallerThan24: t.smallerThanMin.slice(0, 12) },
        focus: { tabStops: f.tabStops, positiveTabindex: f.positiveTabindex }
    };
}
