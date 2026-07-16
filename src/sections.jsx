import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT, LangSwitch } from './i18n/index.jsx'
import { Logo, Wordmark } from './components/Brand.jsx'
import { Goat, LooseLoop, Burst, Kicker } from './components/Decor.jsx'
import { NAV } from './components/Topbar.jsx'
import HeroMug from './three/HeroMug.jsx'
import ClaySculpt from './three/ClaySculpt.jsx'
import Kiln from './three/Kiln.jsx'
import GlazePaint from './three/GlazePaint.jsx'
import StyledMap from './StyledMap.jsx'
import InView from './InView.jsx'

const IMG = (n) => `/assets/img/photo-${n}.webp`
const IMG_SM = (n) => `/assets/img/photo-${n}-sm.webp`

/* ---------------- Hero ---------------- */
export function Hero() {
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
export function Value() {
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
export function Band() {
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
export function ClayPlay() {
  const { t } = useT()
  const [reset, setReset] = useState(0)
  const [glazed, setGlazed] = useState(false)
  return (
    <section className="section section--alt" id="clay">
      <Goat n={9} className="goat--deco goat--bl" style={{ '--gty': '-14px', '--gr': '7deg' }} />
      <div className="container clay">
        <div className="reveal">
          <Kicker vol="01">{t('clay.kicker')}</Kicker>
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
export function KilnBlock() {
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
          <Kicker vol="04" wine>
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
            {t('kiln.hold')}
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
export function GlazeBlock() {
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
          <Kicker vol="05">{t('glaze.kicker')}</Kicker>
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
export function Invitation() {
  const { t, img } = useT()
  return (
    <section className="section invite" id="invite">
      <div className="container">
        <div className="invite__head reveal">
          <Kicker vol="01" wine>
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
export function ClayTypes() {
  const { t, img } = useT()
  const items = t('types.items')
  const facts = t('types.facts')
  return (
    <section className="section" id="types">
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

/* ---------------- Fun facts (home) ---------------- */
export function HomeFacts() {
  const { t } = useT()
  const items = t('homefacts.facts') || []
  return (
    <section className="section section--alt hfacts" id="facts">
      <Goat n={5} className="goat--deco goat--tr" style={{ '--gty': '26px', '--gr': '-7deg' }} />
      <div className="container">
        <div className="value__head reveal">
          <Kicker vol="04" wine>
            {t('homefacts.kicker')}
          </Kicker>
          <h2 className="title">{t('homefacts.title')}</h2>
          <p className="lead">{t('homefacts.body')}</p>
        </div>
        <div className="facts facts--home">
          {items.map((f, i) => (
            <div className="fact reveal" key={i} style={{ transitionDelay: `${i * 0.06}s` }}>
              <span>✦</span>
              <p>{f}</p>
            </div>
          ))}
        </div>
        <div className="hfacts__more reveal">
          <NavLink className="btn btn--ghost" to="/proces">
            {t('homefacts.btn')} →
          </NavLink>
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
export function Pricing() {
  const { t } = useT()
  const groups = t('pricing.groups') || []
  const rest = groups.slice(1)
  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="value__head reveal">
          <Kicker vol="02">{t('pricing.kicker')}</Kicker>
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
export function Master() {
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
export function Footer() {
  const { t } = useT()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <Logo className="footer__logo" />
            <p className="footer__tag">{t('footer.tagline')}</p>
          </div>
          <nav className="footer__nav" aria-label="Menu">
            {NAV.map(([to, key]) => (
              <NavLink key={to} to={to} end={to === '/'} className="footer__navlink">
                {t(key)}
              </NavLink>
            ))}
            <a className="footer__navlink" href="#booking">
              {t('nav.book')}
            </a>
          </nav>
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
