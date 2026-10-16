/* ==========================================================================
   COMMANDS — everything the Terminal understands, written down once. The
   Commands file on the Desktop (modes/os/apps/doc.js) is made from this, so a
   new command only needs a line here to be found. One command is left out
   on purpose; the file says so.
   ========================================================================== */
export const commands = {
    title: 'Terminal commands',
    intro: 'Everything the Terminal understands. Open it with the Terminal icon, or press ` on a keyboard.',
    groups: [
        {
            title: 'About me',
            items: [
                { cmd: 'whoami', note: 'who this is, in one line' },
                { cmd: 'skills', note: 'design, build and AI, grouped' },
                { cmd: 'ai', note: 'how the AI workflow actually works' },
                { cmd: 'stack', note: 'what is in the toolbox this month' },
                { cmd: 'career', alias: 'git log', note: 'the redesigns, as a git log' },
                { cmd: 'hire', alias: 'contact', note: 'availability, and how to reach me' },
                { cmd: 'links', note: 'LinkedIn, GitHub, Dribbble and the design marketplace' },
                { cmd: 'linkedin', alias: 'github · dribbble · market', note: 'open that profile in a new tab' }
            ]
        },
        {
            title: 'Look around the Desktop',
            items: [
                { cmd: 'ls [folder]', note: 'what is here. ls projects lists the projects with their years' },
                { cmd: 'cd <folder>', note: 'go into a folder. cd .. goes back, cd ~ goes home' },
                { cmd: 'pwd', note: 'where you are' },
                { cmd: 'cat <name>', note: 'a few words about an item. cat about.md tells the story' },
                { cmd: 'open <name>', note: 'open it on the Desktop: open atmoskop, open services, open why me' }
            ]
        },
        {
            title: 'The machine',
            items: [
                { cmd: 'help', note: 'the short list of commands' },
                { cmd: 'gui', alias: 'startx · desktop', note: 'back to the Desktop (the ` key does it too)' },
                { cmd: 'theme [name]', note: 'mono, green, amber, blue, light or claude' },
                { cmd: 'rebuild', note: 'watch the site build itself again' },
                { cmd: 'history', alias: 'clear', note: 'what you typed · a clean screen' },
                { cmd: 'reboot', alias: 'shutdown', note: 'restart the machine · switch it off' },
                { cmd: 'exit', note: 'try it' }
            ]
        },
        {
            title: 'For fun',
            items: [
                { cmd: 'fortune', note: 'a line of wisdom, a different one each time' },
                { cmd: 'ping client', note: 'is the client there?' },
                { cmd: 'neofetch', note: 'this machine, in a few lines' },
                { cmd: 'coffee', note: 'ask for a coffee' },
                { cmd: 'vibe', note: 'today\'s vibe level' },
                { cmd: 'sudo <command>', note: 'ask the machine for more permissions. sudo make me a sandwich is a good start' }
            ]
        }
    ],
    keys: 'Tab completes a command or a name. The up and down arrows bring back what you typed before. Esc closes the output.',
    secret: 'One more command is not listed here, on purpose. Do not try it.'
};
