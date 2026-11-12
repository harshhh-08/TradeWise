import { Router } from 'express';
import { getPortfolio } from '../controllers/portfolio_controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getPortfolio);

export default router;

