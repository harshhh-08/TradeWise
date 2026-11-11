import { Router } from 'express';
import { listStocks, stockDetails, stockCandles } from '../controllers/stock_controller.js';

const router = Router();

router.get('/', listStocks);
router.get('/:symbol', stockDetails);
router.get('/:symbol/candles', stockCandles);

export default router;

