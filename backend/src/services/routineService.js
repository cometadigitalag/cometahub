// Regra de negócio das rotinas recorrentes (agenda) + montagem do calendário.
import { routineRepository } from '../repositories/routineRepository.js'
import { projectRepository } from '../repositories/projectRepository.js'
import { obligationRepository } from '../repositories/obligationRepository.js'
import { expandRange } from '../lib/recurrence.js'
import { badRequest, notFound } from '../lib/httpError.js'

export const ROUTINE_TYPES = ['diaria', 'semanal', 'mensal', 'unica']

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s)

function normalizar(input, { parcial = false } = {}) {
  const data = {}
  if (input.titulo !== undefined) {
    if (!String(input.titulo).trim()) throw badRequest('O título da rotina é obrigatório.')
    data.titulo = String(input.titulo).trim()
  } else if (!parcial) {
    throw badRequest('O título da rotina é obrigatório.')
  }

  if (input.tipo !== undefined) {
    if (!ROUTINE_TYPES.includes(input.tipo)) {
      throw badRequest(`Tipo inválido. Use: ${ROUTINE_TYPES.join(', ')}.`)
    }
    data.tipo = input.tipo
  }
  const tipo = data.tipo || input.tipo

  if (input.descricao !== undefined) data.descricao = String(input.descricao).trim()
  if (input.horario !== undefined) data.horario = String(input.horario).slice(0, 5)
  if (input.cor !== undefined) data.cor = String(input.cor).slice(0, 9)
  if (input.ativo !== undefined) data.ativo = !!input.ativo
  if (input.dataInicio !== undefined) data.dataInicio = String(input.dataInicio)
  if (input.dataFim !== undefined) data.dataFim = String(input.dataFim)

  if (input.diasSemana !== undefined) {
    const dias = (Array.isArray(input.diasSemana) ? input.diasSemana : String(input.diasSemana).split(','))
      .map((d) => Number(String(d).trim()))
      .filter((n) => n >= 0 && n <= 6)
    data.diasSemana = [...new Set(dias)].sort().join(',')
  }
  if (input.diaMes !== undefined) {
    data.diaMes = input.diaMes === null || input.diaMes === '' ? null : Number(input.diaMes)
  }
  if (input.data !== undefined) data.data = String(input.data)

  // Validações específicas por tipo (só quando o tipo está definido).
  if (tipo === 'semanal' && data.diasSemana !== undefined && !data.diasSemana) {
    throw badRequest('Selecione ao menos um dia da semana.')
  }
  if (tipo === 'unica' && data.data !== undefined && !isDate(data.data)) {
    throw badRequest('Informe a data da rotina (única).')
  }
  if (tipo === 'mensal' && data.diaMes !== undefined && !(data.diaMes >= 1 && data.diaMes <= 31)) {
    throw badRequest('Informe um dia do mês entre 1 e 31.')
  }
  return data
}

async function garantirProjeto(projectId) {
  const p = await projectRepository.findById(projectId)
  if (!p) throw notFound('Projeto não encontrado.')
  return p
}

export const routineService = {
  async listByProject(projectId) {
    await garantirProjeto(projectId)
    return routineRepository.listByProject(projectId)
  },

  async create(projectId, input) {
    await garantirProjeto(projectId)
    const data = normalizar(input)
    // Defaults por tipo.
    if (!data.tipo) data.tipo = 'semanal'
    return routineRepository.create({ ...data, projectId })
  },

  async update(id, input) {
    const r = await routineRepository.findById(id)
    if (!r) throw notFound('Rotina não encontrada.')
    return routineRepository.update(id, normalizar(input, { parcial: true }))
  },

  async remove(id) {
    const r = await routineRepository.findById(id)
    if (!r) throw notFound('Rotina não encontrada.')
    await routineRepository.remove(id)
    return { ok: true }
  },

  // Monta o calendário do projeto: ocorrências (com status) por dia no intervalo.
  async calendar(projectId, start, end) {
    await garantirProjeto(projectId)
    if (!isDate(start) || !isDate(end)) throw badRequest('Informe start e end (YYYY-MM-DD).')

    const routines = await routineRepository.listByProject(projectId)
    const ocorrencias = expandRange(routines, start, end)

    const completions = await routineRepository.completionsInRange(
      routines.map((r) => r.id),
      start,
      end,
    )
    const statusMap = new Map(completions.map((c) => [`${c.routineId}|${c.data}`, c.status]))
    const byId = new Map(routines.map((r) => [r.id, r]))

    // Agrupa por data.
    const dias = {}
    for (const o of ocorrencias) {
      const r = byId.get(o.routineId)
      const status = statusMap.get(`${o.routineId}|${o.date}`) || 'pendente'
      ;(dias[o.date] = dias[o.date] || []).push({
        kind: 'rotina',
        routineId: r.id,
        titulo: r.titulo,
        descricao: r.descricao,
        horario: r.horario,
        cor: r.cor,
        tipo: r.tipo,
        date: o.date,
        status,
      })
    }

    // Inclui as obrigações (roadmap) com prazo dentro do intervalo.
    const obrigacoes = await obligationRepository.listByProject(projectId)
    for (const ob of obrigacoes) {
      if (ob.prazo && ob.prazo >= start && ob.prazo <= end) {
        ;(dias[ob.prazo] = dias[ob.prazo] || []).push({
          kind: 'obrigacao',
          obligationId: ob.id,
          titulo: ob.titulo,
          descricao: ob.descricao,
          responsavel: ob.responsavel,
          responsavelEmail: ob.responsavelEmail,
          prioridade: ob.prioridade,
          date: ob.prazo,
          status: ob.status,
        })
      }
    }

    // Ordena cada dia: por horário; obrigações (sem horário) vão ao fim.
    for (const d of Object.keys(dias)) {
      dias[d].sort((a, b) => (a.horario || '99:99').localeCompare(b.horario || '99:99'))
    }
    return { routines, dias }
  },

  // Marca uma ocorrência (rotina em uma data) como concluída/pendente.
  async setCompletion(routineId, dataOcorrencia, status) {
    const r = await routineRepository.findById(routineId)
    if (!r) throw notFound('Rotina não encontrada.')
    if (!isDate(dataOcorrencia)) throw badRequest('Data da ocorrência inválida.')
    const st = status === 'concluido' ? 'concluido' : 'pendente'
    await routineRepository.upsertCompletion(routineId, dataOcorrencia, st)
    return { routineId, data: dataOcorrencia, status: st }
  },
}
