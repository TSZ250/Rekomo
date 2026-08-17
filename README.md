# Rekomo – webbplats

En enkel, snygg och responsiv enkelsidig webbplats för Rekomo, byggd med endast
HTML, CSS och lite vanilla JavaScript – inga byggverktyg krävs.

## Struktur

```
index.html      Sidans innehåll (hero, om oss, vad vi gör, kontakt)
css/style.css   All styling (ljust, modernt & minimalistiskt tema)
js/script.js    Mobilmeny, footer-årtal och kontaktformulär (öppnar e-postklient)
```

## Kör lokalt

Öppna bara `index.html` i webbläsaren, eller starta en enkel lokal server:

```bash
python3 -m http.server 8000
```

och besök `http://localhost:8000`.

## Att anpassa

- **Kontaktuppgifter**: Telefonnummer och adress i `index.html` (sök efter
  `placeholder-note`) är platshållare – byt ut till era riktiga uppgifter.
- **Text**: All text ligger direkt i `index.html` och är enkel att redigera.
- **Färger**: Ändra accentfärgen i `css/style.css` under `:root` (variabeln
  `--accent`).

## Publicera

Sidan är helt statisk och kan publiceras direkt via t.ex. GitHub Pages,
Netlify eller Vercel utan extra konfiguration.
