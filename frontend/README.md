# CometaHub — Frontend (Painel Interno)

Frontend do painel interno da agência (React + Vite). Consome a API em `../backend`.

## Rodar localmente

Suba a **API** primeiro (ver `../backend/README.md`), depois:

```bash
cd frontend
npm install
npm run dev        # painel em http://localhost:5174
```

O Vite encaminha as chamadas `/api` para `http://localhost:4000` (proxy configurado em `vite.config.js`).

Login padrão: **cometadigitalag@gmail.com / cometa123** (criado pelo seed do backend).

## Estrutura

```
src/
  lib/api.js          cliente HTTP (fetch + JWT) e endpoints
  lib/constants.js    rótulos/cores de status e prioridade
  context/            AuthContext (login/logout/sessão)
  components/         Layout (sidebar), ProtectedRoute, Modal
  pages/              Login, Dashboard, Projects, Roadmap, Account
```

## Build para produção

```bash
npm run build        # gera dist/
```

Em produção (AWS), defina `VITE_API_URL` apontando para a URL pública da API.
