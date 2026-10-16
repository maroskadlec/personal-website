# M6: dotyk, přístupnost, SEO, výkon

**Stav (2026-10-15): M6 je hotový (kroky 1 až 4 a 6; krok 5 odpadl) a M7 (review) taky: viz `M7-review.md`. Čeká na tvá rozhodnutí z jeho bodu 9 a na zkoušku na zařízeních (`M6-zarizeni.md`).** Odpovědi: 1 ano (vyšší menu bar na dotyku) · 2 b (pětkrát klepnout na hodiny) · 3 stopy na obou místech (konzole i věta v About) · 4 nic (velké displeje se nedělají, krok 5 odpadá) · 5 ano (fonty a GSAP) · 6 ano (podpora prohlížečů) · 7 ano (web app manifest). M5 je hotový, M7 je review.

Audit jsem udělal v prohlížeči a ve zdrojácích. Čísla jsou z lokálního serveru bez komprese, takže na ostrém hostingu budou menší, ale poměry platí.

**Co z odpovědí plyne pro kroky**
- Krok 3 (přístupnost) a krok 4 (dotyk) jedou podle plánu. Krok 4 navíc: vyšší menu bar na dotyku, pět klepnutí na hodiny odemkne „Do Not Open" a **web app manifest** s ikonami hrušky (192 a 512 px, vyrobím z SVG hrušky v prohlížeči) a meta tagy pro „Přidat na plochu".
- Stopy pro návštěvníky (odpověď 3): hláška v konzoli a věta v About This Computer. Dělá se v kroku 4 spolu s dotykem. Znění věty ti napíšu ke schválení.
- Krok 5 (velké displeje) odpadá. Číslování dál sedí: krok 6 zůstává krokem 6.
- Podpora prohlížečů (odpověď 6) se dělá v kroku 2: kdo ji nemá, dostane textovou verzi.

---

## Co audit ukázal

**Výkon**
- Start na Desktopu: **76 požadavků**. 58 souborů JavaScriptu (asi 340 KB zdrojů, bez minifikace), GSAP z CDN (25 KB), 9 CSS (77 KB), obrázky téměř **1 MB**, Google Fonts (jejich CSS blokuje vykreslení).
- Z toho obrázků: pět žetonů projektů (**920 KB**) se stahuje na pozadí 2,6 s po startu plochy, i když nikdo neotevře Projects. Zobrazují se přitom ve 32 px (rozdithrované) nebo 256 px.
- Všech 24 obrázků (žetony a ilustrace, každý 1024 × 1024) a jedno SVG má dohromady **3,6 MB** (95 až 260 KB kusy). Zobrazují se nejvýš v 256 px. Zkouška s `cwebp`, který už na stroji máš: 260 KB → 47 KB při 512 px, 205 KB → 10 KB při 224 px. (V prvním výpisu jsem napsal 19 obrázků: spletl jsem se, názvy s `&` a `+` jsem tehdy přehlédl.)
- Terminal mód (6 souborů JS, 42 KB, a 16 KB CSS) se stahuje i návštěvníkovi, který ho nikdy neotevře. Totéž aplikace v oknech (Browser s webem 2008, projekty, Scrapbook, Puzzle, kredity, pes, spořič): přes 100 KB.
- Rychlost za běhu je dobrá: při otevírání oken a přepínání módů nenaměřil žádný úsek delší než 50 ms.

**Dotyk**
- Všude se používají pointer události (správně) a `touch-action: none` je tam, kde se táhne (ikony, záhlaví oken, grow box, puzzle).
- Pod prstem je málo místa: položky menu bar jsou **21 px vysoké** (pod minimem 24 px, natož doporučených 44), šipky posuvníků 15 × 16 px, tlačítka v Browseru pod 44 px.
- Patnáct pravidel `:hover` platí i na dotyku (na iPhonu „zůstane" najeto po klepnutí). Chybí vypnutí šedého zablikání při klepnutí a `overscroll-behavior` (tažení prstem může stáhnout stránku).
- Na telefonu nejde napsat Konami kód, takže „Do Not Open" se tam nedá odemknout.

**Přístupnost**
- Strukturálně čisté: žádná duplicitní `id`, všech 67 ovládacích prvků v oknech má název, všechny obrázky mají `alt`, žádný `tabindex` nad nulou, okna jsou pojmenované skupiny, Terminal má `h1`, `h2`, landmark `main` a živé oblasti.
- Chyby a mezery: čtečka čte u Koše „Trash, Trash". V Terminalu jsou nadpisy sekcí příkazy („cat about.md"), takže čtečka nehlásí „About". Nezkoušel jsem režim vysokého kontrastu (`forced-colors`) ani VoiceOver.
- Fokus je vidět všude (`:focus-visible` mají všechny prvky). Reflow při 320 px funguje.

