import { createContext, useContext, useState, useCallback } from 'react'
 
const AuthContext = createContext(null)
 
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mm_token'))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mm_user')) } catch { return null }
  })
 
  const login = useCallback((data) => {
    if (data.token) {
      localStorage.setItem('mm_token', data.token)
      setToken(data.token)
    }
    if (data.usuario) {
      localStorage.setItem('mm_user', JSON.stringify(data.usuario))
      setUser(data.usuario)
    }
  }, [])
 
  const logout = useCallback(() => {
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
    setToken(null)
    setUser(null)
  }, [])
 
  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}
 
export function useAuth() {
  return useContext(AuthContext)
}