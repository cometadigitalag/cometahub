// Rotas do painel interno.
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Roadmap from './pages/Roadmap'
import Account from './pages/Account'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Área autenticada, com layout (sidebar). */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/projetos/:id/roadmap" element={<Roadmap />} />
        <Route path="/conta" element={<Account />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
