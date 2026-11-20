import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, User, Sparkles, TrendingUp, RefreshCw, ChevronRight, Copy, Check } from 'lucide-react';
import { STOCKS } from '../data/stockData';
import type { Stock } from '../types';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── AI Brain: smart context-aware response engine ───────────────────────────

function findMentionedStock(text: string): Stock | null {
  const upper = text.toUpperCase();
  for (const sym of Object.keys(STOCKS)) {
    if (upper.includes(sym)) return STOCKS[sym];
  }
  for (const s of Object.values(STOCKS)) {
    if (text.toLowerCase().includes(s.name.toLowerCase().split(' ')[0].toLowerCase())) return s;
  }
  return null;
}

function generateResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase().trim();
  const stock = findMentionedStock(userMsg);

  // ── Stock-specific questions ──
  if (stock) {
    const s = stock;
    const isUp = s.changePercent >= 0;

    if (/(buy|should i buy|worth buying|good buy|purchase)/i.test(msg)) {
      return `**Should you buy ${s.symbol}?**\n\nMy AI analysis gives ${s.symbol} a **${s.recommendation}** signal with **${s.confidence}% confidence**.\n\n${s.recommendation === 'BUY' ? `✅ **Bullish case:** ${s.advantages[0]}. ${s.advantages[1]}.\n\n${s.aiAnalysis.substring(0, 200)}...` : s.recommendation === 'SELL' ? `🚨 **Caution:** ${s.risks[0]}. ${s.risks[1]}.\n\n${s.aiAnalysis.substring(0, 200)}...` : `⚖️ **Mixed signals:** ${s.aiAnalysis.substring(0, 220)}...`}\n\n**Key metrics:** Price $${s.price.toFixed(2)} | P/E ${s.peRatio > 0 ? s.peRatio.toFixed(1) + 'x' : 'N/A'} | Risk: ${s.riskLevel}\n\n⚠️ *This is not financial advice — always do your own research.*`;
    }

    if (/(risk|risky|danger|safe)/i.test(msg)) {
      return `**${s.symbol} Risk Assessment — ${s.riskLevel} RISK**\n\n${s.name} carries a **${s.riskLevel.toLowerCase()} risk** profile. Here's why:\n\n**Key risk factors:**\n${s.risks.map(r => `• ${r}`).join('\n')}\n\n**Mitigating factors:**\n${s.advantages.slice(0, 3).map(a => `• ${a}`).join('\n')}\n\nFor ${s.riskLevel === 'LOW' ? 'conservative investors, this is generally suitable. For aggressive investors, it may feel too slow.' : s.riskLevel === 'MEDIUM' ? 'moderate risk investors, this fits well in a diversified portfolio.' : 'aggressive investors only — position size carefully and be prepared for 30-50% drawdowns.'}`;
    }

    if (/(price target|target price|prediction|forecast|price forecast)/i.test(msg)) {
      return `**${s.symbol} Price Target Analysis**\n\nCurrent price: **$${s.price.toFixed(2)}**\nAI Signal: **${s.recommendation}** (${s.confidence}% confidence)\n\n**12-month target range:**\n• Bear case: $${(s.low52w * 0.95).toFixed(0)}\n• Base case: $${(((s.high52w + s.low52w) / 2) * 1.05).toFixed(0)}\n• Bull case: $${(s.high52w * 1.1).toFixed(0)}\n\nBased on the AI analysis: *${s.aiAnalysis.substring(0, 180)}...*\n\n📊 52-week range: $${s.low52w} – $${s.high52w}\n\n⚠️ *Price targets are estimates, not guarantees.*`;
    }

    if (/(compare|vs|versus|better than|difference)/i.test(msg)) {
      const other = Object.values(STOCKS).find(x => x.symbol !== s.symbol && userMsg.toUpperCase().includes(x.symbol));
      if (other) {
        const winner = s.confidence > other.confidence ? s : other;
        return `**${s.symbol} vs ${other.symbol} — Head-to-Head**\n\n| Metric | ${s.symbol} | ${other.symbol} |\n|--------|-------|-------|\n| Price | $${s.price.toFixed(2)} | $${other.price.toFixed(2)} |\n| Change | ${s.changePercent >= 0 ? '+' : ''}${s.changePercent.toFixed(2)}% | ${other.changePercent >= 0 ? '+' : ''}${other.changePercent.toFixed(2)}% |\n| P/E Ratio | ${s.peRatio > 0 ? s.peRatio.toFixed(1) + 'x' : 'N/A'} | ${other.peRatio > 0 ? other.peRatio.toFixed(1) + 'x' : 'N/A'} |\n| AI Signal | ${s.recommendation} | ${other.recommendation} |\n| Confidence | ${s.confidence}% | ${other.confidence}% |\n| Risk | ${s.riskLevel} | ${other.riskLevel} |\n\n**AI Verdict:** ${winner.symbol} has the edge with ${winner.confidence}% confidence on a ${winner.recommendation} signal.\n\n${winner.aiAnalysis.substring(0, 180)}...`;
      }
    }

    if (/(dividend|income|yield)/i.test(msg)) {
      return `**${s.symbol} Dividend & Income Analysis**\n\n${s.sector === 'Banking' || s.symbol === 'AAPL' || s.symbol === 'MSFT' || s.symbol === 'V' ? `${s.name} **pays a dividend**, making it suitable for income-focused investors. Blue-chip dividend payers typically offer stability and passive income.\n\nFor precise dividend yield and payment schedule, check the company's investor relations page or your broker's data feed — dividend rates can change quarterly.` : `${s.name} is primarily a **growth stock** and ${s.symbol === 'TSLA' || s.symbol === 'NVDA' || s.symbol === 'AMD' || s.symbol === 'META' || s.symbol === 'NFLX' || s.symbol === 'COIN' ? 'does not currently pay a meaningful dividend. The company reinvests earnings into growth.' : 'may pay a small or no dividend, prioritizing capital appreciation over income.'}`}\n\nFor income-focused investing, consider: **JPM**, **V**, **AAPL**, **MSFT** — these have consistent dividend track records.\n\n*Always verify current dividend data with your broker before investing.*`;
    }

    if (/(analysis|analyze|tell me about|what do you think|overview|summary)/i.test(msg)) {
      return `**${s.symbol} — ${s.name}**\n📈 **$${s.price.toFixed(2)}** (${isUp ? '+' : ''}${s.changePercent.toFixed(2)}% today)\n\n**Sector:** ${s.sector} | **Risk:** ${s.riskLevel} | **AI Signal:** ${s.recommendation} (${s.confidence}%)\n\n${s.description}\n\n**🟢 Top Advantages:**\n${s.advantages.slice(0, 3).map(a => `• ${a}`).join('\n')}\n\n**🔴 Key Risks:**\n${s.risks.slice(0, 3).map(r => `• ${r}`).join('\n')}\n\n**💡 AI Analysis:**\n${s.aiAnalysis.substring(0, 300)}...\n\n**📊 Metrics:** Market Cap ${s.marketCap} | P/E ${s.peRatio > 0 ? s.peRatio.toFixed(1) + 'x' : 'N/A'} | EPS $${s.eps.toFixed(2)} | Volume ${s.volume}`;
    }

    // Default stock response
    return `**${s.symbol} Quick Stats**\n\n• **Price:** $${s.price.toFixed(2)} (${isUp ? '+' : ''}${s.changePercent.toFixed(2)}% today)\n• **AI Recommendation:** ${s.recommendation} with ${s.confidence}% confidence\n• **Risk Level:** ${s.riskLevel}\n• **Sector:** ${s.sector}\n• **Market Cap:** ${s.marketCap}\n• **P/E Ratio:** ${s.peRatio > 0 ? s.peRatio.toFixed(1) + 'x' : 'N/A (net loss)'}\n\n${s.aiAnalysis.substring(0, 250)}...\n\nWant me to do a **full analysis**, **risk breakdown**, or **compare** ${s.symbol} to another stock? Just ask!`;
  }

  // ── General investing knowledge ──

  if (/(what is|explain|define|how does|tell me about)\s+(pe|p\/e|price.to.earnings)/i.test(msg)) {
    return `**What is P/E Ratio (Price-to-Earnings)?**\n\nThe **P/E ratio** tells you how much investors are willing to pay for every \$1 of a company's earnings.\n\n**Formula:** P/E = Stock Price ÷ Earnings Per Share (EPS)\n\n**How to interpret:**\n• **Low P/E (< 15x):** May be undervalued or in a slow-growth sector (e.g., banking, utilities)\n• **Medium P/E (15–30x):** Typical for established growth companies\n• **High P/E (> 40x):** Priced for high future growth — risky if growth disappoints\n\n**Examples in our tracked stocks:**\n• GOOGL: ~23x (cheap for Big Tech)\n• MSFT: ~35x (fair for its growth)\n• AMD: ~115x (priced for massive AI growth)\n• INTC: N/A (currently losing money)\n\n**Key insight:** P/E is most useful when comparing companies *within the same sector*.`;
  }

  if (/(what is|explain|define|how does|tell me about)\s+(market cap|market capitalization)/i.test(msg)) {
    return `**What is Market Capitalization?**\n\nMarket Cap = **Share Price × Total Shares Outstanding**\n\nIt represents the total market value of a company.\n\n**Categories:**\n• 🔵 **Mega-cap:** > \$200B (Apple \$2.9T, NVIDIA \$2.1T)\n• 🟢 **Large-cap:** \$10B–\$200B (stable, established companies)\n• 🟡 **Mid-cap:** \$2B–\$10B (growth potential, moderate risk)\n• 🔴 **Small-cap:** < \$2B (high risk, high reward)\n\n**Why it matters:** Larger companies are generally more stable but have less explosive growth potential. Smaller caps can grow faster but are more volatile.\n\nIn our portfolio, **Apple (\$2.94T)** is the largest, while **PayPal (\$91B)** is on the smaller end of large-cap.`;
  }

  if (/(what is|explain|how does|tell me about)\s+(short selling|short sell|shorting)/i.test(msg)) {
    return `**What is Short Selling?**\n\nShort selling is a strategy where you **profit when a stock falls** in price.\n\n**How it works:**\n1. Borrow shares from your broker\n2. Sell them at the current price\n3. Wait for the price to drop\n4. Buy them back cheaper\n5. Return shares & keep the difference (minus fees)\n\n**Example:**\n• Short 100 shares of TSLA at \$250 → receive \$25,000\n• Price falls to \$200 → buy back for \$20,000\n• **Profit: \$5,000** (minus borrowing costs)\n\n**⚠️ Key Risks:**\n• Losses are **theoretically unlimited** (stock can keep rising)\n• Short squeeze can amplify losses dramatically (GameStop 2021)\n• Borrowing fees can be expensive\n• Not suitable for beginners\n\n*Short selling is an advanced strategy — consult a financial advisor.*`;
  }

  if (/(what is|explain|tell me about)\s+(etf|exchange traded fund)/i.test(msg)) {
    return `**What is an ETF (Exchange-Traded Fund)?**\n\nAn ETF is a **basket of stocks** that trades on an exchange like a single stock. It's the easiest way to diversify instantly.\n\n**Popular ETFs:**\n• **SPY / VOO** — tracks the S&P 500 (top 500 US companies)\n• **QQQ** — NASDAQ 100 (tech-heavy)\n• **VTI** — Total US stock market\n• **ARKK** — Cathie Wood's innovation ETF (high risk)\n\n**Benefits:**\n✅ Instant diversification\n✅ Low fees (as low as 0.03%/year)\n✅ No need to pick individual stocks\n✅ Tax efficient\n\n**Drawback:** You'll never beat the market — you'll match it.\n\nFor beginners, **SPY + QQQ** is a classic starter portfolio that many professional investors recommend.`;
  }

  if (/(what is|explain|tell me about)\s+(dollar cost averaging|dca)/i.test(msg)) {
    return `**Dollar-Cost Averaging (DCA)**\n\nDCA means investing a **fixed amount regularly** (e.g., \$500/month) regardless of the stock price — instead of trying to "time the market."\n\n**How it helps:**\n• You buy **more shares when prices are low** and fewer when high\n• Removes emotional decision-making\n• Works especially well over long time horizons (5–20 years)\n\n**Example — investing \$500/month in NVDA:**\n| Month | Price | Shares Bought |\n|-------|-------|---------------|\n| Jan | \$875 | 0.57 |\n| Feb | \$780 | 0.64 |\n| Mar | \$920 | 0.54 |\n| **Avg** | **\$825** | **1.75** |\n\nYou automatically bought more during the dip!\n\n**Research shows:** DCA beats lump-sum investing in ~70% of historical cases when markets are volatile. Perfect for salaried investors.`;
  }

  if (/(best stock|top stock|which stock|recommend|what should i buy|what to buy)/i.test(msg)) {
    const buys = Object.values(STOCKS).filter(s => s.recommendation === 'BUY').sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    return `**Top AI-Recommended Stocks Right Now**\n\n${buys.map((s, i) => `${i + 1}. **${s.symbol}** — ${s.name}\n   Signal: ${s.recommendation} | Confidence: ${s.confidence}% | Risk: ${s.riskLevel}\n   *${s.aiAnalysis.substring(0, 100)}...*`).join('\n\n')}\n\n**My top pick:** ${buys[0].symbol} with ${buys[0].confidence}% confidence — ${buys[0].advantages[0].substring(0, 80)}.\n\n⚠️ *Always diversify and never invest money you can't afford to lose.*`;
  }

  if (/(portfolio|how to invest|start investing|beginner|getting started)/i.test(msg)) {
    return `**How to Build a Starter Investment Portfolio**\n\n**Step 1 — Emergency fund first**\nBefore investing, have 3–6 months of expenses in a savings account.\n\n**Step 2 — Choose your risk profile**\n• 🛡️ Conservative → 60% blue-chips + 30% bonds + 10% cash\n• ⚖️ Moderate → 50% growth stocks + 30% blue-chips + 20% ETFs\n• 🚀 Aggressive → 70% growth/AI stocks + 20% speculative + 10% crypto\n\n**Step 3 — Diversify**\nNever put more than 5–10% in a single stock. Spread across sectors:\n• Tech: AAPL, MSFT, NVDA, GOOGL\n• Finance: JPM, V\n• Consumer: AMZN, META\n• Growth: AMD, UBER\n\n**Step 4 — Dollar-cost average**\nInvest a fixed amount every month — don't try to time the market.\n\n**Step 5 — Think long-term**\nThe best investors hold for 5–20 years. Time in market > timing the market.\n\nUse our **Risk Assessment** tab for a personalized strategy! 🎯`;
  }

  if (/(ai stock|ai investing|ai market|artificial intelligence stock)/i.test(msg)) {
    const aiStocks = ['NVDA', 'MSFT', 'AMD', 'GOOGL', 'META'].map(s => STOCKS[s]);
    return `**Top AI-Focused Stocks to Watch**\n\nArtificial Intelligence is the most significant tech investment theme of the decade. Here are the key players:\n\n${aiStocks.map(s => `**${s.symbol}** — ${s.name}\nPrice: \$${s.price.toFixed(2)} | Signal: ${s.recommendation} | Confidence: ${s.confidence}%\n*${s.advantages[0]}*\n`).join('\n')}\n**AI Infrastructure hierarchy:**\n1. **Chips (NVDA, AMD)** — The shovels in the AI gold rush\n2. **Cloud (MSFT, GOOGL, AMZN)** — AI compute platforms\n3. **Applications (META, CRM)** — AI-powered software\n\nFor maximum AI exposure, **NVDA** remains our highest conviction pick at 91% confidence.`;
  }

  if (/(crypto|bitcoin|ethereum|coinbase|coin)/i.test(msg)) {
    const coin = STOCKS['COIN'];
    return `**Crypto & Digital Assets**\n\nFor crypto exposure through traditional stocks, **COIN (Coinbase)** is the primary option:\n\n**COIN:** $${coin.price.toFixed(2)} | Signal: ${coin.recommendation} | Risk: ${coin.riskLevel}\n*${coin.aiAnalysis.substring(0, 200)}...*\n\n**Direct crypto investing:**\n• Bitcoin (BTC) — Digital gold, store of value\n• Ethereum (ETH) — Smart contract platform\n• Solana (SOL) — High-speed blockchain\n\n**Current market:** Bitcoin is trading around \$68,420 (+2.31% today)\n\n⚠️ **Crypto risk warning:** Crypto assets are highly speculative, unregulated in many jurisdictions, and can lose 80–90% of value in bear markets. Only invest what you're prepared to lose entirely.\n\n**Max crypto allocation:** Most financial advisors suggest no more than 5–10% of your portfolio.`;
  }

  if (/(inflation|interest rate|federal reserve|fed|recession|economic)/i.test(msg)) {
    return `**Macroeconomic Outlook & Impact on Stocks**\n\n**Current Situation:**\n• The Federal Reserve has signaled a potential rate cut in December\n• Inflation trending toward the 2% target\n• Labor market remains resilient with low unemployment\n\n**How interest rates affect stocks:**\n• **Rate cuts → 🟢 Bullish** for growth stocks (lower discount rate = higher valuations)\n• **Rate hikes → 🔴 Bearish** for high-P/E growth stocks\n\n**Stocks that benefit from rate cuts:**\n• Growth tech (NVDA, META, AMZN, MSFT)\n• High-multiple stocks (SHOP, CRM, COIN)\n\n**Defensive plays in uncertainty:**\n• JPMorgan (JPM) — benefits from both high and low rates\n• Visa (V) — volume-based, less rate-sensitive\n• Apple (AAPL) — fortress balance sheet\n\n**Recession-resistant sectors:** Healthcare, utilities, consumer staples, and big-tech with recurring revenue.`;
  }

  if (/(hello|hi|hey|good morning|good evening|greet)/i.test(msg)) {
    return `👋 **Hello! I'm StockSense AI Assistant.**\n\nI can help you with:\n\n📈 **Stock Analysis** — Ask about any stock (AAPL, TSLA, NVDA...)\n💡 **Investing Concepts** — P/E ratio, ETFs, DCA, short selling...\n🎯 **Buy/Sell Advice** — "Should I buy NVDA?" or "Is AAPL risky?"\n🔀 **Stock Comparisons** — "AAPL vs MSFT which is better?"\n📰 **Market Trends** — AI stocks, crypto, interest rates...\n🏗️ **Portfolio Building** — How to get started investing\n\nJust ask me anything in plain English — no finance degree needed! 😊`;
  }

  if (/(thank|thanks|great|awesome|helpful)/i.test(msg)) {
    return `You're welcome! 😊 Feel free to ask me anything else about stocks, markets, or investing. That's what I'm here for!\n\n**Quick suggestions:**\n• "Compare NVDA vs AMD"\n• "What is a good beginner portfolio?"\n• "Is Bitcoin a good investment?"\n• "What are the top AI stocks right now?"`;
  }

  if (/(help|what can you do|capabilities|features)/i.test(msg)) {
    return `**StockSense AI — What I Can Help With**\n\n🔍 **Stock Specific:**\n• Analysis of any tracked stock (AAPL, TSLA, NVDA, MSFT, GOOGL, AMZN, META, AMD, NFLX, JPM, V, DIS, PYPL, UBER, SHOP, CRM, INTC, COIN, BABA)\n• Buy/Sell/Hold recommendations with reasoning\n• Risk assessment per stock\n• Price target ranges\n• Head-to-head stock comparisons\n\n📚 **Finance Education:**\n• Explain P/E ratio, market cap, EPS, short selling\n• ETFs, index funds, DCA strategy\n• Portfolio construction for beginners\n\n🌍 **Market Insights:**\n• AI & technology sector outlook\n• Crypto and digital assets\n• Macroeconomic impact (rates, inflation)\n• Sector rotation strategies\n\nJust type your question naturally!`;
  }

  // Fallback
  return `I don't have specific data on that exact query, but here's what I can help with:\n\n**Stock questions:** Ask about any of our 20 tracked stocks — AAPL, TSLA, NVDA, MSFT, GOOGL, AMZN, META, AMD, NFLX, JPM, V, DIS, PYPL, UBER, SHOP, CRM, INTC, COIN, BABA, or BABA.\n\n**Try asking:**\n• *"Should I buy NVDA?"*\n• *"What is the risk of Tesla?"*\n• *"Compare Apple vs Microsoft"*\n• *"What is a P/E ratio?"*\n• *"Best AI stocks to buy"*\n• *"How do I build a portfolio?"*\n\nI'm best at stock analysis, investing concepts, and market insights. Type **"help"** to see all my capabilities!`;
}

