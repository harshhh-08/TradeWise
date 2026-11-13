import {
  runBacktest,
  getUserBacktests,
  getBacktestById,
  deleteBacktest,
} from '../services/backtest_service.js';

export const createBacktest = async (req, res) => {
  try {
    const { symbol, timeframe, startDate, endDate, strategy, initialCapital } = req.body || {};
    const result = await runBacktest({
      userId: req.user.id,
      symbol,
      timeframe,
      startDate,
      endDate,
      strategy,
      initialCapital,
    });
    return res.status(201).json({
      success: true,
      backtest: result,
    });
  } catch (error) {
    console.error('Run backtest error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to execute backtest',
    });
  }
};

export const listBacktests = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getUserBacktests({
      userId: req.user.id,
      page,
      limit,
    });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List backtests error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve backtests',
    });
  }
};

export const getBacktest = async (req, res) => {
  try {
    const { backtestId } = req.params;
    const result = await getBacktestById({
      userId: req.user.id,
      backtestId,
    });
    return res.status(200).json({
      success: true,
      backtest: result,
    });
  } catch (error) {
    console.error('Get backtest error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve backtest',
    });
  }
};

export const removeBacktest = async (req, res) => {
  try {
    const { backtestId } = req.params;
    const result = await deleteBacktest({
      userId: req.user.id,
      backtestId,
    });
    return res.status(200).json({
      success: true,
      message: 'Backtest deleted successfully',
      ...result,
    });
  } catch (error) {
    console.error('Delete backtest error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete backtest',
    });
  }
};
