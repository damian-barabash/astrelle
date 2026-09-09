// The Astrelle goat mascots (1..18), cut out from the studio's price lists. Decorative.
export default function Goat({ n = 1, className = '', style }) {
  const id = String(n).padStart(2, '0')
  return <img className={`goat ${className}`} src={`/assets/maskot/goat-${id}.webp`} alt="" aria-hidden="true" loading="lazy" draggable="false" style={style} />
}
