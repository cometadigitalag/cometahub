// Regra de negócio das obrigações (roadmap) + validação.
import { obligationRepository } from '../repositories/obligationRepository.js'
import { projectRepository } from '../repositories/projectRepository.js'
import { badRequest, notFound } from '../lib/httpError.js'

export const OBLIGATION_STATUS = ['pendente', 'em_andamento', 'concluido']
export const OBLIGATION_PRIORITY = ['baixa', 'media', 'alta']

function normalizar(input, { parcial = false } = {}) {
  const data = {}
  if (input.titulo !== undefined) {
    if (!String(input.titulo).trim()) throw badRequest('O título da obrigação é obrigatório.')
    data.titulo = String(input.titulo).trim()
  } else if (!parcial) {
    throw badRequest('O título da obrigação é obrigatório.')
  }
  if (input.descricao !== undefined) data.descricao = String(input.descricao).trim()
  if (input.responsavel !== undefined) data.responsavel = String(input.responsavel).trim()
  if (input.prazo !== undefined) data.prazo = String(input.prazo)
  if (input.ordem !== undefined) data.ordem = Number(input.ordem) || 0
  if (input.prioridade !== undefined) {
    if (!OBLIGATION_PRIORITY.includes(input.prioridade)) {
      throw badRequest(`Prioridade inválida. Use: ${OBLIGATION_PRIORITY.join(', ')}.`)
    }
    data.prioridade = input.prioridade
  }
  if (input.status !== undefined) {
    if (!OBLIGATION_STATUS.includes(input.status)) {
      throw badRequest(`Status inválido. Use: ${OBLIGATION_STATUS.join(', ')}.`)
    }
    data.status = input.status
  }
  return data
}

async function garantirProjeto(projectId) {
  const projeto = await projectRepository.findById(projectId)
  if (!projeto) throw notFound('Projeto não encontrado.')
  return projeto
}

export const obligationService = {
  async listByProject(projectId) {
    await garantirProjeto(projectId)
    return obligationRepository.listByProject(projectId)
  },

  async create(projectId, input) {
    await garantirProjeto(projectId)
    const data = normalizar(input)
    // Se a ordem não veio, coloca no fim da lista.
    if (data.ordem === undefined) {
      data.ordem = await obligationRepository.countByProject(projectId)
    }
    return obligationRepository.create({ ...data, projectId })
  },

  async update(id, input) {
    const item = await obligationRepository.findById(id)
    if (!item) throw notFound('Obrigação não encontrada.')
    return obligationRepository.update(id, normalizar(input, { parcial: true }))
  },

  async remove(id) {
    const item = await obligationRepository.findById(id)
    if (!item) throw notFound('Obrigação não encontrada.')
    await obligationRepository.remove(id)
    return { ok: true }
  },

  // Reordena/atualiza status em lote (ex.: arrastar cartões no roadmap).
  async reorder(projectId, itens) {
    await garantirProjeto(projectId)
    if (!Array.isArray(itens)) throw badRequest('Envie uma lista de itens.')
    await Promise.all(
      itens.map((it, index) =>
        obligationRepository.update(it.id, {
          ordem: index,
          ...(it.status && OBLIGATION_STATUS.includes(it.status) ? { status: it.status } : {}),
        }),
      ),
    )
    return obligationRepository.listByProject(projectId)
  },
}
