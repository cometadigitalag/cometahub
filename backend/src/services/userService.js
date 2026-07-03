// Regra de negócio de colaboradores (usuários do painel) — admin only.
import bcrypt from 'bcryptjs'
import { userRepository } from '../repositories/userRepository.js'
import { serializePermissions, parsePermissions } from '../config/modules.js'
import { badRequest, notFound, conflict } from '../lib/httpError.js'

export const ROLES = ['admin', 'colaborador']

const publico = (u) => ({
  id: u.id,
  nome: u.nome,
  email: u.email,
  role: u.role,
  permissions: parsePermissions(u.permissions),
  createdAt: u.createdAt,
})

function validarRole(role) {
  if (role && !ROLES.includes(role)) {
    throw badRequest(`Perfil inválido. Use: ${ROLES.join(', ')}.`)
  }
}

export const userService = {
  async list() {
    const users = await userRepository.list()
    return users.map(publico)
  },

  // Lista enxuta para preencher selects (ex.: responsável por uma obrigação).
  async listAssignable() {
    const users = await userRepository.list()
    return users.map((u) => ({ id: u.id, nome: u.nome, email: u.email }))
  },

  async create({ nome, email, senha, role, permissions }) {
    if (!nome || !String(nome).trim()) throw badRequest('Informe o nome.')
    if (!email || !String(email).trim()) throw badRequest('Informe o e-mail.')
    if (!senha || senha.length < 6) throw badRequest('A senha deve ter ao menos 6 caracteres.')
    validarRole(role)

    const emailNorm = String(email).toLowerCase().trim()
    if (await userRepository.findByEmail(emailNorm)) {
      throw conflict('Já existe um usuário com este e-mail.')
    }

    const papel = role || 'colaborador'
    const user = await userRepository.create({
      nome: String(nome).trim(),
      email: emailNorm,
      senha: await bcrypt.hash(senha, 10),
      role: papel,
      // admin vê tudo; colaborador guarda os módulos marcados.
      permissions: papel === 'admin' ? '' : serializePermissions(permissions),
    })
    return publico(user)
  },

  async update(id, { nome, email, senha, role, permissions }) {
    const alvo = await userRepository.findById(id)
    if (!alvo) throw notFound('Usuário não encontrado.')
    validarRole(role)

    const data = {}
    if (nome !== undefined) data.nome = String(nome).trim()
    if (email !== undefined) {
      const emailNorm = String(email).toLowerCase().trim()
      const existente = await userRepository.findByEmail(emailNorm)
      if (existente && existente.id !== id) throw conflict('E-mail já usado por outro usuário.')
      data.email = emailNorm
    }
    if (senha) {
      if (senha.length < 6) throw badRequest('A senha deve ter ao menos 6 caracteres.')
      data.senha = await bcrypt.hash(senha, 10)
    }

    const novoRole = role || alvo.role
    if (role !== undefined) {
      // Impede remover o último admin do sistema.
      if (alvo.role === 'admin' && novoRole !== 'admin' && (await userRepository.countAdmins()) <= 1) {
        throw badRequest('Não é possível rebaixar o último administrador.')
      }
      data.role = novoRole
    }
    if (permissions !== undefined || role !== undefined) {
      data.permissions = novoRole === 'admin' ? '' : serializePermissions(permissions ?? alvo.permissions)
    }

    const user = await userRepository.update(id, data)
    return publico(user)
  },

  async remove(id, currentUserId) {
    const alvo = await userRepository.findById(id)
    if (!alvo) throw notFound('Usuário não encontrado.')
    if (id === currentUserId) throw badRequest('Você não pode excluir a própria conta.')
    if (alvo.role === 'admin' && (await userRepository.countAdmins()) <= 1) {
      throw badRequest('Não é possível excluir o último administrador.')
    }
    await userRepository.remove(id)
    return { ok: true }
  },
}
