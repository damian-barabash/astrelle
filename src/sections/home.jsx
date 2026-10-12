import { Fragment, lazy, Suspense } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { T, Img, List, Section, useEdit } from '../content/edit.jsx'
import Goat from '../components/Goat.jsx'
import Out, { Tel } from '../components/Out.jsx'
import PhotoArt from '../components/PhotoArt.jsx'
import { Shape, Print, Hands, Spark, Seal } from '../components/Shapes.jsx'
import { OFFERS, PLACES, withOverrides, priceText } from '../data/offers.js'
// three.js is ~300 KB gzipped — load it only on pages that actually show a model
const HeroMug = lazy(() => import('../three/HeroMug.jsx'))

const pad2 = (n) => String(n + 1).padStart(2, '0')

// offers as the admin left them (price / link overrides, hidden ones dropped)
export function useOffers() {
  const { partner } = useT()
  return withOverrides(OFFERS, partner)
}
// "od 220 zł" for a whole group: its cheapest offer
function groupFrom(offers, group, from) {
  const nums = offers.filter((o) => o.group === group && !o.soon).map((o) => Number(o.price)).filter((n) => n > 0)
  return nums.length ? `${from} ${Math.min(...nums)} zł` : ''
}

/* ---------------- Hero: two short lines + paper-cut pots with the 3D mug in front ---------------- */
export function Hero() {
  return (
    <Section id="hero" label="Hero" className="hero">
      <div className="container hero__in">
        <h1 className="hero__title">
          <span className="hero__line">
            <T k="hero.h1" />
            {/* small caps hanging next to the first line, like a stamp under a pot */}
            <small className="hero__kicks">
              <T k="hero.k1" />
              <T k="hero.k2" />
            </small>
          </span>
          <span className="hero__line">
            <T k="hero.h2" />
          </span>
        </h1>
        <div className="hero__copy">
          <div className="hero__cols">
            <T k="hero.p1" as="p" multiline />
            <T k="hero.p2" as="p" multiline />
          </div>
          <div className="hero__actions">
            <NavLink className="btn btn--primary btn--lg" to="/warsztaty">
              <T k="hero.cta" />
            </NavLink>
            <Out className="btn btn--lg" to="schedule" place="hero">
              <T k="hero.cta2" /> ↗
            </Out>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <Print n={15} seed={3} className="hero__rings" />
          <Shape name="bottle" className="hero__bottle" />
          <Print n={8} seed={5} className="hero__stamp" />
          <Spark className="hero__spark hero__spark--a" />
          <Spark className="hero__spark hero__spark--b" />
          <div className="hero__mug">
            <div className="hero__stage">
              <Suspense fallback={null}>
                <HeroMug />
              </Suspense>
            </div>
          </div>
          <Goat n={2} className="hero__goat" />
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Statement: one big sentence with pots, a photo and a goat set into the lines ---------------- */
export function Band() {
  const { t } = useT()
  const ed = useEdit()
  const words = String(t('band.caption') || '').split(/\s+/).filter(Boolean)
  const n = words.length
  // where the little objects sit: after roughly a fifth, a half and four fifths of the sentence
  const at = { [Math.max(0, Math.round(n * 0.2) - 1)]: 'jar', [Math.max(1, Math.round(n * 0.5) - 1)]: 'photo', [Math.max(2, Math.round(n * 0.8) - 1)]: 'goat' }
  const deco = (kind) =>
    kind === 'jar' ? (
      <Shape name="teapot" className="say__obj say__obj--jar" />
    ) : kind === 'photo' ? (
      <Img k="hero_1" fallback="/assets/img/s-hand-sm.webp" className="say__obj say__obj--photo" alt="" />
    ) : (
      <Goat n={13} className="say__obj say__obj--goat" />
    )
  return (
    <Section id="band" label="Фраза" className="say">
      <div className="container">
        {ed ? (
          <T k="band.caption" as="p" className="say__text" multiline />
        ) : (
          <p className="say__text">
            {words.map((w, i) => (
              <Fragment key={i}>
                {w}
                {at[i] ? <> {deco(at[i])}</> : null}{' '}
              </Fragment>
            ))}
            <Print n={9} seed={2} className="say__obj say__obj--print" />
          </p>
        )}
      </div>
    </Section>
  )
}

/* ---------------- Partner: who we are, where the classes happen, who sells them ---------------- */
const POINT_SHAPES = ['pin', 'arch', 'cup']
export function Partner() {
  const { t } = useT()
  return (
    <Section id="partner" label="Как мы работаем (партнёр)" className="duo">
      <div className="container duo__in">
        <div className="duo__art">
          <PhotoArt photo="bench" shape="vase" variant="a" />
          <Seal text={t('partner.seal')} className="duo__seal">
            <path d="M0-30c2 20 9 27 30 30-21 3-28 10-30 30-2-20-9-27-30-30 21-3 28-10 30-30z" fill="currentColor" />
          </Seal>
        </div>
        <div className="duo__body">
          <span className="label"><T k="partner.label" /></span>
          <T k="partner.title" as="h2" className="h2" />
          <T k="partner.text" as="p" className="duo__text" multiline />
          <List
            k="partner.points"
            className="duo__points"
            max={4}
            template={{ t: '', d: '' }}
            render={(it, i, p) => (
              <div className="duo__point" key={i}>
                <Shape name={POINT_SHAPES[i % POINT_SHAPES.length]} className="duo__ic" />
                <T k={`${p}.t`} as="h3" />
                <T k={`${p}.d`} as="p" multiline />
              </div>
            )}
          />
          <Out className="btn" to="site" place="home-partner">
            <T k="partner.btn" /> ↗
          </Out>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Formats: the four kinds of classes in a mosaic with pots, a photo and a goat ---------------- */
const KINDS = ['hand', 'wheel', 'paint', 'family']
export function Formats() {
  const { t } = useT()
  const offers = useOffers()
  return (
    <Section id="formats" label="Форматы (01–04)" className="fmt">
      <div className="container">
        <div className="fmt__head">
          <T k="formats.label" as="h2" className="h2" />
          <NavLink className="btn btn--sm" to="/warsztaty">
            <T k="formats.more" /> →
          </NavLink>
        </div>
        <div className="fmt__mosaic has-4">
          <div className="fmt__grid">
            {KINDS.map((g, i) => (
              <article className="card fcard" key={g}>
                <span className="card__num">{pad2(i)}</span>
                <T k={`offers.groups.${g}.t`} as="h3" className="fcard__t" />
                <T k={`offers.groups.${g}.d`} as="p" className="fcard__d" multiline />
                <div className="fcard__foot">
                  <span className="fcard__meta">{groupFrom(offers, g, t('offers.from'))}</span>
                  <NavLink className="fcard__go" to={`/warsztaty#${g}`} aria-label={t(`offers.groups.${g}.t`)}>
                    →
                  </NavLink>
                </div>
              </article>
            ))}
          </div>
          <div className="fmt__d fmt__d--mug" aria-hidden="true"><Shape name="teapot" /></div>
          <div className="fmt__d fmt__d--photo"><Img k="band" fallback="/assets/img/s-wheel-sm.webp" className="fmt__photo" alt="" /></div>
          <div className="fmt__d fmt__d--goat" aria-hidden="true"><Goat n={14} /></div>
          <div className="fmt__d fmt__d--pots" aria-hidden="true">
            <Shape name="vase" />
            <Shape name="bowl" />
          </div>
        </div>
        {/* for those who already throw: the open-studio membership */}
        <div className="strip">
          <Shape name="kiln" className="strip__shape" />
          <div className="strip__text">
            <T k="formats.stripT" as="h3" />
            <T k="formats.stripD" as="p" multiline />
          </div>
          <NavLink className="btn" to="/warsztaty/membership">
            <T k="formats.stripBtn" /> →
          </NavLink>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Steps: how it works ---------------- */
const STEP_SHAPES = ['cup', 'arch', 'jar']
export function Steps() {
  return (
    <Section id="steps" label="Как это работает" className="steps">
      <div className="container">
        <T k="steps.label" as="h2" className="h2" />
        <List
          k="steps.items"
          className="steps__grid"
          max={4}
          template={{ t: '', d: '' }}
          render={(it, i, p) => (
            <div className="step" key={i}>
              <div className="step__top">
                <span className="step__num">{pad2(i)}</span>
                <Shape name={STEP_SHAPES[i % STEP_SHAPES.length]} className="step__shape" />
              </div>
              <T k={`${p}.t`} as="h3" />
              <T k={`${p}.d`} as="p" multiline />
            </div>
          )}
        />
      </div>
    </Section>
  )
}

/* ---------------- Master ---------------- */
export function Master() {
  return (
    <Section id="master" label="Мастер" className="team">
      <div className="container team__grid">
        <div className="team__photo-wrap">
          <Img k="master" fallback="/assets/img/photo-3.webp" alt="Stasia Kulik" className="team__photo" />
          <Print n={9} seed={8} className="team__print" />
          <Goat n={11} className="team__goat" />
        </div>
        <div className="team__body">
          <span className="label"><T k="master.label" /></span>
          <T k="master.name" as="h2" className="h2" />
          <T k="master.role" as="span" className="team__role" />
          <T k="master.bio" as="p" className="team__bio" multiline />
          <List
            k="master.cards"
            className="team__cards"
            max={4}
            template={{ t: '', d: '' }}
            render={(it, i, p) => (
              <article className="card team__card" key={i}>
                <span className="card__num">{pad2(i)}</span>
                <T k={`${p}.t`} as="h3" />
                <T k={`${p}.d`} as="p" multiline />
              </article>
            )}
          />
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Voucher: a paper ticket, sold by the studio ---------------- */
export function VoucherTicket({ className = '' }) {
  return (
    <div className={`tick ${className}`} aria-hidden="true">
      <Shape name="ticket" className="tick__paper" />
      <div className="tick__in">
        <span className="tick__k">Wizards of Art</span>
        <span className="tick__t">Voucher</span>
        <span className="tick__k">ceramika · Warszawa</span>
      </div>
      <Print n={8} seed={4} className="tick__print" />
      <Spark className="tick__spark" />
    </div>
  )
}
export function Voucher() {
  return (
    <Section id="voucher" label="Voucher" className="vou">
      <div className="container vou__in">
        <div className="vou__card">
          <VoucherTicket />
          <Goat n={17} className="vou__goat" />
        </div>
        <div className="vou__body">
          <span className="label"><T k="voucher.label" /></span>
          <T k="voucher.title" as="h2" className="h2" />
          <T k="voucher.text" as="p" className="vou__text" multiline />
          <NavLink className="btn" to="/voucher">
            <T k="voucher.btn" /> →
          </NavLink>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Pricing: the studio's price list, every row leads to its page ---------------- */
const PRICE_GROUPS = ['hand', 'wheel', 'family', 'paint', 'studio']
export function Pricing() {
  const { t } = useT()
  const offers = useOffers()
  return (
    <Section id="pricing" label="Цены" className="price">
      <div className="container">
        <div className="price__head">
          <T k="pricing.title" as="h2" className="h2" />
          <Shape name="tag" className="price__shape" />
        </div>
        <div className="price__grid">
          {PRICE_GROUPS.map((g) => {
            const rows = offers.filter((o) => o.group === g)
            if (!rows.length) return null
            return (
              <div className="price__group" key={g}>
                <T k={`offers.groups.${g}.t`} as="h3" />
                <div className="price__rows">
                  {rows.map((o) => (
                    <NavLink className="price__row" to={`/warsztaty/${o.id}`} key={o.id}>
                      <span className="price__l">{t(`offers.items.${o.id}.t`)}</span>
                      <span className="price__r">{priceText(o, t('offers.from'))}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <T k="pricing.note" as="p" className="price__note" multiline />
      </div>
    </Section>
  )
}

/* ---------------- Where: the two studios ---------------- */
export function Where() {
  return (
    <Section id="where" label="Где (адреса)" className="where">
      <div className="container">
        <T k="where.title" as="h2" className="h2" />
        <div className="where__grid">
          {Object.entries(PLACES).map(([id, pl], i) => (
            <article className="card where__card" key={id}>
              <span className="card__num">{pad2(i)}</span>
              <Shape name="pin" className="where__pin" />
              <T k={`where.${id}.t`} as="h3" />
              <p className="where__addr">{pl.street}</p>
              <T k={`where.${id}.d`} as="p" multiline />
              <a className="where__map" href={pl.maps} target="_blank" rel="noreferrer">
                <T k="where.map" /> ↗
              </a>
            </article>
          ))}
          <div className="where__side">
            <span className="label"><T k="where.hoursLabel" /></span>
            <List k="where.hours" className="where__hours" max={7} template="" render={(h, i, p) => <T k={p} as="span" key={i} />} />
            <span className="label where__lbl2"><T k="where.phoneLabel" /></span>
            <Tel place="home-where" className="where__tel" />
            <T k="where.note" as="p" className="where__note" multiline />
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Facts strip ---------------- */
const FACT_SHAPES = ['jar', 'kiln', 'brush', 'mug', 'bottle', 'plate']
export function Facts() {
  return (
    <Section id="facts" label="Факты" className="facts">
      <div className="container">
        <span className="label"><T k="facts.label" /></span>
        <List
          k="facts.items"
          className="facts__grid"
          max={6}
          template=""
          render={(f, i, p) => (
            <div className="fact" key={i}>
              <Shape name={FACT_SHAPES[i % FACT_SHAPES.length]} className="fact__shape" />
              <T k={p} as="p" multiline />
            </div>
          )}
        />
      </div>
      <Hands className="facts__hands" />
    </Section>
  )
}

/* ---------------- CTA ---------------- */
export function Cta() {
  return (
    <Section id="cta" label="Призыв (запись)" className="ctab">
      <div className="container">
        <div className="ctab__in">
          <Goat n={5} className="ctab__goat" />
          <div className="ctab__text">
            <T k="cta.title" as="h2" className="h2" />
            <T k="cta.sub" as="p" multiline />
          </div>
          <Out className="btn btn--primary btn--lg" to="schedule" place="home-cta">
            <T k="cta.btn" /> ↗
          </Out>
        </div>
      </div>
    </Section>
  )
}
