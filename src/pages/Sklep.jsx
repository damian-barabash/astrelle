import { lazy, Suspense } from 'react'
import { useT } from '../i18n/index.jsx'
import { T } from '../content/edit.jsx'
import Goat from '../components/Goat.jsx'
import Out from '../components/Out.jsx'
import { Shape, Rings } from '../components/Shapes.jsx'
import { PRODUCTS, withOverrides, priceText } from '../data/offers.js'
const CeramicPlate = lazy(() => import('../three/CeramicPlate.jsx'))

// Ceramics are sold by the studio's shop. Here: a real plate turning in 3D, a short
// pick from their shelf and a way to the whole shop.
export default function Sklep() {
  const { t, partner } = useT()
  const items = withOverrides(PRODUCTS, partner)
  return (
    <>
      <section className="shop">
        <div className="container shop__in">
          <div className="shop__text">
            <T k="shop.title" as="h1" className="h1" />
            <p className="shop__soon"><T k="shop.label" /></p>
            <T k="shop.sub" as="p" className="shop__sub" multiline />
            <Out className="btn btn--primary btn--lg" to="shop" place="shop-top">
              <T k="shop.btn" /> ↗
            </Out>
          </div>
          {/* a real plate from Stasia's hands */}
          <div className="shop__art">
            <Rings className="shop__rings" />
            <Suspense fallback={null}>
              <CeramicPlate className="shop__plate" />
            </Suspense>
            <Goat n={6} className="shop__goat shop__goat--b" />
            <Goat n={8} className="shop__goat shop__goat--c" />
          </div>
        </div>
      </section>

      <section className="shelf">
        <div className="container">
          <div className="shelf__grid">
            {items.map((p, i) => (
              <Out className="card pcard" to={p.id} place="shop-grid" key={p.id}>
                <span className="card__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="pcard__art">
                  <Shape name={p.shape} />
                </span>
                <span className="pcard__t">{t(`shop.items.${p.id}`)}</span>
                <span className="pcard__foot">
                  <b>{priceText(p, t('offers.from'))}</b>
                  <i>{t('shop.go')} ↗</i>
                </span>
              </Out>
            ))}
          </div>
          <div className="shelf__foot">
            <T k="shop.note" as="p" multiline />
            <Out className="btn" to="shop" place="shop-bottom">
              <T k="shop.btn" /> ↗
            </Out>
          </div>
        </div>
      </section>
    </>
  )
}
