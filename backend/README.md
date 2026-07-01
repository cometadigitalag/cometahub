# CometaHub — Backend (API)

API do painel interno da agência. Node.js + Express + Prisma.

- **Agora:** SQLite (arquivo local `prisma/dev.db`).
- **Depois:** PostgreSQL no AWS RDS — basta trocar `provider` no `schema.prisma` e a `DATABASE_URL` no `.env`.

## Rodar localmente

```bash
cd backend
npm install
cp .env.example .env          # ajuste os valores se quiser
npm run prisma:generate       # gera o Prisma Client
npm run prisma:migrate        # cria o banco/tabelas (aceite o nome da migration)
npm run db:seed               # cria o admin inicial
npm run dev                   # sobe a API em http://localhost:4000
```

Login padrão (definido no `.env`): **cometadigitalag@gmail.com / cometa123** — troque após o primeiro acesso.

## Endpoints

Base: `/api`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET  | `/health` | Status da API |
| POST | `/auth/login` | Login (retorna token JWT) |
| GET  | `/auth/me` | Dados do usuário logado |
| PUT  | `/auth/me` | Atualiza nome/e-mail/senha |
| GET  | `/projects` | Lista projetos |
| POST | `/projects` | Cria projeto |
| GET  | `/projects/:id` | Detalhe do projeto |
| PUT  | `/projects/:id` | Atualiza projeto |
| DELETE | `/projects/:id` | Remove projeto (e suas obrigações) |
| GET  | `/projects/:projectId/obligations` | Lista obrigações (roadmap) |
| POST | `/projects/:projectId/obligations` | Cria obrigação |
| PUT  | `/projects/:projectId/obligations/reorder` | Reordena/atualiza status em lote |
| PUT  | `/obligations/:id` | Atualiza obrigação |
| DELETE | `/obligations/:id` | Remove obrigação |

Rotas protegidas exigem header `Authorization: Bearer <token>`.

## Migrar para AWS RDS (PostgreSQL) — depois

1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
2. No `.env` (ou variável de ambiente na AWS), aponte `DATABASE_URL` para o RDS.
3. Rode `npx prisma migrate deploy`.
4. Nenhuma mudança nos repositories/services/controllers é necessária.
