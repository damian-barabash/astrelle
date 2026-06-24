// Image pipeline for Astrelle:
//  1) convert source JPGs in public/assets/img → optimized .webp (1400 + 800 wide)
//  2) cut the two goat mascots out of the price graphics → transparent PNG + webp
//
// Run: npm run img   (requires `sharp`)
import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'media-src/photos') // original JPGs (not deployed)
const CLAY_DIR = path.join(ROOT, 'media-src/clay') // sourced clay photo(s)
const IMG_DIR = path.join(ROOT, 'public/assets/img') // optimized webp output
const MASKOT_DIR = path.join(ROOT, 'public/assets/maskot')
const PRICE_DIR = '/Users/dmytrii/Desktop/PROJEKTY/ASTRELLE/Grafiki/Price'

// ---- 1. photos → webp -------------------------------------------------------
async function photos() {
  await mkdir(IMG_DIR, { recursive: true })
  const files = (await readdir(SRC_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f))
  files.sort()
  let i = 0
  for (const f of files) {
    i++
    const src = path.join(SRC_DIR, f)
    const base = `photo-${i}`
    await sharp(src)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(IMG_DIR, `${base}.webp`))
    await sharp(src)
      .rotate()
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(IMG_DIR, `${base}-sm.webp`))
    console.log(`photo → ${base}.webp  (from ${f})`)
  }
}

// ---- 2. cut goats from price graphics --------------------------------------
// Goats are flat sage-green on a cream background, sitting at the bottom of each
// price card. Crop the bottom band, then chroma-key the cream away.
async function cutGoat(srcFile, outName) {
  const src = path.join(PRICE_DIR, srcFile)
  if (!existsSync(src)) {
    console.warn(`skip goat: ${src} not found`)
    return
  }
  const meta = await sharp(src).metadata()
  const top = Math.round(meta.height * 0.72)
  const band = await sharp(src)
    .extract({ left: 0, top, width: meta.width, height: meta.height - top })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { data, info } = band
  const px = info.width * info.height
  for (let p = 0; p < px; p++) {
    const o = p * info.channels
    const r = data[o], g = data[o + 1], b = data[o + 2]
    // green-ish goat pixels are kept; cream / light pixels become transparent
    const isGoat = g > 90 && g >= r - 8 && g >= b - 8 && r < 205
    data[o + 3] = isGoat ? 255 : 0
  }

  await mkdir(MASKOT_DIR, { recursive: true })
  const cut = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
  // PNG (transparent, for the user to reuse) + trimmed
  const trimmed = await cut.png().toBuffer()
  await sharp(trimmed).trim().png().toFile(path.join(MASKOT_DIR, `${outName}.png`))
  await sharp(trimmed).trim().webp({ quality: 92 }).toFile(path.join(MASKOT_DIR, `${outName}.webp`))
  console.log(`goat → ${outName}.png / .webp  (from ${srcFile})`)
}

// ---- 3. clay-type photos (revealed on hover in the "types" section) ----------
// Each clay gets one representative photo, cover-cropped to a portrait card.
async function clay() {
  const map = [
    { key: 'terracotta', src: path.join(CLAY_DIR, 'terracotta.jpg') },
    { key: 'stoneware', src: path.join(SRC_DIR, 'cafeconcetto-4fXPCj0_828-unsplash.jpg') },
    { key: 'porcelain', src: path.join(SRC_DIR, 'tamara-harhai-tSkPbVkiCqY-unsplash.jpg') },
    { key: 'white', src: path.join(SRC_DIR, 'tom-crew-oiZAQvxTcYQ-unsplash.jpg') },
  ]
  for (const { key, src } of map) {
    if (!existsSync(src)) {
      console.warn(`skip clay ${key}: ${src} not found`)
      continue
    }
    await sharp(src)
      .rotate()
      .resize({ width: 800, height: 1000, fit: 'cover', position: 'centre' })
      .webp({ quality: 80 })
      .toFile(path.join(IMG_DIR, `clay-${key}.webp`))
    console.log(`clay → clay-${key}.webp`)
  }
}

await photos()
await clay()
await cutGoat('Price_2.jpg', 'goat_potter') // koza przy kole garncarskim
await cutGoat('Price_1.jpg', 'goat_coin')   // koza z monetami
console.log('done.')
