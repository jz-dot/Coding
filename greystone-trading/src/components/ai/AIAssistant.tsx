'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/market';
import { Brain, Send, Sparkles, TrendingUp, AlertTriangle, BarChart3, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  symbol: string;
}

const PRESET_RESPONSES: Record<string, string> = {
  'analyze': `**Technical Analysis Summary**

Based on current price action and indicators:

**Trend:** Bullish momentum with price trading above both 20 and 50 EMA. MACD histogram expanding positively.

**Key Levels:**
- Support: $220.50, $215.00
- Resistance: $235.00, $242.80

**Volume Profile:** Above-average volume on up moves confirms buying pressure. Accumulation detected in VWAP analysis.

**Options Flow:** Unusual call activity detected at $240 strike for next month expiration. Put/Call ratio at 0.72 suggests bullish sentiment.

**AI Confidence Score: 78/100** - Moderately bullish outlook with positive momentum indicators aligned.`,

  'risk': `**Portfolio Risk Assessment**

**Current Risk Profile: MODERATE**

- Portfolio Beta: 1.24 (slightly above market)
- Value at Risk (95%): -$34,250 daily
- Expected Shortfall: -$52,100
- Max Drawdown (30d): -6.8%

**Key Risks Identified:**
1. ⚠️ Heavy concentration in Tech sector (68%)
2. ⚠️ Short TSLA position at risk with upcoming earnings
3. ⚠️ Net delta exposure of +1,240 - consider hedging

**Recommended Actions:**
- Add protective puts on NVDA position
- Consider reducing tech exposure by 15%
- Roll short TSLA to later expiration`,

  'strategy': `**Recommended Strategies for Current Market**

**1. Iron Condor on SPY (High IV Environment)**
- Sell 520/530 Call Spread + 490/480 Put Spread
- Credit: $3.20 | Max Loss: $6.80
- Probability of Profit: 72%

**2. Pairs Trade: MSFT/GOOGL**
- Long MSFT / Short GOOGL (z-score: 2.1σ)
- Historical mean reversion rate: 85%
- Target: $4,200 profit on convergence

**3. Calendar Spread on NVDA**
- Sell Mar 880C / Buy Apr 880C
- Net debit: $8.50 | Max profit: $16.20
- Benefits from IV crush post-earnings`,
};

export default function AIAssistant({ symbol }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: `Greystone AI Analyst online. Monitoring ${symbol} and your portfolio in real-time. Ask me anything about market analysis, risk assessment, or trading strategies.`,
      timestamp: Date.now() - 60000,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let response = '';

      if (lowerInput.includes('analy') || lowerInput.includes('technical') || lowerInput.includes('chart')) {
        response = PRESET_RESPONSES['analyze'];
      } else if (lowerInput.includes('risk') || lowerInput.includes('hedge') || lowerInput.includes('protect')) {
        response = PRESET_RESPONSES['risk'];
      } else if (lowerInput.includes('strateg') || lowerInput.includes('trade') || lowerInput.includes('recommend')) {
        response = PRESET_RESPONSES['strategy'];
      } else {
        response = `I've analyzed your query about "${input}" in the context of current market conditions.\n\n**Key Observations:**\n- ${symbol} showing relative strength vs. sector peers\n- Implied volatility percentile at 62nd rank\n- Institutional flow has been net positive over 5 sessions\n\n**Recommendation:** Monitor for a pullback to the 20 EMA for potential entry. Set alerts at key support levels.\n\nWould you like me to run a deeper analysis or set up automated alerts?`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        metadata: { confidence: 0.85, symbols: [symbol] },
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const quickActions = [
    { label: 'Analyze', icon: <BarChart3 size={10} />, prompt: `Analyze ${symbol} technically` },
    { label: 'Risk', icon: <AlertTriangle size={10} />, prompt: 'Assess my portfolio risk' },
    { label: 'Strategy', icon: <TrendingUp size={10} />, prompt: 'Recommend trading strategies' },
    { label: 'Signals', icon: <Sparkles size={10} />, prompt: `What signals do you see on ${symbol}?` },
  ];

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="title">
          <Brain size={12} className="text-[#9c27b0]" />
          <span>AI ANALYST</span>
          <span className="text-[10px] text-[#00d4aa]">GPT-4o</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
          <span className="text-[10px] text-[#00d4aa]">ONLINE</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#1e2a3a]">
        {quickActions.map(action => (
          <button
            key={action.label}
            onClick={() => { setInput(action.prompt); }}
            className="flex items-center gap-1 text-[9px] px-2 py-1 rounded bg-[#1a2332] text-[#8899aa] hover:text-[#e8edf5] hover:bg-[#2a3a4e] transition-colors"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-3 py-2 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-[11px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#2196f322] text-[#e8edf5] border border-[#2196f333]'
                  : msg.role === 'system'
                  ? 'bg-[#9c27b015] text-[#8899aa] border border-[#9c27b022] italic'
                  : 'bg-[#111820] text-[#e8edf5] border border-[#1e2a3a]'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1 mb-1.5 text-[9px] text-[#9c27b0]">
                  <Brain size={9} />
                  <span>Greystone AI</span>
                  {msg.metadata?.confidence && (
                    <span className="text-[#556677] ml-auto">Confidence: {(msg.metadata.confidence * 100).toFixed(0)}%</span>
                  )}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-[11px] text-[#556677]">
            <Loader2 size={12} className="animate-spin text-[#9c27b0]" />
            <span>AI is analyzing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#1e2a3a] p-2">
        <div className="flex items-center gap-2 bg-[#0a0e17] rounded-lg px-3 py-2 border border-[#1e2a3a] focus-within:border-[#2196f3] transition-colors">
          <Sparkles size={12} className="text-[#556677]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the AI analyst..."
            className="flex-1 bg-transparent text-[11px] text-[#e8edf5] outline-none placeholder:text-[#556677]"
          />
          <button
            onClick={handleSend}
            className="text-[#2196f3] hover:text-[#42a5f5] transition-colors disabled:opacity-30"
            disabled={!input.trim()}
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
