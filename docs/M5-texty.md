# M5: všechny nové texty vajíček

Žádný z těchto textů není ze starého webu. Všechny jsou v jednom souboru `js/content/eggs.js` (kroky 2 a 3 přibudou tam), takže stačí napsat „přepiš řádek X na Y" a změní se na jednom místě. Co už je v prohlížeči (krok 1), si můžeš prohlédnout hned, zbytek je zatím jen tady ke schválení.

Tón: suchý, sebeironický, krátký. Bez značek a bez posměšků nad kolegy. Vtipy jsou o klientech, verzích a nástrojích, ne o lidech.

---

## Krok 1: Klasika Macu (už v prohlížeči)

### Koš: čtyři relikvie
Po otevření souboru z Koše vyskočí hláška (ikona stop) a pod ní jedna věta.

| Soubor | Hláška | Doplňující věta | Komentář v Get Info |
|---|---|---|---|
| `client_feedback_FINAL_v47_opravdu_final.psd` | „client_feedback_FINAL_v47_opravdu_final.psd" can't be opened. | Version 48 is already on its way. | Round 47 of the feedback. |
| `flash_intro.swf` | „flash_intro.swf" can't be opened. | Flash was retired in 2020. The „Skip intro" button lives on in spirit. | Skip intro. |
| `logo_v3_FINAL_2.ai` | „logo_v3_FINAL_2.ai" can't be opened. | The client has since gone back to version 1. | Version 3, final, second try. |
| `banner_468x60_FINAL.gif` | „banner_468x60_FINAL.gif" can't be opened. | Congratulations! You are the 1,000,000th visitor to try. | 468 × 60 pixels of 2008. |

Dva poslední soubory jsou moje doplnění k tvým dvěma. Chceš jiné, napiš název a hlášku.

### Bomba
„Sorry, a system error occurred." a pod tím jedna věta v uvozovkách, podle toho, co ji spustilo:

- obecná: „Out of coffee."
- „Do Not Open": „Curiosity killed the desktop."
- `sudo rm -rf /`: „Everything, as requested."

Jediné tlačítko je **Restart**.

### Balloon Help
- Menu „?" u hodin: „About Balloon Help…", „Show Balloons" / „Hide Balloons".
- „About Balloon Help": **Balloon Help** / Switch it on, point at something, and a few words say what it does.
- ~~První bublina u ikony Marian Kadlec: Double-click me.~~ Odpadla 2026-10-16: okno „Marian Kadlec" se po startu otevře samo.
- Ikony říkají svůj komentář z Get Info (např. u Services její úvodní věta ze starého webu), projekty „role · roky".
- Okno: close box „Click here to close this window." · zoom box „Click here to make this window bigger or smaller." · grow box „Drag here to change the size of this window." · titulek „Drag to move this window. Double-click to roll it up." · posuvník „The scroll bar: click an arrow or drag the box to see more."
- Plocha: „The desktop. Drag things around, or throw them in the Trash."
- Hodiny: „The time. General Controls changes how it is shown."
- Menu: **pear** „The Marian menu: about this computer, the control panels, a puzzle, the Terminal." · **File** „File: open, rename or throw away the selected icon, and save the contact." · **Edit** „Edit: cut, copy and paste. There is not much to cut here." · **View** „View: show a folder window as icons or as a list." · **Label** „Label: give the selected icons a colour." · **Special** „Special: empty the Trash, restart, shut down." · **?** „Balloon Help: you are using it."

### Save Contact As… (File menu)
Okno: „Save this contact as:" a název `Marian Kadlec.vcf`, tlačítka Cancel a Save. Stáhne se vizitka: jméno, Senior Product Designer, e-mail, Prague, váš web, LinkedIn, GitHub a Dribbble, poznámka s titulkem „Senior digital designer for ambitious brands and digital products."

---

## Krok 2: Terminál a dev humor (už v prohlížeči, v Terminal módu)

**`fortune`**: vypíše jednu náhodnou větu:
1. The best design system is the one the engineers actually use.
2. There is no such thing as a small change in a design system.
3. „Can you make the logo bigger?" is not a bug. It is a feature of the species.
4. Ship it. Then redesign it.
5. Every redesign is a first draft of the next one.
6. Nothing is as permanent as the placeholder text.
7. If it only works in the mockup, it is a mockup.
8. Good design is invisible. Great design is invisible and passes the accessibility audit.
9. Tokens are just names for decisions you already made.
10. The AI wrote the first draft. The pull request review wrote the second.
11. Dark mode is a feature until someone asks for light mode.
12. Lorem ipsum dolor sit amet, and then somebody forgot to replace it.
13. Version 48 is already on its way.
14. Done is better than perfect. Merged is better than done.

