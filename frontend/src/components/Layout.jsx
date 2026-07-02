// Layout da área autenticada: sidebar de navegação + conteúdo (Outlet).
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MODULES, canModule, isAdmin, ROLE_LABELS } from '../lib/constants'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Menu montado conforme as permissões do usuário logado.
  const links = [
    { to: '/', label: 'Dashboard', icon: '◆', end: true },
    ...MODULES.filter((m) => canModule(user, m.key)).map((m) => ({
      to: m.path,
      label: m.label,
      icon: m.icon,
    })),
    ...(isAdmin(user) ? [{ to: '/colaboradores', label: 'Colaboradores', icon: '☺' }] : []),
    { to: '/conta', label: 'Minha conta', icon: '⚙' },
  ]

  function sair() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>✦</span>
          <div>
            <strong>CometaHub</strong>
            <span className={styles.brandSub}>Painel interno</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.user}>
            <div className={styles.avatar}>{(user?.nome || '?').charAt(0).toUpperCase()}</div>
            <div className={styles.userInfo}>
              <strong>{user?.nome}</strong>
              <span>{ROLE_LABELS[user?.role] || user?.email}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={sair} style={{ width: '100%' }}>
            Sair
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
