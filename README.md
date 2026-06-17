# CometaHub

Site institucional da **CometaHub** — Tecnologia, Automação, IA e Software.

Front-end moderno e futurista construído em **React + Vite**, totalmente responsivo
(mobile-first), com paleta derivada da logo (vermelho cometa sobre preto),
glassmorphism, gradientes e micro-interações.

## 🚀 Tecnologias

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/) — animações
- [React Icons](https://react-icons.github.io/react-icons/)
- CSS Modules + design tokens (variáveis CSS)

## 📁 Estrutura

```
src/
├── components/
│   ├── ui/          # Componentes reutilizáveis (Button, SectionTitle, GlassCard)
│   ├── layout/      # Navbar, Footer, WhatsAppButton
│   └── sections/    # Hero, About, Services, Differentials, Testimonials, Contact
├── data/            # Conteúdo (config, serviços, depoimentos) separado da UI
├── hooks/           # Hooks customizados (useScrollReveal)
├── styles/          # tokens.css — paleta da marca centralizada
└── App.jsx
```

## 🛠️ Como rodar localmente

```bash
npm install      # instala as dependências
npm run dev      # ambiente de desenvolvimento (http://localhost:5173)
npm run build    # build de produção (pasta dist/)
npm run preview  # pré-visualiza o build
```

## ⚙️ Configuração

Edite `src/data/siteConfig.js` para definir WhatsApp, e-mail e redes sociais.

## ☁️ Deploy

Otimizado para deploy na [Vercel](https://vercel.com/) — basta importar o
repositório (o framework Vite é detectado automaticamente via `vercel.json`).
