// Flat "paper-cut" ceramics drawn for the site: one colour (currentColor), straight
// scissor cuts, corners softened by a round-joined stroke of the same colour.
const SHAPES = {
  // tall bottle with a flared rim
  bottle: { vb: '0 0 200 460', d: 'M50 8 150 4 157 36 128 54 126 80 187 120 195 178 176 452 40 456 15 182 21 122 80 82 78 52 45 36Z' },
  // footed bowl
  bowl: { vb: '0 0 300 196', d: 'M6 10 294 5 288 62 262 110 198 150 202 188 102 191 106 152 44 114 12 64Z' },
  // round-bellied jar
  jar: { vb: '0 0 200 244', d: 'M68 6 134 8 138 36 172 54 194 112 186 172 150 216 152 238 50 240 52 216 16 174 6 114 30 54 64 36Z' },
  // faceted mug with a handle
  mug: { vb: '0 0 262 224', d: 'M10 10 178 5 174 52 234 62 254 112 228 162 170 172 168 214 30 218ZM173 80 172 146 208 138 224 111 213 86Z', evenodd: true },
  // low plate seen from the side
  plate: { vb: '0 0 260 62', d: 'M5 12 255 7 214 50 48 54Z' },
  // small cup without a handle
  cup: { vb: '0 0 170 170', d: 'M8 10 162 6 146 124 118 150 120 164 52 165 54 150 26 126Z' },
}

export function Shape({ name = 'jar', className = '', style }) {
  const s = SHAPES[name] || SHAPES.jar
  return (
    <svg className={`shape shape--${name} ${className}`} viewBox={s.vb} style={style} aria-hidden="true" focusable="false">
      <path d={s.d} fill="currentColor" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" fillRule={s.evenodd ? 'evenodd' : undefined} />
    </svg>
  )
}

// A fingerprint pressed into clay: oval ridges around a core, each one wobbling a
// little and broken in a few places. Drawn from a seed, so every print is its own.
function rnd(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const PRINTS = {}
function buildPrint(n, seed) {
  const key = `${n}:${seed}`
  if (PRINTS[key]) return PRINTS[key]
  const r = rnd(seed * 7919 + n)
  const step = 100 / (n + 0.3)
  const p1 = r() * 6.28
  const p2 = r() * 6.28
  const p3 = r() * 6.28
  let d = ''
  for (let i = 0; i < n; i++) {
    const rx = step * (i + 0.55)
    const ry = rx * 1.27
    const cy = 132 + i * 0.9
    const outer = i >= n - 2
    // where this ridge is interrupted: [centre angle, half-width] in degrees
    const cuts = []
    const k = i === 0 ? 1 : outer ? 4 : 1 + Math.floor(r() * 2.6)
    for (let c = 0; c < k; c++) cuts.push([r() * 360, i === 0 ? 70 : outer ? 14 + r() * 26 : (3 + r() * 7) * (1 + 3 / (i + 1))])
    let pen = false
    for (let a = 0; a <= 360; a += 3) {
      const cut = cuts.some(([c, w]) => Math.abs(((a - c + 540) % 360) - 180) < w)
      if (cut) {
        pen = false
        continue
      }
      const t = (a * Math.PI) / 180
      // neighbours share the wobble, so ridges stay parallel and never cross
      const m = 1 + 0.04 * Math.sin(2 * t + p1 + i * 0.05) + 0.022 * Math.sin(3 * t + p2 + i * 0.12) + 0.012 * Math.sin(7 * t + p3 + i * 0.3)
      const x = (110 + rx * m * Math.cos(t)).toFixed(1)
      const y = (cy + ry * m * Math.sin(t)).toFixed(1)
      d += `${pen ? 'L' : 'M'}${x} ${y}`
      pen = true
    }
  }
  return (PRINTS[key] = { d, sw: (step * 0.5).toFixed(2) })
}

export function Print({ n = 14, seed = 1, className = '', style }) {
  const { d, sw } = buildPrint(n, seed)
  return (
    <svg className={`rings ${className}`} viewBox="0 0 220 290" style={style} aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
// kept under its first name: the prints replaced the plain wheel rings
export const Rings = Print

// Two hands reaching in from the edge of the page, cut from the same paper as the pots.
const HAND = 'M330 34 214 26 150 22 46 6 30 10 26 22 40 30 150 46 28 44 12 50 12 62 28 68 152 68 34 82 20 90 24 102 40 104 158 90 76 112 64 120 70 130 84 130 196 110 150 142 142 158 152 164 166 158 236 124 330 118Z'
export function Hands({ className = '', style }) {
  return (
    <svg className={`hands ${className}`} viewBox="0 0 330 372" style={style} aria-hidden="true" focusable="false">
      <g fill="currentColor" stroke="currentColor" strokeWidth="7" strokeLinejoin="round">
        <path d={HAND} transform="translate(0 4)" />
        {/* the lower hand is the same cut, flipped: thumbs meet in the middle */}
        <path d={HAND} transform="translate(26 368) scale(1 -1)" />
      </g>
    </svg>
  )
}

// The four-point sparkle from the Astrelle logo.
export function Spark({ className = '', style }) {
  return (
    <svg className={`spark ${className}`} viewBox="0 0 24 24" style={style} aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 1.5c.7 7.2 3.3 9.8 10.5 10.5-7.2.7-9.8 3.3-10.5 10.5-.7-7.2-3.3-9.8-10.5-10.5 7.2-.7 9.8-3.3 10.5-10.5z" />
    </svg>
  )
}
