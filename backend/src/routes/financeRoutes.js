import { Router } from 'express'
import { financeController } from '../controllers/financeController.js'
import { authRequired, requireModule } from '../middleware/auth.js'

const router = Router()

// Todo o Financeiro exige o módulo "financeiro" (admin sempre passa).
router.use(authRequired, requireModule('financeiro'))

// Painel geral (consolidado) do mês.
router.get('/summary', financeController.summary)

// Lançamentos avulsos (receitas/despesas).
router.post('/entries', financeController.createEntry)
router.put('/entries/:id', financeController.updateEntry)
router.delete('/entries/:id', financeController.removeEntry)

// Financeiro por empresa + mensalidades recorrentes.
router.get('/projects/:projectId', financeController.projectFinance)
router.get('/projects/:projectId/recurring', financeController.listRecurring)
router.post('/projects/:projectId/recurring', financeController.createRecurring)
router.put('/recurring/:id', financeController.updateRecurring)
router.delete('/recurring/:id', financeController.removeRecurring)

export default router
