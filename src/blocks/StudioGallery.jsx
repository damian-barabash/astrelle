import { useEffect, useState, useCallback } from 'react'
import { T, Section, useEdit } from '../content/edit.jsx'

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
    <div className="lb" onClick={onClose}>
      <button className="lb__x" onClick={onClose} aria-label="×">✕</button>
      {items.length > 1 && (
        <>
          <button className="lb__nav lb__nav--l" onClick={(e) => { e.stopPropagation(); onNav(-1) }} aria-label="‹">‹</button>
          <button className="lb__nav lb__nav--r" onClick={(e) => { e.stopPropagation(); onNav(1) }} aria-label="›">›</button>
        </>
      )}
      <div className="lb__stage" onClick={(e) => e.stopPropagation()}>
        {item.kind === 'video' ? <video src={item.url} poster={item.poster_url || undefined} controls autoPlay playsInline /> : <img src={item.url} alt="" />}
      </div>
    </div>
  )
}

// Studio photos/videos from the admin gallery. Empty → the section does not render on the site.
export default function StudioGallery({ items = [] }) {
  const ed = useEdit()
  const [open, setOpen] = useState(-1)
  const nav = useCallback((d) => setOpen((i) => (i + d + items.length) % items.length), [items.length])
  if (items.length === 0 && !ed) return null
  return (
    <Section id="gallery" label="Галерея студии" className="gal">
      <div className="container">
        <span className="label"><T k="gallery.label" /></span>
        <T k="gallery.title" as="h2" className="h2" />
        {items.length === 0 ? (
          <p className="gal__empty">Галерея пуста — загрузи фото во вкладке «Галерея», и секция появится на сайте.</p>
        ) : (
          <div className="gal__grid">
            {items.map((it, i) => (
              <button key={it.id} className={`gal__item ${it.kind === 'video' ? 'gal__item--video' : ''}`} style={it.width && it.height ? { aspectRatio: `${it.width} / ${it.height}` } : undefined} onClick={() => setOpen(i)} aria-label="Open">
                {it.kind === 'video' ? (
                  <>
                    <video src={`${it.url}#t=0.1`} poster={it.poster_url || undefined} muted playsInline preload="metadata" />
                    <span className="gal__play">▶</span>
                  </>
                ) : (
                  <img src={it.url} alt="" loading="lazy" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {open >= 0 && <Lightbox items={items} index={open} onClose={() => setOpen(-1)} onNav={nav} />}
    </Section>
  )
}
