import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical'],
});

export const POPULAR_NSE_STOCKS = [
  { symbol: 'RELIANCE.NS', baseSymbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 1377.50, change: 1.90, changePercent: 0.14, volume: 13167730, low52: 1152.20, high52: 1611.80, previousClose: 1375.60 },
  { symbol: 'TCS.NS', baseSymbol: 'TCS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 2376.20, change: 33.50, changePercent: 1.43, volume: 3344243, low52: 1976.80, high52: 3350.00, previousClose: 2342.70 },
  { symbol: 'INFY.NS', baseSymbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 1098.00, change: 6.10, changePercent: 0.56, volume: 5933093, low52: 980.40, high52: 1728.00, previousClose: 1091.90 },
  { symbol: 'HDFCBANK.NS', baseSymbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 846.00, change: 24.20, changePercent: 2.95, volume: 23437045, low52: 669.20, high52: 1017.50, previousClose: 821.80 },
  { symbol: 'ICICIBANK.NS', baseSymbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 1640.00, change: 31.10, changePercent: 1.93, volume: 11438417, low52: 1187.60, high52: 1645.00, previousClose: 1608.90 },
  { symbol: 'SBIN.NS', baseSymbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 1165.10, change: 9.10, changePercent: 0.79, volume: 18920000, low52: 598.00, high52: 1180.00, previousClose: 1156.00 },
  { symbol: 'BHARTIARTL.NS', baseSymbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 2161.70, change: 17.70, changePercent: 0.83, volume: 7850000, low52: 1100.00, high52: 2200.00, previousClose: 2144.00 },
  { symbol: 'ITC.NS', baseSymbol: 'ITC', name: 'ITC Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 299.10, change: -1.90, changePercent: -0.63, volume: 14500000, low52: 280.00, high52: 528.00, previousClose: 301.00 },
  { symbol: 'KOTAKBANK.NS', baseSymbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 515.80, change: 12.80, changePercent: 2.55, volume: 4200000, low52: 450.00, high52: 600.00, previousClose: 503.00 },
  { symbol: 'LT.NS', baseSymbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock', price: 4209.10, change: -1.90, changePercent: -0.05, volume: 2100000, low52: 3200.00, high52: 4300.00, previousClose: 4211.00 },
];

export function getBaselineQuote(symbol) {
  if (!symbol) return null;
  const upper = symbol.trim().toUpperCase();
  const match = POPULAR_NSE_STOCKS.find(s => s.symbol.toUpperCase() === upper || s.baseSymbol.toUpperCase() === upper);
  if (!match) return null;

  return {
    source: 'baseline-reference',
    symbol: match.symbol,
    name: match.name,
    exchange: match.exchange,
    currency: match.currency,
    price: match.price,
    open: match.price,
    high: match.high52 ? Math.min(Number((match.price * 1.01).toFixed(2)), match.high52) : match.price,
    low: match.low52 ? Math.max(Number((match.price * 0.99).toFixed(2)), match.low52) : match.price,
    low52: match.low52,
    high52: match.high52,
    previousClose: match.previousClose || match.price,
    change: match.change || 0,
    changePercent: match.changePercent || 0,
    volume: match.volume || 10000000,
    timestamp: new Date().toISOString(),
  };
}

export function resolveYahooSymbol(symbol) {
  if (!symbol) return '';
  const upper = symbol.trim().toUpperCase();

  if (upper.endsWith('.NS') || upper.endsWith('.BO')) {
    return upper;
  }

  const match = POPULAR_NSE_STOCKS.find(s => s.baseSymbol === upper);
  if (match) {
    return match.symbol;
  }

  return upper;
}

export function isYahooSymbol(symbol) {
  if (!symbol) return false;
  const upper = symbol.trim().toUpperCase();
  if (upper.endsWith('.NS') || upper.endsWith('.BO')) return true;
  return POPULAR_NSE_STOCKS.some(s => s.baseSymbol === upper);
}

export async function fetchQuoteFromChart(symbol) {
  const resolved = resolveYahooSymbol(symbol);
  try {
    const period1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const res = await yf.chart(resolved, { period1, interval: '1d' });
    const meta = res?.meta;
    if (!meta || meta.regularMarketPrice === undefined || isNaN(Number(meta.regularMarketPrice))) {
      return null;
    }

    const price = Number(meta.regularMarketPrice);
    const previousClose = meta.chartPreviousClose !== undefined
      ? Number(meta.chartPreviousClose)
      : (meta.previousClose !== undefined ? Number(meta.previousClose) : price);
    const change = meta.fulldayChange !== undefined
      ? Number(meta.fulldayChange)
      : Number((price - previousClose).toFixed(4));
    const changePercent = meta.regularMarketChangePercent !== undefined
      ? Number(meta.regularMarketChangePercent)
      : (previousClose !== 0 ? Number(((change / previousClose) * 100).toFixed(4)) : 0);

    const isNSE = resolved.endsWith('.NS') || resolved.endsWith('.BO');
    return {
      source: 'yahoo-finance',
      symbol: meta.symbol || resolved,
      name: meta.longName || meta.shortName || meta.symbol || resolved,
      exchange: meta.fullExchangeName || meta.exchangeName || (isNSE ? 'NSE' : 'US'),
      currency: meta.currency || (isNSE ? 'INR' : 'USD'),
      price,
      open: meta.regularMarketDayLow !== undefined ? Number(meta.regularMarketDayLow) : price,
      high: meta.regularMarketDayHigh !== undefined ? Number(meta.regularMarketDayHigh) : price,
      low: meta.regularMarketDayLow !== undefined ? Number(meta.regularMarketDayLow) : price,
      low52: meta.fiftyTwoWeekLow !== undefined ? Number(meta.fiftyTwoWeekLow) : null,
      high52: meta.fiftyTwoWeekHigh !== undefined ? Number(meta.fiftyTwoWeekHigh) : null,
      previousClose,
      change,
      changePercent,
      volume: meta.regularMarketVolume !== undefined ? Number(meta.regularMarketVolume) : 0,
      timestamp: meta.regularMarketTime
        ? new Date(meta.regularMarketTime).toISOString()
        : new Date().toISOString(),
    };
  } catch (_) {
    return null;
  }
}

export async function fetchBatchYahooQuotes(symbols) {
  if (!symbols || symbols.length === 0) return [];
  const resolved = symbols.map(s => resolveYahooSymbol(s));

  // Use chart endpoint in parallel (bypasses crumb requirements and 429 rate limits)
  const chartResults = await Promise.allSettled(
    resolved.map(s => fetchQuoteFromChart(s))
  );

  const quotes = [];
  for (let i = 0; i < resolved.length; i++) {
    const sym = resolved[i];
    const outcome = chartResults[i];
    if (outcome.status === 'fulfilled' && outcome.value && outcome.value.price > 0) {
      quotes.push(outcome.value);
    } else {
      const fallback = getBaselineQuote(sym);
      if (fallback) {
        quotes.push(fallback);
      }
    }
  }

  return quotes;
}

export async function fetchYahooQuote(symbol) {
  const resolved = resolveYahooSymbol(symbol);

  // 1. Try chart endpoint (does not require crumb, bypasses cloud IP rate-limit blocks)
  try {
    const chartQuote = await fetchQuoteFromChart(resolved);
    if (chartQuote && chartQuote.price > 0) {
      return chartQuote;
    }
  } catch (_) {
    // Continue to standard quote fallback
  }

  // 2. Try standard yf.quote
  let rawQuote;
  try {
    rawQuote = await yf.quote(resolved);
  } catch (err) {
    const fallback = getBaselineQuote(resolved);
    if (fallback) {
      return fallback;
    }
    const error = new Error(`Yahoo Finance quote error for ${resolved}: ${err.message}`);
    error.statusCode = err.message?.includes('Not Found') || err.message?.includes('404') ? 404 : 502;
    throw error;
  }

  if (!rawQuote || rawQuote.regularMarketPrice === undefined) {
    const fallback = getBaselineQuote(resolved);
    if (fallback) {
      return fallback;
    }
    const error = new Error(`Stock symbol '${symbol.toUpperCase()}' not found on Yahoo Finance`);
    error.statusCode = 404;
    throw error;
  }

  const price = Number(rawQuote.regularMarketPrice);
  const previousClose = rawQuote.regularMarketPreviousClose !== undefined
    ? Number(rawQuote.regularMarketPreviousClose)
    : price;
  const change = rawQuote.regularMarketChange !== undefined
    ? Number(rawQuote.regularMarketChange)
    : Number((price - previousClose).toFixed(4));
  const changePercent = rawQuote.regularMarketChangePercent !== undefined
    ? Number(rawQuote.regularMarketChangePercent)
    : previousClose !== 0 ? Number(((change / previousClose) * 100).toFixed(4)) : 0;

  return {
    source: 'yahoo-finance',
    symbol: rawQuote.symbol || resolved,
    name: rawQuote.longName || rawQuote.shortName || rawQuote.symbol || resolved,
    exchange: rawQuote.exchange || (resolved.endsWith('.NS') ? 'NSE' : 'UNKNOWN'),
    currency: rawQuote.currency || (resolved.endsWith('.NS') ? 'INR' : 'USD'),
    price,
    open: rawQuote.regularMarketOpen !== undefined ? Number(rawQuote.regularMarketOpen) : price,
    high: rawQuote.regularMarketDayHigh !== undefined ? Number(rawQuote.regularMarketDayHigh) : price,
    low: rawQuote.regularMarketDayLow !== undefined ? Number(rawQuote.regularMarketDayLow) : price,
    previousClose,
    change,
    changePercent,
    volume: rawQuote.regularMarketVolume !== undefined ? Number(rawQuote.regularMarketVolume) : 0,
    timestamp: rawQuote.regularMarketTime
      ? new Date(rawQuote.regularMarketTime).toISOString()
      : new Date().toISOString(),
  };
}

function mapTimeframeToYahooInterval(timeframe) {
  const map = {
    '1min': '1m',
    '1m': '1m',
    '5min': '5m',
    '5m': '5m',
    '15min': '15m',
    '15m': '15m',
    '30min': '30m',
    '30m': '30m',
    '1h': '1h',
    '4h': '1h',
    '1D': '1d',
    '1day': '1d',
    '1d': '1d',
    '1week': '1wk',
    '1wk': '1wk',
    '1month': '1mo',
    '1mo': '1mo',
  };
  return map[timeframe] || '1d';
}

export async function fetchYahooCandles(symbol, { startDate, endDate, timeframe = '1D', limit = 30 } = {}) {
  const resolved = resolveYahooSymbol(symbol);
  const interval = mapTimeframeToYahooInterval(timeframe);

  const queryOptions = {
    interval,
  };

  if (startDate) {
    queryOptions.period1 = new Date(startDate);
  } else {
    const daysBack = Math.max(limit * 2, 45);
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    queryOptions.period1 = d;
  }

  if (endDate) {
    queryOptions.period2 = new Date(endDate);
  } else {
    queryOptions.period2 = new Date();
  }

  let result;
  try {
    result = await yf.chart(resolved, queryOptions);
  } catch (err) {
    const error = new Error(`Yahoo Finance chart error for ${resolved}: ${err.message}`);
    error.statusCode = err.message?.includes('Not Found') || err.message?.includes('404') ? 404 : 502;
    throw error;
  }

  const quotes = result?.quotes || [];

  const validQuotes = quotes.filter(
    q => q && q.date && q.open !== null && q.close !== null && !isNaN(q.open) && !isNaN(q.close)
  );

  const sliced = validQuotes.slice(-limit);

  return sliced.map(q => ({
    date: new Date(q.date),
    open: Number(q.open),
    high: Number(q.high ?? q.open),
    low: Number(q.low ?? q.open),
    close: Number(q.close),
    volume: BigInt(Math.round(q.volume || 0)),
  }));
}

export async function searchYahoo(query) {
  if (!query) return [];
  try {
    const res = await yf.search(query);
    const quotes = res?.quotes || [];
    return quotes
      .filter(q => q && q.symbol && (q.quoteType === 'EQUITY' || !q.quoteType))
      .map(q => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange || 'UNKNOWN',
        currency: q.currency || (q.symbol.endsWith('.NS') ? 'INR' : 'USD'),
        type: q.typeDisp || 'Common Stock',
      }));
  } catch (err) {
    console.warn(`Yahoo search failed for "${query}":`, err.message);
    return [];
  }
}

