import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchContent, callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'
import { LangProvider, BUNDLED, deepMerge, pick } from '../../i18n/index.jsx'
import { EditCtx } from '../../content/edit.jsx'
import { Modal, useToast, toWebp, loadSettings, patchSettingsCache } from '../ui.jsx'
import Topbar from '../../components/Topbar.jsx'
import Footer from '../../components/Footer.jsx'
import Home, { HOME_SECTIONS } from '../../pages/Home.jsx'
import Kalendarz from '../../pages/Kalendarz.jsx'
import Sklep from '../../pages/Sklep.jsx'
import Legal from '../../pages/Legal.jsx'

// Visual editor: the real site renders inside the panel; every text is click-to-edit,
// images are replaceable, lists get +/−/↑↓, home sections can be hidden or reordered.
const PAGES = [
  ['home', 'Главная'],
  ['kalendarz', 'Календарь'],
  ['sklep', 'Магазин'],
  ['privacy', 'Политика прив.'],
  ['cookies', 'Cookies'],
  ['terms', 'Регуламин'],
]
const SECTION_LABELS = { hero: 'Hero', formats: 'Форматы 01/02/03', band: 'Фото-лента', steps: 'Как это работает', master: 'Мастер и студия', gallery: 'Галерея', pricing: 'Цены', facts: 'Факты', cta: 'Призыв' }
const IMAGE_KEYS = [['master', 'Фото мастера'], ['band', 'Фото-лента'], ['hero_1', 'Hero · фото 1'], ['hero_2', 'Hero · фото 2'], ['hero_3', 'Hero · фото 3'], ['format_0', 'Формат 01 · фото'], ['format_1', 'Формат 02 · фото'], ['format_2', 'Формат 03 · фото']]

function setIn(obj, path, value) {
  if (path.length === 0) return value
  const [head, ...rest] = path
  const copy = Array.isArray(obj) ? obj.slice() : { ...(obj || {}) }
  copy[head] = setIn(obj?.[head], rest, value)
  return copy
}

