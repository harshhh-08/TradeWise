import { Router } from 'express';
import { placeOrder, listOrders } from '../controllers/order_controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, placeOrder);
router.get('/', authenticate, listOrders);

export default router;

