// =========================================================================
// LAYOUT — Footer
// Rodapé com logo + descrição, links de navegação e redes sociais.
// =========================================================================
import { FaInstagram, FaLinkedinIn, FaFacebookF, FaYoutube } from 'react-icons/fa'
import { siteConfig, navLinks, getWhatsAppLink } from '../../data/siteConfig'
import styles from './Footer.module.css'

const socialIcons = {
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  youtube: FaYoutube,
}

export default function Footer() {
  // Ano atual para o aviso de copyright (sempre atualizado).
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Marca */}
        <div className={styles.brand}>
          <img src="/cometahub.png" alt="CometaHub" />
          <p>
            Tecnologia, automação e inteligência artificial para acelerar o
            crescimento da sua empresa.
          </p>
        </div>

        {/* Navegação */}
        <div className={styles.col}>
          <h4>Navegação</h4>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contato + redes */}
        <div className={styles.col}>
          <h4>Contato</h4>
          <ul>
            <li>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </li>
            <li>
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                WhatsApp: {siteConfig.whatsappDisplay}
              </a>
            </li>
          </ul>
          <div className={styles.social}>
            {Object.entries(siteConfig.social).map(([key, url]) => {
              const Icon = socialIcons[key]
              return (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key}>
                  {Icon && <Icon />}
                </a>
              )
            })}
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>
          © {year} {siteConfig.brand}. Todos os direitos reservados.
        </span>
      </div>
    </footer>
  )
}
