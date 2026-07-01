// Configuração do app Express (middlewares + rotas + erros).
import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import routes from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/error.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.corsOrigin }))
  app.use(express.json())

  app.use('/api', routes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
