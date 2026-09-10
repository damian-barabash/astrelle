import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { T } from '../content/edit.jsx'
import { listEvents, callFn } from '../lib/supabase.js'
import { EventIcon } from '../components/icons.jsx'

// Month names / weekdays come from Intl; every visible string lives in i18n calendar.*.
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
const pad = (n) => String(n).padStart(2, '0')
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fmtTime = (iso, lang) => new Date(iso).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
const monthName = (lang, y, m) => cap(new Intl.DateTimeFormat(lang, { month: 'long' }).format(new Date(y, m, 1)))
const weekdayNames = (lang) => {
  const fmt = new Intl.DateTimeFormat(lang, { weekday: 'short' })
  return Array.from({ length: 7 }, (_, i) => cap(fmt.format(new Date(2024, 0, 1 + i)).replace('.', '')))
}
const HORIZON_DAYS = 120

function seatsLeft(e) {
  return Math.max(0, e.capacity - (e.booked || 0))
}
function evTitle(e, tt) {
  return e.title || tt(e.type === 'coworking' ? 'cw' : 'cls')
}

/* ---------------- booking modal (portal) ---------------- */
function BookingModal({ event, tt, t, lang, onClose, onDone }) {
  const [f, setF] = useState({ name: '', contact: '', people: 1, comment: '', consent: false })
  const [state, setState] = useState('idle')
  const [err, setErr] = useState('')
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const left = seatsLeft(event)
  const waitlist = left === 0

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const submit = async (e) => {
    e.preventDefault()
    setState('busy')
    setErr('')
    const r = await callFn('book', { event_id: event.id, name: f.name.trim(), contact: f.contact.trim(), people: f.people, comment: f.comment.trim(), consent: true, lang, waitlist })
    if (r.ok && r.data.ok) {
      setState('ok')
      onDone && onDone()
    } else {
      setState('idle')
      setErr(r.data?.error === 'no_seats' ? tt('errSeats') : tt('err'))
    }
  }

  const d = new Date(event.starts_at)
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal__card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="modal__x" onClick={onClose} aria-label="×">✕</button>
        {state === 'ok' ? (
          <div className="modal__done">
            <span className="lead__check">✓</span>
            <p>{waitlist ? tt('okWait') : tt('ok')}</p>
            <button className="btn btn--primary" onClick={onClose}>{tt('done')}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="modal__form">
            <div className="modal__ev">
              <span className={`ev-ic ev-ic--${event.type}`}><EventIcon icon={event.icon} type={event.type} /></span>
              <div>
                <h3>{evTitle(event, tt)}{event.theme ? ` · ${event.theme}` : ''}</h3>
                <div className="modal__meta">
                  {cap(d.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' }))} · {fmtTime(event.starts_at, lang)}
                  {event.ends_at ? `–${fmtTime(event.ends_at, lang)}` : ''}
                  {event.price ? ` · ${event.price}` : ''}
                </div>
                <div className={`modal__seats ${waitlist ? 'is-full' : ''}`}>
                  {waitlist ? `${tt('full')} · ${tt('waitlist')}` : left === 1 ? `1 ${tt('one')}` : `${left} ${tt('free')}`}
                </div>
              </div>
            </div>
            <div className="lead__fields">
              <label className="field"><span>{tt('name')}</span><input value={f.name} onChange={(e) => set('name', e.target.value)} required autoComplete="name" /></label>
              <label className="field"><span>{tt('contact')}</span><input value={f.contact} onChange={(e) => set('contact', e.target.value)} required autoComplete="tel" /></label>
              <label className="field"><span>{tt('people')}</span><input type="number" min="1" max={waitlist ? 20 : Math.max(1, left)} value={f.people} onChange={(e) => set('people', Math.max(1, +e.target.value || 1))} /></label>
              <label className="field"><span>{tt('comment')}</span><input value={f.comment} onChange={(e) => set('comment', e.target.value)} /></label>
            </div>
            <label className="check">
              <input type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} required />
              <span>{tt('consent')} <NavLink to="/polityka-prywatnosci" onClick={onClose}>({t('footer.privacy')})</NavLink></span>
            </label>
            {err ? <p className="form__err">{err}</p> : null}
            <div className="modal__actions">
              <button type="button" className="btn" onClick={onClose}>{tt('cancel')}</button>
              <button type="submit" className="btn btn--primary" disabled={state === 'busy' || !f.name.trim() || !f.contact.trim() || !f.consent}>
                {state === 'busy' ? tt('sending') : waitlist ? tt('waitlist') : tt('send')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ---------------- calendar ---------------- */
export default function BookingCalendar() {
  const { t, lang } = useT()
  const tt = useCallback((k) => t('calendar.' + k), [t])
  const now = useMemo(() => new Date(), [])
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [filter, setFilter] = useState('all')
  const [events, setEvents] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [picked, setPicked] = useState(null)
  const [selDay, setSelDay] = useState(null)
  const listRef = useRef(null)

  // tapping a day with sessions selects it and glides down to its list (phone & desktop)
  const pickDay = useCallback((k) => {
    setSelDay((cur) => (cur === k ? null : k))
  }, [])
  useEffect(() => {
    if (!selDay || !listRef.current) return
    const id = setTimeout(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    return () => clearTimeout(id)
  }, [selDay])

  // one fetch for the whole booking horizon (today → +120 days)
  const load = useCallback(() => {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to = new Date(now.getTime() + HORIZON_DAYS * 864e5)
    listEvents(from.toISOString(), to.toISOString())
      .then((rows) => { setEvents(rows); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [now])
  useEffect(() => { load() }, [load])

  const visible = useMemo(() => events.filter((e) => filter === 'all' || e.type === filter), [events, filter])
  const byDay = useMemo(() => {
    const map = {}
    for (const e of visible) (map[dayKey(new Date(e.starts_at))] = map[dayKey(new Date(e.starts_at))] || []).push(e)
    return map
  }, [visible])

  const monthEvents = useMemo(
    () => visible.filter((e) => { const d = new Date(e.starts_at); return d.getFullYear() === ym.y && d.getMonth() === ym.m }),
    [visible, ym]
  )
  const listed = useMemo(() => {
    const src = selDay ? visible.filter((e) => dayKey(new Date(e.starts_at)) === selDay) : monthEvents
    return src.slice().sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
  }, [visible, monthEvents, selDay])

  const cells = useMemo(() => {
    const first = new Date(ym.y, ym.m, 1)
    const startDow = (first.getDay() + 6) % 7
    const days = new Date(ym.y, ym.m + 1, 0).getDate()
    const arr = []
    for (let i = 0; i < startDow; i++) arr.push(null)
    for (let d = 1; d <= days; d++) arr.push(new Date(ym.y, ym.m, d))
    while (arr.length % 7) arr.push(null)
    return arr
  }, [ym])

  const minYm = { y: now.getFullYear(), m: now.getMonth() }
  const maxDate = new Date(now.getTime() + HORIZON_DAYS * 864e5)
  const canPrev = ym.y > minYm.y || (ym.y === minYm.y && ym.m > minYm.m)
  const canNext = ym.y < maxDate.getFullYear() || (ym.y === maxDate.getFullYear() && ym.m < maxDate.getMonth())
  const move = (d) => {
    setSelDay(null)
    setYm(({ y, m }) => { const nm = m + d; return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 } })
  }
  const todayKey = dayKey(now)
  const wd = useMemo(() => weekdayNames(lang), [lang])

  // group the list by day for readable headers
  const groups = useMemo(() => {
    const out = []
    for (const e of listed) {
      const k = dayKey(new Date(e.starts_at))
      const g = out[out.length - 1]
      if (g && g.k === k) g.items.push(e)
      else out.push({ k, d: new Date(e.starts_at), items: [e] })
    }
    return out
  }, [listed])

  return (
    <div className="cal">
      <div className="cal__top">
        <div className="seg" role="tablist">
          {[['all', 'all'], ['class', 'classes'], ['coworking', 'cowork']].map(([v, k]) => (
            <button key={v} type="button" className={filter === v ? 'is-active' : ''} onClick={() => { setFilter(v); setSelDay(null) }} role="tab" aria-selected={filter === v}>
              {tt(k)}
            </button>
          ))}
        </div>
        <div className="cal__nav">
          <button type="button" className="cal__arrow" onClick={() => move(-1)} disabled={!canPrev} aria-label="‹">‹</button>
          <span className="cal__month">{monthName(lang, ym.y, ym.m)} <em>{ym.y}</em></span>
          <button type="button" className="cal__arrow" onClick={() => move(1)} disabled={!canNext} aria-label="›">›</button>
        </div>
      </div>

      <div className="cal__wd">{wd.map((w) => <span key={w}>{w}</span>)}</div>
      <div className="cal__grid">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="cal__cell is-empty" />
          const k = dayKey(d)
          const evs = byDay[k] || []
          const past = d < new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const cls = ['cal__cell', k === todayKey && 'is-today', evs.length && 'has-ev', k === selDay && 'is-sel', past && 'is-past'].filter(Boolean).join(' ')
          return (
            <div key={i} className={cls} onClick={() => evs.length && pickDay(k)} role={evs.length ? 'button' : undefined} tabIndex={evs.length ? 0 : undefined} onKeyDown={(e) => e.key === 'Enter' && evs.length && pickDay(k)}>
              <span className="cal__d">{d.getDate()}</span>
              <div className="cal__evs">
                {evs.slice(0, 3).map((e) => {
                  const left = seatsLeft(e)
                  return (
                    <button key={e.id} type="button" className={`cal__ev cal__ev--${e.type} ${left === 0 ? 'is-full' : ''}`} onClick={(ev) => { ev.stopPropagation(); setPicked(e) }} title={evTitle(e, tt)}>
                      <span className="cal__ev-time">{fmtTime(e.starts_at, lang)}</span>
                      <span className="cal__ev-title">{evTitle(e, tt)}</span>
                    </button>
                  )
                })}
                {evs.length > 3 && <span className="cal__more">+{evs.length - 3}</span>}
              </div>
              {/* phone: the admin-picked icons instead of text pills */}
              {evs.length > 0 && (
                <span className="cal__minis" aria-hidden="true">
                  {evs.slice(0, 3).map((e) => (
                    <i key={e.id} className={`cal__mini cal__mini--${e.type} ${seatsLeft(e) === 0 ? 'is-full' : ''}`}><EventIcon icon={e.icon} type={e.type} /></i>
                  ))}
                  {evs.length > 3 && <b className="cal__mini-more">+{evs.length - 3}</b>}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="cal__list" ref={listRef}>
        <div className="cal__list-head">
          <span className="label">{selDay ? cap(new Date(selDay).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' })) : tt('upcoming')}</span>
          {selDay && <button type="button" className="cal__clear" onClick={() => setSelDay(null)}>{tt('all')} ✕</button>}
        </div>
        {!loaded ? (
          <p className="cal__empty">…</p>
        ) : groups.length === 0 ? (
          <p className="cal__empty">{tt('empty')}</p>
        ) : (
          groups.map((g) => (
            <div className="cal__day" key={g.k}>
              <div className="cal__day-badge">
                <b>{g.d.getDate()}</b>
                <i>{cap(new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(g.d).replace('.', ''))}</i>
              </div>
              <div className="cal__day-items">
                {g.items.map((e) => {
                  const left = seatsLeft(e)
                  return (
                    <button key={e.id} type="button" className={`cal__item ${left === 0 ? 'is-full' : ''}`} onClick={() => setPicked(e)}>
                      <span className={`ev-ic ev-ic--${e.type}`}><EventIcon icon={e.icon} type={e.type} /></span>
                      <span className="cal__item-main">
                        <b>{evTitle(e, tt)}{e.theme ? ` · ${e.theme}` : ''}</b>
                        <span>
                          {fmtTime(e.starts_at, lang)}{e.ends_at ? `–${fmtTime(e.ends_at, lang)}` : ''}
                          {' · '}
                          {left === 0 ? tt('full') : left === 1 ? `1 ${tt('one')}` : `${left} ${tt('free')}`}
                          {e.price ? ` · ${e.price}` : ''}
                        </span>
                      </span>
                      <span className="cal__item-btn">{left === 0 ? tt('waitlist') : tt('book')} →</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {picked && createPortal(<BookingModal event={picked} tt={tt} t={t} lang={lang} onClose={() => setPicked(null)} onDone={load} />, document.body)}
    </div>
  )
}

/* ---------------- "how it works" mini strip used above the calendar ---------------- */
export function CalendarSteps() {
  const { t } = useT()
  const how = t('calendar.how') || []
  return (
    <ol className="calsteps">
      {how.map((s, i) => (
        <li key={i}><span>{pad(i + 1)}</span>{s}</li>
      ))}
    </ol>
  )
}
