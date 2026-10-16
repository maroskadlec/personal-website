# M5: velikonoční vajíčka

**Stav (2026-10-14): rozhodnutí odpovězena, kroky 0 až 5 hotové. Seznam tipů je v `docs/M5-tipy.md` a čeká na tvůj souhlas jako brána M5, pak následuje M6.** Odpovědi: 1 vše, co jde nezávisle na M4 (tedy i `open <název>`, `ls`, `cd`, `cat` v Terminal módu) · 2 čtyři relikvie · 3 bomba obojím · 4 menu „?" a bublina · 5 vCard · 6 pes (původně kočka Neko) na vyžádání, spořič po 3 min · 7 a 8 (Before & After, Time Machine) **vynechány** · 9 kredity. Konami proto odemkne jen „Do Not Open". Texty jsou v `docs/M5-texty.md` a v kódu v `js/content/eggs.js`.

M4 se přeskakuje (jeho plán zůstává v `docs/M4-kroky.md` a dá se udělat kdykoli později). Co to pro M5 znamená:

- Ikona Terminal dál přepíná do Terminal módu, okno Terminal na ploše nevznikne.
- Vtipné příkazy se přidají do Shellu, který už v Terminal módu běží. Budou tedy jen tam. Do okna na ploše se dostanou, až se někdy udělá M4 (Shell je na sdílení připravený).
- Příkazy `ls`, `cd`, `cat` a `open <název>` (propojení Terminal módu s okny na ploše) vyžadují sdílený překladač názvů z M4. V M5 je nedělám.

