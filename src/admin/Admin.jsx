import { useEffect, useState } from 'react'
import { NavLink, Routes, Route, useLocation, Link } from 'react-router-dom'
import { AdminAuthProvider, useAdmin } from './auth.jsx'
import { ToastProvider } from './ui.jsx'
import { callFn } from '../lib/supabase.js'
import Login from './Login.jsx'
import Dashboard from './tabs/Dashboard.jsx'
import Partner from './tabs/Partner.jsx'
import Crm from './tabs/Crm.jsx'
import Editor from './tabs/Editor.jsx'
import GalleryManage from './tabs/GalleryManage.jsx'
import AnalyticsView from './tabs/AnalyticsView.jsx'
import LogsView from './tabs/LogsView.jsx'
import Settings from './tabs/Settings.jsx'
import './admin.css'

const TABS = [
  { path: '', label: 'Сегодня', C: Dashboard },
  { path: 'partner', label: 'Партнёр · переходы и покупки', C: Partner, badge: 'sales' },
  { path: 'klienci', label: 'Сообщения', C: Crm, badge: 'leads' },
  { path: 'edytor', label: 'Редактор сайта', C: Editor },
  { path: 'galeria', label: 'Галерея', C: GalleryManage },
  { path: 'analityka', label: 'Аналитика', C: AnalyticsView },
  { path: 'logi', label: 'Логи', C: LogsView },
  { path: 'ustawienia', label: 'Настройки', C: Settings },
]

function Shell() {
  const { admin, loading, logout, token } = useAdmin()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [badges, setBadges] = useState({ leads: 0, sales: 0 })

  // badges: messages without an answer, purchases from the studio waiting for a look
  // (refreshed on navigation + every 2 min)
  useEffect(() => {
    if (!token) return
    let alive = true
    const tick = () =>
      Promise.all([callFn('admin-crm', { action: 'overview', token }), callFn('admin-partner', { action: 'overview', token, days: 1 })]).then(([c, p]) => {
        if (!alive) return
        setBadges({
          leads: c.ok ? (c.data.leads || []).filter((l) => l.status === 'new').length : 0,
          sales: p.ok ? (p.data.sales || []).filter((x) => x.status === 'new').length : 0,
        })
      })
    tick()
    const id = setInterval(tick, 120000)
    return () => { alive = false; clearInterval(id) }
  }, [token, location.pathname])

  useEffect(() => setMenuOpen(false), [location.pathname])
  useEffect(() => { document.title = 'Astrelle · панель' }, [])

  if (loading) return <div className="aloading">Загрузка…</div>
  if (!admin) return <Login />

  const sub = location.pathname.replace(/^\/admin\/?/, '').split('/')[0]
  const active = TABS.find((t) => t.path === sub) || TABS[0]

  return (
    <div className={`admin ${menuOpen ? 'admin--open' : ''}`}>
      <header className="admin__mbar">
        <div className="admin__brand">Astrelle</div>
        <span className="admin__mtab">{active.label}</span>
        <button type="button" className="admin__burger" aria-label="Меню" onClick={() => setMenuOpen((o) => !o)}><span /><span /><span /></button>
      </header>
      {menuOpen && <div className="admin__scrim" onClick={() => setMenuOpen(false)} />}

      <aside className="admin__side">
        <div className="admin__brand">Astrelle</div>
        <nav className="admin__nav">
          {TABS.map((t) => (
            <NavLink key={t.path} to={`/admin/${t.path}`} end={t.path === ''} className={({ isActive }) => `admin__navbtn ${isActive ? 'is-active' : ''}`}>
              {t.label}
              {t.badge && badges[t.badge] > 0 ? <span className="admin__badge">{badges[t.badge]}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="admin__foot">
          <Link className="admin__link" to="/" target="_blank" rel="noreferrer">↗ Открыть сайт</Link>
          <div>{admin.display_name}</div>
          <button type="button" className="abtn abtn--ghost abtn--sm" onClick={logout}>Выйти</button>
        </div>
      </aside>

      <main className="admin__main">
        <Routes>
          {TABS.map((t) => (
            <Route key={t.path} path={t.path === '' ? '/' : `${t.path}/*`} element={<t.C />} />
          ))}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default function Admin() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AdminAuthProvider>
  )
}
