import { Img } from '../content/edit.jsx'
import Goat from './Goat.jsx'
import { Shape, Print, Spark } from './Shapes.jsx'

// A photo dressed in the site's own graphics: a cut-out pot leaning on one corner, a
// fingerprint pressed over another, a spark, sometimes a goat. `variant` picks one of
// four arrangements so neighbouring photos never look the same.
// The picture is replaceable in the editor under the key `s_<photo>`.
const SEEDS = { a: 3, b: 7, c: 11, d: 5 }
export default function PhotoArt({ photo, shape = 'jar', variant = 'a', goat, num, className = '', eager = false }) {
  return (
    <figure className={`pa pa--${variant} ${className}`}>
      <Img k={`s_${photo}`} fallback={`/assets/img/s-${photo}.webp`} className="pa__img" alt="" loading={eager ? 'eager' : 'lazy'} />
      {num ? <span className="pa__num">{num}</span> : null}
      <Print n={10} seed={SEEDS[variant] || 3} className="pa__print" />
      <Shape name={shape} className="pa__shape" />
      <Spark className="pa__spark" />
      {goat ? <Goat n={goat} className="pa__goat" /> : null}
    </figure>
  )
}
