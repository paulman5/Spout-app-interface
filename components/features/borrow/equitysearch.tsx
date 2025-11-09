"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { StockData } from "@/lib/types/markets";
import { fetchAllStocks } from "@/lib/services/marketData";
import { clientCacheHelpers } from "@/lib/cache/client-cache";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface EquitySearchProps {
  onSelectEquity?: (equity: StockData) => void;
  selectedEquity?: StockData | null;
}

export function EquitySearch({ onSelectEquity, selectedEquity }: EquitySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [lqdPrevClose, setLqdPrevClose] = useState<number | null>(null);
  
  // Fetch chart data (same as trade page and vault deposit)
  useEffect(() => {
    async function fetchChartData() {
      try {
        const json = await clientCacheHelpers.fetchStockData("LQD");
        if (json.error) {
          console.log("📊 Chart data error:", json.error);
          setTokenData([]);
        } else {
          setTokenData(json.data || []);
        }
      } catch (e) {
        console.log("📊 Chart data fetch error:", e);
        setTokenData([]);
      }
    }
    fetchChartData();
  }, []);

  // Fetch LQD price using the exact same method as trade page and vault deposit
  useEffect(() => {
    let isMounted = true;
    let lastKnownPrice: number | null = null;

    async function fetchPriceData() {
      try {
        const json = await clientCacheHelpers.fetchMarketData("LQD");
        if (!isMounted) return;

        if (json.price && json.price > 0) {
          // Only update if price has actually changed
          if (lastKnownPrice !== json.price) {
            setCurrentPrice(json.price);
            lastKnownPrice = json.price;
          }
        } else {
          setCurrentPrice(null); // No valid price data
        }
        
        // Also update previous close if available
        if (json.previousClose && json.previousClose > 0) {
          setLqdPrevClose(json.previousClose);
        }
      } catch (e) {
        if (isMounted) {
          setCurrentPrice(null); // Error fetching price
        }
      }
    }

    // Initial fetch
    fetchPriceData();

    // Refetch every 5 minutes to reduce Vercel compute usage (same as trade page)
    const interval = setInterval(fetchPriceData, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Use chart data as primary source for price (same as trade page and vault deposit)
  const chartLatestPrice =
    tokenData.length > 0 ? tokenData[tokenData.length - 1].close : null;
  
  // Use currentPrice (from market data API) as fallback only if chart data is not available
  const lqdPrice = chartLatestPrice || currentPrice || null;

  // Fetch stocks on mount
  useEffect(() => {
    const loadStocks = async () => {
      try {
        setLoading(true);
        const results = await fetchAllStocks();
        // Ensure LQD is always included even if API fails
        // LQD price will be updated from useMarketData hook
        const lqdStock: StockData = {
          ticker: "LQD",
          name: "Spout LQD Token",
          price: null, // Will be updated from useMarketData
          change: null,
          changePercent: null,
          volume: "0",
          marketCap: "$0",
          dataSource: "mock",
        };
        const hasLQD = results.some((s) => s.ticker === "LQD");
        const stocksWithLQD = hasLQD ? results : [...results, lqdStock];
        setStocks(stocksWithLQD);
      } catch (error) {
        console.error("Error fetching stocks:", error);
        // Fallback: include LQD even if fetch fails
        // LQD price will be updated from useMarketData hook
        const lqdStock: StockData = {
          ticker: "LQD",
          name: "Spout LQD Token",
          price: null, // Will be updated from useMarketData
          change: null,
          changePercent: null,
          volume: "0",
          marketCap: "$0",
          dataSource: "mock",
        };
        setStocks([lqdStock]);
      } finally {
        setLoading(false);
      }
    };
    loadStocks();
  }, []);

  // Update LQD stock with accurate price from useMarketData
  useEffect(() => {
    if (lqdPrice !== null && stocks.length > 0) {
      setStocks((prevStocks) => {
        const updatedStocks = prevStocks.map((stock) => {
          if (stock.ticker === "LQD") {
            const change = lqdPrevClose ? lqdPrice - lqdPrevClose : null;
            const changePercent = lqdPrevClose && lqdPrevClose > 0 
              ? ((lqdPrice - lqdPrevClose) / lqdPrevClose) * 100 
              : null;
            return {
              ...stock,
              price: lqdPrice,
              change: change,
              changePercent: changePercent,
            };
          }
          return stock;
        });
        return updatedStocks;
      });

      // Also update selectedEquity if it's LQD and price is not already set
      if (selectedEquity?.ticker === "LQD" && onSelectEquity && selectedEquity.price !== lqdPrice) {
        const change = lqdPrevClose ? lqdPrice - lqdPrevClose : null;
        const changePercent = lqdPrevClose && lqdPrevClose > 0 
          ? ((lqdPrice - lqdPrevClose) / lqdPrevClose) * 100 
          : null;
        onSelectEquity({
          ...selectedEquity,
          price: lqdPrice,
          change: change,
          changePercent: changePercent,
        });
      }
    }
  }, [lqdPrice, lqdPrevClose, stocks.length, selectedEquity, onSelectEquity]);

  // Filter stocks based on search term
  const filteredStocks = useMemo(() => {
    if (!searchTerm.trim()) {
      // Prioritize LQD in the top 5 if available
      const lqdStock = stocks.find((s) => s.ticker === "LQD");
      const otherStocks = stocks.filter((s) => s.ticker !== "LQD").slice(0, 4);
      return lqdStock ? [lqdStock, ...otherStocks] : stocks.slice(0, 5);
    }
    return stocks.filter(
      (stock) =>
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  const handleSelect = (stock: StockData) => {
    setSearchTerm("");
    setIsFocused(false);
    onSelectEquity?.(stock);
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsFocused(false);
    onSelectEquity?.(null as any);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search equities (e.g., AAPL, TSLA, MSFT, LQD)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="w-96 pl-10 pr-10 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-[#004040]/20"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && (searchTerm || filteredStocks.length > 0) && (
        <Card className="absolute z-50 w-96 mt-2 border border-slate-200 shadow-lg max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Loading equities...
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No equities found matching &quot;{searchTerm}&quot;
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredStocks.map((stock) => (
                  <button
                    key={stock.ticker}
                    onClick={() => handleSelect(stock)}
                    className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {stock.ticker}
                          </span>
                          {selectedEquity?.ticker === stock.ticker && (
                            <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{stock.name}</p>
                      </div>
                      <div className="text-right ml-4">
                        {stock.price !== null ? (
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-slate-900">
                              ${stock.price.toLocaleString()}
                            </span>
                            {stock.changePercent !== null && (
                              <span
                                className={`text-xs flex items-center gap-1 ${
                                  stock.changePercent >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {stock.changePercent >= 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {stock.changePercent >= 0 ? "+" : ""}
                                {stock.changePercent.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">N/A</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Equity Display */}
      {selectedEquity && !isFocused && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900">
                {selectedEquity.ticker}
              </span>
              <span className="text-sm text-slate-600 ml-2">
                {selectedEquity.name}
              </span>
            </div>
            {selectedEquity.price !== null && (
              <div className="text-right">
                <span className="font-semibold text-slate-900">
                  ${selectedEquity.price.toLocaleString()}
                </span>
                {selectedEquity.changePercent !== null && (
                  <span
                    className={`text-xs block ${
                      selectedEquity.changePercent >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedEquity.changePercent >= 0 ? "+" : ""}
                    {selectedEquity.changePercent.toFixed(2)}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

