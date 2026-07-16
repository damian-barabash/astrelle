import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useT, LangSwitch } from '../i18n/index.jsx'
import { Logo } from './Brand.jsx'
import { Goat } from './Decor.jsx'

export const NAV = [
  ['/', 'nav.home'],
  ['/proces', 'nav.proces'],
  ['/cennik', 'nav.cennik'],
]

export default function Topbar() {
  const { t } = useT()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close the drawer on navigation + lock body scroll while it is open
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
        <NavLink className="topbar__brand" to="/" aria-label="Astrelle">
          <Logo />
        </NavLink>

        <nav className="topbar__nav" aria-label="Menu">
          {NAV.map(([to, key]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `topbar__link ${isActive ? 'is-active' : ''}`}>
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="topbar__actions">
          <LangSwitch className="topbar__lang" />
          <a className="btn btn--primary topbar__cta" href="#booking">
            {t('nav.book')}
          </a>
          <button
            type="button"
            className={`topbar__burger ${open ? 'is-open' : ''}`}
            aria-label={t('nav.menu')}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* mobile drawer */}
      <div className={`drawer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav className="drawer__nav" aria-label="Menu">
          {NAV.map(([to, key], i) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `drawer__link ${isActive ? 'is-active' : ''}`}
              style={{ transitionDelay: open ? `${0.08 + i * 0.06}s` : '0s' }}
            >
              <span className="drawer__num">0{i + 1}</span>
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="drawer__foot" style={{ transitionDelay: open ? '0.3s' : '0s' }}>
          <a className="btn btn--primary btn--lg drawer__cta" href="#booking" onClick={() => setOpen(false)}>
            {t('nav.book')}
          </a>
          <LangSwitch />
        </div>
        <Goat n={17} className="drawer__goat" />
      </div>
    </>
  )
}
