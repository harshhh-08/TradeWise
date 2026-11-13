import { Router } from 'express';
import {
  createBacktest,
  listBacktests,
  getBacktest,
  removeBacktest,
} from '../controllers/backtest_controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createBacktest);
router.get('/', listBacktests);
router.get('/:backtestId', getBacktest);
router.delete('/:backtestId', removeBacktest);

export default router;
