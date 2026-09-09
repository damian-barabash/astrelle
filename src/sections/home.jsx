import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { T, Img, List, Section, useEdit } from '../content/edit.jsx'
import Goat from '../components/Goat.jsx'
import HeroMug from '../three/HeroMug.jsx'

const IMG = (n) => `/assets/img/photo-${n}.webp`
const pad2 = (n) => String(n + 1).padStart(2, '0')

/* ---------------- Hero: statement + two short columns + the 3D mug in a big frame ---------------- */
export function Hero() {
  return (
    <Section id="hero" label="Hero" className="hero">
      <div className="container">
        <h1 className="hero__title">
          <T k="hero.l1" as="span" className="hero__line" />
          <T k="hero.l2" as="span" className="hero__line" />
          <T k="hero.l3" as="span" className="hero__line hero__line--accent" />
        </h1>
        <div className="hero__cols">
          <T k="hero.col1" as="p" multiline />
          <T k="hero.col2" as="p" multiline />
        </div>
        <div className="hero__actions">
          <NavLink className="btn btn--primary btn--lg" to="/kalendarz">
            <T k="hero.cta" />
          </NavLink>
          <a className="btn btn--lg" href="#pricing">
            <T k="hero.cta2" />
          </a>
        </div>
        <div className="hero__frame">
          <div className="hero__stage">
            <HeroMug />
          </div>
          <span className="hero__tag hero__tag--tl"><T k="hero.tag1" /></span>
          <span className="hero__tag hero__tag--br"><T k="hero.tag2" /></span>
          <Goat n={14} className="hero__goat" />
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Formats: 01 / 02 / 03 rows that open on click ---------------- */
export function Formats() {
  const [open, setOpen] = useState(0)
  const ed = useEdit()
  return (
    <Section id="formats" label="Форматы (01/02/03)" className="fmt">
      <div className="container">
        <span className="label"><T k="formats.label" /></span>
        <List
          k="formats.items"
          className="fmt__rows"
          template={{ t: 'Nowy format', d: '', meta: '' }}
          render={(it, i, p) => {
            const isOpen = open === i
            return (
              <div className={`fmt__row ${isOpen ? 'is-open' : ''}`} key={i}>
                <div className="fmt__head" onClick={() => !ed && setOpen(isOpen ? -1 : i)}>
                  <span className="fmt__num">{pad2(i)}.</span>
                  <T k={`${p}.t`} as="h2" className="fmt__title" />
                  <button type="button" className="fmt__toggle" aria-expanded={isOpen} aria-label={isOpen ? '−' : '+'} onClick={(e) => { e.stopPropagation(); setOpen(isOpen ? -1 : i) }}>
                    <span />
                    <span />
                  </button>
                </div>
                <div className="fmt__body">
                  <div className="fmt__body-in">
                    <T k={`${p}.d`} as="p" multiline />
                    <div className="fmt__meta">
                      <T k={`${p}.meta`} as="span" className="tag" />
                      <NavLink className="btn btn--sm" to="/kalendarz">
                        <T k="formats.cta" /> →
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>
            )
          }}
        />
      </div>
    </Section>
  )
}

/* ---------------- Steps: how it works ---------------- */
export function Steps() {
  return (
    <Section id="steps" label="Как это работает" className="steps">
      <div className="container">
        <span className="label"><T k="steps.label" /></span>
        <List
          k="steps.items"
          className="steps__grid"
          template={{ t: '', d: '' }}
          render={(it, i, p) => (
            <div className="step" key={i}>
              <span className="step__num">{pad2(i)}</span>
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
      <div className="container">
        <span className="label"><T k="master.label" /></span>
        <div className="team__grid">
          <article className="team__card team__card--photo">
            <Img k="master" fallback={IMG(3)} alt="Stasia Kulik" className="team__photo" />
            <T k="master.name" as="h3" />
            <T k="master.role" as="span" className="team__role" />
            <T k="master.bio" as="p" multiline />
          </article>
          <List
            k="master.cards"
            className="team__cards"
            template={{ t: '', d: '' }}
            render={(it, i, p) => (
              <article className="team__card" key={i}>
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
          <Goat n={11} className="team__goat" />
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Pricing: hairline rows ---------------- */
export function Pricing() {
  return (
    <Section id="pricing" label="Цены" className="price">
      <div className="container">
        <span className="label"><T k="pricing.label" /></span>
        <T k="pricing.title" as="h2" className="h2" />
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
                    <span className="price__dots" aria-hidden="true" />
                    <T k={`${rp}.r`} as="span" className="price__r" />
                  </div>
                )}
              />
              <T k={`${p}.note`} as="p" className="price__note" multiline />
            </div>
          )}
        />
        <div className="price__gift">
          <Goat n={17} className="price__goat" />
          <div>
            <T k="pricing.gift" as="h3" />
            <T k="pricing.giftText" as="p" multiline />
          </div>
          <NavLink className="btn btn--sm" to="/kalendarz#voucher">
            <T k="pricing.giftBtn" /> →
          </NavLink>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Facts strip ---------------- */
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
              <span className="fact__star">✦</span>
              <T k={p} as="p" multiline />
            </div>
          )}
        />
      </div>
    </Section>
  )
}

/* ---------------- CTA band ---------------- */
export function Cta() {
  return (
    <Section id="cta" label="Призыв (запись)" className="ctab">
      <div className="container ctab__in">
        <div>
          <T k="cta.title" as="h2" className="h1" />
          <T k="cta.sub" as="p" multiline />
        </div>
        <NavLink className="btn btn--primary btn--lg" to="/kalendarz">
          <T k="cta.btn" /> →
        </NavLink>
        <Goat n={5} className="ctab__goat" />
      </div>
    </Section>
  )
}
