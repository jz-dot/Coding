'use client';

import { WatchlistItem } from '@/types/market';
import { formatNumber, formatLargeNumber } from '@/lib/market-data';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WatchlistProps {
  items: WatchlistItem[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export default function Watchlist({ items, selectedSymbol, onSelectSymbol }: WatchlistProps) {
  const getSignalColor = (signal: WatchlistItem['signal']) => {
    switch (signal) {
      case 'strong_buy': return '#00d4aa';
      case 'buy': return '#00a88a';
      case 'neutral': return '#ffb800';
      case 'sell': return '#ff6d00';
      case 'strong_sell': return '#ff3b69';
    }
  };

  const getSignalLabel = (signal: WatchlistItem['signal']) => {
    switch (signal) {
      case 'strong_buy': return 'S.BUY';
      case 'buy': return 'BUY';
      case 'neutral': return 'HOLD';
      case 'sell': return 'SELL';
      case 'strong_sell': return 'S.SELL';
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 75) return '#00d4aa';
    if (score >= 50) return '#ffb800';
    if (score >= 25) return '#ff6d00';
    return '#ff3b69';
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <div className="status-dot" />
          <span>WATCHLIST</span>
        </div>
        <div className="flex items-center gap-2">
          <Star size={11} className="text-[#ffb800] cursor-pointer" />
          <span className="text-[10px] text-[#556677]">{items.length} symbols</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="data-table text-[10px]">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Chg%</th>
              <th>Vol</th>
              <th>Signal</th>
              <th>AI</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr
                key={item.symbol}
                onClick={() => onSelectSymbol(item.symbol)}
                className={`cursor-pointer transition-colors ${
                  selectedSymbol === item.symbol ? 'bg-[#1a2332]' : ''
                }`}
              >
                <td className="text-left">
                  <div>
                    <span className="text-[#e8edf5] font-semibold">{item.symbol}</span>
                    <div className="text-[9px] text-[#556677] truncate max-w-[80px]">{item.name}</div>
                  </div>
                </td>
                <td className="font-semibold">{formatNumber(item.price)}</td>
                <td>
                  <span
                    className="flex items-center justify-end gap-0.5"
                    style={{ color: item.changePercent >= 0 ? '#00d4aa' : '#ff3b69' }}
                  >
                    {item.changePercent >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="text-[#8899aa]">{formatLargeNumber(item.volume)}</td>
                <td>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{
                      color: getSignalColor(item.signal),
                      backgroundColor: getSignalColor(item.signal) + '15',
                    }}
                  >
                    {getSignalLabel(item.signal)}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <div className="w-8 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.aiScore}%`,
                          backgroundColor: getAIScoreColor(item.aiScore),
                        }}
                      />
                    </div>
                    <span className="text-[9px]" style={{ color: getAIScoreColor(item.aiScore) }}>
                      {item.aiScore.toFixed(0)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
