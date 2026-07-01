// Contexto de autenticação: guarda o usuário logado e expõe login/logout.
import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, tokenStore } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Ao abrir o app, se houver token válido, recupera o usuário.
  useEffect(() => {
    const token = tokenStore.get()
    if (!token) {
      setCarregando(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setCarregando(false))
  }, [])

  async function login(email, senha) {
    const { token, user: u } = await authApi.login(email, senha)
    tokenStore.set(token)
    setUser(u)
    return u
  }

  function logout() {
    tokenStore.clear()
    setUser(null)
  }

  // Atualiza a conta (nome/e-mail/senha) e renova o token/usuário.
  async function updateAccount(data) {
    const { token, user: u } = await authApi.updateAccount(data)
    tokenStore.set(token)
    setUser(u)
    return u
  }

  return (
    <AuthContext.Provider value={{ user, carregando, login, logout, updateAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
