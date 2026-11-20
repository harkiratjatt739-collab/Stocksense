import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Trash2, PieChart, DollarSign } from 'lucide-react';
import { STOCKS } from '../data/stockData';
import type { PortfolioItem } from '../types';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', quantity: 10, buyPrice: 175.00, currentPrice: STOCKS.AAPL.price },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', quantity: 5, buyPrice: 720.00, currentPrice: STOCKS.NVDA.price },
    { symbol: 'MSFT', name: 'Microsoft Corporation', quantity: 8, buyPrice: 380.00, currentPrice: STOCKS.MSFT.price },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symbol: '', quantity: '', buyPrice: '' });
  const [error, setError] = useState('');

  const addToPortfolio = () => {
    const sym = form.symbol.toUpperCase();
    if (!STOCKS[sym]) { setError('Stock symbol not found. Try AAPL, NVDA, TSLA, etc.'); return; }
    if (!form.quantity || !form.buyPrice) { setError('Please fill all fields.'); return; }
    const stock = STOCKS[sym];
    setPortfolio(prev => [...prev, {
      symbol: sym,
      name: stock.name,
      quantity: parseFloat(form.quantity),
      buyPrice: parseFloat(form.buyPrice),
      currentPrice: stock.price,
    }]);
    setForm({ symbol: '', quantity: '', buyPrice: '' });
    setShowForm(false);
    setError('');
  };

  const remove = (sym: string) => setPortfolio(prev => prev.filter(p => p.symbol !== sym));

  const totalValue = portfolio.reduce((acc, p) => acc + p.quantity * p.currentPrice, 0);
  const totalCost = portfolio.reduce((acc, p) => acc + p.quantity * p.buyPrice, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const pieData = portfolio.map(p => ({
    name: p.symbol,
    value: parseFloat((p.quantity * p.currentPrice).toFixed(2)),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0d1117', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '8px 12px' }}>
          <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 700 }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: '#3b82f6' }}>${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 800 }}><span className="gradient-text">My Portfolio</span></h1>
          <p style={{ color: '#64748b', margin: 0 }}>Track your investments and monitor performance in real-time.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add Stock
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(59,130,246,0.3)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Add Stock to Portfolio</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input className="input-field" style={{ flex: '1', minWidth: '120px' }} placeholder="Symbol (e.g. AAPL)" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} />
            <input className="input-field" style={{ flex: '1', minWidth: '120px' }} type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            <input className="input-field" style={{ flex: '1', minWidth: '150px' }} type="number" placeholder="Buy Price ($)" value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))} />
            <button className="btn-primary" onClick={addToPortfolio}>Add</button>
            <button onClick={() => { setShowForm(false); setError(''); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#94a3b8', padding: '10px 16px', cursor: 'pointer' }}>Cancel</button>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>Available: {Object.keys(STOCKS).join(', ')}</p>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#e2e8f0', icon: <DollarSign size={18} color="#3b82f6" /> },
          { label: 'Total Cost', value: `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#94a3b8', icon: <DollarSign size={18} color="#64748b" /> },
          { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? '#10b981' : '#ef4444', icon: totalPnl >= 0 ? <TrendingUp size={18} color="#10b981" /> : <TrendingDown size={18} color="#ef4444" /> },
          { label: 'Return %', value: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`, color: totalPnlPct >= 0 ? '#10b981' : '#ef4444', icon: <TrendingUp size={18} color={totalPnlPct >= 0 ? '#10b981' : '#ef4444'} /> },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>{s.icon}<span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</span></div>
            <div style={{ color: s.color, fontSize: '22px', fontWeight: 800 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px, 340px)', gap: '20px', flexWrap: 'wrap' }}>
        {/* Holdings table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Holdings</h3>
          {portfolio.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No stocks added yet. Click "Add Stock" to get started.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Symbol', 'Name', 'Qty', 'Buy Price', 'Current', 'Value', 'P&L', 'Return', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((p, i) => {
                    const value = p.quantity * p.currentPrice;
                    const pnl = (p.currentPrice - p.buyPrice) * p.quantity;
                    const pnlPct = ((p.currentPrice - p.buyPrice) / p.buyPrice) * 100;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#3b82f6' }}>{p.symbol}</td>
                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: '13px' }}>{p.name.substring(0, 18)}</td>
                        <td style={{ padding: '12px', color: '#e2e8f0' }}>{p.quantity}</td>
                        <td style={{ padding: '12px', color: '#94a3b8' }}>${p.buyPrice.toFixed(2)}</td>
                        <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>${p.currentPrice.toFixed(2)}</td>
                        <td style={{ padding: '12px', color: '#e2e8f0', fontWeight: 600 }}>${value.toFixed(2)}</td>
                        <td style={{ padding: '12px', color: pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</td>
                        <td style={{ padding: '12px', color: pnlPct >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</td>
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => remove(p.symbol)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', padding: '4px' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <PieChart size={18} color="#8b5cf6" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Allocation</h3>
          </div>
          {portfolio.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Add stocks to see allocation</div>
          )}
        </div>
      </div>
    </div>
  );
};
