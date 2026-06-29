import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchContent, fetchImages, callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { SECTIONS, TEXTAREA_KEYS, ITEM_TEMPLATES, labelFor } from '../schema.js'

// Editable block photos (language-agnostic). key → [label, default src]
const BLOCK_IMAGES = [
  ['band', 'Баннер «Керамика руками»', '/assets/img/photo-1.webp'],
  ['master', 'Фото мастера (Стася)', '/assets/img/photo-3.webp'],
  ['kurs', 'Мастер-классы — баннер', '/assets/img/photo-4.webp'],
  ['cowork', 'Коворкинг', '/assets/img/photo-6.webp'],
  ['clay_terracotta', 'Глина: терракота', '/assets/img/clay-terracotta.webp'],
  ['clay_stoneware', 'Глина: каменная масса', '/assets/img/clay-stoneware.webp'],
  ['clay_porcelain', 'Глина: фарфор', '/assets/img/clay-porcelain.webp'],
  ['clay_white', 'Глина: белая', '/assets/img/clay-white.webp'],
]

// Convert any picked image to WebP in the browser before upload (resize ≤1600px).
function toWebp(file, maxDim = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const im = new Image()
    im.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(im.naturalWidth, im.naturalHeight))
      const w = Math.round(im.naturalWidth * scale)
      const h = Math.round(im.naturalHeight * scale)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      c.getContext('2d').drawImage(im, 0, 0, w, h)
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/webp', quality)
    }
    im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось прочитать изображение')) }
    im.src = url
  })
}

function BlockImages({ token }) {
  const [images, setImages] = useState({})
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const fileRefs = useRef({})

  useEffect(() => { fetchImages().then(setImages).catch(() => {}) }, [])

  const upload = async (key, file) => {
    if (!file) return
    setErr(''); setBusy(key)
    try {
      const blob = await toWebp(file)
      const signed = await callFn('admin-gallery', { action: 'sign', token, ext: 'webp' })
      if (!signed.ok) throw new Error(signed.data?.error || 'sign failed')
      const put = await fetch(signed.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: blob })
      if (!put.ok) throw new Error('upload ' + put.status)
      const r = await callFn('admin-content', { action: 'images.set', token, key, url: signed.data.publicUrl })
      if (!r.ok) throw new Error(r.data?.error || 'save failed')
      setImages((im) => ({ ...im, [key]: signed.data.publicUrl }))
    } catch (e) {
      setErr('Ошибка: ' + e.message)
    }
    setBusy('')
  }
  const reset = async (key) => {
    await callFn('admin-content', { action: 'images.set', token, key, url: null })
    setImages((im) => { const n = { ...im }; delete n[key]; return n })
  }

  return (
    <div className="imgs">
      <p className="imgs__hint">Фото в блоках сайта. Любой формат — при загрузке сам сожмётся в WebP. Появятся на сайте сразу после загрузки.</p>
      {err ? <p className="aerr">{err}</p> : null}
      <div className="imgs__grid">
        {BLOCK_IMAGES.map(([key, label, def]) => {
          const cur = images[key]
          return (
            <div className="imgs__cell" key={key}>
              <div className="imgs__thumb"><img src={cur || def} alt="" loading="lazy" /></div>
              <div className="imgs__meta">
                <span className="imgs__label">{label}{cur ? <i className="imgs__custom"> · своё</i> : null}</span>
                <div className="imgs__act">
                  <input
                    ref={(el) => (fileRefs.current[key] = el)}
                    type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && upload(key, e.target.files[0])}
                  />
                  <button type="button" className="abtn abtn--sm" disabled={busy === key} onClick={() => fileRefs.current[key]?.click()}>
                    {busy === key ? 'Загрузка…' : 'Заменить'}
                  </button>
                  {cur ? <button type="button" className="abtn abtn--ghost abtn--sm" onClick={() => reset(key)}>Сброс</button> : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
function Section({ title, value, path, onChange, open, onToggle, children }) {
  return (
    <div className={`asec ${open ? 'asec--open' : ''}`}>
      <button type="button" className="asec__head" onClick={onToggle}>
        <span>{title}</span>
        <span className="asec__chev">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="asec__body">
          {children != null ? children : <Node value={value} path={path} leafKey="" onChange={onChange} />}
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
        кнопками. Изменения попадут на сайт после «Сохранить». Фото блоков — ниже (применяются сразу).
      </p>

      <div className="edit__sections">
        <Section
          title="Фото блоков"
          open={openKey === '__images'}
          onToggle={() => setOpenKey(openKey === '__images' ? '' : '__images')}
        >
          <BlockImages token={token} />
        </Section>
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
