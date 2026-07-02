// Middleware de autenticação e autorização.
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { HttpError, unauthorized } from '../lib/httpError.js'
import { hasModule } from '../config/modules.js'

// Valida o token JWT do header Authorization e popula req.user.
export function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(unauthorized('Token não informado'))

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = {
      id: payload.sub,
      email: payload.email,
      nome: payload.nome,
      role: payload.role || 'colaborador',
      permissions: payload.permissions || [],
    }
    next()
  } catch {
    next(unauthorized('Token inválido ou expirado'))
  }
}

// Exige que o usuário seja admin (ex.: gerenciar colaboradores).
export function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(new HttpError(403, 'Apenas administradores podem acessar este recurso.'))
  }
  next()
}

// Exige acesso a um módulo específico (admin sempre passa).
export function requireModule(key) {
  return (req, res, next) => {
    if (hasModule(req.user, key)) return next()
    next(new HttpError(403, 'Você não tem permissão para acessar este módulo.'))
  }
}
