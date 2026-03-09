'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CandleData } from '@/types/market';
import { StockQuote } from '@/types/market';
import { formatNumber, formatLargeNumber } from '@/lib/market-data';
import { Maximize2, Minus, TrendingUp, BarChart3, LineChart } from 'lucide-react';

interface PriceChartProps {
  symbol: string;
  quote: StockQuote;
  candles: CandleData[];
}

export default function PriceChart({ symbol, quote, candles }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<'candle' | 'line' | 'bar'>('candle');
  const [timeframe, setTimeframe] = useState('1D');
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; candle: CandleData | null } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const w = dimensions.width;
    const h = dimensions.height;
    const padding = { top: 10, right: 60, bottom: 40, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, w, h);

    // Data range
    const visibleCandles = candles.slice(-100);
    const prices = visibleCandles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const priceMargin = priceRange * 0.05;

    const yScale = (price: number) => padding.top + chartH - ((price - minPrice + priceMargin) / (priceRange + priceMargin * 2)) * chartH;
    const candleWidth = Math.max(1, (chartW / visibleCandles.length) * 0.7);
    const gap = chartW / visibleCandles.length;

    // Grid lines
    ctx.strokeStyle = '#1e2a3a';
    ctx.lineWidth = 0.5;
    const gridLines = 6;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice + priceMargin - ((priceRange + priceMargin * 2) / gridLines) * i;
      ctx.fillStyle = '#556677';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), w - padding.right + 5, y + 3);
    }

    // Volume bars
    const maxVol = Math.max(...visibleCandles.map(c => c.volume));
    const volHeight = chartH * 0.15;

    visibleCandles.forEach((candle, i) => {
      const x = padding.left + i * gap + gap / 2;
      const volH = (candle.volume / maxVol) * volHeight;
      const isUp = candle.close >= candle.open;
      ctx.fillStyle = isUp ? '#00d4aa22' : '#ff3b6922';
      ctx.fillRect(x - candleWidth / 2, h - padding.bottom - volH, candleWidth, volH);
    });

    if (chartType === 'candle') {
      // Candlesticks
      visibleCandles.forEach((candle, i) => {
        const x = padding.left + i * gap + gap / 2;
        const isUp = candle.close >= candle.open;
        const color = isUp ? '#00d4aa' : '#ff3b69';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yScale(candle.high));
        ctx.lineTo(x, yScale(candle.low));
        ctx.stroke();

        // Body
        const bodyTop = yScale(Math.max(candle.open, candle.close));
        const bodyBottom = yScale(Math.min(candle.open, candle.close));
        const bodyHeight = Math.max(1, bodyBottom - bodyTop);

        if (isUp) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        }
      });
    } else if (chartType === 'line') {
      // Line chart
      ctx.beginPath();
      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 1.5;
      visibleCandles.forEach((candle, i) => {
        const x = padding.left + i * gap + gap / 2;
        const y = yScale(candle.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
      gradient.addColorStop(0, '#00d4aa22');
      gradient.addColorStop(1, '#00d4aa00');
      ctx.lineTo(padding.left + (visibleCandles.length - 1) * gap + gap / 2, h - padding.bottom);
      ctx.lineTo(padding.left + gap / 2, h - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Moving averages
    const drawMA = (period: number, color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (let i = period - 1; i < visibleCandles.length; i++) {
        const ma = visibleCandles.slice(i - period + 1, i + 1).reduce((s, c) => s + c.close, 0) / period;
        const x = padding.left + i * gap + gap / 2;
        const y = yScale(ma);
        if (i === period - 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawMA(20, '#ffb80066');
    drawMA(50, '#2196f366');

    // Current price line
    const currentPrice = visibleCandles[visibleCandles.length - 1]?.close;
    if (currentPrice) {
      const y = yScale(currentPrice);
      ctx.strokeStyle = quote.change >= 0 ? '#00d4aa' : '#ff3b69';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price tag
      ctx.fillStyle = quote.change >= 0 ? '#00d4aa' : '#ff3b69';
      ctx.fillRect(w - padding.right, y - 9, 58, 18);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(currentPrice.toFixed(2), w - padding.right + 29, y + 3);
    }

    // Crosshair
    if (crosshair && crosshair.candle) {
      ctx.strokeStyle = '#556677';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(crosshair.x, padding.top);
      ctx.lineTo(crosshair.x, h - padding.bottom);
      ctx.moveTo(padding.left, crosshair.y);
      ctx.lineTo(w - padding.right, crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // OHLCV tooltip
      const c = crosshair.candle;
      ctx.fillStyle = '#111820ee';
      ctx.fillRect(padding.left + 5, padding.top + 5, 200, 75);
      ctx.strokeStyle = '#2a3a4e';
      ctx.strokeRect(padding.left + 5, padding.top + 5, 200, 75);
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      const isUp = c.close >= c.open;
      ctx.fillStyle = '#8899aa';
      ctx.fillText(`O: `, padding.left + 12, padding.top + 22);
      ctx.fillStyle = isUp ? '#00d4aa' : '#ff3b69';
      ctx.fillText(`${c.open.toFixed(2)}`, padding.left + 30, padding.top + 22);
      ctx.fillStyle = '#8899aa';
      ctx.fillText(`H: `, padding.left + 95, padding.top + 22);
      ctx.fillStyle = '#e8edf5';
      ctx.fillText(`${c.high.toFixed(2)}`, padding.left + 113, padding.top + 22);
      ctx.fillStyle = '#8899aa';
      ctx.fillText(`L: `, padding.left + 12, padding.top + 40);
      ctx.fillStyle = '#e8edf5';
      ctx.fillText(`${c.low.toFixed(2)}`, padding.left + 30, padding.top + 40);
      ctx.fillStyle = '#8899aa';
      ctx.fillText(`C: `, padding.left + 95, padding.top + 40);
      ctx.fillStyle = isUp ? '#00d4aa' : '#ff3b69';
      ctx.fillText(`${c.close.toFixed(2)}`, padding.left + 113, padding.top + 40);
      ctx.fillStyle = '#8899aa';
      ctx.fillText(`Vol: `, padding.left + 12, padding.top + 58);
      ctx.fillStyle = '#e8edf5';
      ctx.fillText(`${formatLargeNumber(c.volume)}`, padding.left + 42, padding.top + 58);
      ctx.fillStyle = '#8899aa';
      ctx.fillText(`Chg: `, padding.left + 95, padding.top + 58);
      ctx.fillStyle = isUp ? '#00d4aa' : '#ff3b69';
      ctx.fillText(`${((c.close - c.open) / c.open * 100).toFixed(2)}%`, padding.left + 125, padding.top + 58);
    }
  }, [candles, dimensions, chartType, crosshair, quote.change]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const padding = { left: 10, right: 60 };
    const chartW = dimensions.width - padding.left - padding.right;
    const visibleCandles = candles.slice(-100);
    const gap = chartW / visibleCandles.length;
    const idx = Math.floor((x - padding.left) / gap);

    if (idx >= 0 && idx < visibleCandles.length) {
      setCrosshair({ x, y, candle: visibleCandles[idx] });
    }
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <div className="status-dot" />
          <span className="text-[#e8edf5] font-semibold">{symbol}</span>
          <span className="text-[#556677]">·</span>
          <span className="text-[13px] font-bold" style={{ color: quote.change >= 0 ? '#00d4aa' : '#ff3b69' }}>
            {formatNumber(quote.price)}
          </span>
          <span className={`text-[11px] ${quote.change >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}`}>
            {quote.change >= 0 ? '+' : ''}{formatNumber(quote.change)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent}%)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Chart type toggle */}
          <div className="flex items-center bg-[#0a0e17] rounded overflow-hidden mr-2">
            {[
              { type: 'candle' as const, icon: <BarChart3 size={11} /> },
              { type: 'line' as const, icon: <LineChart size={11} /> },
              { type: 'bar' as const, icon: <TrendingUp size={11} /> },
            ].map(ct => (
              <button
                key={ct.type}
                onClick={() => setChartType(ct.type)}
                className={`px-1.5 py-1 ${chartType === ct.type ? 'text-[#00d4aa] bg-[#00d4aa15]' : 'text-[#556677] hover:text-[#8899aa]'}`}
              >
                {ct.icon}
              </button>
            ))}
          </div>
          {/* Timeframes */}
          <div className="flex items-center bg-[#0a0e17] rounded overflow-hidden">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-1.5 py-0.5 text-[10px] ${timeframe === tf ? 'text-[#00d4aa] bg-[#00d4aa15]' : 'text-[#556677] hover:text-[#8899aa]'}`}
              >
                {tf}
              </button>
            ))}
          </div>
          <Maximize2 size={11} className="text-[#556677] hover:text-[#e8edf5] cursor-pointer ml-2" />
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCrosshair(null)}
          className="cursor-crosshair"
        />
      </div>

      {/* Bottom stats bar */}
      <div className="flex items-center gap-4 px-3 py-1.5 border-t border-[#1e2a3a] text-[10px] text-[#556677]">
        <span>O <span className="text-[#e8edf5]">{formatNumber(quote.open)}</span></span>
        <span>H <span className="text-[#e8edf5]">{formatNumber(quote.high)}</span></span>
        <span>L <span className="text-[#e8edf5]">{formatNumber(quote.low)}</span></span>
        <span>V <span className="text-[#e8edf5]">{formatLargeNumber(quote.volume)}</span></span>
        <span className="ml-auto">MA20 <span className="text-[#ffb800]">{formatNumber(quote.price * 0.98)}</span></span>
        <span>MA50 <span className="text-[#2196f3]">{formatNumber(quote.price * 0.95)}</span></span>
      </div>
    </div>
  );
}
