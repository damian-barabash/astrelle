import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { createPortal } from 'react-dom'

// Small shared admin UI: statuses, modal, toast, formatting helpers.
export const BOOKING_STATUS = {
  pending: 'Новая заявка',
  confirmed: 'Подтверждено',
  waitlist: 'Лист ожидания',
  attended: 'Пришёл(а)',
  no_show: 'Не пришёл(а)',
  declined: 'Отклонено',
  cancelled: 'Отменено',
}
export const LEAD_STATUS = { new: 'Новый', replied: 'Ответили', closed: 'Закрыт' }
export const LEAD_KIND = { contact: 'Вопрос', gift: 'Voucher', shop: 'Магазин (лист ожидания)' }

export const Chip = ({ status, children }) => <span className={`achip achip--${status}`}>{children ?? BOOKING_STATUS[status] ?? LEAD_STATUS[status] ?? status}</span>

const pad = (n) => String(n).padStart(2, '0')
export const fmtDate = (iso, opts = {}) => (iso ? new Date(iso).toLocaleDateString('ru', { day: 'numeric', month: 'short', ...opts }) : '—')
export const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : '')
export const fmtDT = (iso) => (iso ? `${fmtDate(iso)} · ${fmtTime(iso)}` : '—')
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const toISO = (date, time) => (date ? new Date(`${date}T${time || '00:00'}`).toISOString() : null)
export const fromISO = (iso) => {
  const d = new Date(iso)
  return { date: dayKey(d), time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
}
export const isPhone = (c) => /^[+\d][\d\s()-]{5,}$/.test(String(c || '').trim()) && !String(c).includes('@')
export const isEmail = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(c || '').trim())
export const contactLinks = (c) => {
  const s = String(c || '').trim()
  if (isEmail(s)) return { mail: `mailto:${s}` }
  if (isPhone(s)) {
    const digits = s.replace(/[^\d]/g, '')
    const intl = s.startsWith('+') ? digits : digits.length === 9 ? '48' + digits : digits
    return { tel: `tel:+${intl}`, wa: `https://wa.me/${intl}`, sms: `sms:+${intl}` }
  }
  return {}
}

/* ---- toast ---- */
const ToastCtx = createContext(() => {})
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const show = useCallback((m) => {
    setMsg(m)
    clearTimeout(show._t)
    show._t = setTimeout(() => setMsg(''), 2400)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && createPortal(<div className="atoast">{msg}</div>, document.body)}
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

/* ---- modal ---- */
export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return createPortal(
    <div className="amodal" onClick={onClose}>
      <div className={`amodal__card ${wide ? 'amodal__card--wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="amodal__x" onClick={onClose} aria-label="Закрыть">✕</button>
        {title && <h3 className="amodal__title">{title}</h3>}
        {children}
      </div>
    </div>,
    document.body
  )
}

export function copyText(text) {
  try {
    navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function downloadCsv(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

// Convert any picked image to WebP in the browser before upload (resize ≤1600px).
export function toWebp(file, maxDim = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const im = new Image()
    im.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(im.naturalWidth, im.naturalHeight))
      const c = document.createElement('canvas')
      c.width = Math.round(im.naturalWidth * scale)
      c.height = Math.round(im.naturalHeight * scale)
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height)
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/webp', quality)
    }
    im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось прочитать изображение')) }
    im.src = url
  })
}

/* ---- site settings cache (studio info, message templates, event templates) ---- */
import { callFn as _callFn } from '../lib/supabase.js'
let _settings = null
let _settingsP = null
const _subs = new Set()
export function loadSettings(token, force = false) {
  if (_settings && !force) return Promise.resolve(_settings)
  if (!_settingsP || force) {
    _settingsP = _callFn('admin-content', { action: 'settings.get', token }).then((r) => {
      _settings = r.ok ? r.data.settings || {} : {}
      _subs.forEach((fn) => fn(_settings))
      return _settings
    })
  }
  return _settingsP
}
export function patchSettingsCache(key, value) {
  _settings = { ...(_settings || {}), [key]: value }
  _subs.forEach((fn) => fn(_settings))
}
export function useSiteSettings(token) {
  const [s, setS] = useState(_settings || {})
  useEffect(() => {
    _subs.add(setS)
    loadSettings(token).then(setS)
    return () => _subs.delete(setS)
  }, [token])
  return s
}
