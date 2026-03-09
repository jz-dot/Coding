'use client';

import { MarketIndex } from '@/types/market';
import { formatNumber } from '@/lib/market-data';
import { Activity, Wifi, WifiOff, Clock, Search, Bell, Settings, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TopBarProps {
  indices: MarketIndex[];
  isConnected: boolean;
}

export default function TopBar({ indices, isConnected }: TopBarProps) {
  const [time, setTime] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="h-10 bg-[#0a0e17] border-b border-[#1e2a3a] flex items-center px-3 gap-2 select-none flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00d4aa] to-[#2196f3] flex items-center justify-center">
          <span className="text-[#0a0e17] font-bold text-[10px]">G</span>
        </div>
        <span className="text-[11px] font-semibold tracking-wider text-[#e8edf5]">GREYSTONE</span>
      </div>

      {/* Ticker tape */}
      <div className="flex-1 overflow-hidden relative">
        <div className="ticker-tape">
          {[...indices, ...indices].map((idx, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span className="text-[#8899aa] font-medium">{idx.symbol}</span>
              <span className="text-[#e8edf5]">{formatNumber(idx.value)}</span>
              <span className={idx.change >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}>
                {idx.change >= 0 ? '+' : ''}{formatNumber(idx.change)} ({idx.changePercent >= 0 ? '+' : ''}{idx.changePercent}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* Search */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-[#556677] hover:text-[#e8edf5] transition-colors"
        >
          <Search size={14} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <Bell size={14} className="text-[#556677] hover:text-[#e8edf5] cursor-pointer transition-colors" />
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ff3b69] animate-pulse" />
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi size={12} className="text-[#00d4aa]" />
          ) : (
            <WifiOff size={12} className="text-[#ff3b69] animate-pulse" />
          )}
          <span className={`text-[10px] ${isConnected ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}`}>
            {isConnected ? 'LIVE' : 'RECONNECTING'}
          </span>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-1 text-[11px] text-[#8899aa]">
          <Clock size={11} />
          <span className="font-mono">{time}</span>
        </div>

        {/* Market status */}
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          <span className="text-[10px] text-[#00d4aa]">MKT OPEN</span>
        </div>

        <Settings size={13} className="text-[#556677] hover:text-[#e8edf5] cursor-pointer transition-colors" />
        <Maximize2 size={13} className="text-[#556677] hover:text-[#e8edf5] cursor-pointer transition-colors" />
      </div>

      {/* Command palette overlay */}
      {showSearch && (
        <div className="fixed inset-0 command-overlay z-50 flex items-start justify-center pt-[15vh]" onClick={() => setShowSearch(false)}>
          <div className="bg-[#111820] border border-[#2a3a4e] rounded-lg w-[600px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2a3a]">
              <Search size={16} className="text-[#556677]" />
              <input
                autoFocus
                type="text"
                placeholder="Search symbols, commands, or ask AI..."
                className="bg-transparent flex-1 text-sm text-[#e8edf5] outline-none placeholder:text-[#556677]"
              />
              <kbd className="text-[10px] text-[#556677] bg-[#1e2a3a] px-1.5 py-0.5 rounded">ESC</kbd>
            </div>
            <div className="px-4 py-2 text-[11px] text-[#556677]">
              <div className="py-1.5 px-2 hover:bg-[#1a2332] rounded cursor-pointer">Type a symbol to view quote...</div>
              <div className="py-1.5 px-2 hover:bg-[#1a2332] rounded cursor-pointer">/options - View options chain</div>
              <div className="py-1.5 px-2 hover:bg-[#1a2332] rounded cursor-pointer">/agents - Manage trading agents</div>
              <div className="py-1.5 px-2 hover:bg-[#1a2332] rounded cursor-pointer">/ai - Ask AI analyst</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
