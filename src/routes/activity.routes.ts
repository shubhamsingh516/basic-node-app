import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as activityController from '../controllers/activity.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', activityController.createActivity);
router.get('/', activityController.getActivities);
router.get('/:id', activityController.getActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

export default router;