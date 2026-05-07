import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as contactController from '../controllers/contact.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', contactController.createContact);
router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

export default router;