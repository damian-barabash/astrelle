// Slice the goat mascot pack (6×3 grid of flat sage-green goats on a dark
// background) into individual transparent PNG + webp icons.
//
// Source: media-src/maskot/pack.jpg (not deployed).
// Output: public/assets/maskot/goat-01..18.{png,webp}  — flat sage, clean edges.
//
// Run: npm run goats   (requires `sharp`)
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'media-src/maskot/pack.jpg')
const OUT = path.join(ROOT, 'public/assets/maskot')

const COLS = 6
const ROWS = 3
// recolour every kept pixel to the brand sage so the icons match the palette
const SAGE = { r: 0x84, g: 0xa8, b: 0x67 }

// Connected-component cleanup on the alpha channel. The 6×3 grid is even, but
// some drawings spill across the seam (a barbell, a bag, a leash), so each cell
// can pick up a sliver of its neighbour. We keep the goat plus its own props
// and sparkles, and drop the foreign slivers, using two facts:
//   • foreign slivers almost always TOUCH the cell border (they're cut by it);
//   • the goat's own far parts (cooking pot, easel, dog on a leash) DON'T.
// So: keep the main blob; keep border-touching blobs only when close to the
// main (the goat's own head/leg reaching the edge); keep non-border blobs
// unless absurdly far (an isolated mid-cell sliver). Distances are bbox gaps.
function cleanFragments(data, channels, w, h) {
  const ON = 60 // alpha considered opaque
  const px = w * h
  const label = new Int32Array(px).fill(-1)
  const stack = new Int32Array(px)
  const comps = [] // { size, border, x0,y0,x1,y1 }
  const alphaAt = (i) => data[i * channels + 3]

  for (let start = 0; start < px; start++) {
    if (label[start] !== -1 || alphaAt(start) < ON) continue
    const id = comps.length
    let sp = 0, size = 0, border = false
    let x0 = w, y0 = h, x1 = -1, y1 = -1
    stack[sp++] = start
    label[start] = id
    while (sp > 0) {
      const i = stack[--sp]
      size++
      const x = i % w, y = (i / w) | 0
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) border = true
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
      // 4-neighbours
      if (x > 0 && label[i - 1] === -1 && alphaAt(i - 1) >= ON) { label[i - 1] = id; stack[sp++] = i - 1 }
      if (x < w - 1 && label[i + 1] === -1 && alphaAt(i + 1) >= ON) { label[i + 1] = id; stack[sp++] = i + 1 }
      if (y > 0 && label[i - w] === -1 && alphaAt(i - w) >= ON) { label[i - w] = id; stack[sp++] = i - w }
      if (y < h - 1 && label[i + w] === -1 && alphaAt(i + w) >= ON) { label[i + w] = id; stack[sp++] = i + w }
    }
    comps.push({ size, border, x0, y0, x1, y1 })
  }
  if (!comps.length) return

  let main = 0
  for (let i = 1; i < comps.length; i++) if (comps[i].size > comps[main].size) main = i
  const m = comps[main]
  const gapTo = (c) => {
    const dx = Math.max(0, c.x0 - m.x1, m.x0 - c.x1)
    const dy = Math.max(0, c.y0 - m.y1, m.y0 - c.y1)
    return Math.hypot(dx, dy)
  }
  const minSide = Math.min(w, h)
  const T_BORDER = 0.085 * minSide // edge blob this close to the goat = its own part
  const T_FAR = 0.37 * minSide     // non-edge blob beyond this = isolated sliver
  const EDGE = 0.07 * minSide      // "hugs a left/right seam" band
  const SMALL = 0.004 * px         // sliver-sized (props/sparkles are bigger or closer)
  const MIN = 30                   // ignore single-pixel noise
  const keep = comps.map((c, i) => {
    if (i === main) return true
    if (c.size < MIN) return false
    const g = gapTo(c)
    if (c.border) return g <= T_BORDER
    // a small, far blob pressed against a side seam is a neighbour's sliver
    // that just missed the border — drop it (big far parts like a cooking pot
    // or an easel are scene props and stay).
    const nearSide = c.x0 < EDGE || c.x1 > w - 1 - EDGE
    if (c.size < SMALL && nearSide && g > 0.17 * minSide) return false
    return g <= T_FAR
  })

  for (let i = 0; i < px; i++) {
    const id = label[i]
    if (id < 0 || !keep[id]) data[i * channels + 3] = 0
  }
}

async function run() {
  if (!existsSync(SRC)) {
    console.warn(`skip goats: ${SRC} not found`)
    return
  }
  await mkdir(OUT, { recursive: true })
  const meta = await sharp(SRC).metadata()
  const cw = Math.floor(meta.width / COLS)
  const ch = Math.floor(meta.height / ROWS)

  let n = 0
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      n++
      const left = col * cw
      const top = row * ch
      const { data, info } = await sharp(SRC)
        .extract({ left, top, width: cw, height: ch })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })

      const w = info.width, h = info.height
      const px = w * h
      for (let p = 0; p < px; p++) {
        const o = p * info.channels
        const r = data[o], g = data[o + 1], b = data[o + 2]
        const lum = 0.3 * r + 0.59 * g + 0.11 * b
        // dark charcoal background → transparent; sage goat → opaque.
        // smooth ramp removes the dark fringe, flat sage fill keeps it crisp.
        const cov = Math.max(0, Math.min(1, (lum - 42) / 36))
        data[o] = SAGE.r
        data[o + 1] = SAGE.g
        data[o + 2] = SAGE.b
        data[o + 3] = Math.round(cov * 255)
      }

      // Each grid cell can pick up a sliver of a neighbouring goat bleeding in
      // from the edge. Label connected opaque blobs and drop the edge-touching
      // fragments, keeping the main goat plus its (interior) sparkle stars.
      cleanFragments(data, info.channels, w, h)

      const id = String(n).padStart(2, '0')
      const buf = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: info.channels },
      })
        .png()
        .toBuffer()
      // trim transparent margins, then pad a hair so edges never clip
      await sharp(buf).trim({ threshold: 1 }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(OUT, `goat-${id}.png`))
      await sharp(buf).trim({ threshold: 1 }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 92, alphaQuality: 100 }).toFile(path.join(OUT, `goat-${id}.webp`))
      console.log(`goat → goat-${id}.png / .webp`)
    }
  }
  console.log(`done — ${n} goats.`)
}

await run()
