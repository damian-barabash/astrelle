import { useState } from 'react'
import { useT } from '../i18n/index.jsx'
import { outUrl, newRef, logClick } from '../lib/partner.js'
import { PARTNER, ALL_ITEMS } from '../data/offers.js'

// Where an id leads: the admin's override first, then the offer's own link, then one
// of the partner's general pages (schedule, shop, vouchers…).
export function useDest() {
  const { partner } = useT()
  return (id) => partner.offers?.[id]?.url || ALL_ITEMS.find((o) => o.id === id)?.url || PARTNER[id] || PARTNER.site
}

// A link to the partner studio. `to` is an offer / voucher / product id or a general
// target ('schedule', 'shop', …); `place` says where on our site the link stands.
// Each click gets its own reference code, written into the address and into our log.
export default function Out({ to, place = '', className = '', children, ...rest }) {
  const { partner, lang } = useT()
  const dest = useDest()(to)
  const source = partner.utm_source || 'astrelle'
  const onClick = (e) => {
    const ref = newRef()
    e.currentTarget.href = outUrl(dest, { offer: to, ref, source })
    logClick({ offer: to, place, ref, dest, lang })
  }
  return (
    <a className={className || undefined} href={outUrl(dest, { offer: to, source })} target="_blank" rel="noopener" data-out={to} onClick={onClick} onAuxClick={onClick} {...rest}>
      {children}
    </a>
  )
}

// The studio's phone: a call is a conversion too, so the tap is logged like a link.
export function Tel({ place = '', className = '' }) {
  const { lang } = useT()
  return (
    <a className={className || undefined} href={`tel:${PARTNER.phone.replace(/\s/g, '')}`} onClick={() => logClick({ offer: 'phone', place, ref: newRef(), dest: 'tel', lang })}>
      {PARTNER.phone}
    </a>
  )
}

// The code the visitor gives the studio when booking — shown only once the admin set it.
export function Promo({ className = '' }) {
  const { partner, t } = useT()
  const [copied, setCopied] = useState(false)
  const code = String(partner.promo_code || '').trim()
  if (!code) return null
  const copy = () => {
    try {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked */ }
  }
  return (
    <div className={`promo ${className}`}>
      <span className="promo__label">{t('promo.label')}</span>
      <button type="button" className="promo__code" onClick={copy} title={t('promo.copy')}>
        <b>{code}</b>
        <i>{copied ? t('promo.copied') : t('promo.copy')}</i>
      </button>
      <p className="promo__hint">{t('promo.hint')}</p>
    </div>
  )
}
