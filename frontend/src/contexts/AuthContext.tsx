import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authService } from '../services/authService'
import type { DealerOut, LoginPayload, RegisterPayload } from '../services/authService'

interface AuthContextType {
  dealer: DealerOut | null
  token: string | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [dealer, setDealer] = useState<DealerOut | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    try {
      const me = await authService.getMe()
      setDealer(me)
    } catch {
      setDealer(null)
      setToken(null)
      localStorage.removeItem('access_token')
    }
  }, [])

  useEffect(() => {
    if (token) {
      refreshMe().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token, refreshMe])

  const login = async (payload: LoginPayload) => {
    const res = await authService.login(payload)
    localStorage.setItem('access_token', res.access_token)
    setToken(res.access_token)
    const me = await authService.getMe()
    setDealer(me)
  }

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setDealer(null)
  }

  return (
    <AuthContext.Provider value={{ dealer, token, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
