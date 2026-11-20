import React, { useState } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { STOCKS } from '../data/stockData';
import type { Page } from '../types';

interface RiskAssessmentProps {
  onAnalyzeStock: (symbol: string) => void;
  onNavigate: (page: Page) => void;
}

const profiles = {
  conservative: {
    label: 'Conservative',
    description: 'Prioritize capital preservation. Low-volatility, dividend-paying blue-chip stocks.',
    color: '#10b981',
    icon: '🛡️',
    allocation: { 'Blue-Chip Stocks': 60, 'Bonds/Treasuries': 25, 'Growth Stocks': 10, 'Cash Equivalents': 5 },
    allocationColors: ['#3b82f6', '#10b981', '#8b5cf6', '#64748b'],
    recs: ['MSFT', 'AAPL', 'GOOGL'],
    rationale: 'Focus on large-cap, well-established companies with strong balance sheets and consistent dividends. Avoid speculative plays. Aim for 6-10% annual returns with minimal drawdowns.',
    maxDrawdown: '~10-15%',
    expectedReturn: '6-10%',
    timeHorizon: '5+ years',
  },
  moderate: {
    label: 'Moderate',
    description: 'Balance between growth and stability. Mix of blue-chips and high-quality growth stocks.',
    color: '#f59e0b',
    icon: '⚖️',
    allocation: { 'Growth Stocks': 45, 'Blue-Chip Stocks': 30, 'Speculative Plays': 15, 'Cash/Bonds': 10 },
    allocationColors: ['#8b5cf6', '#3b82f6', '#f59e0b', '#64748b'],
    recs: ['NVDA', 'AMZN', 'META', 'AAPL'],
    rationale: 'A balanced approach capturing AI and tech growth while maintaining positions in established companies. Expect higher volatility but superior long-term returns vs conservative approach.',
    maxDrawdown: '20-30%',
    expectedReturn: '12-18%',
    timeHorizon: '3-7 years',
  },
  aggressive: {
    label: 'Aggressive',
    description: 'Maximize growth potential. High-volatility, high-upside stocks and speculative plays.',
    color: '#ef4444',
    icon: '🚀',
    allocation: { 'High-Growth Stocks': 55, 'Speculative/AI Plays': 25, 'Emerging Markets': 12, 'Cash': 8 },
    allocationColors: ['#8b5cf6', '#f59e0b', '#06b6d4', '#64748b'],
    recs: ['NVDA', 'AMD', 'TSLA', 'META', 'BABA'],
    rationale: 'Concentrated bets on transformative technology and high-growth opportunities. Significant volatility expected — drawdowns of 30-50% are possible. Only suitable for investors with long time horizons and strong risk tolerance.',
    maxDrawdown: '30-50%',
    expectedReturn: '20-35%',
    timeHorizon: '7-15+ years',
  },
};


