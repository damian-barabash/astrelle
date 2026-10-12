import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { T } from '../content/edit.jsx'
import Goat from '../components/Goat.jsx'
import Out, { Promo } from '../components/Out.jsx'
import PhotoArt from '../components/PhotoArt.jsx'
import { Shape } from '../components/Shapes.jsx'
import { useOffers } from '../sections/home.jsx'
import { GROUPS, priceText } from '../data/offers.js'

const VARIANTS = ['a', 'b', 'c', 'd']
const GOATS = [10, null, 4, null, 16]

// One offer: what it is, how long, how much — a page with details and a straight
// link to the studio's booking.
export function OfferCard({ o, num, place = 'offers' }) {
  const { t } = useT()
  const unit = t(`offers.units.${o.unit}`)
  return (
    <article className="card ocard">
      {num ? <span className="card__num">{num}</span> : null}
      <Shape name={o.shape} className="ocard__shape" />
      <div className="ocard__main">
        <T k={`offers.items.${o.id}.t`} as="h3" className="ocard__t" />
        <T k={`offers.items.${o.id}.meta`} as="span" className="ocard__meta" />
        <T k={`offers.items.${o.id}.d`} as="p" className="ocard__d" multiline />
      </div>
      <div className="ocard__side">
        <span className="ocard__price">
          {priceText(o, t('offers.from'))}
          {unit ? <i>{unit}</i> : null}
        </span>
        <div className="ocard__btns">
          <NavLink className="btn btn--sm" to={`/warsztaty/${o.id}`}>
            {t('offers.details')}
          </NavLink>
          {o.soon ? (
            <span className="tag">{t('offers.soon')}</span>
          ) : (
            <Out className="btn btn--primary btn--sm" to={o.id} place={place}>
              {t('offers.bookShort')} ↗
            </Out>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Warsztaty() {
  const { t } = useT()
  const offers = useOffers()
  let n = 0
  return (
    <>
      <section className="phead">
        <div className="container">
          <div className="phead__top">
            <T k="offers.title" as="h1" className="h1" />
            <div className="phead__shapes" aria-hidden="true">
              <Shape name="teapot" />
              <Shape name="bottle" />
              <Shape name="wheel" />
              <Goat n={10} />
            </div>
          </div>
          <div className="phead__row">
            <T k="offers.sub" as="p" className="phead__sub" multiline />
            <nav className="chips" aria-label={t('offers.title')}>
              {GROUPS.map((g) => (
                <a key={g.id} href={`#${g.id}`} className="chip">
                  {t(`offers.groups.${g.id}.t`)}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {GROUPS.map((g, gi) => {
        const rows = offers.filter((o) => o.group === g.id)
        if (!rows.length) return null
        return (
          <section className={`ogroup ${gi % 2 ? 'ogroup--flip' : ''}`} id={g.id} key={g.id}>
            <div className="container ogroup__in">
              <div className="ogroup__side">
                <PhotoArt photo={g.photo} shape={g.shape} variant={VARIANTS[gi % 4]} goat={GOATS[gi]} eager={gi === 0} />
                <T k={`offers.groups.${g.id}.t`} as="h2" className="h2" />
                <T k={`offers.groups.${g.id}.d`} as="p" className="ogroup__d" multiline />
              </div>
              <div className="ogroup__list">
                {rows.map((o) => (
                  <OfferCard key={o.id} o={o} num={String(++n).padStart(2, '0')} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      <section className="onote">
        <div className="container">
          <div className="onote__in">
            <Shape name="arch" className="onote__shape" />
            <div>
              <T k="offers.note" as="p" className="onote__text" multiline />
              <Promo />
            </div>
            <Out className="btn btn--primary btn--lg" to="schedule" place="offers-bottom">
              <T k="hero.cta2" /> ↗
            </Out>
          </div>
        </div>
      </section>
    </>
  )
}
