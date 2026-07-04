// Controllers dos membros de projeto.
import { memberService } from '../services/memberService.js'

const h = (fn) => (req, res, next) => fn(req, res, next).catch(next)

export const memberController = {
  listByProject: h(async (req, res) => {
    res.json(await memberService.listByProject(req.params.projectId))
  }),

  add: h(async (req, res) => {
    res.status(201).json(await memberService.add(req.params.projectId, req.body))
  }),

  update: h(async (req, res) => {
    res.json(await memberService.update(req.params.id, req.body))
  }),

  remove: h(async (req, res) => {
    res.json(await memberService.remove(req.params.id))
  }),
}
