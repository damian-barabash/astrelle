import { useEffect, useState, useCallback } from 'react'
import { useT } from '../i18n/index.jsx'

// Heading copy lives here (not in the editable content doc) — admin mainly manages media.
const COPY = {
  ru: { kicker: 'Студия', title: 'Наше пространство', body: 'Загляни в мастерскую Astrelle — фото и видео процесса.' },
  pl: { kicker: 'Pracownia', title: 'Nasza przestrzeń', body: 'Zajrzyj do pracowni Astrelle — zdjęcia i wideo z procesu.' },
  en: { kicker: 'The studio', title: 'Our space', body: 'Take a look inside the Astrelle studio — photos and videos of the process.' },
}

function Lightbox({ items, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNav(1)
      else if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onNav])

  const item = items[index]
  if (!item) return null
  return (
    <div className="sglb" onClick={onClose}>
      <button className="sglb__x" onClick={onClose} aria-label="Закрыть">✕</button>
      {items.length > 1 && (
        <>
          <button className="sglb__nav sglb__nav--l" onClick={(e) => { e.stopPropagation(); onNav(-1) }} aria-label="Назад">‹</button>
          <button className="sglb__nav sglb__nav--r" onClick={(e) => { e.stopPropagation(); onNav(1) }} aria-label="Вперёд">›</button>
        </>
      )}
      <div className="sglb__stage" onClick={(e) => e.stopPropagation()}>
        {item.kind === 'video' ? (
          <video src={item.url} poster={item.poster_url || undefined} controls autoPlay playsInline />
        ) : (
          <img src={item.url} alt="" />
        )}
      </div>
    </div>
  )
}

export default function StudioGallery({ items = [] }) {
  const { lang } = useT()
  const c = COPY[lang] || COPY.ru
  const [open, setOpen] = useState(-1)

  const nav = useCallback(
    (d) => setOpen((i) => (i + d + items.length) % items.length),
    [items.length]
  )

  // Nothing to show yet → don't render an empty section on the live site.
  if (items.length === 0) return null

  return (
    <section className="section sg" id="studio">
      <div className="container">
        <div className="value__head reveal">
          <span className="kicker">{c.kicker}</span>
          <h2 className="title">{c.title}</h2>
          <p className="sg__lead">{c.body}</p>
        </div>
        <div className="sg__grid">
          {items.map((it, i) => (
            <button
              key={it.id}
              className={`sg__item ${it.kind === 'video' ? 'sg__item--video' : ''}`}
              style={it.width && it.height ? { aspectRatio: `${it.width} / ${it.height}` } : undefined}
              onClick={() => setOpen(i)}
              aria-label="Открыть"
            >
              {it.kind === 'video' ? (
                <>
                  <video src={`${it.url}#t=0.1`} poster={it.poster_url || undefined} muted playsInline preload="metadata" />
                  <span className="sg__play">▶</span>
                </>
              ) : (
                <img src={it.url} alt="" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      </div>
      {open >= 0 && <Lightbox items={items} index={open} onClose={() => setOpen(-1)} onNav={nav} />}
    </section>
  )
}
