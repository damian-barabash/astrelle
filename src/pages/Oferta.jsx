import { NavLink, Navigate, useParams } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'
import { T, List } from '../content/edit.jsx'
import Out, { Tel, Promo } from '../components/Out.jsx'
import PhotoArt from '../components/PhotoArt.jsx'
import { Shape, Spark } from '../components/Shapes.jsx'
import { useOffers } from '../sections/home.jsx'
import { OfferCard } from './Warsztaty.jsx'
import { PLACES, priceText } from '../data/offers.js'

// One offer on its own page: the picture, what happens, what is included, where — and
// one button that leads to the studio's booking. `id` comes from the route, or from
// the editor (which shows a chosen offer without a router param).
export default function Oferta({ id: forced }) {
  const { id: routeId } = useParams()
  const { t } = useT()
  const offers = useOffers()
  const id = forced || routeId
  const o = offers.find((x) => x.id === id)
  if (!o) return <Navigate to="/warsztaty" replace />
  const base = `offers.items.${o.id}`
  const unit = t(`offers.units.${o.unit}`)
  const others = offers.filter((x) => x.id !== o.id && x.group === o.group).concat(offers.filter((x) => x.group !== o.group)).slice(0, 3)
  return (
    <>
      <section className="odet">
        <div className="container">
          <NavLink className="odet__back" to={`/warsztaty#${o.group}`}>
            ← {t('offers.all')}
          </NavLink>
          <div className="odet__in">
            <div className="odet__art">
              <PhotoArt photo={o.photo} shape={o.shape} variant="c" eager />
            </div>
            <div className="odet__body">
              <span className="label"><T k={`offers.groups.${o.group}.t`} /></span>
              <T k={`${base}.t`} as="h1" className="h1 odet__title" />
              <T k={`${base}.meta`} as="span" className="odet__meta" />
              <T k={`${base}.more`} as="p" className="odet__text" multiline />

              <div className="odet__facts">
                <div className="odet__fact">
                  <span className="label">{t('offers.price')}</span>
                  <span className="odet__price">
                    {priceText(o, t('offers.from'))}
                    {unit ? <i>{unit}</i> : null}
                  </span>
                </div>
                <div className="odet__fact">
                  <span className="label">{t('offers.where')}</span>
                  {o.places.map((p) => (
                    <a key={p} className="odet__place" href={PLACES[p].maps} target="_blank" rel="noreferrer">
                      {PLACES[p].street} ↗
                    </a>
                  ))}
                </div>
              </div>

              <div className="odet__incl">
                <span className="label">{t('offers.included')}</span>
                <List
                  k={`${base}.incl`}
                  className="odet__list"
                  max={8}
                  template=""
                  render={(x, i, p) => (
                    <span className="odet__li" key={i}>
                      <Spark className="odet__spark" />
                      <T k={p} />
                    </span>
                  )}
                />
              </div>

              <div className="odet__cta">
                <Out className="btn btn--primary btn--lg" to={o.id} place="offer-page">
                  {o.soon ? t('offers.soonBtn') : t('offers.book')} ↗
                </Out>
                <p className="odet__note">
                  <T k="offers.note" />
                </p>
                <p className="odet__call">
                  <T k="offers.call" /> <Tel place={`offer-page:${o.id}`} />
                </p>
                <Promo />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="orules">
        <div className="container">
          <div className="orules__in">
            <div className="orules__head">
              <Shape name="kiln" className="orules__shape" />
              <T k="offers.rulesT" as="h2" className="h2" />
            </div>
            <List k="offers.rules" className="orules__list" max={6} template="" render={(x, i, p) => <T k={p} as="p" key={i} className="orules__li" multiline />} />
          </div>
        </div>
      </section>

      <section className="omore">
        <div className="container">
          <T k="offers.others" as="h2" className="h2" />
          <div className="omore__list">
            {others.map((x) => (
              <OfferCard key={x.id} o={x} place="offer-related" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
