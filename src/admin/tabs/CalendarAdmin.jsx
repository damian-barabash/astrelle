import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { EventIcon, ICON_KEYS } from '../../components/icons.jsx'
import { Modal, useToast, dayKey, toISO, fromISO, fmtTime, useSiteSettings } from '../ui.jsx'
import { BookingRow, ManualBookingModal } from './Crm.jsx'

export const DEFAULT_TEMPLATES = [
  { name: 'Warsztat 2 h', type: 'class', title: 'Warsztaty', icon: 'mug', duration: 120, capacity: 6, price: '180 zł' },
  { name: 'Coworking 3 h', type: 'coworking', title: '', icon: 'laptop', duration: 180, capacity: 4, price: '35 zł/h' },
  { name: 'Wino i glina', type: 'class', title: 'Wino i glina', theme: 'z winem', icon: 'wine', duration: 150, capacity: 8, price: '220 zł' },
  { name: 'Kurs · spotkanie', type: 'class', title: 'Kurs', icon: 'vase', duration: 180, capacity: 5, price: '' },
]
const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const addMin = (iso, min) => new Date(new Date(iso).getTime() + min * 60000).toISOString()
const minutesBetween = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 60000) : 120)

/* ---------------- add / edit modal: single · slots · series ---------------- */
function EventModal({ initial, date, templates, onClose, onSaved }) {
  const { token } = useAdmin()
  const [mode, setMode] = useState(initial?.id ? 'single' : 'single')
  const [e, setE] = useState(() => initial || { type: 'class', title: 'Warsztaty', theme: '', icon: 'mug', date: date || dayKey(new Date()), start: '18:00', duration: 120, capacity: 6, price: '180 zł', notes: '', published: true })
  const [slots, setSlots] = useState([{ time: '11:00', capacity: 4 }, { time: '15:00', capacity: 4 }, { time: '18:00', capacity: 4 }])
  const [series, setSeries] = useState({ days: [1, 3], weeks: 4, from: date || dayKey(new Date()) })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setE((p) => ({ ...p, [k]: v }))
  const applyTpl = (t) => setE((p) => ({ ...p, type: t.type, title: t.title || '', theme: t.theme || '', icon: t.icon || 'mug', duration: t.duration || 120, capacity: t.capacity || 6, price: t.price || '' }))

  const base = () => ({ type: e.type, title: e.title, theme: e.theme, icon: e.icon, capacity: e.capacity, price: e.price, notes: e.notes, published: e.published, is_slot: false })
  const seriesDates = useMemo(() => {
    const out = []
    const start = new Date(series.from + 'T00:00')
    for (let i = 0; i < series.weeks * 7; i++) {
      const d = new Date(start.getTime() + i * 864e5)
      if (series.days.includes((d.getDay() + 6) % 7)) out.push(dayKey(d))
    }
    return out
  }, [series])

  const submit = async (ev) => {
    ev.preventDefault()
    setBusy(true)
    let r
    if (mode === 'single') {
      const starts_at = toISO(e.date, e.start)
      r = await callFn('admin-calendar', { action: 'event.save', token, event: { ...base(), id: e.id, starts_at, ends_at: addMin(starts_at, e.duration) } })
    } else if (mode === 'slots') {
      const rows = slots.filter((s) => s.time).map((s) => { const st = toISO(e.date, s.time); return { ...base(), is_slot: true, capacity: s.capacity, starts_at: st, ends_at: addMin(st, e.duration) } })
      r = await callFn('admin-calendar', { action: 'events.create_many', token, rows })
    } else {
      const rows = seriesDates.map((d) => { const st = toISO(d, e.start); return { ...base(), starts_at: st, ends_at: addMin(st, e.duration) } })
      r = await callFn('admin-calendar', { action: 'events.create_many', token, rows })
    }
    setBusy(false)
    if (r.ok) { onSaved(); onClose() }
  }

  return (
    <Modal title={e.id ? 'Изменить занятие' : 'Новое занятие'} onClose={onClose}>
      {!e.id && (
        <div className="aseg">
          {[['single', 'Одно занятие'], ['slots', 'Несколько окон в день'], ['series', 'Серия по расписанию']].map(([k, l]) => <button key={k} type="button" className={mode === k ? 'is-active' : ''} onClick={() => setMode(k)}>{l}</button>)}
        </div>
      )}
      <div className="cad__tpl">
        {templates.map((t, i) => <button key={i} type="button" className="cad__tplbtn" onClick={() => applyTpl(t)}>{t.name}</button>)}
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="arow">
          <label className="af"><span className="af__lbl">Тип</span>
            <select value={e.type} onChange={(ev) => set('type', ev.target.value)}><option value="class">Мастер-класс</option><option value="coworking">Коворкинг</option></select>
          </label>
          <label className="af"><span className="af__lbl">Название (на сайте)</span><input value={e.title} onChange={(ev) => set('title', ev.target.value)} placeholder="Warsztaty / Wino i glina…" /></label>
          <label className="af"><span className="af__lbl">Тема (необяз.)</span><input value={e.theme} onChange={(ev) => set('theme', ev.target.value)} placeholder="z winem, kubki…" /></label>
        </div>
        <div className="af"><span className="af__lbl">Значок</span>
          <div className="icons">{ICON_KEYS.map((k) => <button type="button" key={k} className={e.icon === k ? 'is-active' : ''} onClick={() => set('icon', k)}><EventIcon icon={k} /></button>)}</div>
        </div>

        {mode === 'single' && (
          <div className="arow">
            <label className="af"><span className="af__lbl">Дата</span><input type="date" value={e.date} onChange={(ev) => set('date', ev.target.value)} required /></label>
            <label className="af"><span className="af__lbl">Начало</span><input type="time" value={e.start} onChange={(ev) => set('start', ev.target.value)} required /></label>
            <DurationField value={e.duration} onChange={(v) => set('duration', v)} />
            <label className="af"><span className="af__lbl">Мест</span><input type="number" min="1" value={e.capacity} onChange={(ev) => set('capacity', +ev.target.value || 1)} /></label>
          </div>
        )}
        {mode === 'slots' && (
          <>
            <div className="arow">
              <label className="af"><span className="af__lbl">Дата</span><input type="date" value={e.date} onChange={(ev) => set('date', ev.target.value)} required /></label>
              <DurationField value={e.duration} onChange={(v) => set('duration', v)} />
            </div>
            <div className="slots">
              <span className="af__lbl">Окна: время · мест</span>
              {slots.map((s, i) => (
                <div className="slots__row" key={i}>
                  <input type="time" value={s.time} onChange={(ev) => setSlots((p) => p.map((x, j) => (j === i ? { ...x, time: ev.target.value } : x)))} />
                  <input type="number" min="1" value={s.capacity} onChange={(ev) => setSlots((p) => p.map((x, j) => (j === i ? { ...x, capacity: +ev.target.value || 1 } : x)))} />
                  <button type="button" className="slots__del" onClick={() => setSlots((p) => p.filter((_, j) => j !== i))} disabled={slots.length <= 1}>✕</button>
                </div>
              ))}
              <button type="button" className="aadd" onClick={() => setSlots((p) => [...p, { time: '', capacity: 4 }])}>+ ещё окно</button>
            </div>
          </>
        )}
        {mode === 'series' && (
          <>
            <div className="af"><span className="af__lbl">Дни недели</span>
              <div className="wdays">{WD.map((w, i) => <button type="button" key={i} className={series.days.includes(i) ? 'is-active' : ''} onClick={() => setSeries((s) => ({ ...s, days: s.days.includes(i) ? s.days.filter((x) => x !== i) : [...s.days, i] }))}>{w}</button>)}</div>
            </div>
            <div className="arow">
              <label className="af"><span className="af__lbl">С даты</span><input type="date" value={series.from} onChange={(ev) => setSeries((s) => ({ ...s, from: ev.target.value }))} /></label>
              <label className="af"><span className="af__lbl">Недель</span><input type="number" min="1" max="26" value={series.weeks} onChange={(ev) => setSeries((s) => ({ ...s, weeks: Math.min(26, Math.max(1, +ev.target.value || 1)) }))} /></label>
              <label className="af"><span className="af__lbl">Начало</span><input type="time" value={e.start} onChange={(ev) => set('start', ev.target.value)} required /></label>
              <DurationField value={e.duration} onChange={(v) => set('duration', v)} />
              <label className="af"><span className="af__lbl">Мест</span><input type="number" min="1" value={e.capacity} onChange={(ev) => set('capacity', +ev.target.value || 1)} /></label>
            </div>
            <div className="preview">Будет создано занятий: <b>{seriesDates.length}</b>{seriesDates.length ? ` (${seriesDates[0]} → ${seriesDates[seriesDates.length - 1]})` : ''}</div>
          </>
        )}

        <div className="arow">
          <label className="af"><span className="af__lbl">Цена (текст на сайте)</span><input value={e.price} onChange={(ev) => set('price', ev.target.value)} placeholder="180 zł" /></label>
          <label className="af"><span className="af__lbl">Заметка (только для тебя)</span><input value={e.notes} onChange={(ev) => set('notes', ev.target.value)} /></label>
        </div>
        <label className="achk"><input type="checkbox" checked={e.published} onChange={(ev) => set('published', ev.target.checked)} /> Показывать на сайте (снять = черновик)</label>
        <div className="amodal__act">
          <button type="button" className="abtn abtn--ghost" onClick={onClose}>Отмена</button>
          <button type="submit" className="abtn" disabled={busy}>{busy ? '…' : e.id ? 'Сохранить' : mode === 'single' ? 'Создать' : 'Создать все'}</button>
        </div>
      </form>
    </Modal>
  )
}