export default function Editor() {
  const { token } = useAdmin()
  const toast = useToast()
  const [docs, setDocs] = useState(null)
  const [settings, setSettings] = useState(null)
  const [lang, setLang] = useState('pl')
  const [page, setPage] = useState('home')
  const [device, setDevice] = useState('desktop')
  const [dirty, setDirty] = useState({})
  const [layoutDirty, setLayoutDirty] = useState(false)
  const [selected, setSelected] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyImage, setBusyImage] = useState('')
  const [help, setHelp] = useState(false)
  const fileRef = useRef(null)
  const pendingKey = useRef('')

  const load = useCallback(() => {
    Promise.all([fetchContent(), loadSettings(token, true)]).then(([db, s]) => {
      setDocs({ ru: deepMerge(BUNDLED.ru, db.ru), pl: deepMerge(BUNDLED.pl, db.pl), en: deepMerge(BUNDLED.en, db.en) })
      setSettings({ images: s.images || {}, layout: s.layout || {}, studio: s.studio || {}, shop: s.shop || {} })
      setDirty({})
      setLayoutDirty(false)
    })
  }, [token])
  useEffect(() => { load() }, [load])

  // warn before leaving with unsaved edits
  const hasDirty = Object.values(dirty).some(Boolean) || layoutDirty
  useEffect(() => {
    const h = (e) => { if (hasDirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [hasDirty])

  const set = useCallback((k, value) => {
    setDocs((d) => {
      const cur = pick(d[lang], k)
      if (cur === value) return d
      return { ...d, [lang]: setIn(d[lang], k.split('.').map((s) => (/^\d+$/.test(s) ? +s : s)), value) }
    })
    setDirty((x) => ({ ...x, [lang]: true }))
  }, [lang])

  const order = useMemo(() => {
    const o = settings?.layout?.order?.length ? settings.layout.order : HOME_SECTIONS.map((s) => s.id)
    return [...o, ...HOME_SECTIONS.map((s) => s.id).filter((id) => !o.includes(id))]
  }, [settings])
  const hidden = settings?.layout?.hidden || []
  const setLayout = (next) => { setSettings((s) => ({ ...s, layout: next })); setLayoutDirty(true) }
  const moveSection = (id, d) => {
    const i = order.indexOf(id)
    const j = i + d
    if (i < 0 || j < 0 || j >= order.length) return
    const o = order.slice(); [o[i], o[j]] = [o[j], o[i]]
    setLayout({ ...settings.layout, order: o })
  }
  const toggleSection = (id) => setLayout({ ...settings.layout, hidden: hidden.includes(id) ? hidden.filter((x) => x !== id) : [...hidden, id] })

  const pickImage = (k) => { pendingKey.current = k; fileRef.current?.click() }
  const onFile = async (e) => {
    const file = e.target.files?.[0]
    const k = pendingKey.current
    e.target.value = ''
    if (!file || !k) return
    setBusyImage(k)
    try {
      const blob = await toWebp(file)
      const signed = await callFn('admin-gallery', { action: 'sign', token, ext: 'webp' })
      if (!signed.ok) throw new Error('sign')
      const put = await fetch(signed.data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: blob })
      if (!put.ok) throw new Error('upload')
      const r = await callFn('admin-content', { action: 'images.set', token, key: k, url: signed.data.publicUrl })
      if (!r.ok) throw new Error('save')
      const images = { ...settings.images, [k]: signed.data.publicUrl }
      setSettings((s) => ({ ...s, images }))
      patchSettingsCache('images', images)
      toast('Фото заменено (уже на сайте)')
    } catch (err) {
      toast('Ошибка загрузки: ' + err.message)
    }
    setBusyImage('')
  }
  const resetImage = async (k) => {
    await callFn('admin-content', { action: 'images.set', token, key: k, url: null })
    const images = { ...settings.images }; delete images[k]
    setSettings((s) => ({ ...s, images }))
    patchSettingsCache('images', images)
  }

  const save = async () => {
    setSaving(true)
    const payload = {}
    for (const l of Object.keys(dirty)) if (dirty[l]) payload[l] = docs[l]
    let ok = true
    if (Object.keys(payload).length) {
      const r = await callFn('admin-content', { action: 'save_all', token, docs: payload })
      ok = r.ok && r.data.ok
    }
    if (ok && layoutDirty) {
      const r = await callFn('admin-content', { action: 'settings.set', token, key: 'layout', value: settings.layout })
      ok = r.ok
      if (ok) patchSettingsCache('layout', settings.layout)
    }
    setSaving(false)
    if (ok) { setDirty({}); setLayoutDirty(false); toast('Опубликовано на сайте') } else toast('Ошибка сохранения')
  }

  // clicks on site links must not navigate the admin away
  const stopLinks = (e) => {
    const a = e.target.closest && e.target.closest('a')
    if (a) { e.preventDefault(); e.stopPropagation() }
  }

  if (!docs || !settings) return <p className="aempty">Загрузка редактора…</p>

  const selValue = selected ? pick(docs[lang], selected) : null
  const ed = { lang, selected, select: setSelected, set, pickImage, resetImage, busyImage, moveSection, toggleSection }
  const override = { lang, setLang, dicts: docs, images: settings.images, layout: settings.layout, studio: settings.studio, shop: settings.shop }

  return (
    <div className="edt">
      <div className="edt__main">
        <div className="edt__bar">
          <div className="edt__bar-l">
            <Link className="abtn abtn--ghost abtn--sm" to="/admin" onClick={(e) => { if (hasDirty && !confirm('Есть несохранённые правки. Выйти без публикации?')) e.preventDefault() }}>← Панель</Link>
            <div className="aseg">{PAGES.map(([k, l]) => <button key={k} className={page === k ? 'is-active' : ''} onClick={() => { setPage(k); setSelected('') }}>{l}</button>)}</div>
            <div className="aseg">{['pl', 'ru', 'en'].map((l) => <button key={l} className={lang === l ? 'is-active' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}{dirty[l] && <i className="edt__dirty" />}</button>)}</div>
            <div className="aseg"><button className={device === 'desktop' ? 'is-active' : ''} onClick={() => setDevice('desktop')}>🖥</button><button className={device === 'mobile' ? 'is-active' : ''} onClick={() => setDevice('mobile')}>📱</button></div>
          </div>
          <div className="edt__bar-r">
            <button className="abtn abtn--ghost abtn--sm" onClick={() => setHelp(true)}>?</button>
            <button className="abtn abtn--ghost abtn--sm" onClick={load} disabled={!hasDirty}>Отменить</button>
            <button className="abtn abtn--sm" onClick={save} disabled={saving || !hasDirty}>{saving ? 'Публикую…' : hasDirty ? 'Опубликовать' : 'Всё опубликовано'}</button>
          </div>
        </div>
        <div className="edt__stage">
          <div className={`edt__frame ${device === 'mobile' ? 'edt__frame--mobile' : ''}`} onClickCapture={stopLinks}>
            <LangProvider override={override}>
              <EditCtx.Provider value={ed}>
                <Topbar />
                <main className="page">
                  {page === 'home' && <Home />}
                  {page === 'kalendarz' && <Kalendarz />}
                  {page === 'sklep' && <Sklep />}
                  {page === 'privacy' && <Legal doc="privacy" />}
                  {page === 'cookies' && <Legal doc="cookies" />}
                  {page === 'terms' && <Legal doc="terms" />}
                </main>
                <Footer />
              </EditCtx.Provider>
            </LangProvider>
          </div>
        </div>
      </div>

      <aside className="edt__side">
        <div>
          <h4>Как это работает</h4>
          <p className="edt__hint">Кликни на любой текст на странице и печатай. Enter — готово, Esc — отмена. Абзацы принимают переносы. Наведи на карточку — появятся стрелки и «✕». Фото — кнопка «Заменить» на картинке. Всё уходит на сайт после «Опубликовать».</p>
        </div>
        {page === 'home' && (
          <div>
            <h4>Секции главной</h4>
            <div className="edt__secs">
              {order.map((id, i) => (
                <div key={id} className={`edt__sec ${hidden.includes(id) ? 'is-hidden' : ''}`}>
                  <span>{SECTION_LABELS[id] || id}</span>
                  <button onClick={() => moveSection(id, -1)} disabled={i === 0}>↑</button>
                  <button onClick={() => moveSection(id, 1)} disabled={i === order.length - 1}>↓</button>
                  <button onClick={() => toggleSection(id)} title={hidden.includes(id) ? 'Показать' : 'Скрыть'}>{hidden.includes(id) ? '○' : '◉'}</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <h4>Выбранный текст</h4>
          {selected && typeof selValue === 'string' ? (
            <>
              <div className="edt__sel">{selected} · {lang.toUpperCase()}</div>
              <textarea value={selValue} onChange={(e) => set(selected, e.target.value)} />
              <p className="edt__hint">Тот же текст на других языках: {['pl', 'ru', 'en'].filter((l) => l !== lang).map((l) => <button key={l} className="cad__tplbtn" onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}</p>
            </>
          ) : (
            <p className="edt__hint">Кликни на текст на странице — здесь появится поле для точной правки.</p>
          )}
        </div>
        <div>
          <h4>Фото</h4>
          {IMAGE_KEYS.map(([k, l]) => (
            <div className="edt__sec" key={k}>
              <span>{l}{settings.images[k] ? ' · своё' : ' · стандартное'}</span>
              <button onClick={() => pickImage(k)} title="Заменить">⇧</button>
              {settings.images[k] && <button onClick={() => resetImage(k)} title="Сброс">↺</button>}
            </div>
          ))}
          <p className="edt__hint">Фото студии для галереи — во вкладке «Галерея».</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      </aside>

      {help && (
        <Modal title="Редактор сайта" onClose={() => setHelp(false)}>
          <p>• <b>Текст</b> — клик и печатай прямо на странице. Заголовки однострочные (Enter завершает), абзацы многострочные.</p>
          <p>• <b>Списки</b> (форматы, шаги, цены, факты, карточки) — наведи на элемент: ↑ ↓ меняют порядок, ✕ удаляет, «+ добавить» внизу списка.</p>
          <p>• <b>Секции главной</b> — панель справа: порядок и видимость. Скрытая секция не показывается на сайте.</p>
          <p>• <b>Языки</b> — PL / RU / EN редактируются отдельно. Точка у языка = есть несохранённые правки.</p>
          <p>• <b>Фото</b> — заменяются сразу (сжимаются в WebP). Тексты уходят на сайт после «Опубликовать».</p>
          <p>• В легальных текстах <code>{'{company} {address} {email}'}</code> подставляются из «Настроек».</p>
        </Modal>
      )}
    </div>
  )
}
