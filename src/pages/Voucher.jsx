import { useT } from '../i18n/index.jsx'
import { T, List } from '../content/edit.jsx'
import Goat from '../components/Goat.jsx'
import Out, { Promo } from '../components/Out.jsx'
import { Shape, Spark } from '../components/Shapes.jsx'
import { VoucherTicket } from '../sections/home.jsx'
import { VOUCHERS, withOverrides, priceText } from '../data/offers.js'

// Gift vouchers are issued by the studio: one electronic (any amount) and five printed
// ones. This page explains them and leads to the right product on the studio's site.
export default function Voucher() {
  const { t, partner } = useT()
  const list = withOverrides(VOUCHERS, partner)
  const online = list.find((v) => v.kind === 'online')
  const printed = list.filter((v) => v.kind === 'print')
  return (
    <>
      <section className="phead vhead">
        <div className="container vhead__in">
          <div>
            <T k="voucher.pageTitle" as="h1" className="h1" />
            <T k="voucher.pageSub" as="p" className="phead__sub" multiline />
            <List
              k="voucher.facts"
              className="vhead__facts"
              max={5}
              template=""
              render={(x, i, p) => (
                <span className="odet__li" key={i}>
                  <Spark className="odet__spark" />
                  <T k={p} />
                </span>
              )}
            />
          </div>
          <div className="vhead__art">
            <VoucherTicket />
            <Goat n={17} className="vhead__goat" />
          </div>
        </div>
      </section>

      <section className="vlist">
        <div className="container vlist__in">
          {online && (
            <article className="card vcard vcard--main">
              <span className="card__num">01</span>
              <span className="label">{t('voucher.onlineLabel')}</span>
              <T k="voucher.items.vou_online.t" as="h2" className="h2" />
              <T k="voucher.items.vou_online.d" as="p" multiline />
              <div className="vcard__foot">
                <span className="ocard__price">{priceText(online, t('offers.from'))}</span>
                <Out className="btn btn--lg vcard__btn" to="vou_online" place="voucher-page">
                  {t('voucher.buy')} ↗
                </Out>
              </div>
            </article>
          )}
          <div className="vrows">
            <div className="vrows__head">
              <span className="label">{t('voucher.printLabel')}</span>
              <Shape name="ticket" className="vrows__shape" />
            </div>
            {printed.map((v) => (
              <div className="vrow" key={v.id}>
                <div className="vrow__main">
                  <T k={`voucher.items.${v.id}.t`} as="h3" />
                  <T k={`voucher.items.${v.id}.d`} as="p" />
                </div>
                <span className="vrow__price">{priceText(v, t('offers.from'))}</span>
                <Out className="btn btn--sm" to={v.id} place="voucher-page">
                  {t('voucher.buyShort')} ↗
                </Out>
              </div>
            ))}
            <Promo />
          </div>
        </div>
      </section>
    </>
  )
}
