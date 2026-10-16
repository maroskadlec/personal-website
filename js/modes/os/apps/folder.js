/* ==========================================================================
   FOLDER WINDOWS — a folder, the disk or the Trash opened in a window, as
   icons or as a list. The header strip counts the items, like a real Finder.
   ========================================================================== */
import { FS, TRASH } from '../fs.js';
import { Store } from '../../../core/store.js';
import { createIconView } from '../iconview.js';

const mb = (k) => (k / 1024).toFixed(1) + ' MB';

export function openFolder(sys, node, { from } = {}) {
    const t = FS.resolve(node);
    const id = 'folder:' + t.id;
    const views = Store.get('views', {});
    const mode = views[t.id] || 'icons';
    const projects = t.id === 'projects';                      // the tokens in one row

    const win = sys.openWindow({
        id,
        title: t.name,
        kind: t.id === TRASH ? 'trash' : 'folder',
        mem: 410,
        w: mode === 'list' ? 540 : projects ? 600 : 440,
        h: projects && mode === 'icons' ? 214 : 310,
        minW: 240,
        minH: 150,
        scroll: true,
        resizable: true,
        info: true,
        from,
        onClose: () => { view?.destroy(); off?.(); }
    });
    if (!win) return null;
    if (win.view) return win;                                  // already open: it just came to the front

    const holder = document.createElement('div');
    win.scroller.appendChild(holder);

    const info = () => {
        const n = FS.children(t.id).length;
        const d = FS.disk();
        win.setInfo(`${n} item${n === 1 ? '' : 's'}`, t.id === TRASH ? '' : `${mb(d.used)} in disk, ${mb(d.free)} available`);
        win.sb?.sync();
    };
    const view = createIconView({
        el: holder,
        parentId: t.id,
        mode,
        sys: {
            ...sys,
            onViewRender: info,
            onSelect: (v) => sys.onSelect?.(v),
            setActiveView: (v) => sys.setActiveView(v)
        }
    });
    win.view = view;
    win.nodeId = t.id;
    view.focusFirst();                                         // keyboard users land on the first item
    // the window knows its own view: focusing the window makes it the one menus talk to
    win.el.addEventListener('pointerdown', () => sys.setActiveView(view), true);
    win.el.addEventListener('focusin', () => sys.setActiveView(view));

    const off = FS.on(() => {
        if (!FS.has(t.id)) { win.close({ quiet: true }); return; }
        if (FS.node(t.id).name !== win.title) win.setTitle(FS.node(t.id).name);
    });
    info();
    sys.setActiveView(view);
    return win;
}

/** View menu: icons or list, remembered per folder */
export function setFolderView(win, mode) {
    if (!win || !win.view) return;
    win.view.setMode(mode);
    const views = Store.get('views', {});
    views[win.nodeId] = mode;
    Store.set('views', views);
    win.sb?.sync();
}
