'use client';

import { StockQuote, CandleData, OptionContract, MarketIndex, Position, WatchlistItem, TradingAgent, SentimentData, OrderBookEntry, RiskMetrics } from '@/types/market';

// Simulated real-time market data engine
const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'UNH', 'XOM', 'JNJ', 'WMT', 'PG', 'MA', 'HD', 'CVX', 'MRK', 'ABBV', 'KO', 'PEP', 'AVGO', 'COST', 'TMO', 'MCD', 'CSCO', 'ACN', 'ABT', 'DHR', 'NEE'];

const BASE_PRICES: Record<string, { price: number; name: string; vol: number; beta: number }> = {
  AAPL: { price: 227.48, name: 'Apple Inc.', vol: 0.018, beta: 1.2 },
  MSFT: { price: 415.32, name: 'Microsoft Corp.', vol: 0.016, beta: 0.9 },
  GOOGL: { price: 174.89, name: 'Alphabet Inc.', vol: 0.02, beta: 1.1 },
  AMZN: { price: 203.15, name: 'Amazon.com Inc.', vol: 0.022, beta: 1.3 },
  NVDA: { price: 878.36, name: 'NVIDIA Corp.', vol: 0.035, beta: 1.7 },
  META: { price: 523.77, name: 'Meta Platforms', vol: 0.025, beta: 1.4 },
  TSLA: { price: 248.42, name: 'Tesla Inc.', vol: 0.04, beta: 2.0 },
  JPM: { price: 198.65, name: 'JPMorgan Chase', vol: 0.012, beta: 1.1 },
  V: { price: 279.11, name: 'Visa Inc.', vol: 0.01, beta: 0.9 },
  UNH: { price: 527.30, name: 'UnitedHealth', vol: 0.014, beta: 0.7 },
  XOM: { price: 113.45, name: 'Exxon Mobil', vol: 0.015, beta: 0.8 },
  JNJ: { price: 155.82, name: 'Johnson & Johnson', vol: 0.008, beta: 0.5 },
  WMT: { price: 168.33, name: 'Walmart Inc.', vol: 0.009, beta: 0.5 },
  PG: { price: 162.47, name: 'Procter & Gamble', vol: 0.007, beta: 0.4 },
  MA: { price: 459.88, name: 'Mastercard Inc.', vol: 0.012, beta: 1.0 },
  HD: { price: 352.19, name: 'Home Depot', vol: 0.013, beta: 1.0 },
  CVX: { price: 157.66, name: 'Chevron Corp.', vol: 0.014, beta: 0.9 },
  MRK: { price: 126.48, name: 'Merck & Co.', vol: 0.011, beta: 0.4 },
  ABBV: { price: 174.23, name: 'AbbVie Inc.', vol: 0.012, beta: 0.8 },
  KO: { price: 60.11, name: 'Coca-Cola Co.', vol: 0.006, beta: 0.6 },
  PEP: { price: 171.55, name: 'PepsiCo Inc.', vol: 0.007, beta: 0.6 },
  AVGO: { price: 1342.77, name: 'Broadcom Inc.', vol: 0.028, beta: 1.3 },
  COST: { price: 725.43, name: 'Costco Wholesale', vol: 0.011, beta: 0.8 },
  TMO: { price: 562.81, name: 'Thermo Fisher', vol: 0.013, beta: 0.8 },
  MCD: { price: 295.67, name: "McDonald's Corp.", vol: 0.008, beta: 0.6 },
  CSCO: { price: 50.23, name: 'Cisco Systems', vol: 0.012, beta: 0.8 },
  ACN: { price: 338.92, name: 'Accenture plc', vol: 0.014, beta: 1.1 },
  ABT: { price: 112.38, name: 'Abbott Labs', vol: 0.01, beta: 0.7 },
  DHR: { price: 253.14, name: 'Danaher Corp.', vol: 0.013, beta: 0.9 },
  NEE: { price: 76.89, name: 'NextEra Energy', vol: 0.011, beta: 0.5 },
};

// State for price simulation
const priceState: Record<string, number> = {};
const prevPriceState: Record<string, number> = {};

