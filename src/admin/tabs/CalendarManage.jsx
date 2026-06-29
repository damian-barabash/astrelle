import { useEffect, useState, useCallback } from 'react'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'

const ICONS = ['🏺', '🍷', '🎬', '🎨', '🔥', '✨', '🌿', '☕', '💻']
const emptyEvent = () => ({
  type: 'class', title: '', theme: '', icon: '🍷',
  date: '', start: '18:00', end: '20:00', capacity: 6, price: '', notes: '', published: true,
})
const emptySlots = () => ({ type: 'class', date: '', duration: 120, price: '', rows: [{ time: '12:00', capacity: 2 }] })

function toISO(date, time) {
  if (!date) return null
  return new Date(`${date}T${time || '00:00'}`).toISOString()
}
function fromISO(iso) {
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return { date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, time: `${p(d.getHours())}:${p(d.getMinutes())}` }
}

/* ---- thematic master-class (rich one-off event) ---- */
function EventForm({ initial, onSave, onCancel, busy }) {
  const [e, setE] = useState(initial)
  const set = (k, v) => setE((p) => ({ ...p, [k]: v }))
  return (
    <form className="cm__form" onSubmit={(ev) => { ev.preventDefault(); onSave(e) }}>
      <div className="cm__formtitle">Тематический мастер-класс</div>
      <label className="af"><span className="af__lbl">Иконка</span>
        <div className="cm__icons">
          {ICONS.map((ic) => (
            <button type="button" key={ic} className={`cm__ic ${e.icon === ic ? 'is-active' : ''}`} onClick={() => set('icon', ic)}>{ic}</button>
          ))}
          <input className="cm__icin" value={e.icon} onChange={(ev) => set('icon', ev.target.value)} maxLength={4} />
        </div>
      </label>
      <div className="cm__row">
        <label className="af"><span className="af__lbl">Название</span><input value={e.title} onChange={(ev) => set('title', ev.target.value)} placeholder="напр. Вино и глина" /></label>
        <label className="af"><span className="af__lbl">Тема</span><input value={e.theme} onChange={(ev) => set('theme', ev.target.value)} placeholder="С вином / Кино…" /></label>
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
        <button type="submit" className="abtn" disabled={busy || !e.date}>{busy ? 'Сохраняю…' : 'Сохранить мастер-класс'}</button>
      </div>
    </form>
  )
}

/* ---- plain time-slots for one day (master-class hours / coworking) ---- */
function SlotForm({ onSave, onCancel, busy }) {
  const [s, setS] = useState(emptySlots())
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }))
  const setRow = (i, k, v) => setS((p) => { const rows = p.rows.slice(); rows[i] = { ...rows[i], [k]: v }; return { ...p, rows } })
  const addRow = () => setS((p) => ({ ...p, rows: [...p.rows, { time: '', capacity: 2 }] }))
  const delRow = (i) => setS((p) => ({ ...p, rows: p.rows.filter((_, j) => j !== i) }))
  return (
    <form className="cm__form" onSubmit={(ev) => { ev.preventDefault(); onSave(s) }}>
      <div className="cm__formtitle">Обычные окна {s.type === 'coworking' ? '· коворкинг' : '· мастер-класс'}</div>
      <div className="cm__row">
        <label className="af"><span className="af__lbl">Тип</span>
          <select value={s.type} onChange={(e) => set('type', e.target.value)}>
            <option value="class">Мастер-класс (часы)</option>
            <option value="coworking">Коворкинг</option>
          </select>
        </label>
        <label className="af"><span className="af__lbl">Дата</span><input type="date" value={s.date} onChange={(e) => set('date', e.target.value)} required /></label>
        <label className="af"><span className="af__lbl">Длительность</span>
          <select value={s.duration} onChange={(e) => set('duration', +e.target.value)}>
            <option value={60}>1 час</option><option value={90}>1,5 часа</option><option value={120}>2 часа</option><option value={180}>3 часа</option>
          </select>
        </label>
        <label className="af"><span className="af__lbl">Цена (необяз.)</span><input value={s.price} onChange={(e) => set('price', e.target.value)} placeholder="напр. 35 zł" /></label>
      </div>
      <div className="cm__slots">
        <div className="arr__head">Окна на этот день — время · сколько мест</div>
        {s.rows.map((r, i) => (
          <div className="cm__slotrow" key={i}>
            <input type="time" value={r.time} onChange={(e) => setRow(i, 'time', e.target.value)} />
            <input type="number" min="1" value={r.capacity} onChange={(e) => setRow(i, 'capacity', e.target.value)} />
            <span className="cm__slotlbl">мест</span>
            <button type="button" className="cm__slotdel" onClick={() => delRow(i)} disabled={s.rows.length <= 1} title="Убрать">✕</button>
          </div>
        ))}
        <button type="button" className="arr__add" onClick={addRow}>+ ещё окно</button>
      </div>
      <div className="cm__formact">
        <button type="button" className="abtn abtn--ghost" onClick={onCancel}>Отмена</button>
        <button type="submit" className="abtn" disabled={busy || !s.date}>{busy ? 'Создаю…' : 'Создать окна'}</button>
      </div>
    </form>
  )
}

