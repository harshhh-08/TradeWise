import prisma from '../config/prisma.js';
import {
  fetchYahooQuote,
  fetchBatchYahooQuotes,
  fetchYahooCandles,
  searchYahoo,
  isYahooSymbol,
  resolveYahooSymbol,
  POPULAR_NSE_STOCKS,
  getBaselineQuote,
} from './providers/yahoo_finance_provider.js';
import {
  fetchTwelveDataQuote,
  fetchTwelveDataCandles,
  fetchTwelveDataStocksList,
  hasTwelveDataKey,
  POPULAR_US_STOCKS,
  getBaselineUSQuote,
} from './providers/twelve_data_provider.js';

const cache = new Map();

function getCached(key, ttlMs) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < ttlMs) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

function selectProvider(symbol) {
  const upper = symbol.toUpperCase().trim();

  if (isYahooSymbol(upper)) {
    return 'yahoo-finance';
  }

  if (hasTwelveDataKey()) {
    return 'twelvedata';
  }

  return 'yahoo-finance';
}

export async function getStockList({ search, page = 1, limit = 20 } = {}) {
  const cacheKey = `stock_list_all`;
  let combinedList = getCached(cacheKey, 60 * 60 * 1000);

  if (!combinedList) {
    const nseList = POPULAR_NSE_STOCKS.map(s => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange,
      currency: s.currency,
      type: s.type,
      price: s.price,
      change: s.change,
      changePercent: s.changePercent,
      volume: s.volume,
      low52: s.low52,
      high52: s.high52,
      sector: 'NSE Equity',
    }));

    let usList = POPULAR_US_STOCKS.map(s => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange,
      currency: s.currency,
      type: s.type,
      price: s.price,
      change: s.change,
      changePercent: s.changePercent,
      volume: s.volume,
      low52: s.low52,
      high52: s.high52,
      sector: 'US Equity',
    }));

    if (hasTwelveDataKey()) {
      try {
        const liveTwelve = await fetchTwelveDataStocksList();
        if (liveTwelve.length > 0) {
          usList = liveTwelve.slice(0, 50).map(s => ({
            ...s,
            sector: 'US Equity',
          }));
        }
      } catch (err) {
        console.warn('Could not fetch dynamic Twelve Data stocks list, using standard list:', err.message);
      }
    }

    combinedList = [...nseList, ...usList];
    setCache(cacheKey, combinedList);
  }

  let filtered = [...combinedList];

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      s =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      try {
        const searchResults = await searchYahoo(search);
        if (searchResults.length > 0) {
          filtered = searchResults;
        }
      } catch (err) {
        console.warn('Dynamic search fallback error:', err.message);
      }
    }
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  const symbolsToQuote = paginated.map(s => s.symbol);
  let enriched = paginated;

  try {
    const quotes = await fetchBatchYahooQuotes(symbolsToQuote);
    const quoteMap = new Map();
    quotes.forEach(q => {
      if (q?.symbol) quoteMap.set(q.symbol.toUpperCase(), q);
    });

    enriched = paginated.map(stock => {
      const q = quoteMap.get(stock.symbol.toUpperCase());
      const fallback = getBaselineQuote(stock.symbol) || getBaselineUSQuote(stock.symbol) || stock;
      const target = q || fallback;

      return {
        ...stock,
        name: target.name || stock.name,
        price: target.price !== undefined && target.price !== null ? target.price : stock.price,
        change: target.change !== undefined && target.change !== null ? target.change : (stock.change ?? 0),
        changePercent: target.changePercent !== undefined && target.changePercent !== null ? target.changePercent : (stock.changePercent ?? 0),
        volume: target.volume !== undefined && target.volume !== null ? target.volume : (stock.volume ?? 0),
        low52: target.low52 ?? stock.low52,
        high52: target.high52 ?? stock.high52,
        currency: target.currency || stock.currency || (stock.symbol.endsWith('.NS') ? 'INR' : 'USD'),
        exchange: target.exchange || stock.exchange || (stock.symbol.endsWith('.NS') ? 'NSE' : 'US'),
        sector: stock.sector || (stock.exchange === 'NSE' || stock.symbol.endsWith('.NS') ? 'NSE Equity' : 'US Equity'),
      };
    });
  } catch (err) {
    console.warn('Batch quote enrichment warning:', err.message);
  }

  return {
    source: 'multiprovider',
    stocks: enriched,
    pagination: { page, limit, total, totalPages },
  };
}