function initPrices() {
  Object.entries(BASE_PRICES).forEach(([sym, data]) => {
    priceState[sym] = data.price * (1 + (Math.random() - 0.5) * 0.02);
    prevPriceState[sym] = priceState[sym];
  });
}
initPrices();

function tickPrice(symbol: string): number {
  const data = BASE_PRICES[symbol];
  if (!data) return 0;
  prevPriceState[symbol] = priceState[symbol];
  const drift = (Math.random() - 0.498) * data.vol * data.price;
  const noise = (Math.random() - 0.5) * data.vol * data.price * 0.3;
  priceState[symbol] = Math.max(priceState[symbol] + drift + noise, data.price * 0.8);
  return priceState[symbol];
}

export function getQuote(symbol: string): StockQuote {
  const data = BASE_PRICES[symbol];
  if (!data) {
    return {} as StockQuote;
  }
  const price = tickPrice(symbol);
  const change = price - data.price;
  const volume = Math.floor(Math.random() * 50000000) + 5000000;

  return {
    symbol,
    name: data.name,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / data.price) * 100).toFixed(2)),
    volume,
    avgVolume: Math.floor(volume * (0.8 + Math.random() * 0.4)),
    high: parseFloat((price * (1 + Math.random() * 0.015)).toFixed(2)),
    low: parseFloat((price * (1 - Math.random() * 0.015)).toFixed(2)),
    open: parseFloat((data.price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
    prevClose: parseFloat(data.price.toFixed(2)),
    marketCap: Math.floor(price * (Math.random() * 5 + 1) * 1e9),
    pe: parseFloat((15 + Math.random() * 35).toFixed(1)),
    eps: parseFloat((price / (15 + Math.random() * 35)).toFixed(2)),
    beta: data.beta,
    week52High: parseFloat((price * (1 + Math.random() * 0.3)).toFixed(2)),
    week52Low: parseFloat((price * (1 - Math.random() * 0.3)).toFixed(2)),
    bid: parseFloat((price - Math.random() * 0.05).toFixed(2)),
    ask: parseFloat((price + Math.random() * 0.05).toFixed(2)),
    bidSize: Math.floor(Math.random() * 500) + 100,
    askSize: Math.floor(Math.random() * 500) + 100,
    lastUpdate: Date.now(),
  };
}

export function getAllQuotes(): StockQuote[] {
  return SYMBOLS.map(getQuote);
}

