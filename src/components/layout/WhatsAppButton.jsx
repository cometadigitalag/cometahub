// =========================================================================
// LAYOUT — WhatsAppButton (flutuante)
// Botão fixo no canto inferior direito, sempre visível, com pulso animado.
// =========================================================================
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { getWhatsAppLink } from '../../data/siteConfig'
import styles from './WhatsAppButton.module.css'

export default function WhatsAppButton() {
  return (
    <motion.a
      className={styles.button}
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
      // Entra com um leve "pop" depois do carregamento da página.
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <FaWhatsapp />
      <span className={styles.ping} aria-hidden="true" />
    </motion.a>
  )
}
