# M7: review a co dál (2026-10-15)

Prošel jsem celé dílo jako cizí oči: kód, texty, bezpečnost, výkon, přístupnost, provoz a zveřejnění. Nic není commitnuté ani zveřejněné. Co šlo opravit hned, opravil jsem a ověřil; zbytek je tady jako rozhodnutí pro tebe.

## 0. Rozhodnutí z 2026-10-16 (po review)

| Téma | Rozhodnutí |
|---|---|
| Cesta ven | **C: výměna.** Stroj se nasadí rovnou na místo ostrého webu: přesun do kořene repozitáře, GitHub Pages dál staví z `main`. Starý web je v `_old-site/` (nezveřejňuje se, v `/classic/` není) |
| Analytika | žádná: Clarity pryč, žádné cookies, tedy ani lišta |
| Boot ikona | zůstává (vlastní pixel art usměvavého počítače v duchu klasiky) |
| Kontakt | položka „Contact…" v menu hrušky; životopis (PDF) ne |
| První okno | „Marian Kadlec" (web 2008) místo Read Me, při každém startu na všech velikostech |
| Věta v About, `M5-tipy.md` | beze změny (věta ve variantě 1; tipy jsou jen tahák, nejdou na web) |
| Stahování | jen tři texty licencí písem (`fonts/OFL-*.txt`); Firefox a WebKit ne |

**Nález při přípravě nasazení: adresa webu je `mariankadlec.cz`** (CNAME repozitáře), ne `.com`. `.com` neexistuje (bez DNS, bez registrace), a přesto na ni mířil canonical, Open Graph i JSON-LD, ve starém webu i v tomto (opsáno a neověřeno), a `twitter-image.jpg` starého webu vrací 404. Opraveno všude (`contact.site` je jediný zdroj) a hlídá to `_tools/build.mjs`. Příklad „`mariankadlec.com/os/`" v bodě 5 je tedy neplatný. Co se opravdu udělalo: `M8-nasazeni.md`.

## 1. Verdikt

**Technicky je to hotové a pevné.** Dva módy jednoho stroje, 58 modulů, 7 800 řádků JavaScriptu a 2 300 řádků CSS, bez buildu a bez závislostí kromě GSAP. Je to v pořádku udržované: nula `TODO`, žádný nepoužitý export (zkontrolováno skriptem), z 278 CSS tříd jediná nenalezená (a ta se skládá za běhu), všechny texty na jednom místě, nástroje na kontrolu (`audit.js`, `qa.js`, generátory).

**Na tichý start je připravené** (neindexovaná adresa, sdílená ručně), **na výměnu ostrého webu ještě ne.** Brání čtyři věci, které nejsou kód: analytika s cookies, zkouška na skutečných zařízeních, způsob hostingu a mezipaměti, a jedno rozhodnutí o tom, co návštěvník uvidí jako první a kde je kontakt. Podrobně v bodech 4 a 5.

## 2. Co jsem při review opravil (vše ověřeno)

