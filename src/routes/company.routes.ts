import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as companyController from '../controllers/company.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/', companyController.createCompany);
router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompany);
router.put('/:id', companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

export default router;