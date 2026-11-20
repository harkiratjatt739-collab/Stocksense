import React from 'react';
import { Wifi, WifiOff, Loader, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStockData } from '../context/StockDataContext';
import type { DataStatus } from '../context/StockDataContext';

const STATUS_CONFIG: Record<DataStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  idle:    { label: 'Initialising…', color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', icon: <Loader size={12} /> },
  loading: { label: 'Fetching live data…', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', icon: <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> },
  live:    { label: 'All data LIVE', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', icon: <CheckCircle size={12} /> },
  partial: { label: 'Partial live data', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', icon: <AlertTriangle size={12} /> },
  error:   { label: 'Using simulated data', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: <WifiOff size={12} /> },
};

export const DataStatusBar: React.FC = () => {
  const { status, lastUpdated, liveCount, totalCount, refreshAll } = useStockData();
  const cfg = STATUS_CONFIG[status];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '6px 16px',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: '20px',
      fontSize: '12px',
      color: cfg.color,
      fontWeight: 600,
      flexShrink: 0,
    }}>
      {status === 'live' || status === 'partial'
        ? <Wifi size={12} />
        : cfg.icon}
      <span>
        {cfg.label}
        {(status === 'live' || status === 'partial') && ` — ${liveCount}/${totalCount} stocks`}
      </span>
      {lastUpdated && (
        <span style={{ color: cfg.color, opacity: 0.7, fontWeight: 400 }}>
          · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}
      <button
        onClick={refreshAll}
        disabled={status === 'loading'}
        title="Refresh now"
        style={{
          background: 'none',
          border: 'none',
          cursor: status === 'loading' ? 'default' : 'pointer',
          color: cfg.color,
          display: 'flex',
          padding: '0 2px',
          opacity: status === 'loading' ? 0.5 : 1,
        }}
      >
        <RefreshCw size={12} style={{ animation: status === 'loading' ? 'spin 1s linear infinite' : 'none' }} />
      </button>
    </div>
  );
};
