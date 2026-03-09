'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { StockQuote, MarketIndex, Position, WatchlistItem, TradingAgent, RiskMetrics, CandleData } from '@/types/market';
import {
  getQuote, getAllQuotes, getMarketIndices, getPositions, getWatchlist,
  getTradingAgents, getRiskMetrics, generateCandles, generateOptionsChain, getOrderBook, getSentiment
} from '@/lib/market-data';

export function useMarketData(refreshInterval: number = 1500) {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [agents, setAgents] = useState<TradingAgent[]>([]);
  const [risk, setRisk] = useState<RiskMetrics | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('NVDA');
  const [isConnected, setIsConnected] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(() => {
    setQuotes(getAllQuotes());
    setIndices(getMarketIndices());
    setPositions(getPositions());
    setWatchlist(getWatchlist());
    setAgents(getTradingAgents());
    setRisk(getRiskMetrics());
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, refreshInterval);

    // Simulate occasional disconnects
    const connInterval = setInterval(() => {
      if (Math.random() < 0.02) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 1500);
      }
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(connInterval);
    };
  }, [refresh, refreshInterval]);

  const getSymbolQuote = useCallback((symbol: string) => {
    return getQuote(symbol);
  }, []);

  const getCandles = useCallback((symbol: string, count?: number) => {
    return generateCandles(symbol, count);
  }, []);

  const getOptions = useCallback((symbol: string) => {
    return generateOptionsChain(symbol);
  }, []);

  const getBook = useCallback((symbol: string) => {
    return getOrderBook(symbol);
  }, []);

  const getSymbolSentiment = useCallback((symbol: string) => {
    return getSentiment(symbol);
  }, []);

  return {
    quotes, indices, positions, watchlist, agents, risk,
    selectedSymbol, setSelectedSymbol,
    isConnected,
    getSymbolQuote, getCandles, getOptions, getBook, getSymbolSentiment,
    refresh,
  };
}