export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ onAnalyzeStock, onNavigate }) => {
  const [selected, setSelected] = useState<keyof typeof profiles | null>(null);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const questions = [
    {
      q: 'What is your investment time horizon?',
      options: ['Less than 1 year', '1-3 years', '3-7 years', '7+ years'],
      scores: { 'Less than 1 year': 'conservative', '1-3 years': 'conservative', '3-7 years': 'moderate', '7+ years': 'aggressive' },
    },
    {
      q: 'If your portfolio dropped 30%, what would you do?',
      options: ['Sell everything immediately', 'Sell some positions', 'Hold and wait', 'Buy more'],
      scores: { 'Sell everything immediately': 'conservative', 'Sell some positions': 'conservative', 'Hold and wait': 'moderate', 'Buy more': 'aggressive' },
    },
    {
      q: 'What is your primary investment goal?',
      options: ['Preserve capital', 'Generate income', 'Balanced growth', 'Maximum growth'],
      scores: { 'Preserve capital': 'conservative', 'Generate income': 'conservative', 'Balanced growth': 'moderate', 'Maximum growth': 'aggressive' },
    },
    {
      q: 'What percentage of savings can you afford to lose?',
      options: ['< 5%', '5-15%', '15-30%', '30%+'],
      scores: { '< 5%': 'conservative', '5-15%': 'conservative', '15-30%': 'moderate', '30%+': 'aggressive' },
    },
  ];

  const computeProfile = () => {
    const counts: Record<string, number> = { conservative: 0, moderate: 0, aggressive: 0 };
    questions.forEach((q, i) => {
      const ans = answers[i];
      if (ans && (q.scores as any)[ans]) counts[(q.scores as any)[ans]]++;
    });
    const result = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as keyof typeof profiles;
    setSelected(result);
    setStep(6);
  };

  const profile = selected ? profiles[selected] : null;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 800 }}><span className="gradient-text">AI Risk Assessment</span></h1>
        <p style={{ color: '#64748b', margin: 0 }}>Answer a few questions to get a personalized investment strategy tailored to your risk tolerance.</p>
      </div>

      {/* Manual selection */}
      {step === 1 && !selected && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {(Object.entries(profiles) as [keyof typeof profiles, typeof profiles.conservative][]).map(([key, p]) => (
              <div key={key} className="glass-card-hover" style={{ padding: '24px', cursor: 'pointer', border: `1px solid ${key === 'conservative' ? 'rgba(16,185,129,0.2)' : key === 'moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}` }}
                onClick={() => { setSelected(key); setStep(6); }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{p.icon}</div>
                <h3 style={{ margin: '0 0 8px 0', color: p.color, fontSize: '18px', fontWeight: 700 }}>{p.label}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{p.description}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <span style={{ color: '#64748b', fontSize: '14px' }}>— or take the questionnaire to get a personalized recommendation —</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Take Risk Quiz <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* Quiz */}
      {step >= 2 && step <= 5 && (
        <div className="glass-card" style={{ padding: '32px', maxWidth: '600px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Question {step - 1} of {questions.length}</span>
              <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 600 }}>{Math.round(((step - 2) / questions.length) * 100)}% complete</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((step - 2) / questions.length) * 100}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }}></div>
            </div>
          </div>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#e2e8f0', lineHeight: 1.5 }}>{questions[step - 2].q}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questions[step - 2].options.map(opt => (
              <button key={opt} onClick={() => {
                setAnswers(a => ({ ...a, [step - 2]: opt }));
                if (step < 5) setStep(s => s + 1);
                else computeProfile();
              }}
                style={{ background: answers[step - 2] === opt ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.05)', border: `1px solid ${answers[step - 2] === opt ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.15)'}`, borderRadius: '12px', padding: '14px 20px', color: '#e2e8f0', textAlign: 'left', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', fontWeight: answers[step - 2] === opt ? 600 : 400 }}>
                {opt}
              </button>
            ))}
          </div>
          {step > 2 && (
            <button onClick={() => setStep(s => s - 1)} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>
              ← Back
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {step === 6 && profile && selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile header */}
          <div className="glass-card" style={{ padding: '28px', background: `linear-gradient(135deg, ${profile.color}11, transparent)`, border: `1px solid ${profile.color}33` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>{profile.icon}</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800, color: profile.color }}>{profile.label} Investor</h2>
                <p style={{ color: '#cbd5e1', lineHeight: 1.7, maxWidth: '600px', margin: 0 }}>{profile.rationale}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Expected Return', value: profile.expectedReturn, color: '#10b981' },
                  { label: 'Max Drawdown', value: profile.maxDrawdown, color: '#ef4444' },
                  { label: 'Time Horizon', value: profile.timeHorizon, color: '#3b82f6' },
                ].map(m => (
                  <div key={m.label} className="glass-card" style={{ padding: '12px 20px', minWidth: '160px' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{m.label}</div>
                    <div style={{ color: m.color, fontSize: '18px', fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => { setSelected(null); setStep(1); setAnswers({}); }}
              style={{ marginTop: '16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 16px', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
              Retake Assessment
            </button>
          </div>

          {/* Allocation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Suggested Allocation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(profile.allocation).map(([label, pct], i) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{label}</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '13px' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: profile.allocationColors[i] }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>
                <span style={{ color: profile.color }}>AI-Recommended Stocks</span> for Your Profile
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.recs.map(sym => {
                  const stock = STOCKS[sym];
                  if (!stock) return null;
                  return (
                    <div key={sym} className="glass-card-hover" style={{ padding: '14px', borderRadius: '12px', cursor: 'pointer' }}
                      onClick={() => { onAnalyzeStock(sym); onNavigate('analyzer'); }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#3b82f6' }}>{sym} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '12px' }}>{stock.name.substring(0, 20)}</span></div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                            <span className={`risk-badge risk-${stock.riskLevel.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>{stock.riskLevel}</span>
                            <span style={{ color: stock.changePercent >= 0 ? '#10b981' : '#ef4444', fontSize: '12px', fontWeight: 600 }}>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#e2e8f0', fontWeight: 700 }}>${stock.price.toFixed(2)}</div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: stock.recommendation === 'BUY' ? '#10b981' : '#f59e0b' }}>
                            {stock.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700 }}>💡 Investment Tips for Your Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
              {[
                selected === 'conservative' ? 'Focus on dividend-paying stocks with 5+ year track records' : selected === 'moderate' ? 'Rebalance your portfolio quarterly to maintain target allocations' : 'Dollar-cost average into positions to reduce timing risk',
                selected === 'conservative' ? 'Keep 20-30% in cash or bonds for stability during downturns' : selected === 'moderate' ? 'Diversify across 8-15 stocks to reduce single-stock risk' : 'Set stop-loss orders at 15-20% below your buy price',
                selected === 'conservative' ? 'Avoid meme stocks, crypto, and highly speculative plays' : selected === 'moderate' ? 'Add 1-2 growth stocks per quarter as you research them' : 'Only invest money you can afford to lose for 5+ years',
                'Always diversify across multiple sectors to reduce correlation risk',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(59,130,246,0.05)', borderRadius: '10px', padding: '12px' }}>
                  <CheckCircle size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6 }}>{tip}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', fontSize: '12px', color: '#f59e0b', lineHeight: 1.6 }}>
              ⚠️ <strong>Disclaimer:</strong> These are AI-generated recommendations for educational purposes only. This is not financial advice. Past performance is not indicative of future results. Consult a licensed financial advisor before investing.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
