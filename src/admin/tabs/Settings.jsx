import { useEffect, useState } from 'react'
import { callFn, SUPABASE_URL } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { useToast, loadSettings, patchSettingsCache } from '../ui.jsx'
import { EventIcon, ICON_KEYS } from '../../components/icons.jsx'
import { MESSAGE_KEYS, DEFAULT_MESSAGES } from '../messages.js'
import { DEFAULT_TEMPLATES } from './CalendarAdmin.jsx'

const STUDIO_FIELDS = [
  ['company', 'Название фирмы (для документов)', 'Astrelle / NIP …'],
  ['address', 'Адрес', 'ul. Mała 5a, Warszawa'],
  ['email', 'E-mail (в подвале и политике)', 'hello@astrelle.pl'],
  ['phone', 'Телефон (в подвале)', '+48 …'],
  ['instagram', 'Instagram (ссылка или @имя)', '@astrelle'],
  ['maps', 'Ссылка Google Maps', 'https://maps.google.com/…'],
]

export default function Settings() {
  const { token } = useAdmin()
  const toast = useToast()
  const [s, setS] = useState(null)
  const [studio, setStudio] = useState({})
  const [shop, setShop] = useState({})
  const [templates, setTemplates] = useState([])
  const [messages, setMessages] = useState({})
  const [mlang, setMlang] = useState('pl')
  const [pw, setPw] = useState({ old: '', a: '', b: '' })

  useEffect(() => {
    loadSettings(token, true).then((x) => {
      setS(x)
      setStudio(x.studio || {})
      setShop(x.shop || {})
      setTemplates(Array.isArray(x.templates) && x.templates.length ? x.templates : DEFAULT_TEMPLATES)
      setMessages(x.messages || {})
    })
  }, [token])

  const save = async (key, value) => {
    const r = await callFn('admin-content', { action: 'settings.set', token, key, value })
    if (r.ok) { patchSettingsCache(key, value); toast('Сохранено') } else toast('Ошибка')
  }
  const changePw = async (e) => {
    e.preventDefault()
    if (pw.a !== pw.b) return toast('Пароли не совпадают')
    const r = await callFn('admin-auth', { action: 'password', token, old_password: pw.old, new_password: pw.a })
    if (r.ok) { toast('Пароль изменён'); setPw({ old: '', a: '', b: '' }) } else toast(r.data?.error === 'wrong_password' ? 'Старый пароль неверный' : r.data?.error === 'too_short' ? 'Минимум 8 символов' : 'Ошибка')
  }
  const msg = { ...DEFAULT_MESSAGES[mlang], ...(messages[mlang] || {}) }
  const setMsg = (k, v) => setMessages((m) => ({ ...m, [mlang]: { ...(m[mlang] || {}), [k]: v } }))
  const setTpl = (i, k, v) => setTemplates((t) => t.map((x, j) => (j === i ? { ...x, [k]: v } : x)))

  if (!s) return <p className="aempty">Загрузка…</p>
  const feed = `${SUPABASE_URL}/functions/v1/calendar-feed`

  return (
    <div>
      <div className="ahead"><div><h2>Настройки</h2><p>Данные студии, шаблоны занятий и сообщений, магазин, пароль.</p></div></div>
      <div className="set__grid">
        <div className="acard">
          <h4>Студия</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STUDIO_FIELDS.map(([k, l, ph]) => (
              <label className="af" key={k}><span className="af__lbl">{l}</span><input value={studio[k] || ''} placeholder={ph} onChange={(e) => setStudio((x) => ({ ...x, [k]: e.target.value }))} /></label>
            ))}
            <p className="edt__hint">Эти значения подставляются в подвал сайта и в {'{company} {address} {email}'} в документах.</p>
            <button className="abtn" onClick={() => save('studio', studio)}>Сохранить</button>
          </div>
        </div>

        <div className="acard">
          <h4>Магазин (/sklep)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="af"><span className="af__lbl">Надпись вместо «Otwarcie w październiku» (пусто = из словаря)</span><input value={shop.soon_text || ''} onChange={(e) => setShop((x) => ({ ...x, soon_text: e.target.value }))} placeholder="Otwarcie w październiku" /></label>
            <p className="edt__hint">Лист ожидания магазина — во вкладке CRM → «Сообщения и листы».</p>
            <button className="abtn" onClick={() => save('shop', shop)}>Сохранить</button>
          </div>
          <h4 style={{ marginTop: 22 }}>Подписка на календарь</h4>
          <p className="edt__hint">Apple / Google Calendar → «подписаться по URL»:</p>
          <div className="msgbox__links" style={{ marginTop: 6 }}>
            <button className="abtn abtn--ghost abtn--sm" onClick={() => { navigator.clipboard.writeText(feed.replace('https://', 'webcal://')); toast('Скопировано') }}>Скопировать webcal://</button>
            <a className="abtn abtn--ghost abtn--sm" href={feed} target="_blank" rel="noreferrer">Открыть .ics</a>
          </div>
        </div>

        <div className="acard" style={{ gridColumn: '1 / -1' }}>
          <h4>Шаблоны занятий (кнопки в календаре)</h4>
          <div className="tpl" style={{ borderTop: 'none', fontSize: 11, color: 'var(--a-mute)', textTransform: 'uppercase', letterSpacing: '.08em' }}><span>Кнопка · название на сайте</span><span>Тип</span><span>Минут</span><span>Мест</span><span>Цена</span><span /></div>
          {templates.map((t, i) => (
            <div className="tpl" key={i}>
              <div style={{ display: 'grid', gap: 4 }}>
                <input value={t.name} placeholder="Кнопка" onChange={(e) => setTpl(i, 'name', e.target.value)} />
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input value={t.title || ''} placeholder="Название на сайте" onChange={(e) => setTpl(i, 'title', e.target.value)} />
                  <select value={t.icon || 'mug'} onChange={(e) => setTpl(i, 'icon', e.target.value)} style={{ width: 90 }}>{ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
                  <span className="cev__ic" style={{ width: 28, height: 28 }}><EventIcon icon={t.icon || 'mug'} /></span>
                </div>
              </div>
              <select value={t.type} onChange={(e) => setTpl(i, 'type', e.target.value)}><option value="class">МК</option><option value="coworking">Коворкинг</option></select>
              <input type="number" value={t.duration || 120} onChange={(e) => setTpl(i, 'duration', +e.target.value || 60)} />
              <input type="number" value={t.capacity || 6} onChange={(e) => setTpl(i, 'capacity', +e.target.value || 1)} />
              <input value={t.price || ''} onChange={(e) => setTpl(i, 'price', e.target.value)} />
              <button className="bk__ico bk__ico--no" onClick={() => setTemplates((x) => x.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <div className="amodal__act" style={{ justifyContent: 'space-between' }}>
            <button className="aadd" onClick={() => setTemplates((x) => [...x, { name: 'Новый', type: 'class', title: '', icon: 'mug', duration: 120, capacity: 6, price: '' }])}>+ шаблон</button>
            <button className="abtn" onClick={() => save('templates', templates)}>Сохранить шаблоны</button>
          </div>
        </div>

        <div className="acard" style={{ gridColumn: '1 / -1' }}>
          <h4>Шаблоны сообщений клиентам</h4>
          <p className="edt__hint">Кнопка ✉ у заявки подставляет данные и открывает WhatsApp / SMS / e-mail. Плейсхолдеры: {'{name} {date} {time} {title} {price} {address} {seats}'}.</p>
          <div className="aseg" style={{ margin: '10px 0' }}>{['pl', 'ru', 'en'].map((l) => <button key={l} className={mlang === l ? 'is-active' : ''} onClick={() => setMlang(l)}>{l.toUpperCase()}</button>)}</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {MESSAGE_KEYS.map(([k, l]) => <label className="af" key={k}><span className="af__lbl">{l}</span><textarea rows={2} value={msg[k] || ''} onChange={(e) => setMsg(k, e.target.value)} /></label>)}
          </div>
          <div className="amodal__act"><button className="abtn" onClick={() => save('messages', messages)}>Сохранить сообщения</button></div>
        </div>

        <div className="acard">
          <h4>Сменить пароль</h4>
          <form onSubmit={changePw} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="af"><span className="af__lbl">Текущий пароль</span><input type="password" value={pw.old} onChange={(e) => setPw((p) => ({ ...p, old: e.target.value }))} autoComplete="current-password" /></label>
            <label className="af"><span className="af__lbl">Новый (мин. 8)</span><input type="password" value={pw.a} onChange={(e) => setPw((p) => ({ ...p, a: e.target.value }))} autoComplete="new-password" /></label>
            <label className="af"><span className="af__lbl">Ещё раз</span><input type="password" value={pw.b} onChange={(e) => setPw((p) => ({ ...p, b: e.target.value }))} autoComplete="new-password" /></label>
            <button className="abtn" type="submit" disabled={!pw.old || pw.a.length < 8}>Изменить</button>
          </form>
        </div>
      </div>
    </div>
  )
}
