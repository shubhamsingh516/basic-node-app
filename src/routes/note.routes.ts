import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as noteController from '../controllers/note.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', noteController.createNote);
router.get('/', noteController.getNotes);
router.get('/:id', noteController.getNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

export default router;