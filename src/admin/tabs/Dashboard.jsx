import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { BookingRow } from './Crm.jsx'
import { fmtTime, dayKey } from '../ui.jsx'

// "Today": what needs an answer, what happens today, the week ahead.
export default function Dashboard() {
  const { token, admin } = useAdmin()
  const [crm, setCrm] = useState({ clients: [], bookings: [], leads: [] })
  const [cal, setCal] = useState({ events: [] })
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    Promise.all([
      callFn('admin-crm', { action: 'overview', token }),
      callFn('admin-calendar', { action: 'overview', token, from: new Date(Date.now() - 864e5).toISOString(), to: new Date(Date.now() + 14 * 864e5).toISOString() }),
      callFn('admin-content', { action: 'settings.get', token }),
    ]).then(([c, k, s]) => {
      if (c.ok) setCrm(c.data)
      if (k.ok) setCal(k.data)
      if (s.ok) setSettings(s.data.settings || {})
      setLoading(false)
    })
  }, [token])
  useEffect(() => { load() }, [load])

  const evById = useMemo(() => Object.fromEntries((cal.events || []).map((e) => [e.id, e])), [cal.events])
  const pending = crm.bookings.filter((b) => b.status === 'pending')
  const waitlist = crm.bookings.filter((b) => b.status === 'waitlist')
  const newLeads = crm.leads.filter((l) => l.status === 'new')
  const now = new Date()
  const today = dayKey(now)
  const todayEvents = (cal.events || []).filter((e) => dayKey(new Date(e.starts_at)) === today)
  const week = (cal.events || []).filter((e) => new Date(e.starts_at) > now && new Date(e.starts_at) < new Date(Date.now() + 7 * 864e5))
  const weekSeats = week.reduce((s, e) => s + e.capacity, 0)
  const weekBooked = week.reduce((s, e) => s + crm.bookings.filter((b) => b.event_id === e.id && ['confirmed', 'attended'].includes(b.status)).reduce((x, b) => x + b.people, 0), 0)
  const stale = pending.filter((b) => Date.now() - new Date(b.created_at) > 24 * 3600e3)
  const missingEmail = !settings.studio?.email

  const hour = now.getHours()
  const hi = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div className="dash">
      <div className="ahead">
        <div>
          <h2>{hi}, {admin.display_name}</h2>
          <p>{now.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="ahead__act">
          <Link className="abtn" to="/admin/kalendarz?add=1">+ Добавить занятие</Link>
          <Link className="abtn abtn--ghost" to="/admin/klienci">CRM</Link>
        </div>
      </div>

      {stale.length > 0 && (
        <div className="dash__todo">
          ⏰ {stale.length} {stale.length === 1 ? 'заявка ждёт ответа' : 'заявки ждут ответа'} больше 24 ч — <Link to="/admin/klienci">ответить</Link>
        </div>
      )}
      {missingEmail && (
        <div className="dash__todo">
          ✎ В политике конфиденциальности пусто поле e-mail — <Link to="/admin/ustawienia">заполнить данные студии</Link>
        </div>
      )}

      <div className="dash__stats">
        <Link className={`dash__stat ${pending.length ? 'is-hot' : ''}`} to="/admin/klienci"><b>{pending.length}</b><span>новых заявок</span></Link>
        <Link className={`dash__stat ${newLeads.length ? 'is-hot' : ''}`} to="/admin/klienci/leady"><b>{newLeads.length}</b><span>новых сообщений</span></Link>
        <Link className="dash__stat" to="/admin/kalendarz"><b>{todayEvents.length}</b><span>занятий сегодня</span></Link>
        <div className="dash__stat"><b>{weekBooked}/{weekSeats}</b><span>мест занято на 7 дней</span></div>
        <div className="dash__stat"><b>{waitlist.length}</b><span>в листе ожидания</span></div>
        <Link className="dash__stat" to="/admin/klienci/klienci"><b>{crm.clients.length}</b><span>клиентов в базе</span></Link>
      </div>

      <div className="dash__grid">
        <div className="acard">
          <h4>Ждут ответа</h4>
          {loading ? <p className="aempty">Загрузка…</p> : pending.length === 0 ? <p className="aempty">Все заявки обработаны ✓</p> : (
            <div className="crm__rows">
              {pending.slice(0, 8).map((b) => <BookingRow key={b.id} b={b} ev={evById[b.event_id] || b.event} onChange={load} />)}
              {pending.length > 8 && <p className="aempty"><Link to="/admin/klienci">ещё {pending.length - 8} →</Link></p>}
            </div>
          )}
        </div>
        <div>
          <div className="acard" style={{ marginBottom: 14 }}>
            <h4>Сегодня</h4>
            {todayEvents.length === 0 ? <p className="aempty">Занятий нет.</p> : todayEvents.map((e) => <EventLine key={e.id} e={e} bookings={crm.bookings} />)}
          </div>
          <div className="acard">
            <h4>Ближайшие 7 дней</h4>
            {week.length === 0 ? <p className="aempty">Пусто — <Link to="/admin/kalendarz">добавь окна</Link>.</p> : week.slice(0, 10).map((e) => <EventLine key={e.id} e={e} bookings={crm.bookings} withDate />)}
          </div>
          {newLeads.length > 0 && (
            <div className="acard" style={{ marginTop: 14 }}>
              <h4>Новые сообщения</h4>
              {newLeads.slice(0, 5).map((l) => (
                <div className="bk" key={l.id}>
                  <div className="bk__main">
                    <span className="bk__name">{l.name || '—'} <span className="achip">{l.kind}</span></span>
                    <span className="bk__meta">{l.contact}{l.message ? ` · «${l.message.slice(0, 80)}»` : ''}</span>
                  </div>
                </div>
              ))}
              <p className="aempty"><Link to="/admin/klienci/leady">открыть все →</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EventLine({ e, bookings, withDate }) {
  const booked = bookings.filter((b) => b.event_id === e.id && ['confirmed', 'attended'].includes(b.status)).reduce((s, b) => s + b.people, 0)
  const pend = bookings.filter((b) => b.event_id === e.id && b.status === 'pending').length
  const d = new Date(e.starts_at)
  return (
    <div className="bk">
      <div className="bk__main">
        <span className="bk__name">
          {withDate ? `${d.toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'short' })} · ` : ''}{fmtTime(e.starts_at)} — {e.title || (e.type === 'coworking' ? 'Коворкинг' : 'Мастер-класс')}
          {!e.published && <span className="achip">черновик</span>}
        </span>
        <span className="bk__meta">{booked}/{e.capacity} мест{pend ? ` · ${pend} ждут ответа` : ''}{e.price ? ` · ${e.price}` : ''}</span>
      </div>
      <Link className="abtn abtn--ghost abtn--sm" to={`/admin/kalendarz?day=${dayKey(d)}`}>открыть</Link>
    </div>
  )
}
