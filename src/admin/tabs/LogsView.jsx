import { useEffect, useState, useCallback } from 'react'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'

const ACTIONS = {
  login: 'Вход в панель', 'password.change': 'Смена пароля',
  'content.update': 'Правка сайта', 'images.set': 'Фото блока', 'settings.set': 'Настройки',
  'gallery.add': 'Фото / видео добавлено', 'gallery.delete': 'Медиа удалено', 'gallery.reorder': 'Порядок медиа',
  'event.save': 'Занятие сохранено', 'event.delete': 'Занятие удалено', 'events.create_many': 'Занятия созданы', 'slots.create': 'Окна созданы',
  'booking.create': 'Новая заявка', 'booking.status': 'Статус заявки', 'booking.delete': 'Заявка удалена',
  'lead.create': 'Новое сообщение', 'lead.update': 'Сообщение обновлено', 'lead.delete': 'Сообщение удалено',
  'client.update': 'Клиент обновлён', 'client.create': 'Клиент добавлен', 'client.delete': 'Клиент удалён', 'crm.export': 'Экспорт CSV',
  'integration.save': 'Настройки календаря',
}
const FILTERS = [['all', 'Все'], ['booking.create', 'Заявки'], ['booking.status', 'Статусы'], ['lead.create', 'Сообщения'], ['event.save', 'Занятия'], ['content.update', 'Правки сайта'], ['login', 'Входы']]

export default function LogsView() {
  const { token } = useAdmin()
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const load = useCallback(() => {
    setLoading(true)
    callFn('admin-logs', { action: filter, token, limit: 300 }).then((r) => { setRows(r.ok ? r.data.rows || [] : []); setLoading(false) })
  }, [token, filter])
  useEffect(() => { load() }, [load])
  return (
    <div>
      <div className="ahead">
        <div><h2>Логи</h2><p>Все действия в панели и события с сайта.</p></div>
        <div className="ahead__act">
          <div className="aseg">{FILTERS.map(([v, l]) => <button key={v} className={filter === v ? 'is-active' : ''} onClick={() => setFilter(v)}>{l}</button>)}</div>
          <button className="abtn abtn--ghost abtn--sm" onClick={load}>↻</button>
        </div>
      </div>
      <div className="acard">
        {loading ? <p className="aempty">Загрузка…</p> : rows.length === 0 ? <p className="aempty">Пока нет событий.</p> : rows.map((r) => (
          <div className="logs__row" key={r.id}>
            <span className="logs__time">{new Date(r.ts).toLocaleString('ru', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            <span>{r.admin_name || 'сайт'}</span>
            <span>{ACTIONS[r.action] || r.action}</span>
            <span className="logs__detail">{r.detail ? Object.entries(r.detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(', ') : r.target || ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
