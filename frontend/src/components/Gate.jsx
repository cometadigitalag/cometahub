// Guardas de rota por permissão. Redirecionam ao Dashboard quem não tem acesso.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isAdmin, canModule } from '../lib/constants'

export function AdminOnly({ children }) {
  const { user } = useAuth()
  return isAdmin(user) ? children : <Navigate to="/" replace />
}

export function ModuleGate({ module, children }) {
  const { user } = useAuth()
  return canModule(user, module) ? children : <Navigate to="/" replace />
}
