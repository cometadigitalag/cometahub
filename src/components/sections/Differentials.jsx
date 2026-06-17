// =========================================================================
// SEÇÃO — Diferenciais ("Por que nos escolher")
// Lista de diferenciais com ícones + faixa de estatísticas em destaque.
// =========================================================================
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SectionTitle from '../ui/SectionTitle'
import { differentials, stats } from '../../data/differentials'
import { containerVariants, itemVariants, revealOnView } from '../../hooks/useScrollReveal'
import styles from './Differentials.module.css'

export default function Differentials() {
  return (
    <section id="diferenciais" className={styles.section}>
      <div className="container">
        <SectionTitle
          eyebrow="Por que escolher a CometaHub"
          title="Diferenciais que fazem a diferença"
          subtitle="Mais do que tecnologia: parceria, agilidade e resultados que você acompanha de perto."
        />

        {/* Lista de diferenciais */}
        <motion.div className={styles.grid} variants={containerVariants} {...revealOnView}>
          {differentials.map((item) => {
            const Icon = FiIcons[item.icon]
            return (
              <motion.div key={item.title} className={styles.item} variants={itemVariants}>
                <div className={styles.iconWrap}>{Icon && <Icon />}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Faixa de estatísticas */}
        <motion.div className={styles.stats} variants={containerVariants} {...revealOnView}>
          {stats.map((stat) => (
            <motion.div key={stat.label} className={styles.stat} variants={itemVariants}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
