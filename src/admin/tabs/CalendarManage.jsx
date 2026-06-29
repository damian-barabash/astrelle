import { useEffect, useState, useCallback } from 'react'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'

const ICONS = ['🏺', '💻', '🍷', '🎬', '🎨', '🔥', '✨', '🌿', '☕']
const emptyEvent = () => ({
  type: 'class', title: '', theme: '', icon: '🏺',
  date: '', start: '18:00', end: '20:00', capacity: 6, price: '', notes: '', published: true,
})

function toISO(date, time) {
  if (!date) return null
  return new Date(`${date}T${time || '00:00'}`).toISOString()
}
function fromISO(iso) {
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return { date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, time: `${p(d.getHours())}:${p(d.getMinutes())}` }
}

function EventForm({ initial, onSave, onCancel, busy }) {
  const [e, setE] = useState(initial)
  const set = (k, v) => setE((p) => ({ ...p, [k]: v }))
  return (
    <form className="cm__form" onSubmit={(ev) => { ev.preventDefault(); onSave(e) }}>
      <div className="cm__row">
        <label className="af"><span className="af__lbl">Тип</span>
          <select value={e.type} onChange={(ev) => set('type', ev.target.value)}>
            <option value="class">Мастер-класс</option>
            <option value="coworking">Коворкинг</option>
          </select>
        </label>
        <label className="af"><span className="af__lbl">Иконка</span>
          <div className="cm__icons">
            {ICONS.map((ic) => (
              <button type="button" key={ic} className={`cm__ic ${e.icon === ic ? 'is-active' : ''}`} onClick={() => set('icon', ic)}>{ic}</button>
            ))}
            <input className="cm__icin" value={e.icon} onChange={(ev) => set('icon', ev.target.value)} maxLength={4} />
          </div>
        </label>
      </div>
      <div className="cm__row">
        <label className="af"><span className="af__lbl">Название</span><input value={e.title} onChange={(ev) => set('title', ev.target.value)} placeholder="напр. Вино и глина" /></label>
        <label className="af"><span className="af__lbl">Тема (для тематических)</span><input value={e.theme} onChange={(ev) => set('theme', ev.target.value)} placeholder="С вином / Кино…" /></label>
      </div>
      <div className="cm__row">
        <label className="af"><span className="af__lbl">Дата</span><input type="date" value={e.date} onChange={(ev) => set('date', ev.target.value)} required /></label>
        <label className="af"><span className="af__lbl">Начало</span><input type="time" value={e.start} onChange={(ev) => set('start', ev.target.value)} /></label>
        <label className="af"><span className="af__lbl">Конец</span><input type="time" value={e.end} onChange={(ev) => set('end', ev.target.value)} /></label>
      </div>
      <div className="cm__row">
        <label className="af"><span className="af__lbl">Мест (макс.)</span><input type="number" min="1" value={e.capacity} onChange={(ev) => set('capacity', ev.target.value)} /></label>
        <label className="af"><span className="af__lbl">Цена</span><input value={e.price} onChange={(ev) => set('price', ev.target.value)} placeholder="напр. 180 zł" /></label>
      </div>
      <label className="af"><span className="af__lbl">Заметки</span><textarea rows={2} value={e.notes} onChange={(ev) => set('notes', ev.target.value)} /></label>
      <div className="cm__formact">
        <button type="button" className="abtn abtn--ghost" onClick={onCancel}>Отмена</button>
        <button type="submit" className="abtn" disabled={busy || !e.date}>{busy ? 'Сохраняю…' : 'Сохранить занятие'}</button>
      </div>
    </form>
  )
}

// Apple Calendar (iCloud CalDAV) is configured on the backend only — no UI here.
// Events/bookings sync automatically; the connection is managed via Supabase.

