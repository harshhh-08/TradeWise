import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import { resolveYahooSymbol, isYahooSymbol } from './providers/yahoo_finance_provider.js';
import { getStockCandles } from './stock_service.js';

export function calculateSMA(values, period) {
  const result = new Array(values.length).fill(null);
  if (!values || values.length < period || period <= 0) {
    return result;
  }

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  result[period - 1] = sum / period;

  for (let i = period; i < values.length; i++) {
    sum = sum - values[i - period] + values[i];
    result[i] = sum / period;
  }

  return result;
}

export async function runBacktest({
  userId,
  symbol,
  timeframe = '1D',
  startDate,
  endDate,
  strategy,
  initialCapital = 100000,
}) {
  if (!symbol || typeof symbol !== 'string') {
    const err = new Error('Stock symbol is required');
    err.statusCode = 400;
    throw err;
  }

  const upper = symbol.trim().toUpperCase();
  if (!isYahooSymbol(upper)) {
    const err = new Error('Invalid stock symbol. Only Indian NSE stocks in INR are supported for backtesting.');
    err.statusCode = 400;
    throw err;
  }

  const canonicalSymbol = resolveYahooSymbol(upper);

  const normalizedTf = timeframe.trim().toUpperCase();
  if (normalizedTf !== '1D' && normalizedTf !== '1DAY') {
    const err = new Error(`Unsupported timeframe '${timeframe}'. Supported timeframe for backtesting is '1D'.`);
    err.statusCode = 400;
    throw err;
  }

  if (!startDate || !endDate) {
    const err = new Error('startDate and endDate are required');
    err.statusCode = 400;
    throw err;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const err = new Error('Invalid date format. Use YYYY-MM-DD or ISO 8601.');
    err.statusCode = 400;
    throw err;
  }

  if (start > end) {
    const err = new Error('startDate cannot be later than endDate');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  if (start > now || end > now) {
    const err = new Error('Backtest dates cannot be in the future');
    err.statusCode = 400;
    throw err;
  }

  const stratType = String(strategy?.type || 'SMA_CROSSOVER').toUpperCase().trim();
  if (stratType !== 'SMA_CROSSOVER') {
    const err = new Error(`Unsupported strategy type '${strategy?.type}'. Supported strategy: 'SMA_CROSSOVER'.`);
    err.statusCode = 400;
    throw err;
  }

  const fastPeriod = parseInt(strategy?.fastPeriod, 10);
  const slowPeriod = parseInt(strategy?.slowPeriod, 10);

  if (isNaN(fastPeriod) || fastPeriod < 2) {
    const err = new Error('fastPeriod must be an integer greater than or equal to 2');
    err.statusCode = 400;
    throw err;
  }

  if (isNaN(slowPeriod) || slowPeriod <= fastPeriod) {
    const err = new Error('slowPeriod must be greater than fastPeriod');
    err.statusCode = 400;
    throw err;
  }

  const cap = Number(initialCapital);
  if (isNaN(cap) || cap <= 0) {
    const err = new Error('initialCapital must be a positive number');
    err.statusCode = 400;
    throw err;
  }

  let candles = await prisma.candle.findMany({
    where: {
      symbol: canonicalSymbol,
      timeframe: '1D',
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: 'asc' },
  });

  if (candles.length < slowPeriod + 2) {
    try {
      await getStockCandles(canonicalSymbol, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        limit: 1000,
        timeframe: '1D',
      });

      candles = await prisma.candle.findMany({
        where: {
          symbol: canonicalSymbol,
          timeframe: '1D',
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { date: 'asc' },
      });
    } catch (e) {
      const err = new Error(`Failed to retrieve candle data: ${e.message}`);
      err.statusCode = 502;
      throw err;
    }
  }

  if (candles.length === 0) {
    const err = new Error(`No historical candles available for ${canonicalSymbol} in the selected date range`);
    err.statusCode = 404;
    throw err;
  }

  if (candles.length < slowPeriod + 2) {
    const err = new Error(
      `Insufficient historical candles (${candles.length} available) for slowPeriod (${slowPeriod}). A wider date range is required.`
    );
    err.statusCode = 400;
    throw err;
  }

  const closePrices = candles.map((c) => Number(c.close));
  const openPrices = candles.map((c) => Number(c.open));
  const dates = candles.map((c) => c.date.toISOString());

  const fastSMA = calculateSMA(closePrices, fastPeriod);
  const slowSMA = calculateSMA(closePrices, slowPeriod);

  let cash = cap;
  let position = null;
  const trades = [];
  const equityCurve = [];
  let peak = cap;
  let maxDrawdownPercent = 0;
  let pendingSignal = null;

  for (let i = 0; i < candles.length; i++) {
    const openPrice = openPrices[i];
    const closePrice = closePrices[i];
    const dateStr = dates[i];

    if (pendingSignal === 'BUY' && position === null) {
      const qty = Math.floor(cash / openPrice);
      if (qty > 0) {
        const cost = qty * openPrice;
        cash -= cost;
        position = {
          entryIndex: i,
          entryDate: dateStr,
          entryPrice: openPrice,
          quantity: qty,
        };
      }
      pendingSignal = null;
    } else if (pendingSignal === 'SELL' && position !== null) {
      const proceeds = position.quantity * openPrice;
      const pnl = proceeds - position.quantity * position.entryPrice;
      const returnPercent = ((openPrice - position.entryPrice) / position.entryPrice) * 100;
      cash += proceeds;
      trades.push({
        tradeNumber: trades.length + 1,
        entryDate: position.entryDate,
        entryPrice: Number(position.entryPrice.toFixed(2)),
        exitDate: dateStr,
        exitPrice: Number(openPrice.toFixed(2)),
        quantity: position.quantity,
        pnl: Number(pnl.toFixed(2)),
        returnPercent: Number(returnPercent.toFixed(2)),
      });
      position = null;
      pendingSignal = null;
    } else {
      pendingSignal = null;
    }

    const posValue = position ? position.quantity * closePrice : 0;
    const currentPortfolioVal = cash + posValue;

    if (currentPortfolioVal > peak) {
      peak = currentPortfolioVal;
    }
    const currentDrawdown = peak > 0 ? ((peak - currentPortfolioVal) / peak) * 100 : 0;
    if (currentDrawdown > maxDrawdownPercent) {
      maxDrawdownPercent = currentDrawdown;
    }

    equityCurve.push({
      date: dateStr,
      portfolioValue: Number(currentPortfolioVal.toFixed(2)),
      cash: Number(cash.toFixed(2)),
      positionValue: Number(posValue.toFixed(2)),
    });

    if (i >= slowPeriod) {
      const prevFast = fastSMA[i - 1];
      const prevSlow = slowSMA[i - 1];
      const currFast = fastSMA[i];
      const currSlow = slowSMA[i];

      if (prevFast !== null && prevSlow !== null && currFast !== null && currSlow !== null) {
        if (prevFast <= prevSlow && currFast > currSlow) {
          if (position === null) {
            pendingSignal = 'BUY';
          }
        } else if (prevFast >= prevSlow && currFast < currSlow) {
          if (position !== null) {
            pendingSignal = 'SELL';
          }
        }
      }
    }
  }

  const lastCandleClose = closePrices[closePrices.length - 1];
  const finalVal = position ? cash + position.quantity * lastCandleClose : cash;
  const totalPnl = finalVal - cap;
  const totalReturnPct = (totalPnl / cap) * 100;

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(2)) : 0;

  const firstOpen = openPrices[0];
  const buyAndHoldReturnPercent =
    firstOpen > 0 ? Number((((lastCandleClose - firstOpen) / firstOpen) * 100).toFixed(2)) : 0;

  const metrics = {
    initialCapital: Number(cap.toFixed(2)),
    finalPortfolioValue: Number(finalVal.toFixed(2)),
    totalPnl: Number(totalPnl.toFixed(2)),
    totalReturnPercent: Number(totalReturnPct.toFixed(2)),
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(2)),
    buyAndHoldReturnPercent,
    unrealizedPosition: position
      ? {
          entryDate: position.entryDate,
          entryPrice: Number(position.entryPrice.toFixed(2)),
          quantity: position.quantity,
          currentPrice: Number(lastCandleClose.toFixed(2)),
          unrealizedPnl: Number((position.quantity * (lastCandleClose - position.entryPrice)).toFixed(2)),
        }
      : null,
  };

  const backtestRun = await prisma.backtestRun.create({
    data: {
      userId,
      symbol: canonicalSymbol,
      timeframe: '1D',
      startDate: start,
      endDate: end,
      strategyType: stratType,
      strategyConfig: { fastPeriod, slowPeriod },
      initialCapital: new Prisma.Decimal(cap.toFixed(2)),
      finalCapital: new Prisma.Decimal(finalVal.toFixed(2)),
      totalPnl: new Prisma.Decimal(totalPnl.toFixed(2)),
      totalReturn: new Prisma.Decimal(totalReturnPct.toFixed(4)),
      metrics,
      trades,
      equityCurve,
    },
  });

  return {
    id: backtestRun.id,
    symbol: backtestRun.symbol,
    timeframe: backtestRun.timeframe,
    startDate: backtestRun.startDate.toISOString(),
    endDate: backtestRun.endDate.toISOString(),
    strategy: {
      type: backtestRun.strategyType,
      fastPeriod,
      slowPeriod,
    },
    metrics,
    trades,
    equityCurve,
    createdAt: backtestRun.createdAt.toISOString(),
  };
}

