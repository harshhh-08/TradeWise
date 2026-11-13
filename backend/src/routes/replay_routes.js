import { Router } from 'express';
import {
  createSession,
  listSessions,
  getSession,
  startSession,
  nextCandle,
  pauseSession,
  getRevealedCandles,
  completeSession,
} from '../controllers/replay_controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/sessions', createSession);
router.get('/sessions', listSessions);
router.get('/sessions/:sessionId', getSession);
router.post('/sessions/:sessionId/start', startSession);
router.post('/sessions/:sessionId/next', nextCandle);
router.post('/sessions/:sessionId/pause', pauseSession);
router.get('/sessions/:sessionId/candles', getRevealedCandles);
router.post('/sessions/:sessionId/complete', completeSession);

export default router;

