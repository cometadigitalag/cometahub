// Controllers do Financeiro.
import { financeService } from '../services/financeService.js'

const h = (fn) => (req, res, next) => fn(req, res, next).catch(next)

export const financeController = {
  summary: h(async (req, res) => {
    res.json(await financeService.summary(req.query.mes))
  }),

  projectFinance: h(async (req, res) => {
    res.json(await financeService.projectFinance(req.params.projectId, req.query.mes))
  }),

  createEntry: h(async (req, res) => {
    res.status(201).json(await financeService.createEntry(req.body))
  }),
  updateEntry: h(async (req, res) => {
    res.json(await financeService.updateEntry(req.params.id, req.body))
  }),
  removeEntry: h(async (req, res) => {
    res.json(await financeService.removeEntry(req.params.id))
  }),

  listRecurring: h(async (req, res) => {
    res.json(await financeService.listRecurring(req.params.projectId))
  }),
  createRecurring: h(async (req, res) => {
    res.status(201).json(await financeService.createRecurring(req.params.projectId, req.body))
  }),
  updateRecurring: h(async (req, res) => {
    res.json(await financeService.updateRecurring(req.params.id, req.body))
  }),
  removeRecurring: h(async (req, res) => {
    res.json(await financeService.removeRecurring(req.params.id))
  }),
}
