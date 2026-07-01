// Middleware de autenticação — valida o token JWT do header Authorization.
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { unauthorized } from '../lib/httpError.js'

export function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next(unauthorized('Token não informado'))

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = { id: payload.sub, email: payload.email, nome: payload.nome }
    next()
  } catch {
    next(unauthorized('Token inválido ou expirado'))
  }
}
