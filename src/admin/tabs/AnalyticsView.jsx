import { useEffect, useState, useCallback } from 'react'
import { callFn } from '../../lib/supabase.js'
import { useAdmin } from '../auth.jsx'

const PERIODS = [[7, '7 дней'], [30, '30 дней'], [90, '90 дней']]

function fmtTime(sec) {
  if (!sec) return '0с'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m ? `${m}м ${s}с` : `${s}с`
}

function Bars({ data }) {
  if (!data || data.length === 0) return <p className="an__empty">Нет данных за период.</p>
  const max = Math.max(...data.map((d) => d.views), 1)
  return (
    <div className="an__bars">
      {data.map((d) => (
        <div className="an__bar" key={d.d} title={`${d.d}: ${d.visits} визитов, ${d.views} просмотров`}>
          <div className="an__bar-fill" style={{ height: `${Math.round((d.views / max) * 100)}%` }} />
          <span className="an__bar-x">{d.d.slice(8)}</span>
        </div>
      ))}
    </div>
  )
}

function TopList({ title, items }) {
  const max = Math.max(...(items || []).map((i) => i.n), 1)
  return (
    <div className="an__top">
      <h4>{title}</h4>
      {(!items || items.length === 0) && <p className="an__empty">—</p>}
      {(items || []).map((i, k) => (
        <div className="an__toprow" key={k}>
          <span className="an__topk">{i.k || '—'}</span>
          <span className="an__topbar"><i style={{ width: `${Math.round((i.n / max) * 100)}%` }} /></span>
          <span className="an__topn">{i.n}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsView() {
  const { token } = useAdmin()
  const [days, setDays] = useState(30)
  const [s, setS] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    callFn('admin-analytics', { token, days }).then((r) => {
      setS(r.ok ? r.data.summary : null)
      setLoading(false)
    })
  }, [token, days])
  useEffect(() => { load() }, [load])

  return (
    <div className="apad an">
      <div className="an__head">
        <div>
          <h2 className="an__title">Аналитика</h2>
          <p className="an__sub">Трафик публичного сайта. Без cookies и личных данных.</p>
        </div>
        <div className="an__periods">
          {PERIODS.map(([v, l]) => (
            <button key={v} className={`an__per ${days === v ? 'is-active' : ''}`} onClick={() => setDays(v)}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="an__empty">Загрузка…</p>
      ) : !s ? (
        <p className="an__empty">Нет данных.</p>
      ) : (
        <>
          <div className="an__stats">
            <div className="an__stat"><b>{s.visits}</b><span>Визиты</span></div>
            <div className="an__stat"><b>{s.pageviews}</b><span>Просмотры</span></div>
            <div className="an__stat"><b>{fmtTime(s.avg_time)}</b><span>Ср. время</span></div>
            <div className="an__stat"><b>{s.bounce}%</b><span>Отказы</span></div>
          </div>
          <div className="an__card">
            <h4>Просмотры по дням</h4>
            <Bars data={s.daily} />
          </div>
          <div className="an__grid">
            <TopList title="Страницы" items={s.top_pages} />
            <TopList title="Источники" items={s.referrers} />
            <TopList title="Устройства" items={s.devices} />
            <TopList title="Языки" items={s.langs} />
          </div>
        </>
      )}
    </div>
  )
}