export function generateCandles(symbol: string, count: number = 200): CandleData[] {
  const data = BASE_PRICES[symbol];
  if (!data) return [];

  const candles: CandleData[] = [];
  let price = data.price * 0.85;
  const now = Date.now();

  for (let i = count; i > 0; i--) {
    const volatility = data.vol * price;
    const open = price;
    const close = price + (Math.random() - 0.48) * volatility * 2;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    const volume = Math.floor(Math.random() * 30000000) + 5000000;

    candles.push({
      time: Math.floor((now - i * 86400000) / 1000),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    price = close;
  }

  return candles;
}

function blackScholesD1(S: number, K: number, T: number, r: number, sigma: number): number {
  return (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
}

function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

export function generateOptionsChain(symbol: string): { calls: OptionContract[]; puts: OptionContract[] } {
  const data = BASE_PRICES[symbol];
  if (!data) return { calls: [], puts: [] };

  const S = priceState[symbol] || data.price;
  const r = 0.05;
  const calls: OptionContract[] = [];
  const puts: OptionContract[] = [];

  const strikes = [];
  const baseStrike = Math.round(S / 5) * 5;
  for (let i = -8; i <= 8; i++) {
    strikes.push(baseStrike + i * 5);
  }

  const expirations = ['2026-03-20', '2026-03-27', '2026-04-17', '2026-05-15', '2026-06-19', '2026-09-18', '2026-12-18'];

  strikes.forEach(K => {
    const T = 30 / 365;
    const sigma = data.vol * (3 + Math.random() * 2);
    const d1 = blackScholesD1(S, K, T, r, sigma);
    const d2 = d1 - sigma * Math.sqrt(T);

    const callPrice = Math.max(0.01, S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2));
    const putPrice = Math.max(0.01, K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1));

    const callDelta = normalCDF(d1);
    const putDelta = callDelta - 1;
    const gamma = Math.exp(-d1 * d1 / 2) / (S * sigma * Math.sqrt(2 * Math.PI * T));
    const callTheta = -(S * sigma * Math.exp(-d1 * d1 / 2)) / (2 * Math.sqrt(2 * Math.PI * T)) - r * K * Math.exp(-r * T) * normalCDF(d2);
    const putTheta = -(S * sigma * Math.exp(-d1 * d1 / 2)) / (2 * Math.sqrt(2 * Math.PI * T)) + r * K * Math.exp(-r * T) * normalCDF(-d2);
    const vega = S * Math.sqrt(T) * Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI);

    calls.push({
      contractSymbol: `${symbol}${expirations[0].replace(/-/g, '')}C${K.toFixed(0).padStart(5, '0')}`,
      strike: K,
      expiration: expirations[0],
      type: 'call',
      lastPrice: parseFloat(callPrice.toFixed(2)),
      bid: parseFloat((callPrice * 0.97).toFixed(2)),
      ask: parseFloat((callPrice * 1.03).toFixed(2)),
      change: parseFloat(((Math.random() - 0.45) * callPrice * 0.15).toFixed(2)),
      changePercent: parseFloat(((Math.random() - 0.45) * 15).toFixed(2)),
      volume: Math.floor(Math.random() * 10000),
      openInterest: Math.floor(Math.random() * 50000),
      impliedVolatility: parseFloat((sigma * 100).toFixed(1)),
      delta: parseFloat(callDelta.toFixed(4)),
      gamma: parseFloat(gamma.toFixed(4)),
      theta: parseFloat((callTheta / 365).toFixed(4)),
      vega: parseFloat((vega / 100).toFixed(4)),
      rho: parseFloat((K * T * Math.exp(-r * T) * normalCDF(d2) / 100).toFixed(4)),
      inTheMoney: S > K,
    });

    puts.push({
      contractSymbol: `${symbol}${expirations[0].replace(/-/g, '')}P${K.toFixed(0).padStart(5, '0')}`,
      strike: K,
      expiration: expirations[0],
      type: 'put',
      lastPrice: parseFloat(putPrice.toFixed(2)),
      bid: parseFloat((putPrice * 0.97).toFixed(2)),
      ask: parseFloat((putPrice * 1.03).toFixed(2)),
      change: parseFloat(((Math.random() - 0.45) * putPrice * 0.15).toFixed(2)),
      changePercent: parseFloat(((Math.random() - 0.45) * 15).toFixed(2)),
      volume: Math.floor(Math.random() * 8000),
      openInterest: Math.floor(Math.random() * 40000),
      impliedVolatility: parseFloat((sigma * 100 * (1 + (K < S ? 0.1 : -0.05))).toFixed(1)),
      delta: parseFloat(putDelta.toFixed(4)),
      gamma: parseFloat(gamma.toFixed(4)),
      theta: parseFloat((putTheta / 365).toFixed(4)),
      vega: parseFloat((vega / 100).toFixed(4)),
      rho: parseFloat((-K * T * Math.exp(-r * T) * normalCDF(-d2) / 100).toFixed(4)),
      inTheMoney: S < K,
    });
  });

  return { calls, puts };
}

