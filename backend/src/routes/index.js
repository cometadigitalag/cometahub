// Agrega todas as rotas da API sob /api.
import { Router } from 'express'
import authRoutes from './authRoutes.js'
import projectRoutes from './projectRoutes.js'
import obligationRoutes from './obligationRoutes.js'
import userRoutes from './userRoutes.js'

const router = Router()

router.get('/health', (req, res) => res.json({ status: 'ok' }))
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/projects', projectRoutes)
router.use('/obligations', obligationRoutes)

export default router
