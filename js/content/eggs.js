/* ==========================================================================
   EGGS — the words of the easter eggs, all in one place so they are easy to
   read, approve and change. Nothing here is from the old site: it is new, dry,
   and written in the voice of a designer who builds things.
   (docs/M5-texty.md lists the same lines for review.)
   ========================================================================== */

/* ---------- the Trash starts full: what a designer's Trash really holds ---------- */
export const relics = [
    {
        id: 'relic-psd',
        name: 'client_feedback_FINAL_v47_opravdu_final.psd',
        icon: 'psd',
        size: 183402,
        modified: 'Mar 3, 2011',
        comment: 'Round 47 of the feedback.',
        message: '“client_feedback_FINAL_v47_opravdu_final.psd” can\'t be opened.',
        detail: 'Version 48 is already on its way.'
    },
    {
        id: 'relic-swf',
        name: 'flash_intro.swf',
        icon: 'swf',
        size: 2114,
        modified: 'Sep 21, 2009',
        comment: 'Skip intro.',
        message: '“flash_intro.swf” can\'t be opened.',
        detail: 'Flash was retired in 2020. The “Skip intro” button lives on in spirit.'
    },
    {
        id: 'relic-ai',
        name: 'logo_v3_FINAL_2.ai',
        icon: 'ai',
        size: 12044,
        modified: 'Jun 14, 2012',
        comment: 'Version 3, final, second try.',
        message: '“logo_v3_FINAL_2.ai” can\'t be opened.',
        detail: 'The client has since gone back to version 1.'
    },
    {
        id: 'relic-gif',
        name: 'banner_468x60_FINAL.gif',
        icon: 'gif',
        size: 436,
        modified: 'Nov 2, 2008',
        comment: '468 × 60 pixels of 2008.',
        message: '“banner_468x60_FINAL.gif” can\'t be opened.',
        detail: 'Congratulations! You are the 1,000,000th visitor to try.'
    }
];

/* ---------- the bomb ---------- */
export const bomb = {
    message: 'Sorry, a system error occurred.',
    restart: 'Restart',
    detail: {
        generic: '“Out of coffee.”',
        doNotOpen: '“Curiosity killed the desktop.”',
        rm: '“Everything, as requested.”'
    }
};

/* ---------- the hidden file (the Konami code: up up down down left right left right B A) ---------- */
export const secret = {
    id: 'donotopen',
    name: 'Do Not Open',
    comment: 'I mean it.',
    found: 'Something appeared on the desktop.',
    here: 'It is already on the desktop.'
};

/* ---------- a nudge for the curious: the console (for developers) and one line in About This Computer ---------- */
export const hints = {
    about: 'One more file lives on this computer, out of sight. The old arcade code finds it. So does tapping the clock five times.',
    console: 'Looking for something?  ↑ ↑ ↓ ↓ ← → ← → B A   (on a phone: tap the clock five times)'
};

/* ---------- Balloon Help ---------- */
export const balloons = {
    about: {
        message: 'Balloon Help',
        detail: 'Switch it on, point at something, and a few words say what it does.'
    },
    desktop: 'The desktop. Drag things around, or throw them in the Trash.',
    folder: 'A folder. Double-click to see what is inside.',
    alias: 'An alias. Double-click opens the original.',
    close: 'Click here to close this window.',
    zoom: 'Click here to make this window bigger or smaller.',
    grow: 'Drag here to change the size of this window.',
    title: 'Drag to move this window. Double-click to roll it up.',
    scroll: 'The scroll bar: click an arrow or drag the box to see more.',
    clock: 'The time. General Controls changes how it is shown.',
    menus: {
        pear: 'The Marian menu: about this computer, how to contact Marian, the control panels, a puzzle, the Terminal.',
        file: 'File: open, rename or throw away the selected icon, and save the contact.',
        edit: 'Edit: cut, copy and paste. There is not much to cut here.',
        view: 'View: show a folder window as icons or as a list.',
        label: 'Label: give the selected icons a color.',
        special: 'Special: empty the Trash, restart, shut down.',
        help: 'Balloon Help: you are using it.'
    }
};

/* ---------- Save Contact As… ---------- */
export const saveAs = {
    prompt: 'Save this contact as:',
    file: 'Marian Kadlec.vcf',
    where: 'Desktop',
    save: 'Save',
    cancel: 'Cancel'
};

