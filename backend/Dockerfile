# Imagem da API CometaHub (Node + Prisma) para ECS Fargate.
FROM node:20-alpine

# Prisma precisa do openssl em Alpine.
RUN apk add --no-cache openssl

WORKDIR /app

# Instala dependências (aproveita cache) e gera o Prisma Client.
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate

# Código da aplicação.
COPY src ./src

# Porta padrão da infra (target group aponta para 3000).
ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/server.js"]
