import {
  getStockList,
  getStockQuote,
  getStockCandles,
} from '../services/stock_service.js';

export const listStocks = async (req, res) => {
  try {
    const search = req.query.search || req.query.q || '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const result = await getStockList({ search, page, limit });

    return res.status(200).json({
      success: true,
      source: result.source,
      stocks: result.stocks,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Stock list error:', error.message);
    return res.status(502).json({
      success: false,
      message: 'Failed to fetch stock list',
      detail: error.message,
    });
  }
};

export const stockDetails = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol is required',
      });
    }

    const quote = await getStockQuote(symbol);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: `Stock symbol '${symbol.toUpperCase()}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      stock: quote,
    });
  } catch (error) {
    console.error('Stock details error:', error.message);

    if (
      error.statusCode === 404 ||
      error.apiCode === 404 ||
      error.apiCode === 400 ||
      error.message?.toLowerCase().includes('not found') ||
      error.message?.toLowerCase().includes('not available') ||
      error.message?.toLowerCase().includes('symbol is available')
    ) {
      return res.status(404).json({
        success: false,
        message: `Stock symbol '${req.params.symbol?.toUpperCase()}' not found`,
      });
    }

    return res.status(502).json({
      success: false,
      message: 'Failed to fetch stock details',
      detail: error.message,
    });
  }
};

export const stockCandles = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol is required',
      });
    }

    const {
      start_date: startDate,
      end_date: endDate,
      limit: rawLimit,
      timeframe,
    } = req.query;

    const limit = Math.min(5000, Math.max(1, parseInt(rawLimit, 10) || 30));

    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start_date format. Use YYYY-MM-DD.',
      });
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end_date format. Use YYYY-MM-DD.',
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'start_date must be before end_date',
      });
    }

    const validTimeframes = [
      '1min', '5min', '15min', '30min',
      '1h', '4h', '1day', '1D', '1week', '1month',
    ];
    if (timeframe && !validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: `Invalid timeframe. Valid values: ${validTimeframes.join(', ')}`,
      });
    }

    const result = await getStockCandles(symbol, {
      startDate,
      endDate,
      limit,
      timeframe: timeframe || '1day',
    });

    return res.status(200).json({
      success: true,
      source: result.source,
      symbol: symbol.toUpperCase(),
      count: result.candles.length,
      candles: result.candles,
    });
  } catch (error) {
    console.error('Stock candles error:', error.message);

    if (
      error.statusCode === 404 ||
      error.apiCode === 404 ||
      error.message?.toLowerCase().includes('not found') ||
      error.message?.toLowerCase().includes('not available')
    ) {
      return res.status(404).json({
        success: false,
        message: `Stock symbol '${req.params.symbol?.toUpperCase()}' not found`,
      });
    }

    return res.status(502).json({
      success: false,
      message: 'Failed to fetch candle data',
      detail: error.message,
    });
  }
};

