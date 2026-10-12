# Astrelle

Strona marki **Astrelle** — ceramiczki Stasi Kulik. Astrelle nie prowadzi własnej pracowni:
zajęcia odbywają się w pracowni partnerskiej **Wizards of Art** (Warszawa, ul. Żurawia 32/34
i ul. Wiolinowa 8). Strona przedstawia formaty i ceny, a każdy przycisk „Zapisz się / Kup”
prowadzi na stronę pracowni — z oznaczeniem źródła i kodem przejścia, które zapisujemy u siebie.
React + Vite, 3 języki (PL / RU / EN — domyślnie język urządzenia).

🌐 https://astrelle.pl · panel: https://astrelle.pl/admin

## Strony

| Ścieżka | Co |
| --- | --- |
| `/` | hero z kubkiem 3D, „jak działamy” (Astrelle × pracownia), formaty 01–04, kroki, mistrzyni, voucher, galeria, cennik, adresy pracowni, ciekawostki, CTA |
| `/warsztaty` | wszystkie formaty z gliną w 5 grupach (lepienie, koło, malowanie, dzieci i rodziny, pracownia) |
| `/warsztaty/:id` | strona jednego formatu: opis, cena, co w cenie, adres, przycisk do zapisu w pracowni |
| `/voucher` | voucher elektroniczny i drukowane — linki do produktów pracowni |
| `/sklep` | wybór ceramiki ze sklepu pracowni |
| `/kontakt` | pracownia (zapisy) i Astrelle (formularz „Napisz do Stasi”) |
| `/polityka-prywatnosci` `/cookies` `/regulamin` | dokumenty (edytowalne w panelu) |
| `/admin` | panel: Dziś · Partner (przejścia i zakupy) · Wiadomości · Edytor wizualny · Galeria · Analityka · Logi · Ustawienia |

## Linki do pracowni i śledzenie

- Oferta, vouchery i produkty: `src/data/offers.js` (ceny i adresy domyślne). W panelu
  (`Partner → Предложения и цены`) można nadpisać cenę i link albo ukryć pozycję
  (`site_settings.partner.offers`).
- Każdy link wychodzący to komponent `Out` (`src/components/Out.jsx`): dopisuje
  `utm_source=astrelle&utm_medium=referral&utm_campaign=<oferta>&utm_content=<kod>` i wysyła
  kliknięcie do funkcji `go` → tabela `partner_clicks`. Bez cookies i danych osobowych.
- Zakup odbywa się na stronie pracowni, więc dowiadujemy się o nim na trzy sposoby
  (opis w panelu, `Partner → Как узнаём о покупках`): kod promocyjny Astrelle pokazywany na stronie,
  webhook pracowni (`partner-hook?key=…`, np. Wix Automations) albo ręczny wpis w panelu
  (`partner_sales`).

## Stack

- **React 18 + Vite**, `react-router-dom` (BrowserRouter, fallback `404.html` na GH Pages)
- **React Three Fiber** — kubek 3D w hero i talerz na `/sklep` (`public/assets/3d/*.glb`)
- fonty **Unbounded** (nagłówki) + **Onest** (tekst) z Google Fonts; Geologica tylko w panelu
- grafika „paper-cut” rysowana w SVG: `src/components/Shapes.jsx` (naczynia, odcisk palca, dłonie,
  pieczęć), zdjęcia z grafiką — `src/components/PhotoArt.jsx`
- własny **i18n** (`src/i18n`) — słowniki w bundlu jako fallback, treść edytowalna w bazie
  (`content`; dokumenty sprzed rewizji `__v: 2` są pomijane)
- **Supabase** (`wynmqmwvjwdwjwlixwvc`): Postgres + RLS, Storage `studio-media`, Edge Functions
  (`supabase/functions/*`, wspólne helpery w `_shared/common.ts`), migracje w `supabase/migrations/`
- zgoda na cookies: tylko ustawienia lokalne + anonimowe statystyki po zgodzie (`src/lib/consent.js`)
- deploy frontu: **GitHub Actions → GitHub Pages** (custom domain via `public/CNAME`)

## Edytor wizualny

Komponenty `T` / `Img` / `List` / `Section` z `src/content/edit.jsx` renderują zwykły HTML na stronie,
a w panelu (`/admin/edytor`) stają się edytowalne (klik → tekst, listy z ↑↓✕, sekcje ukryj/przesuń).
Zapis → `content.doc` (per język) i `site_settings.layout`. Ceny i linki oferty — w zakładce „Partner”.

Po każdej zmianie `@media` w `src/styles/global.css` uruchom `npm run twins` (bliźniacze
`@container` dla podglądu mobilnego w edytorze). Nie używaj gołego `vw` — tylko `calc(N * var(--vw))`.

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
npx supabase functions deploy <nazwa> --project-ref wynmqmwvjwdwjwlixwvc --no-verify-jwt --use-api
```

Funkcje publiczne: `go` (kliknięcie w link do pracowni), `lead` (formularz kontaktowy),
`analytics-track`, `partner-hook` (webhook pracowni, klucz w adresie). Admin (token sesji w body):
`admin-auth`, `admin-content`, `admin-partner`, `admin-crm`, `admin-gallery`, `admin-analytics`,
`admin-logs`. Kalendarz zapisów i rezerwacje zostały usunięte w 10.2026 (tabele `events` / `bookings`
zostały w bazie, puste).

## Obrazy

Oryginały (JPG) leżą w `media-src/` (poza gitem). `npm run stock` konwertuje zdjęcia oferty
(`media-src/stock` → `public/assets/img/s-*.webp`), `npm run img` — starsze zdjęcia sekcji,
`npm run goats` wycina kozy-maskotki, `npm run glb` kompresuje modele 3D,
`npm run brand` generuje favikony i obraz OG. Autorzy zdjęć — `CREDITS.md`.
