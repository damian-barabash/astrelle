import { useCallback, useEffect, useRef, useState } from 'react'
import { useT } from './i18n/index.jsx'
import { FACTS } from './data/facts.js'

// The Astrelle goat peeks out from the bottom-left and shares a random ceramics
// fact in a speech bubble. First appearance after 30s, then every 2 minutes.
// The bubble auto-closes after 30s, or earlier when the visitor closes it.
const FIRST_DELAY = 30_000
const CYCLE = 120_000
const VISIBLE = 30_000

export default function Mascot() {
  const { t, lang } = useT()
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const lastIdx = useRef(-1)
  const hideTimer = useRef(0)

  const show = useCallback(() => {
    // pick a fresh random fact (avoid immediate repeats)
    let i = lastIdx.current
    if (FACTS.length > 1) {
      while (i === lastIdx.current) i = Math.floor(Math.random() * FACTS.length)
    } else {
      i = 0
    }
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

  useEffect(() => {
    // first peek at 30s, then re-schedule itself every 2 minutes
    let timer = setTimeout(function run() {
      show()
      timer = setTimeout(run, CYCLE)
    }, FIRST_DELAY)
    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer.current)
    }
  }, [show])

  return (
    <div className="mascot" data-open={open}>
      <img
        className="mascot__goat"
        src="/assets/maskot/goat-04.webp"
        alt={t('mascot.name')}
        draggable="false"
      />
      <div className="mascot__bubble" role="status" aria-live="polite">
        <button className="mascot__close" type="button" onClick={hide} aria-label={t('mascot.close')}>
          ×
        </button>
        <span className="mascot__intro">✦ {t('mascot.intro')}</span>
        <p className="mascot__fact">{FACTS[idx][lang] || FACTS[idx].en}</p>
      </div>
    </div>
  )
}
