import { createContext, useContext, useRef } from 'react'
import { useT } from '../i18n/index.jsx'

// Inline-editing primitives shared by the public site and the admin's visual editor.
// On the public site EditCtx is null and these render plain markup.
// Inside the editor they become click-to-edit text, replaceable images, lists with
// add/remove/reorder controls and sections with show/hide + move controls.
export const EditCtx = createContext(null)
export const useEdit = () => useContext(EditCtx)

const cx = (...a) => a.filter(Boolean).join(' ')

// Editable text. `k` is the dot-path in the language doc. Single-line by default —
// Enter commits; `multiline` allows line breaks (paragraphs).
export function T({ k, as: Tag = 'span', className = '', multiline = false, children, ...rest }) {
  const { t } = useT()
  const ed = useEdit()
  const v = t(k)
  const raw = typeof v === 'string' ? v : String(v ?? '')
  // on the site an explicit child wins (e.g. legal text with placeholders filled in)
  if (!ed) return <Tag className={className || undefined} {...rest}>{children != null ? children : raw}</Tag>
  const text = raw
  return (
    <Tag
      className={cx(className, 'ed-text', ed.selected === k && 'is-selected')}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-k={k}
      onFocus={() => ed.select(k)}
      onBlur={(e) => ed.set(k, e.currentTarget.innerText.replace(/\n{3,}/g, '\n\n').trim())}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (e.key === 'Escape') e.currentTarget.blur()
      }}
      {...rest}
    >
      {text}
    </Tag>
  )
}

// Editable block image (site_settings.images[k]) with a bundled fallback.
export function Img({ k, fallback, alt = '', className = '', ...rest }) {
  const { img } = useT()
  const ed = useEdit()
  const src = img(k, fallback)
  if (!ed) return <img src={src} alt={alt} className={className || undefined} loading="lazy" {...rest} />
  return (
    <span className={cx('ed-img', className)} data-k={k}>
      <img src={src} alt={alt} {...rest} />
      <span className="ed-img__bar">
        <button type="button" onClick={() => ed.pickImage(k)}>{ed.busyImage === k ? '…' : 'Заменить'}</button>
        {img(k, '') ? <button type="button" onClick={() => ed.resetImage(k)}>Сброс</button> : null}
      </span>
    </span>
  )
}

// Editable array. `render(item, i, path)` draws one item; `template` is the blank item.
export function List({ k, render, template, className = '', as: Tag = 'div', max = 12 }) {
  const { t } = useT()
  const ed = useEdit()
  const items = t(k)
  const arr = Array.isArray(items) ? items : []
  if (!ed) return <Tag className={className || undefined}>{arr.map((it, i) => render(it, i, `${k}.${i}`))}</Tag>
  const set = (next) => ed.set(k, next)
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= arr.length) return
    const a = arr.slice()
    ;[a[i], a[j]] = [a[j], a[i]]
    set(a)
  }
  return (
    <Tag className={cx(className, 'ed-list')}>
      {arr.map((it, i) => (
        <div className="ed-item" key={i}>
          {render(it, i, `${k}.${i}`)}
          <span className="ed-item__bar">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Выше">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === arr.length - 1} title="Ниже">↓</button>
            <button type="button" className="ed-del" onClick={() => set(arr.filter((_, j) => j !== i))} title="Удалить">✕</button>
          </span>
        </div>
      ))}
      {arr.length < max && (
        <button type="button" className="ed-add" onClick={() => set([...arr, typeof template === 'function' ? template() : JSON.parse(JSON.stringify(template))])}>
          + добавить
        </button>
      )}
    </Tag>
  )
}

// A page section that the editor can hide or move. `id` must be unique per page.
export function Section({ id, label, className = '', children, as: Tag = 'section', ...rest }) {
  const { layout } = useT()
  const ed = useEdit()
  const hidden = (layout?.hidden || []).includes(id)
  const ref = useRef(null)
  if (!ed) return hidden ? null : <Tag id={id} className={className || undefined} {...rest}>{children}</Tag>
  return (
    <Tag id={id} ref={ref} className={cx(className, 'ed-sec', hidden && 'is-hidden')} {...rest}>
      <span className="ed-sec__bar">
        <b>{label || id}</b>
        <button type="button" onClick={() => ed.moveSection(id, -1)} title="Выше">↑</button>
        <button type="button" onClick={() => ed.moveSection(id, 1)} title="Ниже">↓</button>
        <button type="button" onClick={() => ed.toggleSection(id)}>{hidden ? 'Показать' : 'Скрыть'}</button>
      </span>
      {children}
    </Tag>
  )
}

// Orders a page's sections by layout.order (unknown ids keep their code order).
export function orderSections(list, layout) {
  const order = layout?.order || []
  if (!order.length) return list
  const idx = (id) => {
    const i = order.indexOf(id)
    return i < 0 ? 1000 + list.findIndex((s) => s.id === id) : i
  }
  return list.slice().sort((a, b) => idx(a.id) - idx(b.id))
}
