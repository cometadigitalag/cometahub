// =========================================================================
// COMPONENTE RAIZ — App
// Monta o layout completo do site na ordem das seções.
// Cada seção é um componente isolado e reutilizável (pasta sections/).
// =========================================================================
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/layout/WhatsAppButton'

import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Services from './components/sections/Services'
import Differentials from './components/sections/Differentials'
import Testimonials from './components/sections/Testimonials'
import Contact from './components/sections/Contact'

export default function App() {
  return (
    <>
      {/* Cabeçalho fixo */}
      <Navbar />

      {/* Conteúdo principal — seções na ordem de rolagem */}
      <main>
        <Hero />
        <About />
        <Services />
        <Differentials />
        <Testimonials />
        <Contact />
      </main>

      {/* Rodapé + botão flutuante de WhatsApp */}
      <Footer />
      <WhatsAppButton />
    </>
  )
}
