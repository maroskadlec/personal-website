/* ==========================================================================
   WORK — the journey and the roles, word for word from the previous site
   (git show 56f747f:index.html). The Desktop shows the roles as project windows
   and the 2008 website as its Work page; the data lives here once.
   Two things are not from the old site: Team Assistant ends in 2025, so its
   sentences are in the past tense, and Slevomat (since 2025) was written from
   the LinkedIn paragraph Marian gave, and its token is drawn from his logo by
   _tools/slevomat-token.py (a card in perspective; the others are renders).
   A role without `image` has no token: its icon is the plain stack and its
   window shows just the words.
   ========================================================================== */
export const work = {
    journey: {
        title: 'My design journey and professional background',
        intro: "Over the course of my career, I've had the chance to work as a visual, UI, or UX designer on a wide range of projects across different industries:",
        industries: ['digital marketing', 'e-commerce', 'foodies', 'insurance', 'fintech', 'startups', 'job markets', 'low-code platforms', 'information systems', 'development'],
        setups: "I've worked with both well-established companies and fast-growing startups, in both async and sync setups. I was usually part of agile teams, responsible for the entire design process and later also for getting it into production.",
        process: 'I have solid experience across the whole design process – from early idea phases, through research, user studies, testing, and iterations, all the way to final prototypes and handoff materials for the dev team. That includes everything from precisely defined styles and components to detailed specs for features and behaviors of individual elements.',
        skills: ['UX Research', 'UI Design', 'Prototyping', 'Design Systems', 'User Testing', 'Information Architecture', 'Interaction Design', 'Visual Design', 'Vibe Coding', 'AI generated design and assets'],
        scale: "I've worked my way up to larger-scale projects, where monthly traffic reaches into the millions and annual turnover is in the billions. This journey gave me the most experience when it comes to scalability and sustainability of design, including a deeper understanding of design systems and how to implement them into products.",
        closing: 'Funnily enough, I often ended up working on redesigns of products and brands.',
        images: { portfolio: 'portfolio.webp', redesign: 'redesign-designer.webp' }
    },

    roles: [
        {
            id: 'p-generali',
            name: 'Generali',
            company: 'Generaliceska.cz',
            role: 'Senior UX / UI Designer',
            years: '2025 – now',
            image: 'generali.webp',
            text: [
                'As a senior UI/UX designer in the Digital Sales team, I am contributing to the redesign of the key web channel Generaliceska.cz. My work includes designing and evolving the design system in Figma, creating responsive templates (product, service, category), and collaborating on user journeys and content architecture. It also involves close communication with the frontend team, with a strong focus on accessibility and consistency across online channels.',
                'The project aims to strengthen the customer experience, business performance, and digital communication of one of the strongest brands on the Czech market.'
            ]
        },
        {
            id: 'p-slevomat',
            name: 'Slevomat',
            company: 'Slevomat.cz',
            role: 'Product Designer',
            years: '2025 – now',
            image: 'slevomat-project-showcase.svg',
            text: [
                'As a product designer at Slevomat, a brand known across the whole of Czechia and Slovakia, I help improve how users discover and choose experiences on the platform. My work centers on that journey, on making it clearer and easier to find the right experience.',
                'Together with the team, we are building the design system from the ground up, setting up the design process and fine-tuning the design principles that guide our decisions.',
                'We also use AI tools to look for ways to design smarter and to make the work more fun.'
            ]
        },
        {
            id: 'p-jobs',
            name: 'Jobs.cz',
            company: 'Jobs.cz',
            role: 'Senior UX Designer',
            years: '2020 – 2025',
            image: 'jobs-project-showcase.webp',
            text: [
                'I was a key member in the redesign and repositioning of the Jobs.cz brand and its web portal. As a senior UX and UI designer, I was responsible for the design direction of the project and other designers. My role was to orchestrate stakeholders, external brand agencies, project teams, and the design system team at the design level. I went through the most complex role in my professional career.',
                'A very significant project was also the Spirit design system, which was created practically alongside the Jobs brand redesign. I dealt not only with the design system as such, but also with its position as a product within the company, because its role was ultimately to serve all products from the Alma family across Europe. I was part of the design vs code automation topic and the sustainability and scalability of the design system.'
            ]
        },
        {
            id: 'p-atmoskop',
            name: 'Atmoskop',
            company: 'Atmoskop.cz',
            role: 'Product Designer',
            years: '2023 – 2025',
            image: 'atmoskop-project-showcase.webp',
            text: [
                'After joining Atmoskop, I became involved in an ongoing redesign process, where I took on the role of product designer in an agile, synchronous team. I was able to apply my experience from the extensive redesign process of the Jobs.cz job portal, of which I was a key part. I focused on designing and testing optimal solutions that meet business goals while considering user needs.'
            ]
        },
        {
            id: 'p-teamassistant',
            name: 'Team Assistant / Syca',
            company: 'Team Assistant',
            role: 'UX & UI Designer',
            years: '2023 – 2025',
            image: 'tas-project-showcase.webp',
            text: [
                'As part of an agile product team working in asynchronous mode, I participated in the redesign of a cloud-based low-code solution called Team Assistant. The solution enables endless possibilities for process digitalization. My main task was to rework the main part of the web application, and gradually we focused on other functional units, including the mobile application.',
                'Along with the redesign, a comprehensive design system was created that enables easy and sustainable scaling. It contains not only an extensive library of components and design tokens, but also various color skins.',
                "I also participated in the redesign of the brand's visual identity and preparation of the product for expansion into foreign markets under a new brand."
            ]
        },
        {
            id: 'p-storyous',
            name: 'Storyous',
            company: 'Storyous',
            role: 'UX & UI Designer',
            years: '2018 – 2021',
            image: 'storyous-project-showcase.webp',
            text: [
                'In an agile product team, I developed as a UI and UX designer a complete ecosystem of applications and payment systems for retail customers of Storyous (now Teya.com).',
                'I encountered a number of situations arising from the previous absence of a designer in the team and an established design process. Therefore, I gradually introduced a comprehensive design process, which among other things included occasional user interviews.',
                'At the same time, I developed a UI component library and design tokens, which facilitated project scaling and also helped with the planned redesign of the web application.'
            ]
        }
    ]
};
