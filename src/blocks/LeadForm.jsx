import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { T, Img } from '../content/edit.jsx'
import { callFn } from '../lib/supabase.js'

// Small lead form: "not sure what to pick?" (kind=contact), gift voucher (gift) or the
// shop waiting list (shop). Consent is mandatory; a hidden honeypot field catches bots.
export default function LeadForm({ kind = 'contact', id, compact = false }) {
  const { t, lang } = useT()
  const ns = kind === 'shop' ? 'shop' : 'lead'
  const [f, setF] = useState({ name: '', contact: '', message: '', consent: false, website: '' })
  const [state, setState] = useState('idle') // idle | busy | ok | err
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!f.contact.trim() || !f.consent) return
    setState('busy')
    const r = await callFn('lead', { kind, name: f.name.trim(), contact: f.contact.trim(), message: f.message.trim(), consent: true, lang, page: location.pathname, website: f.website })
    setState(r.ok && r.data.ok ? 'ok' : 'err')
  }

  if (state === 'ok') {
    return (
      <div className="lead lead--done" id={id}>
        <span className="lead__check">✓</span>
        <p>{t(`${ns}.ok`)}</p>
      </div>
    )
  }

  return (
    <form className={`lead ${compact ? 'lead--compact' : ''}`} id={id} onSubmit={submit}>
      <div className="lead__head">
        {kind === 'gift' ? (
          <>
            <Img k="voucher" fallback="/assets/img/voucher.webp" className="lead__img" alt="" />
            <T k="lead.giftTitle" as="h2" className="h2" />
            <T k="lead.giftSub" as="p" multiline />
          </>
        ) : kind === 'shop' ? (
          <T k="shop.waitTitle" as="h2" className="h2" />
        ) : (
          <>
            <T k="lead.title" as="h2" className="h2" />
            <T k="lead.sub" as="p" multiline />
          </>
        )}
      </div>
      <div className="lead__fields">
        {kind !== 'shop' && (
          <label className="field">
            <span>{t('lead.name')}</span>
            <input value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
          </label>
        )}
        <label className="field">
          <span>{t(`${ns}.contact`)}</span>
          <input value={f.contact} onChange={(e) => set('contact', e.target.value)} required autoComplete="email" inputMode="email" />
        </label>
        {kind !== 'shop' && (
          <label className="field field--wide">
            <span>{t('lead.message')}</span>
            <textarea rows={3} value={f.message} onChange={(e) => set('message', e.target.value)} />
          </label>
        )}
        <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} aria-hidden="true" />
      </div>
      <label className="check">
        <input type="checkbox" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} required />
        <span>
          {t(`${ns}.consent`)} <NavLink to="/polityka-prywatnosci">({t('footer.privacy')})</NavLink>
        </span>
      </label>
      {state === 'err' && <p className="form__err">{t(`${ns}.err`)}</p>}
      <button type="submit" className="btn btn--primary" disabled={state === 'busy' || !f.contact.trim() || !f.consent}>
        {state === 'busy' ? '…' : t(kind === 'shop' ? 'shop.btn' : 'lead.send')}
      </button>
    </form>
  )
}
