import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useT } from './i18n/index.jsx'
import { initAnalytics, trackPageview } from './lib/analytics.js'
import Topbar from './components/Topbar.jsx'
import Footer from './components/Footer.jsx'
import Mascot from './Mascot.jsx'

const TITLES = { '/kalendarz': 'nav.calendar', '/sklep': 'nav.shop', '/polityka-prywatnosci': 'footer.privacy', '/cookies': 'footer.cookies', '/regulamin': 'footer.terms' }

// Public-site layout: topbar, the routed page, footer, the goat (cookie consent + facts).
export default function App() {
  const location = useLocation()
  const { t, lang } = useT()

  useEffect(() => initAnalytics(), [])

  // SPA navigation → count a pageview (initAnalytics already sent the first one)
  const firstPv = useRef(true)
  useEffect(() => {
    if (firstPv.current) {
      firstPv.current = false
      return
    }
    trackPageview()
  }, [location.pathname])

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const sub = TITLES[location.pathname]
    document.title = sub ? `${t(sub)} · Astrelle` : t('meta.title')
    const m = document.querySelector('meta[name="description"]')
    if (m) m.setAttribute('content', t('meta.desc'))
  }, [location.pathname, lang, t])

  return (
    <>
      <Topbar />
      <main className="page" key={lang}>
        <Outlet />
      </main>
      <Footer />
      <Mascot />
    </>
  )
}
