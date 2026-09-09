// Message templates the admin copies into WhatsApp / SMS / e-mail. Editable in Settings
// (site_settings.messages); these are the defaults. Placeholders: {name} {date} {time}
// {title} {price} {address} {seats}.
export const MESSAGE_KEYS = [
  ['confirm', 'Подтверждение записи'],
  ['decline', 'Отказ / нет мест'],
  ['waitlist', 'Место освободилось'],
  ['reminder', 'Напоминание за день'],
  ['thanks', 'После занятия'],
]

export const DEFAULT_MESSAGES = {
  pl: {
    confirm: 'Cześć {name}! Potwierdzamy Twój zapis: {title}, {date} o {time} ({seats}). Adres: {address}. Płatność na miejscu — {price}. Do zobaczenia w pracowni! ✦ Astrelle',
    decline: 'Cześć {name}! Niestety na termin {date} o {time} nie ma już miejsc. Zajrzyj do kalendarza na astrelle.pl/kalendarz — chętnie znajdziemy inny termin. ✦ Astrelle',
    waitlist: 'Cześć {name}! Zwolniło się miejsce: {title}, {date} o {time}. Daj znać, czy je bierzesz — trzymamy je 24 h. ✦ Astrelle',
    reminder: 'Cześć {name}! Przypominamy: jutro {date} o {time} — {title}. Adres: {address}. Ubierz się wygodnie, resztę mamy. Do jutra! ✦ Astrelle',
    thanks: 'Cześć {name}! Dziękujemy za wizytę w pracowni. Naczynia odbierzesz po wypale — damy znać, gdy będą gotowe (zwykle 2–3 tygodnie). ✦ Astrelle',
  },
  ru: {
    confirm: 'Привет, {name}! Подтверждаем запись: {title}, {date} в {time} ({seats}). Адрес: {address}. Оплата на месте — {price}. До встречи в мастерской! ✦ Astrelle',
    decline: 'Привет, {name}! К сожалению, на {date} в {time} мест уже нет. Загляни в календарь astrelle.pl/kalendarz — с радостью найдём другую дату. ✦ Astrelle',
    waitlist: 'Привет, {name}! Освободилось место: {title}, {date} в {time}. Дай знать, берёшь ли — держим 24 ч. ✦ Astrelle',
    reminder: 'Привет, {name}! Напоминаем: завтра {date} в {time} — {title}. Адрес: {address}. Одевайся удобно, остальное у нас. До завтра! ✦ Astrelle',
    thanks: 'Привет, {name}! Спасибо, что был(а) у нас. Изделия заберёшь после обжига — напишем, когда будут готовы (обычно 2–3 недели). ✦ Astrelle',
  },
  en: {
    confirm: 'Hi {name}! Your booking is confirmed: {title}, {date} at {time} ({seats}). Address: {address}. Payment on site — {price}. See you at the studio! ✦ Astrelle',
    decline: 'Hi {name}! Unfortunately there are no seats left for {date} at {time}. Check astrelle.pl/kalendarz — we will happily find another date. ✦ Astrelle',
    waitlist: 'Hi {name}! A seat has freed up: {title}, {date} at {time}. Let us know if you take it — we hold it for 24 h. ✦ Astrelle',
    reminder: 'Hi {name}! A reminder: tomorrow {date} at {time} — {title}. Address: {address}. Dress comfortably, we have the rest. See you! ✦ Astrelle',
    thanks: 'Hi {name}! Thank you for visiting the studio. Your pieces will be ready after firing — we will let you know (usually 2–3 weeks). ✦ Astrelle',
  },
}

export function fillTemplate(tpl, v) {
  return String(tpl || '').replace(/\{(\w+)\}/g, (_, k) => (v[k] == null || v[k] === '' ? '' : String(v[k]))).replace(/\s{2,}/g, ' ').replace(/\(\s*\)/g, '').trim()
}

// values for a booking + its event
export function messageValues(b, ev, studio, lang = 'pl') {
  const d = ev?.starts_at ? new Date(ev.starts_at) : null
  const title = ev ? ev.title || (ev.type === 'coworking' ? (lang === 'pl' ? 'Coworking' : lang === 'ru' ? 'Коворкинг' : 'Coworking') : lang === 'pl' ? 'Warsztaty' : lang === 'ru' ? 'Мастер-класс' : 'Workshop') : ''
  return {
    name: (b?.name || '').split(' ')[0],
    date: d ? d.toLocaleDateString(lang, { day: 'numeric', month: 'long' }) : '',
    time: d ? d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) : '',
    title,
    price: ev?.price || '',
    address: studio?.address || 'ul. Mała 5a, Warszawa',
    seats: b?.people > 1 ? `${b.people} ${lang === 'pl' ? 'os.' : lang === 'ru' ? 'чел.' : 'people'}` : '',
  }
}
