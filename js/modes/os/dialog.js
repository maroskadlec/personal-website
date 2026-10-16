/* ==========================================================================
   DIALOGS — the classic modal alert: an icon, a message, buttons, the default
   button ringed. Enter presses the default, Escape the cancel button, Tab stays
   inside, and everything behind the dialog is inert until it is answered.
   Dialogs queue: a second one waits for the first.
   ========================================================================== */
import { Icons } from '../../gfx/icons.js';
import { Sound } from '../../core/sound.js';
import { esc, reducedMotion } from '../../core/util.js';

export function createDialogs({ layer, behind }) {
    let queue = Promise.resolve();
    let current = null;

    function run(o) {
        return new Promise((resolve) => {
            const {
                icon = 'note',
                message = '',
                detail = '',
                buttons = [{ label: 'OK', value: true, primary: true }],
                beep = icon === 'stop' || icon === 'caution'
            } = o;
            const before = document.activeElement;
            const wrap = document.createElement('div');
            wrap.className = 'dlg-backdrop';
            const idm = 'dlgm' + Math.random().toString(36).slice(2, 7);
            wrap.innerHTML =
                `<div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="${idm}"${detail ? ` aria-describedby="${idm}d"` : ''}>` +
                `<div class="dlg-icon">${icon && Icons[icon] ? Icons[icon]('') : ''}</div>` +
                `<div class="dlg-text"><p class="dlg-msg" id="${idm}">${esc(message)}</p>${detail ? `<p class="dlg-detail" id="${idm}d">${esc(detail)}</p>` : ''}</div>` +
                `<div class="dlg-buttons">${buttons.map((b, i) => `<button class="btn${b.primary ? ' is-default' : ''}" type="button" data-i="${i}">${esc(b.label)}</button>`).join('')}</div></div>`;
            layer.appendChild(wrap);
            behind.forEach((el) => { el.inert = true; });

            const primary = buttons.findIndex((b) => b.primary);
            const cancel = buttons.findIndex((b) => b.cancel);
            const btns = Array.from(wrap.querySelectorAll('.btn'));

            const finish = (i) => {
                wrap.removeEventListener('keydown', onKey);
                wrap.remove();
                behind.forEach((el) => { el.inert = false; });
                current = null;
                if (before && before.isConnected && before.focus) before.focus({ preventScroll: true });
                resolve(buttons[i] ? buttons[i].value : false);
            };
            const onKey = (e) => {
                if (e.key === 'Enter' && primary >= 0 && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); finish(primary); }
                else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(cancel >= 0 ? cancel : primary >= 0 ? primary : 0); }
                else if (e.key === 'Tab') {
                    e.preventDefault();
                    const i = btns.indexOf(document.activeElement);
                    btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
                }
            };
            wrap.addEventListener('keydown', onKey);
            btns.forEach((b) => b.addEventListener('click', () => finish(Number(b.dataset.i))));
            // a click outside the box only complains, like a real modal dialog
            wrap.addEventListener('pointerdown', (e) => {
                if (e.target !== wrap) return;
                Sound.beep();
                if (reducedMotion()) return;                      // the beep says it; no shaking for people who asked for less motion
                const box = wrap.querySelector('.dlg');
                box.classList.remove('is-nudge');
                void box.offsetWidth;
                box.classList.add('is-nudge');
            });

            current = { finish: () => finish(cancel >= 0 ? cancel : primary >= 0 ? primary : 0) };
            if (beep) Sound.beep();
            (btns[primary >= 0 ? primary : 0]).focus();
        });
    }

    /** the classic Save box: where it goes (just a label), what is there, and the name to give. Resolves the name, or null. */
    function runSave({ prompt, name, where, items = [], save = 'Save', cancel = 'Cancel' }) {
        return new Promise((resolve) => {
            const before = document.activeElement;
            const wrap = document.createElement('div');
            wrap.className = 'dlg-backdrop';
            const idm = 'dlgs' + Math.random().toString(36).slice(2, 7);
            wrap.innerHTML =
                `<div class="dlg dlg--save" role="dialog" aria-modal="true" aria-labelledby="${idm}">` +
                `<div class="sv-where" aria-hidden="true">${Icons.folder('')}<span>${esc(where)}</span></div>` +
                `<ul class="sv-list" aria-hidden="true">${items.map((it) => `<li class="${it.folder ? 'is-folder' : 'is-file'}">${it.art}<span>${esc(it.name)}</span></li>`).join('')}</ul>` +
                `<label class="sv-field"><span id="${idm}">${esc(prompt)}</span><input type="text" value="${esc(name)}" spellcheck="false" autocomplete="off" autocapitalize="off"></label>` +
                `<div class="dlg-buttons"><button class="btn" type="button" data-act="cancel">${esc(cancel)}</button><button class="btn is-default" type="button" data-act="save">${esc(save)}</button></div></div>`;
            layer.appendChild(wrap);
            behind.forEach((el) => { el.inert = true; });

            const input = wrap.querySelector('input');
            const btns = Array.from(wrap.querySelectorAll('.btn'));
            const order = [input, ...btns];
            const finish = (ok) => {
                const v = input.value.trim();
                wrap.removeEventListener('keydown', onKey);
                wrap.remove();
                behind.forEach((el) => { el.inert = false; });
                current = null;
                if (before && before.isConnected && before.focus) before.focus({ preventScroll: true });
                resolve(ok && v ? v : null);
            };
            const onKey = (e) => {
                if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); finish(true); }
                else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
                else if (e.key === 'Tab') {
                    e.preventDefault();
                    const i = order.indexOf(document.activeElement);
                    order[(i + (e.shiftKey ? -1 : 1) + order.length) % order.length].focus();
                }
            };
            wrap.addEventListener('keydown', onKey);
            wrap.querySelector('[data-act="save"]').addEventListener('click', () => finish(true));
            wrap.querySelector('[data-act="cancel"]').addEventListener('click', () => finish(false));
            wrap.addEventListener('pointerdown', (e) => {
                if (e.target !== wrap) return;
                Sound.beep();
                if (reducedMotion()) return;                      // the beep says it; no shaking for people who asked for less motion
                const box = wrap.querySelector('.dlg');
                box.classList.remove('is-nudge');
                void box.offsetWidth;
                box.classList.add('is-nudge');
            });
            current = { finish: () => finish(false) };
            input.focus();
            // the name is selected up to its dot, so typing replaces "Marian Kadlec" and keeps ".vcf"
            const dot = name.lastIndexOf('.');
            input.setSelectionRange(0, dot > 0 ? dot : name.length);
        });
    }

    const show = (o) => {
        const p = queue.then(() => run(o));
        queue = p.catch(() => {});
        return p;
    };

    return {
        show,
        alert: (message, o = {}) => show({ icon: 'note', message, ...o }),
        stop: (message, detail) => show({ icon: 'stop', message, detail }),
        caution: (message, detail) => show({ icon: 'caution', message, detail }),
        /** OK / Cancel; resolves true or false */
        confirm: (message, { detail = '', ok = 'OK', cancel = 'Cancel', icon = 'caution' } = {}) => show({
            icon, message, detail, buttons: [{ label: cancel, value: false, cancel: true }, { label: ok, value: true, primary: true }]
        }),
        save: (o) => {
            const p = queue.then(() => runSave(o));
            queue = p.catch(() => {});
            return p;
        },
        /** close whatever is open (Restart, mode switch) */
        closeAll() { if (current) current.finish(); },
        get open() { return !!current; }
    };
}
