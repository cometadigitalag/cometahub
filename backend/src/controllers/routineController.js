// Controllers das rotinas (agenda) e do calendário.
import { routineService } from '../services/routineService.js'

const h = (fn) => (req, res, next) => fn(req, res, next).catch(next)

export const routineController = {
  listByProject: h(async (req, res) => {
    res.json(await routineService.listByProject(req.params.projectId))
  }),

  create: h(async (req, res) => {
    res.status(201).json(await routineService.create(req.params.projectId, req.body))
  }),

  calendar: h(async (req, res) => {
    res.json(await routineService.calendar(req.params.projectId, req.query.start, req.query.end))
  }),

  update: h(async (req, res) => {
    res.json(await routineService.update(req.params.id, req.body))
  }),

  remove: h(async (req, res) => {
    res.json(await routineService.remove(req.params.id))
  }),

  setCompletion: h(async (req, res) => {
    res.json(await routineService.setCompletion(req.params.id, req.body.data, req.body.status))
  }),
}
