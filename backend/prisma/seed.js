// =========================================================================
// SEED — cria o usuário admin inicial (primeiro acesso ao painel).
// Idempotente: se o e-mail já existir, não duplica.
// Rode com: npm run db:seed
// =========================================================================
import 'dotenv/config'
import '../src/config/env.js' // monta a DATABASE_URL (MySQL) a partir das partes
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const nome = process.env.SEED_ADMIN_NOME || 'Administrador'
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@cometahub.com'
  const senha = process.env.SEED_ADMIN_SENHA || 'cometa123'

  const existente = await prisma.user.findUnique({ where: { email } })
  if (existente) {
    console.log(`Admin já existe: ${email} (nada a fazer)`)
    return
  }

  const hash = await bcrypt.hash(senha, 10)
  await prisma.user.create({ data: { nome, email, senha: hash } })
  console.log('Admin criado com sucesso:')
  console.log(`  email: ${email}`)
  console.log(`  senha: ${senha}  (troque após o primeiro login)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
