import { Router } from 'express'
import { projectController } from '../controllers/projectController.js'
import { obligationController } from '../controllers/obligationController.js'
import { routineController } from '../controllers/routineController.js'
import { authRequired, requireModule } from '../middleware/auth.js'

const router = Router()

// Todas as rotas de projeto exigem autenticação e acesso ao módulo "projetos".
router.use(authRequired, requireModule('projetos'))

router.get('/', projectController.list)
router.post('/', projectController.create)
router.get('/:id', projectController.get)
router.put('/:id', projectController.update)
router.delete('/:id', projectController.remove)

// Obrigações (roadmap) aninhadas ao projeto.
router.get('/:projectId/obligations', obligationController.listByProject)
router.post('/:projectId/obligations', obligationController.create)
router.put('/:projectId/obligations/reorder', obligationController.reorder)

// Rotinas (agenda) + calendário aninhados ao projeto.
router.get('/:projectId/routines', routineController.listByProject)
router.post('/:projectId/routines', routineController.create)
router.get('/:projectId/calendar', routineController.calendar)

export default router
