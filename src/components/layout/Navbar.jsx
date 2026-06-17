// =========================================================================
// LAYOUT — Navbar
// Cabeçalho fixo com logo + navegação. No mobile vira menu hambúrguer.
// Ganha fundo sólido (glass) ao rolar a página. CTA de WhatsApp à direita.
// =========================================================================
import { useState, useEffect } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import Button from '../ui/Button'
import { navLinks, getWhatsAppLink } from '../../data/siteConfig'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [open, setOpen] = useState(false)      // menu mobile aberto?
  const [scrolled, setScrolled] = useState(false) // já rolou a página?

  // Adiciona fundo à navbar depois de rolar alguns pixels.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha o menu mobile ao clicar em um link.
  const closeMenu = () => setOpen(false)

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={`container ${styles.nav}`}>
        {/* Logo */}
        <a href="#hero" className={styles.logo} onClick={closeMenu}>
          <img src="/cometahub.png" alt="CometaHub" />
        </a>

        {/* Links de navegação (desktop + drawer mobile) */}
        <ul className={`${styles.links} ${open ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            </li>
          ))}
          {/* CTA visível dentro do menu no mobile */}
          <li className={styles.mobileCta}>
            <Button href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              Fale Conosco
            </Button>
          </li>
        </ul>

        {/* CTA no desktop */}
        <div className={styles.desktopCta}>
          <Button href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
            Fale Conosco
          </Button>
        </div>

        {/* Botão hambúrguer (mobile) */}
        <button
          className={styles.toggle}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </nav>
    </header>
  )
}
