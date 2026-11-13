import { getUserPortfolio } from '../services/portfolio_service.js';

export const getPortfolio = async (req, res) => {
  try {
    const result = await getUserPortfolio(req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Portfolio error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to retrieve portfolio',
    });
  }
};

