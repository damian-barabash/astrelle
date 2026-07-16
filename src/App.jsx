import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useT } from './i18n/index.jsx'
import { initAnalytics, trackPageview } from './lib/analytics.js'
import { scrollToBooking } from './stack.jsx'
import Topbar from './components/Topbar.jsx'
import Mascot from './Mascot.jsx'

// Public-site layout: topbar with the menu, the routed page, the fact mascot.
export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
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

  // new page starts at the top (the #booking hash is handled by Home itself)
  useEffect(() => {
    if (location.hash) return
    window.scrollTo(0, 0)
  }, [location.pathname])

  // per-page document title
  useEffect(() => {
    const sub = { '/proces': t('nav.proces'), '/cennik': t('nav.cennik') }[location.pathname]
    document.title = sub ? `${sub} · Astrelle` : 'Astrelle — ceramika ręczna, kursy i coworking · Warszawa'
  }, [location.pathname, lang, t])

  // every "#booking" link: on the home page scroll to the settled calendar spot,
  // from any other page navigate home first (Home scrolls after the stack lays out)
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href$="#booking"]')
      if (!a) return
      e.preventDefault()
      if (window.location.pathname === '/') scrollToBooking()
      else navigate('/#booking')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [navigate])

  return (
    <>
      <Topbar />
      <Outlet />
      <Mascot />
    </>
  )
}
