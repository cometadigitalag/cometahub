import { Router } from 'express'
import { memberController } from '../controllers/memberController.js'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = Router()

// Editar/remover atribuição de colaborador — só admin.
router.use(authRequired, adminRequired)
router.put('/:id', memberController.update)
router.delete('/:id', memberController.remove)

export default router
