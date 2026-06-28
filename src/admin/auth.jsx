import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { callFn } from '../lib/supabase.js'

const KEY = 'astrelle_admin_token'
const AuthCtx = createContext(null)

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(KEY) || '')
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Validate an existing token on mount
  useEffect(() => {
    let alive = true
    if (!token) {
      setLoading(false)
      return
    }
    callFn('admin-auth', { action: 'me', token }).then((r) => {
      if (!alive) return
      if (r.ok && r.data.admin) setAdmin(r.data.admin)
      else {
        localStorage.removeItem(KEY)
        setToken('')
      }
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (username, password) => {
    const r = await callFn('admin-auth', { action: 'login', username, password })
    if (r.ok && r.data.token) {
      localStorage.setItem(KEY, r.data.token)
      setToken(r.data.token)
      setAdmin(r.data.admin)
      return { ok: true }
    }
    return { ok: false, error: r.data?.error || 'Ошибка входа' }
  }, [])

  const logout = useCallback(async () => {
    if (token) await callFn('admin-auth', { action: 'logout', token })
    localStorage.removeItem(KEY)
    setToken('')
    setAdmin(null)
  }, [token])

  return (
    <AuthCtx.Provider value={{ token, admin, loading, login, logout }}>{children}</AuthCtx.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAdmin must be used within AdminAuthProvider')
  return ctx
}
