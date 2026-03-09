'use client';

import { SentimentData } from '@/types/market';
import { formatNumber } from '@/lib/market-data';
import { TrendingUp, TrendingDown, Newspaper, MessageCircle, Users, Target } from 'lucide-react';

interface SentimentPanelProps {
  sentiment: SentimentData;
}

export default function SentimentPanel({ sentiment }: SentimentPanelProps) {
  const getSentimentColor = (score: number) => {
    if (score > 0.5) return '#00d4aa';
    if (score > 0.2) return '#00a88a';
    if (score > -0.2) return '#ffb800';
    if (score > -0.5) return '#ff6d00';
    return '#ff3b69';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.5) return 'Very Bullish';
    if (score > 0.2) return 'Bullish';
    if (score > -0.2) return 'Neutral';
    if (score > -0.5) return 'Bearish';
    return 'Very Bearish';
  };

  const renderSentimentGauge = (score: number, size: number = 60) => {
    const angle = ((score + 1) / 2) * 180 - 90; // -90 to 90 degrees
    const cx = size;
    const cy = size;
    const radius = size - 10;

    return (
      <svg width={size * 2} height={size + 10} viewBox={`0 0 ${size * 2} ${size + 10}`}>
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1e2a3a"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Gradient arc */}
        <defs>
          <linearGradient id="sentimentGradient">
            <stop offset="0%" stopColor="#ff3b69" />
            <stop offset="25%" stopColor="#ff6d00" />
            <stop offset="50%" stopColor="#ffb800" />
            <stop offset="75%" stopColor="#00a88a" />
            <stop offset="100%" stopColor="#00d4aa" />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#sentimentGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + (radius - 5) * Math.cos((angle * Math.PI) / 180)}
          y2={cy + (radius - 5) * Math.sin((angle * Math.PI) / 180)}
          stroke={getSentimentColor(score)}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4" fill={getSentimentColor(score)} />
      </svg>
    );
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <div className="status-dot" />
          <span>SENTIMENT & SIGNALS</span>
          <span className="text-[#e8edf5]">{sentiment.symbol}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {/* Main sentiment gauge */}
        <div className="flex items-center justify-center mb-2">
          {renderSentimentGauge(sentiment.overall)}
        </div>
        <div className="text-center mb-3">
          <div
            className="text-lg font-bold"
            style={{ color: getSentimentColor(sentiment.overall) }}
          >
            {getSentimentLabel(sentiment.overall)}
          </div>
          <div className="text-[10px] text-[#556677]">
            Composite Score: {(sentiment.overall * 100).toFixed(0)}
          </div>
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#0a0e17] rounded p-2 text-center">
            <Newspaper size={12} className="text-[#2196f3] mx-auto mb-1" />
            <div className="text-[8px] text-[#556677]">News</div>
            <div className="text-[12px] font-bold" style={{ color: getSentimentColor(sentiment.newsScore) }}>
              {(sentiment.newsScore * 100).toFixed(0)}
            </div>
          </div>
          <div className="bg-[#0a0e17] rounded p-2 text-center">
            <MessageCircle size={12} className="text-[#9c27b0] mx-auto mb-1" />
            <div className="text-[8px] text-[#556677]">Social</div>
            <div className="text-[12px] font-bold" style={{ color: getSentimentColor(sentiment.socialScore) }}>
              {(sentiment.socialScore * 100).toFixed(0)}
            </div>
          </div>
          <div className="bg-[#0a0e17] rounded p-2 text-center">
            <Users size={12} className="text-[#ffb800] mx-auto mb-1" />
            <div className="text-[8px] text-[#556677]">Analyst</div>
            <div className="text-[12px] font-bold text-[#e8edf5]">{sentiment.analystRating}</div>
          </div>
        </div>

        {/* Price target */}
        <div className="bg-[#0a0e17] rounded p-2 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={12} className="text-[#ffb800]" />
            <span className="text-[10px] text-[#556677]">Consensus Price Target</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#ffb800]">${formatNumber(sentiment.priceTarget)}</span>
            <span className="text-[9px] text-[#00d4aa]">
              <TrendingUp size={9} className="inline" /> +{((sentiment.priceTarget / (sentiment.priceTarget * 0.85) - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Headlines */}
        <div className="text-[9px] text-[#556677] uppercase mb-1.5 flex items-center gap-1">
          <Newspaper size={9} />
          Latest Headlines
        </div>
        <div className="space-y-1">
          {sentiment.headlines.map((headline, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5 border-t border-[#1e2a3a]">
              <div
                className="w-1 h-full min-h-[20px] rounded-full flex-shrink-0"
                style={{ backgroundColor: getSentimentColor(headline.sentiment) }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[#e8edf5] leading-tight">{headline.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-[#556677]">{headline.source}</span>
                  <span className="text-[9px] text-[#556677]">{headline.time}</span>
                  <span
                    className="text-[8px] px-1 rounded"
                    style={{
                      color: getSentimentColor(headline.sentiment),
                      backgroundColor: getSentimentColor(headline.sentiment) + '15',
                    }}
                  >
                    {headline.sentiment > 0 ? '+' : ''}{(headline.sentiment * 100).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
