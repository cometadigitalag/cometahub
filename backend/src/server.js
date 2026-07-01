// Ponto de entrada — sobe o servidor HTTP.
import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

app.listen(env.port, () => {
  console.log(`API CometaHub rodando em http://localhost:${env.port}`)
  console.log(`Health check:            http://localhost:${env.port}/api/health`)
})