export default function CalendarManage() {
  const { token } = useAdmin()
  const [data, setData] = useState({ events: [], bookings: [] })
  const [editing, setEditing] = useState(null) // thematic event form
  const [slotsOpen, setSlotsOpen] = useState(false) // slot batch form
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
      id: e.id, type: 'class', title: e.title, theme: e.theme, icon: e.icon,
      starts_at: toISO(e.date, e.start), ends_at: toISO(e.date, e.end),
      capacity: e.capacity, price: e.price, notes: e.notes, published: e.published, is_slot: false,
    }
    await callFn('admin-calendar', { action: 'event.save', token, event })
    setBusy(false); setEditing(null); load()
  }
  const saveSlots = async (s) => {
    setBusy(true)
    const slots = s.rows.filter((r) => r.time).map((r) => {
      const start = toISO(s.date, r.time)
      const end = new Date(new Date(start).getTime() + s.duration * 60000).toISOString()
      return { starts_at: start, ends_at: end, capacity: r.capacity }
    })
    await callFn('admin-calendar', { action: 'slots.create', token, type: s.type, price: s.price, slots })
    setBusy(false); setSlotsOpen(false); load()
  }
  const delEvent = async (id) => {
    if (!confirm('Удалить и все его записи?')) return
    await callFn('admin-calendar', { action: 'event.delete', token, id }); load()
  }
  const setStatus = async (id, status) => {
    await callFn('admin-calendar', { action: 'booking.status', token, id, status }); load()
  }
  const bookingsFor = (eid) => data.bookings.filter((b) => b.event_id === eid)
  const formOpen = editing || slotsOpen

  return (
    <div className="apad cm">
      <div className="cm__head">
        <div>
          <h2 className="cm__title">Календарь и записи</h2>
          <p className="cm__sub">
            <b>Тематический мастер-класс</b> — особое событие (вино, кино…) со своим значком и ценой.
            <br /><b>Обычные окна</b> — на выбранный день добавляешь часы (мастер-класс или коворкинг), у каждого окна своё число мест. Клиент выбирает время и записывается — ты подтверждаешь.
          </p>
        </div>
        {!formOpen && (
          <div className="cm__addbtns">
            <button className="abtn" onClick={() => setEditing(emptyEvent())}>+ Тематический МК</button>
            <button className="abtn abtn--ghost" onClick={() => setSlotsOpen(true)}>+ Обычные окна</button>
          </div>
        )}
      </div>

      {editing && <EventForm initial={editing.id ? editing : emptyEvent()} busy={busy} onSave={save} onCancel={() => setEditing(null)} />}
      {slotsOpen && <SlotForm busy={busy} onSave={saveSlots} onCancel={() => setSlotsOpen(false)} />}

      <div className="cm__events">
        {data.events.length === 0 && <p className="cm__empty">Пока нет занятий. Создай тематический мастер-класс или открой обычные окна.</p>}
        {data.events.map((e) => {
          const bks = bookingsFor(e.id)
          const confirmed = bks.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.people, 0)
          const typeLabel = e.type === 'coworking' ? 'Коворкинг' : 'Мастер-класс'
          const icon = e.icon || (e.type === 'coworking' ? '💻' : '🏺')
          return (
            <div className={`cm__ev ${e.is_slot ? 'cm__ev--slot' : ''} ${e.type === 'coworking' ? 'cm__ev--cw' : ''}`} key={e.id}>
              <div className="cm__ev-top">
                <span className="cm__ev-ic">{icon}</span>
                <div className="cm__ev-main">
                  <div className="cm__ev-title">
                    {e.is_slot ? typeLabel : (e.title || typeLabel)}
                    {e.theme ? <em> · {e.theme}</em> : null}
                    {e.is_slot ? <span className="cm__tag">окно</span> : <span className="cm__tag cm__tag--theme">✦ тематический</span>}
                  </div>
                  <div className="cm__ev-meta">
                    {new Date(e.starts_at).toLocaleString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    {' · '}{confirmed}/{e.capacity} мест{e.price ? ' · ' + e.price : ''}
                  </div>
                </div>
                <div className="cm__ev-act">
                  {!e.is_slot && <button className="abtn abtn--ghost abtn--sm" onClick={() => setEditing({ ...e, ...fromISOpair(e) })}>Изм.</button>}
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

function fromISOpair(e) {
  const s = fromISO(e.starts_at)
  const en = e.ends_at ? fromISO(e.ends_at) : { time: '' }
  return { date: s.date, start: s.time, end: en.time, capacity: e.capacity, price: e.price || '', theme: e.theme || '', notes: e.notes || '', icon: e.icon || '🍷', title: e.title || '', type: e.type, published: e.published }
}
