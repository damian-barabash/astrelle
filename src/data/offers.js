// Everything Astrelle points to at the partner studio. Astrelle does not sell clay
// classes itself: Stasia teaches at Wizards of Art, and every booking, payment, voucher
// and shop order happens on their site. Names and descriptions live in the language
// docs (offers.items.<id>); prices and links here are the defaults — the admin can
// override them per offer (site_settings.partner.offers[id] = { price, url, hidden }).
export const PARTNER = {
  name: 'Wizards of Art',
  site: 'https://www.wizardsofarts.com',
  schedule: 'https://www.wizardsofarts.com/grafik-zajęć',
  adults: 'https://www.wizardsofarts.com/dla-dorosłych',
  kids: 'https://www.wizardsofarts.com/dla-dzieci',
  vouchers: 'https://www.wizardsofarts.com/vouchery',
  shop: 'https://www.wizardsofarts.com/category/all-products',
  contact: 'https://www.wizardsofarts.com/kontakty',
  terms: 'https://www.wizardsofarts.com/regulamin-serwisu-internetowego',
  phone: '+48 576 119 840',
  email: 'wizardofart2022@gmail.com',
  instagram: 'https://www.instagram.com/wizards_of_art_pl',
}

export const PLACES = {
  zurawia: {
    street: 'ul. Żurawia 32/34, lok. 26',
    city: 'Warszawa · Śródmieście',
    maps: 'https://www.google.com/maps/search/?api=1&query=Wizards+of+Art+%C5%BBurawia+32%2F34+Warszawa',
  },
  wiolinowa: {
    street: 'ul. Wiolinowa 8, lok. 150 (kl. 1)',
    city: 'Warszawa · Ursynów',
    maps: 'https://www.google.com/maps/search/?api=1&query=Wizards+of+Art+Wiolinowa+8+Warszawa',
  },
}

export const GROUPS = [
  { id: 'hand', shape: 'bowl', photo: 'hand' },
  { id: 'wheel', shape: 'wheel', photo: 'wheel' },
  { id: 'paint', shape: 'brush', photo: 'paint' },
  { id: 'family', shape: 'cup', photo: 'kids' },
  { id: 'studio', shape: 'kiln', photo: 'studio' },
]

const S = 'https://www.wizardsofarts.com/service-page/'
const ADULTS = 'https://www.wizardsofarts.com/dla-dorosłych'
const KIDS = 'https://www.wizardsofarts.com/dla-dzieci'
// unit: how the price is counted (offers.units.<unit>); `from` puts "od" in front.
// Links: checked 2026-10-12 — only the group hand-building class can be booked from its
// own service page; the other service pages answer "usługa niedostępna, skontaktuj się
// z nami", so those offers lead to the studio's price list page instead (where the
// studio's phone and form are). Change a link in the admin once booking opens.
export const OFFERS = [
  { id: 'hand_group', group: 'hand', shape: 'bowl', photo: 'hand', price: 220, unit: 'person', places: ['zurawia'], url: S + 'grupowe-zajęcia-z-ceramiki' },
  { id: 'hand_pair', group: 'hand', shape: 'heart', photo: 'pair', price: 550, unit: 'pair', places: ['zurawia', 'wiolinowa'], url: ADULTS },
  { id: 'hand_solo', group: 'hand', shape: 'vase', photo: 'bench', price: 400, unit: 'one', places: ['zurawia'], url: ADULTS },
  { id: 'wheel_group', group: 'wheel', shape: 'wheel', photo: 'wheel-group', price: 250, unit: 'person', places: ['wiolinowa'], url: ADULTS },
  { id: 'wheel_pair', group: 'wheel', shape: 'heart', photo: 'wheel', price: 650, unit: 'pair', places: ['wiolinowa'], url: ADULTS },
  { id: 'wheel_solo', group: 'wheel', shape: 'jar', photo: 'wheel-solo', price: 500, unit: 'one', places: ['wiolinowa'], url: ADULTS },
  { id: 'paint_adult', group: 'paint', shape: 'brush', photo: 'paint', price: 150, from: true, unit: 'one', places: ['zurawia'], url: ADULTS },
  { id: 'family', group: 'family', shape: 'teapot', photo: 'kids', price: 200, unit: 'person', places: ['zurawia'], url: ADULTS },
  { id: 'kids_class', group: 'family', shape: 'cup', photo: 'kids-wheel', price: 80, from: true, unit: 'lesson', places: ['zurawia'], url: KIDS },
  { id: 'kids_once', group: 'family', shape: 'plate', photo: 'kids', price: 150, unit: 'one', places: ['zurawia'], url: KIDS },
  { id: 'kids_paint', group: 'family', shape: 'brush', photo: 'paint', price: 80, from: true, unit: 'one', places: ['zurawia'], url: KIDS },
  { id: 'membership', group: 'studio', shape: 'kiln', photo: 'studio', price: 400, unit: 'month', places: ['wiolinowa'], url: 'https://www.wizardsofarts.com/plany-członkostwa' },
  { id: 'intensive', group: 'studio', shape: 'pitcher', photo: 'bench', price: 1000, from: true, unit: 'person', places: ['wiolinowa'], url: 'https://www.wizardsofarts.com/kursy', soon: true },
]

