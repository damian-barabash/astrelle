import { useEffect, useState, useCallback } from 'react'
import { fetchContent, callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { SECTIONS, TEXTAREA_KEYS, ITEM_TEMPLATES, labelFor } from '../schema.js'

const LANGS = [
  ['ru', 'RU'],
  ['pl', 'PL'],
  ['en', 'EN'],
]

const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)))
function blankLike(s) {
  if (typeof s === 'string') return ''
  if (Array.isArray(s)) return s.map(blankLike)
  if (s && typeof s === 'object') return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, blankLike(v)]))
  return s
}
function setIn(obj, path, value) {
  if (path.length === 0) return value
  const [head, ...rest] = path
  const copy = Array.isArray(obj) ? obj.slice() : { ...obj }
  copy[head] = setIn(obj[head], rest, value)
  return copy
}

/* ---- recursive field renderers ---- */
function Field({ value, path, leafKey, onChange }) {
  const multiline = TEXTAREA_KEYS.has(leafKey) || value.length > 70
  const label = labelFor(leafKey)
  return (
    <label className="af">
      {label ? <span className="af__lbl">{label}</span> : null}
      {multiline ? (
        <textarea
          value={value}
          rows={Math.min(8, Math.max(2, Math.ceil(value.length / 56)))}
          onChange={(e) => onChange(path, e.target.value)}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(path, e.target.value)} />
      )}
    </label>
  )
}

function ArrayEditor({ value, path, leafKey, onChange }) {
  const firstIsObj = value.length > 0 ? value[0] && typeof value[0] === 'object' : false
  const add = () => {
    const tpl =
      ITEM_TEMPLATES[leafKey] !== undefined
        ? clone(ITEM_TEMPLATES[leafKey])
        : value.length > 0
          ? blankLike(value[0])
          : ''
    onChange(path, [...value, tpl])
  }
  const remove = (i) => onChange(path, value.filter((_, j) => j !== i))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const a = value.slice()
    ;[a[i], a[j]] = [a[j], a[i]]
    onChange(path, a)
  }
  return (
    <div className="arr">
      <div className="arr__head">{labelFor(leafKey)}</div>
      {value.map((item, i) => (
        <div className={`arr__item ${firstIsObj ? 'arr__item--card' : ''}`} key={i}>
          <div className="arr__ctl">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Выше">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} title="Ниже">↓</button>
            <button type="button" className="arr__del" onClick={() => remove(i)} title="Удалить">✕</button>
          </div>
          <Node value={item} path={[...path, i]} leafKey={typeof item === 'string' ? '' : ''} onChange={onChange} />
        </div>
      ))}
      <button type="button" className="arr__add" onClick={add}>+ добавить</button>
    </div>
  )
}

function Node({ value, path, leafKey, onChange }) {
  if (typeof value === 'string') return <Field value={value} path={path} leafKey={leafKey} onChange={onChange} />
  if (Array.isArray(value)) return <ArrayEditor value={value} path={path} leafKey={leafKey} onChange={onChange} />
  if (value && typeof value === 'object') {
    return (
      <div className="ag">
        {Object.keys(value).map((k) => (
          <Node key={k} value={value[k]} path={[...path, k]} leafKey={k} onChange={onChange} />
        ))}
      </div>
    )
  }
  return null
}

/* ---- one collapsible section ---- */
function Section({ title, value, path, onChange, open, onToggle }) {
  return (
    <div className={`asec ${open ? 'asec--open' : ''}`}>
      <button type="button" className="asec__head" onClick={onToggle}>
        <span>{title}</span>
        <span className="asec__chev">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="asec__body">
          <Node value={value} path={path} leafKey="" onChange={onChange} />
        </div>
      )}
    </div>
  )
}

export default function EditContent() {
  const { token } = useAdmin()
  const [docs, setDocs] = useState(null) // { ru, pl, en }
  const [lang, setLang] = useState('ru')
  const [dirty, setDirty] = useState({})
  const [openKey, setOpenKey] = useState('hero')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const load = useCallback(() => {
    setErr('')
    fetchContent()
      .then((db) => {
        setDocs({ ru: db.ru || {}, pl: db.pl || {}, en: db.en || {} })
        setDirty({})
      })
      .catch((e) => setErr('Не удалось загрузить контент: ' + e.message))
  }, [])
  useEffect(() => { load() }, [load])

  const onChange = useCallback(
    (path, value) => {
      setDocs((prev) => ({ ...prev, [lang]: setIn(prev[lang], path, value) }))
      setDirty((d) => ({ ...d, [lang]: true }))
      setMsg('')
    },
    [lang]
  )

  const save = async () => {
    if (!docs) return
    setSaving(true)
    setMsg('')
    setErr('')
    const r = await callFn('admin-content', { action: 'save', token, lang, doc: docs[lang] })
    setSaving(false)
    if (r.ok && r.data.ok) {
      setDirty((d) => ({ ...d, [lang]: false }))
      setMsg(`Сохранено (${lang.toUpperCase()})`)
    } else {
      setErr(r.data?.error || 'Ошибка сохранения')
    }
  }

  if (err && !docs) return <div className="apad"><p className="aerr">{err}</p><button className="abtn" onClick={load}>Повторить</button></div>
  if (!docs) return <div className="apad">Загрузка контента…</div>

  const doc = docs[lang] || {}
  const known = SECTIONS.filter(([k]) => k in doc)
  const extra = Object.keys(doc).filter((k) => !SECTIONS.some(([s]) => s === k))

  return (
    <div className="edit">
      <div className="edit__bar">
        <div className="edit__langs">
          {LANGS.map(([code, lbl]) => (
            <button
              key={code}
              type="button"
              className={`edit__lang ${code === lang ? 'is-active' : ''}`}
              onClick={() => setLang(code)}
            >
              {lbl}
              {dirty[code] ? <i className="edit__dot" /> : null}
            </button>
          ))}
        </div>
        <div className="edit__actions">
          {msg ? <span className="edit__msg">{msg}</span> : null}
          {err ? <span className="aerr">{err}</span> : null}
          <button type="button" className="abtn abtn--ghost" onClick={load}>Сбросить</button>
          <button type="button" className="abtn" onClick={save} disabled={saving || !dirty[lang]}>
            {saving ? 'Сохраняю…' : `Сохранить ${lang.toUpperCase()}`}
          </button>
        </div>
      </div>

      <p className="edit__hint">
        Правишь язык <b>{lang.toUpperCase()}</b>. Меняй тексты, добавляй/удаляй карточки, строки и группы цен
        кнопками. Изменения попадут на сайт после «Сохранить». Фото и галерея — в следующем обновлении.
      </p>

      <div className="edit__sections">
        {known.map(([key, title]) => (
          <Section
            key={key}
            title={title}
            value={doc[key]}
            path={[key]}
            onChange={onChange}
            open={openKey === key}
            onToggle={() => setOpenKey(openKey === key ? '' : key)}
          />
        ))}
        {extra.map((key) => (
          <Section
            key={key}
            title={key}
            value={doc[key]}
            path={[key]}
            onChange={onChange}
            open={openKey === key}
            onToggle={() => setOpenKey(openKey === key ? '' : key)}
          />
        ))}
      </div>
    </div>
  )
}
