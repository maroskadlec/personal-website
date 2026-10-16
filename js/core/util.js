/* Small shared helpers: escaping, timing, safe storage, reduced-motion check. */

export const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** content strings are plain text with one piece of markup: **word** is highlighted */
export const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="hl">$1</span>');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const params = new URLSearchParams(location.search);

export const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('rm');

/** true on a connection where background downloads would cost the visitor: data saver on, or 2G / 3G */
export const slowConnection = () => {
    const c = navigator.connection;
    return !!c && (c.saveData === true || /^(slow-2g|2g|3g)$/.test(c.effectiveType || ''));
};

/** run something when the browser has nothing better to do (a short wait where idle callbacks do not exist) */
export const whenIdle = (fn, timeout = 4000) => ('requestIdleCallback' in window ? window.requestIdleCallback(fn, { timeout }) : setTimeout(fn, 1500));

const sheets = new Map();
/** add a stylesheet once; resolves when it has loaded (a missing one resolves too: the page shows unstyled instead of waiting forever) */
export const loadCss = (href) => {
    if (!sheets.has(href)) {
        sheets.set(href, new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = link.onerror = () => resolve();
            document.head.appendChild(link);
        }));
    }
    return sheets.get(href);
};

/* "Block all cookies" (and some sandboxes) make even touching window.localStorage throw, so the area is looked up on every use, inside the try */
const wrap = (name) => ({
    get(k) { try { return window[name].getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window[name].setItem(k, v); } catch (e) { /* private mode or blocked: nothing is remembered */ } },
    del(k) { try { window[name].removeItem(k); } catch (e) { /* ignore */ } }
});
export const local = wrap('localStorage');
export const session = wrap('sessionStorage');

/** type text into an element one character at a time; resolves when done (or at once if skip() is true) */
export function typeInto(el, text, { speed = 30, jitter = 45, skip = () => false, onChar = null } = {}) {
    return new Promise((resolve) => {
        let i = 0;
        (function step() {
            if (skip()) { el.textContent = text; return resolve(); }
            if (i >= text.length) return resolve();
            el.textContent += text.charAt(i++);
            if (onChar) onChar();
            setTimeout(step, speed + Math.random() * jitter);
        })();
    });
}
