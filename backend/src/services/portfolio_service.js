import prisma from '../config/prisma.js';
import { getStockQuote } from './stock_service.js';

export async function getUserPortfolio(userId) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    const err = new Error('User wallet not found');
    err.statusCode = 404;
    throw err;
  }

  const [positions, sellTrades] = await Promise.all([
    prisma.position.findMany({
      where: {
        userId,
        replaySessionId: null,
        quantity: { gt: 0 },
      },
      orderBy: { symbol: 'asc' },
    }),
    prisma.trade.findMany({
      where: {
        userId,
        replaySessionId: null,
        side: 'SELL',
      },
      select: { realizedPnl: true },
    }),
  ]);

  const totalRealizedPnl = sellTrades.reduce((acc, t) => {
    return acc + (t.realizedPnl ? Number(t.realizedPnl) : 0);
  }, 0);

  const availableCash = Number(wallet.cash);

  const holdings = await Promise.all(
    positions.map(async (pos) => {
      const quantity = pos.quantity;
      const avgCost = Number(pos.avgCost);
      const investedValue = quantity * avgCost;

      let currentPrice = null;
      let currency = 'INR';
      let name = pos.symbol;

      try {
        const quote = await getStockQuote(pos.symbol);
        if (quote && quote.price && !isNaN(quote.price)) {
          currentPrice = Number(quote.price);
          currency = quote.currency || currency;
          name = quote.name || name;
        }
      } catch (err) {
        console.warn(`Could not refresh price for ${pos.symbol}:`, err.message);
      }

      const effectiveMarketPrice = currentPrice !== null ? currentPrice : avgCost;
      const currentMarketValue = quantity * effectiveMarketPrice;
      const unrealizedPnl = currentPrice !== null ? currentMarketValue - investedValue : 0;
      const unrealizedPnlPercent =
        investedValue > 0 && currentPrice !== null ? (unrealizedPnl / investedValue) * 100 : 0;

      return {
        id: pos.id,
        symbol: pos.symbol,
        name,
        currency,
        quantity,
        avgCost: Number(avgCost.toFixed(4)),
        investedValue: Number(investedValue.toFixed(2)),
        currentPrice: currentPrice !== null ? Number(currentPrice.toFixed(4)) : null,
        currentMarketValue: Number(currentMarketValue.toFixed(2)),
        unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
        unrealizedPnlPercent: Number(unrealizedPnlPercent.toFixed(2)),
        isPriceLive: currentPrice !== null,
      };
    })
  );

  const inrHoldings = holdings.filter((h) => (h.currency || 'INR') === 'INR');
  const totalInvestedValue = inrHoldings.reduce((sum, h) => sum + h.investedValue, 0);
  const totalStockValue = inrHoldings.reduce((sum, h) => sum + h.currentMarketValue, 0);
  const totalPortfolioValue = availableCash + totalStockValue;
  const totalUnrealizedPnl = totalStockValue - totalInvestedValue;
  const totalUnrealizedPnlPercent =
    totalInvestedValue > 0 ? (totalUnrealizedPnl / totalInvestedValue) * 100 : 0;

  return {
    success: true,
    portfolio: {
      currency: 'INR',
      availableCash: Number(availableCash.toFixed(2)),
      totalInvestedValue: Number(totalInvestedValue.toFixed(2)),
      totalStockValue: Number(totalStockValue.toFixed(2)),
      totalPortfolioValue: Number(totalPortfolioValue.toFixed(2)),
      totalUnrealizedPnl: Number(totalUnrealizedPnl.toFixed(2)),
      totalUnrealizedPnlPercent: Number(totalUnrealizedPnlPercent.toFixed(2)),
      totalRealizedPnl: Number(totalRealizedPnl.toFixed(2)),
      holdingsCount: holdings.length,
      holdings,
    },
  };
}
