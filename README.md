# Rekomo – webbplats

En enkel, minimalistisk enkelsidig webbplats för Rekomo (NFC-läsare för
Google-recensioner), byggd med endast HTML, CSS och lite vanilla JavaScript –
inga byggverktyg krävs.

## Struktur

```
index.html      Sidans innehåll (hero, så funkar det, produkten, kontakt)
css/style.css   All styling (svart/vit, minimalistiskt tema, scroll-animationer)
js/script.js    Mobilmeny, footer-årtal och reveal-on-scroll-animationer
```

## Kör lokalt

Öppna bara `index.html` i webbläsaren, eller starta en enkel lokal server:

```bash
python3 -m http.server 8000
```

och besök `http://localhost:8000`.

## Att anpassa

- **Kontaktuppgifter**: Telefonnummer (`+46 70 000 00 00`) och adress
  (`Stockholm, Sverige`) i `index.html` är platshållare – byt ut till era
  riktiga uppgifter.
- **Text**: All text ligger direkt i `index.html` och är enkel att redigera.
- **Färger**: Allt styrs av variablerna under `:root` i `css/style.css`
  (`--bg`, `--text`, `--bg-dark` osv.) om ni vill justera nyanserna.

## Publicera

Sidan är helt statisk och kan publiceras direkt via t.ex. GitHub Pages,
Netlify eller Vercel utan extra konfiguration.
