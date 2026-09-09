# Astrelle

Strona pracowni ceramiki **Astrelle** (Warszawa, ul. Mała 5a · studio AINO) — warsztaty,
kurs i coworking ceramiczny, z kalendarzem zapisów i panelem administracyjnym.
React + Vite, 3 języki (PL / RU / EN — domyślnie język urządzenia).

🌐 https://astrelle.pl · panel: https://astrelle.pl/admin

## Strony

| Ścieżka | Co |
| --- | --- |
| `/` | hero z kubkiem 3D, formaty 01/02/03, jak to działa, mistrzyni + studio, galeria, cennik, ciekawostki, CTA |
| `/kalendarz` | kalendarz zapisów (miesiąc + lista), modal zgłoszenia, lista rezerwowa, formularze „nie wiesz co wybrać” i voucher |
| `/sklep` | „otwarcie w październiku” + lista oczekujących |
| `/polityka-prywatnosci` `/cookies` `/regulamin` | dokumenty (edytowalne w panelu) |
| `/admin` | panel: Segodnia · Kalendarz · CRM · Edytor wizualny · Galeria · Analityka · Logi · Ustawienia |

## Stack

- **React 18 + Vite**, `react-router-dom` (BrowserRouter, fallback `404.html` na GH Pages)
- **React Three Fiber** — kubek 3D w hero (`public/assets/3d/rabbit_mug.glb`)
- fonty **Geologica** (nagłówki) + **Onest** (tekst) z Google Fonts
- własny **i18n** (`src/i18n`) — słowniki w bundlu jako fallback, treść edytowalna w bazie (`content`)
- **Supabase** (`wynmqmwvjwdwjwlixwvc`): Postgres + RLS, Storage `studio-media`, Edge Functions
  (`supabase/functions/*`, wspólne helpery w `_shared/common.ts`), migracje w `supabase/migrations/`
- zgoda na cookies: tylko ustawienia lokalne + anonimowe statystyki po zgodzie (`src/lib/consent.js`)
- deploy frontu: **GitHub Actions → GitHub Pages** (custom domain via `public/CNAME`)

## Edytor wizualny

Komponenty `T` / `Img` / `List` / `Section` z `src/content/edit.jsx` renderują zwykły HTML na stronie,
a w panelu (`/admin/edytor`) stają się edytowalne (klik → tekst, listy z ↑↓✕, sekcje ukryj/przesuń).
Zapis → `content.doc` (per język) i `site_settings.layout`.

## Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # podgląd produkcyjnego buildu
```

## Backend (Supabase)

```bash
# deploy funkcji (wymaga SUPABASE_ACCESS_TOKEN w env)
npx supabase functions deploy <nazwa> --project-ref wynmqmwvjwdwjwlixwvc --no-verify-jwt
```

Funkcje publiczne: `book`, `lead`, `analytics-track`, `calendar-feed`. Admin (token sesji w body):
`admin-auth`, `admin-content`, `admin-calendar`, `admin-crm`, `admin-gallery`, `admin-analytics`,
`admin-logs`. Cron: `purge-past` (archiwizuje minione zajęcia, czyści iCloud).

## Obrazy

Oryginały (JPG) leżą w `media-src/` (poza gitem). `npm run img` konwertuje do `.webp` w
`public/assets/img/`, `npm run goats` wycina kozy-maskotki, `node scripts/brand.mjs` generuje favikony i OG.
