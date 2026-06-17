// =========================================================================
// HOOK — useScrollReveal
// Retorna props prontas para o framer-motion animarem um elemento ao entrar
// na viewport (fade + leve subida). Centraliza a config para reuso e
// consistência das micro-animações em todas as seções.
// =========================================================================

// Variants reutilizáveis para o container e para os itens filhos (stagger).
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
}

// Props padrão para aplicar a animação "ao aparecer na tela" em um motion.element.
// Uso: <motion.div {...revealOnView}>...</motion.div>
export const revealOnView = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.2 },
}
