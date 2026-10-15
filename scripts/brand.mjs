// Generates favicons (from public/favicon.svg). The social image is scripts/og.mjs.
// Run: node scripts/brand.mjs
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PUB = path.join(ROOT, 'public')

// ---- favicons ----
const FAV = path.join(PUB, 'favicon.svg')
const sizes = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]
for (const [name, size] of sizes) {
  await sharp(FAV, { density: 384 }).resize(size, size).png().toFile(path.join(PUB, name))
  console.log('favicon →', name)
}

console.log('done.')