function DurationField({ value, onChange }) {
  return (
    <label className="af"><span className="af__lbl">Длительность</span>
      <select value={value} onChange={(e) => onChange(+e.target.value)}>
        {[60, 90, 120, 150, 180, 240, 300].map((m) => <option key={m} value={m}>{m / 60} ч</option>)}
      </select>
    </label>
  )
}

/* ---------------- one event card in the day panel ---------------- */
function EventCard({ e, bookings, onEdit, onChange }) {
  const { token } = useAdmin()
  const toast = useToast()
  const [manual, setManual] = useState(false)
  const booked = bookings.filter((b) => ['confirmed', 'attended'].includes(b.status)).reduce((s, b) => s + b.people, 0)
  const pct = Math.min(100, Math.round((booked / Math.max(1, e.capacity)) * 100))
  const del = () => {
    if (!confirm('Удалить занятие и все его записи?')) return
    callFn('admin-calendar', { action: 'event.delete', token, id: e.id }).then(onChange)
  }
  const publish = () => callFn('admin-calendar', { action: 'event.publish', token, id: e.id, published: !e.published }).then(() => { toast(e.published ? 'Скрыто с сайта' : 'Опубликовано'); onChange() })
  const copyTo = async () => {
    const d = prompt('Скопировать на дату (ГГГГ-ММ-ДД):', dayKey(new Date(new Date(e.starts_at).getTime() + 7 * 864e5)))
    if (!d) return
    const { time } = fromISO(e.starts_at)
    const st = toISO(d, time)
    const r = await callFn('admin-calendar', { action: 'events.create_many', token, rows: [{ ...e, id: undefined, starts_at: st, ends_at: addMin(st, minutesBetween(e.starts_at, e.ends_at)) }] })
    if (r.ok) { toast('Скопировано'); onChange() }
  }
  return (
    <div className={`cev ${e.published ? '' : 'is-draft'}`}>
      <div className="cev__top">
        <span className={`cev__ic cev__ic--${e.type}`}><EventIcon icon={e.icon} type={e.type} /></span>
        <div className="cev__main">
          <div className="cev__title">{fmtTime(e.starts_at)}{e.ends_at ? `–${fmtTime(e.ends_at)}` : ''} · {e.title || (e.type === 'coworking' ? 'Коворкинг' : 'Мастер-класс')}{e.theme && <em> · {e.theme}</em>}{!e.published && <span className="achip">черновик</span>}</div>
          <div className="cev__meta">{booked}/{e.capacity} мест{e.price ? ` · ${e.price}` : ''}{e.notes ? ` · ${e.notes}` : ''}</div>
        </div>
        <div className="cev__act">
          <button className="bk__ico" title="Изменить" onClick={() => onEdit(e)}>✎</button>
          <button className="bk__ico" title="Копировать на другую дату" onClick={copyTo}>⧉</button>
          <button className="bk__ico" title={e.published ? 'Скрыть с сайта' : 'Опубликовать'} onClick={publish}>{e.published ? '◉' : '○'}</button>
          <button className="bk__ico bk__ico--no" title="Удалить" onClick={del}>🗑</button>
        </div>
      </div>
      <div className={`cev__occ ${pct >= 100 ? 'is-full' : ''}`}><i style={{ width: pct + '%' }} /></div>
      {bookings.length > 0 && (
        <div className="cev__bks">
          {bookings.map((b) => <BookingRow key={b.id} b={b} ev={e} onChange={onChange} showEvent={false} compact />)}
        </div>
      )}
      <button className="aadd" onClick={() => setManual(true)}>+ записать вручную</button>
      {manual && <ManualBookingModal ev={e} onClose={() => setManual(false)} onDone={onChange} />}
    </div>
  )
}

