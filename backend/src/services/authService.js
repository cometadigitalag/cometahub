// Regra de negócio de autenticação: login e conta do usuário logado.
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { userRepository } from '../repositories/userRepository.js'
import { parsePermissions } from '../config/modules.js'
import { badRequest, unauthorized, notFound } from '../lib/httpError.js'

function gerarToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      permissions: parsePermissions(user.permissions),
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  )
}

// Representação pública do usuário (sem hash de senha).
const publico = (u) => ({
  id: u.id,
  nome: u.nome,
  email: u.email,
  role: u.role,
  permissions: parsePermissions(u.permissions),
})

export const authService = {
  async login({ email, senha }) {
    if (!email || !senha) throw badRequest('Informe e-mail e senha.')
    const user = await userRepository.findByEmail(String(email).toLowerCase())
    if (!user) throw unauthorized('E-mail ou senha inválidos.')
    const ok = await bcrypt.compare(senha, user.senha)
    if (!ok) throw unauthorized('E-mail ou senha inválidos.')
    return { token: gerarToken(user), user: publico(user) }
  },

  async me(userId) {
    const user = await userRepository.findById(userId)
    if (!user) throw notFound('Usuário não encontrado.')
    return publico(user)
  },

  async updateAccount(userId, { nome, email, senha }) {
    const data = {}
    if (nome) data.nome = nome
    if (email) data.email = String(email).toLowerCase()
    if (senha) {
      if (senha.length < 6) throw badRequest('A senha deve ter ao menos 6 caracteres.')
      data.senha = await bcrypt.hash(senha, 10)
    }
    const user = await userRepository.update(userId, data)
    return { token: gerarToken(user), user: publico(user) }
  },
}
