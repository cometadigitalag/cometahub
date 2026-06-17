// =========================================================================
// CONFIGURAÇÃO CENTRAL DO SITE
// Edite aqui os dados de contato e marca — eles são reutilizados em todo o app.
// (Telefone/links abaixo são EXEMPLOS — troque pelos dados reais da empresa.)
// =========================================================================

export const siteConfig = {
  brand: 'CometaHub',
  tagline: 'Tecnologia • Automação • IA • Software',
  email: 'contato@cometahub.com.br',

  // Número no formato internacional, somente dígitos (DDI + DDD + número).
  whatsapp: '5599999999999',
  whatsappMessage: 'Olá! Vim pelo site e quero saber mais sobre as soluções da CometaHub.',

  social: {
    instagram: 'https://instagram.com/',
    linkedin: 'https://linkedin.com/',
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/',
  },
}

// Monta o link do WhatsApp com mensagem pré-preenchida (reutilizável).
export const getWhatsAppLink = () =>
  `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`

// Itens de navegação (usados na Navbar e no Footer).
export const navLinks = [
  { label: 'Início', href: '#hero' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]
