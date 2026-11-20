# 📈 StockSense AI — AI-Powered Stock Market Analysis

![StockSense AI](https://img.shields.io/badge/StockSense-AI-blue?style=for-the-badge&logo=chart-line)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)

> ⚠️ **Disclaimer:** StockSense AI is for **educational purposes only**. It does not constitute financial advice. Always consult a licensed financial advisor before making investment decisions.

---

## 🌐 Live Demo

👉 **[https://stocksense-ai.vercel.app](https://stocksense-ai.vercel.app)** *(update with your Vercel URL)*

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Real-time market overview with top gainers, losers, and market indices |
| 🔍 **AI Stock Analyzer** | BUY / SELL / HOLD recommendations with confidence scores, risk levels, advantages & risks |
| 💬 **AI Chat Assistant** | Ask anything — stock picks, finance concepts (P/E, ETF, DCA), portfolio advice |
| 📈 **Live Prices** | Real-time prices fetched via Yahoo Finance (with smart CORS proxy fallback) |
| 🔄 **Stock Comparison** | Compare up to 4 stocks side-by-side with normalized return charts |
| 💼 **Portfolio Tracker** | Add positions, track live P&L, and view allocation pie chart |
| ⭐ **Watchlist** | Monitor stocks with live price alerts |
| 📰 **News Feed** | Market news with sentiment analysis (Bullish / Bearish / Neutral) |
| ⚖️ **Risk Assessment** | Personalized investment profile quiz → Conservative / Moderate / Aggressive |

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (Glassmorphism dark theme)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Data:** Yahoo Finance via CORS proxy chain (falls back to simulated data)
- **Deployment:** Vercel

---

## 🚀 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/stocksense-ai.git
cd stocksense-ai

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Build for Production

```bash
npm run build
```

Output is in the `dist/` folder — ready to deploy anywhere.

---

## 📡 Live Data

StockSense AI fetches real stock prices from **Yahoo Finance** through a CORS proxy chain:

1. `allorigins.win` → 2. `corsproxy.io` → 3. `cors.lol`

If all proxies fail, the app **automatically falls back to realistic simulated data** — the status indicator in the navbar always shows the current data source:

- 🟢 `LIVE` — Real prices from Yahoo Finance
- 🟡 `PARTIAL` — Some stocks live, some simulated
- 🔵 `SIMULATED` — All data is simulated (no API key required)

---

## 📂 Project Structure

```
src/
├── components/
│   ├── AIChat.tsx           # AI Chat assistant
│   ├── Dashboard.tsx        # Main dashboard
│   ├── DataStatusBar.tsx    # Live/Simulated status pill
│   ├── LivePrices.tsx       # Real-time price table
│   ├── Navbar.tsx           # Navigation + ticker bar
│   ├── NewsFeed.tsx         # News with sentiment
│   ├── Portfolio.tsx        # Portfolio tracker
│   ├── RiskAssessment.tsx   # Risk profile quiz
│   ├── StockAnalyzer.tsx    # AI analysis engine
│   ├── StockComparison.tsx  # Side-by-side comparison
│   └── Watchlist.tsx        # Price alert watchlist
├── context/
│   └── StockDataContext.tsx # Global live data provider
├── data/
│   └── stockData.ts         # 20 stocks static data + fallback
├── services/
│   └── stockApi.ts          # Yahoo Finance API + proxy chain
├── types/
│   └── index.ts             # TypeScript interfaces
├── App.tsx
└── main.tsx
```

---

## 🤖 AI Chat — What You Can Ask

- *"Should I buy Tesla?"*
- *"What is a P/E ratio?"*
- *"Compare Apple vs Microsoft"*
- *"Best stocks for a beginner?"*
- *"What is DCA investing?"*
- *"Top 3 AI stocks right now?"*
- *"How do I build a portfolio?"*
- *"What are the risks of NVIDIA?"*

---

## 📸 Screenshots

> *(Add screenshots of your app here)*

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [Yahoo Finance](https://finance.yahoo.com/) for market data
- [Recharts](https://recharts.org/) for beautiful charts
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
