"use client";

import PortfolioHeader from "@/components/features/portfolio/portfolioheader";
import PortfolioSummaryCards from "@/components/features/portfolio/portfoliosummarycards";
import PortfolioHoldings from "@/components/features/portfolio/portfolioholdings";
import PortfolioPerformance from "@/components/features/portfolio/portfolioperformance";
import PortfolioActivity from "@/components/features/portfolio/portfolioactivity";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMarketData } from "@/hooks/api/useMarketData";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { useRecentActivity } from "@/hooks/view/onChain/useRecentActivity";
import { useReturns } from "@/hooks/api/useReturns";
import { LoadingSpinner } from "@/components/loadingSpinner";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useUSDCTokenBalance } from "@/hooks/view/onChain/useUSDCTokenBalance";
import { useTokenBalance } from "@/hooks/view/onChain/useTokenBalance";
import { useContractAddress } from "@/lib/addresses";

function PortfolioPage() {
  const { address } = useAccount();
  const userAddress = address ?? null;

  // EVM token addresses
  const lqdToken = useContractAddress("SpoutLQDtoken") as `0x${string}`;

  // Balances (EVM)
  const usdcBalHook = useUSDCTokenBalance();
  const slqdBalHook = useTokenBalance(lqdToken, (address ?? null) as any);
  const lqdBal = useMemo(() => Number(slqdBalHook.amountUi ?? 0) || 0, [slqdBalHook.amountUi]);
  const usdcBal = useMemo(() => Number(usdcBalHook.amountUi ?? 0) || 0, [usdcBalHook.amountUi]);
  const balanceLoading = Boolean(slqdBalHook.isLoading || usdcBalHook.isLoading);

  // Fetch per-asset market data
  const {
    price: lqdPrice,
    previousClose: lqdPrevClose,
    isLoading: lqdLoading,
  } = useMarketData("LQD");
  const {
    price: tslaPrice,
    previousClose: tslaPrevClose,
    isLoading: tslaLoading,
  } = useMarketData("TSLA");
  const {
    price: aaplPrice,
    previousClose: aaplPrevClose,
    isLoading: aaplLoading,
  } = useMarketData("AAPL");
  const {
    price: goldPrice,
    previousClose: goldPrevClose,
    isLoading: goldLoading,
  } = useMarketData("GOLD");

  // GOLD price fallback via Metalprice API (USD per XAU)
  const [goldUsd, setGoldUsd] = useState<number | null>(null);
  const [goldUsdLoading, setGoldUsdLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function fetchGold() {
      setGoldUsdLoading(true);
      try {
        const url =
          "https://api.metalpriceapi.com/v1/latest?api_key=54ee16f25dba8e9c04459a5da94d415e&base=USD&currencies=EUR,XAU,XAG";
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`gold api ${res.status}`);
        const data = await res.json();
        const xauPerUsd = Number(data?.rates?.XAU || 0);
        const usdPerXau = xauPerUsd > 0 ? 1 / xauPerUsd : null;
        if (!cancelled) setGoldUsd(usdPerXau);
      } catch (e) {
        if (!cancelled) setGoldUsd(null);
      } finally {
        if (!cancelled) setGoldUsdLoading(false);
      }
    }
    fetchGold();
    return () => {
      cancelled = true;
    };
  }, []);

  const { returns, isLoading: returnsLoading } = useReturns("LQD");
  const { username } = useCurrentUser();
  
  // Fetch recent activity (buy/sell orders)
  const {
    activities,
    isLoading: activitiesLoading,
    hasMore,
    loadMore,
  } = useRecentActivity();
  // Map ActivityEvent[] -> PortfolioActivity's expected ActivityType[]
  type PortfolioActivityItem = {
    id: string;
    action: "Purchased" | "Sold";
    transactionType: "BUY" | "SELL";
    ticker: string;
    amount: string;
    value: string;
    time: string;
  };
  const activitiesForUI: PortfolioActivityItem[] = useMemo(
    () =>
      (activities ?? []).map((a) => ({
        id: a.id,
        action: a.action === "Burned" ? "Sold" : "Purchased",
        transactionType: a.action === "Burned" ? "SELL" : "BUY",
        ticker: (a as any).symbol ?? "SLQD",
        amount: a.amount,
        value: a.value,
        time: a.time,
      })),
    [activities],
  );
  // Format number to 3 decimals, matching holdings value
  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };
  const formatPercent = (num: number) => num.toFixed(2);

  // Other demo balances remain zero
  const tslaBal = 0;
  const aaplBal = 0;
  const goldBal = 0;

  // Build holdings; sLQD value = decimal amount * LQD price
  type Holding = {
    symbol: string;
    name: string;
    shares: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
    dayChange: number;
    totalReturn: number;
    allocation: number;
  };

  const baseHoldings: Omit<Holding, "dayChange" | "totalReturn" | "allocation">[] = [
    {
      symbol: "LQD",
      name: "Spout US Corporate Bond Token",
      shares: lqdBal,
      avgPrice: lqdPrevClose || 0,
      currentPrice: lqdPrice ?? 0,
      value: lqdBal * (lqdPrice ?? 0),
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      shares: usdcBal,
      avgPrice: 1,
      currentPrice: 1,
      value: usdcBal * 1,
    },
    {
      symbol: "TSLA",
      name: "Tesla Synthetic",
      shares: Number(tslaBal || 0),
      avgPrice: tslaPrevClose || 0,
      currentPrice: tslaPrice ?? 0,
      value: Number(tslaBal || 0) * (tslaPrice ?? 0),
    },
    {
      symbol: "AAPL",
      name: "Apple Synthetic",
      shares: Number(aaplBal || 0),
      avgPrice: aaplPrevClose || 0,
      currentPrice: aaplPrice ?? 0,
      value: Number(aaplBal || 0) * (aaplPrice ?? 0),
    },
    {
      symbol: "GOLD",
      name: "Gold Synthetic",
      shares: Number(goldBal || 0),
      avgPrice: goldPrevClose || 0,
      currentPrice: (goldUsd ?? goldPrice) ?? 0,
      value: Number(goldBal || 0) * ((goldUsd ?? goldPrice) ?? 0),
    },
  ];

  const portfolioValue = baseHoldings.reduce((sum, h) => sum + (h.value || 0), 0);
  const previousDayValue = baseHoldings.reduce(
    (sum, h) => sum + (h.shares || 0) * (h.avgPrice || 0),
    0,
  );
  const dayChange = portfolioValue - previousDayValue;
  const dayChangePercent =
    previousDayValue > 0
      ? ((portfolioValue - previousDayValue) / previousDayValue) * 100
      : 0;
  const totalReturn = dayChange;
  const totalReturnPercent = dayChangePercent;

  const holdings: Holding[] = baseHoldings.map((h) => ({
    ...h,
    dayChange: dayChangePercent,
    totalReturn: totalReturnPercent,
    allocation: portfolioValue > 0 ? Math.round((h.value / portfolioValue) * 100) : 0,
  }));

  const isLoading =
    balanceLoading || returnsLoading || lqdLoading || tslaLoading || aaplLoading || goldLoading || goldUsdLoading;

  // Function to refresh portfolio data
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <PortfolioHeader
        username={username || ""}
        portfolioValue={portfolioValue}
        dayChange={dayChange}
        dayChangePercent={dayChangePercent}
        onRefresh={handleRefresh}
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading your portfolio...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
            <PortfolioSummaryCards
            portfolioValue={portfolioValue}
            dayChange={dayChange}
            dayChangePercent={dayChangePercent}
            totalReturn={totalReturn}
            totalReturnPercent={totalReturnPercent}
            holdings={holdings}
            />
          </div>
          <Tabs defaultValue="holdings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-[#e6f2f2]">
              <TabsTrigger
                value="holdings"
                className="data-[state=active]:bg-white data-[state=active]:text-[#004040]"
              >
                Holdings
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-white data-[state=active]:text-[#004040]"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-white data-[state=active]:text-[#004040]"
              >
                Activity
              </TabsTrigger>
            </TabsList>
            <TabsContent value="holdings" className="space-y-6">
              <div className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
                <PortfolioHoldings
                holdings={holdings}
                formatNumber={formatNumber}
                />
              </div>
            </TabsContent>
            <TabsContent value="performance" className="space-y-6">
              <div className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
                <PortfolioPerformance
                holdings={holdings}
                returns={returns}
                formatPercent={formatPercent}
                />
              </div>
            </TabsContent>
            <TabsContent value="activity" className="space-y-6">
              <div className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
                <PortfolioActivity
                  activities={activitiesForUI}
                  activitiesLoading={activitiesLoading}
                  hasMore={hasMore}
                  loadMore={loadMore}
                />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default PortfolioPage;
