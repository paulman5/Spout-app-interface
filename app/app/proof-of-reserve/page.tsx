"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReserveContract } from "@/hooks/view/onChain/useReserveContract";
import { useTotalSupply } from "@/hooks/view/onChain/useTotalSupply";
import { useMarketData } from "@/hooks/api/useMarketData";
import { useYieldData } from "@/hooks/api/useYieldData";
import {
  ReserveHeader,
  ReserveSummary,
  ReserveOverview,
  ReserveVerification,
  CorporateBonds,
} from "@/components/features/reserve";
import { useContractAddress } from "@/lib/addresses";

function ProofOfReservePage() {
  const lqdToken = useContractAddress("SpoutLQDtoken") as `0x${string}`;
  const { totalSupply, isLoading: totalSupplyLoading } = useTotalSupply();
  const { price: currentPrice, isLoading: priceLoading } = useMarketData("LQD");
  const { data: lqdYield, isLoading: lqdYieldLoading } = useYieldData("LQD");

  const reserveContractAddress = useContractAddress("proofOfReserve") as `0x${string}`;
  const { requestReserves, isRequestPending, totalReserves } =
    useReserveContract(reserveContractAddress);

  const typedTotalReserves = totalReserves as bigint | null;
  const yieldRate = lqdYield?.yield || 0;
  const totalSupplyTokens = totalSupply || 0;

  const handleRequestReserves = () => {
    requestReserves(379);
  };

  return (
    <div className="space-y-6">
      <ReserveHeader
        onRequestReserves={handleRequestReserves}
        isRequestPending={isRequestPending}
      />

      <ReserveSummary
        totalSupply={totalSupplyTokens}
        currentPrice={currentPrice}
        totalReserves={typedTotalReserves}
        totalSupplyLoading={totalSupplyLoading}
        priceLoading={priceLoading}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="corporate-bonds">Corporate Bonds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReserveOverview />
        </TabsContent>

        <TabsContent value="corporate-bonds" className="space-y-6">
          <CorporateBonds
            totalSupply={totalSupplyTokens}
            currentPrice={currentPrice}
            yieldRate={yieldRate}
            priceLoading={priceLoading}
            lqdYieldLoading={lqdYieldLoading}
          />
        </TabsContent>
      </Tabs>

      <ReserveVerification />
    </div>
  );
}

export default ProofOfReservePage;
