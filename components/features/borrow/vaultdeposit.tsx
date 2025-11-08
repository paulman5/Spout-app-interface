"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useVault } from "@/hooks/writes/onChain/useVault";
import { useCollateralTokenBalance } from "@/hooks/view/onChain/useCollateralTokenBalance";
import { clientCacheHelpers } from "@/lib/cache/client-cache";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useConfig } from "wagmi";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function VaultDeposit() {
  const [depositAmount, setDepositAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    createVault,
    depositCollateral,
    withdrawCollateral,
    selectedVaultId,
    vault,
    hasVault,
    isCreateVaultPending,
    isGemJoinPending,
    isApprovePending,
    refetchVault,
    ilkParams,
    isIlkLoading,
  } = useVault();
  const { amountUi: collateralBalance, refetch: refetchCollateralBalance } = useCollateralTokenBalance();
  const [tokenData, setTokenData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const config = useConfig();
  
  // Fetch chart data (same as trade page)
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

  // Fetch LQD price using the exact same method as the trade page
  useEffect(() => {
    let isMounted = true;
    let lastKnownPrice: number | null = null;

    async function fetchPriceData() {
      try {
        setPriceLoading(true);
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
      } catch (e) {
        if (isMounted) {
          setCurrentPrice(null); // Error fetching price
        }
      } finally {
        if (isMounted) {
          setPriceLoading(false);
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

  // Use chart data as primary source for price (same as trade page)
  const chartLatestPrice =
    tokenData.length > 0 ? tokenData[tokenData.length - 1].close : null;
  
  // Use currentPrice (from market data API) as fallback only if chart data is not available
  const lqdPrice = chartLatestPrice || currentPrice || null;
  
  // Collateralisation ratio from deployment (1.5 = 150%)
  // Use the rate from ilkParams if available, otherwise use deployment default
  const collateralRatio = ilkParams && ilkParams.rate > 0 
    ? Number(ilkParams.rate) / 1e27 
    : 1.5;

  const handleCreateVault = async () => {
    setIsProcessing(true);
    try {
      toast.loading("Creating vault...", { id: "create-vault" });
      const txHash = await createVault();
      toast.loading("Waiting for confirmation...", { id: "create-vault" });
      await waitForTransactionReceipt(config, { hash: txHash });
      toast.success("Vault created successfully!", { id: "create-vault" });
      // Refetch will happen automatically
    } catch (error: any) {
      console.error("Create vault error:", error);
      toast.error(error?.message || "Failed to create vault", { id: "create-vault" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedVaultId) {
      toast.error("Please create a vault first");
      return;
    }

    // Collateral token has 18 decimals (SLQD)
    const amount = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
    const collBal = collateralBalance ? Number(collateralBalance) : 0;

    if (collBal < parseFloat(depositAmount)) {
      toast.error("Insufficient collateral balance");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Approving collateral...", { id: "deposit" });
      const txHash = await depositCollateral(selectedVaultId, amount);
      toast.loading("Depositing to vault...", { id: "deposit" });
      await waitForTransactionReceipt(config, { hash: txHash });
      
      toast.success(`Successfully deposited ${depositAmount} SLQD to vault`, { id: "deposit" });
      setDepositAmount("");
      refetchVault();
      refetchCollateralBalance();
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error(error?.message || "Failed to deposit to vault", { id: "deposit" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedVaultId || !vault) {
      toast.error("No vault found");
      return;
    }

    const amount = BigInt(Math.floor(parseFloat(depositAmount) * 1e18));
    const vaultCollateral = Number(vault.ink) / 1e18;

    if (vaultCollateral < parseFloat(depositAmount)) {
      toast.error("Insufficient vault collateral");
      return;
    }

    setIsProcessing(true);
    try {
      toast.loading("Withdrawing from vault...", { id: "withdraw" });
      const txHash = await withdrawCollateral(selectedVaultId, amount);
      await waitForTransactionReceipt(config, { hash: txHash });
      
      toast.success(`Successfully withdrew ${depositAmount} SLQD from vault`, { id: "withdraw" });
      setDepositAmount("");
      refetchVault();
      refetchCollateralBalance();
    } catch (error: any) {
      console.error("Withdraw error:", error);
      toast.error(error?.message || "Failed to withdraw from vault", { id: "withdraw" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMax = () => {
    if (hasVault && vault) {
      const vaultCollateral = Number(vault.ink) / 1e18;
      setDepositAmount(vaultCollateral.toFixed(6));
    } else {
      const collBal = collateralBalance ? Number(collateralBalance) : 0;
      setDepositAmount(collBal.toFixed(6));
    }
  };

  const vaultCollateralFormatted = vault ? (Number(vault.ink) / 1e18).toFixed(6) : "0.00";
  const vaultDebtFormatted = vault ? (Number(vault.art) / 1e18).toFixed(6) : "0.00";
  const collateralBalanceFormatted = collateralBalance ? Number(collateralBalance).toFixed(6) : "0.00";
  
  // Calculate max borrow amount: (amount * spot) / collateral rate
  // Use depositAmount from input if provided, otherwise use current vault collateral
  const collateralAmountForCalculation = depositAmount && parseFloat(depositAmount) > 0
    ? parseFloat(depositAmount)
    : (vault ? Number(vault.ink) / 1e18 : 0);
  
  // Calculate LQD value of the entered amount: amount * spot
  const lqdValueOfAmount = lqdPrice && collateralAmountForCalculation > 0
    ? collateralAmountForCalculation * lqdPrice
    : 0;
  
  // Calculate max borrow amount: LQD Value / collateral ratio
  // This ensures alignment: if LQD Value = $10,730 and ratio = 1.5, then max borrow = $7,153.33
  const maxBorrowAmount = lqdValueOfAmount > 0 && collateralRatio > 0
    ? lqdValueOfAmount / collateralRatio
    : 0;

  if (!hasVault) {
    return (
      <Card className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#004040]">Create Vault</CardTitle>
          <CardDescription>
            Create a new vault to deposit collateral and borrow stablecoins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCreateVault}
            isDisabled={isProcessing || isCreateVaultPending}
            className="w-full bg-[#004040] hover:bg-[#004040]/90 text-white"
          >
            {(isProcessing || isCreateVaultPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Vault...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Vault
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#004040]/15 bg-white rounded-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#004040]">Vault Operations</CardTitle>
        <CardDescription>
          Deposit or withdraw collateral from your vault
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vault Info Display */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Available Collateral (SLQD)</span>
            <span className="text-lg font-semibold text-[#004040]">{collateralBalanceFormatted}</span>
          </div>
          {vault && Number(vaultCollateralFormatted) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Vault Collateral (SLQD)</span>
              <span className="text-lg font-semibold text-[#004040]">{vaultCollateralFormatted}</span>
            </div>
          )}
          {Number(vaultDebtFormatted) > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Debt</span>
              <span className="text-lg font-semibold text-red-600">{vaultDebtFormatted}</span>
            </div>
          )}
        </div>

        {/* LQD Parameters */}
        {ilkParams && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">LQD Parameters</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">LQD Price:</span>
                <span className="font-mono text-slate-900">
                  {lqdPrice ? `$${lqdPrice.toFixed(4)}` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Collateralisation Ratio:</span>
                <span className="font-mono text-slate-900">
                  {collateralRatio > 0 ? collateralRatio.toFixed(2) : "N/A"}
                </span>
              </div>
              {collateralAmountForCalculation > 0 && (
                <div className="flex justify-between col-span-2">
                  <span className="text-slate-600">LQD Value:</span>
                  <span className="font-mono text-slate-900 ml-auto">
                    {lqdValueOfAmount > 0 ? `$${lqdValueOfAmount.toFixed(2)}` : "$0.00"}
                  </span>
                </div>
              )}
              <div className="flex justify-between col-span-2">
                <span className="text-slate-600">Total Max Borrow Amount:</span>
                <span className="font-mono text-slate-900 font-semibold ml-auto">
                  {maxBorrowAmount > 0 ? `$${maxBorrowAmount.toFixed(2)}` : "$0.00"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deposit/Withdraw Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SLQD)</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="0"
                step="0.000001"
                className="w-48 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-[#004040]/20"
              />
              <Button
                variant="outline"
                onClick={handleMax}
                className="shrink-0"
              >
                Max
              </Button>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Available: {collateralBalanceFormatted} SLQD</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDeposit}
              isDisabled={isProcessing || isGemJoinPending || isApprovePending || !depositAmount || parseFloat(depositAmount) <= 0}
              className="flex-1 bg-[#004040] hover:bg-[#004040]/90 text-white"
            >
              {(isProcessing || isGemJoinPending || isApprovePending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isApprovePending ? "Approving..." : "Depositing..."}
                </>
              ) : (
                "Deposit"
              )}
            </Button>
            <Button
              onClick={handleWithdraw}
              isDisabled={isProcessing || isGemJoinPending || !depositAmount || parseFloat(depositAmount) <= 0 || !vault || vault.ink === BigInt(0)}
              variant="outline"
              className="flex-1"
            >
              {isProcessing || isGemJoinPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                "Withdraw"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

