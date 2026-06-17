// =========================================================================
// SEÇÃO — Serviços
// Grid de cards (GlassCard) gerado a partir de data/services.js.
// Os ícones são resolvidos dinamicamente pelo nome salvo nos dados.
// =========================================================================
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SectionTitle from '../ui/SectionTitle'
import GlassCard from '../ui/GlassCard'
import { services } from '../../data/services'
import { containerVariants, revealOnView } from '../../hooks/useScrollReveal'
import styles from './Services.module.css'

export default function Services() {
  return (
    <section id="servicos" className={styles.services}>
      <div className="container">
        <SectionTitle
          eyebrow="O que fazemos"
          title="Soluções completas para o seu crescimento"
          subtitle="Da automação ao marketing com IA, entregamos tecnologia sob medida para cada etapa do seu negócio."
        />

        <motion.div className={styles.grid} variants={containerVariants} {...revealOnView}>
          {services.map((service) => {
            // Resolve o ícone pelo nome (ex.: 'FiCpu') definido nos dados.
            const Icon = FiIcons[service.icon]
            return (
              <GlassCard key={service.title} className={styles.card}>
                <div className={styles.iconWrap}>{Icon && <Icon />}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </GlassCard>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
