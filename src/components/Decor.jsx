// Editorial "hand-drawn" decorations — the loose wine line motif from the
// poster reference, plus the scattered goat mascots.

// shared poster-style section kicker with a "Vol." marker
export function Kicker({ children, vol, wine }) {
  return (
    <div className="kicker-row">
      <span className={`kicker ${wine ? 'kicker--wine' : ''}`}>{children}</span>
      {vol && <span className="vol">Vol. {vol}</span>}
    </div>
  )
}

// rough underline stroke drawn beneath section titles
export function Scribble({ className = '' }) {
  return (
    <svg className={`scribble ${className}`} viewBox="0 0 300 22" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 13 C 52 4, 96 18, 150 10 S 252 5, 296 14" />
    </svg>
  )
}

// loose wobbly loop, like the contour sketched around the vase in the poster
export function LooseLoop({ className = '' }) {
  return (
    <svg className={`loop ${className}`} viewBox="0 0 220 260" aria-hidden="true">
      <path d="M110 8 C 168 6, 214 44, 210 110 C 207 168, 176 214, 134 244 C 150 226, 168 198, 166 150 C 165 100, 150 60, 96 54 C 44 48, 16 92, 18 150 C 20 206, 60 244, 110 250 C 52 252, 8 206, 8 144 C 8 70, 52 10, 110 8 Z" />
    </svg>
  )
}

// small corner star burst
export function Burst({ className = '' }) {
  return (
    <svg className={`burst ${className}`} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 0 C 21 14, 26 19, 40 20 C 26 21, 21 26, 20 40 C 19 26, 14 21, 0 20 C 14 19, 19 14, 20 0 Z" />
    </svg>
  )
}

// a scattered mascot goat (1..18). Decorative — empty alt.
export function Goat({ n = 1, className = '' }) {
  const id = String(n).padStart(2, '0')
  return (
    <img
      className={`goat ${className}`}
      src={`/assets/maskot/goat-${id}.webp`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      draggable="false"
    />
  )
}
