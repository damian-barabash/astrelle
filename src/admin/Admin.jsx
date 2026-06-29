import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminAuthProvider, useAdmin } from './auth.jsx'
import Login from './Login.jsx'
import EditContent from './tabs/EditContent.jsx'
import GalleryManage from './tabs/GalleryManage.jsx'
import CalendarManage from './tabs/CalendarManage.jsx'
import LogsView from './tabs/LogsView.jsx'
import AnalyticsView from './tabs/AnalyticsView.jsx'
import './admin.css'

const TABS = [
  { key: 'edit', label: 'Редактировать', ready: true },
  { key: 'gallery', label: 'Галерея', ready: true },
  { key: 'calendar', label: 'Календарь', ready: true },
  { key: 'logs', label: 'Логи', ready: true },
  { key: 'analytics', label: 'Аналитика', ready: true },
]

function Stub({ label }) {
  return (
    <div className="apad astub">
      <h2>{label}</h2>
      <p>Этот раздел появится в следующем обновлении.</p>
    </div>
  )
}

function Shell() {
  const { admin, loading, logout } = useAdmin()
  const [tab, setTab] = useState('edit')
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) return <div className="aloading">Загрузка…</div>
  if (!admin) return <Login />

  const go = (k) => { setTab(k); setMenuOpen(false) }
  const activeLabel = TABS.find((x) => x.key === tab)?.label

  return (
    <div className={`admin ${menuOpen ? 'admin--open' : ''}`}>
      {/* mobile top bar with burger */}
      <header className="admin__mbar">
        <div className="admin__brand">Astrelle</div>
        <span className="admin__mtab">{activeLabel}</span>
        <button
          type="button"
          className={`admin__burger ${menuOpen ? 'is-open' : ''}`}
          aria-label="Меню"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </header>

      {menuOpen && <div className="admin__scrim" onClick={() => setMenuOpen(false)} />}

      <aside className="admin__side">
        <div className="admin__brand admin__brand--side">Astrelle</div>
        <nav className="admin__nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`admin__navbtn ${tab === t.key ? 'is-active' : ''}`}
              onClick={() => go(t.key)}
            >
              {t.label}
              {!t.ready ? <span className="admin__soon">скоро</span> : null}
            </button>
          ))}
        </nav>
        <div className="admin__foot">
          <Link className="admin__link" to="/" target="_blank" rel="noreferrer">↗ Открыть сайт</Link>
          <div className="admin__who">{admin.display_name}</div>
          <button type="button" className="abtn abtn--ghost abtn--sm" onClick={logout}>Выйти</button>
        </div>
      </aside>
      <main className="admin__main">
        {tab === 'edit' && <EditContent />}
        {tab === 'gallery' && <GalleryManage />}
        {tab === 'calendar' && <CalendarManage />}
        {tab === 'logs' && <LogsView />}
        {tab === 'analytics' && <AnalyticsView />}
      </main>
    </div>
  )
}

export default function Admin() {
  return (
    <AdminAuthProvider>
      <Shell />
    </AdminAuthProvider>
  )
}
