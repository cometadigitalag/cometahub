// Regra de negócio de projetos + validação de entrada.
import { projectRepository } from '../repositories/projectRepository.js'
import { badRequest, notFound } from '../lib/httpError.js'

export const PROJECT_STATUS = ['ativo', 'pausado', 'concluido']

function normalizar(input, { parcial = false } = {}) {
  const data = {}
  if (input.nome !== undefined) {
    if (!String(input.nome).trim()) throw badRequest('O nome do projeto é obrigatório.')
    data.nome = String(input.nome).trim()
  } else if (!parcial) {
    throw badRequest('O nome do projeto é obrigatório.')
  }
  if (input.cliente !== undefined) data.cliente = String(input.cliente).trim()
  if (input.descricao !== undefined) data.descricao = String(input.descricao).trim()
  if (input.dataInicio !== undefined) data.dataInicio = String(input.dataInicio)
  if (input.dataFim !== undefined) data.dataFim = String(input.dataFim)
  if (input.status !== undefined) {
    if (!PROJECT_STATUS.includes(input.status)) {
      throw badRequest(`Status inválido. Use: ${PROJECT_STATUS.join(', ')}.`)
    }
    data.status = input.status
  }
  return data
}

export const projectService = {
  list: () => projectRepository.list(),

  async get(id) {
    const projeto = await projectRepository.findById(id)
    if (!projeto) throw notFound('Projeto não encontrado.')
    return projeto
  },

  create: (input) => projectRepository.create(normalizar(input)),

  async update(id, input) {
    await projectService.get(id)
    return projectRepository.update(id, normalizar(input, { parcial: true }))
  },

  async remove(id) {
    await projectService.get(id)
    await projectRepository.remove(id)
    return { ok: true }
  },
}
