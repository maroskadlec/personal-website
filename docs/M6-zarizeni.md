# Co vyzkoušet na zařízeních

Tohle já nezkusím: skutečný prst, klávesnice na displeji, Safari, Firefox, čtečka obrazovky. Všechno ostatní (velikosti 320 až 2560 px, módy, témata, klávesnice, kontrast, síť, konzole) jsem prošel v Chromiu a výsledky jsou v `M6-kroky.md`.

## Jak se na to dostat z telefonu

Mac a telefon na stejné Wi‑Fi. Server `portfolio`, který pouští aplikace, je z místní sítě nedosažitelný, takže si v Terminalu v **kořeni repozitáře** spusť vlastní (jiný port, ať se nepere s ním):

```bash
python3 -m http.server 8900
```

IP Macu:

```bash
ipconfig getifaddr en0
```

Na telefonu otevři `http://<ta IP>:8900/`. (Přes `http` na místní síti funguje vše kromě toho, že instalace na plochu a některé funkce prohlížeče chtějí `https`: až bude web venku, zkus to znovu.)

## iPhone, Safari (10 minut)

1. **Brána a zvuk.** Klepnout na hrušku zapne počítač. Tlačítko „Sound" zapne a vypne zvuk, odkaz „Plain text version" otevře text. Cíle se dají trefit palcem?
2. **Boot manager.** Dá se klepnout na položku?
3. **Desktop.** Menu bar je 34 px. Klepni na File, pak na Edit (má se přepnout, ne zavřít). Řádky menu mají 40 px. Po startu se samo otevře okno „Marian Kadlec" (na telefonu přes celé sklo) a po chvíli vyskočí bublina u přepínače Desktop | Terminal. Menu hrušky → **Contact…** otevře stránku Contact s tlačítkem „E-mail me". Ikony se otevřou **dvojklepnutím**. Okno se zavírá čtverečkem vlevo nahoře; pod ním je plocha s ikonami.
4. **Posouvání a tažení.** Obsah okna se posouvá prstem a stránka pod ním se **nehýbe** a netáhne se dolů (žádné obnovení stránky). Dlouhé podržení ikony **nevyvolá** menu iOS. Dvojklepnutí na prázdné místo nezoomuje.
5. **Skrytá věc.** Pětkrát rychle klepnout na hodiny v menu baru: objeví se „Do Not Open" a bublina.
6. **Terminal.** Přepni (dole „Desktop | Terminal"). Klepni na řádek dole: **klávesnice nesmí zakrýt dock** (píšeš `help` a vidíš, co píšeš). Výpis je nad ním. Po zavření klávesnice se dock vrátí dolů. Odkazy ven se otevřou v nové záložce.
7. **Na šířku.** Nic nesmí být pod výřezem, ikony musí být všechny vidět (na nízkém displeji se skládají do mřížky).
8. **Přidat na plochu.** Sdílet → Přidat na plochu: ikona je hruška, jméno „Marian OS", spustí se bez lišt Safari, stavový řádek je černý.
9. **Čtečka.** Trojí stisknutí bočního tlačítka zapne VoiceOver; stačí zkusit bránu, jedno okno a Terminal (viz `M6-voiceover.md`).

## iPad

Tažení okna za titulek, změna velikosti rohem (je větší než myší), tažení ikony do složky a do Koše, posouvání dvěma prsty. Menu bar je 34 px a přepínač Desktop | Terminal je v něm. Zkus i Split View (úzké okno = telefonní rozložení).

## Android, Chrome

Totéž co iPhone. Navíc: klávesnice v Terminalu (kontroluje se, jestli dock zůstane nad ní), tlačítko Zpět (mění mód Desktop a Terminal, protože mód je v adrese), menu → „Instalovat aplikaci" (má se otevřít přes celou obrazovku s ikonou hrušky).

## Safari a Firefox na počítači

Na tomhle záleží nejvíc u vzhledu:

- **Písma a ostrost.** Nadpisy v Jersey 10 jsou ostré? Ikony a ditherovaný portrét jsou „pixelové" (ne rozmazané)? Pixelová šipka myši se zobrazuje?
- **Sklo.** Scanlines a vinětace jsou jemné, dock v Terminalu nepropouští text zpod sebe.
- **Zvuk.** Po prvním kliknutí hraje relé, syntézy a melodie odemčení. Tlačítko zvuku funguje.
- **Klávesy.** `` ` `` přepíná módy, Tab ukazuje kroužek fokusu, šipky chodí po ikonách (mapa v `M6-klavesy.md`).
- **Animace.** Zapnutí CRT, přepnutí módu, „postavení" Terminalu.
- **Firefox:** posuvníky v Terminalu jsou tenké, Browser (web 2008) se posouvá, tažení oken je plynulé.

## Vysoký kontrast a omezení pohybu

- **Vysoký kontrast** (napsáno podle specifikace, nezkoušeno ve skutečnosti): v Chromu DevTools → Rendering → „Emulate CSS media feature forced-colors: active" a „prefers-contrast: more". Hledej: je vidět výběr ikony, otevřené menu, aktivní okno, zaškrtnutí, posuvník a fokus? V Terminalu kurzor a dock.
- **Omezit pohyb:** macOS → Nastavení → Zpřístupnění → Zobrazení → Omezit pohyb, a obnovit stránku. Brána, zapnutí a přepnutí módu se mají obejít bez animací; pes a spořič se nenabízejí.

## Pomalá síť

Chrome DevTools → Network → „Slow 4G" nebo „3G", obnovit s vypnutou cache. Textová stránka se ukáže hned, stroj naběhne, nic nevisí ve tmě. Terminal se stahuje až při prvním přepnutí (a po startu potichu na rychlé síti, ne při úspoře dat).

## Co poslat, když něco nesedí

Zařízení a verze systému a prohlížeče, adresa (včetně `?...`), co se mělo stát a co se stalo, a snímek obrazovky. Stačí jedna věta na bod.
