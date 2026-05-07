import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as taskController from '../controllers/task.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;