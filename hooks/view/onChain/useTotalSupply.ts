"use client";

import { useReadContract, useChainId } from "wagmi";
import erc3643ABI from "@/abi/erc3643.json";
import { contractaddresses } from "@/lib/addresses";

export function useTotalSupply() {
  const chainId = useChainId();
  const tokenAddress =
    contractaddresses.SpoutLQDtoken[chainId as 84532 | 688688];

  const { data: totalSupply, isLoading } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc3643ABI.abi,
    functionName: "totalSupply",
  });

  return {
    totalSupply: totalSupply ? Number(totalSupply) / 1e6 : 0, // Convert from wei and assuming 6 decimals
    isLoading,
  };
}
