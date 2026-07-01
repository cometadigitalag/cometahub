// Instância única do PrismaClient (evita abrir várias conexões em dev).
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
