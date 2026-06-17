// =========================================================================
// UI — GlassCard (reutilizável)
// Painel com efeito glassmorphism (vidro fosco translúcido) + borda em brilho
// no hover. Base visual dos cards de serviços, diferenciais e depoimentos.
// =========================================================================
import { motion } from 'framer-motion'
import { itemVariants } from '../../hooks/useScrollReveal'
import styles from './GlassCard.module.css'

export default function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.div
      className={`${styles.card} ${className}`}
      variants={itemVariants} // anima junto ao stagger do container pai
      {...props}
    >
      {children}
    </motion.div>
  )
}
