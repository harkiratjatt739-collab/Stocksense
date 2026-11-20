// Real Stock Data Service — Yahoo Finance via CORS proxies
// Tries multiple proxies in sequence; falls back to simulated data on failure

export interface LiveQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  peRatio: number;
  eps: number;
  high52w: number;
  low52w: number;
  name: string;
  exchange: string;
  currency: string;
  lastUpdated: number; // timestamp ms
}

export interface OHLCBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── CORS proxy chain ────────────────────────────────────────────────────────
const PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.cors.lol/?${url}`,
];

async function fetchWithProxies(targetUrl: string, timeout = 8000): Promise<any> {
  for (const proxy of PROXIES) {
    try {
      const proxyUrl = proxy(targetUrl);
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(proxyUrl, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) continue;
      const json = await res.json();
      return json;
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Single quote ─────────────────────────────────────────────────────────────
export async function fetchLiveQuote(symbol: string): Promise<LiveQuote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d&includePrePost=false`;
  const data = await fetchWithProxies(url);
  if (!data?.chart?.result?.[0]) return null;

  const result = data.chart.result[0];
  const meta = result.meta;

  const price    = meta.regularMarketPrice ?? meta.previousClose ?? 0;
  const prev     = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change   = parseFloat((price - prev).toFixed(2));
  const changePct = parseFloat(((change / prev) * 100).toFixed(2));

  return {
    symbol,
    price: parseFloat(price.toFixed(2)),
    change,
    changePercent: changePct,
    volume: meta.regularMarketVolume ?? 0,
    marketCap: meta.marketCap ?? 0,
    high: meta.regularMarketDayHigh ?? price,
    low: meta.regularMarketDayLow ?? price,
    open: meta.regularMarketOpen ?? price,
    prevClose: parseFloat(prev.toFixed(2)),
    peRatio: meta.trailingPE ?? 0,
    eps: meta.trailingEps ?? 0,
    high52w: meta.fiftyTwoWeekHigh ?? price,
    low52w: meta.fiftyTwoWeekLow ?? price,
    name: meta.longName ?? meta.shortName ?? symbol,
    exchange: meta.exchangeName ?? '',
    currency: meta.currency ?? 'USD',
    lastUpdated: Date.now(),
  };
}

// ─── Batch quote (uses Yahoo v7 multi-symbol endpoint) ───────────────────────
export async function fetchBatchQuotes(symbols: string[]): Promise<Record<string, LiveQuote>> {
  const joined = symbols.join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joined}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,marketCap,regularMarketOpen,regularMarketDayHigh,regularMarketDayLow,fiftyTwoWeekHigh,fiftyTwoWeekLow,trailingPE,epsTrailingTwelveMonths,longName,exchangeName,currency,regularMarketPreviousClose`;
  const data = await fetchWithProxies(url);
  
  const map: Record<string, LiveQuote> = {};
  if (!data?.quoteResponse?.result) return map;

  for (const q of data.quoteResponse.result) {
    const price    = q.regularMarketPrice ?? 0;
    const prev     = q.regularMarketPreviousClose ?? price;
    const change   = parseFloat(((q.regularMarketChange ?? price - prev)).toFixed(2));
    const changePct = parseFloat((q.regularMarketChangePercent ?? (change / prev) * 100).toFixed(2));

    map[q.symbol] = {
      symbol: q.symbol,
      price: parseFloat(price.toFixed(2)),
      change,
      changePercent: changePct,
      volume: q.regularMarketVolume ?? 0,
      marketCap: q.marketCap ?? 0,
      high: q.regularMarketDayHigh ?? price,
      low: q.regularMarketDayLow ?? price,
      open: q.regularMarketOpen ?? price,
      prevClose: parseFloat(prev.toFixed(2)),
      peRatio: parseFloat((q.trailingPE ?? 0).toFixed(1)),
      eps: parseFloat((q.epsTrailingTwelveMonths ?? 0).toFixed(2)),
      high52w: q.fiftyTwoWeekHigh ?? price,
      low52w: q.fiftyTwoWeekLow ?? price,
      name: q.longName ?? q.shortName ?? q.symbol,
      exchange: q.exchangeName ?? '',
      currency: q.currency ?? 'USD',
      lastUpdated: Date.now(),
    };
  }
  return map;
}

// ─── Historical OHLC for charts ──────────────────────────────────────────────
export async function fetchHistoricalOHLC(symbol: string, days = 30): Promise<OHLCBar[]> {
  const range = days <= 7 ? '5d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : '6mo';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`;
  const data = await fetchWithProxies(url, 10000);
  if (!data?.chart?.result?.[0]) return [];

  const result = data.chart.result[0];
  const timestamps: number[] = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];
  if (!quote || timestamps.length === 0) return [];

  return timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open:   parseFloat((quote.open?.[i]   ?? 0).toFixed(2)),
      high:   parseFloat((quote.high?.[i]   ?? 0).toFixed(2)),
      low:    parseFloat((quote.low?.[i]    ?? 0).toFixed(2)),
      close:  parseFloat((quote.close?.[i]  ?? 0).toFixed(2)),
      volume: Math.round(quote.volume?.[i]  ?? 0),
    }))
    .filter(b => b.close > 0);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return (vol / 1_000_000_000).toFixed(1) + 'B';
  if (vol >= 1_000_000)     return (vol / 1_000_000).toFixed(1) + 'M';
  if (vol >= 1_000)         return (vol / 1_000).toFixed(1) + 'K';
  return vol.toString();
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000_000) return '$' + (cap / 1_000_000_000_000).toFixed(2) + 'T';
  if (cap >= 1_000_000_000)     return '$' + (cap / 1_000_000_000).toFixed(1) + 'B';
  if (cap >= 1_000_000)         return '$' + (cap / 1_000_000).toFixed(0) + 'M';
  return '$' + cap.toFixed(0);
}