export function getMarketIndices(): MarketIndex[] {
  return [
    { symbol: 'SPX', name: 'S&P 500', value: 5234.18 + (Math.random() - 0.48) * 30, change: 0, changePercent: 0 },
    { symbol: 'NDX', name: 'NASDAQ 100', value: 18432.55 + (Math.random() - 0.48) * 80, change: 0, changePercent: 0 },
    { symbol: 'DJI', name: 'DOW 30', value: 39127.80 + (Math.random() - 0.48) * 120, change: 0, changePercent: 0 },
    { symbol: 'RUT', name: 'Russell 2000', value: 2067.32 + (Math.random() - 0.48) * 15, change: 0, changePercent: 0 },
    { symbol: 'VIX', name: 'CBOE VIX', value: 14.23 + (Math.random() - 0.5) * 2, change: 0, changePercent: 0 },
    { symbol: 'TNX', name: '10Y Treasury', value: 4.28 + (Math.random() - 0.5) * 0.1, change: 0, changePercent: 0 },
    { symbol: 'DXY', name: 'US Dollar', value: 104.15 + (Math.random() - 0.5) * 0.5, change: 0, changePercent: 0 },
    { symbol: 'CL', name: 'Crude Oil', value: 78.42 + (Math.random() - 0.5) * 2, change: 0, changePercent: 0 },
    { symbol: 'GC', name: 'Gold', value: 2342.50 + (Math.random() - 0.5) * 20, change: 0, changePercent: 0 },
    { symbol: 'BTC', name: 'Bitcoin', value: 68450 + (Math.random() - 0.48) * 1500, change: 0, changePercent: 0 },
  ].map(idx => ({
    ...idx,
    value: parseFloat(idx.value.toFixed(2)),
    change: parseFloat(((Math.random() - 0.45) * idx.value * 0.01).toFixed(2)),
    changePercent: parseFloat(((Math.random() - 0.45) * 1.5).toFixed(2)),
  }));
}

export function getPositions(): Position[] {
  const positions: Position[] = [
    { symbol: 'NVDA', type: 'stock', side: 'long', quantity: 200, avgPrice: 820.50, currentPrice: 0, pnl: 0, pnlPercent: 0, marketValue: 0, dayPnl: 0, dayPnlPercent: 0 },
    { symbol: 'AAPL', type: 'stock', side: 'long', quantity: 500, avgPrice: 215.30, currentPrice: 0, pnl: 0, pnlPercent: 0, marketValue: 0, dayPnl: 0, dayPnlPercent: 0 },
    { symbol: 'TSLA', type: 'stock', side: 'short', quantity: 100, avgPrice: 265.00, currentPrice: 0, pnl: 0, pnlPercent: 0, marketValue: 0, dayPnl: 0, dayPnlPercent: 0 },
    { symbol: 'MSFT', type: 'stock', side: 'long', quantity: 300, avgPrice: 400.15, currentPrice: 0, pnl: 0, pnlPercent: 0, marketValue: 0, dayPnl: 0, dayPnlPercent: 0 },
    { symbol: 'AMZN', type: 'option', side: 'long', quantity: 10, avgPrice: 8.50, currentPrice: 0, pnl: 0, pnlPercent: 0, marketValue: 0, dayPnl: 0, dayPnlPercent: 0,
      optionDetails: { strike: 210, expiration: '2026-04-17', type: 'call', delta: 0.45, gamma: 0.023, theta: -0.15, vega: 0.32 }
    },
    { symbol: 'GOOGL', type: 'option', side: 'long', quantity: 20, avgPrice: 3.20, currentPrice: 0, pnl: 0, pnlPercent: 0, marketValue: 0, dayPnl: 0, dayPnlPercent: 0,
      optionDetails: { strike: 180, expiration: '2026-03-20', type: 'put', delta: -0.35, gamma: 0.019, theta: -0.22, vega: 0.28 }
    },
    { symbol: 'META', type: 'option', side: 'short', quantity: 5, avgPrice: 12.40, currentPrice: 0, pnl: 0, pnlPercent: 0, marketValue: 0, dayPnl: 0, dayPnlPercent: 0,
      optionDetails: { strike: 540, expiration: '2026-05-15', type: 'call', delta: 0.38, gamma: 0.015, theta: -0.18, vega: 0.45 }
    },
  ];

  return positions.map(p => {
    const quote = getQuote(p.symbol);
    const currentPrice = p.type === 'option' ? p.avgPrice * (1 + (Math.random() - 0.45) * 0.3) : quote.price;
    const multiplier = p.type === 'option' ? 100 : 1;
    const direction = p.side === 'long' ? 1 : -1;
    const pnl = (currentPrice - p.avgPrice) * p.quantity * multiplier * direction;
    const marketValue = currentPrice * p.quantity * multiplier;

    return {
      ...p,
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2)),
      pnlPercent: parseFloat(((pnl / (p.avgPrice * p.quantity * multiplier)) * 100).toFixed(2)),
      marketValue: parseFloat(marketValue.toFixed(2)),
      dayPnl: parseFloat(((Math.random() - 0.45) * 2000).toFixed(2)),
      dayPnlPercent: parseFloat(((Math.random() - 0.45) * 3).toFixed(2)),
    };
  });
}

