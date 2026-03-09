'use client';

import { useState, useMemo } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import TopBar from '@/components/layout/TopBar';
import PriceChart from '@/components/charts/PriceChart';
import OptionsChain from '@/components/options/OptionsChain';
import Watchlist from '@/components/market/Watchlist';
import OrderBook from '@/components/market/OrderBook';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import AgentsDashboard from '@/components/agents/AgentsDashboard';
import AIAssistant from '@/components/ai/AIAssistant';
import SentimentPanel from '@/components/market/SentimentPanel';
import MarketHeatmap from '@/components/market/MarketHeatmap';
import { Layout, BarChart3, Bot, Brain, Grid3X3, Wallet } from 'lucide-react';

type TabView = 'terminal' | 'options' | 'agents' | 'ai' | 'heatmap' | 'portfolio';

export default function TradingDashboard() {
  const {
    quotes, indices, positions, watchlist, agents, risk,
    selectedSymbol, setSelectedSymbol,
    isConnected,
    getSymbolQuote, getCandles, getOptions, getBook, getSymbolSentiment,
  } = useMarketData(1500);

  const [activeTab, setActiveTab] = useState<TabView>('terminal');

  const quote = useMemo(() => getSymbolQuote(selectedSymbol), [getSymbolQuote, selectedSymbol]);
  const candles = useMemo(() => getCandles(selectedSymbol), [getCandles, selectedSymbol]);
  const options = useMemo(() => getOptions(selectedSymbol), [getOptions, selectedSymbol]);
  const orderBook = useMemo(() => getBook(selectedSymbol), [getBook, selectedSymbol]);
  const sentiment = useMemo(() => getSymbolSentiment(selectedSymbol), [getSymbolSentiment, selectedSymbol]);

  const tabs: { id: TabView; label: string; icon: React.ReactNode }[] = [
    { id: 'terminal', label: 'TERMINAL', icon: <Layout size={12} /> },
    { id: 'options', label: 'OPTIONS', icon: <BarChart3 size={12} /> },
    { id: 'agents', label: 'AGENTS', icon: <Bot size={12} /> },
    { id: 'ai', label: 'AI LAB', icon: <Brain size={12} /> },
    { id: 'heatmap', label: 'HEATMAP', icon: <Grid3X3 size={12} /> },
    { id: 'portfolio', label: 'PORTFOLIO', icon: <Wallet size={12} /> },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0a0e17]">
      {/* Top bar with ticker tape */}
      <TopBar indices={indices} isConnected={isConnected} />

      {/* Tab navigation */}
      <div className="h-8 flex items-center bg-[#0f1419] border-b border-[#1e2a3a] px-2 gap-0 flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-wider transition-all border-b-2 ${
              activeTab === tab.id
                ? 'text-[#00d4aa] border-[#00d4aa] bg-[#00d4aa08]'
                : 'text-[#556677] border-transparent hover:text-[#8899aa] hover:bg-[#1a233222]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#556677]">Viewing:</span>
          <span className="text-[#e8edf5] font-semibold">{selectedSymbol}</span>
          <span className={`${quote.change >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}`}>
            ${quote.price?.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'terminal' && (
          <div className="h-full flex gap-[1px] bg-[#0a0e17]">
            {/* Left sidebar - Watchlist */}
            <div className="w-[280px] flex-shrink-0">
              <Watchlist
                items={watchlist}
                selectedSymbol={selectedSymbol}
                onSelectSymbol={setSelectedSymbol}
              />
            </div>

            {/* Center - Main chart + Options */}
            <div className="flex-1 flex flex-col gap-[1px]">
              {/* Chart area */}
              <div className="h-[55%]">
                <PriceChart symbol={selectedSymbol} quote={quote} candles={candles} />
              </div>
              {/* Options chain */}
              <div className="flex-1">
                <OptionsChain
                  symbol={selectedSymbol}
                  calls={options.calls}
                  puts={options.puts}
                  currentPrice={quote.price}
                />
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-[280px] flex-shrink-0 flex flex-col gap-[1px]">
              {/* Order Book */}
              <div className="h-[45%]">
                <OrderBook bids={orderBook.bids} asks={orderBook.asks} symbol={selectedSymbol} />
              </div>
              {/* Sentiment */}
              <div className="flex-1">
                <SentimentPanel sentiment={sentiment} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'options' && (
          <div className="h-full flex gap-[1px] bg-[#0a0e17]">
            <div className="w-[200px] flex-shrink-0">
              <Watchlist
                items={watchlist}
                selectedSymbol={selectedSymbol}
                onSelectSymbol={setSelectedSymbol}
              />
            </div>
            <div className="flex-1">
              <OptionsChain
                symbol={selectedSymbol}
                calls={options.calls}
                puts={options.puts}
                currentPrice={quote.price}
              />
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="h-full flex gap-[1px] bg-[#0a0e17]">
            <div className="flex-1">
              <AgentsDashboard agents={agents} />
            </div>
            <div className="w-[320px] flex-shrink-0">
              <AIAssistant symbol={selectedSymbol} />
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="h-full flex gap-[1px] bg-[#0a0e17]">
            <div className="w-[280px] flex-shrink-0 flex flex-col gap-[1px]">
              <div className="h-1/2">
                <Watchlist
                  items={watchlist}
                  selectedSymbol={selectedSymbol}
                  onSelectSymbol={setSelectedSymbol}
                />
              </div>
              <div className="flex-1">
                <SentimentPanel sentiment={sentiment} />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-[1px]">
              <div className="h-[40%]">
                <PriceChart symbol={selectedSymbol} quote={quote} candles={candles} />
              </div>
              <div className="flex-1">
                <AIAssistant symbol={selectedSymbol} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="h-full flex gap-[1px] bg-[#0a0e17]">
            <div className="flex-1">
              <MarketHeatmap quotes={quotes} onSelectSymbol={setSelectedSymbol} />
            </div>
            <div className="w-[280px] flex-shrink-0 flex flex-col gap-[1px]">
              <div className="h-[50%]">
                <PriceChart symbol={selectedSymbol} quote={quote} candles={candles} />
              </div>
              <div className="flex-1">
                <OrderBook bids={orderBook.bids} asks={orderBook.asks} symbol={selectedSymbol} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="h-full flex gap-[1px] bg-[#0a0e17]">
            <div className="flex-1">
              <PortfolioSummary positions={positions} risk={risk} />
            </div>
            <div className="w-[320px] flex-shrink-0 flex flex-col gap-[1px]">
              <div className="h-[50%]">
                <PriceChart symbol={selectedSymbol} quote={quote} candles={candles} />
              </div>
              <div className="flex-1">
                <AgentsDashboard agents={agents} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="h-6 bg-[#0a0e17] border-t border-[#1e2a3a] flex items-center px-3 text-[9px] text-[#556677] gap-4 flex-shrink-0">
        <span className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#00d4aa]' : 'bg-[#ff3b69] animate-pulse'}`} />
          {isConnected ? 'Connected' : 'Reconnecting...'}
        </span>
        <span>Latency: <span className="text-[#e8edf5]">{(Math.random() * 5 + 1).toFixed(1)}ms</span></span>
        <span>Feed: <span className="text-[#00d4aa]">NYSE · NASDAQ · CBOE</span></span>
        <span>Updates: <span className="text-[#e8edf5]">1.5k/s</span></span>
        <div className="flex-1" />
        <span>Agents: <span className="text-[#00d4aa]">{agents.filter(a => a.status === 'running').length} running</span></span>
        <span>Positions: <span className="text-[#e8edf5]">{positions.length}</span></span>
        <span className="text-[#00d4aa]">GREYSTONE TRADING PLATFORM v2.0</span>
      </div>
    </div>
  );
}