**`ping client`**:
```
PING client (10.0.0.1): 56 data bytes
64 bytes from client: icmp_seq=0 ttl=64 time=0.4 ms   "looks great, one small thing"
64 bytes from client: icmp_seq=1 ttl=64 time=0.4 ms   "can the logo be bigger?"
64 bytes from client: icmp_seq=2 ttl=64 time=0.5 ms   "quick call, five minutes?"
--- client ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, one more small change pending
```
(`ping` samotné: „usage: ping client". Jiný cíl: „ping: unknown host … (try: ping client)".)

**`neofetch`**: malá hruška z písmen a řádky: `OS Marian OS 7.5.5-vibe`, `Host one very patient CRT`, `Shell marian-sh`, `Uptime 15+ years`, `Theme` (podle aktuálního), `Resolution` (podle okna), `Fonts Jersey 10, Atkinson Hyperlegible Next, JetBrains Mono`, `Memory 5,400K / 16,384K`, `Coffee 418 (teapot)`.

**`coffee`**: „☕ brewing… error: designer already over-caffeinated." a pod tím „HTTP 418: I'm a teapot. Short and stout."

**`sudo`**:
- `sudo make me a sandwich` → „Okay."
- `rm -rf /` bez sudo → „rm: cannot remove '/': Operation not permitted" a šedě „this is a portfolio, not a sandbox (try sudo, if you dare)".
- `sudo rm -rf /` → řádky „[sudo] password for marian: ********", „removing /usr…", „removing /home…", „removing /portfolio…" a pak **bomba** („Everything, as requested.").
- jiné `sudo` zůstává: „Nice try. Permission denied (designers only)."

**`git log`** je alias na `career`, ostatní `git …`: „only `git log` is installed here".

**Příkazy propojující s Desktopem** (kvůli rozhodnutí 1, M4 nebude): `open <název>` v Terminal módu přepne na Desktop a otevře okno (`open atmoskop`, `open services`, …), `ls` vypíše, co jde otevřít, `cd` a `cat` jen v lehké podobě (jen metadata a už existující texty, žádné nové případové studie).

---

## Krok 3: Hravé (už v prohlížeči)

Všechny texty jsou v `js/content/eggs.js` (`puzzle`, `credits`).

- **Puzzle** (pear menu → Puzzle): okno „Puzzle", deska 4×4 s tvým dithrovaným portrétem. Otevře se složené, aby byl vidět obrázek. Tlačítko „Shuffle", stav „Shuffle to start." → „0 moves" → „1 move" → „2 moves"… a po složení „Solved in N moves." (hlásí to i čtečka). Dílek vedle mezery se posune klikem nebo klepnutím, šipky ↑ ↓ ← → posunou dílek v daném směru do mezery.
- **Dog** (pear menu → Dog, se zaškrtnutím): velký švýcarský salašnický pes (originální pixelart 16 × 16, zobrazený 2× s tenkou černou linkou a bílým okrajem): černý kabát s leskem, bílá lysina na obličeji, rezavé „obočí" nad jantarovýma očima, rezavá ramena a nohy, bílá hruď, bílé „ponožky" a ocas s bílou špičkou. Běží za kurzorem, zastaví se kousek od něj, vrtí ocasem a vyplazuje jazyk, čas od času se škrábe za uchem a po zhruba deseti sekundách klidu usne („z"). Když kurzor odejde daleko, nastraží uši a nad hlavou se mu objeví jantarový vykřičník. Nikdy nechytá kliky a chodí pod rozbalenými menu. Nastavení se pamatuje. Na dotyku a při reduced motion se nenabízí vůbec. Původně tu byla kočka Neko, pak hnědé štěně; švýcarský salašnický pes je podle tvého přání.
- **Spořič** (pear menu → Screen Saver spustí hned, jinak sám po nečinnosti): na černé obrazovce letí šikmo vzhůru bílé kurzory s šedými listovými křídly, mávají (velké a malé = blízko a daleko). Zavře ho jakýkoli pohyb myší (aspoň 8 px), klik, klávesa nebo kolečko, a to, čím se zavřel, se nikam dál nepošle. V General Controls je skupina „Screen saver": Never · After 1 minute · After 3 minutes (výchozí) · After 5 minutes. Na dotyku a při reduced motion se nespouští.
- **Kredity** (sedm rychlých kliků na hrušku v About This Computer): okno „Credits", které pomalu rolují (zastaví se pod kurzorem nebo na fokusu; při reduced motion je to obyčejná posuvná stránka). Text:
  - **Marian OS 7.5.5-vibe**
  - Designed and built by Marian Kadlec, with AI as a pair programmer.
  - TYPE Jersey 10, Atkinson Hyperlegible Next and JetBrains Mono.
  - MOTION GSAP.
  - SOUND Synthesised in the browser. No samples.
  - PIXELS Icons drawn in code, pictures dithered on the fly.
  - THANKS To every client who ever said „one small change".

Drobná změna oproti schválenému textu: bublina k hrušce teď říká „The Marian menu: about this computer, the control panels, a puzzle, the Terminal." (přibyl puzzle) a komentář ikony General Controls je „Clock, window dragging, menu blinking and the screen saver."

---

## Krok 4: Skryté (už v prohlížeči)

Texty jsou v `js/content/eggs.js` (`secret`, `bomb.detail.doNotOpen`).

- **Konami kód** na klávesnici v Desktop módu: ↑ ↑ ↓ ↓ ← → ← → B A (velká i malá písmena, do 4 sekund mezi klávesami). Odemkne dokument **Do Not Open** (ikona dokumentu ovinutého černožlutou páskou), dole vpravo nad Košem. Zazní krátká „tajná" melodie, ikona naskočí, třikrát zabliká a bublina říká „Something appeared on the desktop." (čtečka to přečte jednou). Ikonu pak ukáže znovu, kdykoli kód zopakuješ: „It is already on the desktop." (nový řádek, který jsi ještě neviděl). Když ji dokument hodíš do Koše, kód ji vrátí na plochu.
- Dokument má v Get Info komentář „I mean it." (stejný text ukáže Balloon Help a `cat` v Terminalu).
- **Otevření Do Not Open** spustí bombu: „Sorry, a system error occurred." a „Curiosity killed the desktop." Restart vrátí stroj do boot menu a dokument zůstane na ploše.
- Odemknutí se pamatuje i po zavření okna prohlížeče (stejně jako pozice ikon). **Special → Reset Desktop** ho zase schová.
- Z Terminal módu: po odemčení `ls` dokument vypíše, `cat do not open` ukáže „I mean it." a `open do not open` přepne na Desktop a spustí bombu.
- Kód se píše jen na ploše: v Terminal módu a v textových polích (přejmenování ikony, Save box, příkazový řádek) se nepočítá. Nikdy neruší klávesy: šipky dál chodí po ikonách, listují Scrapbookem a posouvají dílky puzzle.
- „Before & After" a Time Machine jsou podle tvého rozhodnutí vynechané.

---

## Doplněk ke kroku 2: příkazy, které propojují s Desktopem (už v prohlížeči)

- `help` má dva nové řádky: „open <name>  open something on the Desktop (try: open projects)" a „ls cd cat  look around the Desktop like a file system" a pod výpisem tichou větu „more commands hide here. try the ones you know from a real terminal."
- `ls` vypíše položky plochy (složky s lomítkem). `ls projects` ukáže šest projektů: název, role, roky. Pod výpisem: „open <name> shows it on the Desktop."
- `cd <složka>`, `cd ..`, `cd ~`: mění prompt (`marian@kadlec ~/Projects $`). `pwd` vypíše `~/portfolio` nebo `~/portfolio/Projects`.
- `cat about.md` vypíše pět odstavců „O mně" (stejné jako na stránce). `cat skills|career|links|hire` zavolá odpovídající příkaz. `cat <položka>` ukáže jméno, roli a roky (nebo komentář z Get Info, např. u relikvie „Skip intro.") a větu „open <name> shows it on the Desktop." Žádné nové případové studie.
- `open <název>`: „opening Atmoskop on the Desktop…", pak přepne na Desktop a okno otevře. Když se název shoduje s víc věcmi: „which one? Projects, Process". Když ne: „cannot open: zzz — try ls".
- Tab doplňuje příkazy i jejich argumenty (jména položek, témata), šipky ↑ ↓ listují historií.

---

## Soubor Commands na ploše (navíc, na tvé přání)

Ikona **Commands** (dokument s malou obrazovkou) je ve druhém sloupci pod Links. Okno „Terminal commands" vypisuje všechno, čemu Terminal rozumí, ve čtyřech skupinách (About me · Look around the Desktop · The machine · For fun), pod tím řádek o klávesách (Tab, šipky, Esc) a věta „One more command is not listed here, on purpose. Do not try it." Tajný příkaz (ten, co spouští bombu) tam schválně není. Text je v `js/content/commands.js`, takže nový příkaz stačí připsat tam. `help` v Terminalu teď na konci říká „every command is listed in the Commands file on the Desktop: open commands" a Read Me má o souboru zmínku.