export default function CalendarManage() {
  const { token } = useAdmin()
  const [data, setData] = useState({ events: [], bookings: [] })
  const [editing, setEditing] = useState(null) // event being edited/created
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    callFn('admin-calendar', { action: 'overview', token }).then((r) => {
      if (r.ok) setData({ events: r.data.events || [], bookings: r.data.bookings || [] })
    })
  }, [token])
  useEffect(() => { load() }, [load])

  const save = async (e) => {
    setBusy(true)
    const event = {
      id: e.id, type: e.type, title: e.title, theme: e.theme, icon: e.icon,
      starts_at: toISO(e.date, e.start), ends_at: toISO(e.date, e.end),
      capacity: e.capacity, price: e.price, notes: e.notes, published: e.published,
    }
    await callFn('admin-calendar', { action: 'event.save', token, event })
    setBusy(false); setEditing(null); load()
  }
  const delEvent = async (id) => {
    if (!confirm('Удалить занятие и все его записи?')) return
    await callFn('admin-calendar', { action: 'event.delete', token, id }); load()
  }
  const setStatus = async (id, status) => {
    await callFn('admin-calendar', { action: 'booking.status', token, id, status }); load()
  }

  const bookingsFor = (eid) => data.bookings.filter((b) => b.event_id === eid)

  return (
    <div className="apad cm">
      <div className="cm__head">
        <div>
          <h2 className="cm__title">Календарь и записи</h2>
          <p className="cm__sub">Открывай даты для коворкинга и тематических мастер-классов. Клиенты оставляют заявки — ты подтверждаешь.</p>
        </div>
        {!editing && <button className="abtn" onClick={() => setEditing(emptyEvent())}>+ Новое занятие</button>}
      </div>

      {editing && (
        <EventForm
          initial={editing.id ? editing : emptyEvent()}
          busy={busy}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="cm__events">
        {data.events.length === 0 && <p className="cm__empty">Пока нет занятий. Создай первое.</p>}
        {data.events.map((e) => {
          const bks = bookingsFor(e.id)
          const confirmed = bks.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.people, 0)
          return (
            <div className="cm__ev" key={e.id}>
              <div className="cm__ev-top">
                <span className="cm__ev-ic">{e.icon || '🏺'}</span>
                <div className="cm__ev-main">
                  <div className="cm__ev-title">{e.title || (e.type === 'coworking' ? 'Коворкинг' : 'Мастер-класс')} {e.theme ? <em>· {e.theme}</em> : null}</div>
                  <div className="cm__ev-meta">
                    {new Date(e.starts_at).toLocaleString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    {' · '}{confirmed}/{e.capacity} мест{e.price ? ' · ' + e.price : ''}{e.published ? '' : ' · скрыто'}
                  </div>
                </div>
                <div className="cm__ev-act">
                  <button className="abtn abtn--ghost abtn--sm" onClick={() => setEditing({ ...e, ...fromISOpair(e) })}>Изм.</button>
                  <button className="abtn abtn--ghost abtn--sm cm__delbtn" onClick={() => delEvent(e.id)}>Удалить</button>
                </div>
              </div>
              {bks.length > 0 && (
                <div className="cm__bks">
                  {bks.map((b) => (
                    <div className={`cm__bk cm__bk--${b.status}`} key={b.id}>
                      <span className="cm__bk-name">{b.name} · {b.people} чел.</span>
                      <span className="cm__bk-contact">{b.contact}</span>
                      {b.comment ? <span className="cm__bk-comment">«{b.comment}»</span> : null}
                      <span className="cm__bk-act">
                        <button className={b.status === 'confirmed' ? 'is-on' : ''} onClick={() => setStatus(b.id, 'confirmed')} title="Подтвердить">✓</button>
                        <button className={b.status === 'declined' ? 'is-on' : ''} onClick={() => setStatus(b.id, 'declined')} title="Отклонить">✕</button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// helper: convert an event's ISO start/end into the form's date/start/end fields
function fromISOpair(e) {
  const s = fromISO(e.starts_at)
  const en = e.ends_at ? fromISO(e.ends_at) : { time: '' }
  return { date: s.date, start: s.time, end: en.time, capacity: e.capacity, price: e.price || '', theme: e.theme || '', notes: e.notes || '', icon: e.icon || '🏺', title: e.title || '', type: e.type, published: e.published }
}
