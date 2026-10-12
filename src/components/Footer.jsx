import { NavLink } from 'react-router-dom'
import { useT, LangSwitch } from '../i18n/index.jsx'
import { T } from '../content/edit.jsx'
import { Logo } from './Brand.jsx'
import { NAV } from './Topbar.jsx'
import Goat from './Goat.jsx'
import { Shape, Print, Spark } from './Shapes.jsx'
import { resetConsent } from '../lib/consent.js'
import Out, { Tel } from './Out.jsx'
import { PARTNER, PLACES } from '../data/offers.js'

export default function Footer() {
  const { t, studio } = useT()
  return (
    <footer className="foot">
      <div className="container">
        <div className="foot__grid">
          <div className="foot__brand">
            <Logo className="foot__logo" />
            <T k="footer.tagline" as="p" className="foot__tag" />
            <Out className="btn btn--lg foot__cta" to="schedule" place="footer">
              {t('nav.book')} ↗
            </Out>
            <T k="footer.partner" as="p" className="foot__note" multiline />
          </div>
          <nav className="foot__col" aria-label="Menu">
            <span className="label">Menu</span>
            {NAV.map(([to, key]) => (
              <NavLink key={to} to={to} end={to === '/'}>
                {t(key)}
              </NavLink>
            ))}
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
            <span className="label"><T k="footer.studio" /></span>
            <Out to="site" place="footer">{PARTNER.name} ↗</Out>
            <span>{PLACES.zurawia.street}</span>
            <span>{PLACES.wiolinowa.street}</span>
            <Tel place="footer" />
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
          <span>{t('footer.made')}</span>
        </div>
      </div>
      {/* a jar on the turning wheel, with two goats keeping it company */}
      <div className="foot__art" aria-hidden="true">
        <Print n={26} seed={6} className="foot__rings" />
        <Shape name="jar" className="foot__jar" />
        <Goat n={1} className="foot__goat foot__goat--a" />
        <Goat n={7} className="foot__goat foot__goat--b" />
        <Spark className="foot__spark" />
      </div>
    </footer>
  )
}
