import { useEffect, useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { LEAD_STATUS, LEAD_KIND, Chip, useToast, fmtDate, contactLinks, downloadCsv } from '../ui.jsx'

const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000)
  if (m < 60) return `${m} мин назад`
  const h = Math.round(m / 60)
  if (h < 48) return `${h} ч назад`
  return `${Math.round(h / 24)} дн назад`
}

/* ---------------- client drawer ---------------- */
function ClientDrawer({ c, leads, onClose, onChange }) {
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
    if (!confirm('Удалить клиента из базы? Сообщения останутся, но без привязки.')) return
    await callFn('admin-crm', { action: 'client.delete', token, id: c.id })
    onChange(); onClose()
  }
  const links = contactLinks(f.phone || f.email || c.contact)
  const hist = leads.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return (
    <div className="crm__drawer">
      <button className="amodal__x" onClick={onClose}>✕</button>
      <h3>{c.name || c.contact}</h3>
      <div className="bk__meta">
        <span>в базе с {fmtDate(c.created_at, { year: 'numeric' })}</span><span>· {leads.length} сообщений</span><span>· источник: {c.source}</span>
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
          {['VIP', 'постоянный', 'сотрудничество', 'пресса', 'подарок'].filter((t) => !f.tags.includes(t)).map((t) => <button key={t} className="cad__tplbtn" onClick={() => set('tags', [...f.tags, t])}>+ {t}</button>)}
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
            {hist.map((l) => (
              <div className="hist__row" key={l.id}>
                <span className="hist__date">{fmtDate(l.created_at, { year: '2-digit' })}</span>
                <span>{LEAD_KIND[l.kind] || l.kind}{l.message ? ` · «${l.message.slice(0, 60)}»` : ''}</span>
                <Chip status={l.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------- CRM tab ---------------- */
const SUB = [['leady', 'Сообщения'], ['klienci', 'Контакты']]

export default function Crm() {
  const { token } = useAdmin()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const sub = location.pathname.split('/')[3] === 'klienci' ? 'klienci' : 'leady'
  const [data, setData] = useState({ clients: [], leads: [] })
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [lf, setLf] = useState('new')
  const [openClient, setOpenClient] = useState(null)

  const load = useCallback(() => {
    callFn('admin-crm', { action: 'overview', token }).then((r) => { if (r.ok) setData({ clients: r.data.clients || [], leads: r.data.leads || [] }); setLoading(false) })
  }, [token])
  useEffect(() => { load() }, [load])

  const norm = (s) => String(s || '').toLowerCase()
  const match = (...f) => !q || f.some((x) => norm(x).includes(norm(q)))
  const clients = useMemo(() => data.clients.filter((c) => match(c.name, c.contact, c.email, c.phone, (c.tags || []).join(' '), c.notes)), [data.clients, q]) // eslint-disable-line
  const leads = useMemo(() => data.leads.filter((l) => (lf === 'all' ? true : lf === 'shop' ? l.kind === 'shop' : l.status === lf && l.kind !== 'shop')).filter((l) => match(l.name, l.contact, l.message)), [data.leads, lf, q]) // eslint-disable-line
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
    const contact = prompt('Телефон или e-mail:')
    if (!contact) return
    const name = prompt('Имя:') || ''
    const r = await callFn('admin-crm', { action: 'client.create', token, name, contact })
    if (r.ok) { toast('Контакт добавлен'); load() } else toast('Не удалось: ' + (r.data?.error || ''))
  }

  const current = openClient ? data.clients.find((c) => c.id === openClient) : null

  return (
    <div className="crm">
      <div className="ahead">
        <div>
          <h2>Сообщения и контакты</h2>
          <p>Всё, что приходит через форму «Написать Стасе», и лист ожидания нашего магазина. Записи на занятия здесь нет — они у студии; переходы и покупки смотри во вкладке «Партнёр».</p>
        </div>
        <div className="ahead__act">
          <input className="asearch" placeholder="Поиск: имя, телефон, e-mail, тег…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="abtn abtn--ghost" onClick={() => exportCsv(sub === 'klienci' ? 'clients' : 'leads')}>⇩ CSV</button>
          {sub === 'klienci' && <button className="abtn" onClick={addClient}>+ Контакт</button>}
        </div>
      </div>
      <div className="crm__tabs aseg">
        {SUB.map(([k, l]) => {
          const n = k === 'leady' ? data.leads.filter((x) => x.status === 'new' && x.kind !== 'shop').length : 0
          return <button key={k} className={sub === k ? 'is-active' : ''} onClick={() => navigate(`/admin/klienci/${k}`)}>{l}{n ? ` · ${n}` : ''}</button>
        })}
      </div>

      {loading ? <p className="aempty">Загрузка…</p> : sub === 'klienci' ? (
        <div className="atable__wrap acard" style={{ padding: 0 }}>
          <table className="atable">
            <thead><tr><th>Имя</th><th>Контакт</th><th>Сообщений</th><th>Последний контакт</th><th>Теги</th></tr></thead>
            <tbody>
              {clients.length === 0 && <tr><td colSpan={5} className="aempty">Пока пусто — контакты появляются сами из сообщений с сайта.</td></tr>}
              {clients.map((c) => (
                <tr key={c.id} className="is-click" onClick={() => setOpenClient(c.id)}>
                  <td><b>{c.name || '—'}</b></td>
                  <td>{c.contact}</td>
                  <td>{(leadsByClient[c.id] || []).length}</td>
                  <td>{fmtDate(c.last_seen, { year: '2-digit' })}</td>
                  <td><div className="tags">{(c.tags || []).map((t) => <span className="achip" key={t}>{t}</span>)}</div></td>
                </tr>
              ))}
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
                    <span className="bk__name">{l.name || '—'} {l.kind !== 'contact' && <span className="achip">{LEAD_KIND[l.kind] || l.kind}</span>} <Chip status={l.status}>{LEAD_STATUS[l.status]}</Chip></span>
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

      {current && <ClientDrawer c={current} leads={leadsByClient[current.id] || []} onClose={() => setOpenClient(null)} onChange={load} />}
    </div>
  )
}
