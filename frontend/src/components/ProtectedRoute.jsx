// Bloqueia rotas para quem não está logado; redireciona ao /login.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, carregando } = useAuth()

  if (carregando) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: '#6c6c78' }}>
        Carregando…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
