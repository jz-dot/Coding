'use client';

import { useState, useMemo, useCallback } from 'react';
import { OptionContract } from '@/types/market';
import { formatNumber } from '@/lib/market-data';

interface OptionsChainProps {
  symbol: string;
  calls: OptionContract[];
  puts: OptionContract[];
  currentPrice: number;
}

export default function OptionsChain({ symbol, calls, puts, currentPrice }: OptionsChainProps) {
  const [showGreeks, setShowGreeks] = useState(true);
  const [selectedExpiration, setSelectedExpiration] = useState(0);
  const [highlightITM, setHighlightITM] = useState(true);

  const expirations = ['Mar 20', 'Mar 27', 'Apr 17', 'May 15', 'Jun 19', 'Sep 18', 'Dec 18'];

  const formatGreek = (val: number) => val.toFixed(4);

  const getHeatColor = (iv: number): string => {
    if (iv > 80) return '#ff3b6944';
    if (iv > 60) return '#ff6d0033';
    if (iv > 40) return '#ffb80022';
    if (iv > 20) return '#00d4aa11';
    return 'transparent';
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <div className="status-dot" />
          <span>OPTIONS CHAIN</span>
          <span className="text-[#e8edf5]">{symbol}</span>
          <span className="text-[#00d4aa] text-[10px]">@ {formatNumber(currentPrice)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGreeks(!showGreeks)}
            className={`text-[10px] px-2 py-0.5 rounded ${showGreeks ? 'bg-[#00d4aa22] text-[#00d4aa]' : 'text-[#556677]'}`}
          >
            GREEKS
          </button>
          <button
            onClick={() => setHighlightITM(!highlightITM)}
            className={`text-[10px] px-2 py-0.5 rounded ${highlightITM ? 'bg-[#2196f322] text-[#2196f3]' : 'text-[#556677]'}`}
          >
            ITM
          </button>
        </div>
      </div>

      {/* Expiration tabs */}
      <div className="flex items-center gap-0 border-b border-[#1e2a3a] bg-[#0f1419] overflow-x-auto">
        {expirations.map((exp, i) => (
          <button
            key={exp}
            onClick={() => setSelectedExpiration(i)}
            className={`px-3 py-1.5 text-[10px] whitespace-nowrap border-b-2 transition-colors ${
              selectedExpiration === i
                ? 'border-[#00d4aa] text-[#00d4aa] bg-[#00d4aa08]'
                : 'border-transparent text-[#556677] hover:text-[#8899aa]'
            }`}
          >
            {exp}
          </button>
        ))}
      </div>

      {/* Options grid */}
      <div className="flex-1 overflow-auto">
        <table className="data-table text-[10px]">
          <thead>
            <tr>
              {/* Calls header */}
              <th className="text-[#00d4aa]">OI</th>
              <th className="text-[#00d4aa]">Vol</th>
              <th className="text-[#00d4aa]">Bid</th>
              <th className="text-[#00d4aa]">Ask</th>
              <th className="text-[#00d4aa]">Last</th>
              <th className="text-[#00d4aa]">Chg</th>
              {showGreeks && <th className="text-[#00d4aa]">IV</th>}
              {showGreeks && <th className="text-[#00d4aa]">Δ</th>}
              {showGreeks && <th className="text-[#00d4aa]">Γ</th>}
              {showGreeks && <th className="text-[#00d4aa]">Θ</th>}
              {/* Strike */}
              <th className="bg-[#1a2332] text-[#e8edf5] font-bold text-center">STRIKE</th>
              {/* Puts header */}
              {showGreeks && <th className="text-[#ff3b69]">Θ</th>}
              {showGreeks && <th className="text-[#ff3b69]">Γ</th>}
              {showGreeks && <th className="text-[#ff3b69]">Δ</th>}
              {showGreeks && <th className="text-[#ff3b69]">IV</th>}
              <th className="text-[#ff3b69]">Chg</th>
              <th className="text-[#ff3b69]">Last</th>
              <th className="text-[#ff3b69]">Bid</th>
              <th className="text-[#ff3b69]">Ask</th>
              <th className="text-[#ff3b69]">Vol</th>
              <th className="text-[#ff3b69]">OI</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call, i) => {
              const put = puts[i];
              const isATM = Math.abs(call.strike - currentPrice) < 2.5;
              const callITM = highlightITM && call.inTheMoney;
              const putITM = highlightITM && put?.inTheMoney;

              return (
                <tr key={call.strike} className={isATM ? 'border-y border-[#ffb80044]' : ''}>
                  {/* Calls */}
                  <td className={callITM ? 'bg-[#00d4aa08]' : ''}>{call.openInterest.toLocaleString()}</td>
                  <td className={callITM ? 'bg-[#00d4aa08]' : ''}>{call.volume.toLocaleString()}</td>
                  <td className={callITM ? 'bg-[#00d4aa08]' : ''}>{formatNumber(call.bid)}</td>
                  <td className={callITM ? 'bg-[#00d4aa08]' : ''}>{formatNumber(call.ask)}</td>
                  <td className={`font-semibold ${callITM ? 'bg-[#00d4aa08]' : ''}`}>{formatNumber(call.lastPrice)}</td>
                  <td className={`${call.change >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'} ${callITM ? 'bg-[#00d4aa08]' : ''}`}>
                    {call.change >= 0 ? '+' : ''}{formatNumber(call.change)}
                  </td>
                  {showGreeks && (
                    <td className={callITM ? 'bg-[#00d4aa08]' : ''} style={{ backgroundColor: getHeatColor(call.impliedVolatility) }}>
                      {call.impliedVolatility.toFixed(1)}%
                    </td>
                  )}
                  {showGreeks && <td className={callITM ? 'bg-[#00d4aa08]' : ''}>{formatGreek(call.delta)}</td>}
                  {showGreeks && <td className={callITM ? 'bg-[#00d4aa08]' : ''}>{formatGreek(call.gamma)}</td>}
                  {showGreeks && <td className={`text-[#ff3b69] ${callITM ? 'bg-[#00d4aa08]' : ''}`}>{formatGreek(call.theta)}</td>}

                  {/* Strike */}
                  <td className={`text-center font-bold bg-[#1a2332] ${isATM ? 'text-[#ffb800]' : 'text-[#e8edf5]'}`}>
                    {formatNumber(call.strike, 0)}
                    {isATM && <span className="text-[8px] text-[#ffb800] ml-1">ATM</span>}
                  </td>

                  {/* Puts */}
                  {showGreeks && <td className={`text-[#ff3b69] ${putITM ? 'bg-[#ff3b6908]' : ''}`}>{put ? formatGreek(put.theta) : '-'}</td>}
                  {showGreeks && <td className={putITM ? 'bg-[#ff3b6908]' : ''}>{put ? formatGreek(put.gamma) : '-'}</td>}
                  {showGreeks && <td className={putITM ? 'bg-[#ff3b6908]' : ''}>{put ? formatGreek(put.delta) : '-'}</td>}
                  {showGreeks && (
                    <td className={putITM ? 'bg-[#ff3b6908]' : ''} style={{ backgroundColor: put ? getHeatColor(put.impliedVolatility) : 'transparent' }}>
                      {put ? `${put.impliedVolatility.toFixed(1)}%` : '-'}
                    </td>
                  )}
                  <td className={`${put && put.change >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'} ${putITM ? 'bg-[#ff3b6908]' : ''}`}>
                    {put ? `${put.change >= 0 ? '+' : ''}${formatNumber(put.change)}` : '-'}
                  </td>
                  <td className={`font-semibold ${putITM ? 'bg-[#ff3b6908]' : ''}`}>{put ? formatNumber(put.lastPrice) : '-'}</td>
                  <td className={putITM ? 'bg-[#ff3b6908]' : ''}>{put ? formatNumber(put.bid) : '-'}</td>
                  <td className={putITM ? 'bg-[#ff3b6908]' : ''}>{put ? formatNumber(put.ask) : '-'}</td>
                  <td className={putITM ? 'bg-[#ff3b6908]' : ''}>{put ? put.volume.toLocaleString() : '-'}</td>
                  <td className={putITM ? 'bg-[#ff3b6908]' : ''}>{put ? put.openInterest.toLocaleString() : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 px-3 py-1.5 border-t border-[#1e2a3a] text-[10px] text-[#556677]">
        <span>Put/Call Ratio: <span className="text-[#e8edf5]">0.82</span></span>
        <span>Max Pain: <span className="text-[#ffb800]">{formatNumber(Math.round(currentPrice / 5) * 5)}</span></span>
        <span>Total OI: <span className="text-[#e8edf5]">284.3K</span></span>
        <span className="ml-auto">Exp: <span className="text-[#e8edf5]">{expirations[selectedExpiration]}</span></span>
      </div>
    </div>
  );
}
