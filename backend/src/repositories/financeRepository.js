// Repositório financeiro (lançamentos + mensalidades recorrentes).
import { prisma } from '../lib/prisma.js'

export const financeRepository = {
  // Lançamentos com vencimento no intervalo. projectId: undefined=todos,
  // string=empresa específica.
  entriesInMonth: (start, end, projectId) =>
    prisma.financeEntry.findMany({
      where: {
        vencimento: { gte: start, lte: end },
        ...(projectId !== undefined ? { projectId } : {}),
      },
      include: { project: { select: { id: true, nome: true } } },
      orderBy: [{ vencimento: 'asc' }, { createdAt: 'asc' }],
    }),

  createEntry: (data) => prisma.financeEntry.create({ data }),
  findEntry: (id) => prisma.financeEntry.findUnique({ where: { id } }),
  updateEntry: (id, data) => prisma.financeEntry.update({ where: { id }, data }),
  removeEntry: (id) => prisma.financeEntry.delete({ where: { id } }),

  // Cria o lançamento de uma recorrente para o mês, se ainda não existir.
  upsertRecurringEntry: (recurringId, mesRef, create) =>
    prisma.financeEntry.upsert({
      where: { recurringId_mesRef: { recurringId, mesRef } },
      create,
      update: {},
    }),

  activeRecurring: (projectId) =>
    prisma.recurringCharge.findMany({
      where: { ativo: true, ...(projectId ? { projectId } : {}) },
    }),
  listRecurring: (projectId) =>
    prisma.recurringCharge.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } }),
  createRecurring: (data) => prisma.recurringCharge.create({ data }),
  findRecurring: (id) => prisma.recurringCharge.findUnique({ where: { id } }),
  updateRecurring: (id, data) => prisma.recurringCharge.update({ where: { id }, data }),
  removeRecurring: (id) => prisma.recurringCharge.delete({ where: { id } }),
}
