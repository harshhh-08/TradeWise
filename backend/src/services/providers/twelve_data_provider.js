const API_BASE = 'https://api.twelvedata.com';
const DEFAULT_EXCHANGE = process.env.STOCK_EXCHANGE || 'NASDAQ';

export const POPULAR_US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock' },
  { symbol: 'TSLA', name: 'Tesla Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock' },
  { symbol: 'META', name: 'Meta Platforms Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock' },
  { symbol: 'NFLX', name: 'Netflix Inc', exchange: 'NASDAQ', currency: 'USD', type: 'Common Stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', exchange: 'NYSE', currency: 'USD', type: 'Common Stock' },
  { symbol: 'V', name: 'Visa Inc', exchange: 'NYSE', currency: 'USD', type: 'Common Stock' },
];

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

