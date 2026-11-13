import {
  executeOrder,
  getUserOrders,
  getUserTrades,
} from '../services/order_service.js';

export const placeOrder = async (req, res) => {
  try {
    const { symbol, side, quantity, type, limitPrice } = req.body || {};

    const result = await executeOrder({
      userId: req.user.id,
      symbol,
      side,
      quantity,
      type,
      limitPrice,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Order execution error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to execute order',
    });
  }
};

export const listOrders = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getUserOrders({
      userId: req.user.id,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('List orders error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
    });
  }
};

export const listTrades = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getUserTrades({
      userId: req.user.id,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      trades: result.trades,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('List trades error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve trades',
    });
  }
};

