// Repositório de projetos — acesso ao banco via Prisma.
import { prisma } from '../lib/prisma.js'

export const projectRepository = {
  list: () =>
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { obligations: true } } },
    }),

  findById: (id) =>
    prisma.project.findUnique({
      where: { id },
      include: { _count: { select: { obligations: true } } },
    }),

  create: (data) => prisma.project.create({ data }),
  update: (id, data) => prisma.project.update({ where: { id }, data }),
  remove: (id) => prisma.project.delete({ where: { id } }), // cascata remove obrigações
}
