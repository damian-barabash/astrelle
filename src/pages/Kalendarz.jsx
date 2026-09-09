import { T } from '../content/edit.jsx'
import BookingCalendar, { CalendarSteps } from '../blocks/BookingCalendar.jsx'
import LeadForm from '../blocks/LeadForm.jsx'
import Goat from '../components/Goat.jsx'

export default function Kalendarz() {
  return (
    <>
      <section className="phead">
        <div className="container">
          <T k="calendar.title" as="h1" className="h1" />
          <div className="phead__row">
            <T k="calendar.sub" as="p" className="phead__sub" multiline />
            <CalendarSteps />
          </div>
        </div>
      </section>
      <section className="calsec" id="booking">
        <div className="container">
          <BookingCalendar />
        </div>
      </section>
      <section className="leadsec">
        <div className="container leadsec__grid">
          <LeadForm kind="contact" id="contact" />
          <LeadForm kind="gift" id="voucher" compact />
          <Goat n={9} className="leadsec__goat" />
        </div>
      </section>
    </>
  )
}
