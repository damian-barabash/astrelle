import { useEffect, useMemo, useState, useCallback } from 'react'
import { useT } from '../i18n/index.jsx'
import { SUPABASE_URL, SUPABASE_KEY, callFn } from '../lib/supabase.js'
import { Kicker } from '../components/Decor.jsx'

const COPY = {
  ru: {
    months: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    wd: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    free: 'мест свободно', full: 'Мест нет', seats: 'мест',
    book: 'Записаться', name: 'Имя', contact: 'Телефон или e-mail', people: 'Сколько человек', comment: 'Комментарий (необязательно)',
    send: 'Отправить заявку', sending: 'Отправляю…', cancel: 'Отмена',
    ok: 'Заявка отправлена! Мы свяжемся с вами, чтобы подтвердить.', empty: 'В этом месяце пока нет занятий. Загляни позже или напиши нам.',
    cw: 'Коворкинг', cls: 'Мастер-класс', err: 'Не удалось отправить. Попробуйте ещё раз.',
  },
  pl: {
    months: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
    wd: ['Pn','Wt','Śr','Cz','Pt','So','Nd'],
    free: 'wolnych miejsc', full: 'Brak miejsc', seats: 'miejsc',
    book: 'Zapisz się', name: 'Imię', contact: 'Telefon lub e-mail', people: 'Ile osób', comment: 'Komentarz (opcjonalnie)',
    send: 'Wyślij zgłoszenie', sending: 'Wysyłam…', cancel: 'Anuluj',
    ok: 'Zgłoszenie wysłane! Skontaktujemy się, aby potwierdzić.', empty: 'W tym miesiącu nie ma jeszcze zajęć. Zajrzyj później lub napisz do nas.',
    cw: 'Coworking', cls: 'Kurs', err: 'Nie udało się wysłać. Spróbuj ponownie.',
  },
  en: {
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    wd: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    free: 'seats left', full: 'Fully booked', seats: 'seats',
    book: 'Book', name: 'Name', contact: 'Phone or e-mail', people: 'How many people', comment: 'Comment (optional)',
    send: 'Send request', sending: 'Sending…', cancel: 'Cancel',
    ok: 'Request sent! We will contact you to confirm.', empty: 'No sessions this month yet. Check back later or message us.',
    cw: 'Coworking', cls: 'Class', err: 'Could not send. Please try again.',
  },
}

const pad = (n) => String(n).padStart(2, '0')
function monthRange(y, m) {
  const from = new Date(Date.UTC(y, m, 1))
  const to = new Date(Date.UTC(y, m + 1, 1))
  return [from.toISOString(), to.toISOString()]
}
function fmtTime(iso, lang) {
  const d = new Date(iso)
  return d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
}

