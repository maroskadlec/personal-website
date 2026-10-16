/* ==========================================================================
   GET INFO — the information window of any icon: kind, size, where it lives,
   when it changed and a comment.
   ========================================================================== */
import { FS } from '../fs.js';
import { kb } from '../memory.js';
import { artHTML } from '../iconview.js';
import { esc } from '../../../core/util.js';

export function openInfo(sys, node, { from } = {}) {
    const t = FS.resolve(node);
    const win = sys.openWindow({
        id: 'info:' + node.id,
        title: `${node.name} Info`,
        kind: 'info',
        mem: 180,
        w: 320,
        h: 330,
        scroll: false,
        resizable: false,
        from
    });
    if (!win || win.drawn) return win;
    win.drawn = true;

    const size = FS.size(t);
    const where = node.kind === 'alias' ? FS.path(FS.resolve(node).id) : FS.path(node.parent) || 'Desktop';
    const rows = [
        ['Kind', node.kind === 'alias' ? 'Alias' : FS.kindLabel(t)],
        ['Size', size ? `${kb(size)} on disk` : '—'],
        ['Where', where.replace(/:/g, ' ▸ ') || 'Desktop'],
        ['Modified', FS.years(t) || FS.modified(node)]
    ];
    if (node.kind === 'alias') rows.splice(1, 0, ['Original', t.name]);
    win.setContent(
        `<div class="info">
            <div class="info-head"><span class="info-art">${artHTML(t)}</span><span class="info-name">${esc(node.name)}</span></div>
            <dl class="info-rows">${rows.map(([k, v]) => `<dt>${esc(k)}:</dt><dd>${esc(v)}</dd>`).join('')}</dl>
            <div class="info-comments"><span>Comments:</span><div class="info-comment">${esc(t.comment || node.comment || '')}</div></div>
            <label class="chk is-static"><input type="checkbox" disabled${t.protected ? ' checked' : ''}><span class="chk-box"></span><span>Locked</span></label>
        </div>`
    );
    return win;
}