export function getWatchlist(): WatchlistItem[] {
  const signals: WatchlistItem['signal'][] = ['strong_buy', 'buy', 'neutral', 'sell', 'strong_sell'];
  return SYMBOLS.slice(0, 15).map(sym => {
    const quote = getQuote(sym);
    return {
      symbol: sym,
      name: BASE_PRICES[sym].name,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      signal: signals[Math.floor(Math.random() * signals.length)],
      aiScore: parseFloat((Math.random() * 100).toFixed(1)),
    };
  });
}

export function getTradingAgents(): TradingAgent[] {
  return [
    {
      id: 'arb-01',
      name: 'Mercury Arbitrage',
      strategy: 'Statistical Arbitrage',
      status: 'running',
      pnl: 47823.45,
      pnlPercent: 12.4,
      trades: 1847,
      winRate: 67.3,
      sharpeRatio: 2.14,
      maxDrawdown: -3.2,
      capital: 500000,
      deployed: 385000,
      uptime: '14d 7h 23m',
      lastTrade: '2s ago',
      signals: [
        { time: '14:32:01', type: 'buy', symbol: 'AAPL', price: 227.15, confidence: 0.87, reason: 'Mean reversion signal on 5min timeframe' },
        { time: '14:31:45', type: 'sell', symbol: 'MSFT', price: 415.80, confidence: 0.92, reason: 'Pairs divergence exceeded 2σ threshold' },
      ],
    },
    {
      id: 'swing-02',
      name: 'Atlas Swing Trader',
      strategy: 'Momentum + Mean Reversion',
      status: 'running',
      pnl: 23156.78,
      pnlPercent: 8.7,
      trades: 342,
      winRate: 58.2,
      sharpeRatio: 1.76,
      maxDrawdown: -5.8,
      capital: 350000,
      deployed: 267000,
      uptime: '7d 12h 45m',
      lastTrade: '4m ago',
      signals: [
        { time: '14:28:00', type: 'buy', symbol: 'NVDA', price: 876.20, confidence: 0.78, reason: 'RSI oversold + MACD bullish crossover' },
      ],
    },
    {
      id: 'opt-03',
      name: 'Theta Harvester',
      strategy: 'Options Selling (Theta Decay)',
      status: 'running',
      pnl: 15432.10,
      pnlPercent: 6.2,
      trades: 89,
      winRate: 82.1,
      sharpeRatio: 1.95,
      maxDrawdown: -2.1,
      capital: 250000,
      deployed: 198000,
      uptime: '21d 3h 11m',
      lastTrade: '1h ago',
      signals: [
        { time: '13:45:00', type: 'sell', symbol: 'TSLA', price: 4.20, confidence: 0.91, reason: 'IV rank >80%, selling 30-delta strangle' },
      ],
    },
    {
      id: 'ml-04',
      name: 'Neural Alpha',
      strategy: 'ML Prediction Model',
      status: 'paused',
      pnl: -2341.55,
      pnlPercent: -1.2,
      trades: 156,
      winRate: 51.3,
      sharpeRatio: 0.45,
      maxDrawdown: -8.4,
      capital: 200000,
      deployed: 0,
      uptime: '0d 0h 0m',
      lastTrade: '2d ago',
      signals: [],
    },
    {
      id: 'vol-05',
      name: 'Vega Storm',
      strategy: 'Volatility Arbitrage',
      status: 'running',
      pnl: 31205.90,
      pnlPercent: 10.4,
      trades: 523,
      winRate: 63.5,
      sharpeRatio: 1.88,
      maxDrawdown: -4.7,
      capital: 300000,
      deployed: 245000,
      uptime: '10d 18h 32m',
      lastTrade: '30s ago',
      signals: [
        { time: '14:31:55', type: 'buy', symbol: 'AMZN', price: 2.85, confidence: 0.84, reason: 'IV surface anomaly detected, buying cheap vol' },
      ],
    },
  ];
}

