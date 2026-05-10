import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const raw = localStorage.getItem('userData')
    if (token && raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    const userData = { id: data.id, email: data.email, name: data.name, role: data.role }
    localStorage.setItem('userData', JSON.stringify(userData))
    setUser(userData)
    return data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    window.location.href = '/login'
  }

  const isRole = (...roles) => roles.includes(user?.role)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
