// =========================================================================
// SEÇÃO — Contato
// Duas colunas: informações (e-mail, WhatsApp, redes) + formulário.
// O formulário é controlado e, ao enviar, abre o WhatsApp com a mensagem
// já preenchida (solução simples, 100% front-end, sem back-end).
// =========================================================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiSend } from 'react-icons/fi'
import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaFacebookF, FaYoutube } from 'react-icons/fa'
import SectionTitle from '../ui/SectionTitle'
import Button from '../ui/Button'
import { siteConfig, getWhatsAppLink } from '../../data/siteConfig'
import { revealOnView, itemVariants } from '../../hooks/useScrollReveal'
import styles from './Contact.module.css'

// Mapa de redes sociais -> ícone (mantém o JSX enxuto).
const socialIcons = {
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  youtube: FaYoutube,
}

export default function Contact() {
  // Estado controlado do formulário.
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  // Em vez de back-end, montamos uma mensagem e abrimos o WhatsApp.
  const handleSubmit = (e) => {
    e.preventDefault()
    const text = `Olá! Sou ${form.name} (${form.email}).%0A%0A${form.message}`
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${text}`, '_blank')
  }

  return (
    <section id="contato" className={styles.section}>
      <div className="container">
        <SectionTitle
          eyebrow="Contato"
          title="Vamos construir o futuro do seu negócio"
          subtitle="Fale com a gente e descubra como a IA e a automação podem acelerar seus resultados."
        />

        <div className={styles.layout}>
          {/* Coluna de informações */}
          <motion.div className={styles.info} variants={itemVariants} {...revealOnView}>
            <a className={styles.infoItem} href={`mailto:${siteConfig.email}`}>
              <span className={styles.infoIcon}><FiMail /></span>
              <div>
                <strong>E-mail</strong>
                <span>{siteConfig.email}</span>
              </div>
            </a>

            <a
              className={styles.infoItem}
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.infoIcon}><FiPhone /></span>
              <div>
                <strong>WhatsApp</strong>
                <span>Atendimento rápido, fale agora</span>
              </div>
            </a>

            {/* CTA grande de WhatsApp */}
            <Button
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              icon={FaWhatsapp}
              className={styles.whatsBtn}
            >
              Conversar no WhatsApp
            </Button>

            {/* Redes sociais */}
            <div className={styles.social}>
              {Object.entries(siteConfig.social).map(([key, url]) => {
                const Icon = socialIcons[key]
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                  >
                    {Icon && <Icon />}
                  </a>
                )
              })}
            </div>
          </motion.div>

          {/* Coluna do formulário */}
          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            variants={itemVariants}
            {...revealOnView}
          >
            <label>
              Nome
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
              />
            </label>

            <label>
              E-mail
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="voce@email.com"
                required
              />
            </label>

            <label>
              Mensagem
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Conte um pouco sobre o seu projeto..."
                rows="4"
                required
              />
            </label>

            <Button type="submit" icon={FiSend}>
              Enviar Mensagem
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
