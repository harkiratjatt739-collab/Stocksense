import React, { useState, useEffect } from 'react';
import { Search, Brain, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle, Info, Target, BarChart2, Wifi, WifiOff } from 'lucide-react';
import { STOCKS } from '../data/stockData';
import type { Stock } from '../types';
import { useStockData } from '../context/StockDataContext';
import { formatVolume, formatMarketCap } from '../services/stockApi';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

interface StockAnalyzerProps {
  initialSymbol?: string;
}

export const StockAnalyzer: React.FC<StockAnalyzerProps> = ({ initialSymbol }) => {
  const [query, setQuery]               = useState(initialSymbol || '');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(
    initialSymbol ? STOCKS[initialSymbol] || null : null
  );
  const [loading, setLoading]           = useState(false);
  const [suggestions, setSuggestions]   = useState<Stock[]>([]);
  const [activeTab, setActiveTab]       = useState<'overview' | 'risks' | 'analysis'>('overview');

  const { quotes, history, fetchHistory, status } = useStockData();

  // Auto-trigger analysis on mount if symbol given
  useEffect(() => {
    if (initialSymbol && STOCKS[initialSymbol]) {
      setSelectedStock(STOCKS[initialSymbol]);
      setQuery(initialSymbol);
      fetchHistory(initialSymbol);
    }
  }, [initialSymbol]);

  // When a stock is selected, kick off history fetch
  useEffect(() => {
    if (selectedStock) fetchHistory(selectedStock.symbol);
  }, [selectedStock?.symbol]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      setSuggestions(
        Object.values(STOCKS).filter(
          s => s.symbol.startsWith(value.toUpperCase()) || s.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const analyzeStock = (stock: Stock) => {
    setSuggestions([]);
    setQuery(stock.symbol);
    setLoading(true);
    setSelectedStock(null);
    fetchHistory(stock.symbol);
    setTimeout(() => {
      setSelectedStock(stock);
      setLoading(false);
      setActiveTab('overview');
    }, 1200);
  };

  // Merge live quote data over static data
  const liveQuote  = selectedStock ? quotes[selectedStock.symbol] : null;
  const isLive     = !!liveQuote;
  const price      = liveQuote?.price      ?? selectedStock?.price      ?? 0;
  const change     = liveQuote?.change     ?? selectedStock?.change     ?? 0;
  const changePct  = liveQuote?.changePercent ?? selectedStock?.changePercent ?? 0;
  const vol        = liveQuote ? formatVolume(liveQuote.volume) : (selectedStock?.volume ?? '—');
  const mktCap     = liveQuote ? formatMarketCap(liveQuote.marketCap) : (selectedStock?.marketCap ?? '—');
  const pe         = liveQuote?.peRatio    ?? selectedStock?.peRatio    ?? 0;
  const eps        = liveQuote?.eps        ?? selectedStock?.eps        ?? 0;
  const high52w    = liveQuote?.high52w    ?? selectedStock?.high52w    ?? 0;
  const low52w     = liveQuote?.low52w     ?? selectedStock?.low52w     ?? 0;

  // Chart data: prefer real historical bars, fall back to static price history
  const chartData = (() => {
    if (!selectedStock) return [];
    const realBars = history[selectedStock.symbol];
    if (realBars && realBars.length > 0) {
      return realBars.map(b => ({ date: b.date, price: b.close }));
    }
    return selectedStock.priceHistory;
  })();

  const hasRealChart = selectedStock && history[selectedStock.symbol]?.length > 0;
  const chartColor   = changePct >= 0 ? '#10b981' : '#ef4444';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: '#0d1117', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '8px 12px' }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>{label}</p>
          <p style={{ margin: 0, color: chartColor, fontWeight: 700 }}>${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800 }}>
          <span className="gradient-text">AI Stock Analyzer</span>
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Search any stock for an AI-powered deep-dive analysis.
          {status === 'live' && <span style={{ color: '#10b981', marginLeft: '8px' }}>● All prices are live from Yahoo Finance.</span>}
          {status === 'partial' && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>◑ Partial live data — some prices may be simulated.</span>}
          {status === 'error' && <span style={{ color: '#ef4444', marginLeft: '8px' }}>○ Using simulated prices (API unavailable).</span>}
        </p>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '600px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '44px', fontSize: '15px' }}
              placeholder="Search by symbol or name…"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && STOCKS[query.toUpperCase()]) analyzeStock(STOCKS[query.toUpperCase()]); }}
            />
          </div>
          <button className="btn-primary" onClick={() => { if (STOCKS[query.toUpperCase()]) analyzeStock(STOCKS[query.toUpperCase()]); }}>
            <Brain size={18} /> Analyze
          </button>
        </div>

        {/* Autocomplete */}
        {suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0d1117', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', marginTop: '4px', overflow: 'hidden', zIndex: 50 }}>
            {suggestions.map(s => {
              const lq = quotes[s.symbol];
              const p  = lq?.price ?? s.price;
              const c  = lq?.changePercent ?? s.changePercent;
              return (
                <div key={s.symbol} onClick={() => analyzeStock(s)}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>{s.symbol}</span>
                    <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '14px' }}>{s.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>${p.toFixed(2)}</span>
                    <span style={{ color: c >= 0 ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                      {c >= 0 ? '+' : ''}{c.toFixed(2)}%
                    </span>
                    {lq && <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '8px', fontWeight: 700 }}>LIVE</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick picks */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>Quick picks:</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.values(STOCKS).map(s => {
            const lq = quotes[s.symbol];
            const c  = lq?.changePercent ?? s.changePercent;
            return (
              <button key={s.symbol} onClick={() => analyzeStock(s)}
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '5px 14px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '13px',
                  color: c >= 0 ? '#10b981' : '#ef4444' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}>
                {s.symbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Brain size={24} color="#3b82f6" />
            <span style={{ color: '#3b82f6', fontWeight: 600 }}>AI is analysing the stock…</span>
            {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: `pulse ${0.6 + i * 0.2}s infinite` }}></div>)}
          </div>
          <div className="skeleton" style={{ height: '200px' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: '100px' }}></div>)}
          </div>
        </div>
      )}

      {/* Result */}
      {selectedStock && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Stock header */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 800 }}>{selectedStock.symbol}</h2>
                  <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '12px', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>{selectedStock.sector}</span>
                  <span className={`risk-badge risk-${selectedStock.riskLevel.toLowerCase()}`}>{selectedStock.riskLevel} RISK</span>
                  {/* Live / Sim badge */}
                  {isLive
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '11px', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.25)', fontWeight: 700 }}><Wifi size={11} /> LIVE PRICE</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(100,116,139,0.1)', color: '#64748b', fontSize: '11px', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}><WifiOff size={11} /> SIMULATED</span>
                  }
                </div>
                <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '16px' }}>{liveQuote?.name ?? selectedStock.name}</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px', maxWidth: '500px' }}>{selectedStock.description}</p>
                {liveQuote && (
                  <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '11px' }}>
                    Exchange: {liveQuote.exchange} · Currency: {liveQuote.currency} · Updated: {new Date(liveQuote.lastUpdated).toLocaleTimeString()}
                  </p>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '40px', fontWeight: 800 }}>${price.toFixed(2)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '12px' }}>
                  {changePct >= 0 ? <TrendingUp size={18} color="#10b981" /> : <TrendingDown size={18} color="#ef4444" />}
                  <span style={{ color: changePct >= 0 ? '#10b981' : '#ef4444', fontSize: '18px', fontWeight: 700 }}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
                  </span>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>AI Recommendation</div>
                  <span className={`rec-${selectedStock.recommendation.toLowerCase()}`}>{selectedStock.recommendation}</span>
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>AI Confidence Score</span>
                <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>{selectedStock.confidence}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${selectedStock.confidence}%`,
                  background: selectedStock.confidence >= 80 ? 'linear-gradient(90deg,#10b981,#059669)' : selectedStock.confidence >= 60 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#ef4444,#dc2626)',
                }}></div>
              </div>
            </div>
          </div>

          {/* Key metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Market Cap', value: mktCap },
              { label: 'P/E Ratio', value: pe > 0 ? pe.toFixed(1) + 'x' : 'N/A' },
              { label: 'EPS', value: eps > 0 ? '$' + eps.toFixed(2) : '$(loss)' },
              { label: 'Volume', value: vol },
              { label: '52W High', value: '$' + high52w.toFixed(2) },
              { label: '52W Low', value: '$' + low52w.toFixed(2) },
            ].map(m => (
              <div key={m.label} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{m.label}</div>
                <div style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700 }}>{m.value}</div>
                {isLive && <div style={{ color: '#10b981', fontSize: '9px', fontWeight: 700, marginTop: '3px' }}>● LIVE</div>}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color="#3b82f6" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                  {hasRealChart ? '30-Day Price History (Real Data)' : '30-Day Price History (Simulated)'}
                </h3>
              </div>
              {hasRealChart
                ? <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '11px', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.25)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><Wifi size={11} /> Yahoo Finance</span>
                : <span style={{ background: 'rgba(100,116,139,0.1)', color: '#64748b', fontSize: '11px', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>Simulated</span>
              }
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toFixed(0)}`} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2} fill="url(#cGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Tabs */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
                { id: 'risks', label: 'Risks & Advantages', icon: <AlertTriangle size={16} /> },
                { id: 'analysis', label: 'AI Analysis', icon: <Brain size={16} /> },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Target size={18} color="#10b981" />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#10b981' }}>Bullish Factors</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedStock.advantages.map((adv, i) => (
                      <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <CheckCircle size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <AlertTriangle size={18} color="#ef4444" />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>Risk Factors</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedStock.risks.map((risk, i) => (
                      <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <XCircle size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'risks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#10b981' }}>✅ Advantages & Bullish Catalysts</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
                    {selectedStock.advantages.map((adv, i) => (
                      <div key={i} style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <CheckCircle size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#ef4444' }}>⚠️ Risks & Bearish Concerns</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
                    {selectedStock.risks.map((risk, i) => (
                      <div key={i} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <AlertTriangle size={16} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="glass-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                    <Brain size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>AI Investment Analysis</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Generated by StockSense AI · Fundamental + technical factors</p>
                  </div>
                </div>
                <p style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '15px', margin: '0 0 24px 0' }}>{selectedStock.aiAnalysis}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Signal', value: <span className={`rec-${selectedStock.recommendation.toLowerCase()}`} style={{ display: 'inline-block' }}>{selectedStock.recommendation}</span> },
                    { label: 'Confidence', value: <span style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6' }}>{selectedStock.confidence}%</span> },
                    { label: 'Risk Level', value: <span className={`risk-badge risk-${selectedStock.riskLevel.toLowerCase()}`}>{selectedStock.riskLevel}</span> },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{m.label}</div>
                      {m.value}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', fontSize: '12px', color: '#f59e0b', lineHeight: 1.6 }}>
                  ⚠️ <strong>Disclaimer:</strong> This analysis is AI-generated for educational purposes only. Not financial advice. Always consult a licensed financial advisor before investing.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedStock && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.05))', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Brain size={40} color="#3b82f6" />
          </div>
          <h3 style={{ color: '#94a3b8', marginBottom: '8px' }}>Ready to Analyze</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Search for a stock symbol above or click a quick pick to get a full AI analysis with live prices, real chart data, risks, and recommendations.</p>
        </div>
      )}
    </div>
  );
};
