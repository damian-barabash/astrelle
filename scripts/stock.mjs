// Stock photos for the offer pages: media-src/stock/<key>.jpg → public/assets/img/s-<key>.webp
// (1400 wide) + s-<key>-sm.webp (800 wide). Originals stay outside git.
// Run: npm run stock
import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'media-src/stock')
const OUT = path.join(ROOT, 'public/assets/img')

await mkdir(OUT, { recursive: true })
const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()
for (const f of files) {
  const key = f.replace(/\.[^.]+$/, '')
  const src = path.join(SRC, f)
  await sharp(src).rotate().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, `s-${key}.webp`))
  await sharp(src).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(OUT, `s-${key}-sm.webp`))
  console.log(`stock → s-${key}.webp`)
}
