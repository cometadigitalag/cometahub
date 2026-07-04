// Regra de negócio do Financeiro: lançamentos, mensalidades recorrentes e
// resumo por mês (com faturamento por empresa). Valores em centavos (Int).
import { financeRepository } from '../repositories/financeRepository.js'
import { projectRepository } from '../repositories/projectRepository.js'
import { badRequest, notFound } from '../lib/httpError.js'

export const ENTRY_TYPES = ['receita', 'despesa']
export const ENTRY_STATUS = ['pendente', 'pago']

const isMonth = (s) => /^\d{4}-\d{2}$/.test(s)
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s)
const pad = (n) => String(n).padStart(2, '0')
const hoje = () => {
  const d = new Date()
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

function monthBounds(mes) {
  const [y, m] = mes.split('-').map(Number)
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return { start: `${mes}-01`, end: `${mes}-${pad(lastDay)}`, lastDay }
}

function normalizarEntry(input, { parcial = false } = {}) {
  const data = {}
  if (input.tipo !== undefined) {
    if (!ENTRY_TYPES.includes(input.tipo)) throw badRequest('Tipo inválido (receita ou despesa).')
    data.tipo = input.tipo
  } else if (!parcial) {
    throw badRequest('Informe o tipo (receita ou despesa).')
  }
  if (input.descricao !== undefined) data.descricao = String(input.descricao).trim()
  if (input.valorCentavos !== undefined) {
    const v = Math.round(Number(input.valorCentavos))
    if (!Number.isFinite(v) || v < 0) throw badRequest('Valor inválido.')
    data.valorCentavos = v
  } else if (!parcial) {
    throw badRequest('Informe o valor.')
  }
  if (input.vencimento !== undefined) {
    if (input.vencimento && !isDate(input.vencimento)) throw badRequest('Vencimento inválido.')
    data.vencimento = String(input.vencimento || '')
  }
  if (input.projectId !== undefined) data.projectId = input.projectId || null
  if (input.status !== undefined) {
    if (!ENTRY_STATUS.includes(input.status)) throw badRequest('Status inválido.')
    data.status = input.status
    data.dataPagamento = input.status === 'pago' ? input.dataPagamento || hoje() : ''
  }
  return data
}

export const financeService = {
  // Gera os lançamentos das mensalidades recorrentes do mês (idempotente).
  async ensureRecurring(mes, projectId) {
    const recorrentes = await financeRepository.activeRecurring(projectId)
    const { lastDay } = monthBounds(mes)
    for (const r of recorrentes) {
      const dia = Math.min(Math.max(r.diaVencimento || 1, 1), lastDay)
      const vencimento = `${mes}-${pad(dia)}`
      await financeRepository.upsertRecurringEntry(r.id, mes, {
        recurringId: r.id,
        mesRef: mes,
        projectId: r.projectId,
        tipo: 'receita',
        descricao: r.descricao || 'Mensalidade',
        valorCentavos: r.valorCentavos,
        vencimento,
        status: 'pendente',
      })
    }
  },

  // Calcula totais e faturamento por empresa a partir dos lançamentos.
  resumir(entries) {
    const soma = (arr) => arr.reduce((s, e) => s + e.valorCentavos, 0)
    const receitas = entries.filter((e) => e.tipo === 'receita')
    const despesas = entries.filter((e) => e.tipo === 'despesa')
    const totais = {
      receitas: soma(receitas),
      despesas: soma(despesas),
      recebido: soma(receitas.filter((e) => e.status === 'pago')),
      aReceber: soma(receitas.filter((e) => e.status === 'pendente')),
      despesasPagas: soma(despesas.filter((e) => e.status === 'pago')),
      saldoPrevisto: soma(receitas) - soma(despesas),
    }
    // Faturamento por empresa (agrupado por projectId).
    const mapa = new Map()
    for (const e of entries) {
      const key = e.projectId || '__geral__'
      const nome = e.project?.nome || 'Geral (agência)'
      const cur = mapa.get(key) || { projectId: e.projectId || null, nome, receitas: 0, despesas: 0 }
      if (e.tipo === 'receita') cur.receitas += e.valorCentavos
      else cur.despesas += e.valorCentavos
      mapa.set(key, cur)
    }
    const empresas = [...mapa.values()]
      .map((x) => ({ ...x, saldo: x.receitas - x.despesas }))
      .sort((a, b) => b.receitas - a.receitas)
    return { totais, empresas }
  },

  // Painel geral do mês (todas as empresas).
  async summary(mes) {
    if (!isMonth(mes)) throw badRequest('Informe o mês (YYYY-MM).')
    await financeService.ensureRecurring(mes)
    const { start, end } = monthBounds(mes)
    const entries = await financeRepository.entriesInMonth(start, end)
    return { mes, ...financeService.resumir(entries), entries }
  },

  // Financeiro de uma empresa no mês.
  async projectFinance(projectId, mes) {
    const p = await projectRepository.findById(projectId)
    if (!p) throw notFound('Projeto não encontrado.')
    if (!isMonth(mes)) throw badRequest('Informe o mês (YYYY-MM).')
    await financeService.ensureRecurring(mes, projectId)
    const { start, end } = monthBounds(mes)
    const entries = await financeRepository.entriesInMonth(start, end, projectId)
    const recorrentes = await financeRepository.listRecurring(projectId)
    return { mes, ...financeService.resumir(entries), entries, recorrentes }
  },

  // --- Lançamentos avulsos ---
  createEntry(input) {
    const data = normalizarEntry(input)
    if (!data.vencimento) throw badRequest('Informe o vencimento.')
    return financeRepository.createEntry(data)
  },
  async updateEntry(id, input) {
    const e = await financeRepository.findEntry(id)
    if (!e) throw notFound('Lançamento não encontrado.')
    return financeRepository.updateEntry(id, normalizarEntry(input, { parcial: true }))
  },
  async removeEntry(id) {
    const e = await financeRepository.findEntry(id)
    if (!e) throw notFound('Lançamento não encontrado.')
    await financeRepository.removeEntry(id)
    return { ok: true }
  },

  // --- Mensalidades recorrentes ---
  async listRecurring(projectId) {
    const p = await projectRepository.findById(projectId)
    if (!p) throw notFound('Projeto não encontrado.')
    return financeRepository.listRecurring(projectId)
  },
  async createRecurring(projectId, input) {
    const p = await projectRepository.findById(projectId)
    if (!p) throw notFound('Projeto não encontrado.')
    const valor = Math.round(Number(input.valorCentavos))
    if (!Number.isFinite(valor) || valor < 0) throw badRequest('Valor inválido.')
    const dia = Math.min(Math.max(Number(input.diaVencimento) || 5, 1), 31)
    return financeRepository.createRecurring({
      projectId,
      descricao: String(input.descricao || '').trim() || 'Mensalidade',
      valorCentavos: valor,
      diaVencimento: dia,
      ativo: input.ativo === undefined ? true : !!input.ativo,
    })
  },
  async updateRecurring(id, input) {
    const r = await financeRepository.findRecurring(id)
    if (!r) throw notFound('Mensalidade não encontrada.')
    const data = {}
    if (input.descricao !== undefined) data.descricao = String(input.descricao).trim()
    if (input.valorCentavos !== undefined) {
      const v = Math.round(Number(input.valorCentavos))
      if (!Number.isFinite(v) || v < 0) throw badRequest('Valor inválido.')
      data.valorCentavos = v
    }
    if (input.diaVencimento !== undefined) data.diaVencimento = Math.min(Math.max(Number(input.diaVencimento) || 5, 1), 31)
    if (input.ativo !== undefined) data.ativo = !!input.ativo
    return financeRepository.updateRecurring(id, data)
  },
  async removeRecurring(id) {
    const r = await financeRepository.findRecurring(id)
    if (!r) throw notFound('Mensalidade não encontrada.')
    await financeRepository.removeRecurring(id)
    return { ok: true }
  },
}
