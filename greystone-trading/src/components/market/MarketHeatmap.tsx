'use client';

import { StockQuote } from '@/types/market';
import { formatNumber } from '@/lib/market-data';

interface MarketHeatmapProps {
  quotes: StockQuote[];
  onSelectSymbol: (symbol: string) => void;
}

export default function MarketHeatmap({ quotes, onSelectSymbol }: MarketHeatmapProps) {
  const getHeatColor = (pct: number): string => {
    if (pct > 3) return '#00d4aa';
    if (pct > 2) return '#00b88e';
    if (pct > 1) return '#009c74';
    if (pct > 0.5) return '#007c5c';
    if (pct > 0) return '#005c44';
    if (pct > -0.5) return '#5c3344';
    if (pct > -1) return '#7c3355';
    if (pct > -2) return '#aa3355';
    if (pct > -3) return '#cc3355';
    return '#ff3b69';
  };

  // Size boxes proportional to market cap (simplified with volume as proxy)
  const sorted = [...quotes].sort((a, b) => b.volume - a.volume);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <div className="status-dot" />
          <span>MARKET HEATMAP</span>
        </div>
        <span className="text-[10px] text-[#556677]">S&P 500 · Top 30</span>
      </div>

      <div className="flex-1 p-1.5 grid grid-cols-6 grid-rows-5 gap-0.5 auto-rows-fr">
        {sorted.map(q => (
          <div
            key={q.symbol}
            onClick={() => onSelectSymbol(q.symbol)}
            className="rounded cursor-pointer flex flex-col items-center justify-center transition-all hover:scale-[1.02] hover:z-10 relative overflow-hidden"
            style={{ backgroundColor: getHeatColor(q.changePercent) }}
          >
            <span className="text-[11px] font-bold text-white drop-shadow-sm">{q.symbol}</span>
            <span className="text-[9px] text-white/80">{q.changePercent >= 0 ? '+' : ''}{q.changePercent.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
