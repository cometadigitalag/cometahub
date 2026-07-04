// Repositório de membros de projeto (colaborador atribuído a uma empresa).
import { prisma } from '../lib/prisma.js'

export const memberRepository = {
  listByProject: (projectId) =>
    prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),

  findById: (id) => prisma.projectMember.findUnique({ where: { id }, include: { user: true } }),

  findByProjectAndUser: (projectId, userId) =>
    prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } }),

  create: (data) => prisma.projectMember.create({ data, include: { user: true } }),
  update: (id, data) => prisma.projectMember.update({ where: { id }, data, include: { user: true } }),
  remove: (id) => prisma.projectMember.delete({ where: { id } }),
}
