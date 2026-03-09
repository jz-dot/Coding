'use client';

import { TradingAgent } from '@/types/market';
import { formatCurrency, formatNumber } from '@/lib/market-data';
import { Bot, Play, Pause, Square, Zap, TrendingUp, AlertCircle, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface AgentsDashboardProps {
  agents: TradingAgent[];
}

export default function AgentsDashboard({ agents }: AgentsDashboardProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(agents[0]?.id || null);

  const getStatusColor = (status: TradingAgent['status']) => {
    switch (status) {
      case 'running': return '#00d4aa';
      case 'paused': return '#ffb800';
      case 'stopped': return '#556677';
      case 'error': return '#ff3b69';
    }
  };

  const getStatusIcon = (status: TradingAgent['status']) => {
    switch (status) {
      case 'running': return <Activity size={10} className="animate-pulse" />;
      case 'paused': return <Pause size={10} />;
      case 'stopped': return <Square size={10} />;
      case 'error': return <AlertCircle size={10} />;
    }
  };

  const totalPnl = agents.reduce((s, a) => s + a.pnl, 0);
  const totalCapital = agents.reduce((s, a) => s + a.capital, 0);
  const totalDeployed = agents.reduce((s, a) => s + a.deployed, 0);
  const runningCount = agents.filter(a => a.status === 'running').length;

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <Bot size={12} className="text-[#2196f3]" />
          <span>TRADING AGENTS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#00d4aa]">{runningCount} active</span>
          <button className="text-[10px] px-2 py-0.5 rounded bg-[#00d4aa22] text-[#00d4aa] hover:bg-[#00d4aa33]">
            + NEW
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 p-2 border-b border-[#1e2a3a]">
        <div className="text-center">
          <div className="text-[8px] text-[#556677]">TOTAL P&L</div>
          <div className={`text-[12px] font-bold ${totalPnl >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}`}>
            {formatCurrency(totalPnl)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-[#556677]">CAPITAL</div>
          <div className="text-[12px] font-bold text-[#e8edf5]">{formatCurrency(totalCapital)}</div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-[#556677]">DEPLOYED</div>
          <div className="text-[12px] font-bold text-[#2196f3]">{((totalDeployed / totalCapital) * 100).toFixed(1)}%</div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-[#556677]">TOTAL TRADES</div>
          <div className="text-[12px] font-bold text-[#e8edf5]">{agents.reduce((s, a) => s + a.trades, 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-auto">
        {agents.map(agent => (
          <div key={agent.id} className="border-b border-[#1e2a3a]">
            {/* Agent header */}
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#1a2332] transition-colors"
              onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
            >
              {expandedAgent === agent.id ? (
                <ChevronDown size={10} className="text-[#556677]" />
              ) : (
                <ChevronRight size={10} className="text-[#556677]" />
              )}

              {/* Status indicator */}
              <div className="relative">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: getStatusColor(agent.status),
                    boxShadow: agent.status === 'running' ? `0 0 8px ${getStatusColor(agent.status)}` : 'none',
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#e8edf5] truncate">{agent.name}</span>
                  <span className="text-[9px] text-[#556677]">{agent.strategy}</span>
                </div>
              </div>

              <div className={`text-[11px] font-bold ${agent.pnl >= 0 ? 'text-[#00d4aa]' : 'text-[#ff3b69]'}`}>
                {formatCurrency(agent.pnl)}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 ml-2">
                {agent.status === 'running' ? (
                  <Pause size={11} className="text-[#ffb800] cursor-pointer hover:text-[#ffd000]" />
                ) : (
                  <Play size={11} className="text-[#00d4aa] cursor-pointer hover:text-[#00ffcc]" />
                )}
                <Square size={11} className="text-[#ff3b69] cursor-pointer hover:text-[#ff5c88]" />
              </div>
            </div>

            {/* Expanded details */}
            {expandedAgent === agent.id && (
              <div className="px-3 pb-2 bg-[#0a0e17]">
                {/* Stats grid */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {[
                    { label: 'Win Rate', value: `${agent.winRate}%`, color: agent.winRate > 55 ? '#00d4aa' : '#ffb800' },
                    { label: 'Sharpe', value: agent.sharpeRatio.toFixed(2), color: agent.sharpeRatio > 1.5 ? '#00d4aa' : '#ffb800' },
                    { label: 'Max DD', value: `${agent.maxDrawdown}%`, color: '#ff3b69' },
                    { label: 'Trades', value: agent.trades.toString(), color: '#e8edf5' },
                    { label: 'Uptime', value: agent.uptime, color: '#8899aa' },
                    { label: 'Last Trade', value: agent.lastTrade, color: '#8899aa' },
                  ].map(s => (
                    <div key={s.label} className="text-center bg-[#111820] rounded p-1.5">
                      <div className="text-[8px] text-[#556677]">{s.label}</div>
                      <div className="text-[10px] font-semibold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Capital deployment bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[9px] mb-1">
                    <span className="text-[#556677]">Capital Deployed</span>
                    <span className="text-[#e8edf5]">{formatCurrency(agent.deployed)} / {formatCurrency(agent.capital)}</span>
                  </div>
                  <div className="h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2196f3] to-[#00d4aa]"
                      style={{ width: `${(agent.deployed / agent.capital) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Recent signals */}
                {agent.signals.length > 0 && (
                  <div>
                    <div className="text-[9px] text-[#556677] uppercase mb-1 flex items-center gap-1">
                      <Zap size={9} className="text-[#ffb800]" />
                      Recent Signals
                    </div>
                    {agent.signals.map((sig, i) => (
                      <div key={i} className="flex items-center gap-2 py-1 text-[10px] border-t border-[#1e2a3a]">
                        <span className="text-[#556677] font-mono">{sig.time}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                          style={{
                            color: sig.type === 'buy' ? '#00d4aa' : sig.type === 'sell' ? '#ff3b69' : '#ffb800',
                            backgroundColor: sig.type === 'buy' ? '#00d4aa15' : sig.type === 'sell' ? '#ff3b6915' : '#ffb80015',
                          }}
                        >
                          {sig.type.toUpperCase()}
                        </span>
                        <span className="text-[#e8edf5] font-semibold">{sig.symbol}</span>
                        <span className="text-[#8899aa]">@ {formatNumber(sig.price)}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="w-6 h-1 bg-[#1e2a3a] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#00d4aa]"
                              style={{ width: `${sig.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-[#556677]">{(sig.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                    {agent.signals.length > 0 && agent.signals[0].reason && (
                      <div className="text-[9px] text-[#556677] mt-1 italic">
                        &quot;{agent.signals[0].reason}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
