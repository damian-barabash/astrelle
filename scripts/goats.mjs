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

      const px = info.width * info.height
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
