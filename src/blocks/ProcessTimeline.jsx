import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n/index.jsx'
import { CUP_BODY, CUP_HANDLE } from './mugPaths.js'
import { Kicker, Goat } from '../components/Decor.jsx'

const HEIGHTS = [0.1, 0.42, 0.8, 1, 1, 1, 1]
const FILLS = ['#b7afa1', '#b7afa1', '#b7afa1', '#c3bbae', '#c08a5e', '#84a867', '#84a867']

export default function ProcessTimeline() {
  const { t } = useT()
  const steps = t('process.steps')
  const [active, setActive] = useState(0)
  const [manual, setManual] = useState(false)
  const trackRef = useRef(null)
  const dragging = useRef(false)

  // auto-play until the visitor takes control
  useEffect(() => {
    if (manual) return
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 1700)
    return () => clearInterval(id)
  }, [manual, steps.length])

  const takeOver = () => setManual(true)
  const setFromX = (clientX) => {
    const el = trackRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    setActive(Math.round(frac * (steps.length - 1)))
  }
  const onDown = (e) => {
    takeOver()
    dragging.current = true
    setFromX(e.clientX)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    if (dragging.current) setFromX(e.clientX)
  }
  const onUp = () => {
    dragging.current = false
  }

  const s = active
  const showDisc = s === 1 || s === 2
  const showHandle = s >= 3
  const isLump = s === 0

  return (
    <section className="section section--alt process" id="process">
      <Goat n={15} className="goat--deco goat--tr" />
      <div className="container">
        <div className="value__head reveal">
          <Kicker vol="05" wine>
            {t('process.kicker')}
          </Kicker>
          <h2 className="title">{t('process.title')}</h2>
          <p className="lead">{t('process.body')}</p>
        </div>

        <div className="process__stage reveal">
          <svg viewBox="0 0 200 250" className="process__svg">
            {showDisc && <ellipse cx="100" cy="224" rx="78" ry="13" className="process__disc" />}
            {isLump ? (
              <ellipse cx="100" cy="200" rx="42" ry="28" style={{ fill: FILLS[s] }} className="process__clay" />
            ) : (
              <g style={{ transform: `scaleY(${HEIGHTS[s]})`, transformOrigin: '100px 214px' }}>
                {showHandle && (
                  <path d={CUP_HANDLE} fill="none" stroke={FILLS[s]} strokeWidth="15" strokeLinecap="round" className="process__clay" />
                )}
                <path d={CUP_BODY} style={{ fill: FILLS[s] }} className="process__clay" />
                {s >= 5 && <path d="M80,88 C75,120 76,158 86,194" className="process__shine" />}
              </g>
            )}
            {s === 4 && (
              <g className="process__heat">
                <path d="M32,206 q6,-18 0,-36" />
                <path d="M168,206 q-6,-18 0,-36" />
              </g>
            )}
            {s === 6 && (
              <g className="process__spark">
                <text x="150" y="58">✦</text>
                <text x="40" y="88">✦</text>
              </g>
            )}
          </svg>

          <div className="process__caption" key={s}>
            <span className="process__num">
              {s + 1} / {steps.length}
            </span>
            <h3>{steps[s].t}</h3>
            <p>{steps[s].d}</p>
          </div>
        </div>

        {/* scrub rail */}
        <div
          className="process__rail"
          ref={trackRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          role="slider"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={s + 1}
          aria-label={t('process.hint')}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              takeOver()
              setActive((a) => Math.min(steps.length - 1, a + 1))
            }
            if (e.key === 'ArrowLeft') {
              takeOver()
              setActive((a) => Math.max(0, a - 1))
            }
          }}
        >
          <div className="process__rail-line">
            <div className="process__rail-fill" style={{ width: `${(s / (steps.length - 1)) * 100}%` }} />
          </div>
          {steps.map((st, i) => (
            <button
              key={i}
              className={`process__tick ${i <= s ? 'done' : ''} ${i === s ? 'active' : ''}`}
              onClick={() => {
                takeOver()
                setActive(i)
              }}
              aria-label={st.t}
            >
              <span>{st.t}</span>
            </button>
          ))}
        </div>
        <div className="process__hint">{t('process.hint')}</div>
      </div>
    </section>
  )
}
