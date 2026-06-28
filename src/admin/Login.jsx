import { useState } from 'react'
import { useAdmin } from './auth.jsx'

export default function Login() {
  const { login } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const r = await login(username.trim(), password)
    setBusy(false)
    if (!r.ok) setErr('Неверный логин или пароль')
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <div className="login__brand">Astrelle</div>
        <div className="login__sub">Панель управления</div>
        <label className="af">
          <span className="af__lbl">Логин</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" />
        </label>
        <label className="af">
          <span className="af__lbl">Пароль</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {err ? <p className="aerr">{err}</p> : null}
        <button className="abtn abtn--lg" type="submit" disabled={busy || !username || !password}>
          {busy ? 'Вхожу…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
