import { Fragment, lazy, Suspense, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { T, Img, List, Section, useEdit } from '../content/edit.jsx'
import { listEvents } from '../lib/supabase.js'
import Goat from '../components/Goat.jsx'
import { Shape, Print, Hands, Spark } from '../components/Shapes.jsx'
// three.js is ~300 KB gzipped — load it only on pages that actually show a model
const HeroMug = lazy(() => import('../three/HeroMug.jsx'))

const IMG = (n) => `/assets/img/photo-${n}.webp`
const pad2 = (n) => String(n + 1).padStart(2, '0')

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
            <NavLink className="btn btn--primary btn--lg" to="/kalendarz">
              <T k="hero.cta" />
            </NavLink>
            <a className="btn btn--lg" href="#pricing">
              <T k="hero.cta2" />
            </a>
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
      <Shape name="jar" className="say__obj say__obj--jar" />
    ) : kind === 'photo' ? (
      <Img k="hero_1" fallback={IMG(1)} className="say__obj say__obj--photo" alt="" />
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

/* ---------------- Voucher: the gift card ---------------- */
export function Voucher() {
  return (
    <Section id="voucher" label="Voucher" className="vou">
      <div className="container vou__in">
        <div className="vou__card">
          <Img k="voucher" fallback="/assets/img/voucher.webp" className="vou__img" alt="" />
          <Goat n={17} className="vou__goat" />
        </div>
        <div className="vou__body">
          <span className="label"><T k="voucher.label" /></span>
          <T k="voucher.title" as="h2" className="h2" />
          <T k="voucher.text" as="p" className="vou__text" multiline />
          <NavLink className="btn" to="/kalendarz#voucher">
            <T k="voucher.btn" /> →
          </NavLink>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Formats: numbered cards in a mosaic with pots, a photo and a goat ---------------- */
export function Formats() {
  const { t } = useT()
  const count = (t('formats.items') || []).length
  return (
    <Section id="formats" label="Форматы (01/02/03)" className="fmt">
      <div className="container">
        <T k="formats.label" as="h2" className="h2" />
        <div className={`fmt__mosaic ${count > 3 ? 'has-4' : ''}`}>
          <List
            k="formats.items"
            className="fmt__grid"
            max={4}
            template={{ t: 'Nowy format', d: '', meta: '' }}
            render={(it, i, p) => (
              <article className="card fcard" key={i}>
                <span className="card__num">{pad2(i)}</span>
                <T k={`${p}.t`} as="h3" className="fcard__t" />
                <T k={`${p}.d`} as="p" className="fcard__d" multiline />
                <div className="fcard__foot">
                  <T k={`${p}.meta`} as="span" className="fcard__meta" />
                  <NavLink className="fcard__go" to="/kalendarz" aria-label={t('formats.cta')}>
                    →
                  </NavLink>
                </div>
              </article>
            )}
          />
          <div className="fmt__d fmt__d--mug" aria-hidden="true"><Shape name="mug" /></div>
          <div className="fmt__d fmt__d--photo"><Img k="band" fallback={IMG(6)} className="fmt__photo" alt="" /></div>
          <div className="fmt__d fmt__d--goat" aria-hidden="true"><Goat n={14} /></div>
          <div className="fmt__d fmt__d--pots" aria-hidden="true">
            <Shape name="jar" />
            <Shape name="bowl" />
          </div>
          <div className="fmt__d fmt__d--rings" aria-hidden="true"><Print n={12} seed={4} /></div>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Nearest dates: a plain table straight from the calendar ---------------- */
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
export function Terms() {
  const { t, lang } = useT()
  const ed = useEdit()
  const [rows, setRows] = useState([])
  useEffect(() => {
    let alive = true
    const now = new Date()
    listEvents(now.toISOString(), new Date(now.getTime() + 60 * 864e5).toISOString())
      .then((r) => alive && setRows(r.filter((e) => new Date(e.starts_at) > now).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)).slice(0, 5)))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  // nothing in the calendar yet → the section stays off the site
  if (rows.length === 0 && !ed) return null
  const time = (iso) => new Date(iso).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
  return (
    <Section id="terms" label="Ближайшие даты" className="terms">
      <div className="container">
        <div className="terms__head">
          <T k="terms.title" as="h2" className="h2" />
          <NavLink className="btn btn--sm" to="/kalendarz">
            <T k="terms.all" />
          </NavLink>
        </div>
        {rows.length === 0 ? (
          <p className="terms__empty">Таблица появится на сайте сама, когда в календаре будут опубликованные занятия.</p>
        ) : (
          <div className="terms__table" role="table">
            <div className="terms__row terms__row--head" role="row">
              <span role="columnheader"><T k="terms.date" /></span>
              <span role="columnheader"><T k="terms.time" /></span>
              <span role="columnheader"><T k="terms.what" /></span>
              <span role="columnheader"><T k="terms.seats" /></span>
              <span role="columnheader"><T k="terms.price" /></span>
              <span />
            </div>
            {rows.map((e) => {
              const d = new Date(e.starts_at)
              const left = Math.max(0, e.capacity - (e.booked || 0))
              const title = e.title || t(e.type === 'coworking' ? 'calendar.cw' : 'calendar.cls')
              return (
                <NavLink className={`terms__row ${left === 0 ? 'is-full' : ''}`} role="row" to="/kalendarz" key={e.id}>
                  <span className="terms__date" role="cell">
                    {d.toLocaleDateString(lang, { day: 'numeric', month: 'short' })} <i>{cap(d.toLocaleDateString(lang, { weekday: 'short' }).replace('.', ''))}</i>
                  </span>
                  <span className="terms__time" role="cell">{time(e.starts_at)}</span>
                  <span className="terms__what" role="cell">{title}{e.theme ? ` · ${e.theme}` : ''}</span>
                  <span className="terms__seats" role="cell">{left === 0 ? t('calendar.full') : left}</span>
                  <span className="terms__price" role="cell">{e.price || '—'}</span>
                  <span className="terms__go" role="cell"><span className="btn btn--sm">{left === 0 ? t('calendar.waitlist') : t('calendar.book')}</span></span>
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    </Section>
  )
}

/* ---------------- Steps: how it works ---------------- */
const STEP_SHAPES = ['cup', 'plate', 'jar']
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

/* ---------------- Master + studio cards ---------------- */
export function Master() {
  const { studio } = useT()
  return (
    <Section id="master" label="Мастер и студия" className="team">
      <div className="container team__grid">
        <div className="team__photo-wrap">
          <Img k="master" fallback={IMG(3)} alt="Stasia Kulik" className="team__photo" />
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
                {i === 0 && (
                  <a className="team__map" href={studio.maps} target="_blank" rel="noreferrer">
                    <T k="master.map" /> ↗
                  </a>
                )}
              </article>
            )}
          />
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Pricing: ruled rows ---------------- */
export function Pricing() {
  return (
    <Section id="pricing" label="Цены" className="price">
      <div className="container">
        <div className="price__head">
          <T k="pricing.title" as="h2" className="h2" />
          <Shape name="bowl" className="price__shape" />
        </div>
        <List
          k="pricing.groups"
          className="price__grid"
          max={6}
          template={{ title: 'Nowa grupa', rows: [{ l: '', r: '' }], note: '' }}
          render={(g, i, p) => (
            <div className="price__group" key={i}>
              <T k={`${p}.title`} as="h3" />
              <List
                k={`${p}.rows`}
                className="price__rows"
                max={12}
                template={{ l: '', r: '' }}
                render={(row, j, rp) => (
                  <div className="price__row" key={j}>
                    <T k={`${rp}.l`} as="span" className="price__l" />
                    <T k={`${rp}.r`} as="span" className="price__r" />
                  </div>
                )}
              />
              <T k={`${p}.note`} as="p" className="price__note" multiline />
            </div>
          )}
        />
      </div>
    </Section>
  )
}

/* ---------------- Facts strip ---------------- */
const FACT_SHAPES = ['jar', 'cup', 'bowl', 'mug', 'bottle', 'plate']
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
          <NavLink className="btn btn--primary btn--lg" to="/kalendarz">
            <T k="cta.btn" /> →
          </NavLink>
        </div>
      </div>
    </Section>
  )
}
