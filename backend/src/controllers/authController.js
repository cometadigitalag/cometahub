// Controllers de autenticação — traduzem HTTP <-> service.
import { authService } from '../services/authService.js'

// Wrapper para propagar erros async ao middleware de erro.
const h = (fn) => (req, res, next) => fn(req, res, next).catch(next)

export const authController = {
  login: h(async (req, res) => {
    const resultado = await authService.login(req.body)
    res.json(resultado)
  }),

  me: h(async (req, res) => {
    const user = await authService.me(req.user.id)
    res.json(user)
  }),

  updateAccount: h(async (req, res) => {
    const resultado = await authService.updateAccount(req.user.id, req.body)
    res.json(resultado)
  }),
}
