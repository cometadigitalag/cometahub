// Instância única do PrismaClient (evita abrir várias conexões em dev).
// Importa a config primeiro para garantir que a DATABASE_URL já esteja
// montada (a partir de DB_HOST/DB_USERNAME/... quando aplicável).
import '../config/env.js'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
