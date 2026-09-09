import { NavLink } from 'react-router-dom'
import { useT, LangSwitch } from '../i18n/index.jsx'
import { T } from '../content/edit.jsx'
import { Logo } from './Brand.jsx'
import { NAV } from './Topbar.jsx'
import Goat from './Goat.jsx'
import { resetConsent } from '../lib/consent.js'

export default function Footer() {
  const { t, studio } = useT()
  return (
    <footer className="foot">
      <div className="container">
        <div className="foot__grid">
          <div className="foot__brand">
            <Logo className="foot__logo" />
            <T k="footer.tagline" as="p" className="foot__tag" />
            <div className="foot__goats">
              {[1, 13, 8].map((n) => (
                <Goat key={n} n={n} className="foot__goat" />
              ))}
            </div>
          </div>
          <nav className="foot__col" aria-label="Menu">
            <span className="label">Menu</span>
            {NAV.map(([to, key]) => (
              <NavLink key={to} to={to} end={to === '/'}>
                {t(key)}
              </NavLink>
            ))}
            <NavLink to="/kalendarz">{t('nav.book')}</NavLink>
          </nav>
          <div className="foot__col">
            <span className="label"><T k="footer.legal" /></span>
            <NavLink to="/polityka-prywatnosci">{t('footer.privacy')}</NavLink>
            <NavLink to="/cookies">{t('footer.cookies')}</NavLink>
            <NavLink to="/regulamin">{t('footer.terms')}</NavLink>
            <button type="button" className="foot__link" onClick={resetConsent}>
              {t('footer.cookies')} · ⚙
            </button>
          </div>
          <div className="foot__col">
            <span className="label"><T k="footer.contact" /></span>
            <span>studio AINO</span>
            <span>{studio.address}</span>
            {studio.phone ? <a href={`tel:${studio.phone.replace(/\s/g, '')}`}>{studio.phone}</a> : null}
            {studio.email ? <a href={`mailto:${studio.email}`}>{studio.email}</a> : null}
            {studio.instagram ? (
              <a href={studio.instagram.startsWith('http') ? studio.instagram : `https://instagram.com/${studio.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                Instagram ↗
              </a>
            ) : null}
            <LangSwitch className="foot__lang" />
          </div>
        </div>
        <div className="foot__bottom">
          <span>© {new Date().getFullYear()} Astrelle · {t('footer.rights')}</span>
          <span>✦ {t('footer.made')}</span>
        </div>
      </div>
    </footer>
  )
}
