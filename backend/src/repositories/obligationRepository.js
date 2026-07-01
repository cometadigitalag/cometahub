// Repositório de obrigações (itens do roadmap) — acesso ao banco via Prisma.
import { prisma } from '../lib/prisma.js'

export const obligationRepository = {
  listByProject: (projectId) =>
    prisma.obligation.findMany({
      where: { projectId },
      orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
    }),

  findById: (id) => prisma.obligation.findUnique({ where: { id } }),

  countByProject: (projectId) => prisma.obligation.count({ where: { projectId } }),

  create: (data) => prisma.obligation.create({ data }),
  update: (id, data) => prisma.obligation.update({ where: { id }, data }),
  remove: (id) => prisma.obligation.delete({ where: { id } }),
}