/* ---------- Terminal humor (js/modes/cli/humor.js) ---------- */
export const fortunes = [
    'The best design system is the one the engineers actually use.',
    'There is no such thing as a small change in a design system.',
    '“Can you make the logo bigger?” is not a bug. It is a feature of the species.',
    'Ship it. Then redesign it.',
    'Every redesign is a first draft of the next one.',
    'Nothing is as permanent as the placeholder text.',
    'If it only works in the mockup, it is a mockup.',
    'Good design is invisible. Great design is invisible and passes the accessibility audit.',
    'Tokens are just names for decisions you already made.',
    'The AI wrote the first draft. The pull request review wrote the second.',
    'Dark mode is a feature until someone asks for light mode.',
    'Lorem ipsum dolor sit amet, and then somebody forgot to replace it.',
    'Version 48 is already on its way.',
    'Done is better than perfect. Merged is better than done.'
];

export const ping = {
    usage: 'usage: ping client',
    unknown: (host) => `ping: unknown host ${host}`,
    hint: '(try: ping client)',
    head: 'PING client (10.0.0.1): 56 data bytes',
    replies: [
        { ms: '0.4', say: 'looks great, one small thing' },
        { ms: '0.4', say: 'can the logo be bigger?' },
        { ms: '0.5', say: 'quick call, five minutes?' }
    ],
    stats: ['--- client ping statistics ---', '3 packets transmitted, 3 received, 0% packet loss, one more small change pending']
};

export const neofetch = {
    os: 'Marian OS 7.5.5-vibe',
    host: 'one very patient CRT',
    shell: 'marian-sh',
    fonts: 'Jersey 10, Atkinson Hyperlegible Next, JetBrains Mono',
    coffee: '418 (teapot)',
    // a pear: the brand mark of this computer, in letters
    art: [
        '        ,;       ',
        '       /         ',
        '     .-"-.       ',
        '    /     \\      ',
        '   |       |     ',
        "   '.     .'     ",
        "   .'     '.     ",
        '  /         \\    ',
        ' |           |   ',
        ' |           |   ',
        '  \\         /    ',
        "   '._____.'     "
    ]
};

export const coffee = {
    brew: '☕ brewing…',
    error: 'error: designer already over-caffeinated.',
    teapot: 'HTTP 418: I\'m a teapot. Short and stout.'
};

export const sudo = {
    nope: ['Nice try.', 'Permission denied (designers only).'],
    sandwich: 'Okay.',
    rmDenied: 'rm: cannot remove \'/\': Operation not permitted',
    rmHint: 'this is a portfolio, not a sandbox (try sudo, if you dare)',
    rmLines: ['[sudo] password for marian: ********', 'removing /usr…', 'removing /home…', 'removing /portfolio…']
};

export const git = {
    usage: 'usage: git log',
    only: 'only `git log` is installed here'
};

export const more = 'every command is listed in the Commands file on the Desktop: open commands';

/* ---------- Credits (seven clicks on the pear in About This Computer) ---------- */
export const credits = {
    title: 'Credits',
    lines: [
        { head: 'Marian OS 7.5.5-vibe' },
        { text: 'Designed and built by Marian Kadlec, with AI as a pair programmer.' },
        { key: 'Type', text: 'Jersey 10, Atkinson Hyperlegible Next and JetBrains Mono.' },
        { key: 'Motion', text: 'GSAP.' },
        { key: 'Sound', text: 'Synthesised in the browser. No samples.' },
        { key: 'Pixels', text: 'Icons drawn in code, pictures dithered on the fly.' },
        { key: 'Thanks', text: 'To every client who ever said “one small change”.' }
    ]
};

/* ---------- Puzzle (Pear menu) ---------- */
export const puzzle = {
    label: 'Sliding puzzle: fifteen tiles of a portrait and one gap. The arrow keys slide a tile into the gap.',
    shuffle: 'Shuffle',
    start: 'Shuffle to start.',
    moves: (n) => `${n} ${n === 1 ? 'move' : 'moves'}`,
    solved: (n) => `Solved in ${n} ${n === 1 ? 'move' : 'moves'}.`
};
