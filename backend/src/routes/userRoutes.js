import { Router } from 'express'
import { userController } from '../controllers/userController.js'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = Router()

// Gestão de colaboradores: exclusiva de administradores.
router.use(authRequired, adminRequired)

router.get('/modules', userController.modules)
router.get('/', userController.list)
router.post('/', userController.create)
router.put('/:id', userController.update)
router.delete('/:id', userController.remove)

export default router
