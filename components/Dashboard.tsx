import React from 'react';
import { TrendingUp, TrendingDown, Brain, Search, Zap, BarChart2, Shield, ArrowRight, MessageSquare, Wifi } from 'lucide-react';
import { STOCKS, MARKET_INDICES } from '../data/stockData';
import type { Page } from '../types';
import { useStockData } from '../context/StockDataContext';
import { DataStatusBar } from './DataStatusBar';

interface DashboardProps {
  onNavigate: (page: Page) => void;
  onAnalyzeStock: (symbol: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onAnalyzeStock }) => {
  const { getPrice, getChangePct, quotes } = useStockData();

  const stocks   = Object.values(STOCKS);
  const topGainers = [...stocks].sort((a, b) => getChangePct(b.symbol) - getChangePct(a.symbol)).slice(0, 5);
  const topLosers  = [...stocks].sort((a, b) => getChangePct(a.symbol) - getChangePct(b.symbol)).slice(0, 3);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero */}
      <div className="glass-card" style={{ padding: '36px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.05))', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', borderRadius: '12px', padding: '10px', display: 'flex' }}>
            <Brain size={24} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              StockSense AI
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>AI-Powered Stock Market Intelligence Platform</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <DataStatusBar />
          </div>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: '15px', maxWidth: '600px', lineHeight: 1.7, marginBottom: '20px' }}>
          Harness the power of AI to analyze stocks, assess risks, and make informed investment decisions with real-time market data.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => onNavigate('analyzer')}>
            <Brain size={18} /> Analyze a Stock <ArrowRight size={16} />
          </button>
          <button className="btn-primary" onClick={() => onNavigate('chat')} style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.25),rgba(6,182,212,0.15))', border: '1px solid rgba(16,185,129,0.3)' }}>
            <MessageSquare size={18} /> Ask AI Anything
          </button>
          <button className="btn-primary" onClick={() => onNavigate('risk')} style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(59,130,246,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Shield size={18} /> Risk Assessment
          </button>
        </div>

        <div style={{ marginTop: '16px', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', fontSize: '12px', color: '#f59e0b' }}>
          ⚠️ <strong>Disclaimer:</strong> StockSense AI is for educational purposes only. Nothing here constitutes financial advice.
        </div>
      </div>

      {/* Market indices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {MARKET_INDICES.map((idx) => (
          <div key={idx.symbol} className="glass-card" style={{ padding: '18px' }}>
            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{idx.name}</div>
            <div style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{idx.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: idx.change >= 0 ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 600 }}>
              {idx.change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {idx.change >= 0 ? '+' : ''}{idx.change}%
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Top Gainers */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={20} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#10b981' }}>Top Performers</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topGainers.map((stock) => {
              const livePrice = getPrice(stock.symbol);
              const changePct = getChangePct(stock.symbol);
              const isLive    = !!quotes[stock.symbol];
              return (
                <div key={stock.symbol} className="glass-card-hover" style={{ padding: '12px 16px', cursor: 'pointer', borderRadius: '12px' }}
                  onClick={() => { onAnalyzeStock(stock.symbol); onNavigate('analyzer'); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '15px' }}>{stock.symbol}</span>
                        {isLive && <Wifi size={10} color="#10b981" />}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>{stock.name.substring(0, 22)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#e2e8f0', fontWeight: 700 }}>${livePrice.toFixed(2)}</div>
                      <div style={{ color: changePct >= 0 ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                        {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                      </div>
                    </div>
                    <span style={{ marginLeft: '10px', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '12px',
                      background: stock.recommendation === 'BUY' ? 'rgba(16,185,129,0.15)' : stock.recommendation === 'SELL' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: stock.recommendation === 'BUY' ? '#10b981' : stock.recommendation === 'SELL' ? '#ef4444' : '#f59e0b' }}>
                      {stock.recommendation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Zap size={18} color="#f59e0b" />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Quick Analyze</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stocks.slice(0, 5).map(s => {
                const p   = getPrice(s.symbol);
                const pct = getChangePct(s.symbol);
                const isLive = !!quotes[s.symbol];
                return (
                  <button key={s.symbol} onClick={() => { onAnalyzeStock(s.symbol); onNavigate('analyzer'); }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', transition: 'all 0.2s', color: '#e2e8f0', width: '100%' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.1)')}>
                    <span style={{ fontWeight: 600 }}>{s.symbol} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '12px' }}>{s.name.substring(0, 15)}</span></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>${p.toFixed(2)}</span>
                      <span style={{ color: pct >= 0 ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 600 }}>{pct >= 0 ? '+' : ''}{pct.toFixed(2)}%</span>
                      {isLive && <Wifi size={10} color="#10b981" />}
                      <Search size={14} color="#3b82f6" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
              {[
                { label: 'Stocks Tracked', value: stocks.length.toString(), icon: <BarChart2 size={16} color="#3b82f6" /> },
                { label: 'Live Quotes', value: Object.keys(quotes).length.toString(), icon: <Wifi size={16} color="#10b981" /> },
                { label: 'AI Confidence', value: '84%', icon: <Brain size={16} color="#8b5cf6" /> },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#e2e8f0' }}>{stat.value}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Under pressure */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <TrendingDown size={18} color="#ef4444" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>Under Pressure</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topLosers.map(s => {
                const pct = getChangePct(s.symbol);
                const p   = getPrice(s.symbol);
                return (
                  <div key={s.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                    onClick={() => { onAnalyzeStock(s.symbol); onNavigate('analyzer'); }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{s.symbol}</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>${p.toFixed(2)}</span>
                      <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>{pct.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
