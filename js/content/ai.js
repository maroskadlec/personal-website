/* The AI workflow is described by what happens, never by which product does it: the tools
   change every few weeks, the method does not. Plain text, **word** is highlighted. */
export const ai = {
    lead: 'AI is not one step in my process, it runs through all of them. The tools change every few weeks, so I describe the workflow by what I do, not by what I use.',
    workflow: [
        { stage: 'discover', text: 'AI reads and clusters the research, I decide **what matters**' },
        { stage: 'define', text: 'UX copy, specs and edge cases: AI drafts, **I edit**' },
        { stage: 'design', text: 'states and variants explored with AI, **curated by hand**' },
        { stage: 'build', text: '**real components in real code**, AI as pair programmer' },
        { stage: 'verify', text: 'AI hunts edge cases and accessibility gaps, I check **in the browser**' },
        { stage: 'ship', text: "**pull requests into the project's codebase**, AI-assisted, reviewed like any other code" }
    ],
    delivery: "straight into the project's codebase, not only into Figma",
    result: { text: 'idea → testable prototype', gain: '~3× faster' },
    /* a snapshot, not a promise: it changes more often than this website */
    stackNote: 'in rotation right now, changes more often than this website',
    stack: [
        { path: '/usr/local/bin/', name: 'claude', note: '# pair-designer with opinions' },
        { path: '/usr/local/bin/', name: 'cursor', note: '# where the code happens' },
        { path: '/Applications/', name: 'Figma.app', note: '# where the pixels happen' },
        { path: '/usr/local/bin/', name: 'vercel', note: '# ships it on friday anyway' },
        { path: '/usr/bin/', name: 'git', note: '# versions all the mistakes' }
    ]
};
