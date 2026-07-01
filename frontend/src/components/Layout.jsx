// Layout da área autenticada: sidebar de navegação + conteúdo (Outlet).
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Layout.module.css'

const links = [
  { to: '/', label: 'Dashboard', icon: '◆', end: true },
  { to: '/projetos', label: 'Projetos', icon: '▣' },
  { to: '/conta', label: 'Minha conta', icon: '⚙' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
              <span>{user?.email}</span>
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
