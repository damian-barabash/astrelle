import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { useToast, loadSettings, patchSettingsCache } from '../ui.jsx'
import { PARTNER, PLACES } from '../../data/offers.js'

const STUDIO_FIELDS = [
  ['company', 'Название / фирма (для документов)', 'Astrelle · NIP …'],
  ['email', 'E-mail Astrelle (подвал, контакты, документы)', 'hello@astrelle.pl'],
  ['instagram', 'Instagram Astrelle (ссылка или @имя)', '@astrelle'],
  ['address', 'Где проходят занятия (для документов)', 'pracownia Wizards of Art, ul. Żurawia 32/34 lok. 26, Warszawa'],
]

export default function Settings() {
  const { token } = useAdmin()
  const toast = useToast()
  const [s, setS] = useState(null)
  const [studio, setStudio] = useState({})
  const [partner, setPartner] = useState({})
  const [pw, setPw] = useState({ old: '', a: '', b: '' })

  useEffect(() => {
    loadSettings(token, true).then((x) => {
      setS(x)
      setStudio(x.studio || {})
      setPartner(x.partner || {})
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

  if (!s) return <p className="aempty">Загрузка…</p>

  return (
    <div>
      <div className="ahead"><div><h2>Настройки</h2><p>Контакты Astrelle, ссылки на студию-партнёра, пароль.</p></div></div>
      <div className="set__grid">
        <div className="acard">
          <h4>Astrelle</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STUDIO_FIELDS.map(([k, l, ph]) => (
              <label className="af" key={k}><span className="af__lbl">{l}</span><input value={studio[k] || ''} placeholder={ph} onChange={(e) => setStudio((x) => ({ ...x, [k]: e.target.value }))} /></label>
            ))}
            <p className="edt__hint">Подставляется в подвал, на страницу «Контакты» и в {'{company} {address} {email}'} в документах. Телефон на сайте — студии (записывает она).</p>
            <button className="abtn" onClick={() => save('studio', studio)}>Сохранить</button>
          </div>
        </div>

        <div className="acard">
          <h4>Студия-партнёр</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="pt__p"><b>{PARTNER.name}</b> · {PARTNER.phone}<br />{PLACES.zurawia.street}<br />{PLACES.wiolinowa.street}</p>
            <label className="af"><span className="af__lbl">Промокод на сайте (пусто = не показывать)</span><input value={partner.promo_code || ''} placeholder="ASTRELLE" onChange={(e) => setPartner((x) => ({ ...x, promo_code: e.target.value.toUpperCase() }))} /></label>
            <label className="af"><span className="af__lbl">Метка источника в ссылках (utm_source)</span><input value={partner.utm_source || ''} placeholder="astrelle" onChange={(e) => setPartner((x) => ({ ...x, utm_source: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))} /></label>
            <p className="edt__hint">Цены и ссылки отдельных занятий — <Link to="/admin/partner/oferta">Партнёр → Предложения и цены</Link>. Комиссия и адрес для автоматических уведомлений — <Link to="/admin/partner/podlaczenie">Как узнаём о покупках</Link>. Адреса и телефон студии зашиты в сайт — скажи, если изменятся.</p>
            <button className="abtn" onClick={() => save('partner', partner)}>Сохранить</button>
          </div>
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
