import { useEffect, useRef, useState } from 'react'
import { useT, LangSwitch } from './i18n/index.jsx'
import { useReveal } from './useReveal.js'
import HeroMug from './three/HeroMug.jsx'
import ClaySculpt from './three/ClaySculpt.jsx'
import Kiln from './three/Kiln.jsx'
import GlazePaint from './three/GlazePaint.jsx'
import ProcessTimeline from './blocks/ProcessTimeline.jsx'
import Shrink from './blocks/Shrink.jsx'
import StyledMap from './StyledMap.jsx'
import InView from './InView.jsx'

const LOGO = '/assets/logo/logo_text.svg'
const IMG = (n) => `/assets/img/photo-${n}.webp`
const IMG_SM = (n) => `/assets/img/photo-${n}-sm.webp`

/* ---------------- Topbar ---------------- */
function Topbar() {
  const { t } = useT()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#top" aria-label="Astrelle">
        <img className="topbar__logo" src={LOGO} alt="Astrelle" />
      </a>
      <div className="topbar__actions">
        <LangSwitch />
        <a className="btn btn--ghost" href="#booking">
          {t('nav.cowork')}
        </a>
        <a className="btn btn--primary" href="#booking">
          {t('nav.kurs')}
        </a>
      </div>
    </header>
  )
}

/* ---------------- Hero ---------------- */
function Hero() {
  const { t } = useT()
  return (
    <section className="hero" id="top">
      <div className="hero__stage">
        <HeroMug />
      </div>
      <span className="hero__place">{t('hero.place')}</span>
      <img className="hero__wordmark" src={LOGO} alt="Astrelle" />
      <p className="hero__sub">{t('hero.sub')}</p>
      <div className="hero__cta">
        <a className="btn btn--primary" href="#booking">
          {t('nav.kurs')}
        </a>
        <a className="btn btn--ghost" href="#booking">
          {t('nav.cowork')}
        </a>
      </div>
      <span className="hero__scroll">{t('hero.scroll')}</span>
    </section>
  )
}

