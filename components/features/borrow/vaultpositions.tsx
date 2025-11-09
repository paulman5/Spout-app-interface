"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVault } from "@/hooks/writes/onChain/useVault";
import { useAccount, useReadContract } from "wagmi";
import { useContractAddress } from "@/lib/addresses";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { StockData } from "@/lib/types/markets";
import { clientCacheHelpers } from "@/lib/cache/client-cache";
import vatABI from "@/abi/vat.json";

interface VaultPositionsProps {
  selectedEquity?: StockData | null;
}

export function VaultPositions({ selectedEquity }: VaultPositionsProps) {
  const vaultHookResult = useVault();
  const userVaultIds: bigint[] | undefined = vaultHookResult.userVaultIds;
  const vault: any = vaultHookResult.vault;
  const isVaultIdsLoading: boolean = vaultHookResult.isVaultIdsLoading;
  const isVaultLoading: boolean = vaultHookResult.isVaultLoading;
  const selectedVaultId: bigint | null = vaultHookResult.selectedVaultId;
  const setSelectedVaultId = vaultHookResult.setSelectedVaultId;
  const ilkParams: any = vaultHookResult.ilkParams;
  const { address } = useAccount();
  const [tokenData, setTokenData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  
  // Fetch all vaults owned by the user - must be called before early returns
  const vatAddress = useContractAddress("vat") as `0x${string}` | undefined;

  // Fetch LQD price (same as vault deposit)
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

  useEffect(() => {
    let isMounted = true;
    async function fetchPriceData() {
      try {
        const json = await clientCacheHelpers.fetchMarketData("LQD");
        if (!isMounted) return;
        if (json.price && json.price > 0) {
          setCurrentPrice(json.price);
        } else {
          setCurrentPrice(null);
        }
      } catch (e) {
        if (isMounted) {
          setCurrentPrice(null);
        }
      }
    }
    fetchPriceData();
    const interval = setInterval(fetchPriceData, 5 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Use chart data as primary source for price
  const chartLatestPrice = tokenData.length > 0 ? tokenData[tokenData.length - 1].close : null;
  const lqdPrice = chartLatestPrice || currentPrice || null;

  if (!address) {
    return (
      <Card className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">Please connect your wallet to view your vault positions</p>
        </CardContent>
      </Card>
    );
  }

  if (isVaultIdsLoading || isVaultLoading) {
    return (
      <Card className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#004040] mx-auto" />
          <p className="text-slate-600 mt-4">Loading vault positions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!userVaultIds || userVaultIds.length === 0) {
    return (
      <Card className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#004040]">Your Vault Positions</CardTitle>
          <CardDescription>
            View your current vault deposits and positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center border border-slate-200 rounded-lg bg-slate-50">
            <p className="text-slate-600">No active vaults</p>
            <p className="text-sm text-slate-500 mt-2">
              Create a vault and deposit collateral to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const liquidationThreshold = 1.1; // From deployment: liqRatio = 1.1 (110%)
  
  // Helper function to calculate health rate for a vault
  const calculateHealthRate = (vaultData: any) => {
    if (!vaultData || !ilkParams) return null;
    
    const ink = Number(vaultData.ink) / 1e18;
    const art = Number(vaultData.art) / 1e18;
    const hasDebt = art > 0;
    
    if (!hasDebt && ink > 0) {
      return Infinity;
    }
    
    if (!hasDebt) {
      return null;
    }
    
    const spot = ilkParams.spot ? Number(ilkParams.spot) / 1e27 : null;
    const rate = ilkParams.rate ? Number(ilkParams.rate) / 1e27 : null;
    const effectiveSpot = spot || lqdPrice;
    
    if (effectiveSpot && rate && rate > 0 && art > 0) {
      const collateralizationRatio = (ink * effectiveSpot) / (art * rate);
      return collateralizationRatio / liquidationThreshold;
    }
    
    return null;
  };
  
  // Component to display a single vault
  const VaultCard = ({ vaultId }: { vaultId: bigint }) => {
    const { data: vaultData, isLoading: isVaultLoading } = useReadContract({
      address: vatAddress,
      abi: vatABI.abi as any,
      functionName: "getVault",
      args: [vaultId],
      query: { enabled: Boolean(vatAddress && vaultId !== null) },
    });
    
    if (isVaultLoading) {
      return (
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <Loader2 className="h-4 w-4 animate-spin text-[#004040] mx-auto" />
        </div>
      );
    }
    
    if (!vaultData) return null;
    
    const vault = vaultData as any;
    const vaultCollateralFormatted = vault ? (Number(vault.ink) / 1e18).toFixed(6) : "0.00";
    const vaultDebtFormatted = vault ? (Number(vault.art) / 1e18).toFixed(6) : "0.00";
    const hasDebt = vault && Number(vault.art) > 0;
    const healthRate = calculateHealthRate(vault);
    
    return (
      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              Vault #{vaultId.toString()}
              {vault && <Badge variant="outline" className="text-xs">{vault.ilk}</Badge>}
            </h3>
            <p className="text-sm text-slate-600 mt-1">Collateral & Debt Position</p>
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Active
          </Badge>
        </div>
        
        <div className="space-y-3 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Collateral (SLQD)</span>
            <span className="text-lg font-semibold text-[#004040]">{vaultCollateralFormatted}</span>
          </div>
          
          {hasDebt && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-sm text-slate-600">Debt</span>
              <span className="text-lg font-semibold text-red-600 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                {vaultDebtFormatted}
              </span>
            </div>
          )}

          {healthRate !== null && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-sm text-slate-600">Health Rate</span>
              <span className={`text-lg font-semibold flex items-center gap-1 ${
                healthRate === Infinity || healthRate >= 1.5
                  ? "text-green-600"
                  : healthRate >= 1.1
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}>
                {healthRate === Infinity 
                  ? "∞" 
                  : healthRate >= 1000
                  ? "Very High"
                  : healthRate.toFixed(2)}
              </span>
            </div>
          )}

          {!hasDebt && Number(vaultCollateralFormatted) > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Your collateral is deposited. You can borrow against it or withdraw when needed.
              </p>
            </div>
          )}

          {Number(vaultCollateralFormatted) === 0 && !hasDebt && (
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Vault created. Deposit collateral to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#004040]">Your Vault Positions</CardTitle>
        <CardDescription>
          View your current vault deposits and positions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display all vaults owned by the user */}
        {userVaultIds && userVaultIds.length > 0 ? (
          <div className="space-y-4">
            {userVaultIds.map((vaultId) => (
              <VaultCard key={vaultId.toString()} vaultId={vaultId} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-slate-200 rounded-lg bg-slate-50">
            <p className="text-slate-600">No vaults found for this wallet address</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
