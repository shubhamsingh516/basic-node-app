import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as dealController from '../controllers/deal.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', dealController.createDeal);
router.get('/', dealController.getDeals);
router.get('/:id', dealController.getDeal);
router.put('/:id', dealController.updateDeal);
router.delete('/:id', dealController.deleteDeal);

export default router;