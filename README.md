# Marian OS (mariankadlec.cz)

Portfolio Mariana Kadlece jako **počítač**: jedna obrazovka s CRT sklem a dva módy téhož stroje. **Desktop** je operační systém ve stylu System 7 (portfolio jsou jeho soubory a aplikace), **Terminal** je textová verze webu, která se při prvním vstupu „postaví" příkazem. Přepíná se kdykoli (přepínač nahoře, klávesa `` ` ``, příkazy, ikona Terminal). Po startu se na Desktopu samo otevře okno „Marian Kadlec" (web ve stylu roku 2008); kontakt je v menu hrušky (Contact…).

Je to **ostrý web** `https://mariankadlec.cz/`: GitHub Pages ho staví z větve `main`, z kořene tohoto repozitáře. Starý web (jednostránkový `index.html` + `styles.css`) je v `_old-site/` (nezveřejňuje se) a v historii gitu (`e52986e`). Žádný build pro prohlížeč, žádné závislosti: čisté HTML, CSS a ES moduly. Jediné, co se před commitem pouští, je `node _tools/build.mjs` (viz „Nasazení a návrat").

## Spuštění

Stačí jakýkoli statický server, který kořen repozitáře obslouží přes `http://` (ES moduly nejdou ze `file://`):

```bash
python3 -m http.server 8899
```

a otevřít `http://localhost:8899/`. Při vývoji v tomto repozitáři slouží server `portfolio` z `.claude/launch.json` (obsluhuje kořen, posílá `no-store`, takže se nic neukládá do cache).

**Prohlížeče.** Slibujeme a zkoušíme poslední verze Chrome, Edge, Firefox a Safari a iOS od 16.4. Stránka se rozhoduje podle schopností (ES moduly, container queries, `color-mix`, `inert`), ne podle jména prohlížeče: kdo je nemá, bez JavaScriptu nebo když se stroj nespustí, dostane **textovou verzi** celého portfolia (`#seo` v `index.html`, vzhled v `css/plain.css`). Dobrovolně na ni vede odkaz „Plain text version" na bráně a `?plain`. Když se při startu nenačte nějaký soubor, stroj to jednou zkusí znovu sám, a pak ukáže text.

## Co kde je

```
index.html            jedna stránka: brána, sklo, textová verze (generovaná), zavaděč
manifest.webmanifest  „Přidat na plochu" (ikony hrušky v icons/)
robots.txt, sitemap.xml, favicon.ico, apple-touch-icon.png, og-image.jpg   pro vyhledávače, prohlížeče a sdílení odkazu
CNAME, _config.yml    GitHub Pages: adresa webu; co Jekyll nezveřejní (README.md, docs)
css/                  tokens (barvy, písma, proměnné) · crt (sklo, brána, boot manager) · system7 (menu bar,
                      ikony, menu) · windows (okna, dialogy, ovládací panely) · apps · browser · era2008 (web 2008)
                      · tray (přepínač Desktop | Terminal) · touch (prst) · a11y (vysoký kontrast) · plain (text)
                      · cli (Terminal; načte se až při prvním použití) · fonts (@font-face)
js/main.js            stroj: brána → zapnutí → boot manager → boot → mód
js/core/              sdílené: přepínání módů (modes), zvuk (jen syntéza, žádné soubory), store, settings,
                      menu, balloon, coach, crash (bomba), konami, tray
js/modes/os/          Desktop: wm (okna), iconview, fs (virtuální souborový systém), dialog, dog, saver,
                      apps/ (doc, browser, projekty, scrapbook, puzzle, ovládací panely, About, kredity)
js/modes/cli/         Terminal: cli (stránka a dock), shell (příkazy), humor, files (ls, cd, cat, open), dotgrid
js/content/           VŠECHNY texty. Jediný zdroj pro Desktop, Terminal i textovou verzi
js/gfx/               ikony (kreslené kódem) a dithering
fonts/ vendor/ img/ icons/   vlastní soubory: písma (OFL, texty licencí jsou u nich), GSAP, zmenšené obrázky, ikony
_tools/               skripty (viz níže); nezveřejňují se (složky s „_" Jekyll vynechá)
docs/                 plány a poznámky ke krokům (M3 až M8), mapa kláves, seznamy pro VoiceOver a zařízení; nezveřejňuje se
_old-site/            starý web (index.html, styles.css, ikony); nezveřejňuje se
_archive/             dřívější směry (Mac zepředu, 3D zkouška); nic z toho se nenačítá
*.webp, profile-image.jpg   ze starého webu; 1024 × 1024 originály, ze kterých `_tools/thumbs.mjs` dělá malé kopie do img/
```

Co se zveřejňuje a smí se z webu načíst, určuje `FILES` a `DIRS` na začátku `_tools/build.mjs`: `index.html`, manifest, `robots.txt`, `sitemap.xml`, ikony, `og-image.jpg` a složky `css`, `js`, `fonts`, `img`, `icons`, `vendor`. Cokoli jiného ve stránce `build.mjs` odmítne.

Písma: Jersey 10 (rámy a nadpisy), Atkinson Hyperlegible Next (veškerý čtený text), JetBrains Mono (Terminal). Žádné Apple názvy, písma ani zvuky a žádná cizí grafika: všechny ikony jsou nakreslené kódem a počítač se jmenuje Marian OS 7.5.5, disk „Marian HD". Úvodní maskot (usměvavý kompaktní počítač) je vlastní pixel art v duchu klasiky; ponechán záměrně (rozhodnuto 2026-10-16).

## Jak změnit text

| Co | Kde | Pak spustit |
|---|---|---|
| Jméno, titul, claim, „About" | `js/content/profile.js` | `node _tools/build.mjs` |
| Dovednosti, AI workflow, odkazy, kontakt (e-mail, adresa webu v `contact.site`) | `skills.js`, `ai.js`, `links.js`, `contact.js` | `node _tools/build.mjs` |
| Kariéra a šest rolí (projekty) | `work.js` (pořadí = pořadí v Projects i v Terminalu) | `node _tools/build.mjs`, u nového obrázku i `node _tools/thumbs.mjs` |
| Služby, proces, „Why me" | `services.js` | `node _tools/build.mjs` (+ `thumbs.mjs`) |
| Příkazy v Terminalu | `js/modes/cli/shell.js`; **zapsat je i do `commands.js`**, odtud čte soubor Commands | `node _tools/build.mjs` |
| Vtipy, relikvie v Koši, bomba, kredity, bubliny, stopy | `eggs.js` | `node _tools/build.mjs` |
| Ikony na ploše a jejich otevírání | `desktop.js` (manifest, v hlavičce je popis) | `node _tools/build.mjs` |
| Ruční část JSON-LD (`sameAs`), meta tagy | `index.html` | `node _tools/build.mjs --check` |

`build.mjs` po každé změně JavaScriptu nebo CSS přepíše otisky souborů v `index.html` (proto ho pouštěj vždy, i když neměníš text).

## Nasazení a návrat

**Před každým commitem:**

```bash
node _tools/build.mjs            # přepíše, co je neaktuální (text pro vyhledávače, otisky souborů), a zkontroluje web
node _tools/build.mjs --release  # totéž a navíc dnešní datum (BUILD_DATE v Get Info, lastmod v sitemap.xml); při vydání
node _tools/build.mjs --check    # nic nezapíše; selže, když je něco neaktuální nebo špatně (dobré před pushem)
```

Co `build.mjs` kontroluje: že každý soubor, na který ukazuje HTML, CSS, manifest nebo JavaScript, existuje a má **přesně stejná velká a malá písmena** (macOS je shovívavý, GitHub Pages ne), že web nemluví o `.com` (adresa je `mariankadlec.cz`; canonical, Open Graph, JSON-LD, `robots.txt` a sitemap se shodují s `contact.site`), že nemá `noindex`, že nenačítá nic cizího (žádná analytika, žádné CDN, žádné cookies), že jsou u písem texty licencí a že `og-image.jpg` má 1200 × 630.

**Nasazení:** push do `main` = ostrý web (GitHub Pages ho sestaví za asi minutu). Doporučený postup je větev a pull request, sloučit **běžným merge commitem, ne squashem** (aby šel návrat jedním příkazem).

**Návrat zpět:** `git revert -m 1 <slučovací commit>` a push; kořen dostane zpět starý web (Pages sestaví znovu za asi minutu). Starý web je také celý v `_old-site/`.

**Co GitHub Pages dělá a nedělá:**
- Mezipaměť 10 minut a názvy souborů se po nasazení nemění, takže návštěvník by mohl dostat novou stránku se starými moduly. Proto mají všechny `.js` a `.css` v odkazech otisk (`?v=…`) a moduly jsou v import mapě (`index.html`, generuje `build.mjs`). Písma a obrázky otisk nemají: když se jeden změní, dej mu nové jméno.
- Žádné vlastní hlavičky (CSP) a žádné přesměrování: proto mód a okno jsou v `#/…` a `?…`.
- Sestavuje Jekyllem: složky začínající `_` nezveřejní, `docs/` a `README.md` vynechává `_config.yml`.
- Po nasazení zkontroluj: `curl -I` na `/`, `/robots.txt`, `/sitemap.xml`, `/og-image.jpg` (200) a na `/docs/M8-nasazeni.md`, `/README.md`, `/_tools/audit.js` (404).

**Soukromí.** Stránka nenastavuje žádné cookies a nenačítá nic z cizích serverů (písma i GSAP jsou vlastní soubory), proto nemá cookies lištu. Nastavení a poloha ikon jsou jen v `localStorage` u návštěvníka. Žádná analytika.

## Skripty v `_tools/`

| Skript | K čemu |
|---|---|
| `build.mjs` | jediný příkaz před commitem: spustí `seo.mjs`, zapíše otisky souborů (import mapa, `modulepreload`, `<link>`) a zkontroluje celý web; `--release`, `--check` |
| `seo.mjs` | zapíše celé portfolio jako text do `index.html` (textová verze, JSON-LD `knowsAbout`); `--check` jen ověří (volá ho `build.mjs`) |
| `thumbs.mjs` | malé kopie obrázků do `img/` (224 a 512 px; potřebuje `brew install webp`) |
| `icons.mjs` | PNG ikony hrušky z `icons/icon.svg` a `icon-maskable.svg`, `favicon.ico` a `apple-touch-icon.png` v kořeni (potřebuje Chrome a `sips`, tedy Mac); `--root` jen ty dvě v kořeni |
| `og.mjs`, `og-card.html` | `og-image.jpg` (1200 × 630): a) skutečný stroj s oknem „Marian Kadlec", b) karta s hruškou a jménem; potřebuje Chrome a běžící server |
| `slevomat-token.py` | nakreslí žeton Slevomatu (`slevomat-project-showcase.svg` v kořeni) |
| `audit.js` | kontrola z konzole: kontrast, jména ovládacích prvků, struktura, velikost cílů, pořadí Tabu |
| `qa.js` | projde stroj v iframe o dané velikosti: nic nesmí přečnívat ani být oříznuté |

