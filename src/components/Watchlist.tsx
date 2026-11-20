import React, { useState, useEffect } from 'react';
import { Star, Plus, TrendingUp, TrendingDown, X, Bell } from 'lucide-react';
import { STOCKS } from '../data/stockData';

export const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL']);
  const [query, setQuery] = useState('');
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(Object.values(STOCKS).map(s => [s.symbol, s.price]))
  );
  const [alerts, setAlerts] = useState<Record<string, { high: string; low: string }>>({});
  const [showAlertFor, setShowAlertFor] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(sym => {
          const delta = (Math.random() - 0.5) * 0.5;
          updated[sym] = parseFloat((updated[sym] * (1 + delta / 100)).toFixed(2));
        });
        return updated;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const addToWatchlist = (sym: string) => {
    sym = sym.toUpperCase();
    if (STOCKS[sym] && !watchlist.includes(sym)) {
      setWatchlist(prev => [...prev, sym]);
      setQuery('');
    }
  };

  const removeFromWatchlist = (sym: string) => {
    setWatchlist(prev => prev.filter(s => s !== sym));
  };

  const filteredSuggestions = query
    ? Object.values(STOCKS).filter(s => s.symbol.startsWith(query.toUpperCase()) || s.name.toLowerCase().includes(query.toLowerCase())).filter(s => !watchlist.includes(s.symbol))
    : [];

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 800 }}><span className="gradient-text">Watchlist</span></h1>
        <p style={{ color: '#64748b', margin: 0 }}>Monitor your favorite stocks with live price updates.</p>
      </div>

      {/* Add to watchlist */}
      <div style={{ position: 'relative', marginBottom: '28px', maxWidth: '400px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            className="input-field"
            placeholder="Add stock (e.g. META, AMD)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addToWatchlist(query)}
          />
          <button className="btn-primary" onClick={() => addToWatchlist(query)}>
            <Plus size={18} />
          </button>
        </div>
        {filteredSuggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0d1117', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', marginTop: '4px', overflow: 'hidden', zIndex: 50 }}>
            {filteredSuggestions.map(s => (
              <div key={s.symbol} onClick={() => addToWatchlist(s.symbol)}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span><strong style={{ color: '#3b82f6' }}>{s.symbol}</strong> <span style={{ color: '#94a3b8', fontSize: '13px' }}>{s.name}</span></span>
                <Plus size={14} color="#3b82f6" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist items */}
      {watchlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <Star size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>Your watchlist is empty. Add stocks to track them.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {watchlist.map(sym => {
            const stock = STOCKS[sym];
            if (!stock) return null;
            const livePrice = prices[sym] || stock.price;
            const priceDiff = livePrice - stock.price;
            const isUp = priceDiff >= 0;
            return (
              <div key={sym} className="glass-card-hover" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Star size={18} color="#f59e0b" fill="#f59e0b" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '18px', color: '#e2e8f0' }}>{sym}</div>
                      <div style={{ color: '#64748b', fontSize: '13px' }}>{stock.name}</div>
                    </div>
                    <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '11px', padding: '3px 8px', borderRadius: '8px' }}>{stock.sector}</span>
                  </div>

                  {/* Price section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#e2e8f0' }}>${livePrice.toFixed(2)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: isUp ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                        {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    {/* Volume & recommendation */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Vol</div>
                      <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>{stock.volume}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px',
                        background: stock.recommendation === 'BUY' ? 'rgba(16,185,129,0.15)' : stock.recommendation === 'SELL' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                        color: stock.recommendation === 'BUY' ? '#10b981' : stock.recommendation === 'SELL' ? '#ef4444' : '#f59e0b',
                        border: `1px solid ${stock.recommendation === 'BUY' ? 'rgba(16,185,129,0.3)' : stock.recommendation === 'SELL' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                        AI: {stock.recommendation}
                      </span>
                    </div>

                    {/* Alert button */}
                    <button onClick={() => setShowAlertFor(showAlertFor === sym ? null : sym)}
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <Bell size={14} /> Alert
                    </button>

                    <button onClick={() => removeFromWatchlist(sym)}
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Alert form */}
                {showAlertFor === sym && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <p style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '13px' }}>Set price alerts for {sym} (current: ${livePrice.toFixed(2)})</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Alert Above ($)</label>
                        <input className="input-field" style={{ width: '140px', padding: '8px 12px' }} type="number" placeholder={`e.g. ${(livePrice * 1.05).toFixed(2)}`}
                          value={alerts[sym]?.high || ''} onChange={e => setAlerts(a => ({ ...a, [sym]: { ...a[sym], high: e.target.value } }))} />
                      </div>
                      <div>
                        <label style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Alert Below ($)</label>
                        <input className="input-field" style={{ width: '140px', padding: '8px 12px' }} type="number" placeholder={`e.g. ${(livePrice * 0.95).toFixed(2)}`}
                          value={alerts[sym]?.low || ''} onChange={e => setAlerts(a => ({ ...a, [sym]: { ...a[sym], low: e.target.value } }))} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="btn-primary" onClick={() => setShowAlertFor(null)} style={{ padding: '8px 16px', fontSize: '13px' }}>Save Alert</button>
                      </div>
                    </div>
                    {alerts[sym]?.high || alerts[sym]?.low ? (
                      <p style={{ margin: '8px 0 0 0', color: '#10b981', fontSize: '12px' }}>
                        ✓ Alert set: {alerts[sym]?.high ? `above $${alerts[sym].high}` : ''} {alerts[sym]?.low ? `below $${alerts[sym].low}` : ''}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
