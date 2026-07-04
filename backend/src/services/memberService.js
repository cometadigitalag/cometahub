// Regra de negócio dos membros de projeto (colaborador + função na empresa).
import { memberRepository } from '../repositories/memberRepository.js'
import { projectRepository } from '../repositories/projectRepository.js'
import { userRepository } from '../repositories/userRepository.js'
import { badRequest, notFound, conflict } from '../lib/httpError.js'

// Representação enxuta do membro (com dados públicos do colaborador).
const publico = (m) => ({
  id: m.id,
  projectId: m.projectId,
  userId: m.userId,
  funcao: m.funcao,
  nome: m.user?.nome,
  email: m.user?.email,
  cargo: m.user?.cargo,
  fotoUrl: m.user?.fotoUrl,
  role: m.user?.role,
})

export const memberService = {
  async listByProject(projectId) {
    const p = await projectRepository.findById(projectId)
    if (!p) throw notFound('Projeto não encontrado.')
    const membros = await memberRepository.listByProject(projectId)
    return membros.map(publico)
  },

  async add(projectId, { userId, funcao }) {
    const p = await projectRepository.findById(projectId)
    if (!p) throw notFound('Projeto não encontrado.')
    if (!userId) throw badRequest('Selecione um colaborador.')
    const u = await userRepository.findById(userId)
    if (!u) throw notFound('Colaborador não encontrado.')
    if (await memberRepository.findByProjectAndUser(projectId, userId)) {
      throw conflict('Este colaborador já está nesta empresa.')
    }
    const m = await memberRepository.create({
      projectId,
      userId,
      funcao: String(funcao || '').trim(),
    })
    return publico(m)
  },

  async update(id, { funcao }) {
    const m = await memberRepository.findById(id)
    if (!m) throw notFound('Membro não encontrado.')
    const upd = await memberRepository.update(id, { funcao: String(funcao || '').trim() })
    return publico(upd)
  },

  async remove(id) {
    const m = await memberRepository.findById(id)
    if (!m) throw notFound('Membro não encontrado.')
    await memberRepository.remove(id)
    return { ok: true }
  },
}
