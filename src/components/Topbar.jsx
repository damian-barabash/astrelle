import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useT, LangSwitch } from '../i18n/index.jsx'
import { Logo } from './Brand.jsx'
import Goat from './Goat.jsx'

export const NAV = [
  ['/', 'nav.home'],
  ['/kalendarz', 'nav.calendar'],
  ['/sklep', 'nav.shop'],
]

export default function Topbar() {
  const { t } = useT()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className={`top ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container top__in">
          <NavLink className="top__brand" to="/" aria-label="Astrelle">
            <Logo />
          </NavLink>
          <nav className="top__nav" aria-label="Menu">
            {NAV.map(([to, key]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `top__link ${isActive ? 'is-active' : ''}`}>
                {t(key)}
              </NavLink>
            ))}
          </nav>
          <div className="top__right">
            <LangSwitch className="top__lang" />
            <NavLink className="btn btn--primary btn--sm top__cta" to="/kalendarz">
              {t('nav.book')}
            </NavLink>
            <button type="button" className={`burger ${open ? 'is-open' : ''}`} aria-label={open ? t('nav.close') : t('nav.menu')} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav className="drawer__nav" aria-label="Menu">
          {NAV.map(([to, key], i) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `drawer__link ${isActive ? 'is-active' : ''}`} style={{ transitionDelay: open ? `${0.06 + i * 0.05}s` : '0s' }}>
              <span className="drawer__num">0{i + 1}</span>
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="drawer__foot">
          <NavLink className="btn btn--primary btn--lg" to="/kalendarz" onClick={() => setOpen(false)}>
            {t('nav.book')}
          </NavLink>
          <LangSwitch />
        </div>
        <Goat n={17} className="drawer__goat" />
      </div>
    </>
  )
}