```js
const A = await import('/_tools/audit.js');   A.run();
const Q = await import('/_tools/qa.js');      await Q.all();   // 9 velikostí, půl minuty každá
```

## Ladicí adresy

Parametry `?...` (spojují se přes `&`), v hashi je mód:

| | |
|---|---|
| `?phase=desktop` | rovnou Desktop bez brány a bootu (`phase=boot&hold` zastaví na úvodní obrazovce, `phase=menu` na boot manageru) |
| `?mode=os` · `?mode=cli` | rovnou ten mód; `?skip` přeskočí boot manager, `?boot=menu` ho vynutí |
| `?rm=1` | jako při „omezit pohyb" (žádné animace, pes a spořič se nenabízí) |
| `?fx=0` | bez skla (scanlines, vinětace) |
| `?nocoach` | bez jednorázových bublin s tipy (pro snímky obrazovky) |
| `?rebuild` | Terminal znovu „postaví" web |
| `?plain` | textová verze |
| `?net=fast` · `?net=slow` · `?nogsap` · `?raf=timer` | vývoj: tvářit se jako rychlé připojení · jako pomalé (3G, úspora dat) · jako by se nenačetlo GSAP · animace přes časovače (když je panel skrytý) |
| `#/os` · `#/cli` · `#/os/open/<id>` | mód · mód · okno rovnou otevřené (`me`, `readme`, `services`, `p-generali`, `cp-general`, `about` a další podle `desktop.js`) |

