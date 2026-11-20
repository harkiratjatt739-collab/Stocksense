import React from 'react';
import { RefreshCw, Wifi, WifiOff, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatVolume, formatMarketCap } from '../services/stockApi';
import { STOCKS } from '../data/stockData';
import { useStockData } from '../context/StockDataContext';

const TRACKED_SYMBOLS = Object.keys(STOCKS);

export const LivePrices: React.FC = () => {
  const { quotes, status, lastUpdated, liveCount, totalCount, refreshAll } = useStockData();
  const loading = status === 'loading';

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 800 }}>
            <span className="gradient-text">Live Market Prices</span>
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>Real-time quotes via Yahoo Finance. Auto-refreshes every 60 seconds.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* API Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '20px',
            background: status === 'live' ? 'rgba(16,185,129,0.1)' : status === 'partial' ? 'rgba(245,158,11,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)',
            border: `1px solid ${status === 'live' ? 'rgba(16,185,129,0.3)' : status === 'partial' ? 'rgba(245,158,11,0.3)' : status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(100,116,139,0.2)'}` }}>
            {status === 'live' || status === 'partial'
              ? <><Wifi size={14} color={status === 'live' ? '#10b981' : '#f59e0b'} /><span style={{ color: status === 'live' ? '#10b981' : '#f59e0b', fontSize: '12px', fontWeight: 600 }}>{status === 'live' ? 'ALL LIVE' : 'PARTIAL LIVE'} — {liveCount}/{totalCount}</span></>
              : status === 'error'
              ? <><WifiOff size={14} color="#ef4444" /><span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>SIMULATED</span></>
              : <><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }}></span><span style={{ color: '#64748b', fontSize: '12px' }}>Connecting…</span></>}
          </div>
          {lastUpdated && (
            <span style={{ color: '#475569', fontSize: '12px' }}>Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button className="btn-primary" onClick={refreshAll} disabled={loading}
            style={{ padding: '8px 16px', fontSize: '13px', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Refreshing…' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Status banners */}
      {status === 'error' && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 600 }}>Live data unavailable — showing simulated prices</span>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '4px 0 0 0' }}>Yahoo Finance's free API has browser CORS restrictions. The app shows simulated data as a fallback. For guaranteed live data, a backend proxy or Finnhub API key is recommended.</p>
          </div>
        </div>
      )}
      {(status === 'live' || status === 'partial') && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span style={{ color: '#10b981', fontSize: '13px' }}>Connected to Yahoo Finance — {liveCount}/{totalCount} stocks showing real-time data.</span>
        </div>
      )}

      {/* Quotes grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {TRACKED_SYMBOLS.map(sym => {
          const lq      = quotes[sym];
          const stock   = STOCKS[sym];
          if (!stock) return null;
          const price   = lq?.price      ?? stock.price;
          const change  = lq?.change     ?? stock.change;
          const pct     = lq?.changePercent ?? stock.changePercent;
          const vol     = lq ? formatVolume(lq.volume) : stock.volume;
          const cap     = lq ? formatMarketCap(lq.marketCap) : stock.marketCap;
          const isLive  = !!lq;
          const isUp    = pct >= 0;

          return (
            <div key={sym} className="glass-card-hover" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '18px', color: '#e2e8f0' }}>{sym}</span>
                    {isLive
                      ? <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>LIVE</span>
                      : <span style={{ fontSize: '9px', background: 'rgba(100,116,139,0.15)', color: '#64748b', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>SIM</span>
                    }
                  </div>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{(lq?.name ?? stock.name).substring(0, 24)}</span>
                </div>
                <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '10px', padding: '3px 8px', borderRadius: '8px', fontWeight: 600 }}>{stock.sector}</span>
              </div>

              <div style={{ fontSize: '28px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>${price.toFixed(2)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                {isUp ? <TrendingUp size={14} color="#10b981" /> : <TrendingDown size={14} color="#ef4444" />}
                <span style={{ color: isUp ? '#10b981' : '#ef4444', fontSize: '14px', fontWeight: 700 }}>
                  {change >= 0 ? '+' : ''}${Math.abs(change).toFixed(2)} ({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {[
                  { label: 'Volume', value: vol },
                  { label: 'Mkt Cap', value: cap },
                  { label: 'P/E Ratio', value: (lq?.peRatio ?? stock.peRatio) > 0 ? (lq?.peRatio ?? stock.peRatio).toFixed(1) + 'x' : 'N/A' },
                  { label: 'AI Signal', value: stock.recommendation, color: stock.recommendation === 'BUY' ? '#10b981' : stock.recommendation === 'SELL' ? '#ef4444' : '#f59e0b' },
                ].map(m => (
                  <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ color: '#475569', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px' }}>{m.label}</div>
                    <div style={{ color: (m as any).color || '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* 52W range bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b', fontSize: '10px' }}>52W Low ${(lq?.low52w ?? stock.low52w).toFixed(0)}</span>
                  <span style={{ color: '#64748b', fontSize: '10px' }}>52W High ${(lq?.high52w ?? stock.high52w).toFixed(0)}</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: isUp ? '#10b981' : '#ef4444', borderRadius: '3px',
                    width: `${Math.min(100, Math.max(0, ((price - (lq?.low52w ?? stock.low52w)) / ((lq?.high52w ?? stock.high52w) - (lq?.low52w ?? stock.low52w))) * 100))}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* API Info */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700 }}>📡 Data Sources</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {[
            { name: 'Yahoo Finance', desc: 'Free real-time & historical quotes via CORS proxy chain (allorigins → corsproxy.io → cors.lol)', status: 'Active', color: '#3b82f6' },
            { name: 'Alpha Vantage', desc: 'Free tier: 25 API calls/day. Good for historical fundamentals and technicals.', status: 'Available', color: '#8b5cf6' },
            { name: 'Polygon.io', desc: 'Real-time WebSocket streaming for US equities. Free tier available.', status: 'Available', color: '#10b981' },
            { name: 'Finnhub', desc: 'Free real-time quote API, 60 calls/min — best no-CORS free option.', status: 'Recommended', color: '#f59e0b' },
          ].map(api => (
            <div key={api.name} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: api.color, fontSize: '14px' }}>{api.name}</span>
                <span style={{ fontSize: '10px', background: api.status === 'Active' ? 'rgba(16,185,129,0.15)' : api.status === 'Recommended' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)', color: api.status === 'Active' ? '#10b981' : api.status === 'Recommended' ? '#f59e0b' : '#94a3b8', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>{api.status}</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{api.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
