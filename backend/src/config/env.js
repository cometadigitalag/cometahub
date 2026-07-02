// Carrega variáveis de ambiente e centraliza a configuração da API.
// Monta a DATABASE_URL (MySQL) a partir das partes, seguindo o padrão de
// secrets da infra AWS: DB_HOST/DB_USERNAME/DB_PASSWORD (Secrets Manager) +
// DB_DATABASE (env por sistema). Se DATABASE_URL já vier pronta, usa ela.
import 'dotenv/config'

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL

  const host = process.env.DB_HOST
  const user = process.env.DB_USERNAME
  const pass = process.env.DB_PASSWORD
  const db = process.env.DB_DATABASE || process.env.DB_NAME
  const port = process.env.DB_PORT || '3306'

  if (host && user && db) {
    const url = `mysql://${encodeURIComponent(user)}:${encodeURIComponent(
      pass || '',
    )}@${host}:${port}/${db}`
    // Prisma lê process.env.DATABASE_URL na criação do client.
    process.env.DATABASE_URL = url
    return url
  }
  return undefined
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: buildDatabaseUrl(),
}
