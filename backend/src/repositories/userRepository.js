// Repositório de usuários — único lugar que fala com o banco (Prisma).
// Ao migrar para PostgreSQL/RDS, nada aqui muda (Prisma abstrai o SGBD).
import { prisma } from '../lib/prisma.js'

export const userRepository = {
  list: () => prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  findById: (id) => prisma.user.findUnique({ where: { id } }),
  create: (data) => prisma.user.create({ data }),
  update: (id, data) => prisma.user.update({ where: { id }, data }),
  remove: (id) => prisma.user.delete({ where: { id } }),
  countAdmins: () => prisma.user.count({ where: { role: 'admin' } }),
}
