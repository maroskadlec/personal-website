# M4: okno Terminal v Desktopu na sdíleném Shellu

Cíl: Desktop dostane skutečný příkazový řádek v okně a oba světy (Desktop a Terminal) se propojí příkazy. Co dnes existuje: Shell (`js/modes/cli/shell.js`) umí `whoami, skills, ai, stack, career, hire, links, linkedin, github, dribbble, market, theme, rebuild, gui, reboot, shutdown, open os, history, coffee, vibe, clear, pwd, exit, sudo`. Je oddělený od DOM (dostane `print`, `clear`, `ctx`, …), takže ho půjde pustit ve druhém prostředí. Ikona Terminal na ploše dnes přepíná do Terminal módu.

Označení: **[rozhodnutí]** = potřebuju tvůj souhlas, moje výchozí odpověď je první.

---

## Rozhodnutí (odpověz číslem a ano / ne / jinak)

1. **Ikona Terminal na ploše otevře okno** (příkazový řádek na ploše). Do celého Terminal módu se z něj dostaneš zoom boxem, příkazem `site`, přepínačem Desktop | Terminal nebo klávesou `. Dnes dvojklik přepíná rovnou do módu. *Výchozí: okno.* Na telefonu zůstane přepnutí do módu (psát do okna na telefonu je nepraktické).
2. **Zoom box okna Terminal**: okno se zvětší na celou obrazovku a přejde do Terminal módu. *Výchozí: nejdřív jednoduchá verze* (okno se rozjede přes plochu, pak běžný přechod „přepnutí kanálu"); „okno se přímo promění v build intro Terminalu" je pak volitelné vylepšení za příplatek.
3. **Vzhled okna**: tmavé okno s JetBrains Mono uvnitř System 7 rámečku, barvy podle aktuálního tématu Terminalu (`theme amber` změní okno i Terminal mód, nastavení je sdílené). *Výchozí: ano.*
4. **Příkaz `open <název>`** otevírá okna na ploše: `projects`, `generali`, `slevomat`, `jobs`, `atmoskop`, `syca` (i `teamassistant`), `storyous`, `services`, `process`, `whyme`, `links`, `readme`, `about`, `me` (Browser), `terminal`. V Terminal módu přepne na Desktop a okno otevře. Přidám doplňování klávesou Tab. *Výchozí: ano.*
5. **Výpis, co jde otevřít**: příkaz `ls` (položky plochy, `ls projects` ukáže šest projektů s rolí a roky). Nová data nevznikají, jen se vypíše to, co už v manifestu je. `cat` a `cd` přijdou až v M5. *Výchozí: ano, jen `ls`.*
6. **Zvuk**: tiché cvakání kláves v okně (vypne se s mute). *Výchozí: ano.*
7. **Historie příkazů** (šipky ↑ ↓) je společná pro okno i Terminal mód, platí po dobu návštěvy. *Výchozí: ano.*
8. **`exit` v okně okno zavře**; v Terminal módu zůstává dnešní hláška „There is no exit…". *Výchozí: ano.*

---

## Kroky (každý končí krátkým checkpointem)

**Krok 1: Shell jako sdílený modul (Terminal mód vypadá pořád stejně)**
- Shell se přestaví na registr příkazů (název, popis, použití, funkce, kde platí). `help` se z něj generuje, takže se nový příkaz objeví všude.
- Shell dostane o prostředí informaci (`site` = Terminal mód, `window` = okno na ploše) a dvě funkce navíc: otevři položku plochy a zavři sebe.
- Nový společný překladač názvů („atmoskop" → okno projektu) v `js/core/targets.js`, který čte manifest plochy. Používá ho Shell i OS.
- Terminal mód dostane `open <název>`: přepne na Desktop a otevře okno (nový parametr přechodu `open`, využije se stejný mechanismus jako deep link).
- Ověření: všechny dnešní příkazy v Terminal módu fungují beze změny, `open atmoskop` projde z Terminalu na Desktop a otevře projekt.

**Krok 2: Okno Terminal na ploše**
- `js/modes/os/apps/terminal.js`: okno s protokolem výstupu, prompt přímo v něm, šipky ↑ ↓ pro historii, Tab doplňování, Ctrl+L, Ctrl+C, výběr a kopírování textu, uvítací dva řádky.
- Styly výstupu Shellu se vytáhnou ze `cli.css` do společného `css/shell.css`, aby okno a dock vypadaly stejně a drželo se jedno téma.
- Příkazy navíc jen v okně: `site` (přepne do Terminal módu), `exit` (zavře okno). `open` otevírá okna na ploše nad terminálem.
- Ikona Terminal, položka v menu pear a alias v Applications otevřou okno (podle rozhodnutí 1). Váha okna v paměti, deep link `#/os/open/terminal`.
- Ověření: skutečná myš i klávesnice, fokus a Esc, a11y (role `log`, popisky), úzká obrazovka.

**Krok 3: Zoom box → Terminal mód**
- Zoom box okna Terminal nezvětšuje okno na ploše, ale rozjede ho přes obrazovku a přepne do Terminal módu. Tooltip zoom boxu to řekne („Open the Terminal site").
- Při reduced motion jen krátký přechod, na telefonu zoom box není (okno je tam beztak přes celou obrazovku).
- Přechod zpátky na Desktop se nemění (přepínač, klávesa `, příkaz `gui`).
- Případné vylepšení z rozhodnutí 2: okno se při prvním vstupu přímo promění v build intro.

**Krok 4: Parita příkazů, texty a QA**
- Matice příkazů × prostředí (Terminal mód / okno): každý příkaz musí v obou dělat to, co dává smysl, a `help` musí říkat pravdu.
- Aktualizace nápověd: Read Me (jedna věta o okně Terminal a o `open atmoskop`), coach mark, tooltip u ikony.
- Průchod: klávesnice, čtečka (aria-live), reduced motion, telefon, kontrast výstupu ve všech šesti tématech, konzole bez chyb. Zpráva s obrázky a čekání na tvé schválení před M5.

---

## Co v M4 NENÍ

- Vtipné příkazy (`fortune`, `neofetch`, `ping client`, další `coffee`, `cat`, `cd`, `sudo` nadstavby) a velikonoční vajíčka: M5.
- Nový obsah v Terminal módu (případové studie, FAQ, ~/code a další, co jsi zamítl): nepřidávám. `ls` jen vypisuje existující položky.
- Dotyk, finální přístupnost, SEO, výkon a malé náhledy obrázků: M6.

## Rizika

- Změna chování ikony Terminal (rozhodnutí 1) je jediná věc, která mění už schválené. Proto se ptám nejdřív.
- Vstup z klávesnice v okně se nesmí poprat s globálními zkratkami plochy (⌘O, Esc, `): řeší se tím, že v poli se zkratky vypínají, jako už dnes.
- Tab doplňování nesmí uvěznit fokus: doplní jen tehdy, když existuje shoda, jinak Tab funguje normálně.
