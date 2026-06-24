import { chromium } from 'playwright'

const OUT = process.env.OUT || '/private/tmp/claude-501/-Users-dmytrii-Desktop-PROJEKTY-ASTRELLE-github-astrelle/388b6ad4-d822-49b4-9e5b-5b7565f759b3/scratchpad'
const URL = 'http://localhost:4317/'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()) })
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

// hero
await page.screenshot({ path: `${OUT}/01-hero.png` })

// scroll through sections
const ids = ['value', 'clay', 'invite', 'types', 'pricing', 'master', 'booking']
for (const id of ids) {
  await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ behavior: 'instant', block: 'start' }), id)
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/sec-${id}.png` })
}

// full page
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(400)
await page.screenshot({ path: `${OUT}/00-full.png`, fullPage: true })

// mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
await m.goto(URL, { waitUntil: 'networkidle' })
await m.waitForTimeout(2000)
await m.screenshot({ path: `${OUT}/mob-hero.png` })

console.log('errors:', errors.length ? '\n' + errors.join('\n') : 'none')
await browser.close()
