// Middlewares de erro: rota não encontrada + tratador central.
import { HttpError } from '../lib/httpError.js'

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message })
  }
  // Violação de unique do Prisma (ex.: e-mail duplicado)
  if (err?.code === 'P2002') {
    return res.status(409).json({ error: 'Registro já existe (valor único duplicado).' })
  }
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
}
