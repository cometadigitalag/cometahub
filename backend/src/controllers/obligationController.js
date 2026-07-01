// Controllers das obrigações (roadmap).
import { obligationService } from '../services/obligationService.js'

const h = (fn) => (req, res, next) => fn(req, res, next).catch(next)

export const obligationController = {
  listByProject: h(async (req, res) => {
    res.json(await obligationService.listByProject(req.params.projectId))
  }),

  create: h(async (req, res) => {
    res.status(201).json(await obligationService.create(req.params.projectId, req.body))
  }),

  reorder: h(async (req, res) => {
    res.json(await obligationService.reorder(req.params.projectId, req.body.itens))
  }),

  update: h(async (req, res) => {
    res.json(await obligationService.update(req.params.id, req.body))
  }),

  remove: h(async (req, res) => {
    res.json(await obligationService.remove(req.params.id))
  }),
}
