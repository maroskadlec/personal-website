# M5: co kde najít

Tohle je seznam všech vajíček v jednom místě: jak ho najde návštěvník, co se stane a kde to funguje. Slouží jako brána M5: když ho projdeš a odsouhlasíš, jdeme na M6 (dotyk, přístupnost, SEO, výkon).

Všechny texty vajíček jsou v `js/content/eggs.js` (a `commands.js`), takže stačí napsat „přepiš řádek X na Y". Seznam všech řádků najdeš v `docs/M5-texty.md`.

---

## Pětiminutový průchod

1. Počkej, až naskočí plocha: po chvíli se samo otevře okno „Marian Kadlec" (web 2008) a u přepínače Desktop | Terminal vyskočí tip „Prefer a terminal?". Kontakt: menu hrušky → **Contact…**.
2. **Koš**: dvojklik, v okně jsou čtyři soubory. Otevři každý.
3. Menu **„?"** u hodin → **Show Balloons**. Najeď na ikonu, menu, hodiny, okno. Pak Hide Balloons.
4. **File → Save Contact As…** → Save. Stáhne se vizitka.
5. Menu **hrušky** → **Puzzle** → Shuffle. Pak **Dog** (zaškrtni, pohni myší, nech ho spát) a **Screen Saver**.
6. Hruška → **About This Computer** → sedmkrát rychle klikni na hrušku: kredity.
7. Na ploše napiš **↑ ↑ ↓ ↓ ← → ← → B A**. Objeví se „Do Not Open". Otevři ho: bomba. Restart.
8. Přepni na **Terminal** (klávesa `` ` ``) a napiš: `fortune`, `ping client`, `neofetch`, `coffee`, `sudo make me a sandwich`, `git log`, `ls`, `cat do not open`, `open puzzle`.
9. Nakonec **`sudo rm -rf /`**: druhá cesta k bombě.

---

## Klasika Macu

| Vajíčko | Jak ho najdeš | Co se stane |
|---|---|---|
| **Koš s relikviemi** | Dvojklik na Koš (ikona je od začátku plná). Soubory jdou otevřít, vyndat zpět nebo vysypat | Čtyři soubory, každý po otevření řekne větu. `client_feedback_FINAL_v47_opravdu_final.psd`: „Version 48 is already on its way." · `flash_intro.swf`: „Flash was retired in 2020. The “Skip intro” button lives on in spirit." · `logo_v3_FINAL_2.ai`: „The client has since gone back to version 1." · `banner_468x60_FINAL.gif`: „Congratulations! You are the 1,000,000th visitor to try." |
| **Bomba** | Dvě cesty: dokument **Do Not Open** (po Konami kódu) a **`sudo rm -rf /`** v Terminalu | „Sorry, a system error occurred." + věta v uvozovkách: u Do Not Open „Curiosity killed the desktop.", u `sudo rm -rf /` „Everything, as requested." Jediné tlačítko je **Restart**, vrátí stroj do boot menu. Třetí věta „Out of coffee." zatím nikde nespouští nic, zůstává jako záloha |
| **Balloon Help** | Menu **„?"** vpravo u hodin (na telefonu není, tam není co najet) | Show Balloons: když chvíli necháš kurzor na ikoně, menu, hodinách nebo části okna, vyskočí bublina, co to je. U ikon je to komentář z Get Info. Jednorázová bublina u přepínače („Prefer a terminal?") se ukáže sama jednou |
| **Kontakt jako „Save As…"** | **File → Save Contact As…** | Klasické okno Save s názvem `Marian Kadlec.vcf`. Po Save se stáhne vizitka: jméno, Senior Product Designer, e-mail, Prague, web, LinkedIn, GitHub, Dribbble a poznámka |

Starší vajíčka z M2, která už fungují: About This Computer ukazuje paměť a okna ji ujídají (když dojde, ozve se „not enough memory"), Brightness v Monitors, „Marian Kadlec" nejde vyhodit do Koše („in use").

## Terminál a dev humor (jen v Terminal módu)

Do okna na ploše se příkazy nedostanou (M4 se přeskočil). Seznam všech příkazů je i na ploše v souboru **Commands**, kromě jednoho schválně neuvedeného.

| Příkaz | Co udělá |
|---|---|
| `fortune` | Jedna z 14 vět, pokaždé jiná |
| `ping client` | Tři odpovědi („looks great, one small thing" · „can the logo be bigger?" · „quick call, five minutes?") a statistika. Odpovědi chodí po půl vteřině, při reduced motion naráz |
| `neofetch` | Informace o stroji („Marian OS 7.5.5-vibe", „one very patient CRT", „Coffee 418 (teapot)"). Na široké obrazovce s malou hruškou z písmen vedle, na úzké pod sebou |
| `coffee` | „brewing… error: designer already over-caffeinated." a „HTTP 418: I'm a teapot. Short and stout." |
| `sudo make me a sandwich` | „Okay." |
| `sudo <cokoli jiného>` | „Nice try. Permission denied (designers only)." |
| `rm -rf /` | Odmítnutí a nápověda „try sudo, if you dare" |
| **`sudo rm -rf /`** | Pár řádků „removing /usr…" a pak **bomba** („Everything, as requested.") |
| `git log` | Totéž co `career` (git log redesignů). Ostatní `git …` řekne, že je nainstalovaný jen `git log` |
| `ls` `cd` `cat` `pwd` | Plocha jako souborový systém. `ls projects` vypíše šest projektů s rolí a roky, `cat about.md` příběh, `cat <položka>` pár slov o ní |
| `open <název>` | Přepne na Desktop a otevře okno: `open atmoskop`, `open services`, `open puzzle`, `open why me` |
| Tab, ↑ ↓ | Tab doplňuje příkazy a názvy, šipky listují historií |

## Hravé

| Vajíčko | Jak ho najdeš | Co se stane |
|---|---|---|
| **Puzzle** | Menu hrušky → Puzzle (nebo `open puzzle` v Terminalu) | Posouvací hlavolam 4×4 s tvým dithrovaným portrétem. Otevře se složený, Shuffle ho rozmíchá. Dílek vedle mezery posuneš klikem, klepnutím nebo šipkami. Po složení „Solved in N moves." |
| **Dog** | Menu hrušky → Dog (zaškrtávací položka) | Velký švýcarský salašnický pes (černý, s bílou lysinou, rezavým obočím a bílými „ponožkami") běží za kurzorem, zastaví se, vrtí ocasem, čas od času se škrábe za uchem a po deseti sekundách klidu usne. Když kurzor odejde daleko, nastraží uši a běží dál. Při pádu systému zamrzne, pod rozbaleným menu chodí. Volba se pamatuje |
| **Spořič s létajícími kurzory** | Menu hrušky → Screen Saver (hned), nebo sám po nečinnosti | Na černé obrazovce letí bílé kurzory se šedými křídly. Zavře ho pohyb myši, klik, klávesa nebo kolečko. Nastavení: Control Panels → General Controls → Screen saver (Never, 1, 3 výchozí, 5 minut) |
| **Kredity** | About This Computer → sedmkrát rychle klikni na hrušku (každý klik do 1,3 s po předchozím) | Okno „Credits": „Designed and built by Marian Kadlec, with AI as a pair programmer." + Type, Motion, Sound, Pixels, Thanks. Pomalu rolují, zastaví se pod kurzorem |

## Skryté

| Vajíčko | Jak ho najdeš | Co se stane |
|---|---|---|
| **Konami kód** | Na ploše na klávesnici: **↑ ↑ ↓ ↓ ← → ← → B A** (do 4 sekund mezi klávesami). **Bez klávesnice: pětkrát rychle klepnout (nebo kliknout) na hodiny** (do 2,5 s) | Krátká melodie, dole vpravo nad Košem naskočí dokument **Do Not Open** (ikona ovinutá výstražnou páskou) a bublina „Something appeared on the desktop." Když kód zopakuješ: „It is already on the desktop." |
| **Do Not Open** | Dvojklik (nebo Enter) na ten dokument. V Terminalu `ls`, `cat do not open` („I mean it."), `open do not open` | Bomba s „Curiosity killed the desktop." Dokument zůstane i po Restartu |

„Before & After" a Time Machine jsou podle tvého rozhodnutí vynechané.

---

## Kde to funguje

| | Desktop s myší | Terminal | Telefon (dotyk) | Reduced motion |
|---|---|---|---|---|
| Koš s relikviemi | ano | `cat`, `open` | ano | ano |
| Bomba | ano | ano (`sudo rm -rf /`) | ano | bez bliknutí |
| Balloon Help | ano | ne | nenabízí se | ano |
| Save Contact | ano | ne | ano | ano |
| Terminal humor | ne | ano | ano | řádky naráz |
| Puzzle | ano | `open puzzle` | ano (klepnutí) | bez klouzání |
| Dog | ano | ne | nenabízí se | nenabízí se |
| Spořič | ano | ne | nenabízí se | nenabízí se |
| Kredity | ano | ne | ano (7 klepnutí) | stránka bez rolování |
| Konami kód | ano (klávesnice) · pětkrát na hodiny | ne | pětkrát klepnout na hodiny | bez animace |
| Do Not Open | ano | `ls`, `cat`, `open` (až po odemčení) | ano (až po odemčení) | ano |

## Co se pamatuje

- **Trvale** (localStorage, pamatuje si ho prohlížeč): nastavení (Balloons, Dog, minuty spořiče, hodiny a další), pozice ikon, složky, odemčený „Do Not Open".
- **Jen do zavření karty**: přejmenování, přesuny a Koš vestavěných ikon, takže po novém otevření je portfolio vždy kompletní.
- **Special → Reset Desktop** zapomene všechno, i odemčený soubor.

## Stopy pro návštěvníky (krok 4 z M6, hotové; znění věty čeká na tvůj souhlas)

Podle tvé odpovědi 3 jsou stopy na dvou místech:

1. **Hláška v konzoli** (pro vývojáře, při startu): „Looking for something?  ↑ ↑ ↓ ↓ ← → ← → B A   (on a phone: tap the clock five times)". Nic jiného se na webu nezmění.
2. **Věta v About This Computer** (pod řádkem „Made by Marian Kadlec…", oddělená tečkovanou čarou): „One more file lives on this computer, out of sight. The old arcade code finds it. So does tapping the clock five times." Texty jsou v `js/content/eggs.js` (`hints`).

---

## Co jsem při kontrole opravil (krok 5)

- Pod reduced motion se bomba po `sudo rm -rf /` hned zavřela, protože ji odklepl tentýž Enter, který příkaz spustil. Bomba teď prvních 0,4 s žádnou klávesu ani klik nebere.
- Dlouhé názvy souborů v hláškách (relikvie) přetékaly přes okraj na telefonu o šířce 320 px. Teď se zalamují.
- Zvířátko (tehdy ještě kočka) při pádu systému běhalo dál, i když je stroj zamrzlý. Teď zamrzne s ním.
- Spořič se nepřizpůsobil změně velikosti okna. Teď ano.
- Třesení dialogu po kliknutí mimo něj a časované řádky `ping` a `sudo` ignorovaly reduced motion. Teď ho respektují.

## Co jsem prošel

Skutečnou myší a klávesnicí: Koš (i jen klávesnicí, včetně Enter na relikvii a návratu fokusu), Balloon Help (zapnout, najet, vypnout), Save Contact (včetně obsahu vizitky), pear menu klávesnicí, Puzzle klávesnicí (Tab, Shuffle, šipky), Konami psaný skutečnými klávesami, bomba, Restart a boot menu. V Terminalu psaním všechny příkazy. Dále: reduced motion, telefon 375 × 812 a 320 × 568, kolize kláves (Konami nebrání šipkám v ikonách, Scrapbooku ani Puzzle), přepnutí módu uprostřed (pes, spořič a kód se vypnou a po návratu zase zapnou), zvuk (při ztlumení se nevytvoří žádný zvuk, žádné zvukové soubory neexistují), síť (všechny požadavky 200, žádné 404) a konzole (bez chyb).

## Co jsem neověřil

- **Zvuk neslyším.** Syntéza proběhne bez chyby, ale poslech je na tobě (klik, melodie odemčení, bomba).
- **Safari a Firefox.** Testoval jsem v Chromiu.
- **Skutečná čtečka obrazovky** (VoiceOver). Zkontroloval jsem role, názvy a hlášení, ale ne poslechem.

## Co si vezme M6

(Vyřešeno v M6: Konami na telefonu = pětkrát na hodiny, ovládací panely se posouvají, „Trash, Trash" opraveno, miniatury, výkon, SEO a přístupnost.)
