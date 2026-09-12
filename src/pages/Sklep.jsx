import { lazy, Suspense } from 'react'
import { useT } from '../i18n/index.jsx'
import { T } from '../content/edit.jsx'
import LeadForm from '../blocks/LeadForm.jsx'
import Goat from '../components/Goat.jsx'
const CeramicPlate = lazy(() => import('../three/CeramicPlate.jsx'))

// The shop is not open yet: a calm "opening in October" page with a waiting list.
export default function Sklep() {
  const { shop } = useT()
  return (
    <section className="shop">
      <div className="container shop__in">
        <div className="shop__text">
          <T k="shop.title" as="h1" className="h1" />
          <p className="shop__soon">{shop?.soon_text || <T k="shop.soon" />}</p>
          <T k="shop.sub" as="p" className="shop__sub" multiline />
          <LeadForm kind="shop" compact />
        </div>
        {/* a real plate from the studio — the first thing the shop will sell */}
        <div className="shop__art">
          <Suspense fallback={null}>
            <CeramicPlate className="shop__plate" />
          </Suspense>
          <Goat n={6} className="shop__goat shop__goat--b" />
          <Goat n={8} className="shop__goat shop__goat--c" />
        </div>
      </div>
    </section>
  )
}
