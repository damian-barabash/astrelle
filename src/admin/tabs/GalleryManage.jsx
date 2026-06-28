import { useEffect, useState, useRef, useCallback } from 'react'
import { fetchGallery, callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'

// Read width/height (and kind) from a File before upload, for masonry aspect ratios.
function probe(file) {
  return new Promise((resolve) => {
    const kind = file.type.startsWith('video') ? 'video' : 'image'
    const url = URL.createObjectURL(file)
    if (kind === 'image') {
      const img = new Image()
      img.onload = () => { URL.revokeObjectURL(url); resolve({ kind, width: img.naturalWidth, height: img.naturalHeight }) }
      img.onerror = () => { URL.revokeObjectURL(url); resolve({ kind, width: null, height: null }) }
      img.src = url
    } else {
      const v = document.createElement('video')
      v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve({ kind, width: v.videoWidth, height: v.videoHeight }) }
      v.onerror = () => { URL.revokeObjectURL(url); resolve({ kind, width: null, height: null }) }
      v.src = url
    }
  })
}

export default function GalleryManage() {
  const { token } = useAdmin()
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [err, setErr] = useState('')
  const fileRef = useRef(null)

  const load = useCallback(() => {
    fetchGallery().then(setItems).catch((e) => setErr(e.message))
  }, [])
  useEffect(() => { load() }, [load])

  const upload = async (files) => {
    setErr('')
    setBusy(true)
    const list = Array.from(files)
    let done = 0
    for (const file of list) {
      setProgress(`Загрузка ${done + 1} из ${list.length}…`)
      try {
        const meta = await probe(file)
        const ext = (file.name.split('.').pop() || (meta.kind === 'video' ? 'mp4' : 'jpg')).toLowerCase()
        const signed = await callFn('admin-gallery', { action: 'sign', token, ext })
        if (!signed.ok) throw new Error(signed.data?.error || 'sign failed')
        const put = await fetch(signed.data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        })
        if (!put.ok) throw new Error('upload failed ' + put.status)
        const add = await callFn('admin-gallery', {
          action: 'add', token, kind: meta.kind, url: signed.data.publicUrl,
          width: meta.width, height: meta.height, sort: items.length + done,
        })
        if (!add.ok) throw new Error(add.data?.error || 'add failed')
      } catch (e) {
        setErr('Ошибка с файлом ' + file.name + ': ' + e.message)
      }
      done++
    }
    setProgress('')
    setBusy(false)
    if (fileRef.current) fileRef.current.value = ''
    load()
  }

  const remove = async (id) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
    await callFn('admin-gallery', { action: 'delete', token, id })
    load()
  }

  const move = async (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = items.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
    await callFn('admin-gallery', { action: 'reorder', token, ids: next.map((x) => x.id) })
  }

  return (
    <div className="apad gal">
      <div className="gal__head">
        <div>
          <h2 className="gal__title">Галерея студии</h2>
          <p className="gal__sub">Фото и видео из мастерской. Появятся на сайте секцией перед «Керамика, сделанная руками». Кликабельны на весь экран.</p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.length && upload(e.target.files)}
          />
          <button className="abtn" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? progress || 'Загрузка…' : '+ Загрузить фото / видео'}
          </button>
        </div>
      </div>
      {err ? <p className="aerr">{err}</p> : null}
      {items.length === 0 ? (
        <p className="gal__empty">Пока пусто. Загрузи первые фото или видео — и секция появится на сайте.</p>
      ) : (
        <div className="gal__grid">
          {items.map((it, i) => (
            <div className="gal__cell" key={it.id}>
              <div className="gal__media">
                {it.kind === 'video' ? (
                  <video src={`${it.url}#t=0.1`} muted playsInline preload="metadata" />
                ) : (
                  <img src={it.url} alt="" loading="lazy" />
                )}
                {it.kind === 'video' ? <span className="gal__badge">видео</span> : null}
              </div>
              <div className="gal__ctl">
                <button onClick={() => move(i, -1)} disabled={i === 0} title="Левее">←</button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Правее">→</button>
                <button className="gal__del" onClick={() => remove(it.id)} title="Удалить">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
