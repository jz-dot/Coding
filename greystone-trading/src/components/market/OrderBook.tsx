'use client';

import { OrderBookEntry } from '@/types/market';
import { formatNumber } from '@/lib/market-data';

interface OrderBookProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  symbol: string;
}

export default function OrderBook({ bids, asks, symbol }: OrderBookProps) {
  const maxTotal = Math.max(
    bids[bids.length - 1]?.total || 0,
    asks[asks.length - 1]?.total || 0
  );

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <div className="status-dot" />
          <span>ORDER BOOK</span>
          <span className="text-[#e8edf5]">{symbol}</span>
        </div>
        <span className="text-[10px] text-[#556677]">L2 DATA</span>
      </div>

      <div className="flex-1 overflow-auto px-1">
        {/* Headers */}
        <div className="flex items-center justify-between px-2 py-1 text-[9px] text-[#556677] uppercase sticky top-0 bg-[#111820]">
          <span className="w-1/3 text-left">Price</span>
          <span className="w-1/3 text-right">Size</span>
          <span className="w-1/3 text-right">Total</span>
        </div>

        {/* Asks (reversed to show lowest on bottom) */}
        <div className="flex flex-col-reverse">
          {asks.slice(0, 12).map((ask, i) => (
            <div key={`ask-${i}`} className="relative flex items-center justify-between px-2 py-0.5 text-[10px]">
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#ff3b6910]"
                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
              />
              <span className="w-1/3 text-left text-[#ff3b69] font-mono relative z-10">{formatNumber(ask.price)}</span>
              <span className="w-1/3 text-right text-[#e8edf5] font-mono relative z-10">{ask.size.toLocaleString()}</span>
              <span className="w-1/3 text-right text-[#556677] font-mono relative z-10">{ask.total.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="flex items-center justify-center py-1.5 border-y border-[#1e2a3a] text-[10px]">
          <span className="text-[#ffb800]">
            Spread: {asks[0] && bids[0] ? formatNumber(asks[0].price - bids[0].price) : '0.00'}
          </span>
          <span className="text-[#556677] ml-2">
            ({asks[0] && bids[0] ? ((asks[0].price - bids[0].price) / asks[0].price * 100).toFixed(3) : '0.000'}%)
          </span>
        </div>

        {/* Bids */}
        {bids.slice(0, 12).map((bid, i) => (
          <div key={`bid-${i}`} className="relative flex items-center justify-between px-2 py-0.5 text-[10px]">
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#00d4aa10]"
              style={{ width: `${(bid.total / maxTotal) * 100}%` }}
            />
            <span className="w-1/3 text-left text-[#00d4aa] font-mono relative z-10">{formatNumber(bid.price)}</span>
            <span className="w-1/3 text-right text-[#e8edf5] font-mono relative z-10">{bid.size.toLocaleString()}</span>
            <span className="w-1/3 text-right text-[#556677] font-mono relative z-10">{bid.total.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
