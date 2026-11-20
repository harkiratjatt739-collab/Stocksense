import React, { useState } from 'react';
import { GitCompare, Search, X, TrendingUp, TrendingDown, CheckCircle, XCircle, Brain } from 'lucide-react';
import { STOCKS } from '../data/stockData';
import type { Stock } from '../types';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const COMPARE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export const StockComparison: React.FC = () => {
  const [selected, setSelected] = useState<Stock[]>([STOCKS['AAPL'], STOCKS['MSFT']]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Stock[]>([]);

  const handleSearch = (v: string) => {
    setQuery(v);
    if (v.length > 0) {
      setSuggestions(
        Object.values(STOCKS)
          .filter(s => (s.symbol.startsWith(v.toUpperCase()) || s.name.toLowerCase().includes(v.toLowerCase())) && !selected.find(sel => sel.symbol === s.symbol))
          .slice(0, 6)
      );
    } else {
      setSuggestions([]);
    }
  };

  const addStock = (stock: Stock) => {
    if (selected.length >= 4) return;
    setSelected(prev => [...prev, stock]);
    setQuery('');
    setSuggestions([]);
  };

  const removeStock = (sym: string) => {
    setSelected(prev => prev.filter(s => s.symbol !== sym));
  };

  // Merge price histories by date index
  const mergedHistory = (() => {
    if (selected.length === 0) return [];
    const len = Math.min(...selected.map(s => s.priceHistory.length));
    return Array.from({ length: len }, (_, i) => {
      const entry: Record<string, number | string> = { date: selected[0].priceHistory[i].date };
      selected.forEach(s => { entry[s.symbol] = s.priceHistory[i].price; });
      return entry;
    });
  })();

  // Normalize to % change from first price for fair comparison
  const normalizedHistory = (() => {
    if (selected.length === 0) return [];
    const firstPrices: Record<string, number> = {};
    selected.forEach(s => { firstPrices[s.symbol] = s.priceHistory[0]?.price || 1; });
    return mergedHistory.map(row => {
      const entry: Record<string, number | string> = { date: row.date as string };
      selected.forEach(s => {
        entry[s.symbol] = parseFloat((((row[s.symbol] as number) / firstPrices[s.symbol] - 1) * 100).toFixed(2));
      });
      return entry;
    });
  })();

  const metrics: { key: keyof Stock; label: string; format: (v: Stock) => string; better?: 'lower' | 'higher' }[] = [
    { key: 'price', label: 'Current Price', format: s => `$${s.price.toFixed(2)}` },
    { key: 'changePercent', label: '1-Day Change', format: s => `${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(2)}%`, better: 'higher' },
    { key: 'marketCap', label: 'Market Cap', format: s => s.marketCap },
    { key: 'peRatio', label: 'P/E Ratio', format: s => s.peRatio > 0 ? s.peRatio.toFixed(1) + 'x' : 'N/A (Loss)', better: 'lower' },
    { key: 'eps', label: 'EPS', format: s => s.eps > 0 ? `$${s.eps.toFixed(2)}` : `$(${Math.abs(s.eps).toFixed(2)})`, better: 'higher' },
    { key: 'high52w', label: '52W High', format: s => `$${s.high52w.toFixed(2)}` },
    { key: 'low52w', label: '52W Low', format: s => `$${s.low52w.toFixed(2)}` },
    { key: 'confidence', label: 'AI Confidence', format: s => `${s.confidence}%`, better: 'higher' },
  ];

  const getBest = (metric: typeof metrics[0]): string | null => {
    if (!metric.better || selected.length < 2) return null;
    const vals = selected.map(s => ({ sym: s.symbol, v: s[metric.key] as number })).filter(x => typeof x.v === 'number');
    if (vals.length === 0) return null;
    return metric.better === 'higher'
      ? vals.reduce((a, b) => a.v > b.v ? a : b).sym
      : vals.reduce((a, b) => a.v < b.v ? a : b).sym;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0d1117', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', padding: '10px 14px', minWidth: '160px' }}>
          <p style={{ margin: '0 0 6px 0', color: '#94a3b8', fontSize: '12px' }}>{label}</p>
          {payload.map((p: any) => (
            <p key={p.dataKey} style={{ margin: '2px 0', color: p.color, fontSize: '13px', fontWeight: 600 }}>
              {p.dataKey}: {p.value > 0 ? '+' : ''}{p.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 800 }}>
          <span className="gradient-text">Stock Comparison</span>
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>Compare up to 4 stocks side-by-side — metrics, charts, and AI signals.</p>
      </div>

      {/* Add stocks bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* Selected chips */}
        {selected.map((s, i) => (
          <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${COMPARE_COLORS[i]}22`, border: `1px solid ${COMPARE_COLORS[i]}55`, borderRadius: '24px', padding: '7px 14px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COMPARE_COLORS[i], flexShrink: 0 }}></span>
            <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '14px' }}>{s.symbol}</span>
            <span style={{ color: '#94a3b8', fontSize: '12px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name.split(' ')[0]}</span>
            <button onClick={() => removeStock(s.symbol)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: 0 }}>
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Search to add */}
        {selected.length < 4 && (
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(13,17,35,0.8)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '24px', padding: '7px 16px', gap: '8px' }}>
              <Search size={14} color="#64748b" />
              <input value={query} onChange={e => handleSearch(e.target.value)}
                placeholder={`Add stock (${4 - selected.length} left)`}
                style={{ background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '14px', width: '150px' }} />
            </div>
            {suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#0d1117', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', marginTop: '4px', overflow: 'hidden', zIndex: 50, minWidth: '220px' }}>
                {suggestions.map(s => (
                  <div key={s.symbol} onClick={() => addStock(s)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span><strong style={{ color: '#3b82f6' }}>{s.symbol}</strong> <span style={{ color: '#94a3b8', fontSize: '12px' }}>{s.name.substring(0, 18)}</span></span>
                    <span style={{ color: s.changePercent >= 0 ? '#10b981' : '#ef4444', fontSize: '12px' }}>{s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <GitCompare size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>Search and add stocks above to compare them side-by-side.</p>
        </div>
      )}

      {selected.length >= 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Quick header cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selected.length}, 1fr)`, gap: '16px' }}>
            {selected.map((s, i) => (
              <div key={s.symbol} className="glass-card" style={{ padding: '20px', borderColor: `${COMPARE_COLORS[i]}44` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: COMPARE_COLORS[i], flexShrink: 0 }}></span>
                  <span style={{ fontWeight: 800, fontSize: '20px', color: '#e2e8f0' }}>{s.symbol}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 12px 0' }}>{s.name}</p>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>${s.price.toFixed(2)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: s.changePercent >= 0 ? '#10b981' : '#ef4444', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                  {s.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span className={`rec-${s.recommendation.toLowerCase()}`} style={{ fontSize: '12px', padding: '3px 10px' }}>{s.recommendation}</span>
                  <span className={`risk-badge risk-${s.riskLevel.toLowerCase()}`} style={{ fontSize: '11px', padding: '3px 8px' }}>{s.riskLevel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Normalized price chart */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>30-Day Performance Comparison</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Normalized to % return from start date — compares relative performance fairly regardless of share price.</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={normalizedHistory}>
                <defs>
                  {selected.map((s, i) => (
                    <linearGradient key={s.symbol} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COMPARE_COLORS[i]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COMPARE_COLORS[i]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval={5} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{v}</span>} />
                {selected.map((s, i) => (
                  <Area key={s.symbol} type="monotone" dataKey={s.symbol} stroke={COMPARE_COLORS[i]} strokeWidth={2} fill={`url(#grad${i})`} dot={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics table */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Metrics Comparison</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontSize: '12px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)', minWidth: '140px' }}>Metric</th>
                    {selected.map((s, i) => (
                      <th key={s.symbol} style={{ textAlign: 'center', padding: '8px 12px', fontSize: '14px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.06)', color: COMPARE_COLORS[i] }}>
                        {s.symbol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(m => {
                    const best = getBest(m);
                    return (
                      <tr key={m.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>{m.label}</td>
                        {selected.map((s, _i) => {
                          const isBest = best === s.symbol;
                          return (
                            <td key={s.symbol} style={{ padding: '12px', textAlign: 'center', fontWeight: isBest ? 700 : 500, color: isBest ? '#10b981' : '#e2e8f0', fontSize: '14px', position: 'relative' }}>
                              {isBest && <span style={{ marginRight: '4px', fontSize: '11px' }}>🏆</span>}
                              {m.format(s)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Analysis side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(selected.length, 2)}, 1fr)`, gap: '16px' }}>
            {selected.map((s, i) => (
              <div key={s.symbol} className="glass-card" style={{ padding: '20px', borderColor: `${COMPARE_COLORS[i]}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Brain size={16} color={COMPARE_COLORS[i]} />
                  <span style={{ fontWeight: 700, color: COMPARE_COLORS[i] }}>{s.symbol} — AI Analysis</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, margin: '0 0 16px 0' }}>{s.aiAnalysis.substring(0, 280)}...</p>

                {/* Advantages vs risks mini */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <p style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, margin: '0 0 6px 0', textTransform: 'uppercase' }}>Top Pros</p>
                    {s.advantages.slice(0, 2).map((a, j) => (
                      <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                        <CheckCircle size={12} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: '#cbd5e1', fontSize: '11px', lineHeight: 1.5 }}>{a.substring(0, 60)}...</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, margin: '0 0 6px 0', textTransform: 'uppercase' }}>Top Risks</p>
                    {s.risks.slice(0, 2).map((r, j) => (
                      <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                        <XCircle size={12} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: '#cbd5e1', fontSize: '11px', lineHeight: 1.5 }}>{r.substring(0, 60)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{ padding: '12px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', fontSize: '12px', color: '#f59e0b' }}>
            ⚠️ <strong>Disclaimer:</strong> This comparison is for educational purposes only. Not financial advice. Always consult a licensed financial advisor.
          </div>
        </div>
      )}
    </div>
  );
};
