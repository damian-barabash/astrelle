import { Shape } from '../components/Shapes.jsx'

// The shop shelf: numbered cards, each with a cut-out pot, a name, a price and a
// "see" line; the card fills with green on hover. Kept for Astrelle's own shop —
// the page is still "opening soon", so nothing renders this yet.
// items: [{ id, shape, title, price, to }] — `shape` is a name from Shapes.jsx,
// `price` a ready string ("150 zł"), `to` a link (internal or external).
export default function Shelf({ items = [], more = '', foot = null }) {
  if (!items.length) return null
  return (
    <section className="shelf">
      <div className="container">
        <div className="shelf__grid">
          {items.map((p, i) => (
            <a className="card pcard" href={p.to} key={p.id}>
              <span className="card__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="pcard__art">
                <Shape name={p.shape} />
              </span>
              <span className="pcard__t">{p.title}</span>
              <span className="pcard__foot">
                <b>{p.price}</b>
                {more ? <i>{more} →</i> : null}
              </span>
            </a>
          ))}
        </div>
        {foot ? <div className="shelf__foot">{foot}</div> : null}
      </div>
    </section>
  )
}
