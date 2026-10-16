/* One source of truth for who this is. Both modes (Desktop and Terminal) read it. */
export const profile = {
    name: 'Marian Kadlec',
    title: 'Senior digital designer for ambitious brands and digital products.',
    tagline: ['Years at the seam between design and code.', 'Now AI lets me cross it myself.'],     // one sentence per line
    kicker: 'Marian Kadlec · Senior Product Designer · Prague',      // the line above the name on the 2008 page
    place: 'Prague, CZ',
    years: '15',
    email: 'marian.kadlec@icloud.com',
    photo: 'img/marian-kadlec-profile-image.webp',
    about: [
        { text: 'With 15+ years of experience in digital design, I bring a unique combination of strategic thinking, technical expertise, and creative vision to every project.' },
        { text: 'Design systems, design tokens, component libraries, close work with front-end teams: for years my work has sat exactly on the line between design and code.' },
        { ai: true, text: "I'm an AI enthusiast, and it has changed what a designer can do. With AI as a pair programmer I'm back in the front-end: building components, layouts and working prototypes in real code, and delivering straight into a project's codebase instead of only into Figma." },
        { text: "I work alongside engineers, not instead of them: what I hand over is code they can review, not a spec they have to interpret." },
        { text: 'Funnily enough, I often ended up working on redesigns of products and brands.' }
    ]
};