export function getSentiment(symbol: string): SentimentData {
  return {
    symbol,
    overall: parseFloat((Math.random() * 2 - 1).toFixed(2)),
    newsScore: parseFloat((Math.random() * 2 - 1).toFixed(2)),
    socialScore: parseFloat((Math.random() * 2 - 1).toFixed(2)),
    analystRating: ['Strong Buy', 'Buy', 'Hold', 'Sell'][Math.floor(Math.random() * 4)],
    priceTarget: parseFloat((BASE_PRICES[symbol]?.price * (1.1 + Math.random() * 0.2) || 100).toFixed(2)),
    headlines: [
      { title: `${symbol} Reports Strong Q4 Earnings Beat`, sentiment: 0.8, source: 'Reuters', time: '2h ago' },
      { title: `Analyst Upgrades ${symbol} to Outperform`, sentiment: 0.6, source: 'Bloomberg', time: '4h ago' },
      { title: `${symbol} Faces Regulatory Headwinds in EU`, sentiment: -0.4, source: 'WSJ', time: '6h ago' },
      { title: `Options Activity Surges in ${symbol} Ahead of Earnings`, sentiment: 0.2, source: 'MarketWatch', time: '8h ago' },
      { title: `${symbol} Announces $10B Buyback Program`, sentiment: 0.7, source: 'CNBC', time: '12h ago' },
    ],
  };
}

export function getOrderBook(symbol: string): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const data = BASE_PRICES[symbol];
  if (!data) return { bids: [], asks: [] };

  const price = priceState[symbol] || data.price;
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 15; i++) {
    const bidSize = Math.floor(Math.random() * 5000) + 100;
    const askSize = Math.floor(Math.random() * 5000) + 100;
    bidTotal += bidSize;
    askTotal += askSize;

    bids.push({
      price: parseFloat((price - (i + 1) * 0.01 * (1 + Math.random())).toFixed(2)),
      size: bidSize,
      total: bidTotal,
    });

    asks.push({
      price: parseFloat((price + (i + 1) * 0.01 * (1 + Math.random())).toFixed(2)),
      size: askSize,
      total: askTotal,
    });
  }

  return { bids, asks };
}

export function getRiskMetrics(): RiskMetrics {
  return {
    portfolioBeta: parseFloat((0.8 + Math.random() * 0.8).toFixed(2)),
    portfolioDelta: parseFloat((Math.random() * 2000 - 500).toFixed(0)),
    portfolioGamma: parseFloat((Math.random() * 50).toFixed(1)),
    portfolioTheta: parseFloat((-Math.random() * 500 - 50).toFixed(0)),
    portfolioVega: parseFloat((Math.random() * 800).toFixed(0)),
    sharpeRatio: parseFloat((1 + Math.random() * 1.5).toFixed(2)),
    sortinoRatio: parseFloat((1.2 + Math.random() * 2).toFixed(2)),
    maxDrawdown: parseFloat((-Math.random() * 10 - 2).toFixed(2)),
    valueAtRisk: parseFloat((-Math.random() * 50000 - 10000).toFixed(0)),
    expectedShortfall: parseFloat((-Math.random() * 80000 - 15000).toFixed(0)),
    correlationMatrix: {
      symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'],
      values: [
        [1, 0.72, 0.68, 0.65, 0.58],
        [0.72, 1, 0.75, 0.70, 0.62],
        [0.68, 0.75, 1, 0.73, 0.55],
        [0.65, 0.70, 0.73, 1, 0.60],
        [0.58, 0.62, 0.55, 0.60, 1],
      ],
    },
  };
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatLargeNumber(num: number): string {
  if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(2);
}

export function formatCurrency(num: number): string {
  const prefix = num < 0 ? '-$' : '$';
  return prefix + formatNumber(Math.abs(num));
}

export { SYMBOLS, BASE_PRICES };
