import { useState } from 'react'
import { useT } from '../i18n/index.jsx'
import { CUP_BODY, CUP_HANDLE } from './mugPaths.js'
import { Kicker, Goat } from '../components/Decor.jsx'

export default function Shrink() {
  const { t } = useT()
  const [v, setV] = useState(0)
  const s = 1 - 0.15 * (v / 100)
  const pct = Math.round(15 * (v / 100))

  return (
    <section className="section shrinkb" id="shrink">
      <Goat n={7} className="goat--deco goat--br" />
      <div className="container shrinkb__grid">
        <div className="reveal">
          <Kicker vol="07" wine>
            {t('shrink.kicker')}
          </Kicker>
          <h2 className="title">{t('shrink.title')}</h2>
          <p className="lead">{t('shrink.body')}</p>
          <div className="shrinkb__control">
            <span>{t('shrink.raw')}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={v}
              onChange={(e) => setV(+e.target.value)}
              aria-label={t('shrink.hint')}
            />
            <span>{t('shrink.fired')}</span>
          </div>
          <div className="shrinkb__bottom">
            <div className="shrinkb__pct">−{pct}%</div>
            <span className="shrinkb__hint">← {t('shrink.hint')} →</span>
          </div>
        </div>

        <div className="shrinkb__stage reveal">
          <svg viewBox="0 0 200 240" className="shrinkb__svg">
            {/* raw (ghost) outline */}
            <path d={CUP_HANDLE} className="shrinkb__ghost" fill="none" strokeWidth="15" />
            <path d={CUP_BODY} className="shrinkb__ghost" />
            {/* fired (scales down toward the base) */}
            <g style={{ transform: `scale(${s})`, transformOrigin: '100px 214px' }}>
              <path d={CUP_HANDLE} className="shrinkb__solid-h" fill="none" strokeWidth="15" />
              <path d={CUP_BODY} className="shrinkb__solid" />
            </g>
            <line x1="28" y1="220" x2="172" y2="220" className="shrinkb__floor" />
          </svg>
        </div>
      </div>
    </section>
  )
}
