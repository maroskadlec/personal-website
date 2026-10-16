/* Grouped like a directory listing: design/, build/, ai/. Plain text, **word** is highlighted. */
export const skills = [
    {
        group: 'design',
        items: [
            'UX and UI design, prototyping and testing, aimed at business results',
            'Product redesigns of portals, platforms and brands',
            'Design systems: components, tokens, variables and styles',
            'Handoff and support, now also straight into code'
        ]
    },
    {
        group: 'build',
        items: [
            'Front-end with AI as pair programmer: **JavaScript, TypeScript, React**, HTML and CSS',
            'Design to code: working components instead of hand-off files',
            'Delivery into the codebase: git, pull requests, code review',
            'Vibe coding for fast, working prototypes'
        ]
    },
    {
        group: 'ai',
        items: [
            'AI in every step: research, UX writing, prototyping, QA',
            'Trying, comparing and swapping AI tools as they appear'
        ]
    }
];

export const skillCount = skills.reduce((n, g) => n + g.items.length, 0);
