import { useEffect, useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { BOOKING_STATUS, LEAD_STATUS, LEAD_KIND, Chip, Modal, useToast, fmtDT, fmtDate, fmtTime, contactLinks, copyText, downloadCsv, useSiteSettings } from '../ui.jsx'
import { MESSAGE_KEYS, DEFAULT_MESSAGES, fillTemplate, messageValues } from '../messages.js'

const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000)
  if (m < 60) return `${m} мин назад`
  const h = Math.round(m / 60)
  if (h < 48) return `${h} ч назад`
  return `${Math.round(h / 24)} дн назад`
}

/* ---------------- message composer (copy → WhatsApp / SMS / mail) ---------------- */
export function MessageModal({ b, ev, onClose }) {
  const { token } = useAdmin()
  const settings = useSiteSettings(token)
  const toast = useToast()
  const [lang, setLang] = useState(b.lang || 'pl')
  const [key, setKey] = useState(b.status === 'declined' ? 'decline' : b.status === 'waitlist' ? 'waitlist' : 'confirm')
  const tpls = { ...DEFAULT_MESSAGES[lang], ...((settings.messages || {})[lang] || {}) }
  const [text, setText] = useState('')
  useEffect(() => { setText(fillTemplate(tpls[key], messageValues(b, ev, settings.studio, lang))) }, [key, lang, settings]) // eslint-disable-line
  const links = contactLinks(b.contact)
  const enc = encodeURIComponent(text)
  return (
    <Modal title={`Сообщение для ${b.name}`} onClose={onClose}>
      <div className="arow">
        <label className="af"><span className="af__lbl">Шаблон</span>
          <select value={key} onChange={(e) => setKey(e.target.value)}>{MESSAGE_KEYS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </label>
        <label className="af"><span className="af__lbl">Язык</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)}><option value="pl">Polski</option><option value="ru">Русский</option><option value="en">English</option></select>
        </label>
      </div>
      <div className="msgbox">
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <div className="msgbox__links">
          <button className="abtn" onClick={() => { copyText(text); toast('Скопировано') }}>Скопировать</button>
          {links.wa && <a className="abtn abtn--ghost" href={`${links.wa}?text=${enc}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          {links.sms && <a className="abtn abtn--ghost" href={`${links.sms}?body=${enc}`}>SMS</a>}
          {links.mail && <a className="abtn abtn--ghost" href={`${links.mail}?subject=Astrelle&body=${enc}`}>E-mail</a>}
        </div>
        <p className="edt__hint">Контакт: <b>{b.contact}</b>. Шаблоны можно править в «Настройках».</p>
      </div>
    </Modal>
  )
}

/* ---------------- one booking row (dashboard, calendar panel, CRM) ---------------- */
export function BookingRow({ b, ev, onChange, showEvent = true, compact = false }) {
  const { token } = useAdmin()
  const toast = useToast()
  const [status, setStatus] = useState(b.status)
  const [note, setNote] = useState(b.admin_note || '')
  const [noteOpen, setNoteOpen] = useState(!!b.admin_note)
  const [msg, setMsg] = useState(false)
  useEffect(() => setStatus(b.status), [b.status])
  const links = contactLinks(b.contact)

  const set = (s) => {
    setStatus(s)
    callFn('admin-crm', { action: 'booking.status', token, id: b.id, status: s }).then(() => { toast(BOOKING_STATUS[s]); onChange && onChange() })
  }
  const saveNote = () => {
    if (note === (b.admin_note || '')) return
    callFn('admin-crm', { action: 'booking.note', token, id: b.id, note }).then(() => toast('Заметка сохранена'))
  }
  const del = () => {
    if (!confirm(`Удалить заявку ${b.name}?`)) return
    callFn('admin-crm', { action: 'booking.delete', token, id: b.id }).then(() => onChange && onChange())
  }
  const d = ev?.starts_at ? new Date(ev.starts_at) : null
  return (
    <div className="bk">
      <div className="bk__main">
        <span className="bk__name">
          {b.name}
          {b.people > 1 && <span className="achip">{b.people} чел.</span>}
          <Chip status={status} />
        </span>
        <span className="bk__meta">
          {showEvent && ev && <span>{d.toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'short' })} {fmtTime(ev.starts_at)} — {ev.title || (ev.type === 'coworking' ? 'Коворкинг' : 'Мастер-класс')}</span>}
          <span>
            {links.tel ? <a href={links.tel}>{b.contact}</a> : links.mail ? <a href={links.mail}>{b.contact}</a> : b.contact}
            {links.wa && <> · <a href={links.wa} target="_blank" rel="noreferrer">WhatsApp</a></>}
          </span>
          <span>· {ago(b.created_at)}</span>
        </span>
        {b.comment && <span className="bk__comment">«{b.comment}»</span>}
      </div>
      <div className="bk__act">
        {status === 'pending' && (
          <>
            <button className="bk__ico bk__ico--ok" title="Подтвердить" onClick={() => set('confirmed')}>✓</button>
            <button className="bk__ico bk__ico--no" title="Отклонить" onClick={() => set('declined')}>✕</button>
          </>
        )}
        {status === 'waitlist' && <button className="bk__ico bk__ico--ok" title="Подтвердить (место освободилось)" onClick={() => set('confirmed')}>✓</button>}
        {!compact && (
          <select className="bk__sel" value={status} onChange={(e) => set(e.target.value)}>
            {Object.entries(BOOKING_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        )}
        <button className="bk__ico" title="Написать клиенту" onClick={() => setMsg(true)}>✉</button>
        <button className={`bk__ico ${noteOpen ? 'is-on' : ''}`} title="Заметка" onClick={() => setNoteOpen((o) => !o)}>✎</button>
        {!compact && <button className="bk__ico bk__ico--no" title="Удалить" onClick={del}>🗑</button>}
      </div>
      {noteOpen && (
        <div className="bk__note">
          <textarea rows={2} placeholder="Заметка для себя (аллергия, оплата, повторный клиент…)" value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} />
        </div>
      )}
      {msg && <MessageModal b={b} ev={ev} onClose={() => setMsg(false)} />}
    </div>
  )
}

/* ---------------- manual booking (phone / Instagram / walk-in) ---------------- */
export function ManualBookingModal({ ev, onClose, onDone }) {
  const { token } = useAdmin()
  const [f, setF] = useState({ name: '', contact: '', people: 1, comment: '', status: 'confirmed' })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const r = await callFn('admin-crm', { action: 'booking.create', token, event_id: ev.id, ...f })
    setBusy(false)
    if (r.ok) { onDone && onDone(); onClose() }
  }
  return (
    <Modal title={`Записать вручную · ${fmtDT(ev.starts_at)}`} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="arow">
          <label className="af"><span className="af__lbl">Имя</span><input value={f.name} onChange={(e) => set('name', e.target.value)} required autoFocus /></label>
          <label className="af"><span className="af__lbl">Телефон / e-mail</span><input value={f.contact} onChange={(e) => set('contact', e.target.value)} /></label>
        </div>
        <div className="arow">
          <label className="af"><span className="af__lbl">Человек</span><input type="number" min="1" max="20" value={f.people} onChange={(e) => set('people', +e.target.value || 1)} /></label>
          <label className="af"><span className="af__lbl">Статус</span>
            <select value={f.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(BOOKING_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
        </div>
        <label className="af"><span className="af__lbl">Комментарий</span><input value={f.comment} onChange={(e) => set('comment', e.target.value)} /></label>
        <div className="amodal__act">
          <button type="button" className="abtn abtn--ghost" onClick={onClose}>Отмена</button>
          <button type="submit" className="abtn" disabled={busy || !f.name}>Записать</button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------------- client drawer ---------------- */
function ClientDrawer({ c, bookings, leads, onClose, onChange }) {
  const { token } = useAdmin()
  const toast = useToast()
  const [f, setF] = useState({ name: c.name || '', email: c.email || '', phone: c.phone || '', notes: c.notes || '', tags: c.tags || [] })
  const [tag, setTag] = useState('')
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const save = async () => {
    const r = await callFn('admin-crm', { action: 'client.update', token, id: c.id, ...f })
    if (r.ok) { toast('Сохранено'); onChange() }
  }
  const del = async () => {
    if (!confirm('Удалить клиента из базы? Заявки останутся, но без привязки.')) return
    await callFn('admin-crm', { action: 'client.delete', token, id: c.id })
    onChange(); onClose()
  }
  const links = contactLinks(f.phone || f.email || c.contact)
  const hist = [...bookings.map((b) => ({ t: b.created_at, kind: 'booking', b })), ...leads.map((l) => ({ t: l.created_at, kind: 'lead', l }))].sort((a, b) => new Date(b.t) - new Date(a.t))
  const attended = bookings.filter((b) => b.status === 'attended').length
  return (
    <div className="crm__drawer">
      <button className="amodal__x" onClick={onClose}>✕</button>
      <h3>{c.name || c.contact}</h3>
      <div className="bk__meta">
        <span>в базе с {fmtDate(c.created_at, { year: 'numeric' })}</span><span>· {bookings.length} заявок</span><span>· {attended} посещений</span><span>· источник: {c.source}</span>
      </div>
      <div className="msgbox__links">
        {links.tel && <a className="abtn abtn--ghost abtn--sm" href={links.tel}>Позвонить</a>}
        {links.wa && <a className="abtn abtn--ghost abtn--sm" href={links.wa} target="_blank" rel="noreferrer">WhatsApp</a>}
        {links.mail && <a className="abtn abtn--ghost abtn--sm" href={links.mail}>E-mail</a>}
      </div>
      <div className="arow">
        <label className="af"><span className="af__lbl">Имя</span><input value={f.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label className="af"><span className="af__lbl">Телефон</span><input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></label>
        <label className="af"><span className="af__lbl">E-mail</span><input value={f.email} onChange={(e) => set('email', e.target.value)} /></label>
      </div>
      <div className="af">
        <span className="af__lbl">Теги</span>
        <div className="tags">
          {f.tags.map((t) => <span className="achip" key={t}>{t} <button onClick={() => set('tags', f.tags.filter((x) => x !== t))}>✕</button></span>)}
          <input className="asearch" style={{ minWidth: 140, padding: '4px 10px' }} placeholder="+ тег, Enter" value={tag} onChange={(e) => setTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && tag.trim()) { e.preventDefault(); set('tags', [...new Set([...f.tags, tag.trim()])]); setTag('') } }} />
        </div>
        <div className="tags" style={{ marginTop: 4 }}>
          {['VIP', 'постоянный', 'курс', 'коворкинг', 'подарок', 'аллергия'].filter((t) => !f.tags.includes(t)).map((t) => <button key={t} className="cad__tplbtn" onClick={() => set('tags', [...f.tags, t])}>+ {t}</button>)}
        </div>
      </div>
      <label className="af"><span className="af__lbl">Заметки</span><textarea rows={4} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Что важно помнить об этом человеке" /></label>
      <div className="amodal__act" style={{ justifyContent: 'space-between' }}>
        <button className="abtn abtn--red abtn--sm" onClick={del}>Удалить</button>
        <button className="abtn" onClick={save}>Сохранить</button>
      </div>
      <div className="acard">
        <h4>История</h4>
        {hist.length === 0 ? <p className="aempty">Пока пусто.</p> : (
          <div className="hist">
            {hist.map((h, i) => (
              <div className="hist__row" key={i}>
                <span className="hist__date">{fmtDate(h.t, { year: '2-digit' })}</span>
                {h.kind === 'booking' ? (
                  <span>{h.b.event ? `${fmtDate(h.b.event.starts_at)} ${fmtTime(h.b.event.starts_at)} — ${h.b.event.title || (h.b.event.type === 'coworking' ? 'Коворкинг' : 'Мастер-класс')}` : 'занятие удалено'}{h.b.people > 1 ? ` · ${h.b.people} чел.` : ''}</span>
                ) : (
                  <span>{LEAD_KIND[h.l.kind]}{h.l.message ? ` · «${h.l.message.slice(0, 60)}»` : ''}</span>
                )}
                <Chip status={h.kind === 'booking' ? h.b.status : h.l.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- CRM tab ---------------- */
const SUB = [['zgloszenia', 'Заявки'], ['klienci', 'Клиенты'], ['leady', 'Сообщения и листы']]
const BK_FILTERS = [['open', 'Активные'], ['pending', 'Ждут ответа'], ['confirmed', 'Подтверждённые'], ['waitlist', 'Лист ожидания'], ['past', 'Прошедшие'], ['all', 'Все']]

export default function Crm() {
  const { token } = useAdmin()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const sub = location.pathname.split('/')[3] || 'zgloszenia'
  const [data, setData] = useState({ clients: [], bookings: [], leads: [] })
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [bf, setBf] = useState('open')
  const [lf, setLf] = useState('new')
  const [openClient, setOpenClient] = useState(null)

  const load = useCallback(() => {
    callFn('admin-crm', { action: 'overview', token }).then((r) => { if (r.ok) setData(r.data); setLoading(false) })
  }, [token])
  useEffect(() => { load() }, [load])

  const norm = (s) => String(s || '').toLowerCase()
  const match = (...f) => !q || f.some((x) => norm(x).includes(norm(q)))
  const now = Date.now()
  const bookings = useMemo(() => data.bookings.filter((b) => {
    const past = b.event?.starts_at && new Date(b.event.starts_at) < now
    if (bf === 'open') return !past && !['declined', 'cancelled'].includes(b.status)
    if (bf === 'past') return past
    if (bf !== 'all' && b.status !== bf) return false
    return true
  }).filter((b) => match(b.name, b.contact, b.comment, b.event?.title)), [data.bookings, bf, q])
  const clients = useMemo(() => data.clients.filter((c) => match(c.name, c.contact, c.email, c.phone, (c.tags || []).join(' '), c.notes)), [data.clients, q])
  const leads = useMemo(() => data.leads.filter((l) => (lf === 'all' ? true : lf === 'shop' ? l.kind === 'shop' : l.status === lf && l.kind !== 'shop')).filter((l) => match(l.name, l.contact, l.message)), [data.leads, lf, q])
  const byClient = useMemo(() => {
    const m = {}
    for (const b of data.bookings) if (b.client_id) (m[b.client_id] = m[b.client_id] || []).push(b)
    return m
  }, [data.bookings])
  const leadsByClient = useMemo(() => {
    const m = {}
    for (const l of data.leads) if (l.client_id) (m[l.client_id] = m[l.client_id] || []).push(l)
    return m
  }, [data.leads])

  const exportCsv = async (what) => {
    const r = await callFn('admin-crm', { action: 'export', token, what })
    if (r.ok) { downloadCsv(r.data.csv, r.data.filename); toast('Экспорт готов') }
  }
  const setLead = (id, patch) => {
    setData((d) => ({ ...d, leads: d.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
    callFn('admin-crm', { action: 'lead.update', token, id, ...patch })
  }
  const delLead = (id) => {
    if (!confirm('Удалить сообщение?')) return
    setData((d) => ({ ...d, leads: d.leads.filter((l) => l.id !== id) }))
    callFn('admin-crm', { action: 'lead.delete', token, id })
  }
  const addClient = async () => {
    const contact = prompt('Телефон или e-mail клиента:')
    if (!contact) return
    const name = prompt('Имя:') || ''
    const r = await callFn('admin-crm', { action: 'client.create', token, name, contact })
    if (r.ok) { toast('Клиент добавлен'); load() } else toast('Не удалось: ' + (r.data?.error || ''))
  }

  const current = openClient ? data.clients.find((c) => c.id === openClient) : null

  return (
    <div className="crm">
      <div className="ahead">
        <div>
          <h2>CRM</h2>
          <p>Заявки с сайта, база клиентов и сообщения. Статусы меняются мгновенно, заметки — для тебя.</p>
        </div>
        <div className="ahead__act">
          <input className="asearch" placeholder="Поиск: имя, телефон, e-mail, тег…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="abtn abtn--ghost" onClick={() => exportCsv(sub === 'klienci' ? 'clients' : sub === 'leady' ? 'leads' : 'bookings')}>⇩ CSV</button>
          {sub === 'klienci' && <button className="abtn" onClick={addClient}>+ Клиент</button>}
        </div>
      </div>
      <div className="crm__tabs aseg">
        {SUB.map(([k, l]) => {
          const n = k === 'zgloszenia' ? data.bookings.filter((b) => b.status === 'pending').length : k === 'leady' ? data.leads.filter((x) => x.status === 'new').length : 0
          return <button key={k} className={sub === k ? 'is-active' : ''} onClick={() => navigate(`/admin/klienci/${k}`)}>{l}{n ? ` · ${n}` : ''}</button>
        })}
      </div>

      {loading ? <p className="aempty">Загрузка…</p> : sub === 'zgloszenia' ? (
        <>
          <div className="crm__filters aseg">{BK_FILTERS.map(([k, l]) => <button key={k} className={bf === k ? 'is-active' : ''} onClick={() => setBf(k)}>{l}</button>)}</div>
          <div className="crm__list">
            {bookings.length === 0 ? <p className="aempty">Ничего нет.</p> : bookings.map((b) => <BookingRow key={b.id} b={b} ev={b.event} onChange={load} />)}
          </div>
        </>
      ) : sub === 'klienci' ? (
        <div className="atable__wrap acard" style={{ padding: 0 }}>
          <table className="atable">
            <thead><tr><th>Имя</th><th>Контакт</th><th>Заявок</th><th>Посещений</th><th>Последний контакт</th><th>Теги</th></tr></thead>
            <tbody>
              {clients.length === 0 && <tr><td colSpan={6} className="aempty">Пока пусто — клиенты появляются автоматически из заявок.</td></tr>}
              {clients.map((c) => {
                const bs = byClient[c.id] || []
                return (
                  <tr key={c.id} className="is-click" onClick={() => setOpenClient(c.id)}>
                    <td><b>{c.name || '—'}</b></td>
                    <td>{c.contact}</td>
                    <td>{bs.length}</td>
                    <td>{bs.filter((b) => b.status === 'attended').length}</td>
                    <td>{fmtDate(c.last_seen, { year: '2-digit' })}</td>
                    <td><div className="tags">{(c.tags || []).map((t) => <span className="achip" key={t}>{t}</span>)}</div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="crm__filters aseg">
            {[['new', 'Новые'], ['replied', 'Ответили'], ['closed', 'Закрытые'], ['shop', 'Лист ожидания магазина'], ['all', 'Все']].map(([k, l]) => <button key={k} className={lf === k ? 'is-active' : ''} onClick={() => setLf(k)}>{l}</button>)}
          </div>
          <div className="crm__list">
            {leads.length === 0 ? <p className="aempty">Ничего нет.</p> : leads.map((l) => {
              const links = contactLinks(l.contact)
              return (
                <div className="bk" key={l.id}>
                  <div className="bk__main">
                    <span className="bk__name">{l.name || '—'} <span className="achip">{LEAD_KIND[l.kind]}</span> <Chip status={l.status}>{LEAD_STATUS[l.status]}</Chip></span>
                    <span className="bk__meta">
                      <span>{links.tel ? <a href={links.tel}>{l.contact}</a> : links.mail ? <a href={links.mail}>{l.contact}</a> : l.contact}{links.wa && <> · <a href={links.wa} target="_blank" rel="noreferrer">WhatsApp</a></>}</span>
                      <span>· {ago(l.created_at)}</span>{l.page && <span>· {l.page}</span>}
                    </span>
                    {l.message && <span className="bk__comment">«{l.message}»</span>}
                  </div>
                  <div className="bk__act">
                    <select className="bk__sel" value={l.status} onChange={(e) => setLead(l.id, { status: e.target.value })}>{Object.entries(LEAD_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    <button className="bk__ico bk__ico--no" title="Удалить" onClick={() => delLead(l.id)}>🗑</button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {current && <ClientDrawer c={current} bookings={byClient[current.id] || []} leads={leadsByClient[current.id] || []} onClose={() => setOpenClient(null)} onChange={load} />}
    </div>
  )
}
