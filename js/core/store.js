/* ==========================================================================
   STORE — what the Desktop remembers.
   persisted (localStorage):  settings, icon positions, labels, folder views,
                              window geometry, folders the visitor created
   session   (sessionStorage): renames, moves and the Trash of the built-in items,
                              so closing the tab always gives back a complete portfolio
   ========================================================================== */
const LS = 'mk10.os.v1';
const SS = 'mk10.os.session.v1';

const read = (area, key) => {
    try { return JSON.parse(window[area].getItem(key)) || {}; } catch (e) { return {}; }       // blocked storage throws even on access: the Desktop then simply remembers nothing
};
let persisted = read('localStorage', LS);
let session = read('sessionStorage', SS);

let timer = 0;
function flush() {
    clearTimeout(timer);
    timer = 0;
    try { window.localStorage.setItem(LS, JSON.stringify(persisted)); } catch (e) { /* private mode or blocked */ }
    try { window.sessionStorage.setItem(SS, JSON.stringify(session)); } catch (e) { /* private mode or blocked */ }
}
const schedule = () => { if (!timer) timer = setTimeout(flush, 200); };
window.addEventListener('pagehide', flush);

export const Store = {
    get(key, fallback) { return persisted[key] === undefined ? fallback : persisted[key]; },
    set(key, value) { persisted[key] = value; schedule(); },

    sget(key, fallback) { return session[key] === undefined ? fallback : session[key]; },
    sset(key, value) { session[key] = value; schedule(); },

    /** forget everything (Special > Reset Desktop) */
    reset() {
        persisted = {};
        session = {};
        flush();
    },
    flush
};
