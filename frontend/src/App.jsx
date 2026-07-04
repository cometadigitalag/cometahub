// Rotas do painel interno.
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import { AdminOnly, ModuleGate } from './components/Gate'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Roadmap from './pages/Roadmap'
import Calendar from './pages/Calendar'
import ProjectTeam from './pages/ProjectTeam'
import ProjectFinance from './pages/ProjectFinance'
import Financeiro from './pages/Financeiro'
import Colaboradores from './pages/Colaboradores'
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

        {/* Módulo Projetos */}
        <Route
          path="/projetos"
          element={
            <ModuleGate module="projetos">
              <Projects />
            </ModuleGate>
          }
        />
        <Route
          path="/projetos/:id/roadmap"
          element={
            <ModuleGate module="projetos">
              <Roadmap />
            </ModuleGate>
          }
        />
        <Route
          path="/projetos/:id/calendario"
          element={
            <ModuleGate module="projetos">
              <Calendar />
            </ModuleGate>
          }
        />
        <Route
          path="/projetos/:id/equipe"
          element={
            <ModuleGate module="projetos">
              <ProjectTeam />
            </ModuleGate>
          }
        />
        <Route
          path="/projetos/:id/financeiro"
          element={
            <ModuleGate module="financeiro">
              <ProjectFinance />
            </ModuleGate>
          }
        />

        {/* Módulo Financeiro */}
        <Route
          path="/financeiro"
          element={
            <ModuleGate module="financeiro">
              <Financeiro />
            </ModuleGate>
          }
        />

        {/* Gestão de colaboradores (somente admin) */}
        <Route
          path="/colaboradores"
          element={
            <AdminOnly>
              <Colaboradores />
            </AdminOnly>
          }
        />

        <Route path="/conta" element={<Account />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