// ─── Suggested questions ─────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Should I buy NVDA right now?",
  "Compare AAPL vs MSFT",
  "What are the top AI stocks?",
  "What is a P/E ratio?",
  "Is TSLA risky?",
  "How do I build a beginner portfolio?",
  "What's your take on COIN?",
  "Explain dollar-cost averaging",
  "Best stocks for 2025?",
  "What is short selling?",
];

// ─── Component ────────────────────────────────────────────────────────────────
export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: `👋 **Welcome to StockSense AI Chat!**\n\nI'm your AI-powered financial assistant. Ask me **anything** about:\n\n• 📈 Specific stocks (buy/sell/hold, risks, analysis)\n• 🔀 Stock comparisons ("NVDA vs AMD")\n• 💡 Investing concepts (P/E ratio, ETFs, DCA)\n• 🤖 AI & tech sector trends\n• 🏗️ Portfolio building strategies\n\nJust type your question below — I'm ready to help!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;
    setInput('');

    const userMsg: Message = { id: Date.now(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI thinking time (600–1400ms)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const reply = generateResponse(content);
    const assistantMsg: Message = { id: Date.now() + 1, role: 'assistant', content: reply, timestamp: new Date() };
    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const copyMessage = (id: number, content: string) => {
    navigator.clipboard.writeText(content.replace(/\*\*/g, '').replace(/\*/g, ''));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([{
      id: 0, role: 'assistant',
      content: `Chat cleared! Ask me anything about stocks or investing. 🚀`,
      timestamp: new Date(),
    }]);
  };

  // Simple markdown-to-JSX renderer
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} style={{ color: '#e2e8f0' }}>{part.slice(2, -2)}</strong>;
        }
        // Italic
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={j} style={{ color: '#94a3b8' }}>{part.slice(1, -1)}</em>;
        }
        return <span key={j}>{part}</span>;
      });

      // Bullets
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '8px' }}>
          <span style={{ color: '#3b82f6', flexShrink: 0 }}>•</span>
          <span>{parts}</span>
        </div>;
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        return <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '8px' }}>
          <span style={{ color: '#3b82f6', flexShrink: 0, fontWeight: 700 }}>{line.match(/^\d+/)?.[0]}.</span>
          <span>{parts}</span>
        </div>;
      }
      // Table row
      if (line.startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '');
        if (cells.every(c => /^[-:\s]+$/.test(c))) return null; // separator row
        const isHeader = i > 0 && text.split('\n')[i - 1]?.startsWith('|');
        return <tr key={i}>
          {cells.map((cell, j) => {
            const Tag = !isHeader ? 'th' : 'td';
            return <Tag key={j} style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: !isHeader ? '#3b82f6' : '#cbd5e1', fontSize: '12px', textAlign: 'left', fontWeight: !isHeader ? 700 : 400 }}>
              {cell.trim()}
            </Tag>;
          })}
        </tr>;
      }
      // Blank line
      if (line === '') return <div key={i} style={{ height: '8px' }} />;
      // Heading (line with mostly **)
      return <div key={i} style={{ marginBottom: '2px', lineHeight: 1.65 }}>{parts}</div>;
    }).filter(Boolean);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', maxWidth: '900px', margin: '0 auto', padding: '24px 24px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '12px', padding: '10px', display: 'flex' }}>
            <Brain size={22} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}><span className="gradient-text">AI Chat Assistant</span></h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Ask anything about stocks, markets & investing</p>
          </div>
        </div>
        <button onClick={clearChat} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}>
          <RefreshCw size={13} /> Clear
        </button>
      </div>

      {/* Suggestions */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {SUGGESTIONS.slice(0, 5).map((s, i) => (
          <button key={i} onClick={() => sendMessage(s)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '20px', padding: '6px 14px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; e.currentTarget.style.color = '#3b82f6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}>
            <Sparkles size={12} /> {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
              {msg.role === 'user' ? <User size={18} color="white" /> : <Brain size={18} color="white" />}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: '80%', position: 'relative' }}>
              <div style={{
                padding: '14px 18px',
                borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))'
                  : 'rgba(13,17,35,0.8)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(59,130,246,0.15)'}`,
                backdropFilter: 'blur(10px)',
              }}>
                {/* Table wrapper for table rows */}
                {msg.content.includes('|') ? (
                  <div>
                    {msg.content.split('\n').reduce((acc: React.ReactNode[], line, _i) => {
                      if (line.startsWith('|')) {
                        const lastEl = acc[acc.length - 1];
                        const isTableArr = Array.isArray(lastEl);
                        if (isTableArr) {
                          (lastEl as React.ReactNode[]).push(renderContent(line));
                        } else {
                          acc.push([renderContent(line)]);
                        }
                      } else {
                        const lastEl = acc[acc.length - 1];
                        if (Array.isArray(lastEl)) {
                          acc.push(renderContent(line));
                        } else {
                          acc.push(renderContent(line));
                        }
                      }
                      return acc;
                    }, []).map((el, i) =>
                      Array.isArray(el)
                        ? <table key={i} style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0', fontSize: '13px' }}><tbody>{el}</tbody></table>
                        : <div key={i}>{el}</div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '14px', lineHeight: 1.7, color: '#cbd5e1' }}>
                    {renderContent(msg.content)}
                  </div>
                )}
              </div>
              {/* Timestamp + copy */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <span style={{ color: '#475569', fontSize: '11px' }}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.role === 'assistant' && (
                  <button onClick={() => copyMessage(msg.id, msg.content)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: '2px' }}>
                    {copiedId === msg.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
              <Brain size={18} color="white" />
            </div>
            <div style={{ padding: '14px 18px', borderRadius: '4px 18px 18px 18px', background: 'rgba(13,17,35,0.8)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6', animation: `pulse ${0.6 + i * 0.15}s infinite` }}></div>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: '16px 0 20px', borderTop: '1px solid rgba(59,130,246,0.1)' }}>
        {/* More suggestions */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {SUGGESTIONS.slice(5).map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '14px', padding: '4px 10px', color: '#64748b', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.color = '#3b82f6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'; e.currentTarget.style.color = '#64748b'; }}>
              <ChevronRight size={10} /> {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <TrendingUp size={18} color="#3b82f6" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="input-field"
            style={{ flex: 1, padding: '13px 18px', fontSize: '14px', borderRadius: '24px' }}
            placeholder="Ask anything... e.g. 'Should I buy NVDA?' or 'What is a P/E ratio?'"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            disabled={isTyping}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            style={{ background: input.trim() && !isTyping ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(59,130,246,0.2)', border: 'none', borderRadius: '50%', width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isTyping ? 'pointer' : 'default', transition: 'all 0.2s', flexShrink: 0 }}>
            <Send size={18} color={input.trim() && !isTyping ? 'white' : '#3b82f6'} />
          </button>
        </div>
        <p style={{ color: '#475569', fontSize: '11px', margin: '8px 0 0 36px' }}>
          ⚠️ AI responses are for educational purposes only — not financial advice.
        </p>
      </div>
    </div>
  );
};
