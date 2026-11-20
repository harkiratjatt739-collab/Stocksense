export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  high52w: number;
  low52w: number;
  eps: number;
  sector: string;
  description: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  advantages: string[];
  risks: string[];
  aiAnalysis: string;
  priceHistory: { date: string; price: number }[];
}

export interface PortfolioItem {
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relatedStock?: string;
}

export interface MarketIndex {
  name: string;
  value: string;
  change: number;
  symbol: string;
}

export type Page = 'dashboard' | 'analyzer' | 'chat' | 'compare' | 'live' | 'portfolio' | 'watchlist' | 'news' | 'risk';
