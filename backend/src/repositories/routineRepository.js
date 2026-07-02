// Repositório de rotinas (agenda) e suas execuções — acesso via Prisma.
import { prisma } from '../lib/prisma.js'

export const routineRepository = {
  listByProject: (projectId) =>
    prisma.routine.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } }),

  findById: (id) => prisma.routine.findUnique({ where: { id } }),
  create: (data) => prisma.routine.create({ data }),
  update: (id, data) => prisma.routine.update({ where: { id }, data }),
  remove: (id) => prisma.routine.delete({ where: { id } }),

  // Execuções (feito/pendente) das rotinas de um projeto num intervalo.
  completionsInRange: (routineIds, start, end) =>
    prisma.routineCompletion.findMany({
      where: { routineId: { in: routineIds }, data: { gte: start, lte: end } },
    }),

  upsertCompletion: (routineId, data, status) =>
    prisma.routineCompletion.upsert({
      where: { routineId_data: { routineId, data } },
      create: { routineId, data, status },
      update: { status },
    }),
}
