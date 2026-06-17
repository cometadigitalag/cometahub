// =========================================================================
// SEÇÃO — Depoimentos
// Grid de cards com avaliações (conteúdo de exemplo em data/testimonials.js).
// =========================================================================
import { motion } from 'framer-motion'
import { FiStar } from 'react-icons/fi'
import { ImQuotesLeft } from 'react-icons/im'
import SectionTitle from '../ui/SectionTitle'
import GlassCard from '../ui/GlassCard'
import { testimonials } from '../../data/testimonials'
import { containerVariants, revealOnView } from '../../hooks/useScrollReveal'
import styles from './Testimonials.module.css'

export default function Testimonials() {
  return (
    <section id="depoimentos" className={styles.section}>
      <div className="container">
        <SectionTitle
          eyebrow="Depoimentos"
          title="O que nossos clientes dizem"
          subtitle="Histórias reais de empresas que aceleraram resultados com a CometaHub."
        />

        <motion.div className={styles.grid} variants={containerVariants} {...revealOnView}>
          {testimonials.map((t) => (
            <GlassCard key={t.name} className={styles.card}>
              <ImQuotesLeft className={styles.quoteMark} aria-hidden="true" />

              {/* Avaliação 5 estrelas */}
              <div className={styles.stars} aria-label="5 de 5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar key={i} />
                ))}
              </div>

              <p className={styles.quote}>{t.quote}</p>

              {/* Autor com avatar de iniciais */}
              <div className={styles.author}>
                <span className={styles.avatar}>{t.initials}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span className={styles.role}>{t.role}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
