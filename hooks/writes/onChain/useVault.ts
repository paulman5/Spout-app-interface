"use client";

import { useWriteContract, useReadContract, useAccount, useConfig, usePublicClient } from "wagmi";
import { decodeEventLog } from "viem";
import vatABI from "@/abi/vat.json";
import gemJoinABI from "@/abi/gemjoin.json";
import stablecoinJoinABI from "@/abi/stablecoinjoin.json";
import erc20ABI from "@/abi/erc20.json";
import spotterABI from "@/abi/spotter.json";
import { useContractAddress } from "@/lib/addresses";
import { useERC20Approve } from "./useERC20Approve";
import { useState, useEffect } from "react";

// Ilk for LQD - manually create bytes32 hex string
// "LQD" in ASCII: L=0x4c, Q=0x51, D=0x44, padded with zeros to 32 bytes
const LQD_ILK = "0x4c51440000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

export function useVault() {
  const { address: userAddress } = useAccount();
  const config = useConfig();
  const publicClient = usePublicClient();
  const vatAddress = useContractAddress("vat") as `0x${string}` | undefined;
  const spotterAddress = useContractAddress("spotter") as `0x${string}` | undefined;
  const gemJoinAddress = useContractAddress("gemJoin") as `0x${string}` | undefined;
  const stablecoinJoinAddress = useContractAddress("stablecoinJoin") as `0x${string}` | undefined;
  // Use SLQD token (SpoutLQDtoken) as collateral instead of TCOL
  const collateralAddress = useContractAddress("SpoutLQDtoken") as `0x${string}` | undefined;

  const { writeContractAsync: createVaultAsync, isPending: isCreateVaultPending, error: createVaultError } = useWriteContract();
  const { writeContractAsync: frobAsync, isPending: isFrobPending, error: frobError } = useWriteContract();
  const { writeContractAsync: hopeAsync, isPending: isHopePending } = useWriteContract();
  const { writeContractAsync: gemJoinAsync, isPending: isGemJoinPending, error: gemJoinError } = useWriteContract();
  const { writeContractAsync: stablecoinJoinAsync, isPending: isStablecoinJoinPending, error: stablecoinJoinError } = useWriteContract();

  // Get user's vault IDs
  const { data: userVaultIds, isLoading: isVaultIdsLoading, refetch: refetchVaultIds } = useReadContract({
    address: vatAddress,
    abi: vatABI.abi as any,
    functionName: "getUserVaults",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(vatAddress && userAddress) },
  });

  // Get vault details (for the first vault if exists)
  const [selectedVaultId, setSelectedVaultId] = useState<bigint | null>(null);
  const firstVaultId = userVaultIds && Array.isArray(userVaultIds) && userVaultIds.length > 0 
    ? (userVaultIds[0] as bigint) 
    : null;

  useEffect(() => {
    if (firstVaultId && !selectedVaultId) {
      setSelectedVaultId(firstVaultId);
    }
  }, [firstVaultId, selectedVaultId]);

  const { data: vaultData, isLoading: isVaultLoading, refetch: refetchVault } = useReadContract({
    address: vatAddress,
    abi: vatABI.abi as any,
    functionName: "getVault",
    args: selectedVaultId !== null ? [selectedVaultId] : undefined,
    query: { enabled: Boolean(vatAddress && selectedVaultId !== null) },
  });

  // Approve hook for collateral token
  const { approve: approveCollateral, isPending: isApprovePending } = useERC20Approve(
    collateralAddress || ("0x" as `0x${string}`)
  );

  // Get collateral balance
  const { data: collateralBalance, refetch: refetchCollateralBalance } = useReadContract({
    address: collateralAddress,
    abi: erc20ABI as any,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(collateralAddress && userAddress) },
  });

  // Get ilk parameters for LQD - fetched on-chain from Vat contract
  const { data: ilkData, isLoading: isIlkLoading, error: ilkError, refetch: refetchIlk } = useReadContract({
    address: vatAddress,
    abi: vatABI.abi as any,
    functionName: "getIlk",
    args: [LQD_ILK],
    query: { enabled: Boolean(vatAddress) },
  });

  // Get par from Spotter (needed to calculate liquidation ratio)
  const { data: par } = useReadContract({
    address: spotterAddress,
    abi: spotterABI.abi as any,
    functionName: "par",
    query: { enabled: Boolean(spotterAddress) },
  });

  // Debug logging for ilk parameters
  useEffect(() => {
    if (vatAddress && ilkData) {
      const ilkArray = ilkData as any[];
      console.log("📊 LQD Ilk Parameters (on-chain):", {
        Art: ilkArray[0]?.toString(),
        rate: ilkArray[1]?.toString(),
        spot: ilkArray[2]?.toString(),
        line: ilkArray[3]?.toString(),
        dust: ilkArray[4]?.toString(),
        par: par?.toString(),
      });
    }
    if (ilkError) {
      console.error("❌ Error fetching ilk parameters:", ilkError);
    }
  }, [vatAddress, ilkData, ilkError, par]);

  /**
   * Create a new vault
   */
  const createVault = async () => {
    if (!vatAddress) {
      throw new Error("Vat address not configured");
    }

    const txHash = await createVaultAsync({
      address: vatAddress,
      abi: vatABI.abi as any,
      functionName: "createVault",
      args: [LQD_ILK],
    });

    // Wait for transaction receipt to get vault ID from event
    if (publicClient) {
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      // Find VaultCreated event
      const vaultCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const decoded = decodeEventLog({
            abi: vatABI.abi as any,
            data: log.data,
            topics: log.topics,
          }) as any;
          return decoded.eventName === "VaultCreated";
        } catch {
          return false;
        }
      });

      if (vaultCreatedEvent) {
        const decoded = decodeEventLog({
          abi: vatABI.abi as any,
          data: vaultCreatedEvent.data,
          topics: vaultCreatedEvent.topics,
        }) as any;
        const newVaultId = (decoded.args as any).vaultId as bigint;
        setSelectedVaultId(newVaultId);
      }
    }

    // Refetch user vaults after a short delay to ensure on-chain state is updated
    setTimeout(() => {
      refetchVaultIds();
    }, 2000);

    return txHash;
  };

  /**
   * Deposit collateral into vault
   */
  const depositCollateral = async (vaultId: bigint, amount: bigint) => {
    if (!gemJoinAddress || !collateralAddress) {
      throw new Error("GemJoin or collateral address not configured");
    }

    // First approve GemJoin to spend collateral
    await approveCollateral(gemJoinAddress, amount);

    // Then deposit via GemJoin
    return gemJoinAsync({
      address: gemJoinAddress,
      abi: gemJoinABI.abi as any,
      functionName: "join",
      args: [vaultId, amount],
    });
  };

  /**
   * Withdraw collateral from vault
   */
  const withdrawCollateral = async (vaultId: bigint, amount: bigint) => {
    if (!gemJoinAddress || !userAddress) {
      throw new Error("GemJoin address or user address not configured");
    }

    return gemJoinAsync({
      address: gemJoinAddress,
      abi: gemJoinABI.abi as any,
      functionName: "exit",
      args: [vaultId, userAddress, amount],
    });
  };

  /**
   * Borrow stablecoin (frob to create debt, then exit to mint tokens)
   * @param vaultId The vault ID
   * @param borrowAmount Amount in token units (will be converted to rad internally)
   */
  const borrow = async (vaultId: bigint, borrowAmount: bigint) => {
    if (!vatAddress || !stablecoinJoinAddress || !userAddress) {
      throw new Error("Vat or StablecoinJoin address not configured");
    }

    // Convert wad to rad (multiply by RAY = 1e27)
    const RAY = BigInt(10 ** 27);
    const rad = borrowAmount * RAY;

    // First authorize StablecoinJoin (one-time per user)
    try {
      await hopeAsync({
        address: vatAddress,
        abi: vatABI.abi as any,
        functionName: "hope",
        args: [stablecoinJoinAddress],
      });
    } catch (error) {
      // Ignore if already authorized
      console.log("Hope may already be set:", error);
    }

    // Create debt via frob (dink = 0, dart = rad)
    await frobAsync({
      address: vatAddress,
      abi: vatABI.abi as any,
      functionName: "frob",
      args: [vaultId, BigInt(0), rad],
    });

    // Convert internal DAI to stablecoin tokens (exit uses wad, not rad)
    return stablecoinJoinAsync({
      address: stablecoinJoinAddress,
      abi: stablecoinJoinABI.abi as any,
      functionName: "exit",
      args: [userAddress, borrowAmount],
    });
  };

  /**
   * Repay debt (join to burn tokens, then frob to destroy debt)
   * @param vaultId The vault ID
   * @param repayAmount Amount in token units (will be converted to rad internally)
   */
  const repay = async (vaultId: bigint, repayAmount: bigint) => {
    if (!stablecoinJoinAddress || !vatAddress || !userAddress) {
      throw new Error("StablecoinJoin or Vat address not configured");
    }

    // Convert wad to rad (multiply by RAY = 1e27)
    const RAY = BigInt(10 ** 27);
    const rad = repayAmount * RAY;

    // Convert stablecoin tokens to internal DAI (join uses wad, not rad)
    await stablecoinJoinAsync({
      address: stablecoinJoinAddress,
      abi: stablecoinJoinABI.abi as any,
      functionName: "join",
      args: [userAddress, repayAmount],
    });

    // Repay debt via frob (negative dart to decrease debt)
    const negativeDart = -rad;
    return frobAsync({
      address: vatAddress,
      abi: vatABI.abi as any,
      functionName: "frob",
      args: [vaultId, BigInt(0), negativeDart],
    });
  };

  // Parse vault data
  const parseIlk = (ilkBytes: `0x${string}`): string => {
    try {
      // Remove null bytes and convert to string
      const hex = ilkBytes.slice(2);
      let result = "";
      for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16);
        if (byte === 0) break;
        result += String.fromCharCode(byte);
      }
      return result;
    } catch {
      return ilkBytes;
    }
  };

  const vault = vaultData ? {
    owner: (vaultData as any)[0] as string,
    ilk: parseIlk((vaultData as any)[1] as `0x${string}`),
    ink: (vaultData as any)[2] as bigint, // Collateral amount
    art: (vaultData as any)[3] as bigint, // Normalized debt
  } : null;

  const collateralBalanceFormatted = collateralBalance ? (collateralBalance as bigint) : BigInt(0);

  // Parse ilk parameters
  // Note: liqRatio (mat) is stored in Spotter but not exposed via public getter
  // We can calculate it from: mat = (price * par) / spot, but we need the oracle price
  // For now, we display what's available from getIlk
  const ilkParams = ilkData ? {
    Art: (ilkData as any)[0] as bigint, // Total normalized debt (wad)
    rate: (ilkData as any)[1] as bigint, // Accumulated stability fee rate (RAY)
    spot: (ilkData as any)[2] as bigint, // Adjusted collateral price (RAY) = price * par / mat
    line: (ilkData as any)[3] as bigint, // Maximum debt ceiling (RAD)
    dust: (ilkData as any)[4] as bigint, // Minimum debt amount (RAD)
    par: par as bigint | undefined, // Reference price from Spotter (RAY)
  } : null;

  return {
    // Addresses
    vatAddress,
    gemJoinAddress,
    stablecoinJoinAddress,
    collateralAddress,
    
    // Vault state
    userVaultIds: userVaultIds as bigint[] | undefined,
    selectedVaultId,
    setSelectedVaultId,
    vault,
    hasVault: firstVaultId !== null,
    
    // Ilk parameters (fetched on-chain)
    ilkParams,
    isIlkLoading,
    ilkError,
    
    // Balances
    collateralBalance: collateralBalanceFormatted,
    
    // Actions
    createVault,
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    
    // Loading states
    isCreateVaultPending,
    isFrobPending,
    isGemJoinPending,
    isStablecoinJoinPending,
    isApprovePending,
    isVaultIdsLoading,
    isVaultLoading,
    
    // Errors
    createVaultError,
    frobError,
    gemJoinError,
    stablecoinJoinError,
    
    // Refetch functions
    refetchVault,
    refetchVaultIds,
    refetchCollateralBalance,
    refetchIlk,
  };
}