V konzoli je `__mk` (`Machine`, `Modes`, `Crash`, `os`). Čistý začátek:

```js
__mk.os.FS.reset(); localStorage.clear(); sessionStorage.clear();
```

## Co si prohlížeč pamatuje

`localStorage`: `mk10.mode` (poslední mód), `mk10.cli.built` a `mk10.cli.themeChoice` (Terminal), `mk10.muted`, `mk10.coach.*` (jednorázové bubliny), `mk10.os.v1` (nastavení, polohy ikon, vlastní složky, odemčený „Do Not Open"). `sessionStorage`: `mk10.os.session.v1` (přejmenování a přesuny vestavěných položek jen do zavření karty, takže portfolio je po otevření vždy úplné), `mk10.booted`, `mk10.retried`. Žádné cookies.

## Co zbývá na člověku

- Skutečná zařízení a čtečka: `docs/M6-zarizeni.md`, `docs/M6-voiceover.md` (Safari a Firefox jsem nezkoušel, jen Chromium).
- Po nasazení: LinkedIn Post Inspector (znovu stáhnout náhled odkazu), Search Console (odeslat `sitemap.xml`).

## Dokumenty

`docs/M3-obsah.md` (obsah Desktopu), `M4-kroky.md` (vynecháno), `M5-kroky.md`, `M5-texty.md`, `M5-tipy.md` (vajíčka a jak je najít), `M6-kroky.md` (audit a všechny kroky s čísly), `M6-klavesy.md` (mapa kláves), `M6-voiceover.md` (poslech), `M6-zarizeni.md` (co zkusit na zařízeních), `M7-review.md` (review, nálezy a rozhodnutí), `M8-nasazeni.md` (nasazení na mariankadlec.cz).
