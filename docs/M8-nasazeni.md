# M8: nasazení na mariankadlec.cz (2026-10-16)

**Stav (2026-10-16):** připraveno na větvi `launch-marian-os`; po sloučení do `main` běží stroj na mariankadlec.cz (GitHub Pages ho sestaví za asi minutu). Do sloučení je ostrý web starý (`index.html` + `styles.css` v kořeni větve `main`).

## 1. Rozhodnutí (z M7)

| Téma | Rozhodnutí |
|---|---|
| Cesta ven | **výměna**: stroj je kořen repozitáře, GitHub Pages dál staví z `main`; starý web v `_old-site/` (nezveřejňuje se) |
| Analytika | žádná, Clarity pryč, žádné cookies, žádná lišta |
| Boot ikona | usměvavý počítač zůstává |
| Kontakt | položka **Contact…** v menu hrušky; životopis ne |
| První okno | po každém startu se samo otevře **Marian Kadlec** (web 2008), i na telefonu; bublina „Double-click me." odpadla |
| Bod 6 | nic: věta v About zůstává, `M5-tipy.md` je jen tahák (na web nejde) |
| Stahování | povoleny jen texty licencí písem |

## 2. Co se změnilo

- **Adresa `.cz`.** `index.html` (canonical, Open Graph, JSON-LD), `js/content/contact.js` (`site`, jde do vizitky), `js/modes/os/apps/web08.js` (text v adresním řádku webu 2008). Starý web i dřívější verze tohoto stroje mířily na `.com`, které neexistuje; viz `M7-review.md`, bod 0.
- **Bez analytiky.** Blok Microsoft Clarity smazán. Stránka nenačítá nic z cizích serverů (písma a GSAP jsou vlastní soubory) a nenastavuje cookies.
- **Pro vyhledávače a sdílení.** `noindex` pryč (`index, follow`), `twitter:*`, `og:site_name`, `og:locale`, `og:image:width/height/alt`, nový `og-image.jpg` (1200 × 630; vybrána varianta B, karta s hruškou, jménem a „This portfolio is a computer."), `robots.txt`, `sitemap.xml`, `favicon.ico` (16, 32, 48 px) a `apple-touch-icon.png` v kořeni.
- **První okno.** `js/modes/os/os.js`, `enter()`: při prvním vstupu do Desktopu po startu (a po Restartu) se po 0,7 s otevře `openById('me')`; fokus se po Esc vrací na ikonu „Marian Kadlec". Po přepnutí z Terminalu zpět se okno znovu neotvírá. Hluboké odkazy `#/os/open/<id>` mají přednost. Na skle užším než 1100 px je okno užší (`openBrowser` v `apps/browser.js`: jen místo vedle dvou sloupců ikon a vlevo od disku; `wm.area()` je nově vidět), takže na iPadu na výšku i na šířku zůstanou ikony i disk „Marian HD" na očích. Tip u přepínače Desktop | Terminal („Prefer a terminal?") zůstal, jednou.
- **Contact….** `MENUS.pear` a `COMMANDS.contact` v `os.js`; otevře (nebo přesune) okno „Marian Kadlec" na stránku Contact (stav, odpověď do 24 h, „E-mail me", odkazy). `File → Save Contact As…` zůstalo.
- **Licence písem.** `fonts/OFL-jersey-10.txt`, `OFL-atkinson-hyperlegible-next.txt`, `OFL-jetbrains-mono.txt` (stažené z `github.com/google/fonts`, 4 395 + 4 431 + 4 399 B, beze změn), `fonts/README.txt` s copyrighty.
- **`_tools/build.mjs`** (nový, nahradil `preload.mjs`): otisky souborů proti 10min mezipaměti GitHub Pages (import mapa pro všech 58 modulů, `<link>` na 12 stylesheetů a GSAP, zavaděč, `modulepreload`, `loadCss('css/cli.css')`), `--release` (datum), `--check`; a **kontroly webu** (odkazy a velikost písmen, doména, `noindex`, cizí servery a cookies, licence, `og-image.jpg`, `_config.yml`).
- **Nástroje:** `og.mjs` + `og-card.html` (obrázek pro sdílení, dvě varianty), `icons.mjs` umí i `favicon.ico` a `apple-touch-icon.png` (`--root`), `?nocoach` pro snímky obrazovky.
- **Rozložení:** stroj je teď v kořeni repozitáře; `_config.yml` (Jekyll nezveřejní `README.md`, `docs`), `.gitignore`, `_old-site/`, `_archive/` (dřívější směry); cesty v `thumbs.mjs`, `slevomat-token.py`, `qa.js`, `audit.js` a v dokumentech opraveny.

## 3. Ověřeno (Chromium, lokální server)

| Co | Výsledek |
|---|---|
| `node _tools/build.mjs --check` | čisté: 58 modulů a 13 stylesheetů s otiskem, 245 odkazů existuje se správnou velikostí písmen |
| Start Desktopu (`?phase=desktop`, s oknem „Marian Kadlec" otevřeným) | pomalé připojení (`?net=slow`): **69 požadavků, 541 KB** (dřív 69 / 555 KB); rychlé (`?net=fast`, s tichým stažením Terminalu): **82 požadavků, 784 KB** (dřív 82 / 802 KB); 0 cizích serverů |
| Skutečný start (brána, boot manager, boot, Desktop, 1440 × 900) | okno „Marian Kadlec" se samo otevře; **77 požadavků**, všechny 200, všechny z vlastní domény, žádný soubor dvakrát, všech 58 JS s `?v=`; 633 KB bez komprese (včetně tichého stažení Terminalu); po gzipu je web celý asi 160 KB (HTML 10, CSS 21, JS 100, GSAP 28) a písma 103 KB |
| Konzole, cookies, úložiště | žádná chyba ani varování; `document.cookie` prázdné; jen klíče `mk10.*` |
| Textová verze `?plain` | 17 požadavků, 232 KB, žádný modul stroje, odkaz zpět na stroj |
| Esc na prvním okně | okno se zavře, fokus je na ikoně „Marian Kadlec", čtečka slyší „Marian Kadlec closed" |
| Contact… | myší, klávesnicí (Marian menu, Enter, šipka dolů, Enter) i klepnutím na telefonu 375 × 812 otevře stránku Contact; audit stránek webu 2008: 0 slabých kontrastů, 0 nepojmenovaných prvků, 0 malých cílů |
| Terminal (` ) | soubory `js/modes/cli/*` se načtou přes import mapu s `?v=`, `css/cli.css?v=…` také |
| Devět velikostí (320 × 568 až 2560 × 1440, naležato 812 × 375 a 568 × 320) | `_tools/qa.js`: všude „ok" (nic nepřečnívá, text nad 4,5 : 1, žádný prvek bez jména); po úpravě šířky okna znovu 768 × 1024, 1024 × 768, 1440 × 900, 812 × 375 a 375 × 812: všude „ok" |
| Telefon 375 × 812 | první okno vyplní sklo, dole plovoucí přepínač; menu hrušky má Contact… ve výšce 40 px |

## 4. Co jsem nemohl ověřit

- **Safari a Firefox** (Playwright jsi odmítl), skutečný prst, klávesnice na displeji, VoiceOver: `M6-zarizeni.md`, `M6-voiceover.md`. Stroj se rozhoduje podle schopností prohlížeče; kdo je nemá, dostane textovou verzi.
- **Skutečné GitHub Pages**: že Jekyll nezveřejní `docs/` a `README.md` a zveřejní vše potřebné (včetně `vendor/`). Ověří se hned po nasazení (oddíl 5, krok 5).
- Import mapa v Safari 16.4+ a Firefoxu 108+ (podle specifikace funguje; starší prohlížeč ji ignoruje a načte soubory bez otisku).

## 5. Nasazení (až po „go")

1. `node _tools/build.mjs --release` (datum vydání), potom `node _tools/build.mjs --check`.
2. `git status` projít; do indexu: přejmenování starého webu do `_old-site/` (už je v indexu), nové soubory podle seznamu v „Co se změnilo" (bez `version-1…9.html`, `.claude/`, `.agent*`, `skills-lock.json`). Jeden commit, zpráva končí `Co-Authored-By`.
3. `git push -u origin launch-marian-os`, pull request do `main`.
4. Sloučit **merge commitem (ne squashem)**. GitHub Pages sestaví web za asi minutu (`gh api repos/maroskadlec/personal-website/pages/builds/latest`).
5. **Po sestavení:** `curl -I` na `/`, `/robots.txt`, `/sitemap.xml`, `/og-image.jpg`, `/favicon.ico`, `/manifest.webmanifest`, `/vendor/gsap.min.js`, `/fonts/jersey-10-latin.woff2` (200 a správný typ souboru); `/docs/M8-nasazeni.md`, `/README.md`, `/_tools/audit.js`, `/_old-site/index.html`, `/_config.yml` mají vrátit **404**. Potom `https://mariankadlec.cz/` v prohlížeči: konzole, síť (jen vlastní doména, žádné 404), `document.cookie`, průchod bránou.
6. Tvoje: telefon, Safari, Firefox; LinkedIn Post Inspector (znovu stáhnout náhled odkazu); Search Console (odeslat `sitemap.xml`, Kontrola adresy URL → Zobrazit zachycenou stránku).

## 6. Návrat

`git revert -m 1 <slučovací commit>` a push: kořen dostane zpět starý `index.html` a `styles.css` (a staré ikony); Pages sestaví znovu za asi minutu. Celý starý web je také v `_old-site/` a v historii (`e52986e`).
