# M3: obsah k validaci

Přesný seznam toho, co M3 přidá do Desktopu, včetně všech textů. Texty jsou **doslovně** ze starého webu (`git show 56f747f:index.html`) nebo ze sdíleného obsahu, který už používá Terminal. **Nepíšu nic nového.** Cokoli v tomhle souboru přepiš nebo přeškrtni, použiju to tak, jak to tady bude.

**Stav: M3 je celé postavené (kroky 1–3), čeká na schválení.** Ikony na ploše: dva sloupce (Marian Kadlec, Projects, Services, Process, Why Me / Terminal, Read Me, Links), Services, Process, Why Me a Links mají vlastní originální pixel ikony (zvonek, schody s vlajkou, album, řetěz).

**Validováno:** Odpovědi na otázky v bodě 13 jsou zapracované níže (1 ano · 2 ano · 3 ano · 4 ano · 5 ano · 6 ne · 7 vynechat · 8 z Terminalu · 9 roky podle bodu 4 · 10 souhlas).

Označení: **[beze změny]** = text ze starého webu, **[sdílené]** = text, který už je v Terminalu, **[upravené]** = jen drobná úprava (vždy popsaná).

---

## 1. Ikony na ploše po M3 (10)

| # | Ikona | Typ | Co otevře |
|---|---|---|---|
| 1 | Marian Kadlec | aplikace | Browser s webem 2008 (bod 2). Nahradí dnešní dočasné okno |
| 2 | Projects | složka | 6 oken projektů (bod 4), otevírá se jako ikony |
| 3 | Services | dokument | okno s 5 službami (bod 6) |
| 4 | Process | dokument | okno se 4 kroky (bod 7) |
| 5 | Why Me | Scrapbook | 8 stránek s ilustracemi (bod 8) |
| 6 | Links | dokument | okno s odkazy (bod 9) |
| 7 | Read Me | dokument | už existuje, text se doplní (bod 10) |
| 8 | Terminal | aplikace | už existuje |
| 9 | Marian HD | disk | už existuje |
| 10 | Trash | koš | už existuje |

Každá nová položka má i odkaz `#/os/open/<id>`: `me` (Browser), `projects`, `p-generali`, `p-slevomat`, `p-jobs`, `p-atmoskop`, `p-teamassistant`, `p-storyous`, `services`, `process`, `whyme`, `links`.

---

## 2. Browser s webem 2008

**Okno:** lišta s tlačítky Back, Forward, Reload, Home, adresní řádek (jen zobrazuje adresu `http://www.mariankadlec.com/…`), stavový řádek (při najetí na odkaz ukáže cíl, jinak „Done"), krátký proužek načítání při změně stránky. Má historii, takže Back a Forward fungují doopravdy. Okno má vlastní posuvník. Navenek je to původní kresba v duchu 90. let, žádné značky ani ikony třetích stran.

**Vzhled stránek:** kůže 2008 z `version-5-redesign.html`: modrý přechod v hlavičce, žlutě podbarvené nadpisy sekcí, odrážky `»`, tlačítka s fazetou, tmavý počítadlový štítek, blikající „NEW!". **Bez** tlačítka „Redesign it", bez era navigace a bez nápovědy.

**Navigace v horní liště stránky:** Home · Services · Process · Why me · Work · Contact

**Odkazy:**
- na stránky v Browseru → načte se jiná stránka (Back/Forward je zapamatuje),
- na projekty (na stránce Work) → otevře příslušné okno projektu na ploše (ne v Browseru),
- externí → nová karta prohlížeče,
- e-mail → mailto.

### Stránky (6)

**Home** `/`
- kicker: `Marian Kadlec · Senior Product Designer · Prague` [beze změny z v5]
- jméno: `Marian Kadlec`, titulek: `Senior digital designer for ambitious brands and digital products.` [sdílené]
- slogan (dva řádky): `Years at the seam between design and code.` / `Now AI lets me cross it myself.` [sdílené]
- foto (1×, 86 px, jako ve v5)
- About: 5 odstavců ze sdíleného `profile.about` (stejné jako v Terminalu, viz bod 11), u odstavce o AI blikající štítek `NEW!`
- What I do: 3 skupiny `design/`, `build/`, `ai/` se 10 položkami [sdílené ze `skills.js`]
- Selected clients & products: `Generali Česká pojišťovna · Slevomat · Atmoskop · Jobs.cz · Storyous · Syca.app · Sagaflow.io` [sdílené]
- patička: `You are visitor Nº 001337` · `⭐ Best viewed in Internet Explorer 6 at 1024×768 resolution ⭐` · `© 2026 Marian Kadlec - made with vibe coding.`

**Services** `/services.html`: úvodní věta + 5 služeb (bod 6) s ilustracemi.

**Process** `/process.html`: úvodní věta + 4 kroky (bod 7) s ilustracemi.

**Why me** `/why-me.html`: úvodní věta + 8 položek (bod 8) s ilustracemi.

**Work** `/work.html`: „My design journey and professional background" (bod 3) + 5 rolí (bod 4). Názvy firem u rolí otevírají okna projektů na ploše.

**Contact** `/contact.html`: text z bodu 9 (status, response time) + e-mail a odkazy.

---

## 3. „My design journey and professional background" [beze změny]

> Over the course of my career, I've had the chance to work as a visual, UI, or UX designer on a wide range of projects across different industries:

Odvětví (10 štítků): `digital marketing` · `e-commerce` · `foodies` · `insurance` · `fintech` · `startups` · `job markets` · `low-code platforms` · `information systems` · `development`

> I've worked with both well-established companies and fast-growing startups, in both async and sync setups. I was usually part of agile teams, responsible for the entire design process and later also for getting it into production.

*(obrázek `portfolio.webp`)*

> I have solid experience across the whole design process – from early idea phases, through research, user studies, testing, and iterations, all the way to final prototypes and handoff materials for the dev team. That includes everything from precisely defined styles and components to detailed specs for features and behaviors of individual elements.

Dovednosti (10 štítků): `UX Research` · `UI Design` · `Prototyping` · `Design Systems` · `User Testing` · `Information Architecture` · `Interaction Design` · `Visual Design` · `Vibe Coding` · `AI generated design and assets`

> I've worked my way up to larger-scale projects, where monthly traffic reaches into the millions and annual turnover is in the billions. This journey gave me the most experience when it comes to scalability and sustainability of design, including a deeper understanding of design systems and how to implement them into products.

*(obrázek `redesign-designer.webp`)*

> Funnily enough, I often ended up working on redesigns of products and brands.

---

## 4. Projects: 6 oken projektů

Každé okno: žeton (obrázek 1024×1024 z repa, bod níže), název, role · firma · roky, texty doslovně. **Bez** tlačítka „Open website" (rozhodnuto).

**Ikony ve složce:** žetony zmenšené na 32 px a „vydithrované" do omezené palety (zachovají barvu značky). **Po otevření okna** se žeton nejdřív ukáže jako dither a během asi půl sekundy se rozsvítí do plných barev („glow-up"), jen při prvním otevření v dané session.

