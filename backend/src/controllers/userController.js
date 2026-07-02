// Controllers de colaboradores (usuários do painel).
import { userService } from '../services/userService.js'
import { MODULES } from '../config/modules.js'

const h = (fn) => (req, res, next) => fn(req, res, next).catch(next)

export const userController = {
  // Catálogo de módulos disponíveis para marcar na criação.
  modules: h(async (req, res) => {
    res.json(MODULES)
  }),

  list: h(async (req, res) => {
    res.json(await userService.list())
  }),

  create: h(async (req, res) => {
    res.status(201).json(await userService.create(req.body))
  }),

  update: h(async (req, res) => {
    res.json(await userService.update(req.params.id, req.body))
  }),

  remove: h(async (req, res) => {
    res.json(await userService.remove(req.params.id, req.user.id))
  }),
}