**SEO a web bez JavaScriptu**
- `noindex, nofollow` (správně pro experiment), JSON-LD Person je hotový.
- Blok pro vyhledávače `#seo` má jen úvodní odstavec a čtyři odkazy. `<noscript>` je jedna věta. Bez JavaScriptu (nebo pro prohlížeč, který ho nespustí) tedy **není vidět žádný projekt, služba, proces ani kariéra**.
- Je to „počítač": obsah vzniká až JavaScriptem. Chybí textová verze.

**Odolnost**
- GSAP a fonty se berou z cizích serverů. Kód s GSAP většinou počítá s tím, že nemusí být (zkontroloval jsem čtení), ale bez něj jsem to nezkoušel.
- Potřebuje podporu container queries (Safari 16+) a `inert` (iOS 15.5+). Starší prohlížeč dnes dostane rozbité rozložení místo vysvětlení.

---

## Kroky (každý končí checkpointem se zprávou a čísly)

**Krok 1: Výkon bez změny vzhledu.**
- Náhledy obrázků: skript `_tools/thumbs.sh` (lokální `cwebp`, nic se nestahuje) vyrobí do nové složky `img/` 512 px verze žetonů a 224 px verze ilustrací. Originály v kořeni zůstanou pro ostrý web. Očekávám 3,0 MB → asi 0,4 MB.
- Na pozadí se stahují jen malé žetony.
- Terminal mód (kód i CSS) se načte až při prvním použití (`import()`) a na rychlém připojení se za chvíli po startu dostáhne potichu, aby první přepnutí nezpomalilo. Aplikace v oknech jsem po změření nechal být: dohromady mají 47 KB zdrojů ze 340 KB a líné načítání by přidalo složitost bez znatelného zisku.
- Seznam `modulepreload` (generuje ho skript), aby se zbylé soubory stahovaly najednou a ne po řetízku.
- Měření před a po: počet požadavků a bajty. Počet požadavků zůstane kolem šedesáti, protože nic nebalím (žádný build): důležité je, že se všechny stahují najednou a že bajty klesly.
- Fonty a GSAP viz rozhodnutí 5.

**Krok 2: SEO a web bez JavaScriptu. Hotovo, viz „Krok 2" níže.**
- Skript `_tools/seo.mjs` přečte `js/content/*` a vloží do `index.html` mezi značky úplný text: o mně, dovednosti, AI, kariéra a šest rolí, služby, proces, Why Me, kontakt, odkazy. Text je `#seo`. Bez JavaScriptu je to celá stránka (ne jen `<noscript>`), s běžícím strojem zůstává pro vyhledávače. Generuje se z jednoho zdroje, takže se s obsahem neliší.
- Prohlížeč, který nepodporuje, co potřebuju (moduly, container queries, `color-mix`, `inert`), dostane tentýž text viditelně a větu, že portfolio chce novější prohlížeč.
- JSON-LD doplněno (`knowsAbout`). `noindex` zůstává, dokud neřekneš.

**Krok 3: Přístupnost.**
- Opravy z auditu: „Trash, Trash", lidské názvy sekcí v Terminalu pro čtečku, minimální styly pro režim vysokého kontrastu.
- **Odkaz na bráně a zpětný odkaz (schváleno, hotovo):** na bráně vedle zvuku „Plain text version" (`?plain`), na textové stránce „Open the interactive version".
- Kontrastní audit skriptem: všechna okna Desktopu a šest témat Terminalu.
- Mapa kláves (jedna stránka) a nový klávesnicový průchod.
- Seznam pro VoiceOver: projdeme ho spolu, já neslyším.

**Krok 4: Dotyk.**
- Z kroku 3: cíle menší než 24 px (WCAG 2.5.8) opravím tady spolu s dotykem, hlavně položky menu bar (21 px vysoké), segmenty přepínače Desktop \| Terminal (16 px), tlačítko zvuku (18 px), „?" (16 px), zavírací a zoom čtverečky oken (13 px). Vzhled zůstane, zvětší se klikací plocha.
- Podle rozhodnutí 1 a 2: vyšší menu bar na dotyku, větší tlačítka v Browseru, `:hover` jen tam, kde je myš, vypnout šedé zablikání a stahování stránky, cesta k „Do Not Open" bez klávesnice.
- Terminal a klávesnice na iPhonu: dock musí zůstat vidět nad klávesnicí (já ověřím logiku, na iPhonu to musíš zkusit ty).
- Tablet: tažení oken a ikon prstem. Skutečný prst nemám, zkusím syntetické dotykové události a zbytek je na iPadu.

**Krok 5: Velké displeje (jen když souhlasíš, rozhodnutí 4).**
- Nejdřív zkouška (spike) na CSS `zoom`: jestli nerozbije tažení oken a ikon. Když ano, vrátím se k volbě „UI size" v Monitors bez automatiky. Plán M1b s „volitelným zoomem" počítal.

