'use client';

import { Position, RiskMetrics } from '@/types/market';
import { formatNumber, formatCurrency, formatLargeNumber } from '@/lib/market-data';
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from 'lucide-react';

interface PortfolioSummaryProps {
  positions: Position[];
  risk: RiskMetrics | null;
}

export default function PortfolioSummary({ positions, risk }: PortfolioSummaryProps) {
  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalDayPnl = positions.reduce((s, p) => s + p.dayPnl, 0);
  const totalValue = positions.reduce((s, p) => s + p.marketValue, 0);

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <div className="status-dot" />
          <span>PORTFOLIO</span>
        </div>
        <span className="text-[10px] text-[#556677]">{positions.length} positions</span>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2 p-3">
          <div className="bg-[#0a0e17] rounded p-2">
            <div className="text-[9px] text-[#556677] uppercase mb-1">Market Value</div>
            <div className="text-sm font-bold text-[#e8edf5]">{formatCurrency(totalValue)}</div>
          </div>
          <div className="bg-[#0a0e17] rounded p-2">
            <div className="text-[9px] text-[#556677] uppercase mb-1">Total P&L</div>
            <div className={`text-sm font-bold ${totalPnl >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}`}>
              {formatCurrency(totalPnl)}
            </div>
          </div>
          <div className="bg-[#0a0e17] rounded p-2">
            <div className="text-[9px] text-[#556677] uppercase mb-1">Day P&L</div>
            <div className={`text-sm font-bold flex items-center gap-1 ${totalDayPnl >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}`}>
              {totalDayPnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {formatCurrency(totalDayPnl)}
            </div>
          </div>
          <div className="bg-[#0a0e17] rounded p-2">
            <div className="text-[9px] text-[#556677] uppercase mb-1">Buying Power</div>
            <div className="text-sm font-bold text-[#2196f3]">$247,832</div>
          </div>
        </div>

        {/* Positions table */}
        <table className="data-table text-[10px]">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Avg</th>
              <th>Last</th>
              <th>P&L</th>
              <th>P&L %</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => (
              <tr key={pos.symbol + pos.type + (pos.optionDetails?.strike || '')}>
                <td className="text-left">
                  <div>
                    <span className="text-[#e8edf5] font-semibold">{pos.symbol}</span>
                    {pos.type === 'option' && pos.optionDetails && (
                      <div className="text-[8px] text-[#8899aa]">
                        {pos.optionDetails.strike} {pos.optionDetails.type.toUpperCase()} {pos.optionDetails.expiration}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`text-[9px] px-1 rounded ${
                    pos.side === 'long' ? 'text-[#00d4aa] bg-[#00d4aa15]' : 'text-[#ff3b69] bg-[#ff3b6915]'
                  }`}>
                    {pos.side.toUpperCase()}
                  </span>
                </td>
                <td>{pos.quantity}</td>
                <td>{formatNumber(pos.avgPrice)}</td>
                <td>{formatNumber(pos.currentPrice)}</td>
                <td className={pos.pnl >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}>
                  {formatCurrency(pos.pnl)}
                </td>
                <td className={pos.pnlPercent >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}>
                  {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                </td>
                <td>{formatCurrency(pos.marketValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Risk metrics */}
        {risk && (
          <div className="border-t border-[#1e2a3a] p-3">
            <div className="flex items-center gap-1 mb-2">
              <Shield size={11} className="text-[#2196f3]" />
              <span className="text-[10px] text-[#8899aa] uppercase">Risk Metrics</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'β Beta', value: risk.portfolioBeta.toFixed(2), color: '#2196f3' },
                { label: 'Δ Delta', value: risk.portfolioDelta.toFixed(0), color: '#00d4aa' },
                { label: 'Γ Gamma', value: risk.portfolioGamma.toFixed(1), color: '#ffb800' },
                { label: 'Θ Theta', value: risk.portfolioTheta.toFixed(0), color: '#ff3b69' },
                { label: 'ν Vega', value: risk.portfolioVega.toFixed(0), color: '#9c27b0' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <div className="text-[9px] text-[#556677]">{m.label}</div>
                  <div className="text-[11px] font-bold" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[
                { label: 'Sharpe', value: risk.sharpeRatio.toFixed(2) },
                { label: 'Sortino', value: risk.sortinoRatio.toFixed(2) },
                { label: 'Max DD', value: `${risk.maxDrawdown.toFixed(1)}%` },
                { label: 'VaR 95%', value: formatCurrency(risk.valueAtRisk) },
              ].map(m => (
                <div key={m.label} className="bg-[#0a0e17] rounded p-1.5 text-center">
                  <div className="text-[8px] text-[#556677]">{m.label}</div>
                  <div className="text-[10px] text-[#e8edf5] font-semibold">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