function BookingModal({ event, c, lang, onClose }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [people, setPeople] = useState(1)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    const r = await callFn('book', { event_id: event.id, name: name.trim(), contact: contact.trim(), people, comment: comment.trim() })
    setBusy(false)
    if (r.ok && r.data.ok) setDone(true)
    else setErr(c.err)
  }

  const left = Math.max(0, event.capacity - (event.booked || 0))
  return (
    <div className="bkm" onClick={onClose}>
      <div className="bkm__card" onClick={(e) => e.stopPropagation()}>
        <button className="bkm__x" onClick={onClose} aria-label="×">✕</button>
        {done ? (
          <div className="bkm__done">
            <div className="bkm__check">✓</div>
            <p>{c.ok}</p>
            <button className="btn btn--primary" onClick={onClose}>OK</button>
          </div>
        ) : (
          <form onSubmit={submit} className="bkm__form">
            <div className="bkm__ev">
              <span className="bkm__icon">{event.icon || (event.type === 'coworking' ? '💻' : '🏺')}</span>
              <div>
                <h3>{event.title || (event.type === 'coworking' ? c.cw : c.cls)}</h3>
                <div className="bkm__meta">
                  {new Date(event.starts_at).toLocaleDateString(lang, { day: 'numeric', month: 'long' })} · {fmtTime(event.starts_at, lang)}
                  {event.price ? ' · ' + event.price : ''}
                </div>
                <div className={`bkm__seats ${left === 0 ? 'is-full' : ''}`}>{left === 0 ? c.full : `${left} ${c.free}`}</div>
              </div>
            </div>
            <label className="af"><span className="af__lbl">{c.name}</span><input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label className="af"><span className="af__lbl">{c.contact}</span><input value={contact} onChange={(e) => setContact(e.target.value)} required /></label>
            <label className="af"><span className="af__lbl">{c.people}</span><input type="number" min="1" max="20" value={people} onChange={(e) => setPeople(Math.max(1, +e.target.value || 1))} /></label>
            <label className="af"><span className="af__lbl">{c.comment}</span><textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            {err ? <p className="bkm__err">{err}</p> : null}
            <div className="bkm__actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>{c.cancel}</button>
              <button type="submit" className="btn btn--primary" disabled={busy || !name || !contact}>{busy ? c.sending : c.send}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function BookingCalendar() {
  const { t, lang } = useT()
  const c = COPY[lang] || COPY.ru
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [events, setEvents] = useState([])
  const [picked, setPicked] = useState(null)

  const load = useCallback(() => {
    const [from, to] = monthRange(ym.y, ym.m)
    fetch(`${SUPABASE_URL}/rest/v1/rpc/list_events`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_from: from, p_to: to }),
    })
      .then((r) => r.json())
      .then((rows) => setEvents(Array.isArray(rows) ? rows : []))
      .catch(() => setEvents([]))
  }, [ym])
  useEffect(() => { load() }, [load])

  // group events by day-of-month
  const byDay = useMemo(() => {
    const map = {}
    for (const e of events) {
      const d = new Date(e.starts_at)
      const key = d.getDate()
      ;(map[key] = map[key] || []).push(e)
    }
    return map
  }, [events])

  // build the month grid (Mon-first)
  const cells = useMemo(() => {
    const first = new Date(ym.y, ym.m, 1)
    const startDow = (first.getDay() + 6) % 7 // Mon=0
    const days = new Date(ym.y, ym.m + 1, 0).getDate()
    const arr = []
    for (let i = 0; i < startDow; i++) arr.push(null)
    for (let d = 1; d <= days; d++) arr.push(d)
    return arr
  }, [ym])

  const todayKey = now.getFullYear() === ym.y && now.getMonth() === ym.m ? now.getDate() : -1
  const move = (d) => setYm(({ y, m }) => {
    const nm = m + d
    return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 }
  })

  return (
    <section className="section booking" id="booking">
      <div className="container">
        <div className="booking__head reveal">
          <Kicker vol="11">{t('booking.kicker')}</Kicker>
          <h2 className="title" style={{ margin: '0 auto' }}>{t('booking.title')}</h2>
          <p className="lead">{t('booking.body')}</p>
        </div>

        <div className="cal reveal">
          <div className="cal__bar">
            <button className="cal__nav" onClick={() => move(-1)} aria-label="‹">‹</button>
            <div className="cal__month">{c.months[ym.m]} {ym.y}</div>
            <button className="cal__nav" onClick={() => move(1)} aria-label="›">›</button>
          </div>
          <div className="cal__wd">{c.wd.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="cal__grid">
            {cells.map((d, i) => (
              <div key={i} className={`cal__cell ${d == null ? 'is-empty' : ''} ${d === todayKey ? 'is-today' : ''}`}>
                {d != null && <span className="cal__d">{d}</span>}
                {d != null && (byDay[d] || []).map((e) => {
                  const left = Math.max(0, e.capacity - (e.booked || 0))
                  return (
                    <button key={e.id} className={`cal__ev cal__ev--${e.type}`} onClick={() => setPicked(e)}>
                      <span className="cal__ev-ic">{e.icon || (e.type === 'coworking' ? '💻' : '🏺')}</span>
                      <span className="cal__ev-t">{e.title || (e.type === 'coworking' ? c.cw : c.cls)}</span>
                      <span className="cal__ev-time">{fmtTime(e.starts_at, lang)}{left === 0 ? ' · ' + c.full : ` · ${left} ${c.seats}`}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          {events.length === 0 && <p className="cal__empty">{c.empty}</p>}
        </div>
      </div>
      {picked && <BookingModal event={picked} c={c} lang={lang} onClose={() => { setPicked(null); load() }} />}
    </section>
  )
}
