import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical'],
});

export const POPULAR_NSE_STOCKS = [
  { symbol: 'RELIANCE.NS', baseSymbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'TCS.NS', baseSymbol: 'TCS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'INFY.NS', baseSymbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'HDFCBANK.NS', baseSymbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'ICICIBANK.NS', baseSymbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'SBIN.NS', baseSymbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'BHARTIARTL.NS', baseSymbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'ITC.NS', baseSymbol: 'ITC', name: 'ITC Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'KOTAKBANK.NS', baseSymbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
  { symbol: 'LT.NS', baseSymbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE', currency: 'INR', type: 'Common Stock' },
];

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

export async function fetchBatchYahooQuotes(symbols) {
  if (!symbols || symbols.length === 0) return [];
  const resolved = symbols.map(s => resolveYahooSymbol(s));
  try {
    const raw = await yf.quote(resolved);
    const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    return list.map(rawQuote => {
      if (!rawQuote || rawQuote.regularMarketPrice === undefined) return null;
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

      const sym = rawQuote.symbol || '';
      const isNSE = sym.endsWith('.NS') || sym.endsWith('.BO');
      return {
        symbol: sym,
        name: rawQuote.longName || rawQuote.shortName || sym,
        exchange: rawQuote.exchange || (isNSE ? 'NSE' : 'US'),
        currency: rawQuote.currency || (isNSE ? 'INR' : 'USD'),
        price,
        open: rawQuote.regularMarketOpen !== undefined ? Number(rawQuote.regularMarketOpen) : price,
        high: rawQuote.regularMarketDayHigh !== undefined ? Number(rawQuote.regularMarketDayHigh) : price,
        low: rawQuote.regularMarketDayLow !== undefined ? Number(rawQuote.regularMarketDayLow) : price,
        low52: rawQuote.fiftyTwoWeekLow !== undefined ? Number(rawQuote.fiftyTwoWeekLow) : null,
        high52: rawQuote.fiftyTwoWeekHigh !== undefined ? Number(rawQuote.fiftyTwoWeekHigh) : null,
        previousClose,
        change,
        changePercent,
        volume: rawQuote.regularMarketVolume !== undefined ? Number(rawQuote.regularMarketVolume) : 0,
      };
    }).filter(Boolean);
  } catch (err) {
    console.warn('Batch quote error:', err.message);
    return [];
  }
}

export async function fetchYahooQuote(symbol) {
  const resolved = resolveYahooSymbol(symbol);

  let rawQuote;
  try {
    rawQuote = await yf.quote(resolved);
  } catch (err) {
    const error = new Error(`Yahoo Finance quote error for ${resolved}: ${err.message}`);
    error.statusCode = err.message?.includes('Not Found') || err.message?.includes('404') ? 404 : 502;
    throw error;
  }

  if (!rawQuote || rawQuote.regularMarketPrice === undefined) {
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

