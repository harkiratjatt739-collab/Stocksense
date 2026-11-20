import React, { useState } from 'react';
import { TrendingUp, Brain, Shield, Newspaper, BarChart2, Star, Activity, GitCompare, Radio, Menu, X, MessageSquare } from 'lucide-react';
import type { Page } from '../types';
import { MARKET_INDICES } from '../data/stockData';
import { DataStatusBar } from './DataStatusBar';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={16} /> },
    { id: 'analyzer', label: 'AI Analyzer', icon: <Brain size={16} /> },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare size={16} /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare size={16} /> },
    { id: 'live', label: 'Live Prices', icon: <Radio size={16} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <TrendingUp size={16} /> },
    { id: 'watchlist', label: 'Watchlist', icon: <Star size={16} /> },
    { id: 'news', label: 'News', icon: <Newspaper size={16} /> },
    { id: 'risk', label: 'Risk Profile', icon: <Shield size={16} /> },
  ];

  const navigate = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      <nav style={{
        background: 'rgba(10,15,30,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(59,130,246,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Market ticker — hidden on small screens */}
        <div className="market-ticker-bar" style={{ background: 'rgba(59,130,246,0.05)', borderBottom: '1px solid rgba(59,130,246,0.1)', padding: '5px 0', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: '28px', padding: '0 20px', minWidth: 'max-content' }}>
            {MARKET_INDICES.map((idx) => (
              <div key={idx.symbol} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>{idx.name}</span>
                <span style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 700 }}>{idx.value}</span>
                <span style={{ color: idx.change >= 0 ? '#10b981' : '#ef4444', fontSize: '11px', fontWeight: 700 }}>
                  {idx.change >= 0 ? '+' : ''}{idx.change}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', gap: '8px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('dashboard')}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '9px', padding: '7px', display: 'flex' }}>
              <Activity size={18} color="white" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              StockSense AI
            </span>
            <span style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.3)' }}>BETA</span>
          </div>

          {/* Desktop nav links */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', flex: 1, padding: '0 12px' }}>
            {navItems.map((item) => (
              <button key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
                {item.icon}
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div className="hide-mobile">
              <DataStatusBar />
            </div>
            {/* Hamburger - mobile only */}
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(o => !o)}
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#3b82f6', display: 'none' }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(59,130,246,0.1)', background: 'rgba(10,15,30,0.98)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {navItems.map(item => (
                <button key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => navigate(item.id)} style={{ justifyContent: 'flex-start', fontSize: '13px' }}>
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Global responsive styles via style tag */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .market-ticker-bar { display: none !important; }
        }
        @media (max-width: 600px) {
          .nav-label { display: none; }
        }

        /* Responsive grid fixes */
        @media (max-width: 900px) {
          .two-col-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .metric-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .rec-buy, .rec-sell, .rec-hold { font-size: 15px !important; padding: 6px 16px !important; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
