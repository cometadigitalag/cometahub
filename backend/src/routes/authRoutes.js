import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.post('/login', authController.login)
router.get('/me', authRequired, authController.me)
router.put('/me', authRequired, authController.updateAccount)

export default router
