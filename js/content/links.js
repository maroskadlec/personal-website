export const links = [
    { key: 'linkedin', label: 'LinkedIn profile', url: 'https://www.linkedin.com/in/marian-kadlec/' },
    { key: 'github', label: 'GitHub profile', url: 'https://github.com/maroskadlec' },
    { key: 'dribbble', label: 'Dribbble portfolio', url: 'https://dribbble.com/mariankadlec' },
    { key: 'market', label: 'Design Marketplace', url: 'https://elements.envato.com/user/maroskadlec/graphic-templates' }
];

export const linkByKey = (key) => links.find((l) => l.key === key);
