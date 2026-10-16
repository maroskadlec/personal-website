/* ==========================================================================
   THE DESKTOP MANIFEST — every icon on this computer is a few lines here.
   kind   disk | trash | folder | sysfolder | doc | app | control | stack | alias
   place  where it sits on the desktop first (left/top, or right/top, or right/bottom)
   open   what a double-click does:
            { type: 'folder' }                 a folder window
            { type: 'doc', ref }               a document window (js/modes/os/apps/doc.js)
            { type: 'scrapbook' }              the Scrapbook with the eight reasons (apps/scrapbook.js)
            { type: 'alert', message, detail } an alert box and nothing else (the relics in the Trash)
            { type: 'crash', detail }          the system error; detail is a key of bomb.detail in eggs.js (Do Not Open)
            { type: 'browser' }                the Browser with the 2008 website (apps/browser.js)
            { type: 'project' }                a project window (apps/project.js), data from js/content/work.js
            { type: 'control', panel }         a control panel
            { type: 'mode', mode: 'cli' }      switch to the Terminal
            { type: 'soon' }                   "arrives with the next update"
   secret true: the item does not exist until the visitor finds it (FS.unlock), and stays found
   size   in K (folders add up their contents), role/years describe a project
   Names stay neutral on purpose: no Apple names, fonts or sounds, and every icon is drawn here in code.
   The boot mascot is a smiling compact computer, our own pixel drawing in the spirit of the classics (kept on purpose, 2026-10-16).
   ========================================================================== */
import { work } from './work.js';
import { services, process as steps, whyme } from './services.js';
import { relics, secret } from './eggs.js';

export const BUILD_DATE = 'Oct 16, 2026';

export const nodes = [
    // ---- the desktop itself ----
    { id: 'me', name: 'Marian Kadlec', kind: 'app', icon: 'portrait', hero: true, protected: true, parent: 'desktop', place: { left: 22, top: 20 }, size: 1840, open: { type: 'browser' }, comment: 'The 2008 version of this website. Senior digital designer from Prague, over 15 years of making products look and work better.' },
    { id: 'projects', name: 'Projects', kind: 'folder', parent: 'desktop', place: { left: 22, top: 116 }, comment: 'Product redesigns and design systems.' },
    { id: 'services', name: 'Services', kind: 'doc', icon: 'services', parent: 'desktop', place: { left: 22, top: 212 }, size: 6, open: { type: 'doc', ref: 'services' }, comment: services.intro },
    { id: 'process', name: 'Process', kind: 'doc', icon: 'process', parent: 'desktop', place: { left: 22, top: 308 }, size: 5, open: { type: 'doc', ref: 'process' }, comment: steps.intro },
    { id: 'whyme', name: 'Why Me', kind: 'doc', label: 'Scrapbook', icon: 'scrapbook', parent: 'desktop', place: { left: 22, top: 404 }, size: 38, open: { type: 'scrapbook' }, comment: whyme.intro },
    { id: 'terminal', name: 'Terminal', kind: 'app', icon: 'terminal', parent: 'desktop', place: { left: 134, top: 20 }, size: 612, open: { type: 'mode', mode: 'cli' }, comment: 'The text-based version of this site. Press ` anywhere to switch between the two.' },
    { id: 'readme', name: 'Read Me', kind: 'doc', parent: 'desktop', place: { left: 134, top: 116 }, size: 4, open: { type: 'doc', ref: 'readme' }, comment: 'Start here.' },
    { id: 'links', name: 'Links', kind: 'doc', icon: 'links', parent: 'desktop', place: { left: 134, top: 212 }, size: 2, open: { type: 'doc', ref: 'links' }, comment: 'LinkedIn, GitHub, Dribbble and the design marketplace.' },
    { id: 'commands', name: 'Commands', kind: 'doc', icon: 'commands', parent: 'desktop', place: { left: 134, top: 308 }, size: 3, open: { type: 'doc', ref: 'commands' }, comment: 'Everything the Terminal understands.' },
    // the hidden file: the Konami code makes it appear (see js/core/konami.js); on a phone it lands after Commands
    { id: secret.id, name: secret.name, kind: 'doc', icon: 'donotopen', secret: true, parent: 'desktop', place: { right: 14, bottom: 122 }, size: 1, comment: secret.comment, open: { type: 'crash', detail: 'doNotOpen' } },
    { id: 'hd', name: 'Marian HD', kind: 'disk', parent: 'desktop', place: { right: 14, top: 14 }, protected: true, comment: 'The startup disk.' },
    { id: 'trash', name: 'Trash', kind: 'trash', parent: 'desktop', place: { right: 14, bottom: 16 }, protected: true, comment: 'Things you throw away wait here until you empty it.' },

    // ---- projects: one stack per role, straight from js/content/work.js ----
    ...work.roles.map((r) => ({
        id: r.id, name: r.name, kind: 'stack', parent: 'projects', role: r.role, years: r.years, image: r.image,
        open: { type: 'project' }
    })),

    // ---- the Trash starts full of what a designer's Trash holds (words in js/content/eggs.js) ----
    ...relics.map((r) => ({
        id: r.id, name: r.name, kind: 'doc', icon: r.icon, parent: 'trash', size: r.size, modified: r.modified, comment: r.comment,
        open: { type: 'alert', message: r.message, detail: r.detail }
    })),

    // ---- the disk ----
    { id: 'apps', name: 'Applications', kind: 'folder', parent: 'hd', comment: 'Programs on this disk.' },
    { id: 'apps-me', name: 'Marian Kadlec', kind: 'alias', target: 'me', parent: 'apps' },
    { id: 'apps-terminal', name: 'Terminal', kind: 'alias', target: 'terminal', parent: 'apps' },
    { id: 'system', name: 'System Folder', kind: 'sysfolder', parent: 'hd', protected: true, comment: 'Marian OS keeps its parts here.' },
    { id: 'controls', name: 'Control Panels', kind: 'folder', icon: 'controls', parent: 'system', comment: 'Change how this computer looks and sounds.' },
    { id: 'cp-general', name: 'General Controls', kind: 'control', parent: 'controls', size: 24, open: { type: 'control', panel: 'general' }, comment: 'Clock, window dragging, menu blinking and the screen saver.' },
    { id: 'cp-monitors', name: 'Monitors', kind: 'control', parent: 'controls', size: 48, open: { type: 'control', panel: 'monitors' }, comment: 'Brightness and the glass of the screen.' },
    { id: 'cp-patterns', name: 'Desktop Patterns', kind: 'control', parent: 'controls', size: 36, open: { type: 'control', panel: 'patterns' }, comment: 'Choose what the desktop is made of.' },
    { id: 'cp-sound', name: 'Sound', kind: 'control', parent: 'controls', size: 30, open: { type: 'control', panel: 'sound' }, comment: 'Volume and the alert sound.' },
    { id: 'hd-readme', name: 'Read Me', kind: 'alias', target: 'readme', parent: 'hd' }
];
