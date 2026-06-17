// =========================================================================
// SEÇÃO — Sobre
// Apresenta a empresa e o que ela faz com IA, automação e marketing.
// Layout em duas colunas: texto + lista de pilares com destaque visual.
// =========================================================================
import { motion } from 'framer-motion'
import { FiCpu, FiZap, FiBarChart2 } from 'react-icons/fi'
import SectionTitle from '../ui/SectionTitle'
import { containerVariants, itemVariants, revealOnView } from '../../hooks/useScrollReveal'
import styles from './About.module.css'

// Pilares de atuação (texto curto + ícone).
const pillars = [
  { icon: FiCpu, title: 'Inteligência Artificial', text: 'Modelos que entendem seus dados e tomam decisões em escala.' },
  { icon: FiZap, title: 'Automação', text: 'Processos que rodam sozinhos, sem erros e sem retrabalho.' },
  { icon: FiBarChart2, title: 'Marketing Inteligente', text: 'Mais alcance e conversão com estratégias guiadas por dados.' },
]

export default function About() {
  return (
    <section id="sobre" className={styles.about}>
      <div className="container">
        <SectionTitle
          eyebrow="Sobre a CometaHub"
          title="Tecnologia que impulsiona resultados reais"
          subtitle="Somos um hub de inovação que une inteligência artificial, automação e marketing para transformar a forma como as empresas trabalham e crescem."
        />

        <motion.div
          className={styles.pillars}
          variants={containerVariants}
          {...revealOnView}
        >
          {pillars.map(({ icon: Icon, title, text }) => (
            <motion.div key={title} className={styles.pillar} variants={itemVariants}>
              <div className={styles.iconWrap}>
                <Icon />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
