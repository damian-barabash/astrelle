import { useT } from '../i18n/index.jsx'
import { T, List } from '../content/edit.jsx'

// Privacy / cookies / terms. The copy lives in the language docs (legal.*) and is
// editable in the admin; {company} {address} {email} come from studio settings.
export default function Legal({ doc }) {
  const { studio, t } = useT()
  const fill = (s) =>
    String(s || '')
      .replace(/\{company\}/g, studio.company || 'Astrelle')
      .replace(/\{address\}/g, studio.address || '')
      .replace(/\{email\}/g, studio.email || '[e-mail]')
  const base = `legal.${doc}`
  return (
    <article className="legal">
      <div className="container legal__in">
        <T k={`${base}.title`} as="h1" className="h1" />
        <T k={`${base}.updated`} as="p" className="legal__date" />
        <List
          k={`${base}.blocks`}
          className="legal__blocks"
          max={20}
          template={{ h: '', p: '' }}
          render={(b, i, p) => (
            <section key={i} className="legal__block">
              <T k={`${p}.h`} as="h2" />
              <FilledP k={`${p}.p`} fill={fill} raw={t(`${p}.p`)} />
            </section>
          )}
        />
      </div>
    </article>
  )
}

// In edit mode show the raw text (with placeholders); on the site show it filled in.
function FilledP({ k, fill, raw }) {
  return <T k={k} as="p" multiline>{fill(raw)}</T>
}
