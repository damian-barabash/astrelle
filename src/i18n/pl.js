// Polish — primary market. Short copy: every string is meant to be read in one breath.
// Astrelle is the ceramist's brand; classes, their payments and vouchers belong to
// the partner studio Wizards of Art, and every "book / buy" link leads to their site.
export default {
  __v: 2,
  meta: {
    title: 'Astrelle — ceramika ze Stasią Kulik · pracownia Wizards of Art, Warszawa',
    desc: 'Astrelle to marka ceramiczki Stasi Kulik. Warsztaty lepienia i koła garncarskiego prowadzimy w pracowni Wizards of Art w Warszawie — zapisy i vouchery na stronie pracowni.',
  },
  nav: { home: 'Start', offers: 'Warsztaty', voucher: 'Voucher', shop: 'Sklep', contact: 'Kontakt', book: 'Zapisz się', menu: 'Menu', close: 'Zamknij' },

  hero: {
    h1: 'Twoje ręce.',
    h2: 'Nasza glina.',
    k1: 'Ceramika ze Stasią Kulik',
    k2: 'Wizards of Art · Warszawa',
    p1: 'Astrelle to marka ceramiczki Stasi Kulik. Zajęcia odbywają się w pracowni Wizards of Art — w Śródmieściu i na Ursynowie.',
    p2: 'Tu wybierasz format. Zapis, płatność i voucher — na stronie pracowni, dokąd prowadzi każdy przycisk.',
    cta: 'Wybierz warsztat',
    cta2: 'Grafik pracowni',
  },

  band: { caption: 'Koło, piec, duży stół — i cisza, w której słychać glinę.' },

  partner: {
    label: 'Jak działamy',
    title: 'Astrelle w pracowni Wizards of Art',
    text: 'Nie prowadzimy własnej pracowni — nasza mistrzyni pracuje w Wizards of Art, kreatywnej przestrzeni Weroniki Kowal. Dlatego na zajęcia zapisujesz się u nich, a vouchery kupujesz na ich stronie.',
    points: [
      { t: 'My', d: 'Podpowiadamy format, pokazujemy ceny i prowadzimy Cię prosto do zapisu.' },
      { t: 'Pracownia', d: 'Przyjmuje zapisy i płatności, wystawia vouchery, wypala i szkliwi prace.' },
      { t: 'Ty', d: 'Przychodzisz, tworzysz własne naczynie i odbierasz je po 2–3 tygodniach.' },
    ],
    btn: 'Poznaj pracownię',
    seal: 'Astrelle × Wizards of Art',
  },

  formats: {
    label: 'Co wybierasz',
    more: 'Wszystkie formaty i ceny',
    stripT: 'Lepisz już samodzielnie?',
    stripD: 'Członkostwo w pracowni: koło, narzędzia i własna półka. Od 400 zł za miesiąc.',
    stripBtn: 'Zobacz członkostwo',
  },

  offers: {
    title: 'Warsztaty',
    sub: 'Wszystkie formaty z gliną w pracowni Wizards of Art. Ceny i opisy pochodzą z ich oferty — zapis i płatność na ich stronie.',
    groups: {
      hand: { t: 'Ręczne lepienie', d: 'Bez koła. Formujesz naczynie w dłoniach — od kuli gliny po gotowy kubek.' },
      wheel: { t: 'Koło garncarskie', d: 'Centrowanie, wyciąganie ścianek, kształt. Mistrz prowadzi krok po kroku.' },
      paint: { t: 'Malowanie ceramiki', d: 'Gotowe naczynie, pędzle i kolory. Po wypale nadaje się do użytku.' },
      family: { t: 'Dzieci i rodziny', d: 'Zajęcia od 6 lat i wspólne lepienie dla całej rodziny.' },
      studio: { t: 'Pracownia i kurs', d: 'Dla tych, którzy chcą pracować sami albo wejść głębiej.' },
    },
    units: { person: 'za osobę', pair: 'za parę', one: '', month: 'miesięcznie', lesson: 'za zajęcia' },
    from: 'od',
    book: 'Zapisz się w Wizards of Art',
    bookShort: 'Zapisz się',
    details: 'Szczegóły',
    included: 'W cenie',
    where: 'Gdzie',
    price: 'Cena',
    soon: 'Wkrótce',
    soonBtn: 'Zobacz na stronie pracowni',
    note: 'Zapis i płatność na stronie pracowni Wizards of Art. Otworzy się w nowej karcie.',
    call: 'Wolisz zadzwonić? Pracownia:',
    rulesT: 'Dobrze wiedzieć',
    rules: [
      'Termin można bezpłatnie zmienić lub odwołać najpóźniej 24 h przed zajęciami.',
      'Gotowe prace odbierasz w pracowni — zwykle po 2–3 tygodniach.',
      'Język zajęć jest podany w grafiku: polski, rosyjski lub angielski.',
    ],
    others: 'Inne formaty',
    all: 'Wszystkie warsztaty',
    items: {
      hand_group: {
        t: 'Lepienie w grupie',
        meta: '2 h · 3–8 osób',
        d: 'Kameralne warsztaty: lepisz, zdobisz i dekorujesz własne naczynie.',
        more: 'Każdy tworzy jedno wybrane naczynie — kubek, talerz, wazon albo inny kształt. Pracujesz techniką ręcznego lepienia: formujesz pracę od podstaw, a potem sam ją zdobisz — farbami, napisami i wzorami.',
        incl: ['Glina i narzędzia', 'Dekorowanie pracy', 'Wypał i szkliwienie', 'Odbiór po 2–3 tygodniach'],
      },
      hand_pair: {
        t: 'Lepienie we dwoje',
        meta: '2 h · dla pary',
        d: 'Chwila spokoju i bliskości: dwa naczynia, jeden stół.',
        more: 'Zajęcia dla dwóch osób — randka, przyjaciółki, mama z córką. Każde z Was tworzy własne naczynie: kubek, talerz, wazon albo to, na co macie ochotę. Na koniec zdobicie prace według własnego pomysłu.',
        incl: ['Dwa naczynia', 'Glina i narzędzia', 'Wypał i szkliwienie', 'Odbiór po 2–3 tygodniach'],
      },
      hand_solo: {
        t: 'Lepienie indywidualne',
        meta: '2 h · jeden na jeden',
        d: 'Cała uwaga mistrza dla Ciebie — tempo i technika pod Twój pomysł.',
        more: 'Pracujesz jeden na jeden z mistrzem. Technikę i tempo dobieracie do tego, co chcesz stworzyć, i do Twojego doświadczenia. Dobre na pierwszy raz i wtedy, gdy masz konkretny projekt.',
        incl: ['Indywidualny program', 'Glina i narzędzia', 'Wypał i szkliwienie'],
      },
      wheel_group: {
        t: 'Koło w małej grupie',
        meta: '2 h · 3–4 osoby · od 10 lat',
        d: 'Każdy toczy własne naczynie i zdobi je angobami.',
        more: 'Prowadzący pokazuje cały proces krok po kroku — doświadczenie nie jest potrzebne. Prace są suszone, wypalane i szkliwione w pracowni. Gotowe naczynia odbierasz po około 2–4 tygodniach.',
        incl: ['Własne koło dla każdego', 'Angoby do zdobienia', 'Wypał i szkliwienie'],
      },
      wheel_pair: {
        t: 'Koło we dwoje',
        meta: '2 h · dla pary',
        d: 'Dwa koła, dwa naczynia — kubek, miseczka albo wazon.',
        more: 'Poznacie podstawy: centrowanie gliny, wyciąganie ścianek i formowanie kształtu. Potem każde z Was dekoruje swoją pracę — napisem, reliefem albo własnym wzorem.',
        incl: ['Dwa naczynia', 'Praca na kole z mistrzem', 'Wypał i szkliwienie', 'Odbiór po 2–3 tygodniach'],
      },
      wheel_solo: {
        t: 'Koło indywidualnie',
        meta: '2 h · jeden na jeden',
        d: 'Najszybsza droga, żeby naprawdę poczuć koło.',
        more: 'Jeden na jeden z mistrzem przy kole garncarskim. Zaczynasz od centrowania, kończysz gotowym naczyniem udekorowanym po swojemu. Po wypale zostaje z Tobą na lata.',
        incl: ['Indywidualny program', 'Glina i narzędzia', 'Wypał i szkliwienie'],
      },
      paint_adult: {
        t: 'Malowanie gotowej ceramiki',
        meta: '2 h · dla dorosłych',
        d: 'Wybierasz kubek, talerzyk lub miseczkę i malujesz po swojemu.',
        more: 'Bez lepienia: dostajesz gotowe naczynie, kolory i pędzle. Poznajesz proste techniki malowania, a po wypale w piecu praca nadaje się do codziennego użytku. Cena zależy od wybranego naczynia.',
        incl: ['Gotowe naczynie do wyboru', 'Farby i pędzle', 'Wypał w piecu'],
      },
      family: {
        t: 'Ceramika dla rodzin',
        meta: '2 h · 3–8 osób',
        d: 'Wspólne lepienie dla dużych i małych.',
        more: 'Ręczne lepienie w grupie rodzinnej: każdy tworzy własne naczynie, a prowadzący pomaga i dorosłym, i dzieciom. Twórcza zabawa, po której zostają prawdziwe przedmioty.',
        incl: ['Glina i narzędzia', 'Wypał i szkliwienie'],
      },
      kids_class: {
        t: 'Ceramika dla dzieci',
        meta: '1 h · od 6 lat',
        d: 'Zajęcia cykliczne: forma, dekor i kompozycja.',
        more: 'Dzieci uczą się lepić z gliny: techniki ręczne, płaty i wałeczki, proporcje i stabilność naczynia. Co czwarte zajęcia to własny, swobodny projekt. Zajęcia próbne — 80 zł, pojedyncze — 110 zł, abonament — od 340 zł.',
        incl: ['Autorski program pracowni', 'Materiały', 'Wypał prac'],
      },
      kids_once: {
        t: 'Warsztat dla dzieci',
        meta: '1 h · od 7 lat',
        d: 'Jedno spotkanie i talerzyk w kształcie zwierzątka.',
        more: 'Jednorazowe warsztaty dla dzieci: każde lepi i dekoruje własny talerzyk w kształcie wybranego zwierzątka. Dobry pierwszy kontakt z gliną.',
        incl: ['Materiały', 'Wypał i szkliwienie'],
      },
      kids_paint: {
        t: 'Malowanie naczyń dla dzieci',
        meta: '1,5 h · od 6 lat',
        d: 'Kubek, talerzyk albo miseczka — ozdobione własną ręką.',
        more: 'Kolorowe warsztaty malowania gotowej ceramiki. Dzieci poznają proste techniki i tworzą trwałą pamiątkę albo prezent. Cena zależy od wybranego naczynia.',
        incl: ['Gotowe naczynie', 'Farby i pędzle', 'Wypał w piecu'],
      },
      membership: {
        t: 'Członkostwo w pracowni',
        meta: 'miesiąc · dostęp 24/7',
        d: 'Koło, narzędzia i własna półka. Tworzysz we własnym rytmie.',
        more: 'Dla osób, które pracują samodzielnie. Dostęp do pracowni o dowolnej porze albo dwa wejścia w tygodniu poza godzinami warsztatów. Z gliną — 450 zł miesięcznie, bez gliny — 400 zł. Wypały rozliczane osobno.',
        incl: ['Dostęp do koła i narzędzi', 'Własna półka', 'Glina na miejscu', 'Szkliwa pracowni za dopłatą'],
      },
      intensive: {
        t: 'Kurs „Intensive”',
        meta: '12 h · dwa dni · od 3 osób',
        d: 'Od szkicu, przez koło i lepienie, po szkliwienie.',
        more: 'Intensywne, dwudniowe warsztaty: toczenie, ręczne formowanie, dekorowanie i szkliwienie. W grupie — 1000 zł, indywidualnie — 1150 zł. Kurs jest w przygotowaniu — termin pojawi się na stronie pracowni.',
        incl: ['12 godzin pracy', 'Koło i lepienie ręczne', 'Szkliwienie'],
      },
    },
  },

  steps: {
    label: 'Jak to działa',
    items: [
      { t: 'Wybierasz format', d: 'Lepienie, koło albo malowanie — sam, we dwoje lub w grupie.' },
      { t: 'Zapisujesz się w pracowni', d: 'Przycisk prowadzi na stronę Wizards of Art. Tam termin i płatność.' },
      { t: 'Przychodzisz i tworzysz', d: 'Glina i fartuch czekają. Naczynie odbierasz po wypale.' },
    ],
  },

  master: {
    label: 'Mistrzyni',
    name: 'Stasia Kulik',
    role: 'ceramiczka · założycielka Astrelle',
    bio: 'Prowadzi zajęcia w pracowni Wizards of Art. Tak, że glina słucha nawet tych, którzy pierwszy raz siadają przy kole — spokojnie, po dobroci i z miłością do materiału.',
    cards: [
      { t: 'Gdzie pracuje', d: 'W pracowni Wizards of Art: ul. Żurawia 32/34 i ul. Wiolinowa 8 w Warszawie.' },
      { t: 'Dla kogo', d: 'Dla dorosłych, par, rodzin i dzieci od 6 lat. Bez doświadczenia — to nasza specjalność.' },
    ],
  },

  gallery: { label: 'Prace', title: 'Z gliny i z rąk' },

  voucher: {
    label: 'Prezent',
    title: 'Voucher na warsztaty',
    text: 'Elektroniczny — od 100 zł, kod przychodzi e-mailem. Albo drukowany, z dostawą. Vouchery wystawia pracownia Wizards of Art; są ważne 3 miesiące.',
    btn: 'Wybierz voucher',
    pageTitle: 'Voucher',
    pageSub: 'Podaruj glinę zamiast kolejnej rzeczy. Vouchery sprzedaje i realizuje pracownia Wizards of Art — tu wybierasz, tam kupujesz.',
    onlineLabel: 'Elektroniczny',
    printLabel: 'Drukowany',
    buy: 'Kup w Wizards of Art',
    buyShort: 'Kup',
    facts: ['Ważny 3 miesiące od zakupu', 'Na dowolne zajęcia pracowni', 'Druk 10 zł · wysyłka 20 zł'],
    items: {
      vou_online: { t: 'Voucher elektroniczny', d: 'Kwoty 220, 300, 400, 500, 600 zł albo własna — od 100 zł. Kod promocyjny przychodzi e-mailem zaraz po opłaceniu.' },
      vou_group: { t: 'Zajęcia grupowe', d: 'Jedno miejsce na warsztatach w grupie.' },
      vou_hand_solo: { t: 'Lepienie indywidualne', d: 'Zajęcia jeden na jeden z mistrzem.' },
      vou_wheel_solo: { t: 'Koło indywidualnie', d: 'Dwie godziny przy kole z mistrzem.' },
      vou_hand_pair: { t: 'Lepienie we dwoje', d: 'Zajęcia w duecie — dwa naczynia.' },
      vou_wheel_pair: { t: 'Koło we dwoje', d: 'Zajęcia w duecie przy kole garncarskim.' },
    },
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

  where: {
    label: 'Gdzie',
    title: 'Dwie pracownie w Warszawie',
    zurawia: { t: 'Śródmieście', d: 'Lepienie ręczne, malowanie ceramiki, zajęcia dla dzieci.' },
    wiolinowa: { t: 'Ursynów', d: 'Koło garncarskie i członkostwo w pracowni.' },
    map: 'Mapa',
    hoursLabel: 'Godziny pracowni',
    hours: ['Pon – Pt · 10:00 – 18:00', 'Sobota · 12:00 – 19:00', 'Niedziela · 12:00 – 19:00'],
    phoneLabel: 'Telefon pracowni',
    note: 'Adres konkretnych zajęć jest podany przy terminie w grafiku pracowni.',
  },

  pricing: {
    label: 'Cennik',
    title: 'Ceny pracowni',
    note: 'Ceny z oferty Wizards of Art. Aktualną cenę i termin zawsze potwierdza strona pracowni.',
  },

  facts: {
    label: 'Ciekawostki',
    items: [
      'Glina kurczy się o 10–15 % po suszeniu i wypale.',
      'Piec rozgrzewa się do 1000–1300 °C — goręcej niż lawa.',
      'Wypały są dwa: biskwit utrwala kształt, szkliwo daje kolor.',
    ],
  },

  cta: { title: 'Usiądź przy kole', sub: 'Wolne terminy są w grafiku pracowni Wizards of Art.', btn: 'Otwórz grafik' },

  contact: {
    title: 'Kontakt',
    sub: 'Zapis i pytania o terminy — do pracowni. Pytania do Stasi i o Astrelle — do nas.',
    studioT: 'Pracownia Wizards of Art',
    studioD: 'Zapisy, płatności, vouchery, odbiór prac.',
    site: 'Strona pracowni',
    usT: 'Astrelle',
    usD: 'Współpraca, pytania do mistrzyni, wszystko poza zapisami.',
  },

  footer: {
    tagline: 'Ceramika tworzona rękami',
    partner: 'Zajęcia prowadzimy w pracowni Wizards of Art. Zapisy i vouchery — na ich stronie.',
    rights: 'Wszelkie prawa zastrzeżone',
    legal: 'Dokumenty',
    privacy: 'Polityka prywatności',
    cookies: 'Cookies',
    terms: 'Zasady',
    made: 'Zrobione w Warszawie',
    contact: 'Kontakt',
    studio: 'Pracownia',
  },

  promo: { label: 'Kod przy zapisie', hint: 'Podaj ten kod przy zapisie lub zakupie w pracowni — będą wiedzieć, że jesteś od Astrelle.', copy: 'Kopiuj', copied: 'Skopiowano' },

  lead: {
    title: 'Napisz do Stasi',
    sub: 'Nie wiesz, co wybrać? Dwa słowa — podpowiemy format.',
    name: 'Imię',
    contact: 'Telefon lub e-mail',
    message: 'Wiadomość',
    consent: 'Zgadzam się na kontakt w sprawie mojego zapytania.',
    send: 'Wyślij',
    ok: 'Dziękujemy! Odpiszemy w ciągu 24 h.',
    err: 'Nie udało się wysłać. Spróbuj ponownie.',
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
      updated: 'Aktualizacja: październik 2026',
      blocks: [
        { h: 'Administrator', p: 'Administratorem danych zbieranych na tej stronie jest {company}. Kontakt: {email}.' },
        { h: 'Czego tu nie zbieramy', p: 'Na astrelle.pl nie ma zapisów ani płatności za zajęcia. Rezerwacje i vouchery obsługuje pracownia Wizards of Art na swojej stronie — tam obowiązuje jej polityka prywatności.' },
        { h: 'Jakie dane zbieramy', p: 'Przez formularz kontaktowy i listę oczekujących sklepu: imię, telefon lub e-mail i treść wiadomości. Przy kliknięciu w link do pracowni zapisujemy, który link wybrano, i losowy kod przejścia — bez danych osobowych. Anonimowe statystyki odwiedzin — wyłącznie za zgodą.' },
        { h: 'Po co', p: 'Aby odpowiedzieć na pytanie (art. 6 ust. 1 lit. b RODO), rozliczać współpracę z pracownią i wiedzieć, które formaty są wybierane (prawnie uzasadniony interes, lit. f) oraz — za zgodą — mierzyć ruch na stronie (lit. a).' },
        { h: 'Linki do pracowni', p: 'Adres, pod który przechodzisz, zawiera oznaczenie źródła (utm_source=astrelle) i kod przejścia. Dzięki temu pracownia wie, że trafiłeś do niej od nas. Nie przekazujemy pracowni Twoich danych kontaktowych.' },
        { h: 'Jak długo', p: 'Zapytania przechowujemy do 3 lat od ostatniego kontaktu, chyba że wcześniej poprosisz o ich usunięcie. Zapisy kliknięć i statystyki są anonimowe.' },
        { h: 'Komu przekazujemy', p: 'Dane przechowuje nasz dostawca infrastruktury (Supabase, serwery w UE). Nie sprzedajemy danych i nie przekazujemy ich do celów reklamowych.' },
        { h: 'Twoje prawa', p: 'Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia oraz sprzeciwu. Zgodę możesz cofnąć w każdej chwili. Skargę można złożyć do Prezesa UODO.' },
      ],
    },
    cookies: {
      title: 'Cookies i lokalne dane',
      updated: 'Aktualizacja: październik 2026',
      blocks: [
        { h: 'Co zapisujemy', p: 'Strona nie używa klasycznych plików cookie do śledzenia. W pamięci przeglądarki (localStorage) zapisujemy: wybrany język, Twoją decyzję o statystykach oraz — po zgodzie — losowy identyfikator sesji dla anonimowych statystyk.' },
        { h: 'Niezbędne', p: '„astrelle_lang” (język strony), „astrelle_consent” (Twoja decyzja). Bez nich strona nie zapamięta ustawień. Nie wymagają zgody.' },
        { h: 'Statystyki (za zgodą)', p: '„astrelle_sid” — losowy ciąg znaków bez powiązania z Tobą. Liczymy odwiedziny, czas na stronie i urządzenia. Dane trafiają na nasz serwer, nie do zewnętrznych narzędzi reklamowych.' },
        { h: 'Przejścia do pracowni', p: 'Kliknięcie w „Zapisz się” lub „Kup” otwiera stronę Wizards of Art. Zapisujemy sam fakt przejścia i jego losowy kod — nic w Twojej przeglądarce. Strona pracowni ma własne cookies i własną politykę.' },
        { h: 'Zewnętrzne zasoby', p: 'Czcionki ładujemy z Google Fonts, a linki „Mapa” prowadzą do Google Maps — te serwisy mają własne polityki.' },
        { h: 'Jak zmienić decyzję', p: 'Wyczyść dane strony w przeglądarce albo kliknij „Cookies · ⚙” w stopce — okno zgody pojawi się ponownie.' },
      ],
    },
    terms: {
      title: 'Zasady',
      updated: 'Aktualizacja: październik 2026',
      blocks: [
        { h: 'Czym jest ta strona', p: 'Astrelle to marka ceramiczki Stasi Kulik. Strona przedstawia zajęcia, które odbywają się w pracowni Wizards of Art w Warszawie, i prowadzi do zapisu na jej stronie.' },
        { h: 'Kto sprzedaje', p: 'Organizatorem i sprzedawcą zajęć oraz voucherów jest Wizards of Art. Umowę zawierasz z pracownią, na jej stronie i według jej regulaminu. Astrelle nie przyjmuje zapisów ani płatności za zajęcia.' },
        { h: 'Ceny i opisy', p: 'Ceny i opisy pochodzą z oferty pracowni i mają charakter informacyjny. Wiążąca jest cena i dostępność podana na stronie Wizards of Art w chwili zapisu.' },
        { h: 'Zmiana i odwołanie terminu', p: 'Obowiązują zasady pracowni: termin można zmienić lub odwołać najpóźniej 24 godziny przed zajęciami; później opłata nie podlega zwrotowi.' },
        { h: 'Vouchery i reklamacje', p: 'Vouchery są ważne 3 miesiące od zakupu. Zwroty i reklamacje zajęć oraz voucherów rozpatruje pracownia Wizards of Art.' },
        { h: 'Kontakt', p: '{company}, {email}. Zajęcia: {address}.' },
      ],
    },
  },
}