### 4.1 Generali, `generali.webp`
**Senior UX / UI Designer · Generaliceska.cz · 2025 – now** *(starý web: „2025 - ?"; potvrzeno: Generali běží od 2025)*

> As a senior UI/UX designer in the Digital Sales team, I am contributing to the redesign of the key web channel Generaliceska.cz. My work includes designing and evolving the design system in Figma, creating responsive templates (product, service, category), and collaborating on user journeys and content architecture. It also involves close communication with the frontend team, with a strong focus on accessibility and consistency across online channels.

> The project aims to strengthen the customer experience, business performance, and digital communication of one of the strongest brands on the Czech market.

### 4.2 Slevomat, `slevomat-project-showcase.svg` *(nový, od 2025; pořadí v seznamu: hned za Generali)*
**Product Designer · Slevomat.cz · 2025 – now** *(potvrzeno: souběžně s Generali)*

Žeton je modrá karta s bílým logem, nakreslená kódem z `slevomat-logo.svg` (`_tools/slevomat-token.py`, příkaz `python3 version-10-marian-os/_tools/slevomat-token.py white` dá bílou kartu s modrým logem).

Text je nový, napsaný z odstavce na LinkedInu (jediný projekt, který není ze starého webu). Co je navíc oproti LinkedInu, je jen obecné doplnění smyslu („that guide our decisions", „clearer and easier to find the right experience").

> As a product designer at Slevomat, a brand known across the whole of Czechia and Slovakia, I help improve how users discover and choose experiences on the platform. My work centers on that journey, on making it clearer and easier to find the right experience.

> Together with the team, we are building the design system from the ground up, setting up the design process and fine-tuning the design principles that guide our decisions.

> We also use AI tools to look for ways to design smarter and to make the work more fun.

### 4.3 Jobs.cz, `jobs-project-showcase.webp`
**Senior UX Designer · Jobs.cz · 2020 – 2025**

> I was a key member in the redesign and repositioning of the Jobs.cz brand and its web portal. As a senior UX and UI designer, I was responsible for the design direction of the project and other designers. My role was to orchestrate stakeholders, external brand agencies, project teams, and the design system team at the design level. I went through the most complex role in my professional career.

> A very significant project was also the Spirit design system, which was created practically alongside the Jobs brand redesign. I dealt not only with the design system as such, but also with its position as a product within the company, because its role was ultimately to serve all products from the Alma family across Europe. I was part of the design vs code automation topic and the sustainability and scalability of the design system.

### 4.4 Atmoskop, `atmoskop-project-showcase.webp`
**Product Designer · Atmoskop.cz · 2023 – 2025**

> After joining Atmoskop, I became involved in an ongoing redesign process, where I took on the role of product designer in an agile, synchronous team. I was able to apply my experience from the extensive redesign process of the Jobs.cz job portal, of which I was a key part. I focused on designing and testing optimal solutions that meet business goals while considering user needs.

### 4.5 Team Assistant / Syca, `tas-project-showcase.webp`
**UX & UI Designer · Team Assistant · 2023 – 2025** *(starý web: „2023 - present"; rozhodnuto: 2023 – 2025, věty v textu proto v minulém čase)*

> As part of an agile product team working in asynchronous mode, I participated in the redesign of a cloud-based low-code solution called Team Assistant. The solution enables endless possibilities for process digitalization. My main task was to rework the main part of the web application, and gradually we focused on other functional units, including the mobile application.

> Along with the redesign, a comprehensive design system was created that enables easy and sustainable scaling. It contains not only an extensive library of components and design tokens, but also various color skins.

> I also participated in the redesign of the brand's visual identity and preparation of the product for expansion into foreign markets under a new brand.

### 4.6 Storyous, `storyous-project-showcase.webp`
**UX & UI Designer · Storyous · 2018 – 2021**

> In an agile product team, I developed as a UI and UX designer a complete ecosystem of applications and payment systems for retail customers of Storyous (now Teya.com).

> I encountered a number of situations arising from the previous absence of a designer in the team and an established design process. Therefore, I gradually introduced a comprehensive design process, which among other things included occasional user interviews.

> At the same time, I developed a UI component library and design tokens, which facilitated project scaling and also helped with the planned redesign of the web application.

---

## 5. „More projects" — **vynecháno** (rozhodnuto)

Dokument „More projects" (10 názvů) se nedělá. Sagaflow.io (a Syca.app) zůstávají jen jako názvy v seznamu klientů na Home. Slevomat má od teď okno projektu (bod 4.2).

---

## 6. Services (5) [beze změny]

Úvod: *Comprehensive design services for ambitious projects and premium digital experiences.*

| Ilustrace | Název | Text |
|---|---|---|
| `uiuxdesign.webp` | UX/UI Design | Comprehensive user experience design from research to final interface, creating intuitive and engaging digital products. |
| `design-system.webp` | Design Systems | Scalable design systems that ensure consistency and efficiency across all your digital products. |
| `consulting.webp` | Consulting | Strategic design consulting to optimize processes and achieve business goals. |
| `redesign.webp` | Redesign of products | Complete product redesigns that transform existing digital experiences into modern solutions. |
| `ai-generated-assets.webp` | AI generated design and assets | Leverage AI tools for rapid prototyping and asset creation. |

---

## 7. Process (4) [beze změny]

Nadpis: *My design process*. Úvod: *A proven, collaborative approach that transforms your vision into exceptional digital experiences through research, design, and iterative refinement.*

| Ilustrace | Krok | Text |
|---|---|---|
| `discovery&research.webp` | Discovery & Research | Deep dive into your business goals, user needs, and market landscape. I conduct user interviews, competitive analysis, and stakeholder workshops to establish a solid foundation. |
| `design&prototyping.webp` | Design & Prototyping | Create wireframes, user flows, and high-fidelity prototypes. Develop design systems and component libraries that ensure consistency and scalability across your product. |
| `testing&iteration.webp` | Testing & Iteration | Validate designs through user testing and stakeholder feedback. Iterate based on real user behavior and business metrics to optimize the user experience. |
| `handoff&support.webp` | Handoff & Support | Deliver comprehensive design specifications, assets, and documentation. Collaborate closely with development teams to ensure pixel-perfect implementation. |

---

## 8. Why Me, Scrapbook (8 stránek) [beze změny]

Nadpis: *Why choose me for your next project*. Úvod: *With 15+ years of experience in digital design, I bring a unique combination of strategic thinking, technical expertise, and creative vision to every project.*

Scrapbook: jedna stránka = jedna ilustrace + název + text, šipky vlevo/vpravo (i klávesy ← →), „3 of 8". Úvodní věta je v okně pořád vidět nad stránkou jako popisek, nadpis „Why choose me for your next project" je v liště vedle šipek.

| Ilustrace | Název | Text |
|---|---|---|
| `15+yearsofprovenexperience.webp` | 15+ Years of Proven Experience | Extensive experience working with both established companies and fast-growing startups across fintech, e-commerce, and B2B products with millions of users. |
| `designsystemsexpert.webp` | Design Systems Expert | Specialized in creating scalable design systems that ensure consistency and efficiency across all digital products, saving months of development time. |
| `results-drivenapproach.webp` | Results-Driven Approach | Focus on delivering measurable business results through user-centered design, with proven track record of improving conversion rates and user engagement. |
| `agileteamcollaboration.webp` | Agile Team Collaboration | Experienced in both synchronous and asynchronous agile environments, seamlessly integrating with development teams and stakeholders. |
| `end-to-endprocess.webp` | End-to-End Process | Complete design process coverage from initial research and ideation through to final prototypes and detailed handoff materials for development teams. |
| `large-scaleexpertise.webp` | Large-Scale Expertise | Proven experience with high-traffic platforms (millions of monthly users) and high-revenue products (billions in annual turnover). |
| `ai-enhanceddesignworkflow.webp` | AI-Enhanced Design Workflow | Early adopter of AI design tools and methodologies, combining human creativity with AI efficiency to deliver faster iterations and innovative solutions. |
| `businessimpactfocus.webp` | Business Impact Focus | Design decisions backed by business metrics and user data. Proven track record of increasing conversion rates, reducing bounce rates, and improving key performance indicators that matter to your bottom line. |

---

## 9. Links a Contact [sdílené]

Okno Links i stránka Contact berou odkazy ze sdíleného `links.js` (stejné jako v Terminalu):
`LinkedIn profile` · `GitHub profile` · `Dribbble portfolio` · `Design Marketplace` + e-mail `marian.kadlec@icloud.com`.

**Contact text (navrhuju z Terminalu, příkaz `hire`, místo starého „luxury design"):**

> status: open — product redesigns · design systems · AI-assisted front-end · consulting
> response time: <24h

Starý text byl: *„Let's create something extraordinary. Available for exclusive projects and premium collaborations. Specialized in luxury design, premium UX consulting, and bespoke design systems."* (viz otázka 8).

---

## 10. Read Me (doplnění)

K dnešnímu textu přibyde jedna odrážka: *Open „Marian Kadlec" for the 2008 version of this website, and Projects for the work itself.* Zbytek zůstává.

---

## 11. About (sdílené s Terminalem, už schválené)

1. With 15+ years of experience in digital design, I bring a unique combination of strategic thinking, technical expertise, and creative vision to every project.
2. Design systems, design tokens, component libraries, close work with front-end teams: for years my work has sat exactly on the line between design and code.
3. ★ I'm an AI enthusiast, and it has changed what a designer can do. With AI as a pair programmer I'm back in the front-end: building components, layouts and working prototypes in real code, and delivering straight into a project's codebase instead of only into Figma.
4. I work alongside engineers, not instead of them: what I hand over is code they can review, not a spec they have to interpret.
5. Funnily enough, I often ended up working on redesigns of products and brands.

---

## 12. Co v M3 NENÍ

- Okno Terminal uvnitř Desktopu a příkazy typu `open atmoskop` v Terminalu (to je M4).
- Easter eggy včetně relikvií v Koši, Time Machine a „Before & After" (M5).
- Nové texty, nové ilustrace ani nové případové studie. Jen výše uvedené.
- Finální průchod přístupností, SEO a výkonem (M6).

## 13. Otázky k potvrzení (moje výchozí odpověď je vždy první)

1. **Text na webu 2008:** stejný dnešní text jako v Terminalu (bod 2 a 11), nebo vymyslet „dobový" text z roku 2008? *Výchozí: dnešní text. Web se mění jen vzhledem, jako ve v5.*
2. **Stránky Browseru:** Home, Services, Process, Why me, Work, Contact. OK, nebo něco ubrat/přidat?
3. **Samostatné ikony Services, Process, Why Me a Links** na ploše (stejný obsah jako v Browseru), nebo má všechno žít jen v Browseru? *Výchozí: samostatné ikony, kvůli objevitelnosti.*
4. **Složka Projects** se má otevírat jako **ikony** (žetony jsou vidět), seznam zůstane v menu View. *Výchozí: ikony.*
5. **Obrázky:** žetony jako ikony vydithrované do omezené palety s „glow-upem" v okně, ilustrace (17) v plných barvách bez ditheru. OK?
6. **Tlačítko „Open website"** v oknech projektů s adresami ze starého webu (generaliceska.cz, jobs.cz, atmoskop.cz, storyous.cz, syca.app). Ano, nebo ne?
7. **„More projects"** (10 názvů) jako dokument ve složce Projects. Ano, nebo vynechat?
8. **Contact:** dnešní text z Terminalu místo starého „luxury design / premium collaborations". Souhlas?
9. **Roky:** „2025 - ?" → „2025 – now" a „2023 - present" → „2023 – now" (sjednocení). Souhlas?
10. **Team Assistant / Syca:** stará stránka mluví jen o „Team Assistant" a o „new brand", Terminal uvádí „Syca.app". V okně chci jen původní text a odkaz na syca.app, bez tvrzení, že je to totéž. Souhlas, nebo napíšeš, jak to formulovat?
