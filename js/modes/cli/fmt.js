/* The little HTML helpers every Terminal line is made of: colours by role, and a safe link. */
import { esc } from '../../core/util.js';

export const ok = (s) => `<span class="ok">${s}</span>`;
export const dim = (s) => `<span class="dim">${s}</span>`;
export const faint = (s) => `<span class="faint">${s}</span>`;
export const hl = (s) => `<span class="hl">${s}</span>`;
export const a = (url, label) => (/^mailto:/i.test(url)
    ? `<a href="${esc(url)}">${esc(label)}</a>`
    : `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}<span class="sr-only"> (opens in a new tab)</span></a>`);
