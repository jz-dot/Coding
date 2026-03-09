export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  marketCap: number;
  pe: number;
  eps: number;
  beta: number;
  week52High: number;
  week52Low: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  lastUpdate: number;
}

export interface OptionContract {
  contractSymbol: string;
  strike: number;
  expiration: string;
  type: 'call' | 'put';
  lastPrice: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  inTheMoney: boolean;
}

export interface OptionsChain {
  underlying: string;
  expirations: string[];
  calls: OptionContract[];
  puts: OptionContract[];
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface Position {
  symbol: string;
  type: 'stock' | 'option';
  side: 'long' | 'short';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  marketValue: number;
  dayPnl: number;
  dayPnlPercent: number;
  optionDetails?: {
    strike: number;
    expiration: string;
    type: 'call' | 'put';
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
}

export interface TradingAgent {
  id: string;
  name: string;
  strategy: string;
  status: 'running' | 'paused' | 'stopped' | 'error';
  pnl: number;
  pnlPercent: number;
  trades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  capital: number;
  deployed: number;
  uptime: string;
  lastTrade: string;
  signals: AgentSignal[];
}

export interface AgentSignal {
  time: string;
  type: 'buy' | 'sell' | 'hold';
  symbol: string;
  price: number;
  confidence: number;
  reason: string;
}

export interface SentimentData {
  symbol: string;
  overall: number; // -1 to 1
  newsScore: number;
  socialScore: number;
  analystRating: string;
  priceTarget: number;
  headlines: { title: string; sentiment: number; source: string; time: string }[];
}

export interface RiskMetrics {
  portfolioBeta: number;
  portfolioDelta: number;
  portfolioGamma: number;
  portfolioTheta: number;
  portfolioVega: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  expectedShortfall: number;
  correlationMatrix: { symbols: string[]; values: number[][] };
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  aiScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    symbols?: string[];
    chartData?: number[];
    confidence?: number;
  };
}
