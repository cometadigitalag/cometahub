import { Router } from 'express'
import multer from 'multer'
import { userController } from '../controllers/userController.js'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = Router()

// Upload de foto em memória (até 5MB), depois enviada ao S3.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// Lista enxuta de colaboradores para selects (qualquer usuário logado).
router.get('/assignable', authRequired, userController.assignable)

// Gestão de colaboradores: exclusiva de administradores.
router.use(authRequired, adminRequired)

router.get('/modules', userController.modules)
router.get('/', userController.list)
router.post('/', userController.create)
router.get('/:id/assignments', userController.assignments)
router.post('/:id/photo', upload.single('foto'), userController.uploadPhoto)
router.put('/:id', userController.update)
router.delete('/:id', userController.remove)

export default router
