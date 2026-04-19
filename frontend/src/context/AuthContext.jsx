import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bina_token')
    if (token) {
      auth.me()
        .then(setTeacher)
        .catch(() => localStorage.removeItem('bina_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { access_token } = await auth.login(email, password)
    localStorage.setItem('bina_token', access_token)
    const me = await auth.me()
    setTeacher(me)
    return me
  }

  const register = async (email, password, school_name) => {
    const { access_token } = await auth.register(email, password, school_name)
    localStorage.setItem('bina_token', access_token)
    const me = await auth.me()
    setTeacher(me)
    return me
  }

  const logout = () => {
    localStorage.removeItem('bina_token')
    setTeacher(null)
  }

  return (
    <AuthContext.Provider value={{ teacher, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
