import { useEffect, useState, useCallback } from 'react'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'

const ACTIONS = {
  login: 'Вход в панель',
  'content.update': 'Правка контента',
  'gallery.add': 'Фото / видео добавлено',
  'gallery.delete': 'Медиа удалено',
  'gallery.reorder': 'Порядок медиа',
  'event.save': 'Занятие сохранено',
  'event.delete': 'Занятие удалено',
  'booking.create': 'Новая заявка',
  'booking.status': 'Статус заявки',
  'booking.delete': 'Заявка удалена',
  'integration.save': 'Настройки календаря',
}
const FILTERS = [
  ['all', 'Все события'],
  ['booking.create', 'Заявки'],
  ['booking.status', 'Подтверждения'],
  ['event.save', 'Занятия'],
  ['content.update', 'Правки контента'],
  ['gallery.add', 'Галерея'],
  ['login', 'Входы'],
]

export default function LogsView() {
  const { token } = useAdmin()
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    callFn('admin-logs', { action: filter, token, limit: 300 }).then((r) => {
      setRows(r.ok ? r.data.rows || [] : [])
      setLoading(false)
    })
  }, [token, filter])
  useEffect(() => { load() }, [load])

  return (
    <div className="apad logs">
      <div className="logs__head">
        <div>
          <h2 className="logs__title">Логи</h2>
          <p className="logs__sub">Все действия в панели и заявки с сайта.</p>
        </div>
        <div className="logs__bar">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="abtn abtn--ghost abtn--sm" onClick={load}>Обновить</button>
        </div>
      </div>
      {loading ? (
        <p className="logs__empty">Загрузка…</p>
      ) : rows.length === 0 ? (
        <p className="logs__empty">Пока нет событий.</p>
      ) : (
        <div className="logs__table">
          {rows.map((r) => (
            <div className="logs__row" key={r.id}>
              <span className="logs__time">{new Date(r.ts).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="logs__who">{r.admin_name || '—'}</span>
              <span className="logs__act">{ACTIONS[r.action] || r.action}</span>
              <span className="logs__detail">
                {r.detail ? Object.entries(r.detail).map(([k, v]) => `${k}: ${v}`).join(', ') : (r.target || '')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
