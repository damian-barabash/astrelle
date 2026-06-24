// Generates favicons (from public/favicon.svg) and the social OG image.
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

// ---- OG image (1200 x 630) ----
const W = 1200
const H = 630
const bg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6efe8"/>
      <stop offset="0.6" stop-color="#efe3da"/>
      <stop offset="1" stop-color="#ecddd1"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="28" fill="none" stroke="#84a867" stroke-opacity="0.35" stroke-width="2"/>
  <text x="600" y="452" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="44" fill="#5f7e48">Ceramika · kursy · coworking</text>
  <text x="600" y="520" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="3" fill="#7a2e3a">WARSZAWA · MAŁA 5A · STUDIO AINO</text>
  <text x="600" y="566" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="2" fill="#6d7560">astrelle.pl</text>
</svg>`)

// the logo (sparkles + "Astrelle") rendered crisp, then centred on the canvas
const logo = await sharp(path.join(PUB, 'assets/logo/logo_icon.svg'), { density: 400 })
  .resize({ width: 760 })
  .png()
  .toBuffer()
const logoMeta = await sharp(logo).metadata()

await sharp(bg)
  .composite([{ input: logo, left: Math.round((W - logoMeta.width) / 2), top: 150 }])
  .png()
  .toFile(path.join(PUB, 'og.png'))
console.log('og → og.png')
console.log('done.')
