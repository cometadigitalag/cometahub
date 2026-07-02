import { Router } from 'express'
import { routineController } from '../controllers/routineController.js'
import { authRequired, requireModule } from '../middleware/auth.js'

const router = Router()

// Ações diretas numa rotina por id (editar / excluir / marcar execução).
router.use(authRequired, requireModule('projetos'))
router.put('/:id', routineController.update)
router.delete('/:id', routineController.remove)
router.post('/:id/completions', routineController.setCompletion)

export default router
