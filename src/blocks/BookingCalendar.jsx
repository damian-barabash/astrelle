import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useT } from '../i18n/index.jsx'
import { SUPABASE_URL, SUPABASE_KEY, callFn } from '../lib/supabase.js'
import { Kicker } from '../components/Decor.jsx'
import { EventIcon } from '../components/icons.jsx'

// Month/weekday names come from Intl (locale data, not editable content);
// all the visible strings live in the i18n dictionaries under booking.* —
// editable from the admin panel like everything else.
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
const monthName = (lang, y, m) => cap(new Intl.DateTimeFormat(lang, { month: 'long' }).format(new Date(y, m, 1)))
const weekdayNames = (lang) => {
  const fmt = new Intl.DateTimeFormat(lang, { weekday: 'short' })
  // 2024-01-01 is a Monday
  return Array.from({ length: 7 }, (_, i) => cap(fmt.format(new Date(2024, 0, 1 + i)).replace('.', '')))
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

function BookingModal({ event, tt, lang, onClose }) {
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
    else setErr(tt('err'))
  }

  const left = Math.max(0, event.capacity - (event.booked || 0))
  return (
    <div className="bkm" onClick={onClose}>
      <div className="bkm__card" onClick={(e) => e.stopPropagation()}>
        <button className="bkm__x" onClick={onClose} aria-label="×">✕</button>
        {done ? (
          <div className="bkm__done">
            <div className="bkm__check">✓</div>
            <p>{tt('ok')}</p>
            <button className="btn btn--primary" onClick={onClose}>OK</button>
          </div>
        ) : (
          <form onSubmit={submit} className="bkm__form">
            <div className="bkm__ev">
              <span className={`bkm__icon bkm__icon--${event.type}`}>
                <EventIcon icon={event.icon} type={event.type} />
              </span>
              <div>
                <h3>{event.title || tt(event.type === 'coworking' ? 'cw' : 'cls')}</h3>
                <div className="bkm__meta">
                  {new Date(event.starts_at).toLocaleDateString(lang, { day: 'numeric', month: 'long' })} · {fmtTime(event.starts_at, lang)}
                  {event.price ? ' · ' + event.price : ''}
                </div>
                <div className={`bkm__seats ${left === 0 ? 'is-full' : ''}`}>{left === 0 ? tt('full') : `${left} ${tt('free')}`}</div>
              </div>
            </div>
            <label className="af"><span className="af__lbl">{tt('name')}</span><input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label className="af"><span className="af__lbl">{tt('contact')}</span><input value={contact} onChange={(e) => setContact(e.target.value)} required /></label>
            <label className="af"><span className="af__lbl">{tt('people')}</span><input type="number" min="1" max="20" value={people} onChange={(e) => setPeople(Math.max(1, +e.target.value || 1))} /></label>
            <label className="af"><span className="af__lbl">{tt('comment')}</span><textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            {err ? <p className="bkm__err">{err}</p> : null}
            <div className="bkm__actions">
              <button type="button" className="btn btn--ghost" onClick={onClose}>{tt('cancel')}</button>
              <button type="submit" className="btn btn--primary" disabled={busy || !name || !contact}>{busy ? tt('sending') : tt('send')}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function BookingCalendar() {
  const { t, lang } = useT()
  const tt = useCallback((k) => t('booking.' + k), [t])
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [events, setEvents] = useState([])
  const [picked, setPicked] = useState(null)
  const [selDay, setSelDay] = useState(null)
  const listRef = useRef(null)
  const itemRefs = useRef({})

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

  // upcoming list for the visible month, soonest first
  const upcoming = useMemo(
    () => events.slice().sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    [events]
  )

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
  const move = (d) => {
    setSelDay(null)
    setYm(({ y, m }) => {
      const nm = m + d
      return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 }
    })
  }

  // tapping a day with events highlights them in the list below
  const pickDay = (d) => {
    if (!(byDay[d] || []).length) return
    setSelDay(d)
    const first = (byDay[d] || [])[0]
    const el = first && itemRefs.current[first.id]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const wd = useMemo(() => weekdayNames(lang), [lang])
  itemRefs.current = {}

  return (
    <section className="section booking">
      <div className="container">
        <div className="booking__head reveal">
          <Kicker vol="03">{t('booking.kicker')}</Kicker>
          <h2 className="title" style={{ margin: '0 auto' }}>{t('booking.title')}</h2>
          <p className="lead">{t('booking.body')}</p>
        </div>

        <div className="cal reveal" id="booking">
          <div className="cal__bar">
            <button className="cal__nav" onClick={() => move(-1)} aria-label="‹">‹</button>
            <div className="cal__month">{monthName(lang, ym.y, ym.m)} {ym.y}</div>
            <button className="cal__nav" onClick={() => move(1)} aria-label="›">›</button>
          </div>
          <div className="cal__legend">
            <span><i className="cal__dotb cal__dotb--class" />{tt('cls')}</span>
            <span><i className="cal__dotb cal__dotb--coworking" />{tt('cw')}</span>
          </div>
          <div className="cal__wd">{wd.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="cal__grid">
            {cells.map((d, i) => {
              const evs = d != null ? byDay[d] || [] : []
              return (
                <div
                  key={i}
                  className={`cal__cell ${d == null ? 'is-empty' : ''} ${d === todayKey ? 'is-today' : ''} ${evs.length ? 'has-ev' : ''} ${d != null && d === selDay ? 'is-sel' : ''}`}
                  onClick={() => d != null && pickDay(d)}
                >
                  {d != null && <span className="cal__d">{d}</span>}
                  {evs.map((e) => {
                    const left = Math.max(0, e.capacity - (e.booked || 0))
                    return (
                      <button
                        key={e.id}
                        className={`cal__ev cal__ev--${e.type}`}
                        onClick={(ev) => { ev.stopPropagation(); setPicked(e) }}
                      >
                        <span className="cal__ev-ic"><EventIcon icon={e.icon} type={e.type} /></span>
                        <span className="cal__ev-t">{e.title || tt(e.type === 'coworking' ? 'cw' : 'cls')}</span>
                        <span className="cal__ev-time">{fmtTime(e.starts_at, lang)}</span>
                        <span className="cal__ev-seats">{left === 0 ? tt('full') : `${left} ${tt('seats')}`}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
          {events.length === 0 && <p className="cal__empty">{tt('empty')}</p>}
        </div>

        {/* readable list of the month's sessions — the mobile-first way to book */}
        {upcoming.length > 0 && (
          <div className="cal-up reveal" ref={listRef}>
            <div className="cal-up__head">{tt('upcoming')}</div>
            {upcoming.map((e) => {
              const d = new Date(e.starts_at)
              const left = Math.max(0, e.capacity - (e.booked || 0))
              const sel = selDay != null && d.getDate() === selDay
              return (
                <button
                  key={e.id}
                  ref={(el) => { if (el) itemRefs.current[e.id] = el }}
                  className={`cal-up__item ${sel ? 'is-sel' : ''} ${left === 0 ? 'is-full' : ''}`}
                  onClick={() => setPicked(e)}
                >
                  <span className="cal-up__date">
                    <b>{pad(d.getDate())}.{pad(d.getMonth() + 1)}</b>
                    <i>{cap(new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(d).replace('.', ''))}</i>
                  </span>
                  <span className={`cal-up__ic cal-up__ic--${e.type}`}>
                    <EventIcon icon={e.icon} type={e.type} />
                  </span>
                  <span className="cal-up__main">
                    <b>{e.title || tt(e.type === 'coworking' ? 'cw' : 'cls')}{e.theme ? ` · ${e.theme}` : ''}</b>
                    <span>
                      {fmtTime(e.starts_at, lang)}
                      {e.ends_at ? `–${fmtTime(e.ends_at, lang)}` : ''}
                      {' · '}
                      {left === 0 ? tt('full') : `${left} ${tt('free')}`}
                      {e.price ? ` · ${e.price}` : ''}
                    </span>
                  </span>
                  <span className={`cal-up__btn ${left === 0 ? 'is-off' : ''}`}>{tt('book')}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      {/* portal to <body> so the modal centers on the viewport, not inside a transformed panel */}
      {picked && createPortal(
        <BookingModal event={picked} tt={tt} lang={lang} onClose={() => { setPicked(null); load() }} />,
        document.body
      )}
    </section>
  )
}
