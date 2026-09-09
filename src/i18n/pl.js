// Polish — primary market. Short copy: every string is meant to be read in one breath.
export default {
  meta: {
    title: 'Astrelle — pracownia ceramiki · Warszawa',
    desc: 'Warsztaty, kurs i coworking ceramiczny w Warszawie (ul. Mała 5a, studio AINO). Zapisz się online.',
  },
  nav: { home: 'Start', calendar: 'Kalendarz', shop: 'Sklep', book: 'Zapisz się', menu: 'Menu', close: 'Zamknij' },

  hero: {
    l1: 'Usiądź przy kole.',
    l2: 'Glina zrobi',
    l3: 'resztę.',
    col1: 'Pracownia ceramiki w centrum Warszawy. Warsztaty dla początkujących, kurs i coworking dla tych, którzy już lepią.',
    col2: 'Wychodzisz z własnym naczyniem. Glinę, szkliwo i dwa wypały bierzemy na siebie.',
    tag1: 'studio AINO · Warszawa',
    tag2: 'ul. Mała 5a',
    cta: 'Wybierz termin',
    cta2: 'Cennik',
  },

  formats: {
    label: 'Co robimy',
    items: [
      { t: 'Warsztaty', d: 'Jedno spotkanie, jedno naczynie. Dla tych, którzy nigdy nie dotykali gliny — i tych, którzy chcą spróbować jeszcze raz.', meta: '2 h · wszystko w cenie' },
      { t: 'Coworking', d: 'Koło, narzędzia, piec i miejsce przy stole. Przychodzisz ze swoim pomysłem, my dokładamy resztę.', meta: 'od 35 zł / h' },
      { t: 'Kurs', d: 'Cztery lub osiem spotkań. Od centrowania bryły po szkliwienie — z własnymi naczyniami na koniec.', meta: '4 lub 8 spotkań' },
    ],
    cta: 'Zobacz terminy',
  },

  steps: {
    label: 'Jak to działa',
    items: [
      { t: 'Wybierasz termin', d: 'W kalendarzu widać wolne miejsca. Zapis zajmuje minutę.' },
      { t: 'Potwierdzamy', d: 'Odezwiemy się w ciągu 24 h — SMS, WhatsApp albo e-mail.' },
      { t: 'Przychodzisz i tworzysz', d: 'Fartuch, glina i herbata czekają. Naczynie odbierasz po wypale.' },
    ],
  },

  master: {
    label: 'Pracownia',
    name: 'Stasia Kulik',
    role: 'ceramiczka · założycielka Astrelle',
    bio: 'Prowadzi warsztaty tak, że glina słucha nawet tych, którzy pierwszy raz siadają przy kole. Spokojnie, po dobroci i z miłością do materiału.',
    cards: [
      { t: 'Studio AINO', d: 'ul. Mała 5a, Warszawa. Jasna pracownia z kołami, piecem i dużym stołem.' },
      { t: 'Dla kogo', d: 'Dla dorosłych i młodzieży od 14 lat. Bez doświadczenia — to nasza specjalność.' },
    ],
    map: 'Otwórz w Google Maps',
  },

  gallery: { label: 'Studio', title: 'Nasza przestrzeń' },

  pricing: {
    label: 'Cennik',
    title: 'Przejrzyste ceny',
    groups: [
      { title: 'Warsztaty', rows: [{ l: 'Warsztat jednorazowy · 2 h', r: '180 zł' }, { l: 'Warsztat tematyczny', r: 'od 200 zł' }], note: '' },
      { title: 'Coworking', rows: [{ l: 'Godzina', r: '35 zł' }, { l: 'Miesiąc · 1× w tygodniu', r: '280 zł' }, { l: 'Miesiąc · 2× w tygodniu', r: '500 zł' }, { l: 'Miesiąc · 3× w tygodniu', r: '700 zł' }, { l: 'Bez limitu', r: '1150 zł' }], note: '' },
      { title: 'Kurs i wypał', rows: [{ l: 'Kurs · 4 spotkania · 3 naczynia', r: '950 zł' }, { l: 'Kurs · 8 spotkań · 5 naczyń', r: '1500 zł' }, { l: 'Wypał biskwitowy · 1 kg', r: '23 zł' }, { l: 'Wypał szkliwny · 1 kg', r: '48 zł' }], note: 'W cenie kursu: glina, angoby, szkliwo i dwa wypały.' },
    ],
    gift: 'Voucher podarunkowy',
    giftText: 'Warsztat w prezencie — z datą do wyboru przez obdarowanego.',
    giftBtn: 'Zapytaj o voucher',
  },

  facts: {
    label: 'Ciekawostki',
    items: [
      'Glina kurczy się o 10–15 % po suszeniu i wypale.',
      'Piec rozgrzewa się do 1000–1300 °C — goręcej niż lawa.',
      'Wypały są dwa: biskwit utrwala kształt, szkliwo daje kolor.',
    ],
  },

  cta: { title: 'Zarezerwuj miejsce przy kole', sub: 'Wolne terminy na najbliższe tygodnie są w kalendarzu.', btn: 'Otwórz kalendarz' },

  footer: {
    tagline: 'Ceramika tworzona rękami',
    rights: 'Wszelkie prawa zastrzeżone',
    legal: 'Dokumenty',
    privacy: 'Polityka prywatności',
    cookies: 'Cookies',
    terms: 'Regulamin',
    made: 'Zrobione w Warszawie',
    contact: 'Kontakt',
  },

  calendar: {
    title: 'Kalendarz',
    sub: 'Wybierz termin i zostaw kontakt. Potwierdzimy w ciągu 24 h.',
    all: 'Wszystko',
    classes: 'Warsztaty',
    cowork: 'Coworking',
    today: 'Dziś',
    upcoming: 'Najbliższe terminy',
    free: 'wolnych miejsc',
    one: 'wolne miejsce',
    full: 'Brak miejsc',
    seats: 'miejsc',
    book: 'Zapisz się',
    waitlist: 'Lista rezerwowa',
    empty: 'W tym miesiącu nie ma jeszcze terminów. Zajrzyj później albo napisz do nas.',
    howLabel: 'Jak to działa',
    how: ['Wybierz termin', 'Potwierdzimy w 24 h', 'Przyjdź i twórz'],
    name: 'Imię',
    contact: 'Telefon lub e-mail',
    people: 'Ile osób',
    comment: 'Komentarz (opcjonalnie)',
    consent: 'Zgadzam się na przetwarzanie danych w celu obsługi zapisu.',
    send: 'Wyślij zgłoszenie',
    sending: 'Wysyłam…',
    cancel: 'Anuluj',
    ok: 'Zgłoszenie wysłane. Odezwiemy się, żeby potwierdzić.',
    okWait: 'Jesteś na liście rezerwowej. Damy znać, gdy zwolni się miejsce.',
    err: 'Nie udało się wysłać. Spróbuj ponownie.',
    errSeats: 'Zostało mniej miejsc, niż podano. Zmniejsz liczbę osób.',
    done: 'Gotowe',
    dayHint: 'Kliknij dzień, by zobaczyć terminy',
    cls: 'Warsztat',
    cw: 'Coworking',
    price: 'Cena',
  },

  lead: {
    title: 'Nie wiesz, co wybrać?',
    sub: 'Napisz dwa słowa — podpowiemy format i termin.',
    name: 'Imię',
    contact: 'Telefon lub e-mail',
    message: 'Wiadomość',
    consent: 'Zgadzam się na kontakt w sprawie mojego zapytania.',
    send: 'Wyślij',
    ok: 'Dziękujemy! Odpiszemy w ciągu 24 h.',
    err: 'Nie udało się wysłać. Spróbuj ponownie.',
    giftTitle: 'Voucher podarunkowy',
    giftSub: 'Zostaw kontakt — wyślemy szczegóły i voucher w PDF.',
  },

  shop: {
    title: 'Sklep',
    soon: 'Otwarcie w październiku',
    sub: 'Kubki, miski i talerze z pracowni. Każda sztuka jedyna — jak dzień, w którym powstała.',
    waitTitle: 'Daj znać, gdy ruszymy',
    contact: 'E-mail lub telefon',
    consent: 'Chcę dostać wiadomość o otwarciu sklepu.',
    btn: 'Zapisz mnie',
    ok: 'Zapisane. Odezwiemy się, gdy sklep ruszy.',
    err: 'Nie udało się. Spróbuj ponownie.',
  },

  cookie: {
    hi: 'Cześć, tu kózka Astrelle.',
    text: 'Używamy tylko niezbędnych ustawień (język) i — za Twoją zgodą — anonimowych statystyk odwiedzin. Żadnych reklam.',
    necessary: 'Tylko niezbędne',
    accept: 'Zgadzam się na statystyki',
    more: 'Więcej o cookies',
  },

  mascot: { intro: 'A wiesz, że…', close: 'Zamknij', name: 'Kózka Astrelle' },

  legal: {
    privacy: {
      title: 'Polityka prywatności',
      updated: 'Aktualizacja: wrzesień 2026',
      blocks: [
        { h: 'Administrator', p: 'Administratorem danych osobowych jest {company}, {address}. Kontakt: {email}.' },
        { h: 'Jakie dane zbieramy', p: 'Przy zapisie na zajęcia lub przez formularz kontaktowy: imię, telefon lub e-mail, liczbę osób i treść wiadomości. Na stronie: anonimowe statystyki odwiedzin (bez identyfikacji osoby), wyłącznie za zgodą.' },
        { h: 'Po co', p: 'Aby obsłużyć zapis, potwierdzić termin i odpowiedzieć na pytanie (art. 6 ust. 1 lit. b RODO), prowadzić listę klientów pracowni (prawnie uzasadniony interes, lit. f) oraz — za zgodą — mierzyć ruch na stronie (lit. a).' },
        { h: 'Jak długo', p: 'Dane zapisów i zapytań przechowujemy do 3 lat od ostatniego kontaktu, chyba że wcześniej poprosisz o ich usunięcie. Statystyki są anonimowe i nie pozwalają Cię zidentyfikować.' },
        { h: 'Komu przekazujemy', p: 'Dane przechowuje nasz dostawca infrastruktury (Supabase, serwery w UE). Nie sprzedajemy danych i nie przekazujemy ich do celów reklamowych.' },
        { h: 'Twoje prawa', p: 'Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia oraz sprzeciwu. Zgodę możesz cofnąć w każdej chwili. Skargę można złożyć do Prezesa UODO.' },
        { h: 'Kontakt', p: 'W sprawach danych napisz na {email} albo przyjdź do pracowni: {address}.' },
      ],
    },
    cookies: {
      title: 'Cookies i lokalne dane',
      updated: 'Aktualizacja: wrzesień 2026',
      blocks: [
        { h: 'Co zapisujemy', p: 'Strona nie używa klasycznych plików cookie do śledzenia. W pamięci przeglądarki (localStorage) zapisujemy: wybrany język, Twoją decyzję o statystykach oraz — po zgodzie — losowy identyfikator sesji dla anonimowych statystyk.' },
        { h: 'Niezbędne', p: '„astrelle_lang” (język strony), „astrelle_consent” (Twoja decyzja). Bez nich strona nie zapamięta ustawień. Nie wymagają zgody.' },
        { h: 'Statystyki (za zgodą)', p: '„astrelle_sid” — losowy ciąg znaków bez powiązania z Tobą. Liczymy odwiedziny, czas na stronie i urządzenia. Dane trafiają na nasz serwer, nie do zewnętrznych narzędzi reklamowych.' },
        { h: 'Zewnętrzne zasoby', p: 'Czcionki ładujemy z Google Fonts, a link „Otwórz w Google Maps” prowadzi do Google — te serwisy mają własne polityki.' },
        { h: 'Jak zmienić decyzję', p: 'Wyczyść dane strony w przeglądarce albo kliknij „Ustawienia cookies” w stopce — okno zgody pojawi się ponownie.' },
      ],
    },
    terms: {
      title: 'Regulamin zapisów',
      updated: 'Aktualizacja: wrzesień 2026',
      blocks: [
        { h: 'Zapis', p: 'Zgłoszenie przez kalendarz jest prośbą o rezerwację. Miejsce jest zarezerwowane po naszym potwierdzeniu (SMS, WhatsApp lub e-mail).' },
        { h: 'Płatność', p: 'Płatność na miejscu — gotówką lub kartą, o ile przy terminie nie podano inaczej. Kurs opłacany jest przed pierwszym spotkaniem.' },
        { h: 'Odwołanie', p: 'Termin można przełożyć lub odwołać bezpłatnie do 24 h przed zajęciami. Późniejsze odwołanie lub nieobecność może oznaczać utratę miejsca bez zwrotu.' },
        { h: 'W pracowni', p: 'Zajęcia prowadzimy w studio AINO, {address}. Glina, narzędzia, fartuchy i wypały są w cenie. Gotowe naczynia odbierasz w pracowni po wypale — zwykle w 2–3 tygodnie.' },
        { h: 'Bezpieczeństwo', p: 'Zajęcia są dla osób od 14 lat (młodsze — z opiekunem po uzgodnieniu). Prosimy o wygodne ubranie; pracownia nie odpowiada za rzeczy pozostawione bez opieki.' },
        { h: 'Kontakt', p: '{company}, {address}, {email}.' },
      ],
    },
  },
}
