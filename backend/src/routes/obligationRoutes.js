import { Router } from 'express'
import { obligationController } from '../controllers/obligationController.js'
import { authRequired, requireModule } from '../middleware/auth.js'

const router = Router()

// Ações diretas numa obrigação por id (editar / excluir).
router.use(authRequired, requireModule('projetos'))
router.put('/:id', obligationController.update)
router.delete('/:id', obligationController.remove)

export default router
