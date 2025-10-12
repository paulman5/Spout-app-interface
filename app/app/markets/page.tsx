"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientCacheHelpers } from "@/lib/cache/client-cache";

// Popular stocks with company names - prices will be fetched from API
const popularStocks = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 0, // Will be updated from API
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
  {
    ticker: "IBM",
    name: "IBM Corporation",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: "0",
    marketCap: "0",
  },
];

interface StockData {
  ticker: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  volume: string;
  marketCap: string;
  dataSource?: string;
}

function MarketsPage() {
  const [stocks, setStocks] = useState<StockData[]>(popularStocks);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatMarketCap = (value: number | undefined | null) => {
    if (!value) return "$0";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (volume: number | undefined | null) => {
    if (!volume) return "0";
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  const fetchStockData = async (ticker: string) => {
    try {
      const data = await clientCacheHelpers.fetchStockData(ticker);

      // Return a properly formatted StockData object with fallbacks
      return {
        ticker: data.ticker || ticker,
        name: popularStocks.find((s) => s.ticker === ticker)?.name || ticker,
        price: data.currentPrice ?? null,
        change: data.priceChange ?? null,
        changePercent: data.priceChangePercent ?? null,
        volume: formatVolume(data.volume),
        marketCap: formatMarketCap(data.marketCap),
        dataSource: data.dataSource || "mock",
      };
    } catch (error) {
      console.error(`Error fetching ${ticker}:`, error);
      // Return a StockData object with null/empty values on error
      return {
        ticker,
        name: popularStocks.find((s) => s.ticker === ticker)?.name || ticker,
        price: null,
        change: null,
        changePercent: null,
        volume: "0",
        marketCap: "$0",
        dataSource: "mock",
      };
    }
  };

  const fetchAllStocks = useCallback(async () => {
    setRefreshing(true);
    try {
      // Use batch API for better performance
      const tickers = popularStocks.map((stock) => stock.ticker);
      const batchData = await clientCacheHelpers.fetchBatchStockData(tickers);

      // Transform batch response to StockData format
      const results = popularStocks.map((stock) => {
        const data = batchData[stock.ticker];
        if (!data) {
          return {
            ticker: stock.ticker,
            name: stock.name,
            price: null,
            change: null,
            changePercent: null,
            volume: "0",
            marketCap: "$0",
            dataSource: "error",
          };
        }

        return {
          ticker: data.symbol,
          name: stock.name,
          price: data.currentPrice,
          change: data.priceChange,
          changePercent: data.priceChangePercent,
          volume: formatVolume(0), // Batch API doesn't include volume yet
          marketCap: formatMarketCap(0), // Batch API doesn't include market cap yet
          dataSource: data.dataSource,
        };
      });

      const validStocks = results.filter(
        (stock) => stock !== null,
      ) as StockData[];
      setStocks(validStocks);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAllStocks();
  }, [fetchAllStocks]);

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const marketStats = [
    { label: "Total Stocks", value: "500+", icon: BarChart3 },
    { label: "Market Cap", value: "$45.2T", icon: TrendingUp },
    { label: "Active Traders", value: "1,247", icon: Activity },
    { label: "Avg Volume", value: "$2.4B", icon: RefreshCw },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/20 hover:text-white hover:border-white/30"
            >
              <Zap className="w-4 h-4 mr-2" />
              Live Markets
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-3">Stock Markets</h1>
          <p className="text-emerald-100 text-lg mb-6 max-w-2xl">
            Track real-time stock prices and market data. Professional-grade
            analytics and insights for informed trading decisions.
          </p>
          {lastUpdated && (
            <p className="text-emerald-200 text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <IconComponent className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stocks..."
                className="pl-10 bg-slate-50 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                onClick={fetchAllStocks}
                variant="outline"
                size="sm"
                className={refreshing ? "opacity-50 cursor-not-allowed" : ""}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stocks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStocks.map((stock) => (
            <Link href={`/app/markets/${stock.ticker}`} key={stock.ticker}>
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer relative border-0 shadow-md group">
                {stock.dataSource === "mock" && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-orange-100 text-orange-700"
                    >
                      DEMO
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold group-hover:text-emerald-600 transition-colors">
                        {stock.ticker}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {stock.name}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        stock.change && stock.change >= 0
                          ? "default"
                          : "destructive"
                      }
                      className={`text-xs ${
                        stock.change && stock.change >= 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stock.change && stock.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stock.changePercent && stock.changePercent >= 0
                        ? "+"
                        : ""}
                      {stock.changePercent?.toFixed(2)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {stock.price !== null
                          ? `$${stock.price.toLocaleString()}`
                          : "N/A"}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          stock.change && stock.change >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stock.change && stock.change >= 0 ? "+" : ""}$
                        {stock.change?.toFixed(2) ?? "0.00"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="block text-xs text-slate-500">
                          Volume
                        </span>
                        <span className="font-medium text-sm">
                          {stock.volume}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="block text-xs text-slate-500">
                          Market Cap
                        </span>
                        <span className="font-medium text-sm">
                          {stock.marketCap}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Market Overview */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Market Overview</CardTitle>
          <CardDescription>
            Major market indices and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                S&P 500
              </h3>
              <div className="text-3xl font-bold text-blue-900">4,567.89</div>
              <div className="text-green-600 text-sm font-medium">
                +12.34 (+0.27%)
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                NASDAQ
              </h3>
              <div className="text-3xl font-bold text-purple-900">
                14,234.56
              </div>
              <div className="text-red-600 text-sm font-medium">
                -45.67 (-0.32%)
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl">
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                Dow Jones
              </h3>
              <div className="text-3xl font-bold text-emerald-900">
                34,789.12
              </div>
              <div className="text-green-600 text-sm font-medium">
                +89.23 (+0.26%)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarketsPage />
    </Suspense>
  );
}
