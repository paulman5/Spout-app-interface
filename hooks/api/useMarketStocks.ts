"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { StockData } from "@/lib/types/markets";
import { fetchAllStocks } from "@/lib/services/marketData";

export function useMarketStocks() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStocks = useCallback(async () => {
    setRefreshing(true);
    try {
      const results = await fetchAllStocks();
      setStocks(results);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();

    // Auto-refresh every 15 minutes to reduce Vercel compute usage
    const interval = setInterval(fetchStocks, 15 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []); // Remove fetchStocks dependency to prevent infinite loops

  const filteredStocks = useMemo(() => {
    return stocks.filter(
      (stock) =>
        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [stocks, searchTerm]);

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    stocks: filteredStocks,
    loading,
    refreshing,
    lastUpdated,
    searchTerm,
    setSearchTerm: handleSearchTermChange,
    refresh: fetchStocks,
  };
}