const P = 'https://www.wizardsofarts.com/product-page/'
export const VOUCHERS = [
  { id: 'vou_online', price: 100, from: true, kind: 'online', url: 'https://www.wizardsofarts.com/voucher-online' },
  { id: 'vou_group', price: 220, kind: 'print', url: P + 'друкований-сертифікат-на-групове-заняття-220-zl' },
  { id: 'vou_hand_solo', price: 300, kind: 'print', url: P + 'друкований-сертифікат-на-індивідувальне-заняття-з-ручної-ліпки-250-zl' },
  { id: 'vou_wheel_solo', price: 400, kind: 'print', url: P + 'друкований-сертифікат-на-індивідувальне-заняття-з-гончарного-кола-350-zl' },
  { id: 'vou_hand_pair', price: 500, kind: 'print', url: P + 'друкований-сертифікат-на-парне-заняття-з-ручної-ліпки-500-zl' },
  { id: 'vou_wheel_pair', price: 600, kind: 'print', url: P + 'друкований-сертифікат-на-парне-заняття-з-гончарного-кола-600-zl' },
]

// A short pick from the studio's shop; the full shelf is on their site.
export const PRODUCTS = [
  { id: 'shop_bowl_star', shape: 'bowl', price: 150, url: P + 'ręcznie-malowana-miseczka-ceramiczna-z-rozgwiazdą-ahoy-15-cm' },
  { id: 'shop_plate_crab', shape: 'plate', price: 200, url: P + 'ręcznie-robiony-talerz-ceramiczny-z-krabem-ahoy-there-25-cm' },
  { id: 'shop_candle', shape: 'cup', price: 150, url: P + 'ręcznie-robiony-świecznik-ceramiczny-w-gwiazdki' },
  { id: 'shop_mug_white', shape: 'mug', price: 177, url: P + 'biały-ceramiczny-ręcznie-robiony-kubek-1' },
  { id: 'shop_mug_latte', shape: 'mug', price: 155, from: true, url: P + 'brązowe-ceramiczne-kubki-do-latte' },
  { id: 'shop_plate_custom', shape: 'plate', price: 150, url: P + 'personalizowany-talerz-ceramiczny-na-ślub-lub-rocznicę-ręcznie-robiony-talerz' },
  { id: 'shop_bowl_fruit', shape: 'bowl', price: 177, from: true, url: P + 'duża-miska-na-owoce-ręcznie-robiona-ceramika-1' },
  { id: 'shop_spoon', shape: 'tag', price: 124, url: P + 'ceramiczna-podstawka-pod-łyżkę-do-kawy-z-cytryną' },
]

export const ALL_ITEMS = [...OFFERS, ...VOUCHERS, ...PRODUCTS]
// ids the click tracker also accepts (links that are not a single product)
export const EXTRA_TARGETS = ['schedule', 'site', 'shop', 'vouchers', 'adults', 'kids', 'contact', 'terms', 'instagram']

export const offerById = (id) => OFFERS.find((o) => o.id === id)

// Apply the admin's overrides (price / url / hidden) to a list of items.
export function withOverrides(list, partner) {
  const ov = partner?.offers || {}
  return list
    .map((o) => {
      const x = ov[o.id]
      if (!x) return o
      return { ...o, price: x.price === '' || x.price == null ? o.price : x.price, url: x.url || o.url, hidden: !!x.hidden }
    })
    .filter((o) => !o.hidden)
}

// "od 150 zł" / "220 zł" — a number gets the currency, a custom string is shown as typed
export function priceText(o, from = 'od') {
  if (o.price == null || o.price === '') return ''
  const p = typeof o.price === 'number' || /^\d+([.,]\d+)?$/.test(String(o.price)) ? `${o.price} zł` : String(o.price)
  return o.from && !/^\D/.test(p) ? `${from} ${p}` : p
}
