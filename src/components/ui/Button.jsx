// =========================================================================
// UI — Button (reutilizável)
// Suporta variantes (primary/ghost), renderiza como <a> ou <button> e
// aceita ícone. Usado em CTAs por todo o site.
// =========================================================================
import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'ghost'
  href,                // se informado, renderiza como link <a>
  icon: Icon,          // componente de ícone opcional (react-icons)
  className = '',
  ...props
}) {
  const classes = `${styles.button} ${styles[variant]} ${className}`

  const content = (
    <>
      {Icon && <Icon className={styles.icon} aria-hidden="true" />}
      <span>{children}</span>
    </>
  )

  // Renderização polimórfica: link externo/âncora vs botão de ação.
  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  )
}
