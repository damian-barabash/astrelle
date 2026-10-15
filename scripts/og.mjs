// Social preview (public/og.png, 1200 x 630) in the site's paper-cut style.
// The hero picture (print, bottle, goat, 3D mug) is cut straight from the running
// site, so the card always matches what visitors see, then laid out next to the
// headline on a plain page.
// Run: npm run build && npx vite preview --port 4173 (other terminal), then npm run og
// Needs Playwright (global install is fine). SITE=<url> to shoot another server.
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { readFileSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PUB = path.join(ROOT, 'public')
const SITE = process.env.SITE || 'http://localhost:4173/'

let pw
try {
  pw = await import('playwright')
} catch {
  const g = execSync('npm root -g').toString().trim()
  pw = await import(pathToFileURL(path.join(g, 'playwright/index.mjs')).href)
}

const W = 1200
const H = 630
const browser = await pw.chromium.launch()

// ---- 1. the hero picture, on a transparent background ----
const site = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await site.addInitScript(() => {
  localStorage.setItem('astrelle_lang', 'pl')
  localStorage.setItem('astrelle_consent', JSON.stringify({ analytics: false }))
})
await site.goto(SITE, { waitUntil: 'networkidle' })
await site.waitForSelector('.hero__stage canvas')
await site.waitForTimeout(2500) // the mug model loads and settles
await site.addStyleTag({
  content: `html, body { background: transparent !important }
    body > *:not(#root), header, .mascot, .hero__title, .hero__copy { visibility: hidden !important }
    .hero__art, .hero__art * { animation: none !important }`,
})
// the print sticks out of .hero__art, so take the box around all of its parts
const box = await site.evaluate(() => {
  const els = [...document.querySelectorAll('.hero__art, .hero__art > *')]
  const r = els.map((e) => e.getBoundingClientRect())
  const x = Math.min(...r.map((b) => b.left))
  const y = Math.min(...r.map((b) => b.top))
  return { x, y, width: Math.max(...r.map((b) => b.right)) - x, height: Math.max(...r.map((b) => b.bottom)) - y }
})
const art = await site.screenshot({ clip: box, omitBackground: true })

// ---- 2. the card ----
const css = readFileSync(path.join(ROOT, 'src/styles/global.css'), 'utf8')
const speck = css.match(/--speck:\s*(url\("[^"]+"\))/)[1]
const logo = readFileSync(path.join(PUB, 'assets/logo/astrelle-logo.png')).toString('base64')
const artH = 540
const artW = Math.round((box.width / box.height) * artH)

const card = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
await card.setContent(`<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500&family=Onest:wght@500&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box }
  body { width: ${W}px; height: ${H}px; overflow: hidden; position: relative;
    background: #f4ebe5 ${speck} 0 0 / 420px 420px; color: #587642; font-family: 'Onest', sans-serif }
  .logo { position: absolute; left: 72px; top: 58px; height: 60px }
  h1 { position: absolute; left: 66px; top: 196px; font: 500 86px/1 'Unbounded', sans-serif;
    letter-spacing: -0.05em; white-space: nowrap }
  h1 span { display: block; margin-bottom: 20px }
  .kick { position: absolute; left: 72px; bottom: 120px; font-size: 19px; letter-spacing: 0.14em;
    text-transform: uppercase; line-height: 1.45; color: #3d5430 }
  .url { position: absolute; left: 72px; bottom: 56px; padding: 10px 24px 11px; border-radius: 99px;
    background: #587642; color: #f4ebe5; font-size: 19px; letter-spacing: 0.1em; text-transform: uppercase }
  .art { position: absolute; right: 10px; bottom: 24px; width: ${artW}px; height: ${artH}px }
</style></head><body>
  <img class="logo" src="data:image/png;base64,${logo}" alt="">
  <h1><span>Twoje ręce.</span><span>Nasza glina.</span></h1>
  <p class="kick">Ceramika ze Stasią Kulik<br>Wizards of Art · Warszawa</p>
  <div class="url">astrelle.pl</div>
  <img class="art" src="data:image/png;base64,${art.toString('base64')}" alt="">
</body></html>`)
await card.evaluate(() => document.fonts.ready)
await card.waitForLoadState('networkidle')
await card.screenshot({ path: path.join(PUB, 'og.png') })
await browser.close()
console.log('og → public/og.png')
