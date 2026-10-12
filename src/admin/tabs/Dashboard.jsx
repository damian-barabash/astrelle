import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { fmtDT, offerLabel, placeLabel, money, dayKey, Chip, SALE_STATUS } from '../ui.jsx'

// "Today": how many people the site sent to the studio, what they went for, which
// purchases are known, and the messages waiting for an answer.
export default function Dashboard() {
  const { token, admin } = useAdmin()
  const [p, setP] = useState(null)
  const [crm, setCrm] = useState({ clients: [], leads: [] })
  const [settings, setSettings] = useState({})

  const load = useCallback(() => {
    Promise.all([
      callFn('admin-partner', { action: 'overview', token, days: 30 }),
      callFn('admin-crm', { action: 'overview', token }),
      callFn('admin-content', { action: 'settings.get', token }),
    ]).then(([a, c, s]) => {
      setP(a.ok ? a.data : { summary: null, clicks: [], sales: [] })
      if (c.ok) setCrm(c.data)
      if (s.ok) setSettings(s.data.settings || {})
    })
  }, [token])
  useEffect(() => { load() }, [load])

  const now = new Date()
  const hour = now.getHours()
  const hi = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const clicks = p?.clicks || []
  const sales = p?.sales || []
  const s = p?.summary
  const today = dayKey(now)
  const todayClicks = clicks.filter((c) => dayKey(new Date(c.created_at)) === today).length
  const weekClicks = clicks.filter((c) => Date.now() - new Date(c.created_at) < 7 * 864e5).length
  const newLeads = (crm.leads || []).filter((l) => l.status === 'new')
  const pending = sales.filter((x) => x.status === 'new')
  const noCode = !settings.partner?.promo_code
  const noEmail = !settings.studio?.email

  return (
    <div className="dash">
      <div className="ahead">
        <div>
          <h2>{hi}, {admin.display_name}</h2>
          <p>{now.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="ahead__act">
          <Link className="abtn" to="/admin/partner/sprzedaz">+ Записать покупку</Link>
          <Link className="abtn abtn--ghost" to="/admin/partner">Все переходы</Link>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="dash__todo">◎ {pending.length} {pending.length === 1 ? 'покупка пришла' : 'покупок пришло'} от студии без нашего кода — <Link to="/admin/partner/sprzedaz">проверить</Link></div>
      )}
      {noCode && (
        <div className="dash__todo">✦ Промокод Astrelle не задан: без него покупку в студии нельзя надёжно связать с нами — <Link to="/admin/partner/podlaczenie">как это настроить</Link></div>
      )}
      {noEmail && (
        <div className="dash__todo">✎ В документах сайта пусто поле e-mail — <Link to="/admin/ustawienia">заполнить контакты Astrelle</Link></div>
      )}

      <div className="dash__stats">
        <Link className="dash__stat" to="/admin/partner/przejscia"><b>{todayClicks}</b><span>переходов в студию сегодня</span></Link>
        <Link className="dash__stat" to="/admin/partner/przejscia"><b>{weekClicks}</b><span>за 7 дней</span></Link>
        <Link className="dash__stat" to="/admin/partner"><b>{s?.clicks ?? 0}</b><span>за 30 дней</span></Link>
        <Link className={`dash__stat ${s?.sales ? 'is-hot' : ''}`} to="/admin/partner/sprzedaz"><b>{s?.sales ?? 0}</b><span>покупок за 30 дней</span></Link>
        <Link className="dash__stat" to="/admin/partner/sprzedaz"><b>{money(s?.commission)}</b><span>комиссия за 30 дней</span></Link>
        <Link className={`dash__stat ${newLeads.length ? 'is-hot' : ''}`} to="/admin/klienci/leady"><b>{newLeads.length}</b><span>новых сообщений</span></Link>
      </div>

      <div className="dash__grid">
        <div className="acard">
          <h4>Последние переходы в студию</h4>
          {!p ? <p className="aempty">Загрузка…</p> : clicks.length === 0 ? <p className="aempty">Пока никто не уходил записываться. Переходы появятся здесь сами.</p> : (
            <div className="crm__rows">
              {clicks.slice(0, 10).map((c) => (
                <div className="bk" key={c.id}>
                  <div className="bk__main">
                    <span className="bk__name">{offerLabel(c.offer)} <code className="pt__ref">{c.ref}</code></span>
                    <span className="bk__meta"><span>{fmtDT(c.created_at)}</span><span>· {placeLabel(c.place)}</span>{c.lang ? <span>· {c.lang.toUpperCase()}</span> : null}{c.device ? <span>· {c.device}</span> : null}</span>
                  </div>
                </div>
              ))}
              {clicks.length > 10 && <p className="aempty"><Link to="/admin/partner/przejscia">все переходы →</Link></p>}
            </div>
          )}
        </div>
        <div>
          <div className="acard" style={{ marginBottom: 14 }}>
            <h4>Что выбирают · 30 дней</h4>
            {!s || s.by_offer.length === 0 ? <p className="aempty">Нет данных.</p> : s.by_offer.slice(0, 7).map((r) => (
              <div className="bk" key={r.k || 'none'}>
                <div className="bk__main"><span className="bk__name">{offerLabel(r.k)}</span><span className="bk__meta">{r.clicks} переходов{r.sales ? ` · ${r.sales} покупок · ${money(r.revenue)}` : ''}</span></div>
              </div>
            ))}
          </div>
          <div className="acard">
            <h4>Последние покупки</h4>
            {sales.length === 0 ? <p className="aempty">Пока не записано ни одной.</p> : sales.slice(0, 5).map((x) => (
              <div className="bk" key={x.id}>
                <div className="bk__main">
                  <span className="bk__name">{x.offer ? offerLabel(x.offer) : x.title || 'Покупка'} <Chip status={x.status === 'new' ? 'pending' : x.status === 'rejected' ? 'declined' : 'confirmed'}>{SALE_STATUS[x.status]}</Chip></span>
                  <span className="bk__meta">{x.sold_at} · {money(x.amount)}{x.customer ? ` · ${x.customer}` : ''}</span>
                </div>
              </div>
            ))}
          </div>
          {newLeads.length > 0 && (
            <div className="acard" style={{ marginTop: 14 }}>
              <h4>Новые сообщения</h4>
              {newLeads.slice(0, 5).map((l) => (
                <div className="bk" key={l.id}>
                  <div className="bk__main">
                    <span className="bk__name">{l.name || '—'}</span>
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
