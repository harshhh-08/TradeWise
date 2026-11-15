const API_BASE = 'https://api.twelvedata.com';
const DEFAULT_EXCHANGE = process.env.STOCK_EXCHANGE || 'NASDAQ';

export const POPULAR_US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock', price: 242.50, change: 1.20, changePercent: 0.50, volume: 48920100, low52: 164.08, high52: 245.50, previousClose: 241.30 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock', price: 428.15, change: 2.64, changePercent: 0.62, volume: 19800000, low52: 366.50, high52: 468.35, previousClose: 425.51 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock', price: 178.30, change: 1.15, changePercent: 0.65, volume: 22100000, low52: 129.40, high52: 191.75, previousClose: 177.15 },
  { symbol: 'AMZN', name: 'Amazon.com Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock', price: 210.20, change: 2.12, changePercent: 1.02, volume: 34100000, low52: 138.80, high52: 215.90, previousClose: 208.08 },
  { symbol: 'TSLA', name: 'Tesla Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock', price: 338.00, change: -4.20, changePercent: -1.23, volume: 62400000, low52: 138.80, high52: 360.00, previousClose: 342.20 },
  { symbol: 'META', name: 'Meta Platforms Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock', price: 585.50, change: 3.40, changePercent: 0.58, volume: 12500000, low52: 279.40, high52: 602.95, previousClose: 582.10 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock', price: 148.50, change: -1.13, changePercent: -0.76, volume: 82190000, low52: 45.00, high52: 153.10, previousClose: 149.63 },
  { symbol: 'NFLX', name: 'Netflix Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock', price: 890.00, change: 5.60, changePercent: 0.63, volume: 3800000, low52: 445.00, high52: 915.00, previousClose: 884.40 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', exchange: 'NYSE', currency: 'USD', type: 'Common Stock', price: 245.00, change: 1.80, changePercent: 0.74, volume: 8500000, low52: 145.00, high52: 248.50, previousClose: 243.20 },
  { symbol: 'V', name: 'Visa Inc', exchange: 'NYSE', currency: 'USD', type: 'Common Stock', price: 312.00, change: 2.10, changePercent: 0.68, volume: 5400000, low52: 240.00, high52: 316.00, previousClose: 309.90 },
];

export function getBaselineUSQuote(symbol) {
  if (!symbol) return null;
  const upper = symbol.trim().toUpperCase();
  const match = POPULAR_US_STOCKS.find(s => s.symbol.toUpperCase() === upper);
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
    volume: match.volume || 20000000,
    timestamp: new Date().toISOString(),
  };
}

export function hasTwelveDataKey() {
  return !!process.env.TWELVE_DATA_API_KEY;
}

async function callTwelveData(endpoint, params = {}) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    const error = new Error('TWELVE_DATA_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }

  const url = new URL(`${API_BASE}${endpoint}`);
  params.apikey = apiKey;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  let response;
  try {
    response = await fetch(url.toString());
  } catch (err) {
    const error = new Error(`Failed to reach Twelve Data API: ${err.message}`);
    error.statusCode = 502;
    throw error;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok || body?.status === 'error') {
    const message = body?.message || `Twelve Data API HTTP ${response.status}`;
    const error = new Error(message);
    const code = body?.code || response.status;
    error.statusCode = code === 404 || code === 400 || message.includes('not found') || message.includes('available starting') ? 404 : 502;
    throw error;
  }

  return body;
}

export async function fetchTwelveDataQuote(symbol) {
  const upper = symbol.toUpperCase();
  const data = await callTwelveData('/quote', {
    symbol: upper,
    exchange: DEFAULT_EXCHANGE,
  });

  const price = parseFloat(data.close);
  const previousClose = parseFloat(data.previous_close);
  const change = parseFloat(data.change);
  const changePercent = parseFloat(data.percent_change);

  return {
    source: 'twelvedata',
    symbol: upper,
    name: data.name || upper,
    exchange: data.exchange || DEFAULT_EXCHANGE,
    currency: data.currency || 'USD',
    price,
    open: parseFloat(data.open) || price,
    high: parseFloat(data.high) || price,
    low: parseFloat(data.low) || price,
    previousClose,
    change,
    changePercent,
    volume: parseInt(data.volume, 10) || 0,
    timestamp: data.datetime || new Date().toISOString(),
  };
}

export async function fetchTwelveDataCandles(symbol, { startDate, endDate, timeframe = '1D', limit = 30 } = {}) {
  const upper = symbol.toUpperCase();

  const intervalMap = {
    '1min': '1min', '5min': '5min', '15min': '15min', '30min': '30min',
    '1h': '1h', '4h': '4h', '1day': '1day', '1D': '1day',
    '1week': '1week', '1month': '1month',
  };
  const interval = intervalMap[timeframe] || '1day';

  const params = {
    symbol: upper,
    exchange: DEFAULT_EXCHANGE,
    interval,
    outputsize: Math.min(limit, 5000),
  };
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const data = await callTwelveData('/time_series', params);

  if (!data.values || !Array.isArray(data.values)) {
    return [];
  }

  const reversed = [...data.values].reverse();

  return reversed.map(v => ({
    date: new Date(v.datetime),
    open: Number(v.open),
    high: Number(v.high),
    low: Number(v.low),
    close: Number(v.close),
    volume: BigInt(v.volume || 0),
  }));
}

export async function fetchTwelveDataStocksList({ exchange = DEFAULT_EXCHANGE } = {}) {
  const data = await callTwelveData('/stocks', {
    exchange,
    type: 'Common Stock',
  });

  return (data.data || []).map(s => ({
    symbol: s.symbol,
    name: s.name,
    exchange: s.exchange,
    currency: s.currency,
    type: s.type,
  }));
}

