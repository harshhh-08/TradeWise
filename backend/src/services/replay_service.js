import prisma from '../config/prisma.js';
import { resolveYahooSymbol, isYahooSymbol } from './providers/yahoo_finance_provider.js';
import { getStockCandles } from './stock_service.js';

function formatCandle(c) {
  if (!c) return null;
  return {
    timestamp: c.date instanceof Date ? c.date.toISOString() : new Date(c.date).toISOString(),
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close),
    volume: Number(c.volume),
  };
}

function normalizeTimeframe(tf) {
  if (!tf || typeof tf !== 'string') return '1D';
  const upper = tf.trim().toUpperCase();
  if (upper === '1D' || upper === '1DAY') return '1D';
  return null;
}

export async function createReplaySession({ userId, symbol, timeframe = '1d', startDate, endDate }) {
  if (!symbol || typeof symbol !== 'string') {
    const err = new Error('Stock symbol is required');
    err.statusCode = 400;
    throw err;
  }

  const upper = symbol.trim().toUpperCase();
  if (!isYahooSymbol(upper)) {
    const err = new Error('Invalid stock symbol. Only Indian NSE stocks are supported for historical market replay.');
    err.statusCode = 400;
    throw err;
  }

  const canonicalSymbol = resolveYahooSymbol(upper);

  const normalizedTf = normalizeTimeframe(timeframe);
  if (!normalizedTf) {
    const err = new Error(`Unsupported timeframe '${timeframe}'. Supported timeframe for replay is '1d'.`);
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
    const err = new Error('Replay dates cannot be in the future');
    err.statusCode = 400;
    throw err;
  }

  let candles = await prisma.candle.findMany({
    where: {
      symbol: canonicalSymbol,
      timeframe: normalizedTf,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: 'asc' },
  });

  if (candles.length === 0) {
    try {
      await getStockCandles(canonicalSymbol, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        limit: 1000,
        timeframe: normalizedTf,
      });

      candles = await prisma.candle.findMany({
        where: {
          symbol: canonicalSymbol,
          timeframe: normalizedTf,
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

  const session = await prisma.replaySession.create({
    data: {
      userId,
      symbol: canonicalSymbol,
      timeframe: normalizedTf,
      startDate: start,
      endDate: end,
      currentDate: candles[0].date,
      currentIndex: 0,
      totalCandles: candles.length,
      status: 'INITIALIZED',
    },
  });

  return {
    id: session.id,
    symbol: session.symbol,
    timeframe: session.timeframe,
    startDate: session.startDate.toISOString(),
    endDate: session.endDate.toISOString(),
    currentDate: session.currentDate.toISOString(),
    currentIndex: session.currentIndex,
    totalCandles: session.totalCandles,
    status: session.status,
    createdAt: session.createdAt.toISOString(),
  };
}

export async function getUserReplaySessions({ userId, page = 1, limit = 10 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  const [total, sessions] = await Promise.all([
    prisma.replaySession.count({ where: { userId } }),
    prisma.replaySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: l,
    }),
  ]);

  return {
    sessions: sessions.map((s) => ({
      id: s.id,
      symbol: s.symbol,
      timeframe: s.timeframe,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      currentDate: s.currentDate.toISOString(),
      currentIndex: s.currentIndex,
      totalCandles: s.totalCandles,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    })),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

export async function getReplaySessionById({ userId, sessionId }) {
  const id = parseInt(sessionId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const session = await prisma.replaySession.findUnique({
    where: { id },
  });

  if (!session || session.userId !== userId) {
    const err = new Error(`Replay session with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  let currentCandle = null;
  if (session.currentIndex > 0) {
    const c = await prisma.candle.findFirst({
      where: {
        symbol: session.symbol,
        timeframe: session.timeframe,
        date: session.currentDate,
      },
    });
    currentCandle = formatCandle(c);
  }

  return {
    id: session.id,
    symbol: session.symbol,
    timeframe: session.timeframe,
    startDate: session.startDate.toISOString(),
    endDate: session.endDate.toISOString(),
    currentDate: session.currentDate.toISOString(),
    currentIndex: session.currentIndex,
    totalCandles: session.totalCandles,
    status: session.status,
    currentCandle,
    createdAt: session.createdAt.toISOString(),
  };
}

export async function startReplaySession({ userId, sessionId }) {
  const id = parseInt(sessionId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const session = await prisma.replaySession.findUnique({
    where: { id },
  });

  if (!session || session.userId !== userId) {
    const err = new Error(`Replay session with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  if (session.status === 'COMPLETED') {
    const err = new Error('Cannot start a completed replay session');
    err.statusCode = 409;
    throw err;
  }

  if (session.status === 'RUNNING') {
    return {
      id: session.id,
      status: session.status,
      currentIndex: session.currentIndex,
      currentDate: session.currentDate.toISOString(),
      totalCandles: session.totalCandles,
      message: 'Replay session is already running',
    };
  }

  let nextIndex = session.currentIndex;
  let nextDate = session.currentDate;

  if (session.currentIndex === 0) {
    const firstCandle = await prisma.candle.findFirst({
      where: {
        symbol: session.symbol,
        timeframe: session.timeframe,
        date: {
          gte: session.startDate,
          lte: session.endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    if (firstCandle) {
      nextIndex = 1;
      nextDate = firstCandle.date;
    }
  }

  const updated = await prisma.replaySession.update({
    where: { id },
    data: {
      status: 'RUNNING',
      currentIndex: nextIndex,
      currentDate: nextDate,
    },
  });

  let candle = null;
  if (updated.currentIndex > 0) {
    const c = await prisma.candle.findFirst({
      where: {
        symbol: updated.symbol,
        timeframe: updated.timeframe,
        date: updated.currentDate,
      },
    });
    candle = formatCandle(c);
  }

  return {
    id: updated.id,
    symbol: updated.symbol,
    timeframe: updated.timeframe,
    status: updated.status,
    currentIndex: updated.currentIndex,
    currentDate: updated.currentDate.toISOString(),
    totalCandles: updated.totalCandles,
    candle,
  };
}

export async function advanceReplaySession({ userId, sessionId }) {
  const id = parseInt(sessionId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  return await prisma.$transaction(async (tx) => {
    const lockedRows = await tx.$queryRaw`
      SELECT id, "userId", symbol, timeframe, "startDate", "endDate", "currentDate", "currentIndex", "totalCandles", status
      FROM "ReplaySession"
      WHERE id = ${id}
      FOR UPDATE
    `;

    if (!lockedRows || lockedRows.length === 0) {
      const err = new Error(`Replay session with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    const session = lockedRows[0];
    if (session.userId !== userId) {
      const err = new Error(`Replay session with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    if (session.status === 'COMPLETED') {
      const err = new Error('Cannot advance a completed replay session');
      err.statusCode = 409;
      throw err;
    }

    if (session.currentIndex >= session.totalCandles) {
      await tx.replaySession.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
      const err = new Error('Replay has reached the end of available historical data');
      err.statusCode = 409;
      throw err;
    }

    const targetIndex = session.currentIndex + 1;
    const skipCount = targetIndex - 1;

    const nextCandle = await tx.candle.findFirst({
      where: {
        symbol: session.symbol,
        timeframe: session.timeframe,
        date: {
          gte: session.startDate,
          lte: session.endDate,
        },
      },
      orderBy: { date: 'asc' },
      skip: skipCount,
    });

    if (!nextCandle) {
      await tx.replaySession.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
      const err = new Error('No more historical candles available');
      err.statusCode = 409;
      throw err;
    }

    const isLast = targetIndex >= session.totalCandles;
    const newStatus = isLast ? 'COMPLETED' : 'RUNNING';

    const updated = await tx.replaySession.update({
      where: { id },
      data: {
        currentIndex: targetIndex,
        currentDate: nextCandle.date,
        status: newStatus,
      },
    });

    return {
      success: true,
      candle: formatCandle(nextCandle),
      replay: {
        sessionId: updated.id,
        currentIndex: updated.currentIndex,
        totalCandles: updated.totalCandles,
        status: updated.status,
        hasNext: !isLast,
      },
    };
  });
}

export async function pauseReplaySession({ userId, sessionId }) {
  const id = parseInt(sessionId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const session = await prisma.replaySession.findUnique({
    where: { id },
  });

  if (!session || session.userId !== userId) {
    const err = new Error(`Replay session with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  if (session.status === 'COMPLETED') {
    const err = new Error('Cannot pause a completed replay session');
    err.statusCode = 409;
    throw err;
  }

  const updated = await prisma.replaySession.update({
    where: { id },
    data: { status: 'PAUSED' },
  });

  return {
    id: updated.id,
    status: updated.status,
    currentIndex: updated.currentIndex,
    currentDate: updated.currentDate.toISOString(),
    totalCandles: updated.totalCandles,
  };
}

export async function getReplayAvailableCandles({ userId, sessionId, limit = 100 }) {
  const id = parseInt(sessionId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const session = await prisma.replaySession.findUnique({
    where: { id },
  });

  if (!session || session.userId !== userId) {
    const err = new Error(`Replay session with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  if (session.currentIndex === 0) {
    return {
      sessionId: session.id,
      symbol: session.symbol,
      revealedCount: 0,
      currentIndex: 0,
      totalCandles: session.totalCandles,
      candles: [],
    };
  }

  const l = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));

  const candles = await prisma.candle.findMany({
    where: {
      symbol: session.symbol,
      timeframe: session.timeframe,
      date: {
        gte: session.startDate,
        lte: session.currentDate,
      },
    },
    orderBy: { date: 'asc' },
    take: l,
  });

  return {
    sessionId: session.id,
    symbol: session.symbol,
    revealedCount: candles.length,
    currentIndex: session.currentIndex,
    totalCandles: session.totalCandles,
    candles: candles.map(formatCandle),
  };
}

export async function completeReplaySession({ userId, sessionId }) {
  const id = parseInt(sessionId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid session ID');
    err.statusCode = 400;
    throw err;
  }

  const session = await prisma.replaySession.findUnique({
    where: { id },
  });

  if (!session || session.userId !== userId) {
    const err = new Error(`Replay session with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  const updated = await prisma.replaySession.update({
    where: { id },
    data: { status: 'COMPLETED' },
  });

  return {
    sessionId: updated.id,
    status: updated.status,
    currentIndex: updated.currentIndex,
    totalCandles: updated.totalCandles,
  };
}

