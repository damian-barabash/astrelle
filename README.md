# Astrelle

Strona pracowni ceramiki **Astrelle** (Warszawa, Mała 5a · studio AINO) — kursy, zajęcia
mistrzowskie i coworking ceramiczny. React + Vite, 3 języki (RU / PL / EN, domyślnie RU).

🌐 https://astrelle.pl

## Stack

- **React 18 + Vite**
- **React Three Fiber** (`@react-three/fiber`, `@react-three/drei`, `three`) — kubek 3D w hero
  oraz interaktywna „glina" (lepienie myszką / palcem)
- własny lekki **i18n** (`src/i18n`, RU / PL / EN), wybór języka zapisany w `localStorage`
- deploy: **GitHub Actions → GitHub Pages** (custom domain via `public/CNAME`)

## Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # podgląd produkcyjnego buildu
```

## Obrazy

Oryginalne zdjęcia (JPG) leżą w `media-src/photos/` (poza gitem). Skrypt konwertuje je do
zoptymalizowanego `.webp` w `public/assets/img/` oraz wycina kozy-maskotki z grafik cennika:

```bash
npm run img
```

Wynik: `photo-1..7.webp` (+ `-sm` warianty), `clay-*.webp` i `public/assets/maskot/goat_*.{png,webp}`.

Favikony (gwiazdki z logo → `public/favicon.svg`) i obraz OG (`public/og.png`) generuje:

```bash
node scripts/brand.mjs
```

## Deploy (GitHub Pages)

Po `git push` na `main` workflow `.github/workflows/deploy.yml` sam zbuduje i wdroży stronę.

> ⚠️ Jednorazowo w repo: **Settings → Pages → Source = GitHub Actions**.
> Domena `astrelle.pl` jest trzymana w `public/CNAME` (kopiowana do `dist/`).

## Struktura

```
index.html                  # entry Vite
public/assets/              # 3d/, img/ (webp), logo/, maskot/ (kozy + ms_1)
public/CNAME               # custom domain
src/
  main.jsx, App.jsx        # sekcje strony głównej
  i18n/                    # ru.js / pl.js / en.js + provider
  three/                   # HeroMug.jsx, ClaySculpt.jsx
  styles/global.css        # design system (krem + szałwia)
scripts/img.mjs            # webp + wycinanie kóz
```

Następne kroki (poza tym etapem): podpięcie kalendarza rezerwacji (Calendly/Booksy),
katalog produktów + własny panel admina (Supabase).
