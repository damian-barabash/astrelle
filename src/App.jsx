import { useEffect, useRef, useState } from 'react'
import { useT, LangSwitch } from './i18n/index.jsx'
import { fetchGallery } from './lib/supabase.js'
import { initAnalytics } from './lib/analytics.js'
import StudioGallery from './blocks/StudioGallery.jsx'
import BookingCalendar from './blocks/BookingCalendar.jsx'
import { useReveal } from './useReveal.js'
import { Logo, Wordmark } from './components/Brand.jsx'
import { Goat, LooseLoop, Burst, Kicker } from './components/Decor.jsx'
import HeroMug from './three/HeroMug.jsx'
import ClaySculpt from './three/ClaySculpt.jsx'
import Kiln from './three/Kiln.jsx'
import GlazePaint from './three/GlazePaint.jsx'
import ProcessTimeline from './blocks/ProcessTimeline.jsx'
import Shrink from './blocks/Shrink.jsx'
import StyledMap from './StyledMap.jsx'
import InView from './InView.jsx'
import Mascot from './Mascot.jsx'

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
      <a className="topbar__brand" href="#top" aria-label="Astrelle">
        <Logo />
      </a>
      <div className="topbar__actions">
        <LangSwitch />
        <a className="btn btn--primary topbar__cta" href="#booking">
          {t('nav.book')}
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
      <Wordmark className="hero__wordmark" />
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
      <Goat n={14} className="goat--deco goat--tr" style={{ '--gty': '18px', '--gr': '-6deg' }} />
      <div className="container">
        <div className="value__head reveal">
          <Kicker vol="01">{t('value.kicker')}</Kicker>
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
  const { t, img } = useT()
  const custom = img('band', '')
  return (
    <section className="band reveal" aria-hidden="false">
      <picture>
        <source srcSet={custom || IMG(1)} media="(min-width: 720px)" />
        <img src={custom || IMG_SM(1)} alt="" loading="lazy" />
      </picture>
      <LooseLoop className="band__loop" />
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
      <Goat n={9} className="goat--deco goat--bl" style={{ '--gty': '-14px', '--gr': '7deg' }} />
      <div className="container clay">
        <div className="reveal">
          <Kicker vol="03">{t('clay.kicker')}</Kicker>
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
    const down = (e) => {
      e.preventDefault() // stop touch text-selection / callout
      holding.current = true
      start()
    }
    const up = () => {
      holding.current = false
    }
    const btn = document.getElementById('kiln-hold')
    btn.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      btn.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  const stages = t('kiln.stages')
  const stageIdx = heat < 0.25 ? 0 : heat < 0.75 ? 1 : 2
  const temp = Math.round(20 + heat * 1260)

  return (
    <section className="section kilnb" id="kiln">
      <Goat n={12} className="goat--deco goat--tr" style={{ '--gty': '40px', '--gr': '5deg' }} />
      <div className="container clay">
        <div className="reveal">
          <Kicker vol="08" wine>
            {t('kiln.kicker')}
          </Kicker>
          <h2 className="title">{t('kiln.title')}</h2>
          <p className="lead">{t('kiln.body')}</p>
          <div className="kilnb__gauge">
            <div className="kilnb__temp">{temp}°C</div>
            <div className="kilnb__bar">
              <div className="kilnb__fill" style={{ width: `${heat * 100}%` }} />
            </div>
            <div className="kilnb__stage">{stages[stageIdx]}</div>
          </div>
          <button id="kiln-hold" className="btn btn--wine btn--lg clay__reset no-select" style={{ touchAction: 'none' }}>
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
      <Goat n={14} className="goat--deco goat--bl" style={{ '--gty': '8px', '--gr': '-8deg' }} />
      <div className="container clay">
        <div className="reveal">
          <Kicker vol="10">{t('glaze.kicker')}</Kicker>
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
  const { t, img } = useT()
  return (
    <section className="section invite" id="invite">
      <div className="container">
        <div className="invite__head reveal">
          <Kicker vol="04" wine>
            {t('invite.kicker')}
          </Kicker>
          <h2 className="title">{t('invite.title')}</h2>
          <p className="lead">{t('invite.body')}</p>
        </div>

        {/* FEATURED — master classes */}
        <article className="feature reveal">
          <div className="feature__media">
            <img src={img('kurs', IMG(4))} alt="" loading="lazy" />
            <LooseLoop className="feature__loop" />
          </div>
          <div className="feature__body">
            <span className="tag tag--wine">✦ {t('invite.featured')}</span>
            <span className="feature__lead">{t('invite.kursLead')}</span>
            <h3>{t('invite.kursTitle')}</h3>
            <p>{t('invite.kursBody')}</p>
            <a className="btn btn--wine btn--lg" href="#booking">
              {t('nav.kurs')}
            </a>
            <Goat n={17} className="feature__goat" />
          </div>
        </article>

        {/* secondary — coworking + stylised map */}
        <div className="invite__row">
          <article className="invite__card reveal">
            <img src={img('cowork', IMG(6))} alt="" loading="lazy" />
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
  const { t, img } = useT()
  const items = t('types.items')
  const facts = t('types.facts')
  return (
    <section className="section section--alt" id="types">
      <Goat n={3} className="goat--deco goat--bl" style={{ '--gty': '-20px', '--gr': '6deg' }} />
      <div className="container">
        <div className="value__head reveal">
          <Kicker vol="06">{t('types.kicker')}</Kicker>
          <h2 className="title">{t('types.title')}</h2>
          <p className="lead">{t('types.body')}</p>
        </div>
        <div className="types__grid">
          {items.map((it, i) => (
            <article className="type reveal" key={i} tabIndex={0} style={{ transitionDelay: `${i * 0.07}s` }}>
              <div
                className="type__photo"
                style={{ backgroundImage: `url(${img('clay_' + CLAY_KEYS[i], `/assets/img/clay-${CLAY_KEYS[i]}.webp`)})` }}
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
      {goat && <img className="price__goat" src={goat} alt="" loading="lazy" draggable="false" />}
    </div>
  )
}
function Pricing() {
  const { t } = useT()
  const groups = t('pricing.groups') || []
  const rest = groups.slice(1)
  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="value__head reveal">
          <Kicker vol="09">{t('pricing.kicker')}</Kicker>
          <h2 className="title">{t('pricing.title')}</h2>
        </div>
        <div className="price__grid">
          {groups[0] && (
            <PriceCard data={groups[0]} note={groups[0].note} goat="/assets/maskot/goat_coin.webp" />
          )}
          {rest.length > 0 && (
            <div className="price__col">
              {rest.map((g, i) => (
                <PriceCard
                  key={i}
                  data={g}
                  note={g.note}
                  goat={i === rest.length - 1 ? '/assets/maskot/goat_potter.webp' : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Master ---------------- */
function Master() {
  const { t, img } = useT()
  return (
    <section className="section section--wine" id="master">
      <Goat n={11} className="goat--deco goat--tr" style={{ '--gty': '28px', '--gr': '-5deg' }} />
      <div className="container master">
        <div className="master__photo reveal">
          <img src={img('master', IMG(3))} alt={t('master.name')} loading="lazy" />
          <Burst className="master__burst" />
        </div>
        <div className="reveal">
          <Kicker vol="02" wine>
            {t('master.kicker')}
          </Kicker>
          <div className="master__name">{t('master.name')}</div>
          <p className="lead">{t('master.body')}</p>
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
            <Logo className="footer__logo" />
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
        <div className="footer__goats">
          {[1, 13, 8, 15, 6, 18].map((n) => (
            <Goat key={n} n={n} className="footer__goat" />
          ))}
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Astrelle · {t('footer.rights')}</span>
          <span>✦ {t('footer.made')}</span>
        </div>
      </div>
    </footer>
  )
}

// One stacked block: a tall .panel (scroll runway) whose .panel__pin sticks to
// the viewport while .panel__inner translates up to reveal the block's content;
// the next .panel overlaps this one (negative margin) and rides up over it.
function Panel({ children }) {
  return (
    <div className="panel">
      <div className="panel__pin">
        <div className="panel__inner">{children}</div>
      </div>
    </div>
  )
}

// Capture-stack controller. On desktop + motion-safe it adds `.stacked` to
// .content and, per block: sizes the panel to (content height + one viewport of
// "ride"), pins it, and on scroll translates the inner up — first to read the
// block fully, then a gentle extra lift as the next block covers it. The next
// block's -100vh margin makes it overlap and ride up over this one.
function useStack(dep) {
  useEffect(() => {
    // Pointer-based device split: a real mouse/trackpad (laptops & desktops) gets the
    // FULL capture-stack across every block; touch devices (phones & tablets) get the
    // HERO-ONLY intro (mug freeze→lift) and then plain native scrolling — this keeps
    // mobile light (no stack of overlapping WebGL canvases = no scroll lag).
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const wide = window.matchMedia('(min-width: 941px)')
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const content = document.querySelector('.content')
    if (!content) return
    const docEl = document.documentElement
    let panels = []
    let mode = 'none' // 'full' | 'hero' | 'none'
    let raf = 0
    let ro = null

    const clearAll = () => {
      docEl.classList.remove('stacked', 'stacked-hero')
      docEl.style.removeProperty('--vh')
      panels.forEach((p) => {
        p.style.height = ''
        const inner = p.querySelector('.panel__inner')
        if (inner) inner.style.transform = ''
        const pin = p.querySelector('.panel__pin')
        if (pin) pin.style.transform = ''
      })
      ro?.disconnect()
    }

    // hero geometry (shared by both modes): cupY = mug bottom, r = full-cover scroll point
    const measureHero = (vh) => {
      const hero = panels[0]
      if (!hero) return
      const inner = hero.querySelector('.panel__inner')
      const ih = inner.scrollHeight
      hero.style.height = ih + vh + 'px' // pin runway = one viewport
      const stage = hero.querySelector('.hero__stage')
      const stageTop = stage ? stage.getBoundingClientRect().top - inner.getBoundingClientRect().top : 0
      hero.dataset.cupy = String(stage ? stageTop + stage.offsetHeight * 0.8 : vh * 0.55)
      hero.dataset.r = String(ih) // = heroHeight - vh
    }
    const moveHero = () => {
      const hero = panels[0]
      if (!hero) return
      const inner = hero.querySelector('.panel__inner')
      const cupY = +hero.dataset.cupy || 0
      const r = +hero.dataset.r || 0
      const a = r - cupY // phase-1 length: scroll until cover reaches the mug
      const sy = -hero.getBoundingClientRect().top
      const lift = Math.min(Math.max(sy - a, 0), cupY)
      inner.style.transform = 'translateY(' + -lift + 'px)'
    }

    const layout = () => {
      const vh = window.innerHeight
      // drive the pin/margin heights from the REAL viewport so CSS (var(--vh)) and
      // the JS transforms agree — critical on mobile where 100vh ≠ innerHeight.
      docEl.style.setProperty('--vh', vh + 'px')
      if (mode === 'hero') {
        measureHero(vh)
        return
      }
      panels.forEach((p, i) => {
        const inner = p.querySelector('.panel__inner')
        const ih = inner.scrollHeight // >= vh via min-height:100vh
        const read = Math.max(0, ih - vh)
        const ride = i === panels.length - 1 ? 0 : vh // last block: nothing covers it
        p.style.height = ih + ride + 'px'
        p.dataset.read = String(read)
        p.dataset.ride = String(ride)
        if (i === 0) {
          const stage = p.querySelector('.hero__stage')
          const stageTop = stage ? stage.getBoundingClientRect().top - inner.getBoundingClientRect().top : 0
          p.dataset.cupy = String(stage ? stageTop + stage.offsetHeight * 0.8 : vh * 0.55)
          p.dataset.r = String(ih + ride - vh) // = ih ≈ vh
        }
      })
    }
    const update = () => {
      raf = 0
      if (mode === 'hero') {
        moveHero()
        return
      }
      panels.forEach((p, i) => {
        const inner = p.querySelector('.panel__inner')
        if (i === 0) {
          const cupY = +p.dataset.cupy || 0
          const r = +p.dataset.r || 0
          const a = r - cupY
          const sy = -p.getBoundingClientRect().top
          const lift = Math.min(Math.max(sy - a, 0), cupY)
          inner.style.transform = 'translateY(' + -lift + 'px)'
          return
        }
        const read = +p.dataset.read || 0
        const ride = +p.dataset.ride || 0
        const top = p.getBoundingClientRect().top
        const scrolled = Math.min(Math.max(-top, 0), read + ride)
        const readT = Math.min(scrolled, read) // scroll the content through
        const lift = Math.max(0, scrolled - read) * 0.42 // drift up while covered
        inner.style.transform = 'translateY(' + -(readT + lift) + 'px)'
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const relayout = () => {
      if (mode === 'none') return
      layout()
      update()
    }
    const setup = () => {
      cancelAnimationFrame(raf)
      raf = 0
      clearAll()
      panels = Array.from(content.querySelectorAll(':scope > .panel'))
      if (calm.matches) {
        mode = 'none'
        panels = []
        return
      }
      if (fine.matches && wide.matches) {
        mode = 'full'
        docEl.classList.add('stacked')
        layout()
        update()
        ro = new ResizeObserver(relayout)
        panels.forEach((p) => ro.observe(p.querySelector('.panel__inner')))
      } else {
        mode = 'hero'
        docEl.classList.add('stacked-hero')
        layout()
        update()
        ro = new ResizeObserver(relayout)
        const hi = panels[0]?.querySelector('.panel__inner')
        if (hi) ro.observe(hi)
      }
    }
    setup()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', relayout)
    window.addEventListener('load', relayout)
    fine.addEventListener('change', setup)
    wide.addEventListener('change', setup)
    calm.addEventListener('change', setup)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', relayout)
      window.removeEventListener('load', relayout)
      fine.removeEventListener('change', setup)
      wide.removeEventListener('change', setup)
      calm.removeEventListener('change', setup)
      cancelAnimationFrame(raf)
      clearAll()
    }
  }, [dep]) // re-run when the panel set changes (e.g. studio gallery appears)
}

export default function App() {
  const root = useReveal()
  const { lang } = useT()
  const [gallery, setGallery] = useState([])
  useEffect(() => {
    let alive = true
    fetchGallery().then((rows) => alive && setGallery(rows)).catch(() => {})
    return () => { alive = false }
  }, [])
  useEffect(() => initAnalytics(), [])
  // "Записаться" links: in the capture-stack the calendar's raw position lands mid-cover,
  // so scroll to the SETTLED spot where the calendar is shown and nothing rides over it yet.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href="#booking"]')
      if (!a) return
      e.preventDefault()
      const cal = document.getElementById('booking')
      if (!cal) return
      if (document.documentElement.classList.contains('stacked')) {
        const bookingPanel = cal.closest('.panel')
        const panels = Array.from(document.querySelectorAll('.content > .panel'))
        let top = 0
        for (const p of panels) {
          if (p === bookingPanel) break
          top += p.querySelector('.panel__inner').scrollHeight
        }
        const inner = bookingPanel.querySelector('.panel__inner')
        const calTop = cal.getBoundingClientRect().top - inner.getBoundingClientRect().top
        // clamp to the booking panel's "read" phase so we stay pinned & clean
        // (never overshoot into the zone where the next block rides over it)
        const read = Math.max(0, inner.scrollHeight - window.innerHeight)
        const offset = Math.min(Math.max(0, calTop - 96), read)
        window.scrollTo({ top: Math.max(0, top + offset), behavior: 'smooth' })
      } else {
        cal.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  useStack(gallery.length > 0)
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
      <Topbar />
      <main className={`content ${fading ? 'content--fading' : ''}`}>
        <Panel><Hero /></Panel>
        <Panel><Value /></Panel>
        <Panel><Master /></Panel>
        {gallery.length > 0 && <Panel><StudioGallery items={gallery} /></Panel>}
        <Panel><Band /></Panel>
        <Panel><ClayPlay /></Panel>
        <Panel><Invitation /></Panel>
        <Panel><ProcessTimeline /></Panel>
        <Panel><ClayTypes /></Panel>
        <Panel><Shrink /></Panel>
        <Panel><KilnBlock /></Panel>
        <Panel><Pricing /></Panel>
        <Panel><GlazeBlock /></Panel>
        <Panel><BookingCalendar /></Panel>
        <Panel><Footer /></Panel>
      </main>
      <Mascot />
    </div>
  )
}
