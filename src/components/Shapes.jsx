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
  // narrow-necked vase
  vase: { vb: '0 0 180 300', d: 'M60 6 122 4 126 30 108 50 112 86 160 132 172 188 150 250 122 280 124 294 56 296 58 280 30 252 8 192 20 134 70 86 72 50 54 30Z' },
  // teapot: body, lid, spout and a handle cut as a C
  teapot: {
    vb: '0 0 304 222',
    d: [
      'M98 62 206 58 238 86 252 132 238 178 206 206 98 208 66 180 52 134 66 88Z',
      'M114 58 120 38 140 32 144 14 162 13 166 32 186 36 192 56Z',
      'M62 124 22 88 6 62 22 54 46 78 74 100Z',
      'M236 92 280 86 298 122 288 164 240 176 238 156 268 148 276 122 266 104 238 110Z',
    ],
  },
  // pitcher with a pouring lip
  pitcher: {
    vb: '0 0 232 282',
    d: ['M40 32 150 26 172 8 178 32 160 54 164 98 186 152 180 232 160 270 50 274 28 234 22 154 44 98 46 56Z', 'M168 94 216 88 228 132 216 178 178 192 176 172 202 162 210 132 202 108 170 112Z'],
  },
  // glaze brush
  brush: { vb: '0 0 64 300', d: ['M24 4 40 4 44 150 20 150Z', 'M16 150 48 150 50 190 14 190Z', 'M14 196 50 196 54 250 34 296 12 252Z'] },
  // potter's wheel from the side, a fresh pot on the head
  wheel: {
    vb: '0 0 300 250',
    d: ['M112 8 188 6 196 44 176 86 124 88 104 46Z', 'M18 92 282 86 288 114 14 118Z', 'M124 118 176 118 182 154 118 154Z', 'M40 154 262 150 276 240 28 244Z'],
  },
  // top-loading kiln: a box, a door, two feet
  kiln: { vb: '0 0 220 262', d: 'M20 14 200 8 206 226 176 228 178 254 150 256 148 230 74 232 76 256 46 258 44 232 14 234ZM54 62 166 60 168 174 52 176Z', evenodd: true },
  // map pin
  pin: { vb: '0 0 160 220', d: 'M80 6 132 22 154 70 140 124 82 214 22 126 6 72 28 24ZM80 46 108 58 114 86 100 108 78 114 56 104 46 82 54 58Z', evenodd: true },
  // two halves of a pair
  heart: { vb: '0 0 200 182', d: 'M100 174 14 88 8 46 34 12 72 10 100 42 128 10 166 12 192 46 186 88Z' },
  // price tag with a hole for the string
  tag: { vb: '0 0 240 160', d: 'M62 8 232 12 234 150 60 152 6 82ZM50 66 70 64 76 82 68 98 48 96 42 80Z', evenodd: true },
  // gift voucher: a ticket with two bites taken out of its sides
  ticket: { vb: '0 0 320 170', d: 'M8 10 312 6 314 60 296 70 296 100 314 110 310 164 10 160 6 110 24 100 24 70 6 60Z' },
  // doorway of the studio
  arch: { vb: '0 0 200 260', d: 'M10 254 12 112 36 52 80 14 124 12 166 48 190 110 192 252Z' },
}

export function Shape({ name = 'jar', className = '', style }) {
  const s = SHAPES[name] || SHAPES.jar
  const parts = Array.isArray(s.d) ? s.d : [s.d]
  return (
    <svg className={`shape shape--${name} ${className}`} viewBox={s.vb} style={style} aria-hidden="true" focusable="false">
      {parts.map((d, i) => (
        <path key={i} d={d} fill="currentColor" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" fillRule={s.evenodd ? 'evenodd' : undefined} />
      ))}
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

// A round maker's seal with lettering running along its rim — stamped on photos.
let sealId = 0
export function Seal({ text = 'Astrelle', className = '', style, children }) {
  const id = `seal${++sealId}`
  const line = `${text} ✦ ${text} ✦ `
  return (
    <svg className={`seal ${className}`} viewBox="0 0 200 200" style={style} aria-hidden="true" focusable="false">
      <defs>
        <path id={id} d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="currentColor" />
      <circle cx="100" cy="100" r="54" fill="none" stroke="var(--seal-ink, #f4ebe5)" strokeWidth="1.5" />
      <text fill="var(--seal-ink, #f4ebe5)" fontSize="15.5" fontWeight="500" letterSpacing="2.6" style={{ textTransform: 'uppercase' }}>
        <textPath href={`#${id}`} textLength="458" lengthAdjust="spacing">{line}</textPath>
      </text>
      <g transform="translate(100 100)" color="var(--seal-ink, #f4ebe5)">{children}</g>
    </svg>
  )
}
