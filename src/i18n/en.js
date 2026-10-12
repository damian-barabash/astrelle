// English — short copy for visitors and expats: every string is meant to be read in one breath.
// Astrelle is the ceramist's brand; classes, payments, vouchers and the shop belong to
// the partner studio Wizards of Art, and every "book / buy" link leads to their site.
export default {
  __v: 2,
  meta: {
    title: 'Astrelle — ceramics with Stasia Kulik · Wizards of Art studio, Warsaw',
    desc: 'Astrelle is the brand of ceramist Stasia Kulik. Hand-building and pottery wheel workshops run at the Wizards of Art studio in Warsaw — booking and vouchers on the studio website.',
  },
  nav: { home: 'Home', offers: 'Workshops', voucher: 'Voucher', shop: 'Shop', contact: 'Contact', book: 'Book', menu: 'Menu', close: 'Close' },

  hero: {
    h1: 'Your hands.',
    h2: 'Our clay.',
    k1: 'Ceramics with Stasia Kulik',
    k2: 'Wizards of Art · Warsaw',
    p1: 'Astrelle is ceramist Stasia Kulik’s brand. Classes are held at the Wizards of Art studio — in Śródmieście (city centre) and Ursynów.',
    p2: 'Here you choose a format. Booking, payment and vouchers — on the studio website, where every button leads.',
    cta: 'Choose a workshop',
    cta2: 'Studio schedule',
  },

  band: { caption: 'Wheel, kiln, a big table — and a quiet where you hear the clay.' },

  partner: {
    label: 'How we work',
    title: 'Astrelle at the Wizards of Art studio',
    text: 'We do not run our own studio — our ceramist works at Wizards of Art, the creative space of Weronika Kowal. So everything to do with clay, you buy from them.',
    points: [
      { t: 'We', d: 'Suggest a format, show the prices and take you straight to booking.' },
      { t: 'The studio', d: 'Takes bookings and payments, issues vouchers, fires and glazes the work.' },
      { t: 'You', d: 'Come, make your own piece and collect it after 2–3 weeks.' },
    ],
    btn: 'Meet the studio',
    seal: 'Astrelle × Wizards of Art',
  },

  formats: {
    label: 'What you choose',
    more: 'All formats and prices',
    stripT: 'Already working on your own?',
    stripD: 'Studio membership: a wheel, tools and your own shelf. From 400 zł a month.',
    stripBtn: 'See membership',
  },

  offers: {
    title: 'Workshops',
    sub: 'All clay formats at the Wizards of Art studio. Prices and descriptions come from their offer — booking and payment on their website.',
    groups: {
      hand: { t: 'Hand-building', d: 'No wheel. You shape a piece in your hands — from a ball of clay to a finished mug.' },
      wheel: { t: 'Pottery wheel', d: 'Centring, pulling the walls, shape. The teacher guides you step by step.' },
      paint: { t: 'Ceramic painting', d: 'A ready-made piece, brushes and colours. After firing it is ready to use.' },
      family: { t: 'Kids and families', d: 'Classes from age 6 and hand-building for the whole family.' },
      studio: { t: 'Studio and course', d: 'For those who want to work alone or go deeper.' },
    },
    units: { person: 'per person', pair: 'per pair', one: '', month: 'per month', lesson: 'per class' },
    from: 'from',
    book: 'Book at Wizards of Art',
    bookShort: 'Book',
    details: 'Details',
    included: 'Included',
    where: 'Where',
    price: 'Price',
    soon: 'Coming soon',
    soonBtn: 'See on the studio website',
    note: 'Booking and payment on the Wizards of Art studio website. Opens in a new tab.',
    call: 'Prefer to call? The studio:',
    rulesT: 'Good to know',
    rules: [
      'You can change or cancel a date free of charge up to 24 h before the class.',
      'You collect finished work at the studio — usually after 2–3 weeks.',
      'The class language is given in the schedule: Polish, Russian or English.',
    ],
    others: 'Other formats',
    all: 'All workshops',
    items: {
      hand_group: {
        t: 'Group hand-building',
        meta: '2 h · 3–8 people',
        d: 'A small workshop: you build and decorate your own piece.',
        more: 'Everyone makes one piece of their choice — a mug, a plate, a vase or another shape. You work by hand-building: you form the piece from scratch, then decorate it yourself — with paints, lettering and patterns.',
        incl: ['Clay and tools', 'Decorating your piece', 'Firing and glazing', 'Collection after 2–3 weeks'],
      },
      hand_pair: {
        t: 'Hand-building for two',
        meta: '2 h · for a pair',
        d: 'A moment of calm and closeness: two pieces, one table.',
        more: 'A class for two — a date, friends, a mother and daughter. Each of you makes your own piece: a mug, a plate, a vase or whatever you fancy. At the end you decorate the pieces your own way.',
        incl: ['Two pieces', 'Clay and tools', 'Firing and glazing', 'Collection after 2–3 weeks'],
      },
      hand_solo: {
        t: 'Private hand-building',
        meta: '2 h · one to one',
        d: 'The teacher’s full attention — pace and technique to fit your idea.',
        more: 'You work one to one with the teacher. Technique and pace are matched to what you want to make and to your experience. Good for a first time and when you have a specific project.',
        incl: ['Individual programme', 'Clay and tools', 'Firing and glazing'],
      },
      wheel_group: {
        t: 'Wheel in a small group',
        meta: '2 h · 3–4 people · from age 10',
        d: 'Each throws their own piece and decorates it with slips.',
        more: 'The instructor shows the whole process step by step — no experience needed. Pieces are dried, fired and glazed at the studio. You collect the finished pieces after about 2–4 weeks.',
        incl: ['A wheel for each person', 'Slips for decorating', 'Firing and glazing'],
      },
      wheel_pair: {
        t: 'Wheel for two',
        meta: '2 h · for a pair',
        d: 'Two wheels, two pieces — a mug, a small bowl or a vase.',
        more: 'You learn the basics: centring the clay, pulling the walls and forming a shape. Then each of you decorates your piece — with lettering, relief or your own pattern.',
        incl: ['Two pieces', 'Wheel work with a teacher', 'Firing and glazing', 'Collection after 2–3 weeks'],
      },
      wheel_solo: {
        t: 'Private wheel class',
        meta: '2 h · one to one',
        d: 'The fastest way to really feel the wheel.',
        more: 'One to one with the teacher at the pottery wheel. You start with centring and finish with a piece decorated your own way. After firing it stays with you for years.',
        incl: ['Individual programme', 'Clay and tools', 'Firing and glazing'],
      },
      paint_adult: {
        t: 'Painting ready-made ceramics',
        meta: '2 h · for adults',
        d: 'Pick a mug, small plate or bowl and paint it your own way.',
        more: 'No building: you get a ready-made piece, colours and brushes. You learn simple painting techniques, and after kiln firing the piece is fit for everyday use. The price depends on the piece you choose.',
        incl: ['Ready-made piece of your choice', 'Paints and brushes', 'Kiln firing'],
      },
      family: {
        t: 'Ceramics for families',
        meta: '2 h · 3–8 people',
        d: 'Hand-building together for big and small.',
        more: 'Hand-building in a family group: everyone makes their own piece, and the instructor helps both adults and children. Creative play that leaves real objects behind.',
        incl: ['Clay and tools', 'Firing and glazing'],
      },
      kids_class: {
        t: 'Ceramics for kids',
        meta: '1 h · from age 6',
        d: 'Regular classes: form, decoration and composition.',
        more: 'Children learn to build with clay: hand techniques, slabs and coils, proportions and the stability of a piece. Every fourth class is their own free project. Trial class — 80 zł, single class — 110 zł, pass — from 340 zł.',
        incl: ['The studio’s own programme', 'Materials', 'Firing of the work'],
      },
      kids_once: {
        t: 'Workshop for kids',
        meta: '1 h · from age 7',
        d: 'One session and a small plate shaped like an animal.',
        more: 'A one-off workshop for children: each one builds and decorates their own small plate in the shape of a chosen animal. A good first contact with clay.',
        incl: ['Materials', 'Firing and glazing'],
      },
      kids_paint: {
        t: 'Pottery painting for kids',
        meta: '1.5 h · from age 6',
        d: 'A mug, small plate or bowl — decorated by their own hand.',
        more: 'A colourful workshop in painting ready-made ceramics. Children learn simple techniques and make a lasting keepsake or gift. The price depends on the piece you choose.',
        incl: ['A ready-made piece', 'Paints and brushes', 'Kiln firing'],
      },
      membership: {
        t: 'Studio membership',
        meta: 'month · 24/7 access',
        d: 'A wheel, tools and your own shelf. You create at your own pace.',
        more: 'For people who work independently. Access to the studio at any time, or two visits a week outside workshop hours. With clay — 450 zł per month, without clay — 400 zł. Firings are charged separately.',
        incl: ['Access to a wheel and tools', 'Your own shelf', 'Clay on site', 'Studio glazes at extra cost'],
      },
      intensive: {
        t: '“Intensive” course',
        meta: '12 h · two days · from 3 people',
        d: 'From sketch, via wheel and hand-building, to glazing.',
        more: 'An intensive two-day workshop: throwing, hand-building, decorating and glazing. In a group — 1000 zł, individually — 1150 zł. The course is in preparation — the date will appear on the studio website.',
        incl: ['12 hours of work', 'Wheel and hand-building', 'Glazing'],
      },
    },
  },

  steps: {
    label: 'How it works',
    items: [
      { t: 'You choose a format', d: 'Hand-building, wheel or painting — solo, for two or in a group.' },
      { t: 'You book at the studio', d: 'The button leads to the Wizards of Art website. Date and payment are there.' },
      { t: 'You come and create', d: 'Clay and apron are waiting. Collect your piece after firing.' },
    ],
  },

  master: {
    label: 'The ceramist',
    name: 'Stasia Kulik',
    role: 'ceramist · founder of Astrelle',
    bio: 'She teaches at the Wizards of Art studio. In a way that makes clay listen even to those sitting at the wheel for the first time — calmly, kindly and with love for the material.',
    cards: [
      { t: 'Where she works', d: 'At the Wizards of Art studio: ul. Żurawia 32/34 and ul. Wiolinowa 8 in Warsaw.' },
      { t: 'Who it is for', d: 'Adults, couples, families and children from age 6. No experience — that is our speciality.' },
    ],
  },

  gallery: { label: 'Work', title: 'From clay and hands' },

  voucher: {
    label: 'Gift',
    title: 'Workshop voucher',
    text: 'Electronic — from 100 zł, the code arrives by e-mail. Or printed, with delivery. Vouchers are issued by the Wizards of Art studio; they are valid for 3 months.',
    btn: 'Choose a voucher',
    pageTitle: 'Voucher',
    pageSub: 'Give clay instead of one more thing. Vouchers are sold and redeemed by the Wizards of Art studio — you choose here, you buy there.',
    onlineLabel: 'Electronic',
    printLabel: 'Printed',
    buy: 'Buy at Wizards of Art',
    buyShort: 'Buy',
    facts: ['Valid 3 months from purchase', 'For any class or the studio shop', 'Print 10 zł · shipping 20 zł'],
    items: {
      vou_online: { t: 'Electronic voucher', d: 'Amounts of 220, 300, 400, 500, 600 zł or your own — from 100 zł. The promo code arrives by e-mail right after payment.' },
      vou_group: { t: 'Group class', d: 'One place at a group workshop.' },
      vou_hand_solo: { t: 'Private hand-building', d: 'A one-to-one class with the teacher.' },
      vou_wheel_solo: { t: 'Private wheel class', d: 'Two hours at the wheel with the teacher.' },
      vou_hand_pair: { t: 'Hand-building for two', d: 'A class as a duo — two pieces.' },
      vou_wheel_pair: { t: 'Wheel for two', d: 'A class as a duo at the pottery wheel.' },
    },
  },

  shop: {
    title: 'Shop',
    label: 'Ceramics from the studio',
    sub: 'Handmade mugs, bowls and plates. They are sold by the Wizards of Art shop — here are a few things from their shelf.',
    btn: 'The whole studio shop',
    go: 'See in the shop',
    note: 'Order, payment and delivery are handled by the Wizards of Art shop.',
    items: {
      shop_bowl_star: 'Small bowl with a starfish “Ahoy”, 15 cm',
      shop_plate_crab: 'Plate with a crab “Ahoy there”, 25 cm',
      shop_candle: 'Candle holder with stars',
      shop_mug_white: 'White handmade mug',
      shop_mug_latte: 'Brown latte mugs',
      shop_plate_custom: 'Personalised plate — wedding, anniversary',
      shop_bowl_fruit: 'Large fruit bowl',
      shop_spoon: 'Spoon rest with a lemon',
    },
  },

  where: {
    label: 'Where',
    title: 'Two studios in Warsaw',
    zurawia: { t: 'Śródmieście (city centre)', d: 'Hand-building, ceramic painting, classes for kids.' },
    wiolinowa: { t: 'Ursynów', d: 'Pottery wheel and studio membership.' },
    map: 'Map',
    hoursLabel: 'Studio hours',
    hours: ['Mon – Fri · 10:00 – 18:00', 'Saturday · 12:00 – 19:00', 'Sunday · 12:00 – 19:00'],
    phoneLabel: 'Studio phone',
    note: 'The address of each class is shown by its date in the studio schedule.',
  },

  pricing: {
    label: 'Price list',
    title: 'Studio prices',
    note: 'Prices from the Wizards of Art offer. The studio website always confirms the current price and date.',
  },

  facts: {
    label: 'Fun facts',
    items: [
      'Clay shrinks by 10–15 % after drying and firing.',
      'The kiln heats up to 1000–1300 °C — hotter than lava.',
      'There are two firings: bisque sets the shape, glaze gives colour.',
    ],
  },

  cta: { title: 'Sit down at the wheel', sub: 'Free dates are in the Wizards of Art studio schedule.', btn: 'Open the schedule' },

  contact: {
    title: 'Contact',
    sub: 'Booking and date questions — to the studio. Questions for Stasia and about Astrelle — to us.',
    studioT: 'Wizards of Art studio',
    studioD: 'Bookings, payments, vouchers, work pickup.',
    site: 'Studio website',
    usT: 'Astrelle',
    usD: 'Collaboration, questions for the ceramist, all but bookings.',
  },

  footer: {
    tagline: 'Ceramics made by hand',
    partner: 'We teach at the Wizards of Art studio. Bookings and sales — on their website.',
    rights: 'All rights reserved',
    legal: 'Documents',
    privacy: 'Privacy policy',
    cookies: 'Cookies',
    terms: 'Terms',
    made: 'Made in Warsaw',
    contact: 'Contact',
    studio: 'Studio',
  },

  promo: { label: 'Code for booking', hint: 'Give this code when booking or buying at the studio — they will know you came from Astrelle.', copy: 'Copy', copied: 'Copied' },

  lead: {
    title: 'Write to Stasia',
    sub: 'Not sure what to pick? Two words — we’ll suggest a format.',
    name: 'Name',
    contact: 'Phone or e-mail',
    message: 'Message',
    consent: 'I agree to be contacted about my enquiry.',
    send: 'Send',
    ok: 'Thank you! We will reply within 24 h.',
    err: 'Could not send. Please try again.',
  },

  cookie: {
    hi: 'Hi, this is the Astrelle goat.',
    text: 'We use only essential settings (language) and — with your consent — anonymous visit statistics. No ads.',
    necessary: 'Essential only',
    accept: 'I agree to statistics',
    more: 'More about cookies',
  },

  mascot: { intro: 'Did you know that…', close: 'Close', name: 'Astrelle goat' },

  legal: {
    privacy: {
      title: 'Privacy policy',
      updated: 'Updated: October 2026',
      blocks: [
        { h: 'Controller', p: 'The controller of the data collected on this website is {company}. Contact: {email}.' },
        { h: 'What we do not collect here', p: 'There are no bookings or payments on astrelle.pl. Reservations, purchases and vouchers are handled by the Wizards of Art studio on its own website — its privacy policy applies there.' },
        { h: 'What data we collect', p: 'Through the contact form: name, phone or e-mail and the content of the message. When you click a link to the studio we record which link was chosen and a random click code — no personal data. Anonymous visit statistics — only with consent.' },
        { h: 'Why', p: 'To answer your question (Art. 6(1)(b) GDPR), to settle our cooperation with the studio and to know which formats are chosen (legitimate interest, (f)) and — with consent — to measure traffic on the site ((a)).' },
        { h: 'Links to the studio', p: 'The address you go to contains a source tag (utm_source=astrelle) and a click code. This is how the studio knows you came to it from us. We do not pass your contact details to the studio.' },
        { h: 'How long', p: 'We keep enquiries for up to 3 years from the last contact, unless you ask us to delete them earlier. Click records and statistics are anonymous.' },
        { h: 'Who we share it with', p: 'The data is stored by our infrastructure provider (Supabase, servers in the EU). We do not sell data or pass it on for advertising purposes.' },
        { h: 'Your rights', p: 'You have the right to access your data, to rectify it, erase it, restrict its processing, port it and to object. You can withdraw consent at any time. A complaint can be lodged with the President of UODO (Polish data protection authority).' },
      ],
    },
    cookies: {
      title: 'Cookies and local data',
      updated: 'Updated: October 2026',
      blocks: [
        { h: 'What we store', p: 'The site does not use classic cookie files for tracking. In the browser storage (localStorage) we save: the chosen language, your decision about statistics and — after consent — a random session identifier for anonymous statistics.' },
        { h: 'Essential', p: '“astrelle_lang” (site language), “astrelle_consent” (your decision). Without them the site cannot remember settings. They need no consent.' },
        { h: 'Statistics (with consent)', p: '“astrelle_sid” — a random string of characters not linked to you. We count visits, time on the site and devices. The data goes to our server, not to external advertising tools.' },
        { h: 'Going to the studio', p: 'Clicking “Book” or “Buy” opens the Wizards of Art website. We record only the fact of the click and its random code — nothing in your browser. The studio website has its own cookies and its own policy.' },
        { h: 'External resources', p: 'We load fonts from Google Fonts, and the “Map” links lead to Google Maps — these services have their own policies.' },
        { h: 'How to change your decision', p: 'Clear the site data in your browser or click “Cookies · ⚙” in the footer — the consent window will appear again.' },
      ],
    },
    terms: {
      title: 'Terms',
      updated: 'Updated: October 2026',
      blocks: [
        { h: 'What this website is', p: 'Astrelle is the brand of ceramist Stasia Kulik. The site presents classes that take place at the Wizards of Art studio in Warsaw and leads to booking on its website.' },
        { h: 'Who sells', p: 'The organiser and seller of the classes, vouchers and ceramics is Wizards of Art. You enter into the contract with the studio, on its website and under its terms. Astrelle does not accept bookings or payments.' },
        { h: 'Prices and descriptions', p: 'Prices and descriptions come from the studio offer and are for information only. The binding price and availability are those given on the Wizards of Art website at the time of booking.' },
        { h: 'Changing and cancelling a date', p: 'The studio rules apply: a date can be changed or cancelled no later than 24 hours before the class; after that the fee is non-refundable.' },
        { h: 'Vouchers and complaints', p: 'Vouchers are valid for 3 months from purchase. Refunds and complaints are handled by the Wizards of Art studio.' },
        { h: 'Contact', p: '{company}, {email}. Classes: {address}.' },
      ],
    },
  },
}
