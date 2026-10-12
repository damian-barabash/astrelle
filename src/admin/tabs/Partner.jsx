import { useEffect, useState, useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { Chip, Modal, useToast, fmtDT, fmtDate, copyText, downloadCsv, offerLabel, offerKind, placeLabel, money, SALE_STATUS, SALE_SOURCE, useSiteSettings, loadSettings, patchSettingsCache } from '../ui.jsx'
import { OFFERS, VOUCHERS, PRODUCTS, ALL_ITEMS, priceText } from '../../data/offers.js'

const PERIODS = [[7, '7 дней'], [30, '30 дней'], [90, '90 дней'], [365, 'Год']]
const SUB = [['', 'Обзор'], ['przejscia', 'Переходы'], ['sprzedaz', 'Покупки'], ['oferta', 'Предложения и цены'], ['podlaczenie', 'Как узнаём о покупках']]
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
const today = () => new Date().toISOString().slice(0, 10)

/* ---------------- a sale: new, edited, or made from a click ---------------- */
export function SaleModal({ sale, click, pctDefault, onClose, onDone }) {
  const { token } = useAdmin()
  const toast = useToast()
  const item = ALL_ITEMS.find((o) => o.id === (sale?.offer || click?.offer))
  const [f, setF] = useState({
    sold_at: sale?.sold_at || today(),
    offer: sale?.offer || (item ? item.id : ''),
    title: sale?.title || '',
    amount: sale?.amount ?? (item && typeof item.price === 'number' && !item.from ? item.price : ''),
    commission: sale?.commission ?? '',
    click_ref: sale?.click_ref || click?.ref || '',
    customer: sale?.customer || '',
    note: sale?.note || '',
    status: sale?.status === 'new' ? 'confirmed' : sale?.status || 'confirmed',
  })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const auto = Math.round((parseFloat(String(f.amount).replace(',', '.')) || 0) * pctDefault) / 100
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const r = await callFn('admin-partner', { action: 'sale.save', token, id: sale?.id, ...f })
    setBusy(false)
    if (r.ok && r.data.ok) { toast('Покупка записана'); onDone(); onClose() } else toast('Не удалось сохранить')
  }
  return (
    <Modal title={sale?.id ? 'Покупка' : click ? `Покупка по переходу ${click.ref}` : 'Новая покупка'} onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="arow">
          <label className="af"><span className="af__lbl">Дата покупки</span><input type="date" value={f.sold_at} onChange={(e) => set('sold_at', e.target.value)} required /></label>
          <label className="af"><span className="af__lbl">Сумма, zł</span><input inputMode="decimal" value={f.amount} onChange={(e) => set('amount', e.target.value)} required autoFocus /></label>
        </div>
        <label className="af"><span className="af__lbl">Что купили</span>
          <select value={f.offer} onChange={(e) => set('offer', e.target.value)}>
            <option value="">— другое / не знаю —</option>
            <optgroup label="Занятия">{OFFERS.map((o) => <option key={o.id} value={o.id}>{offerLabel(o.id)}</option>)}</optgroup>
            <optgroup label="Сертификаты">{VOUCHERS.map((o) => <option key={o.id} value={o.id}>{offerLabel(o.id)}</option>)}</optgroup>
            <optgroup label="Магазин">{PRODUCTS.map((o) => <option key={o.id} value={o.id}>{offerLabel(o.id)}</option>)}</optgroup>
          </select>
        </label>
        {!f.offer && <label className="af"><span className="af__lbl">Название (как в отчёте студии)</span><input value={f.title} onChange={(e) => set('title', e.target.value)} /></label>}
        <div className="arow">
          <label className="af"><span className="af__lbl">Клиент (имя, телефон — если знаешь)</span><input value={f.customer} onChange={(e) => set('customer', e.target.value)} /></label>
          <label className="af"><span className="af__lbl">Код перехода</span><input value={f.click_ref} onChange={(e) => set('click_ref', e.target.value.toUpperCase())} placeholder="например K7QM2P" /></label>
        </div>
        <div className="arow">
          <label className="af"><span className="af__lbl">Наша комиссия, zł (пусто = {pctDefault}% → {auto} zł)</span><input inputMode="decimal" value={f.commission} onChange={(e) => set('commission', e.target.value)} placeholder={String(auto)} /></label>
          <label className="af"><span className="af__lbl">Статус</span>
            <select value={f.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(SALE_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </label>
        </div>
        <label className="af"><span className="af__lbl">Заметка</span><input value={f.note} onChange={(e) => set('note', e.target.value)} placeholder="откуда узнали: отчёт студии, клиент сказал код…" /></label>
        <div className="amodal__act">
          <button type="button" className="abtn abtn--ghost" onClick={onClose}>Отмена</button>
          <button type="submit" className="abtn" disabled={busy}>Сохранить</button>
        </div>
      </form>
    </Modal>
  )
}

function Bars({ data }) {
  if (!data || data.length === 0) return <p className="aempty">За период переходов не было.</p>
  const max = Math.max(...data.map((d) => d.clicks), 1)
  return (
    <div className="an__bars">
      {data.map((d) => (
        <div className="an__bar" key={d.d} title={`${d.d}: ${d.clicks} переходов`}>
          <div className="an__bar-fill" style={{ height: `${Math.round((d.clicks / max) * 100)}%` }} />
          <span className="an__bar-x">{d.d.slice(8)}</span>
        </div>
      ))}
    </div>
  )
}
function TopList({ title, items, label = (k) => k }) {
  const max = Math.max(...(items || []).map((i) => i.n), 1)
  return (
    <div className="acard">
      <h4>{title}</h4>
      {(!items || items.length === 0) && <p className="aempty">—</p>}
      {(items || []).map((i, k) => (
        <div className="an__toprow" key={k}><span className="an__topk">{label(i.k)}</span><span className="an__topbar"><i style={{ width: `${Math.round((i.n / max) * 100)}%` }} /></span><span className="an__topn">{i.n}</span></div>
      ))}
    </div>
  )
}

/* ---------------- prices and links of every offer (what the site shows) ---------------- */
function OffersEditor() {
  const { token } = useAdmin()
  const toast = useToast()
  const settings = useSiteSettings(token)
  const [ov, setOv] = useState(null)
  useEffect(() => { loadSettings(token, true).then((s) => setOv(s.partner?.offers || {})) }, [token])
  if (!ov) return <p className="aempty">Загрузка…</p>
  const set = (id, k, v) => setOv((p) => ({ ...p, [id]: { ...(p[id] || {}), [k]: v } }))
  const save = async () => {
    // keep only what differs from the built-in values
    const clean = {}
    for (const [id, x] of Object.entries(ov)) {
      const o = {}
      if (x.price !== '' && x.price != null) o.price = /^\d+([.,]\d+)?$/.test(String(x.price)) ? Number(String(x.price).replace(',', '.')) : String(x.price)
      if (x.url) o.url = String(x.url).trim()
      if (x.hidden) o.hidden = true
      if (Object.keys(o).length) clean[id] = o
    }
    const partner = { ...(settings.partner || {}), offers: clean }
    const r = await callFn('admin-content', { action: 'settings.set', token, key: 'partner', value: partner })
    if (r.ok) { patchSettingsCache('partner', partner); setOv(clean); toast('Сохранено — уже на сайте') } else toast('Ошибка сохранения')
  }
  const group = (title, list) => (
    <div className="acard" style={{ padding: 0, marginBottom: 14 }}>
      <div className="atable__wrap">
        <table className="atable pt__offers">
          <thead><tr><th>{title}</th><th>Цена на сайте</th><th>Куда ведёт кнопка</th><th>Скрыть</th></tr></thead>
          <tbody>
            {list.map((o) => {
              const x = ov[o.id] || {}
              return (
                <tr key={o.id} className={x.hidden ? 'is-off' : ''}>
                  <td><b>{offerLabel(o.id)}</b></td>
                  <td><input value={x.price ?? ''} placeholder={priceText(o, 'от').replace(' zł', '')} onChange={(e) => set(o.id, 'price', e.target.value)} /></td>
                  <td><input value={x.url ?? ''} placeholder={decodeURI(o.url).replace('https://www.', '')} onChange={(e) => set(o.id, 'url', e.target.value)} /></td>
                  <td><input type="checkbox" checked={!!x.hidden} onChange={(e) => set(o.id, 'hidden', e.target.checked)} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
  return (
    <>
      <p className="edt__hint" style={{ marginBottom: 12 }}>Пустое поле = значение по умолчанию (оно показано серым). Цена — число (на сайте добавится «zł») или любой текст. Ссылка — полный адрес страницы студии; метки отслеживания сайт допишет сам. Названия и описания правятся в «Редакторе сайта».</p>
      {group('Занятия', OFFERS)}
      {group('Сертификаты', VOUCHERS)}
      {group('Магазин', PRODUCTS)}
      <div className="amodal__act"><button className="abtn" onClick={save}>Сохранить цены и ссылки</button></div>
    </>
  )
}

/* ---------------- how a purchase becomes known ---------------- */
function Connect({ data, reload }) {
  const { token } = useAdmin()
  const toast = useToast()
  const settings = useSiteSettings(token)
  const [code, setCode] = useState(null)
  const [pc, setPc] = useState(null)
  useEffect(() => { if (code === null && settings.partner !== undefined) setCode(settings.partner?.promo_code || '') }, [settings]) // eslint-disable-line
  useEffect(() => { if (pc === null && data) setPc(String(data.commission_pct ?? 0)) }, [data]) // eslint-disable-line
  const saveCode = async () => {
    const partner = { ...(settings.partner || {}), promo_code: String(code || '').trim().toUpperCase() }
    const r = await callFn('admin-content', { action: 'settings.set', token, key: 'partner', value: partner })
    if (r.ok) { patchSettingsCache('partner', partner); toast(partner.promo_code ? 'Код показывается на сайте' : 'Код убран с сайта') } else toast('Ошибка')
  }
  const savePct = async () => {
    const r = await callFn('admin-partner', { action: 'private.set', token, commission_pct: pc })
    if (r.ok) { toast('Сохранено'); reload() } else toast('Ошибка')
  }
  const rotate = async () => {
    if (!confirm('Выпустить новый адрес? Старый перестанет работать — студии нужно будет вставить новый.')) return
    const r = await callFn('admin-partner', { action: 'private.set', token, rotate_key: true })
    if (r.ok) { toast('Новый адрес готов'); reload() }
  }
  return (
    <div className="set__grid">
      <div className="acard" style={{ gridColumn: '1 / -1' }}>
        <h4>Что мы видим сами, а что — только через студию</h4>
        <p className="pt__p"><b>Переход</b> на сайт студии мы записываем всегда: какая кнопка, с какой страницы, когда, и одноразовый код перехода (он же попадает в адрес как <code>utm_content</code>, а источник — <code>utm_source=astrelle</code>).</p>
        <p className="pt__p"><b>Оплату</b> мы увидеть не можем: она проходит на сайте Wizards of Art. Узнать о ней можно тремя способами — от самого надёжного к самому простому:</p>
      </div>

      <div className="acard">
        <h4>1 · Промокод Astrelle</h4>
        <p className="pt__p">Студия создаёт у себя купон (например <b>ASTRELLE</b>, можно с небольшой скидкой). Мы показываем его на сайте рядом с кнопками записи. Каждый заказ с этим купоном — наш, и студия видит это в своих отчётах.</p>
        <label className="af"><span className="af__lbl">Код, который показываем на сайте (пусто = не показывать)</span><input value={code ?? ''} onChange={(e) => setCode(e.target.value)} placeholder="ASTRELLE" /></label>
        <div className="amodal__act"><button className="abtn" onClick={saveCode}>Сохранить код</button></div>
      </div>

      <div className="acard">
        <h4>2 · Автоматически от студии</h4>
        <p className="pt__p">На сайте студии (Wix → Automations) добавляется правило «заказ оплачен / запись подтверждена → Send HTTP request (POST)» на этот адрес. Покупка сама появится во вкладке «Покупки»; с нашим купоном — сразу подтверждённой, без него — с пометкой «Проверить».</p>
        <div className="pt__url">{data?.hook_url || '—'}</div>
        <div className="msgbox__links" style={{ marginTop: 8 }}>
          <button className="abtn abtn--ghost abtn--sm" onClick={() => { copyText(data?.hook_url || ''); toast('Скопировано') }}>Скопировать адрес</button>
          <button className="abtn abtn--ghost abtn--sm" onClick={rotate}>Выпустить новый</button>
        </div>
        <p className="edt__hint" style={{ marginTop: 8 }}>Адрес — как пароль: отправляй его только студии.</p>
      </div>

      <div className="acard">
        <h4>3 · Вручную</h4>
        <p className="pt__p">Студия раз в неделю или месяц присылает список заказов с источником <b>astrelle</b> (в статистике Wix он виден) — вносишь их кнопкой «+ Покупка». Если клиент назвал код перехода, покупку можно привязать к конкретному клику.</p>
      </div>

      <div className="acard">
        <h4>Наша комиссия</h4>
        <label className="af"><span className="af__lbl">Процент с каждой покупки (видим только мы)</span><input inputMode="decimal" value={pc ?? ''} onChange={(e) => setPc(e.target.value)} /></label>
        <p className="edt__hint">У отдельной покупки комиссию можно задать суммой.</p>
        <div className="amodal__act"><button className="abtn" onClick={savePct}>Сохранить</button></div>
      </div>
    </div>
  )
}

/* ---------------- the tab ---------------- */
export default function Partner() {
  const { token } = useAdmin()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const sub = location.pathname.split('/')[3] || ''
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [q, setQ] = useState('')
  const [saleFor, setSaleFor] = useState(null) // { sale } | { click } | {}

  const load = useCallback(() => {
    callFn('admin-partner', { action: 'overview', token, days }).then((r) => setData(r.ok ? r.data : { summary: null, clicks: [], sales: [] }))
  }, [token, days])
  useEffect(() => { load() }, [load])

  const s = data?.summary
  const soldRefs = useMemo(() => new Set((data?.sales || []).filter((x) => x.click_ref && x.status !== 'rejected').map((x) => x.click_ref)), [data])
  const norm = (x) => String(x || '').toLowerCase()
  const match = (...f) => !q || f.some((x) => norm(x).includes(norm(q)))
  const clicks = useMemo(() => (data?.clicks || []).filter((c) => match(c.ref, offerLabel(c.offer), placeLabel(c.place), c.page)), [data, q]) // eslint-disable-line
  const sales = useMemo(() => (data?.sales || []).filter((x) => match(x.title, offerLabel(x.offer), x.customer, x.click_ref, x.note, x.external_id)), [data, q]) // eslint-disable-line

  const delClick = (id) => {
    if (!confirm('Удалить переход? (например, свой тестовый клик)')) return
    setData((d) => ({ ...d, clicks: d.clicks.filter((c) => c.id !== id) }))
    callFn('admin-partner', { action: 'click.delete', token, id })
  }
  const delSale = (id) => {
    if (!confirm('Удалить покупку?')) return
    callFn('admin-partner', { action: 'sale.delete', token, id }).then(load)
  }
  const setStatus = (x, status) => callFn('admin-partner', { action: 'sale.save', token, ...x, status }).then(() => { toast(SALE_STATUS[status]); load() })
  const exportCsv = async (what) => {
    const r = await callFn('admin-partner', { action: 'export', token, what })
    if (r.ok) { downloadCsv(r.data.csv, r.data.filename); toast('Экспорт готов') }
  }
  const pctDefault = Number(data?.commission_pct || 0)
  const commissionOf = (x) => (x.commission != null ? Number(x.commission) : Math.round(Number(x.amount) * pctDefault) / 100)

  return (
    <div className="pt">
      <div className="ahead">
        <div>
          <h2>Партнёр · Wizards of Art</h2>
          <p>Кто ушёл с нашего сайта записываться и покупать в студию — и что из этого стало покупкой.</p>
        </div>
        <div className="ahead__act">
          {(sub === 'przejscia' || sub === 'sprzedaz') && <input className="asearch" placeholder="Поиск: код, занятие, клиент…" value={q} onChange={(e) => setQ(e.target.value)} />}
          {sub === 'przejscia' && <button className="abtn abtn--ghost" onClick={() => exportCsv('clicks')}>⇩ CSV</button>}
          {sub === 'sprzedaz' && <button className="abtn abtn--ghost" onClick={() => exportCsv('sales')}>⇩ CSV</button>}
          <button className="abtn" onClick={() => setSaleFor({})}>+ Покупка</button>
        </div>
      </div>
      <div className="crm__tabs aseg">
        {SUB.map(([k, l]) => <button key={k} className={sub === k ? 'is-active' : ''} onClick={() => navigate(`/admin/partner/${k}`)}>{l}{k === 'sprzedaz' && s?.pending ? ` · ${s.pending}` : ''}</button>)}
      </div>

      {!data ? <p className="aempty">Загрузка…</p> : sub === 'oferta' ? <OffersEditor /> : sub === 'podlaczenie' ? <Connect data={data} reload={load} /> : (
        <>
          {sub !== 'sprzedaz' && <div className="crm__filters aseg">{PERIODS.map(([v, l]) => <button key={v} className={days === v ? 'is-active' : ''} onClick={() => setDays(v)}>{l}</button>)}</div>}

          {sub === '' && s && (
            <>
              <div className="dash__stats" style={{ marginBottom: 14 }}>
                <div className="dash__stat"><b>{s.clicks}</b><span>переходов в студию</span></div>
                <div className="dash__stat"><b>{s.calls}</b><span>из них звонков</span></div>
                <div className={`dash__stat ${s.sales ? 'is-hot' : ''}`}><b>{s.sales}</b><span>покупок · {pct(s.sales, s.clicks)}% от переходов</span></div>
                <div className="dash__stat"><b>{money(s.revenue)}</b><span>оборот у студии</span></div>
                <div className="dash__stat"><b>{money(s.commission)}</b><span>наша комиссия{s.commission_pct ? ` · ${Number(s.commission_pct)}%` : ''}</span></div>
                <div className={`dash__stat ${s.pending ? 'is-hot' : ''}`}><b>{s.pending}</b><span>покупок ждут проверки</span></div>
              </div>
              <div className="acard" style={{ marginBottom: 14 }}><h4>Переходы по дням</h4><Bars data={s.daily} /></div>
              <div className="acard" style={{ padding: 0, marginBottom: 14 }}>
                <div className="atable__wrap">
                  <table className="atable">
                    <thead><tr><th>Куда уходят</th><th>Тип</th><th>Переходов</th><th>Покупок</th><th>Конверсия</th><th>Оборот</th></tr></thead>
                    <tbody>
                      {s.by_offer.length === 0 && <tr><td colSpan={6} className="aempty">Пока нет ни одного перехода за период.</td></tr>}
                      {s.by_offer.map((r) => (
                        <tr key={r.k || 'none'}>
                          <td><b>{offerLabel(r.k)}</b></td><td>{offerKind(r.k)}</td><td>{r.clicks}</td><td>{r.sales}</td><td>{r.clicks ? `${pct(r.sales, r.clicks)}%` : '—'}</td><td>{r.revenue ? money(r.revenue) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="an__grid">
                <TopList title="С какого места сайта" items={s.by_place} label={placeLabel} />
                <TopList title="Языки" items={s.by_lang} label={(k) => String(k).toUpperCase()} />
                <TopList title="Устройства" items={s.by_device} />
              </div>
            </>
          )}

          {sub === 'przejscia' && (
            <div className="acard" style={{ padding: 0 }}>
              <div className="atable__wrap">
                <table className="atable">
                  <thead><tr><th>Когда</th><th>Код</th><th>Куда</th><th>Откуда на сайте</th><th>Язык</th><th>Устройство</th><th /></tr></thead>
                  <tbody>
                    {clicks.length === 0 && <tr><td colSpan={7} className="aempty">Переходов нет.</td></tr>}
                    {clicks.map((c) => (
                      <tr key={c.id}>
                        <td>{fmtDT(c.created_at)}</td>
                        <td><code className="pt__ref">{c.ref}</code></td>
                        <td><b>{offerLabel(c.offer)}</b> <span className="achip">{offerKind(c.offer)}</span></td>
                        <td>{placeLabel(c.place)}</td>
                        <td>{(c.lang || '—').toUpperCase()}</td>
                        <td>{c.device || '—'}</td>
                        <td className="pt__act">
                          {soldRefs.has(c.ref) ? <Chip status="confirmed">купил</Chip> : <button className="abtn abtn--ghost abtn--sm" onClick={() => setSaleFor({ click: c })}>✓ купил</button>}
                          <button className="bk__ico bk__ico--no" title="Удалить" onClick={() => delClick(c.id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sub === 'sprzedaz' && (
            <div className="acard" style={{ padding: 0 }}>
              <div className="atable__wrap">
                <table className="atable">
                  <thead><tr><th>Дата</th><th>Что купили</th><th>Сумма</th><th>Комиссия</th><th>Клиент</th><th>Код</th><th>Откуда знаем</th><th>Статус</th><th /></tr></thead>
                  <tbody>
                    {sales.length === 0 && <tr><td colSpan={9} className="aempty">Покупок пока нет. Как они сюда попадают — во вкладке «Как узнаём о покупках».</td></tr>}
                    {sales.map((x) => (
                      <tr key={x.id} className={x.status === 'rejected' ? 'is-off' : ''}>
                        <td>{fmtDate(x.sold_at, { year: '2-digit' })}</td>
                        <td><b>{x.offer ? offerLabel(x.offer) : x.title || '—'}</b>{x.note ? <div className="pt__note">{x.note}</div> : null}</td>
                        <td>{money(x.amount)}</td>
                        <td>{money(commissionOf(x))}</td>
                        <td>{x.customer || '—'}</td>
                        <td>{x.click_ref ? <code className="pt__ref">{x.click_ref}</code> : '—'}</td>
                        <td>{SALE_SOURCE[x.source] || x.source}{x.external_id ? ` · №${x.external_id}` : ''}</td>
                        <td><Chip status={x.status === 'rejected' ? 'declined' : x.status === 'new' ? 'pending' : 'confirmed'}>{SALE_STATUS[x.status]}</Chip></td>
                        <td className="pt__act">
                          {x.status === 'new' && <><button className="bk__ico bk__ico--ok" title="Наша" onClick={() => setStatus(x, 'confirmed')}>✓</button><button className="bk__ico bk__ico--no" title="Не наша" onClick={() => setStatus(x, 'rejected')}>✕</button></>}
                          <button className="bk__ico" title="Изменить" onClick={() => setSaleFor({ sale: x })}>✎</button>
                          <button className="bk__ico bk__ico--no" title="Удалить" onClick={() => delSale(x.id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {saleFor && <SaleModal sale={saleFor.sale} click={saleFor.click} pctDefault={pctDefault} onClose={() => setSaleFor(null)} onDone={load} />}
    </div>
  )
}