| Nález | Dopad | Oprava |
|---|---|---|
| Když prohlížeč blokuje úložiště („blokovat všechny cookies", některé soukromé režimy, sandbox), **stroj se nespustil** a ukázal jen text | Návštěvníci, kteří si blokují cookies (třeba designéři), by dostali textovou verzi, aniž by věděli proč | `localStorage` se hledá až při použití uvnitř `try`; Desktop i Terminal běží, jen si nic nepamatují. Zkoušeno na stránce, kde sahání na úložiště vyhazuje chybu |
| **Hučení** CRT zůstávalo hrát v kartě, na kterou se nikdo nedívá | „Ta stránka dál hučí", ikona reproduktoru na kartě | Zvuk se při skryté kartě pozastaví a po návratu pokračuje |
| Textová verze (`?plain`, čtečky, starý prohlížeč) stahovala i **všech 52 modulů stroje** (69 požadavků, 538 KB) | Zbytečná data pro přesně ty, kdo textovou verzi volí | Odkazy `modulepreload` přidává skript jen tam, kde stroj poběží: **17 požadavků a 231 KB**; stroj startuje stejně rychle |
| Když se nenačetl soubor Terminalu (ztracené spojení), **přepnutí mlčky nic neudělalo** | Návštěvník neví, co se děje | Bublina „Terminal could not be loaded. Check the connection and reload the page." a hlášení pro čtečku; Desktop zůstane funkční |
| `FS.create` se zacyklil na nemožném jménu (jen z konzole, UI ho nikdy tak nevolá) | Stránka se zasekla (tak jsem to odhalil) | Jméno se ořízne a smyčka má strop |
| E-mail v Terminalu se čtečce hlásil jako „opens in a new tab" | Nepřesné | `mailto:` je obyčejný odkaz |
| „colour" v bublině menu Label | Jediné britské hláskování v textech (jinak „optimize", „color") | „color" |

**Zkoušeno a v pořádku:** vložení škodlivého textu (`<img onerror>`, `<svg onload>`, `<script>`, `<iframe srcdoc>`) do příkazové řádky Terminalu (12 pokusů), do jmen složek na ploše (přejmenování) a do adresy (`#/os/open/<…>`): nic se nespustilo a vše se zobrazí jako text. `eval`, `document.write` a `new Function` se v kódu nepoužívají. Když se nenačte Terminal, Desktop běží dál (zkoušeno).

## 3. Co jsem změřil

| | |
|---|---|
| **Start Desktopu** | 69 požadavků; **555 KB bez komprese, asi 203 KB po gzipu** (JS 105, GSAP 28, CSS 22, HTML 9, písma 38) + 16 KB obrázků; na rychlé síti potichu dalších asi 250 KB (Terminal a žetony) |
| **Rychlost** (lokálně) | první vykreslení brány 84 ms, největší prvek 84 ms, posun rozložení 0, žádný dlouhý úkol |
| **Textová verze** | 17 požadavků, 231 KB, první vykreslení 56 ms, posun rozložení 0 |
| **Všechny velikosti** | 9 velikostí od 320 × 568 po 2560 × 1440 a naležato: nic nepřečnívá, žádný text pod 4,5 : 1, žádný prvek bez jména; šest témat Terminalu čistých |
| **Přístupnost** | 22 oken, 6 témat, všechny dialogy; mapa kláves; seznam pro VoiceOver (neposlechnuto) |
| **Cizí servery** | 0 (mimo localhost se načítá ještě Microsoft Clarity, viz 4a) |
| **Složka je samostatná** | spuštěná sama: 109 požadavků, 0 × 404 |

## 4. Nálezy, které potřebují tvoje rozhodnutí

### a) Analytika a cookies (blokuje zveřejnění)
`index.html` načítá **Microsoft Clarity**. Mimo localhost nastavuje cookies a posílá záznamy chování (záznam relací, mapy kliků) na servery Microsoftu. V EU a v ČR je na to potřeba souhlas předem. Ostrý web ho má také, takže stejný problém už existuje. Možnosti:
1. Nechat a přidat souhlas (lišta, a Clarity se načte až po souhlasu).
2. Vyměnit za analytiku bez cookies (třeba GoatCounter, Plausible nebo Umami): číslo návštěv a „kolik lidí prošlo bránou a otevřelo co" stačí, nepotřebuješ záznamy obrazovky. Pak nepotřebuješ ani lištu.
3. Nechat bez analytiky.

*Moje doporučení: 2 (nebo 3).* Stroj navíc nic jiného nepřenáší ani neukládá (jen nastavení do `localStorage` u návštěvníka).

### b) IP a „neutrální názvy"
Splněno: žádné Apple logo, ikony ani písma, zvuky jsou vlastní syntéza, písma mají licenci OFL, GSAP běží pod standardní licencí (pro běžný web zdarma; před zveřejněním si přečti podmínky na gsap.com/standard-license). Čtyři poznámky:
- **Boot ikona je usměvavý kompaktní počítač.** *(Rozhodnuto 2026-10-16: zůstává.)* Je to vlastní pixel art, ale čte se jako „Happy Mac", a ty jsi v plánu výslovně vyloučil Happy/Sad Mac. Doporučuju **nahradit originálem** (třeba hruška s úsměvem ve stejné pixelové kresbě): to udrží půvab a zruší jakoukoli pochybnost.
- **Názvy z System 7:** „Balloon Help", „Scrapbook", „Puzzle", „Control Panels", „System Folder" jsou obecná slova a funkce; u „Balloon Help" je to název funkce Applu. Riziko je nízké (podobných poct je spousta), ale lze přejmenovat na „Help Balloons" bez změny funkce.
- **Písma:** u OFL se k šíření přikládá licence a copyright autorů. Mám v `fonts/README.txt` odkaz, ne celé texty. Před zveřejněním přidat `fonts/OFL.txt` s přesnými řádky z repozitářů písem (potřebuju tvůj souhlas se stažením).
- **Loga klientů** (Generali, Jobs.cz, Atmoskop, Storyous, Syca, Slevomat) jsou na žetonech. Je to obvyklé v portfoliu, ale patří to do tvého posouzení smluv (NDA).

### c) Obsah a první dojem
- **Kontakt na ploše chybí jako samostatná věc.** Cesta k e-mailu je: Marian Kadlec → Contact, nebo Links, nebo příkaz `hire`, nebo File → Save Contact As…. Pro portfolio, jehož smyslem je ozvat se, je to schované. *Návrh:* položka „Contact" v menu hrušky a v menu bar na dotyku, nebo ikona „Say hello" na ploše (otevře dialog s e-mailem a vizitkou).
- **První okno po startu je návod (Read Me), ne práce.** Pro člověka, který má 10 sekund, je to nejméně zajímavé okno. *Návrh:* otevřít jako první Projects (ikony s žetony jsou vizuální háček) nebo vedle něj, a Read Me nechat jako ikonu.
- **Chybí viditelný důkaz práce** (obrazovky, případové studie). Je tam text a loga klientů, stejně jako na ostrém webu. Stroj je ukázka řemesla; samotné projekty bez obrázků na designérském webu drží jen na textu. Rozhodl jsi dřív, že nic nového do Terminalu; tady jde o Desktop. *Možnost:* jedno až tři okna s ukázkami (screeny, krátký popis rozhodnutí) u nejsilnějších projektů.
- **Životopis ke stažení (PDF)** nikde není. Recruiteři ho čekají. *Možnost:* soubor „Resume.pdf" na ploše (dostanu od tebe PDF).
- **Cesta k obsahu při první návštěvě** je asi 10 sekund, když se čeká na všechno (boot manager odpočítává 5 s, úvodní obrazovka 3 s), a asi 3 až 4 s, když se zmáčkne Enter a Esc. Čas jsi nechal původní, to respektuju; odkaz „Plain text version" na bráně je záchranná cesta. Doporučuju to po zveřejnění **měřit** (kolik lidí opustí bránu), ne hádat.
- Drobnosti: „front-end" a „frontend" v textech (druhý je doslovně ze starého webu, takže jsem ho nechal); datum „Oct 10, 2026" v `desktop.js` (`BUILD_DATE`) ukazuje Get Info u všech položek, před zveřejněním aktualizovat.

### d) Hosting a mezipaměť (blokuje výměnu ostrého webu)
Ostrý web běží na **GitHub Pages** (soubor `CNAME`). Pro stroj z toho plyne:
- **Mezipaměť 10 minut a názvy souborů bez otisku.** GitHub Pages posílá `Cache-Control: max-age=600` a hlavičky nejde měnit. Moduly se jmenují pořád stejně (`os.js`, `wm.js` …). Po nasazení nové verze může návštěvník, který stránku načetl v posledních 10 minutách, dostat **směs starých a nových souborů** a stroj se nespustí (zachrání ho nové jednorázové zopakování a pak text, ale neměl by to být normální stav). Řešení bez buildu: malý skript `_tools/stamp.mjs`, který podle obsahu souborů přidá ke každému souboru otisk (`?v=…`) a zapíše import map. Změněné soubory se stáhnou znovu, nezměněné zůstanou v mezipaměti. Práce asi dvě hodiny.
- **HTTP/2:** GitHub Pages ho má, 60 souborů najednou je v pořádku. Na hostingu jen s HTTP/1.1 by start byl pomalejší.
- **Hlavičky zabezpečení (CSP a spol.) tam nejdou.** CSP se dá aspoň přes `<meta>`, ale máme pět vložených skriptů, takže by šlo jen s otisky (hash). U osobního portfolia bez formulářů a přihlášení je to nízká priorita.
- **Podsložka:** `version-10-marian-os` lze nasadit pod jakoukoli adresu (všechny cesty jsou relativní, manifest má `./`). Ikony, manifest a favicon jsou uvnitř složky.

### e) Vyhledávače a sdílení
- **Co uvidí Google:** brána + skrytá, ale úplná textová verze (`#seo`, vložená v HTML, takže se nečeká na JavaScript). Strukturovaná data jsou, canonical ukazuje na kořen. Skrytý text, který je pro uživatele dostupný jinou cestou (Desktop, Terminal, odkaz na text), je legitimní, ale **po zveřejnění ověřit v Google Search Console** (Kontrola adresy URL → Zobrazit zachycenou stránku), že vidí, co čekáme. Záložní plán: viditelná krátká sekce „O mně" pod bránou.
- **`noindex`** je v `<head>` záměrně; před zveřejněním pryč. Soubory `robots.txt` a `sitemap.xml` v kořeni nejsou.
- **Náhled při sdílení (`og:image`)** ukazuje starý obrázek ostrého webu. Nový (1200 × 630: hruška, jméno a „This portfolio is a computer.") umím vyrobit stejným postupem jako ikony. Je to rychlá výhra pro LinkedIn a sdílení.

## 5. Jak to pustit ven: čtyři cesty

| | Co se děje | Plus | Minus | Práce |
|---|---|---|---|---|
| **A. Laboratoř** | Stroj pod vlastní adresou (třeba `mariankadlec.com/os/`), `noindex`, sdílíš ručně (LinkedIn příspěvek, Dribbble, kamarádi). Ostrý web beze změny | Žádné riziko, skutečná zpětná vazba a čísla, čas na zařízení | Nepřivádí vyhledávací návštěvnost | malá (soubory + odkaz) |
| **B. Brána z ostrého webu** | Ostrý web zůstane, nahoře odkaz „Try the computer →" | Pozvolné, vidíš prokliky | Dvě tváře | malá |
| **C. Výměna** | Stroj je kořen, starý web přesune do `/classic/`, textová verze je pro vyhledávače a čtečky | Jedna silná identita | Nejvíc rizika: analytika, mezipaměť, SEO, první dojem recruitera | střední až velká (body 4a až 4e) |
| **D. Nezveřejnit** | Zůstane jako ukázka řemesla: záznam obrazovky, příspěvek, případová studie o vzniku | Žádné provozní starosti | Nikdo si to nemůže zkusit | malá |

**Moje doporučení:** nejdřív **A**, a v tu chvíli udělat jen nezbytné (4a, boot ikona, kontakt, og obrázek). Podle čísel a ohlasů pak **B** nebo **C** (C až po otiscích souborů, Search Console a zkoušce na zařízeních).

## 6. Doporučený postup

1. **Rozhodnout** body níže (hlavně analytika, boot ikona, kontakt, první okno).
2. **Zařízení:** projít `M6-zarizeni.md` (iPhone, Android, Safari, Firefox) a `M6-voiceover.md`. To je jediné, co nikdo jiný než ty neověří.
3. **Drobnosti před laboratoří** (asi půl dne): boot ikona (originál), Contact, og obrázek, `fonts/OFL.txt`, aktualizovat `BUILD_DATE`, úklid složky (`_archive` a `_spike` jsou historie, 96 KB, které nic nenačítá).
4. **Laboratoř (cesta A)**, `noindex` zůstává.
5. **Otisky souborů** (`stamp.mjs`) a **Search Console**, až se bude uvažovat o B nebo C.
6. **Měření** (cookieless) a po dvou třech týdnech rozhodnutí o B nebo C.

## 7. Technický dluh a rizika (krátce)

- **Žádné automatické testy.** Kontroly jsou nástroje v konzoli (`audit.js`, `qa.js`), které si spustí člověk. Další úroveň: testy v prohlížeči bez ruky (Playwright), které by se spouštěly před každým nasazením. Vyžaduje stáhnout nástroj (potřeboval bych tvůj souhlas).
- **Bez buildu** = 60 souborů a ruční generátory (`seo.mjs`, `preload.mjs`, `thumbs.mjs`, `icons.mjs`). Hlídá je `--check`, ale pamatovat si, že se spouštějí, musí člověk (viz README).
- **Safari, Firefox a skutečná zařízení neověřeny.** Úhlavní rizika: kontejnerové dotazy typu `size` na `.screen`, `:has()`, `color-mix` v Safari 16.2 až 16.3, zvuk (WebAudio) po prvním klepnutí na iOS, klávesnice nad dockem.
- **Velké soubory** v pořádku (nejdelší `os.js` má 587 řádků). Kresba ikon (`icons.js`, 404 řádků) je kód, ne obrázky, což je úspora, ale úprava pixelů v kódu je pracná.
- **Výkon na starém telefonu** neměřen (animované tečky v Terminalu, filtry skla). Pro jistotu stačí zapnout profil v Safari na starším iPhonu.
- **Plán B při selhání startu:** jedno automatické zopakování a pak text. Funguje; v provozu by stálo za to počítat, kolikrát se to stane (čtyři řádky měření).

## 8. Nápady, které nejsou nutné

Štěkání psa při probuzení, klávesové přesouvání oken (úplná shoda s pravidlem o tažení), volba velikosti rozhraní na velkých displejích (zamítnuto), offline režim (service worker), česká verze, Time Machine (zamítnuto), animovaná tapeta na ploše pro velké displeje (na 2560 px je plocha prázdná, ikony vlevo; jedna velká dithrovaná scéna by pomohla vizuálnímu „wow", ale je to designová volba).

## 9. Rozhodnutí, která potřebuju

1. **Cesta ven:** A (laboratoř, doporučuju), B, C nebo D?
2. **Analytika:** zrušit Clarity a případně nasadit cookieless, nebo nechat se souhlasem?
3. **Boot ikona:** vyměnit usměvavý počítač za originál (hrušku)? Navrhnu dvě varianty.
4. **Kontakt:** přidat „Contact" do menu a/nebo na plochu? A PDF životopisu?
5. **První okno:** nechat Read Me, nebo otevřít Projects?
6. **Věta v About This Computer** (zůstala varianta 1) a **seznam tipů z M5** (`M5-tipy.md`), který jsi výslovně neodsouhlasil.
