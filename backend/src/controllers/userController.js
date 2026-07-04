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

  assignable: h(async (req, res) => {
    res.json(await userService.listAssignable())
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

  // Empresas atribuídas ao colaborador + função em cada uma.
  assignments: h(async (req, res) => {
    res.json(await userService.assignments(req.params.id))
  }),

  // Upload da foto de perfil (multipart, campo "foto").
  uploadPhoto: h(async (req, res) => {
    // stamp para versionar a chave (invalida cache do CloudFront ao trocar).
    const stamp = Date.now().toString(36)
    res.json(await userService.setPhoto(req.params.id, req.file, stamp))
  }),
}