/* ---------------- Value ---------------- */
function Value() {
  const { t } = useT()
  const points = t('value.points')
  return (
    <section className="section" id="value">
      <div className="container">
        <div className="value__head reveal">
          <span className="kicker">{t('value.kicker')}</span>
          <h2 className="title">{t('value.title')}</h2>
          <p className="lead">{t('value.body')}</p>
        </div>
        <div className="cards">
          {points.map((p, i) => (
            <div className="card reveal" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className="card__num">0{i + 1}</span>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Image band ---------------- */
function Band() {
  const { t } = useT()
  return (
    <section className="band reveal" aria-hidden="false">
      <picture>
        <source srcSet={IMG(1)} media="(min-width: 720px)" />
        <img src={IMG_SM(1)} alt="" loading="lazy" />
      </picture>
      <div className="band__quote">{t('hero.tagline')}</div>
    </section>
  )
}

/* ---------------- Clay play (potter's wheel 2.0) ---------------- */
function ClayPlay() {
  const { t } = useT()
  const [reset, setReset] = useState(0)
  const [glazed, setGlazed] = useState(false)
  return (
    <section className="section section--alt" id="clay">
      <div className="container clay">
        <div className="reveal">
          <span className="kicker">{t('clay.kicker')}</span>
          <h2 className="title">{t('clay.title')}</h2>
          <p className="lead">{t('clay.body')}</p>
          <div className="clay__actions">
            <button
              className={`btn ${glazed ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setGlazed((g) => !g)}
              aria-pressed={glazed}
            >
              ✦ {t('clay.glaze')}
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setReset((n) => n + 1)
                setGlazed(false)
              }}
            >
              ↺ {t('clay.reset')}
            </button>
          </div>
        </div>
        <div className="clay__canvas reveal">
          <InView>
            <ClaySculpt resetSignal={reset} glazed={glazed} />
          </InView>
          <div className="clay__hint">{t('clay.hint')}</div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Kiln / firing ---------------- */
function KilnBlock() {
  const { t } = useT()
  const heatRef = useRef(0)
  const [heat, setHeat] = useState(0)
  const holding = useRef(false)
  const raf = useRef(0)
  const last = useRef(0)

  useEffect(() => {
    // heat only ratchets up — once fired, the piece keeps its state
    const tick = (ts) => {
      const dt = last.current ? (ts - last.current) / 1000 : 0
      last.current = ts
      if (holding.current && heatRef.current < 1) {
        const h = Math.min(1, heatRef.current + 0.4 * dt)
        heatRef.current = h
        setHeat(h)
        raf.current = requestAnimationFrame(tick)
      } else {
        raf.current = 0
        last.current = 0
      }
    }
    const start = () => {
      if (!raf.current) {
        last.current = 0
        raf.current = requestAnimationFrame(tick)
      }
    }
    const down = () => {
      holding.current = true
      start()
    }
    const up = () => {
      holding.current = false
    }
    const btn = document.getElementById('kiln-hold')
    btn.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      btn.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  const stages = t('kiln.stages')
  const stageIdx = heat < 0.25 ? 0 : heat < 0.75 ? 1 : 2
  const temp = Math.round(20 + heat * 1260)

  return (
    <section className="section kilnb" id="kiln">
      <div className="container clay">
        <div className="reveal">
          <span className="kicker kicker--wine">{t('kiln.kicker')}</span>
          <h2 className="title">{t('kiln.title')}</h2>
          <p className="lead">{t('kiln.body')}</p>
          <div className="kilnb__gauge">
            <div className="kilnb__temp">{temp}°C</div>
            <div className="kilnb__bar">
              <div className="kilnb__fill" style={{ width: `${heat * 100}%` }} />
            </div>
            <div className="kilnb__stage">{stages[stageIdx]}</div>
          </div>
          <button id="kiln-hold" className="btn btn--wine btn--lg clay__reset" style={{ touchAction: 'none' }}>
            🔥 {t('kiln.hold')}
          </button>
        </div>
        <div
          className="clay__canvas reveal"
          style={{ background: `radial-gradient(120% 120% at 50% 60%, rgba(255,120,40,${heat * 0.5}), var(--cream-3))` }}
        >
          <InView>
            <Kiln heatRef={heatRef} />
          </InView>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Glaze painting ---------------- */
const GLAZE_COLORS = ['#84a867', '#7a2e3a', '#c0613f', '#3b4a2f', '#d9a13d', '#5b7fa6', '#2c2622']
const GLAZE_SHAPES = ['vase', 'mug', 'bowl']
function GlazeBlock() {
  const { t } = useT()
  const colorRef = useRef(GLAZE_COLORS[0])
  const [active, setActive] = useState(GLAZE_COLORS[0])
  const [reset, setReset] = useState(0)
  const [shape, setShape] = useState('vase')
  const [tool, setTool] = useState('brush')
  return (
    <section className="section section--alt glazeb" id="glaze">
      <div className="container clay">
        <div className="reveal">
          <span className="kicker">{t('glaze.kicker')}</span>
          <h2 className="title">{t('glaze.title')}</h2>
          <p className="lead">{t('glaze.body')}</p>

          <div className="seg">
            <button className={tool === 'brush' ? 'active' : ''} onClick={() => setTool('brush')}>
              ✎ {t('glaze.brush')}
            </button>
            <button className={tool === 'hand' ? 'active' : ''} onClick={() => setTool('hand')}>
              ✋ {t('glaze.hand')}
            </button>
          </div>

          <div className="seg">
            {GLAZE_SHAPES.map((s) => (
              <button key={s} className={shape === s ? 'active' : ''} onClick={() => setShape(s)}>
                {t(`glaze.shapes.${s}`)}
              </button>
            ))}
          </div>

          <div className="glazeb__palette">
            {GLAZE_COLORS.map((c) => (
              <button
                key={c}
                className={`glazeb__swatch ${active === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => {
                  colorRef.current = c
                  setActive(c)
                  setTool('brush')
                }}
                aria-label={c}
              />
            ))}
          </div>
          <button className="btn btn--ghost clay__reset" onClick={() => setReset((n) => n + 1)}>
            ↺ {t('glaze.reset')}
          </button>
        </div>
        <div className="clay__canvas reveal">
          <InView>
            <GlazePaint colorRef={colorRef} resetSignal={reset} shape={shape} tool={tool} />
          </InView>
          <div className="clay__hint">{tool === 'hand' ? t('glaze.handHint') : t('glaze.hint')}</div>
        </div>
      </div>
    </section>
  )
}


/* ---------------- Invitation (master classes = main accent) ---------------- */
function Invitation() {
  const { t } = useT()
  return (
    <section className="section invite" id="invite">
      <div className="container">
        <div className="invite__head reveal">
          <span className="kicker kicker--wine">{t('invite.kicker')}</span>
          <h2 className="title">{t('invite.title')}</h2>
          <p className="lead">{t('invite.body')}</p>
        </div>

        {/* FEATURED — master classes */}
        <article className="feature reveal">
          <div className="feature__media">
            <img src={IMG(4)} alt="" loading="lazy" />
          </div>
          <div className="feature__body">
            <span className="tag tag--wine">✦ {t('invite.featured')}</span>
            <span className="feature__lead">{t('invite.kursLead')}</span>
            <h3>{t('invite.kursTitle')}</h3>
            <p>{t('invite.kursBody')}</p>
            <a className="btn btn--wine btn--lg" href="#booking">
              {t('nav.kurs')}
            </a>
          </div>
        </article>

        {/* secondary — coworking + stylised map */}
        <div className="invite__row">
          <article className="invite__card reveal">
            <img src={IMG(6)} alt="" loading="lazy" />
            <h3>{t('invite.coworkTitle')}</h3>
            <p>{t('invite.coworkBody')}</p>
            <a className="btn" href="#booking">
              {t('nav.cowork')}
            </a>
          </article>

          <div className="invite__map">
            <StyledMap />
            <div className="invite__addr">
              <div>
                <b>
                  {t('invite.address')} · {t('invite.studio')}
                </b>
                <span>
                  {t('invite.city')} — {t('invite.mapHint')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Clay types + facts ---------------- */
const DOTS = ['#c0613f', '#7c6a54', '#e7ddd2', '#b7a98f']
const CLAY_KEYS = ['terracotta', 'stoneware', 'porcelain', 'white']
function ClayTypes() {
  const { t } = useT()
  const items = t('types.items')
  const facts = t('types.facts')
  return (
    <section className="section section--alt" id="types">
      <div className="container">
        <div className="value__head reveal">
          <span className="kicker">{t('types.kicker')}</span>
          <h2 className="title">{t('types.title')}</h2>
          <p className="lead">{t('types.body')}</p>
        </div>
        <div className="types__grid">
          {items.map((it, i) => (
            <article className="type reveal" key={i} tabIndex={0} style={{ transitionDelay: `${i * 0.07}s` }}>
              <div
                className="type__photo"
                style={{ backgroundImage: `url(/assets/img/clay-${CLAY_KEYS[i]}.webp)` }}
              >
                <span className="type__photo-name">{it.t}</span>
              </div>
              <div className="type__dot" style={{ background: DOTS[i % DOTS.length] }} />
              <h3>{it.t}</h3>
              <p>{it.d}</p>
            </article>
          ))}
        </div>
        <div className="facts">
          {facts.map((f, i) => (
            <div className="fact reveal" key={i} style={{ transitionDelay: `${i * 0.07}s` }}>
              <span>✦</span>
              <p>{f}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Pricing ---------------- */
function PriceCard({ data, goat, note }) {
  return (
    <div className="price__card reveal">
      <h3>{data.title}</h3>
      {data.rows.map((row, i) => (
        <div className="price__row" key={i}>
          <span className="l">{row.l}</span>
          <span className="dots" aria-hidden="true" />
          <span className="r">{row.r}</span>
        </div>
      ))}
      {note && (
        <p className="price__note">
          <span>✦</span>
          {note}
        </p>
      )}
      {goat && <img className="price__goat" src={goat} alt="" loading="lazy" />}
    </div>
  )
}
function Pricing() {
  const { t } = useT()
  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="value__head reveal">
          <span className="kicker">{t('pricing.kicker')}</span>
          <h2 className="title">{t('pricing.title')}</h2>
        </div>
        <div className="price__grid">
          <PriceCard data={t('pricing.coworking')} goat="/assets/maskot/goat_coin.webp" />
          <div className="price__col">
            <PriceCard data={t('pricing.firing')} />
            <PriceCard
              data={t('pricing.course')}
              note={t('pricing.course.note')}
              goat="/assets/maskot/goat_potter.webp"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Master ---------------- */
function Master() {
  const { t } = useT()
  return (
    <section className="section section--wine" id="master">
      <div className="container master">
        <div className="master__photo reveal">
          <img src={IMG(3)} alt={t('master.name')} loading="lazy" />
        </div>
        <div className="reveal">
          <span className="kicker kicker--wine">{t('master.kicker')}</span>
          <div className="master__name">{t('master.name')}</div>
          <p className="lead">{t('master.body')}</p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Booking ---------------- */
function Booking() {
  const { t } = useT()
  return (
    <section className="section booking" id="booking">
      <div className="container">
        <div className="booking__head reveal">
          <span className="kicker">{t('booking.kicker')}</span>
          <h2 className="title" style={{ margin: '0 auto' }}>
            {t('booking.title')}
          </h2>
          <p className="lead">{t('booking.body')}</p>
        </div>
        <div className="booking__placeholder reveal">
          <span className="booking__cal">{t('booking.soon')}</span>
          <div className="booking__cta">
            <a className="btn btn--primary" href="#booking">
              {t('booking.kursBtn')}
            </a>
            <a className="btn btn--ghost" href="#booking">
              {t('booking.coworkBtn')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Footer ---------------- */
function Footer() {
  const { t } = useT()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <img className="footer__logo" src={LOGO} alt="Astrelle" />
            <p className="footer__tag">{t('footer.tagline')}</p>
          </div>
          <div className="footer__addr">
            <b>{t('invite.studio')}</b>
            {t('invite.address')}
            <br />
            {t('invite.city')}
            <br />
            <LangSwitch />
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Astrelle · {t('footer.rights')}</span>
          <span>✦ {t('footer.made')}</span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const root = useReveal()
  const { lang } = useT()
  // soft cross-fade on language change (no remount → no jank)
  const [fading, setFading] = useState(false)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setFading(true)
    const id = setTimeout(() => setFading(false), 240)
    return () => clearTimeout(id)
  }, [lang])

  return (
    <div ref={root}>
      <div className="grain" />
      <Topbar />
      <main className={`content ${fading ? 'content--fading' : ''}`}>
        <Hero />
        <Value />
        <Master />
        <Band />
        <ClayPlay />
        <Invitation />
        <ProcessTimeline />
        <ClayTypes />
        <Shrink />
        <KilnBlock />
        <Pricing />
        <GlazeBlock />
        <Booking />
        <Footer />
      </main>
    </div>
  )
}
