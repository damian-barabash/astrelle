import { useT } from '../i18n/index.jsx'
import { T } from '../content/edit.jsx'
import LeadForm from '../blocks/LeadForm.jsx'
import Goat from '../components/Goat.jsx'
import Out, { Tel } from '../components/Out.jsx'
import { Shape } from '../components/Shapes.jsx'
import { Where } from '../sections/home.jsx'
import { PARTNER } from '../data/offers.js'

// Two different doors: the studio (bookings, payments, vouchers) and Astrelle itself.
export default function Kontakt() {
  const { studio } = useT()
  return (
    <>
      <section className="phead">
        <div className="container">
          <div className="phead__top">
            <T k="contact.title" as="h1" className="h1" />
            <div className="phead__shapes" aria-hidden="true">
              <Shape name="pin" />
              <Shape name="arch" />
              <Shape name="pitcher" />
            </div>
          </div>
          <div className="phead__row">
            <T k="contact.sub" as="p" className="phead__sub" multiline />
          </div>
        </div>
      </section>

      <section className="kdoors">
        <div className="container kdoors__in">
          <article className="card kdoor kdoor--fill">
            <span className="card__num">01</span>
            <T k="contact.studioT" as="h2" className="h2" />
            <T k="contact.studioD" as="p" multiline />
            <div className="kdoor__links">
              <Tel place="contact" />
              <a href={`mailto:${PARTNER.email}`}>{PARTNER.email}</a>
              <Out to="contact" place="contact">
                <T k="contact.site" /> ↗
              </Out>
              <Out to="instagram" place="contact">Instagram ↗</Out>
            </div>
            <Out className="btn btn--lg kdoor__btn" to="schedule" place="contact">
              <T k="hero.cta2" /> ↗
            </Out>
          </article>
          <div className="kdoor kdoor--form">
            <span className="label"><T k="contact.usT" /></span>
            <T k="contact.usD" as="p" className="kdoor__d" multiline />
            {studio.email || studio.instagram ? (
              <div className="kdoor__links kdoor__links--row">
                {studio.email ? <a href={`mailto:${studio.email}`}>{studio.email}</a> : null}
                {studio.instagram ? (
                  <a href={studio.instagram.startsWith('http') ? studio.instagram : `https://instagram.com/${studio.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                    Instagram ↗
                  </a>
                ) : null}
              </div>
            ) : null}
            <LeadForm kind="contact" id="form" />
            <Goat n={9} className="kdoor__goat" />
          </div>
        </div>
      </section>

      <Where />
    </>
  )
}
