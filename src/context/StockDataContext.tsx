import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchBatchQuotes, fetchHistoricalOHLC } from '../services/stockApi';
import type { LiveQuote, OHLCBar } from '../services/stockApi';
import { STOCKS } from '../data/stockData';

export type DataStatus = 'idle' | 'loading' | 'live' | 'partial' | 'error';

interface StockDataContextValue {
  quotes: Record<string, LiveQuote>;
  history: Record<string, OHLCBar[]>;
  status: DataStatus;
  lastUpdated: Date | null;
  liveCount: number;
  totalCount: number;
  refreshAll: () => void;
  fetchHistory: (symbol: string) => Promise<void>;
  getPrice: (symbol: string) => number;
  getChange: (symbol: string) => number;
  getChangePct: (symbol: string) => number;
}

const StockDataContext = createContext<StockDataContextValue | null>(null);

const ALL_SYMBOLS = Object.keys(STOCKS);
const REFRESH_INTERVAL_MS = 60_000; // 1 minute

export const StockDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quotes, setQuotes]       = useState<Record<string, LiveQuote>>({});
  const [history, setHistory]     = useState<Record<string, OHLCBar[]>>({});
  const [status, setStatus]       = useState<DataStatus>('idle');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetchingHistory = useRef<Set<string>>(new Set());

  const refreshAll = useCallback(async () => {
    setStatus('loading');
    try {
      // Yahoo v7 supports up to ~100 symbols in one request
      const data = await fetchBatchQuotes(ALL_SYMBOLS);
      const count = Object.keys(data).length;
      if (count === 0) {
        setStatus('error');
      } else {
        setQuotes(data);
        setLastUpdated(new Date());
        setStatus(count === ALL_SYMBOLS.length ? 'live' : 'partial');
      }
    } catch {
      setStatus('error');
    }
  }, []);

  // Fetch history for a single symbol (lazy — only when needed)
  const fetchHistory = useCallback(async (symbol: string) => {
    if (fetchingHistory.current.has(symbol)) return;
    if (history[symbol] && history[symbol].length > 0) return;
    fetchingHistory.current.add(symbol);
    try {
      const bars = await fetchHistoricalOHLC(symbol, 30);
      if (bars.length > 0) {
        setHistory(prev => ({ ...prev, [symbol]: bars }));
      }
    } finally {
      fetchingHistory.current.delete(symbol);
    }
  }, [history]);

  // Initial load + periodic refresh
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Helper getters — fall back to static data if no live quote
  const getPrice = useCallback((sym: string) => {
    return quotes[sym]?.price ?? STOCKS[sym]?.price ?? 0;
  }, [quotes]);

  const getChange = useCallback((sym: string) => {
    return quotes[sym]?.change ?? STOCKS[sym]?.change ?? 0;
  }, [quotes]);

  const getChangePct = useCallback((sym: string) => {
    return quotes[sym]?.changePercent ?? STOCKS[sym]?.changePercent ?? 0;
  }, [quotes]);

  const value: StockDataContextValue = {
    quotes,
    history,
    status,
    lastUpdated,
    liveCount: Object.keys(quotes).length,
    totalCount: ALL_SYMBOLS.length,
    refreshAll,
    fetchHistory,
    getPrice,
    getChange,
    getChangePct,
  };

  return (
    <StockDataContext.Provider value={value}>
      {children}
    </StockDataContext.Provider>
  );
};

export function useStockData() {
  const ctx = useContext(StockDataContext);
  if (!ctx) throw new Error('useStockData must be used inside StockDataProvider');
  return ctx;
}
