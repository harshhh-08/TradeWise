import { Router } from 'express';
import { listTrades } from '../controllers/order_controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, listTrades);

export default router;