**Krok 6: QA, README a kandidát k review.**
- Průchod velikostmi (320, 375, 768, 1024, 1440, 1920, 2560), módy, tématy, konzole a síť.
- `README.md` ve složce: jak to spustit (jakýkoli statický server), kde měnit texty, ladicí adresy, skripty v `_tools`.
- Seznam, co máš vyzkoušet na zařízeních: iPhone Safari, Android Chrome, Safari na Macu, Firefox. Tohle nezkusím já.
- Pak M7 (review a co dál).

---

## Rozhodnutí (moje výchozí odpověď je první)

1. **Menu bar na dotyku**: na telefonu a tabletu vyšší (asi 34 px místo 22 px, o chlup jiný vzhled), nebo nechat 22 px (pod minimem čitelného cíle). *Výchozí: vyšší.*
2. **„Do Not Open" na dotyku**: (a) jen klávesnice · (b) pětkrát rychle klepnout na hodiny · (c) Konami gestem (osm švihů a klepnutí vlevo a vpravo, ale švihy kolidují s výběrem tažením a bylo by to složité). *Výchozí: (b).*
3. **Stopy pro návštěvníky**: hláška v konzoli pro vývojáře („looking for something? ↑ ↑ ↓ ↓ ← → ← → B A") a drobná věta v About This Computer. *Výchozí: konzole ano, věta ne.*
4. **Velké displeje**: zkouška automatické velikosti UI (od zhruba 1500 px šířky větší) plus volba v Monitors. Pokud nerozbije tažení, nasadím. *Výchozí: ano, jen když zkouška dopadne.*
5. **Stažení fontů a GSAP do repozitáře**: Jersey 10, Atkinson Hyperlegible Next a JetBrains Mono (všechny licence OFL) z Google Fonts a `gsap.min.js` 3.15.0 (po kompresi 25 KB) z cdnjs. Plus: rychlejší, funguje offline a Google nedostane IP návštěvníků (důležité v EU). Než cokoli stáhnu, napíšu ti přesné názvy, zdroje a velikosti a počkám na ano. *Výchozí: ano.*
6. **Podpora prohlížečů**: poslední verze Chrome, Edge, Firefox a Safari, iOS od 16.4. Starší dostane textovou verzi (krok 2). *Výchozí: ano.*
7. **Web app manifest** („Přidat na plochu" spustí portfolio přes celou obrazovku jako aplikaci): potřebuje ikony 192 a 512 px z hrušky. *Výchozí: teď ne, kdykoli později.*

## Co v M6 není
- Safari, Firefox a skutečná zařízení (to zkusíš ty, seznam dostaneš v kroku 6).
- Poslech zvuku a čtečka obrazovky (to půjde jen s tebou).
- Zveřejnění, commit a nahrazení ostrého `index.html`. Nic se nepublikuje bez tvého pokynu.
- Souhlas s cookies u Microsoft Clarity (na ostrém webu už je, mimo localhost se načítá i tady). Pokud by Desktop nahradil ostrý web, zvaž to v M7.


---

## Krok 1: výkon (stav 2026-10-14)

**Hotovo, ověřeno v prohlížeči:**
- `_tools/thumbs.mjs`: malé kopie všech obrázků do `img/` (224 a 512 px, SVG a portrét se jen zkopírují). 3,6 MB originálů → **0,94 MB** všech kopií. Tokeny projektů: 260 KB → 40 KB, 246 → 38, 183 → 36, 134 → 22, 98 → 22. Průhlednost zůstala, ostrost ve všech oknech (Projects, Services, Process, Scrapbook, web 2008) jsem prošel.
- Názvy kopií se odvozují z jedné funkce (`thumbName` v `js/content/services.js`), takže skript a web se nemůžou rozejít. Originály v kořeni zůstávají pro ostrý web.
- Žetony se na pozadí stahují jen na rychlém připojení (ne při úspoře dat, 2G ani 3G) a jen v malých verzích.
- Terminal mód se načítá líně (7 souborů, 60 KB zdrojů).
- `_tools/preload.mjs` vypsal 52 modulů jako `modulepreload` do `index.html`: všech 52 se začne stahovat v rozmezí 1 ms (dřív po řetízku, úroveň po úrovni). Po přidání modulu spusť skript znovu (`--check` ověří, že je seznam aktuální).

**Čísla (lokálně, bez komprese):**

| | Před | Po, pomalé připojení | Po, rychlé připojení |
|---|---|---|---|
| Požadavků po startu | 76 | 63 | 78 (z toho 15 potichu na pozadí) |
| Obrázky | 985 KB | 16 KB | 197 KB |
| CSS při startu | 77 KB | 58 KB | 74 KB (cli.css přijde na pozadí) |
| JS a GSAP | asi 390 KB | 330 KB | 372 KB (s Terminalem) |

**Fonty a GSAP (po tvém ano staženo a ověřeno):**
- Šest souborů `woff2` ve `fonts/` (Atkinson Hyperlegible Next, Jersey 10 a JetBrains Mono, vždy latin a latin-ext) a `vendor/gsap.min.js` (3.15.0, 72 927 bajtů). Celkem asi 173 KB. U GSAP sedí SHA-512 s hodnotou, kterou cdnjs publikuje. U fontů jsem zkontroloval hlavičku souboru a velikost.
- `css/fonts.css` má pravidla `@font-face` s rozsahy znaků, které Google u těchto souborů uvádí. Atkinson a JetBrains jsou proměnné, takže jeden soubor pokryje váhy 400 až 700, resp. 400 až 800 (i 600, které web používá, se tím vykreslí přesně). `latin-ext` se stáhne jen tehdy, když se objeví znak z něj (Česká pojišťovna).
- Dvě písma, která potřebuje první obrazovka (Jersey 10 a Atkinson latin, dohromady 38 KB), se stahují hned (`preload`). JetBrains Mono až v Terminalu.
- Z `index.html` zmizely odkazy na Google Fonts i cdnjs: **žádný požadavek na cizí server**. Web teď funguje i bez internetu, jakmile je načtený, a Google nedostává IP návštěvníků.
- Nový dev přepínač `?nogsap` chová stránku, jako by se animační knihovna nenačetla. Prošel jsem celý web bez ní (brána, zapnutí, přepínání módů, okna, Puzzle, odemknutí, Save box) a nic nespadlo.

**Konečná čísla startu na Desktopu (lokálně, bez komprese):** 65 požadavků, 0 cizích, 470 KB (JS 372 KB včetně GSAP 72 KB, CSS 60 KB, fonty 38 KB). Na rychlém připojení se po startu potichu přidá Terminal (asi 60 KB) a malé žetony (asi 160 KB). Před úpravami to bylo 76 požadavků a asi 1,5 MB, z toho tři cizí servery.


---

## Krok 2: textová verze (stav 2026-10-14)

**Hotovo, ověřeno v prohlížeči:**
- `_tools/seo.mjs` přečte tytéž soubory, ze kterých čtou Desktop a Terminal (`js/content/*`), a zapíše celé portfolio jako obyčejný dokument do `index.html` mezi značky `seo:start` a `seo:end`: **1 748 slov**, 8 sekcí (About, Skills, How AI fits in, kariéra se šesti rolemi, Services, Process, Why choose me, Contact), 27 podnadpisů. Je to 15 KB z celých 28,7 KB `index.html` (po gzipu 8,9 KB). `--check` ověří, že text odpovídá obsahu. Po změně textu v `js/content/*` stačí skript spustit znovu.
- Do JSON-LD (schema.org Person) přibylo `knowsAbout` z deseti dovedností. Zbytek bloku zůstal ručně psaný. `noindex, nofollow` zůstává.
- **Co kdo vidí.** `<html>` začíná jako `no-js`. Malý skript v hlavičce zkusí, jestli prohlížeč umí, co stroj potřebuje (ES moduly, container queries, `color-mix`, `inert`): umí-li, přepne na `js` a stroj se načte; neumí-li, zůstane text a stroj se vůbec nestahuje. Totéž dostane, kdo má vypnutý JavaScript, a kdo přijde na `?plain` (záměrně).
- **Když se stroj nespustí.** `window.__mkFail()` vrátí textovou stránku. Zavolá se, když se nenačte `js/main.js` nebo když vyhodí chybu dřív, než naběhne. Zkoušel jsem obě cesty na dočasných kopiích stránky (chybějící soubor a soubor, který hodí výjimku): v obou případech se objeví text, `.screen` zmizí. Dočasné soubory jsem smazal.
- **Text nepřekáží stroji.** Když stroj běží, `#seo` je na pixel velký a oříznutý (`sr-only`), `aria-hidden="true"` se nastavuje hned při načtení (ne až po bootu) a čtečka tak používá Desktop nebo Terminal. Při selhání stroje se `aria-hidden` zase sundá. V textové verzi je `#seo` hlavní oblast (`role="main"`).
- **Vzhled textové verze** (`css/plain.css`, 2,9 KB): černé pozadí, nadpisy Jersey 10, text Atkinson Hyperlegible Next 18 px / 1,6, šířka 44 rem, portrét v původním tvaru. Kontrast textu 9,9 až 20,5 : 1 (odkazy 12,5 : 1). Pořadí nadpisů h1 → h2 → h3 bez děr. Bez vodorovného posuvníku při 680, 375 i 320 px.
- Ověřil jsem, že se stroj kvůli změnám nerozbil: celá cesta brána → boot manager → Desktop → Terminal (skutečné kliky), 0 chyb, 0 požadavků mimo vlastní server, žádné 4xx.

**Podpora prohlížečů.** Rozhoduje se podle schopností, ne podle názvu prohlížeče: stroj poběží všude, kde existují čtyři zmíněné vlastnosti (zhruba Chrome a Edge 111+, Firefox 113+, Safari 16.2+). Slibujeme a zkoušíme „poslední verze a iOS od 16.4". Prošel jsem kód a nenašel nic novějšího: žádné vnořené CSS, žádné nové metody JS (Set operace, `Promise.withResolvers` a podobné), `requestIdleCallback` má záložní variantu, `backdrop-filter` má předponu `-webkit-`.

**Co jsem nemohl ověřit:**
- Skutečné vypnutí JavaScriptu (vestavěný panel to neumí). Vzhled je ale stejný jako u `?plain`, kde se skripty stroje nespustí.
- ~~Kdo má JavaScript vypnutý, si možná stáhne i moduly ze seznamu `modulepreload` (v `?plain` to bylo 67 požadavků a 538 KB).~~ **Vyřešeno v M7:** odkazy `modulepreload` přidává malý skript jen tam, kde stroj poběží (`window.__mkSupported`), takže textová verze (`?plain`, starý prohlížeč, bez JavaScriptu) je 17 požadavků a 231 KB a stroj se startuje stejně rychle jako dřív (všech 52 modulů se začne stahovat v rozmezí 1 ms).
- Čtečku obrazovky: ověřuju jen strukturu (nadpisy, seznamy, `alt`, role), poslech musíš ty (krok 3).

---

## Krok 3: přístupnost (stav 2026-10-14)

**Nástroj.** `_tools/audit.js` (spouští se z konzole běžícího počítače, nic nemění): kontrast každého viditelného textu (včetně průhledných vrstev, `color-mix` a jednoduchých přechodů), jména ovládacích prvků a jestli se nečtou dvakrát, duplicitní `id`, obrazovou strukturu (nadpisy, orientační body, `alt`), velikost cílů a pořadí Tabu. Použití je v hlavičce souboru. Poznámka ke kontrastu: neaktivní (disabled) ovládací prvky WCAG z pravidla 4,5 : 1 vyjímá, nástroj je přeskakuje a počítá zvlášť.

**Měření (vše bez jediné chyby):**
- **Desktop:** 22 oken (všechna z manifestu, šest projektů, čtyři ovládací panely, About, Puzzle), šest stránek webu 2008 (hrdinský pruh s přechodem se měří na místě textu), osm stránek Scrapbooku, sedm menu, dialogy (alert, caution, stop, confirm, uložení, relikvie, bomba), brána, boot manager, úvodní obrazovka, bubliny, titulky. Celkem 743 textových uzlů jen v oknech, nejhorší poměr nad 4,5 : 1.
- **Terminal:** všech šest témat × stránka (125 uzlů), výpis příkazů (335 uzlů po 21 příkazech), dock a úvodní build: 0 chyb. Zjištění po cestě: moje dřívější „chyby" v tématu light byly falešné, způsobilo je 450ms přechodové zbarvení při měření (měřit se musí s vypnutými přechody) a `color-mix`, který prohlížeč vrací jako `color(srgb …)`.
- **Textová verze:** kontrast 9,9 až 20,5 : 1 (krok 2).

**Co jsem opravil (našlo to měření a klávesnicový průchod):**
1. „Trash, Trash" → „Trash" (jméno a druh se shodují, tak se druh nepřidá).
2. Terminal: nadpisy sekcí mají lidská jména pro čtečku (About, Skills, Career, How AI fits in, Links); příkaz („cat about.md") zůstává vidět, ale čtečka ho přeskočí. Totéž u ozdob: `$`, `★`, `[✓]`, `→`, `↗`, lomítko za skupinou dovedností, ASCII hruška a oddělovač v `neofetch`, stromové znaky v `ai`, hash v `git log`.
3. **Skrytý text pro vyhledávače byl v pořadí Tabu.** Odkazy v něm byly neviditelné, ale dalo se na ně dostat klávesou. Teď je `#seo` při běhu stroje `inert` (a `aria-hidden`), při selhání stroje se oboje sundá.
4. Odkazy, které se otevírají v nové záložce, to říkají čtečce („… (opens in a new tab)") v Terminalu, na webu 2008 i v dokumentu Links.
5. Posuvné plochy oken, na které jde dojít Tabem, měly bezejmennou roli. Mají jméno „<okno>, contents".
6. Po zavření okna se fokus vrací na ikonu, která ho otevřela (dřív na plochu). Myší se kroužek fokusu neukáže.
7. Terminal: dock ukáže, kde je klávesnice (skutečný vstup je mimo obrazovku), a odkaz dosažený Tabem se zastaví nad dockem, ne pod ním (`scroll-padding`).
8. Dialogy čtou i podřádek (`aria-describedby`).
9. V menu **je ⌘E** (Eject Disk) konečně skutečně klávesová zkratka. Hint tam byl, zkratka ne.
10. **Rozestupy textu (WCAG 1.4.12)**: vyzkoušel jsem rozestupy 1,5 / 0,12 em / 0,16 em / 2 em na 16 oknech. Dvě věci se ořízly: přepínač Desktop | Terminal (teď se zvětší s textem) a okna, která neposouvají obsah (ovládací panely, Puzzle): teď se **posuvník objeví sám, když obsah přeroste okno** (krátká obrazovka, větší písmo). General Controls bylo o 14 px nižší než obsah, je 488 px.
11. Vedlejší nálezy: `<img src="">` v okně projektu (vyvolával chybu načtení) a „ResizeObserver loop" chyba v konzoli při samočinném posuvníku (ošetřeno).

**Vysoký kontrast a vynucené barvy.** Nový `css/a11y.css` (a závěr `cli.css`): při `forced-colors: active` nebo `prefers-contrast: more` zmizí sklo (scanlines, vinětace), v Terminalu i tečkované pozadí; v `forced-colors` mají výběr, otevřené menu, aktivní okno, výchozí tlačítko, zaškrtnutí, posuvník a fokus (dřív stín, který vynucené barvy odstraní) systémové barvy; v Terminalu je dock a kurzor vidět. **Napsáno podle specifikace a vyzkoušeno v běžném prohlížeči se stejnými pravidly bez podmínky (nic se nerozbilo), ale ne ve skutečném režimu vysokého kontrastu.** V Chrome to uvidíš: DevTools → Rendering → „Emulate CSS media feature forced-colors: active" (a `prefers-contrast`).

**Dokumenty.** `docs/M6-klavesy.md` (mapa kláves na jedné stránce) a `docs/M6-voiceover.md` (11 kroků, co poslouchat, 10 minut).

**Co nejde a nechávám:**
- Přesouvání a zvětšování oken a přetahování ikon jde jen tahem (WCAG 2.5.7). Obsah to nepotřebuje a zoom okna, Clean Up a „Move to Trash" fungují z menu a klávesnice. Klávesové přesouvání oken jsem nedělal.
- Cíle pod 24 px: viz krok 4.
- Poslech (VoiceOver, NVDA) a skutečný vysoký kontrast: musíš ty.

---

## Krok 4: dotyk (stav 2026-10-14)

**Co se změnilo (vzhled zůstává, roste plocha, na kterou se dá trefit):**
- **Menu bar na dotyku je 34 px** místo 22 (`--mb-h`), písmo 18 px (na telefonu 17). Na telefonu se názvy menu rozdělí po celé šířce: 46 až 69 px široké, bez mrtvých mezer. Hodiny i „?" jsou vysoké jako celý pruh. Při 375 i 320 px se vejde všechno do jednoho řádku.
- **Okna.** Zavírací a zoom čtverečky (13 px) i roh pro změnu velikosti mají neviditelnou plochu navíc: pro myš 27 × 25 px, na tabletu 45 × 27 (celá výška titulku, který je tam 28 px), na telefonu 44 × 30. Plocha nikdy nepřesahuje do obsahu okna.
- **Další velikosti:** řádky pull-down menu 40 px, tlačítka 40 px, tlačítka v Browseru a ve Scrapbooku 40 × 36, přepínač Desktop | Terminal 28 px na tabletu a 40 až 44 na telefonu. Na telefonu mají zaškrtávací políčka, přepínače a posuvníky 44 px a řádky seznamu 44 px. Klávesové zkratky v menu se na telefonu skryjí. V Terminalu mají tlačítka `skip` a `close` tělo pro prst.
- **`:hover` jen tam, kde je myš.** Všech 16 pravidel je za `@media (hover: hover)`, takže na dotyku nic nezůstane „najeté" po klepnutí.
- **Žádné šedé zablikání při klepnutí, žádné stahování stránky dolů** (`overscroll-behavior`), **žádný zoom dvojklepnutím** (`touch-action: manipulation`; zoom dvěma prsty zůstává) a žádné podržením vyvolané menu na ikonách.
- **Bezpečné okraje** (výřez, spodní lišta iPhonu, nainstalovaná aplikace pod stavovým řádkem): sklo leží uvnitř `env(safe-area-inset-*)`. V běžném prohlížeči jsou nuly, takže tam se nic nemění.
- **Klepnutí na jiný název menu** otevřelo menu a hned ho zavřelo (dotyk pošle „najetí" těsně před klepnutím). Teď se najetí bere jen u myši.
- **Terminal a klávesnice na iPhonu.** Klávesnice na iPhonu (a v Chromu na Androidu) zakryje spodek stránky, aniž by ji zmenšila, jen se zmenší „visual viewport". Dock a jeho výpis se proto zvednou o zakrytou výšku (`--kb`, `visualViewport`) a výpis se podle toho zkrátí. Při přiblížení dvěma prsty se nezvedá. Logiku jsem ověřil rukou nastavenou hodnotou, **na iPhonu to musíš zkusit ty**.
- **Prstem místo myši.** Se syntetickými dotykovými událostmi (typ „touch") jsem vyzkoušel: tažení okna za titulek, změna velikosti rohem, tažení ikony na ploše a „klepnutí, klepnutí" otevírá. Všechno funguje. Skutečný prst a iPad musíš zkusit ty.
- **„Do Not Open" bez klávesnice: pětkrát rychle klepnout (nebo kliknout) na hodiny** (do 2,5 s). Čtyři klepnutí nic, páté odemkne (melodie, ikona, bublina „Something appeared on the desktop.").
- **Stopy pro návštěvníky** (odpověď 3). V konzoli při startu: „Looking for something?  ↑ ↑ ↓ ↓ ← → ← → B A   (on a phone: tap the clock five times)". V About This Computer pod čarou: „One more file lives on this computer, out of sight. The old arcade code finds it. So does tapping the clock five times." **Znění věty potřebuje tvůj souhlas** (viz níže varianty). Texty jsou v `js/content/eggs.js` (`hints`).
- **„Přidat na plochu".** `manifest.webmanifest` (jméno „Marian OS", `standalone`, na Androidu `fullscreen`, barva pozadí a tématu #050403), ikony hrušky v `icons/`: 192 a 512 px, maskovatelná 512 px, Apple Touch 180 px, favicon 32 px (obě kresby jsou SVG, PNG z nich dělá `_tools/icons.mjs`: Chrome kreslí, `sips` zmenšuje, nic se nestahuje). Do `<head>` přibyly odkazy a meta tagy (`apple-mobile-web-app-*`). Bez service workeru: instalace funguje, offline režim ne (nikdo ho nechtěl).

**Měření.** `_tools/audit.js` (`targets()`) teď počítá i skutečnou plochu pro klik (včetně neviditelných ploch navíc) a výjimku z WCAG 2.5.8 (malý cíl s volným místem kolem). Výsledek: **0 cílů pod 24 px** na Desktopu s myší, v simulaci tabletu (dotykové CSS vynucené na šířce 1024) i na telefonu 375 px ve všech 22 oknech (723 textových uzlů, 0 chyb kontrastu, 0 přetečení do strany, 0 chyb v konzoli) a v Terminalu na telefonu.

**Čím jsem se řídil při testech** (a co z toho plyne pro tebe): vestavěný panel zpomaluje časovače na zhruba sekundu, takže jsem časově závislé věci (klepnutí, klepnutí) posílal najednou v jednom okamžiku. Panel navíc kreslí menší než 1 snímek za sekundu, proto přepnutí módu trvalo 20 s a chvíli jsem musel vypnout vyhlazování zpoždění GSAP. V normálním prohlížeči nic z toho neplatí.

**Varianty věty do About This Computer** (jednu jsem dal dovnitř, řekni, kterou chceš):
1. *(teď v kódu)* „One more file lives on this computer, out of sight. The old arcade code finds it. So does tapping the clock five times." Říká kód i telefon, nic nespoileruje.
2. „Psst: there is one more file on this desktop. ↑ ↑ ↓ ↓ ← → ← → B A, or five quick taps on the clock." Říká všechno, nejméně tajemná.
3. „One more file lives on this computer. It shows up for people who remember the old arcade code." Jen záhada, telefon by to nenašel.

**Co nemůžu ověřit:** skutečný iPhone a iPad (klávesnice, bezpečné okraje, instalace na plochu, podržení prstu), Android, Safari a Firefox.

---

## Krok 6: QA, README a zařízení (stav 2026-10-14)

**Co jsem prošel** (nástrojem `_tools/qa.js`, který načte stroj v rámu přesné velikosti, takže se dotazy na šířku a container queries chovají jako na tom displeji):
- **Devět velikostí:** 320 × 568, 375 × 812, 768 × 1024, 1024 × 768, 1440 × 900, 1920 × 1080, 2560 × 1440 a naležato 812 × 375 a 568 × 320. V každé: Desktop (menu bar, všechny ikony, devět oken, dialog, přepínač), Terminal (stránka, dock, přepínač, výpis příkazů `help`, `neofetch`, `ls`, `links`, kontrast, jména), brána, boot manager a textová stránka. Nic nepřečnívá, nic není oříznuté, žádné okno nevisí z plochy, žádný text pod 4,5 : 1, žádný ovládací prvek bez jména.
- **Šest témat Terminalu** po změnách z kroků 3 a 4 (stránka a výpis pěti příkazů, 207 textů v každém): 0 chyb kontrastu.
- **Telefon s dotykem** (emulace 375 a 320): 22 oken, 0 chyb (krok 4).
- **Složka je samostatná.** Server, který obsluhoval jen `version-10-marian-os`: po otevření 17 oken a všech šesti stránek webu 2008 to dalo 109 požadavků a 0 × 404. (Kopii složky lze tedy dát na jakýkoli hosting.)
- **Start na Desktopu (čistá mezipaměť, lokálně bez komprese):** pomalé připojení (3G, úspora dat) 69 požadavků a 555 KB (JavaScript 323 KB v 52 modulech, CSS 76 KB, GSAP 72 KB, písma 39 KB, HTML 30 KB, obrázky 16 KB); rychlé připojení 82 požadavků a 802 KB (potichu přibude Terminal a malé žetony). Na cizí server nejde žádný požadavek, 0 chyb.

**Co průchod našel a opravil:**
1. **Jeden nenačtený soubor = textová verze.** Při přerušeném spojení (na pomalém mobilu) stačilo, aby se nenačetl jediný ze 60 souborů, a návštěvník dostal textovou stránku. Teď to stroj **jednou potichu zkusí znovu** (obnovení stránky; značka v `sessionStorage` brání smyčce a po úspěšném startu se maže), a když to selže podruhé, ukáže text a odkaz „Open the interactive version". Chyby cizích skriptů (třeba analytiky) už start neshodí, jen chyby našich souborů. Zkoušel jsem na dočasných stránkách: trvale chybějící soubor = jedno znovunačtení a pak text, úspěšný start značku smaže.
2. **Nízký displej (telefon na šířku, malé okno prohlížeče).** Dvě sloupce ikon přesahovaly dolní okraj: u 812 × 375 byly tři ikony (Process, Why Me, Commands) mimo dosah a nešly otevřít. Pod výškou 520 px se ikony skládají do mřížky jako na úzkém displeji (poloha, kterou jsi jim dal, se pamatuje pro vysoký displej). Nová okna se otevírají tam, kde se vejdou: kaskáda od 36 px je dřív zatlačila přes dolní okraj.
3. **Velký displej.** Okna se otevírala v rohu vedle ikon a na 2560 px vypadala ztraceně. Na ploše od 1100 × 560 se teď první okno otevře uprostřed (horní třetina), další se kaskádují od něj; ikony zůstávají vlevo. Na menších displejích je to jako dřív. Nativní velikost beze zvětšení rozhraní zůstává podle tvého rozhodnutí 4.
4. **Úzké okno s myší (320 px).** Menu bar byl o 14 px širší než sklo (hodiny měly minimální šířku). Hodiny teď na úzkém skle ustoupí a vejde se všechno.
5. Vedlejší: server `portfolio` zahazoval spojení, když prohlížeč žádal o 60 souborů najednou (fronta spojení měla 5 míst, teď 256). Šlo o vývojový server, ne o stroj, ale kvůli němu se mi stroj při zkouškách občas nespustil.

**Dokumenty a nástroje.** `README.md` ve složce (spuštění, kde je co, jak změnit text a co potom spustit, skripty, ladicí adresy, co si prohlížeč pamatuje, co je potřeba před zveřejněním), `docs/M6-zarizeni.md` (seznam pro iPhone, iPad, Android, Safari, Firefox, vysoký kontrast, pomalou síť), `_tools/qa.js` (průchod velikostmi), nový dev přepínač `?net=slow`.

**Co M6 dohromady přinesl (před → po):**

| | Před | Po |
|---|---|---|
| Start Desktopu, pomalé připojení | 76 požadavků, asi 1,5 MB | **69 požadavků, 555 KB** |
| Cizí servery | 3 (dvě domény Google Fonts a cdnjs) | **0** (mimo localhost se načítá ještě analytika Clarity, jako na ostrém webu; viz README) |
| Obrázky při startu | 985 KB | **16 KB** (na rychlé síti 199 KB potichu po startu) |
| Bez JavaScriptu / ve starém prohlížeči | téměř prázdná stránka (úvodní věta a čtyři odkazy) | **celé portfolio jako text** (1 748 slov) |
| Přístupnost | nezkoušeno | **0 chyb kontrastu a jmen** v 22 oknech, 6 tématech, všech stavech; mapa kláves, seznam pro VoiceOver |
| Dotyk | menu bar 22 px, `:hover` zůstával po klepnutí | **34 px**, cíle 24 až 44 px, `:hover` jen u myši, klávesnice nad dockem, „Do Not Open" i bez klávesnice |
| Instalace na plochu | ne | **ano** (ikony hrušky, manifest) |

**Co jsem nemohl ověřit** a nechávám na tobě: skutečný iPhone, iPad a Android (klávesnice v Terminalu, bezpečné okraje, instalace, tažení prstem), Safari a Firefox, VoiceOver, vysoký kontrast ve Windows. Seznam, co přesně zkusit, je v `M6-zarizeni.md`.
