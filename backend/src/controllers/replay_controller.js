import {
  createReplaySession,
  getUserReplaySessions,
  getReplaySessionById,
  startReplaySession,
  advanceReplaySession,
  pauseReplaySession,
  getReplayAvailableCandles,
  completeReplaySession,
} from '../services/replay_service.js';

export const createSession = async (req, res) => {
  try {
    const { symbol, timeframe, startDate, endDate } = req.body || {};
    const session = await createReplaySession({
      userId: req.user.id,
      symbol,
      timeframe,
      startDate,
      endDate,
    });
    return res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Create replay session error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to create replay session',
    });
  }
};

export const listSessions = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getUserReplaySessions({
      userId: req.user.id,
      page,
      limit,
    });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List replay sessions error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve replay sessions',
    });
  }
};

export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getReplaySessionById({
      userId: req.user.id,
      sessionId,
    });
    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Get replay session error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve replay session',
    });
  }
};

export const startSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await startReplaySession({
      userId: req.user.id,
      sessionId,
    });
    return res.status(200).json({
      success: true,
      replay: result,
    });
  } catch (error) {
    console.error('Start replay session error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to start replay session',
    });
  }
};

export const nextCandle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await advanceReplaySession({
      userId: req.user.id,
      sessionId,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Advance replay session error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to advance replay session',
    });
  }
};

export const pauseSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await pauseReplaySession({
      userId: req.user.id,
      sessionId,
    });
    return res.status(200).json({
      success: true,
      replay: result,
    });
  } catch (error) {
    console.error('Pause replay session error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to pause replay session',
    });
  }
};

export const getRevealedCandles = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit } = req.query;
    const result = await getReplayAvailableCandles({
      userId: req.user.id,
      sessionId,
      limit,
    });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get revealed candles error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve replay candles',
    });
  }
};

export const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await completeReplaySession({
      userId: req.user.id,
      sessionId,
    });
    return res.status(200).json({
      success: true,
      message: 'Replay session completed',
      replay: result,
    });
  } catch (error) {
    console.error('Complete replay session error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to complete replay session',
    });
  }
};