export async function getStockQuote(symbol) {
  if (!symbol) return null;
  const upper = symbol.toUpperCase().trim();
  const provider = selectProvider(upper);

  const cacheKey = `quote_${upper}`;
  const CACHE_TTL = 60 * 1000;
  const cached = getCached(cacheKey, CACHE_TTL);
  if (cached) {
    return cached;
  }

  let quote = null;

  if (provider === 'yahoo-finance') {
    try {
      quote = await fetchYahooQuote(upper);
    } catch (err) {
      console.warn(`Yahoo Finance quote failed for ${upper} (${err.message}), falling back to baseline quote`);
      quote = getBaselineQuote(upper) || getBaselineUSQuote(upper);
      if (!quote) throw err;
    }
  } else {
    try {
      quote = await fetchTwelveDataQuote(upper);
    } catch (err) {
      console.warn(`Twelve Data failed for ${upper} (${err.message}), falling back to Yahoo Finance`);
      try {
        quote = await fetchYahooQuote(upper);
      } catch (yErr) {
        quote = getBaselineUSQuote(upper) || getBaselineQuote(upper);
        if (!quote) throw yErr;
      }
    }
  }

  if (quote) {
    setCache(cacheKey, quote);
  }

  return quote;
}

export async function getStockCandles(
  symbol,
  { startDate, endDate, limit = 30, timeframe = '1D' } = {}
) {
  const upper = symbol.toUpperCase().trim();
  const canonicalSymbol = isYahooSymbol(upper) ? resolveYahooSymbol(upper) : upper;
  const prismaTimeframe = timeframe === '1day' ? '1D' : timeframe;

  const where = {
    symbol: { in: [upper, canonicalSymbol] },
    timeframe: prismaTimeframe,
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  let dbCandles = await prisma.candle.findMany({
    where,
    orderBy: { date: 'asc' },
    take: limit,
  });

  if (dbCandles.length >= limit) {
    return {
      source: 'database',
      symbol: canonicalSymbol,
      candles: formatCandles(dbCandles),
    };
  }

  const provider = selectProvider(upper);
  let providerCandles = [];
  let usedProvider = provider;

  if (provider === 'yahoo-finance') {
    providerCandles = await fetchYahooCandles(canonicalSymbol, {
      startDate,
      endDate,
      timeframe: prismaTimeframe,
      limit,
    });
  } else {
    try {
      providerCandles = await fetchTwelveDataCandles(upper, {
        startDate,
        endDate,
        timeframe: prismaTimeframe,
        limit,
      });
    } catch (err) {
      console.warn(`Twelve Data candles failed for ${upper} (${err.message}), falling back to Yahoo Finance`);
      providerCandles = await fetchYahooCandles(upper, {
        startDate,
        endDate,
        timeframe: prismaTimeframe,
        limit,
      });
      usedProvider = 'yahoo-finance';
    }
  }

  if (!providerCandles || providerCandles.length === 0) {
    return {
      source: usedProvider,
      symbol: canonicalSymbol,
      candles: formatCandles(dbCandles),
    };
  }

  const upsertPromises = providerCandles.map(c =>
    prisma.candle.upsert({
      where: {
        symbol_timeframe_date: {
          symbol: canonicalSymbol,
          timeframe: prismaTimeframe,
          date: c.date,
        },
      },
      update: {
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      },
      create: {
        symbol: canonicalSymbol,
        timeframe: prismaTimeframe,
        date: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      },
    })
  );

  await Promise.all(upsertPromises);

  const finalCandles = await prisma.candle.findMany({
    where: {
      symbol: canonicalSymbol,
      timeframe: prismaTimeframe,
      ...(startDate || endDate ? where.date ? { date: where.date } : {} : {}),
    },
    orderBy: { date: 'asc' },
    take: limit,
  });

  return {
    source: usedProvider,
    symbol: canonicalSymbol,
    candles: formatCandles(finalCandles),
  };
}

function formatCandles(candles) {
  return candles.map(c => ({
    date: c.date.toISOString(),
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close),
    volume: Number(c.volume),
  }));
}