Z původního plánu už **hotové z M2**: „Nedostatek paměti" (About ukazuje paměť, okna ji ujídají), Brightness v Monitors, a nelze vyhodit „Marian Kadlec" do Koše („in use"). V kódu zatím **není nic** z ostatních vajíček.

Označení: **[rozhodnutí]** = potřebuju tvůj souhlas, moje výchozí odpověď je první. Všechny texty vajíček jsou nové, takže ti je před kódováním napíšu ke schválení v jednom dokumentu, stejně jako u M3.

---

## Čtyři balíčky a jejich vajíčka

### A. Klasika Macu
| Vajíčko | Co udělá | Jak se najde |
|---|---|---|
| **Koš s relikviemi** | V Koši na začátku leží `client_feedback_FINAL_v47_opravdu_final.psd` a `flash_intro.swf` (a pár dalších). Ikona Koše je od začátku plná. Soubory jdou otevřít (hláška, že program, který je vytvořil, už neexistuje), vyndat zpět nebo vysypat | Pohled do Koše |
| **Bomba** | Systémová chyba s ikonou bomby („Sorry, a system error occurred."), po Restartu se stroj nahodí znovu | „Do Not Open" (skryté) a příkaz `sudo rm -rf /` v Terminalu |
| **Balloon Help** | Menu „?" u hodin: „Show Balloons". Když je zapnuté, ikony ukazují bublinu s popisem (využiju už napsané komentáře ikon). Navíc jednorázová bublina „Double-click me" u ikony Marian Kadlec | Menu „?" a první start |
| **Kontakt jako „Save As…"** | File → Save Contact As…: dialog s názvem souboru `Marian Kadlec.vcf`, po Save se stáhne vizitka (jméno, role, e-mail, odkazy ze sdíleného obsahu) | Menu File |

### B. Terminál a dev humor (jen Terminal mód, viz výše)
`fortune` (krátké věty ze života designéra a vývojáře), `neofetch` (výpis stroje „Marian OS 7.5.5-vibe"), `coffee` rozšířené o „418 I'm a teapot", `ping client` (odpovědi jako „can you make the logo bigger"), bohatší `sudo` (včetně `sudo rm -rf /`, které spustí bombu), `git log` jako alias `career`. Dnešní `whoami`, `hire`, `theme`, `history`, `reboot`, `shutdown` a `gui` už fungují.

### C. Hravé
| Vajíčko | Co udělá |
|---|---|
| **Puzzle s fotkou** | Pear menu → Puzzle: posouvací hlavolam 4×4 s tvým dithrovaným portrétem, míchání, hláška po složení |
| **Pixel pes** | Pear menu → Dog: pes (originální pixelart; původně kočka Neko) běhá za kurzorem a usíná, když stojí. Vypnutelný, na dotyku se nenabízí |
| **Spořič s létajícími kurzory** | Po pár minutách nečinnosti přeletí přes obrazovku kurzory. Jakýkoli pohyb nebo klávesa ho zavře. Nastavení v General Controls (vypnuto / 1 / 3 / 5 min), při reduced motion se nepouští |
| **Kredity** | 7× klik na hrušku v About This Computer: okno s titulky (písma, GSAP, jak to vzniklo) |

### D. Skryté (Konami kód ↑ ↑ ↓ ↓ ← → ← → B A)
| Vajíčko | Co udělá |
|---|---|
| **Odemčení** | Zvuk a bublina „Something appeared on the desktop." Na ploše naskočí dokument „Do Not Open" |
| **Do Not Open** | Jeho otevření spustí bombu (vtip se zavře Restartem) |
| ~~Before & After, Time Machine~~ | Vynecháno na tvé přání |

---

## Kroky (každý končí checkpointem se zprávou a obrázky)

**Krok 0: texty a seznam k odsouhlasení.** `docs/M5-texty.md`: všechny nové texty (relikvie a jejich hlášky, bomba, vtipy z `fortune`, `ping client`, `neofetch`, 418, `sudo`, kredity, vizitka, bubliny). Nic se nekóduje, dokud je neschválíš nebo nepřepíšeš.

**Krok 1: Klasika Macu.** Koš s relikviemi (nové originální ikony souborů), ikona bomby a bombová hláška s Restartem, Balloon Help (menu „?" a první bublina), Save Contact As… s vCard.

**Krok 2: Terminál a dev humor.** Nové příkazy v Shellu, `help` je zná, ověření ve všech šesti tématech a při restartu stroje (`sudo rm -rf /` → bomba).

**Krok 3: Hravé.** Puzzle, pes, spořič (s nastavením) a kredity. Pear menu dostane položky Puzzle, Dog a Screen Saver.

**Krok 4: Skryté.** Konami kód a „Do Not Open" (propojený s bombou).

**Krok 5: Seznam tipů a QA.** `docs/M5-tipy.md`: co kde najít (to je brána M5 z plánu). Průchod: reduced motion, zvuk (vše syntetizované), klávesnice a čtečka, telefon (pes a spořič se tam nenabízejí), kolize zkratek (Konami nesmí rušit šipky v ikonách a scrapbooku), konzole bez chyb.

---

## Rozhodnutí

1. **Přeskočit M4 a dev humor dát jen do Terminal módu** (do okna na ploše až později). *Výchozí: ano.*
2. **Relikvie v Koši**: tvé dva soubory plus další dva (např. `logo_v3_FINAL_2.ai`, `moodboard_copy.sketch`). Hlášky při otevření ti napíšu ke schválení. *Výchozí: čtyři.*
3. **Bomba se spouští** otevřením „Do Not Open" a příkazem `sudo rm -rf /`. *Výchozí: obojí.*
4. **Menu „?"** s Show Balloons a bublina „Double-click me" u ikony Marian Kadlec. *Výchozí: ano.*
5. **Save Contact As…** stáhne vizitku `.vcf` (stažení spustíš sám tlačítkem Save). *Výchozí: ano.*
6. **Pes** je jen na vyžádání z pear menu. **Spořič** se spouští po 3 minutách nečinnosti a jde vypnout v General Controls. *Výchozí: ano.*
7. **„Before & After"**: porovnává starý web (2008) a dnešní vzhled, takže nepotřebuje žádné cizí materiály. Chceš místo toho opravdové „před a po" z projektů, pošli podklady (zvaž důvěrnost). *Výchozí: starý web proti dnešku.*
8. **Time Machine**: celý (čtyři doby, port z v5) / zmenšená verze (dvě doby: 2008 a dnešek) / vynechat. *Výchozí: celý, ale až jako poslední krok po schválení ostatních.*
9. **Kredity** napíšu věcně (písma, GSAP, „designed and built by Marian Kadlec with AI as a pair programmer"). Text si schválíš v kroku 0. *Výchozí: ano.*

## Co v M5 NENÍ

- Okno Terminal na ploše, `open <název>`, `ls`, `cd`, `cat` (M4, odloženo).
- Dotyk, finální přístupnost, SEO a výkon včetně náhledů obrázků (M6).
