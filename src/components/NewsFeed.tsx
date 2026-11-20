import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { NEWS_ITEMS } from '../data/stockData';
import type { Page } from '../types';

interface NewsFeedProps {
  onAnalyzeStock: (symbol: string) => void;
  onNavigate: (page: Page) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ onAnalyzeStock, onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  const filtered = filter === 'all' ? NEWS_ITEMS : NEWS_ITEMS.filter(n => n.sentiment === filter);

  const sentimentIcon = (s: string) => {
    if (s === 'positive') return <TrendingUp size={14} color="#10b981" />;
    if (s === 'negative') return <TrendingDown size={14} color="#ef4444" />;
    return <Minus size={14} color="#94a3b8" />;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 800 }}><span className="gradient-text">Market News</span></h1>
        <p style={{ color: '#64748b', margin: 0 }}>Latest financial news with AI-powered sentiment analysis.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All News' },
          { id: 'positive', label: '📈 Bullish' },
          { id: 'negative', label: '📉 Bearish' },
          { id: 'neutral', label: '➡️ Neutral' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id as any)}
            className={`nav-item ${filter === f.id ? 'active' : ''}`} style={{ fontSize: '13px' }}>
            {f.label}
          </button>
        ))}
        <span style={{ color: '#64748b', fontSize: '12px', alignSelf: 'center', marginLeft: '8px' }}>{filtered.length} articles</span>
      </div>

      {/* News grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(news => (
          <div key={news.id} className="glass-card-hover" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span className={`tag tag-${news.sentiment}`}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {sentimentIcon(news.sentiment)}
                      {news.sentiment.charAt(0).toUpperCase() + news.sentiment.slice(1)}
                    </span>
                  </span>
                  {news.relatedStock && (
                    <button onClick={() => { onAnalyzeStock(news.relatedStock!); onNavigate('analyzer'); }}
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', padding: '2px 10px', color: '#3b82f6', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                      ${news.relatedStock}
                    </button>
                  )}
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{news.source}</span>
                  <span style={{ color: '#475569', fontSize: '12px' }}>• {news.time}</span>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.5 }}>{news.title}</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{news.summary}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: news.sentiment === 'positive' ? 'rgba(16,185,129,0.1)' : news.sentiment === 'negative' ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)',
                  border: `1px solid ${news.sentiment === 'positive' ? 'rgba(16,185,129,0.2)' : news.sentiment === 'negative' ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.1)'}` }}>
                  {news.sentiment === 'positive' ? <TrendingUp size={22} color="#10b981" /> : news.sentiment === 'negative' ? <TrendingDown size={22} color="#ef4444" /> : <Minus size={22} color="#94a3b8" />}
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}>
                  <ExternalLink size={12} /> Read More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sentiment summary */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Market Sentiment Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
          {[
            { label: 'Bullish', count: NEWS_ITEMS.filter(n => n.sentiment === 'positive').length, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
            { label: 'Neutral', count: NEWS_ITEMS.filter(n => n.sentiment === 'neutral').length, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
            { label: 'Bearish', count: NEWS_ITEMS.filter(n => n.sentiment === 'negative').length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '16px', background: s.bg, borderRadius: '12px', border: `1px solid ${s.border}` }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>{s.label} Articles</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Overall Market Sentiment</span>
            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 700 }}>Moderately Bullish</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(NEWS_ITEMS.filter(n => n.sentiment === 'positive').length / NEWS_ITEMS.length) * 100}%`, background: 'linear-gradient(90deg,#10b981,#059669)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
