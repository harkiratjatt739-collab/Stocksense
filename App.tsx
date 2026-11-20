import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StockAnalyzer } from './components/StockAnalyzer';
import { Portfolio } from './components/Portfolio';
import { Watchlist } from './components/Watchlist';
import { NewsFeed } from './components/NewsFeed';
import { RiskAssessment } from './components/RiskAssessment';
import { StockComparison } from './components/StockComparison';
import { LivePrices } from './components/LivePrices';
import { AIChat } from './components/AIChat';
import type { Page } from './types';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [analyzeSymbol, setAnalyzeSymbol] = useState<string | undefined>(undefined);

  const handleAnalyzeStock = (symbol: string) => {
    setAnalyzeSymbol(symbol);
    setCurrentPage('analyzer');
  };

  const handleNavigate = (page: Page) => {
    if (page !== 'analyzer') setAnalyzeSymbol(undefined);
    setCurrentPage(page);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e' }}>
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main>
        {currentPage === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} onAnalyzeStock={handleAnalyzeStock} />
        )}
        {currentPage === 'analyzer' && (
          <StockAnalyzer initialSymbol={analyzeSymbol} />
        )}
        {currentPage === 'chat' && <AIChat />}
        {currentPage === 'compare' && <StockComparison />}
        {currentPage === 'live' && <LivePrices />}
        {currentPage === 'portfolio' && <Portfolio />}
        {currentPage === 'watchlist' && <Watchlist />}
        {currentPage === 'news' && (
          <NewsFeed onAnalyzeStock={handleAnalyzeStock} onNavigate={handleNavigate} />
        )}
        {currentPage === 'risk' && (
          <RiskAssessment onAnalyzeStock={handleAnalyzeStock} onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  );
}

export default App;
