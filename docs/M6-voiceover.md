# VoiceOver: co poslouchat (asi 10 minut)

Já čtečku neslyším, takže tohle musíš projít ty. Strukturu (jména, role, pořadí nadpisů, fokus) jsem zkontroloval skriptem, tady jde o to, jak to **zní**. Nejlíp v **Safari na Macu**.

**Příprava.** Zapni VoiceOver: ⌘F5. Zastavit řeč: Ctrl. VO je Ctrl+Option. Další prvek: VO+→. Aktivovat: VO+Mezerník. Rotor (nadpisy, odkazy, orientační body): VO+U. V počítači nejdřív vypni zvuk (tlačítko Sound na bráně), ať se zvuky nepřekrývají s řečí. Adresa: `http://localhost:8899/` (nebo ostrý web).

| # | Krok | Co bys měl slyšet | Zapiš, když |
|---|---|---|---|
| 1 | **Brána.** VO+→ po prvcích | „Power on Marian OS, button", jméno, „Sound: on", „Plain text version, link" | něco chybí nebo se čte dvakrát |
| 2 | Aktivuj **Plain text version** | stránka s nadpisem „Marian Kadlec"; v rotoru nadpisy About, Skills, How AI fits in…, Contact; nahoře odkaz „Open the interactive version" | pořadí nadpisů nedává smysl |
| 3 | Vrať se odkazem a **zapni počítač** (Enter na „Power on") | boot manager: „Startup options", pak odpočet „Booting Marian OS 7.5.5 in 3…"; po stisku šipky „Countdown stopped…" | odpočet se čte pořád dokola |
| 4 | **Desktop.** Po startu se samo otevře okno „Marian Kadlec" (web 2008): čtečka by měla ohlásit okno. **Esc** ho zavře a fokus je na ikoně „Marian Kadlec". Pak VO+→ po ikonách | „Marian Kadlec, Application program", „Projects, Folder", „Trash" (jen jednou, ne „Trash, Trash") | okno se neohlásí, ikona bez jména nebo s divným |
| 5 | Otevři **Read Me** (Enter na ikoně) | „Read Me opened", pak skupina „Read Me" a čitelný text; **Esc** zavře: „Read Me closed" a fokus je zpátky na ikoně | fokus se ztratí |
| 6 | **Menu.** Tab na „Marian menu" a Enter | menu se otevře, čte se první řádek, šipky mezi řádky (About This Computer…, **Contact…**, Control Panels…), Esc zavře; Enter na Contact… otevře stránku Contact v okně „Marian Kadlec" | položky se čtou bez názvu, okno Contact se neohlásí |
| 7 | **Dialog.** Otevři Trash a v něm soubor `flash_intro.swf` | okamžitě se přečte hláška „… can't be opened…" a tlačítko OK; Esc nebo OK ji zavře | hláška se nepřečte sama |
| 8 | **Terminal.** Klávesa `` ` `` (nebo přepínač) | „Switched to Terminal mode"; v rotoru nadpisy **About, Skills, Career, How AI fits in, Links** (ne „cat about.md") | nadpis je příkaz |
| 9 | Odkazy v Terminalu | „LinkedIn profile (opens in a new tab), link" | chybí „opens in a new tab" |
| 10 | **Příkazová řádka.** Tab až na „Terminal command input", napiš `help` a Enter | výpis se přečte sám; napiš `neofetch`: přečtou se údaje, ne kreslená hruška | čte se „lomítko, závorka…" |
| 11 | **Přepínání.** Zkus Terminal → Desktop přepínačem nahoře | po každém přepnutí oznámení „Switched to …" | nic neřekne |

## Co dál zapsat

- Kde čtečka mlčí, kde mluví dvakrát, kde je něco, co se v hlavě nedá poskládat.
- Jestli se v kroku 5 po zavření okna fokus vrátil na správnou ikonu.
- Jestli ti chybí něco, co jsem nezmínil (třeba popis okna, když se otevře).

## Co jsem ověřil já a co ne

- Ověřeno skriptem: 0 ovládacích prvků bez jména, 0 duplicitních `id`, pořadí nadpisů, alt u všech obrázků, role dialogů, `aria-hidden` na ozdobách a na skrytém textu pro vyhledávače, kontrast.
- Neověřeno: jak to zní (VoiceOver, NVDA, TalkBack), režim vysokého kontrastu ve Windows (pravidla jsou napsaná podle specifikace v `css/a11y.css`; v Chrome je vyzkoušíš v DevTools: Rendering → „Emulate CSS media feature forced-colors: active").