/* ---------------- the tab ---------------- */
export default function CalendarAdmin() {
  const { token } = useAdmin()
  const toast = useToast()
  const settings = useSiteSettings(token)
  const [params, setParams] = useSearchParams()
  const now = new Date()
  const [ym, setYm] = useState(() => { const d = params.get('day'); const x = d ? new Date(d) : now; return { y: x.getFullYear(), m: x.getMonth() } })
  const [sel, setSel] = useState(() => params.get('day') || dayKey(now))
  const [data, setData] = useState({ events: [], bookings: [] })
  const [modal, setModal] = useState(params.get('add') ? { date: sel } : null)
  const [feed, setFeed] = useState('')

  const load = useCallback(() => {
    callFn('admin-calendar', { action: 'overview', token }).then((r) => { if (r.ok) setData({ events: r.data.events || [], bookings: r.data.bookings || [] }) })
  }, [token])
  useEffect(() => { load() }, [load])
  useEffect(() => { callFn('admin-calendar', { action: 'integration.get', token }).then((r) => r.ok && setFeed(r.data.feed || '')) }, [token])
  useEffect(() => { if (params.get('add')) { params.delete('add'); setParams(params, { replace: true }) } }, []) // eslint-disable-line

  const templates = Array.isArray(settings.templates) && settings.templates.length ? settings.templates : DEFAULT_TEMPLATES
  const byDay = useMemo(() => {
    const m = {}
    for (const e of data.events) (m[dayKey(new Date(e.starts_at))] = m[dayKey(new Date(e.starts_at))] || []).push(e)
    for (const k in m) m[k].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    return m
  }, [data.events])
  const bkByEvent = useMemo(() => {
    const m = {}
    for (const b of data.bookings) (m[b.event_id] = m[b.event_id] || []).push(b)
    return m
  }, [data.bookings])

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
  const move = (d) => setYm(({ y, m }) => { const nm = m + d; return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 } })
  const todayKey = dayKey(now)
  const selEvents = byDay[sel] || []
  const monthName = cap(new Date(ym.y, ym.m, 1).toLocaleDateString('ru', { month: 'long' }))

  const editEvent = (e) => {
    const s = fromISO(e.starts_at)
    setModal({ initial: { id: e.id, type: e.type, title: e.title || '', theme: e.theme || '', icon: e.icon || 'mug', date: s.date, start: s.time, duration: minutesBetween(e.starts_at, e.ends_at), capacity: e.capacity, price: e.price || '', notes: e.notes || '', published: e.published } })
  }
  const copyDay = async () => {
    if (!selEvents.length) return
    const d = prompt('Скопировать все занятия этого дня на дату (ГГГГ-ММ-ДД):')
    if (!d) return
    const rows = selEvents.map((e) => { const st = toISO(d, fromISO(e.starts_at).time); return { ...e, id: undefined, starts_at: st, ends_at: addMin(st, minutesBetween(e.starts_at, e.ends_at)) } })
    const r = await callFn('admin-calendar', { action: 'events.create_many', token, rows })
    if (r.ok) { toast(`Скопировано: ${r.data.created}`); load() }
  }
  const clearDay = async () => {
    if (!selEvents.length || !confirm(`Удалить все ${selEvents.length} занятий за ${sel}?`)) return
    await callFn('admin-calendar', { action: 'events.delete_many', token, ids: selEvents.map((e) => e.id) })
    load()
  }

  return (
    <div>
      <div className="ahead">
        <div>
          <h2>Календарь</h2>
          <p>Клик по дню — список занятий и записей справа. «+» — новое занятие, окна на день или серия на несколько недель.</p>
        </div>
        <div className="ahead__act">
          {feed && <button className="abtn abtn--ghost abtn--sm" onClick={() => { navigator.clipboard.writeText(feed.replace('https://', 'webcal://')); toast('Ссылка iCal скопирована — вставь в Apple/Google Calendar') }}>iCal-подписка</button>}
          <button className="abtn" onClick={() => setModal({ date: sel })}>+ Добавить занятие</button>
        </div>
      </div>
      <div className="cad">
        <div>
          <div className="cad__bar">
            <div className="cad__month"><button onClick={() => move(-1)}>‹</button><span>{monthName} {ym.y}</span><button onClick={() => move(1)}>›</button></div>
            <button className="abtn abtn--ghost abtn--sm" onClick={() => { setYm({ y: now.getFullYear(), m: now.getMonth() }); setSel(todayKey) }}>Сегодня</button>
          </div>
          <div className="cad__wd">{WD.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="cad__grid">
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="cad__cell is-empty" />
              const k = dayKey(d)
              const evs = byDay[k] || []
              const past = k < todayKey
              return (
                <div key={i} className={`cad__cell ${k === todayKey ? 'is-today' : ''} ${k === sel ? 'is-sel' : ''} ${past ? 'is-past' : ''}`} onClick={() => setSel(k)}>
                  <span className="cad__d">{d.getDate()}</span>
                  <button className="cad__add" title="Добавить занятие" onClick={(ev) => { ev.stopPropagation(); setSel(k); setModal({ date: k }) }}>+</button>
                  {evs.slice(0, 3).map((e) => {
                    const bks = bkByEvent[e.id] || []
                    const booked = bks.filter((b) => ['confirmed', 'attended'].includes(b.status)).reduce((s, b) => s + b.people, 0)
                    const pend = bks.filter((b) => b.status === 'pending').length
                    return (
                      <div key={e.id} className={`cad__ev cad__ev--${e.type} ${e.published ? '' : 'is-draft'} ${pend ? 'is-hot' : ''}`}>
                        <b>{fmtTime(e.starts_at)}</b> {e.title || (e.type === 'coworking' ? 'Cowork' : 'MK')}<i>{pend ? `${pend}?` : `${booked}/${e.capacity}`}</i>
                      </div>
                    )
                  })}
                  {evs.length > 3 && <span className="cad__more">+{evs.length - 3}</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="cad__panel">
          <div className="cad__panel-head">
            <h3>{cap(new Date(sel).toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' }))}</h3>
            <div className="cev__act">
              {selEvents.length > 0 && <button className="bk__ico" title="Скопировать день" onClick={copyDay}>⧉</button>}
              {selEvents.length > 0 && <button className="bk__ico bk__ico--no" title="Удалить все занятия дня" onClick={clearDay}>🗑</button>}
              <button className="abtn abtn--sm" onClick={() => setModal({ date: sel })}>+</button>
            </div>
          </div>
          {selEvents.length === 0 ? (
            <div className="acard">
              <p className="aempty">В этот день занятий нет.</p>
              <div className="cad__tpl">{templates.map((t, i) => <button key={i} className="cad__tplbtn" onClick={() => setModal({ date: sel, tpl: t })}>+ {t.name}</button>)}</div>
            </div>
          ) : selEvents.map((e) => <EventCard key={e.id} e={e} bookings={bkByEvent[e.id] || []} onEdit={editEvent} onChange={load} />)}
        </div>
      </div>

      {modal && (
        <EventModal
          initial={modal.initial || (modal.tpl ? { type: modal.tpl.type, title: modal.tpl.title || '', theme: modal.tpl.theme || '', icon: modal.tpl.icon || 'mug', date: modal.date, start: '18:00', duration: modal.tpl.duration || 120, capacity: modal.tpl.capacity || 6, price: modal.tpl.price || '', notes: '', published: true } : null)}
          date={modal.date}
          templates={templates}
          onClose={() => setModal(null)}
          onSaved={() => { toast('Сохранено'); load() }}
        />
      )}
    </div>
  )
}
