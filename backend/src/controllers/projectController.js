// Controllers de projetos.
import { projectService } from '../services/projectService.js'

const h = (fn) => (req, res, next) => fn(req, res, next).catch(next)

export const projectController = {
  list: h(async (req, res) => {
    res.json(await projectService.list())
  }),

  get: h(async (req, res) => {
    res.json(await projectService.get(req.params.id))
  }),

  create: h(async (req, res) => {
    res.status(201).json(await projectService.create(req.body))
  }),

  update: h(async (req, res) => {
    res.json(await projectService.update(req.params.id, req.body))
  }),

  remove: h(async (req, res) => {
    res.json(await projectService.remove(req.params.id))
  }),
}
