/* The three offers of the previous site, word for word: services, process, and why-me. */
export const services = {
    title: 'Services',
    intro: 'Comprehensive design services for ambitious projects and premium digital experiences.',
    items: [
        { title: 'UX/UI Design', text: 'Comprehensive user experience design from research to final interface, creating intuitive and engaging digital products.', image: 'uiuxdesign.webp' },
        { title: 'Design Systems', text: 'Scalable design systems that ensure consistency and efficiency across all your digital products.', image: 'design-system.webp' },
        { title: 'Consulting', text: 'Strategic design consulting to optimize processes and achieve business goals.', image: 'consulting.webp' },
        { title: 'Redesign of products', text: 'Complete product redesigns that transform existing digital experiences into modern solutions.', image: 'redesign.webp' },
        { title: 'AI generated design and assets', text: 'Leverage AI tools for rapid prototyping and asset creation.', image: 'ai-generated-assets.webp' }
    ]
};

export const process = {
    title: 'My design process',
    intro: 'A proven, collaborative approach that transforms your vision into exceptional digital experiences through research, design, and iterative refinement.',
    items: [
        { title: 'Discovery & Research', text: 'Deep dive into your business goals, user needs, and market landscape. I conduct user interviews, competitive analysis, and stakeholder workshops to establish a solid foundation.', image: 'discovery&research.webp' },
        { title: 'Design & Prototyping', text: 'Create wireframes, user flows, and high-fidelity prototypes. Develop design systems and component libraries that ensure consistency and scalability across your product.', image: 'design&prototyping.webp' },
        { title: 'Testing & Iteration', text: 'Validate designs through user testing and stakeholder feedback. Iterate based on real user behavior and business metrics to optimize the user experience.', image: 'testing&iteration.webp' },
        { title: 'Handoff & Support', text: 'Deliver comprehensive design specifications, assets, and documentation. Collaborate closely with development teams to ensure pixel-perfect implementation.', image: 'handoff&support.webp' }
    ]
};

export const whyme = {
    title: 'Why choose me for your next project',
    intro: 'With 15+ years of experience in digital design, I bring a unique combination of strategic thinking, technical expertise, and creative vision to every project.',
    items: [
        { title: '15+ Years of Proven Experience', text: 'Extensive experience working with both established companies and fast-growing startups across fintech, e-commerce, and B2B products with millions of users.', image: '15+yearsofprovenexperience.webp' },
        { title: 'Design Systems Expert', text: 'Specialized in creating scalable design systems that ensure consistency and efficiency across all digital products, saving months of development time.', image: 'designsystemsexpert.webp' },
        { title: 'Results-Driven Approach', text: 'Focus on delivering measurable business results through user-centered design, with proven track record of improving conversion rates and user engagement.', image: 'results-drivenapproach.webp' },
        { title: 'Agile Team Collaboration', text: 'Experienced in both synchronous and asynchronous agile environments, seamlessly integrating with development teams and stakeholders.', image: 'agileteamcollaboration.webp' },
        { title: 'End-to-End Process', text: 'Complete design process coverage from initial research and ideation through to final prototypes and detailed handoff materials for development teams.', image: 'end-to-endprocess.webp' },
        { title: 'Large-Scale Expertise', text: 'Proven experience with high-traffic platforms (millions of monthly users) and high-revenue products (billions in annual turnover).', image: 'large-scaleexpertise.webp' },
        { title: 'AI-Enhanced Design Workflow', text: 'Early adopter of AI design tools and methodologies, combining human creativity with AI efficiency to deliver faster iterations and innovative solutions.', image: 'ai-enhanceddesignworkflow.webp' },
        { title: 'Business Impact Focus', text: 'Design decisions backed by business metrics and user data. Proven track record of increasing conversion rates, reducing bounce rates, and improving key performance indicators that matter to your bottom line.', image: 'businessimpactfocus.webp' }
    ]
};

/**
 * The pictures are small copies in img/, made by _tools/thumbs.mjs from the originals in the repo root
 * (whose names contain & and +, so the copies are named without them). `size` is the width the picture is
 * needed at on a sharp screen: 224 for the small cards, 512 for everything bigger. An svg has one size.
 */
export const SIZES = [224, 512];
export const thumbName = (file, size) => (/\.svg$/i.test(file) ? file : file.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/gi, '-') + '-' + size + '.webp');
export const illustration = (file, size = 512) => 'img/' + thumbName(file, SIZES.find((s) => s >= size) || SIZES[SIZES.length - 1]);        // a size in between rounds up to a copy that exists
