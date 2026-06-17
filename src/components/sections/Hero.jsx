// =========================================================================
// SEÇÃO — Hero (topo)
// Título de impacto, subtítulo e CTAs. Fundo futurista com grid animado,
// orbe de luz e o ícone do cometa "voando". Animações de entrada com framer.
// =========================================================================
import { motion } from 'framer-motion'
import { FiArrowRight, FiPlay } from 'react-icons/fi'
import Button from '../ui/Button'
import { siteConfig, getWhatsAppLink } from '../../data/siteConfig'
import { containerVariants, itemVariants } from '../../hooks/useScrollReveal'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      {/* Camadas decorativas de fundo (grid + orbe de luz) */}
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.orb} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Coluna de texto */}
        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span className={styles.badge} variants={itemVariants}>
            🚀 {siteConfig.tagline}
          </motion.span>

          <motion.h1 className={styles.title} variants={itemVariants}>
            Acelere seu negócio com <span className={styles.highlight}>IA</span>,
            automação e marketing inteligente
          </motion.h1>

          <motion.p className={styles.subtitle} variants={itemVariants}>
            A CometaHub cria soluções de inteligência artificial e automação que
            economizam tempo, geram mais clientes e colocam sua empresa à frente
            da concorrência.
          </motion.p>

          <motion.div className={styles.actions} variants={itemVariants}>
            <Button
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              icon={FiArrowRight}
            >
              Solicitar Orçamento
            </Button>
            <Button href="#servicos" variant="ghost" icon={FiPlay}>
              Ver Serviços
            </Button>
          </motion.div>
        </motion.div>

        {/* Coluna visual: ícone do cometa flutuando */}
        <motion.div
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img
            src="/iconcometa.png"
            alt="Ícone CometaHub"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className={styles.visualGlow} aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  )
}
