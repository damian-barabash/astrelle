import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from './i18n/index.jsx'
import { FACTS } from './data/facts.js'
import { getConsent, setConsent, onConsent } from './lib/consent.js'

// The Astrelle goat peeks out from the bottom-left. First job: the cookie question.
// Once answered, she shares a random ceramics fact now and then (30s, then every 2 min).
const FIRST_DELAY = 30_000
const CYCLE = 120_000
const VISIBLE = 30_000

export default function Mascot() {
  const { t, lang } = useT()
  const [consent, setC] = useState(() => getConsent())
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const lastIdx = useRef(-1)
  const hideTimer = useRef(0)

  useEffect(() => onConsent((c) => setC(c)), [])

  const show = useCallback(() => {
    let i = lastIdx.current
    if (FACTS.length > 1) while (i === lastIdx.current) i = Math.floor(Math.random() * FACTS.length)
    else i = 0
    lastIdx.current = i
    setIdx(i)
    setOpen(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setOpen(false), VISIBLE)
  }, [])

  const hide = useCallback(() => {
    setOpen(false)
    clearTimeout(hideTimer.current)
  }, [])

  // facts only after the cookie question is answered
  useEffect(() => {
    if (!consent) return
    let timer = setTimeout(function run() {
      show()
      timer = setTimeout(run, CYCLE)
    }, FIRST_DELAY)
    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer.current)
    }
  }, [show, consent])

  const asking = !consent
  const visible = asking || open

  return (
    <div className={`mascot ${asking ? 'mascot--ask' : ''}`} data-open={visible}>
      <img className="mascot__goat" src="/assets/maskot/goat-04.webp" alt={t('mascot.name')} draggable="false" />
      <div className="mascot__bubble" role={asking ? 'dialog' : 'status'} aria-live="polite">
        {asking ? (
          <>
            <span className="mascot__intro">✦ {t('cookie.hi')}</span>
            <p className="mascot__fact">{t('cookie.text')}</p>
            <div className="mascot__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setConsent(true)}>
                {t('cookie.accept')}
              </button>
              <button type="button" className="btn btn--sm" onClick={() => setConsent(false)}>
                {t('cookie.necessary')}
              </button>
            </div>
            <NavLink className="mascot__more" to="/cookies">
              {t('cookie.more')} →
            </NavLink>
          </>
        ) : (
          <>
            <button className="mascot__close" type="button" onClick={hide} aria-label={t('mascot.close')}>
              ×
            </button>
            <span className="mascot__intro">✦ {t('mascot.intro')}</span>
            <p className="mascot__fact">{FACTS[idx][lang] || FACTS[idx].en}</p>
          </>
        )}
      </div>
    </div>
  )
}
