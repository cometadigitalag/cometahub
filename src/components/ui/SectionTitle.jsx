// =========================================================================
// UI — SectionTitle (reutilizável)
// Cabeçalho padrão das seções: "eyebrow" (rótulo pequeno) + título + subtítulo.
// Anima ao entrar na viewport. Centralizado por padrão.
// =========================================================================
import { motion } from 'framer-motion'
import { revealOnView, itemVariants } from '../../hooks/useScrollReveal'
import styles from './SectionTitle.module.css'

export default function SectionTitle({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <motion.header
      className={styles.header}
      style={{ textAlign: align }}
      variants={itemVariants}
      {...revealOnView}
    >
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </motion.header>
  )
}
