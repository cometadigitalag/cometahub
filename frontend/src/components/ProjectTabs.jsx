// Abas de navegação dentro de um projeto: Roadmap | Calendário.
import { Link } from 'react-router-dom'
import styles from './ProjectTabs.module.css'

export default function ProjectTabs({ id, active }) {
  const tabs = [
    { key: 'roadmap', label: 'Roadmap', to: `/projetos/${id}/roadmap` },
    { key: 'calendario', label: 'Calendário', to: `/projetos/${id}/calendario` },
  ]
  return (
    <div className={styles.tabs}>
      {tabs.map((t) => (
        <Link
          key={t.key}
          to={t.to}
          className={`${styles.tab} ${active === t.key ? styles.active : ''}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}