export async function getUserBacktests({ userId, page = 1, limit = 10 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  const [total, runs] = await Promise.all([
    prisma.backtestRun.count({ where: { userId } }),
    prisma.backtestRun.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: l,
      select: {
        id: true,
        symbol: true,
        timeframe: true,
        startDate: true,
        endDate: true,
        strategyType: true,
        strategyConfig: true,
        initialCapital: true,
        finalCapital: true,
        totalPnl: true,
        totalReturn: true,
        metrics: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    backtests: runs.map((r) => ({
      id: r.id,
      symbol: r.symbol,
      timeframe: r.timeframe,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
      strategyType: r.strategyType,
      strategyConfig: r.strategyConfig,
      initialCapital: Number(r.initialCapital),
      finalCapital: Number(r.finalCapital),
      totalPnl: Number(r.totalPnl),
      totalReturnPercent: Number(r.totalReturn),
      metrics: r.metrics,
      createdAt: r.createdAt.toISOString(),
    })),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

export async function getBacktestById({ userId, backtestId }) {
  const id = parseInt(backtestId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid backtest ID');
    err.statusCode = 400;
    throw err;
  }

  const run = await prisma.backtestRun.findUnique({
    where: { id },
  });

  if (!run || run.userId !== userId) {
    const err = new Error(`Backtest with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  return {
    id: run.id,
    symbol: run.symbol,
    timeframe: run.timeframe,
    startDate: run.startDate.toISOString(),
    endDate: run.endDate.toISOString(),
    strategyType: run.strategyType,
    strategyConfig: run.strategyConfig,
    initialCapital: Number(run.initialCapital),
    finalCapital: Number(run.finalCapital),
    totalPnl: Number(run.totalPnl),
    totalReturnPercent: Number(run.totalReturn),
    metrics: run.metrics,
    trades: run.trades,
    equityCurve: run.equityCurve,
    createdAt: run.createdAt.toISOString(),
  };
}

export async function deleteBacktest({ userId, backtestId }) {
  const id = parseInt(backtestId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid backtest ID');
    err.statusCode = 400;
    throw err;
  }

  const run = await prisma.backtestRun.findUnique({
    where: { id },
  });

  if (!run || run.userId !== userId) {
    const err = new Error(`Backtest with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  await prisma.backtestRun.delete({
    where: { id },
  });

  return {
    id,
    deleted: true,
  };
}
