"use client";

import { useReadContract } from "wagmi";
import idFactoryABI from "@/abi/idfactory.json";
import onchainidABI from "@/abi/onchainid.json";
import { AbiCoder, keccak256 } from "ethers";
import { contractaddresses } from "@/lib/addresses";
import { useChainId } from "wagmi";
import { pharos } from "@/lib/chainconfigs/pharos";
import identityRegistryABI from "@/abi/identityregistry.json";
import tokenABI from "@/abi/token.json";
import { useState, useEffect } from "react";

export function useOnchainID({
  userAddress,
  idFactoryAddress,
  issuer,
  topic = 1,
}: {
  userAddress: string | undefined | null;
  idFactoryAddress: string;
  issuer: string;
  topic?: number;
}) {
  const chainId = useChainId();
  const isPharos = chainId === pharos.id;

  // Initialize cache from localStorage immediately to prevent initial fetch
  const [cachedIdentityAddress, setCachedIdentityAddress] = useState<
    string | null
  >(() => {
    if (typeof window !== "undefined" && userAddress) {
      return localStorage.getItem(`identityAddress_${userAddress}_${chainId}`);
    }
    return null;
  });

  // First check if onchain ID actually exists using ID factory
  // Only fetch if we don't have a cached result or if user address changed
  const canReadIdentity =
    !!userAddress && !!idFactoryAddress && isPharos && !cachedIdentityAddress;

  console.log("[useOnchainID] 🔍 Fetch decision:", {
    userAddress,
    idFactoryAddress,
    cachedIdentityAddress,
    canReadIdentity,
  });
  const {
    data: actualOnchainID,
    isLoading: isLoadingActualID,
    error: actualIDError,
    refetch: refetchActualID,
  } = useReadContract({
    address: canReadIdentity ? (idFactoryAddress as `0x${string}`) : undefined,
    abi: idFactoryABI,
    functionName: "getIdentity",
    args: canReadIdentity ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: canReadIdentity },
  });

  // Get identity registry address from RWA token for verification check
  const rwaTokenAddress = contractaddresses.SpoutLQDtoken[
    chainId as 84532 | 688688
  ] as `0x${string}`;

  const {
    data: identityRegistryAddress,
    isLoading: isLoadingRegistry,
    error: registryError,
  } = useReadContract({
    address: rwaTokenAddress as `0x${string}`,
    abi: tokenABI.abi,
    functionName: "identityRegistry",
  });

  // Check verification status using identity registry
  const canReadVerification =
    !!userAddress && !!identityRegistryAddress && isPharos;
  const {
    data: isVerified,
    isLoading: isVerificationLoading,
    error: verificationError,
    refetch: refetchVerification,
  } = useReadContract({
    address: identityRegistryAddress as `0x${string}`,
    abi: identityRegistryABI.abi,
    functionName: "isVerified",
    args: canReadVerification ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: canReadVerification },
  });

  // Use cached address if available, otherwise use the fetched result
  const onchainID = cachedIdentityAddress || actualOnchainID;

  // Only show loading if we don't have a cached result and are actually fetching
  // If we have a cached identity address, we don't need to show loading for registry/verification
  const isLoading =
    !cachedIdentityAddress &&
    (isLoadingActualID || isLoadingRegistry || isVerificationLoading);

  console.log("[useOnchainID] 🔍 Loading state:", {
    cachedIdentityAddress,
    isLoadingActualID,
    isLoadingRegistry,
    isVerificationLoading,
    isLoading,
  });
  const error = actualIDError || registryError || verificationError;

  // Combined refetch function
  const refetchIdentity = async () => {
    setCachedIdentityAddress(null); // Clear cache to force refetch
    // Also clear localStorage cache
    if (typeof window !== "undefined" && userAddress) {
      localStorage.removeItem(`identityAddress_${userAddress}_${chainId}`);
    }
    await refetchActualID();
    await refetchVerification();
  };

  const hasOnchainID = Boolean(
    onchainID &&
      typeof onchainID === "string" &&
      onchainID !== "0x0000000000000000000000000000000000000000",
  );

  // Persistent state to track if user has ever had an onchain ID
  const [hasEverHadOnchainID, setHasEverHadOnchainID] = useState(false);

  // Effect to load cached data from localStorage once userAddress is available
  useEffect(() => {
    if (typeof window !== "undefined" && userAddress) {
      const storedHasEverHad = localStorage.getItem(
        `hasEverHadOnchainID_${userAddress}_${chainId}`,
      );
      const initialHasEverHad = storedHasEverHad === "true";

      console.log("[useOnchainID] 🔍 Loading from localStorage (useEffect):", {
        userAddress,
        storedHasEverHad,
        initialHasEverHad,
        cachedIdentityAddress,
      });

      setHasEverHadOnchainID(initialHasEverHad);
      // Only set cached address if it's not already set from initial state
      if (!cachedIdentityAddress) {
        const storedIdentityAddress = localStorage.getItem(
          `identityAddress_${userAddress}_${chainId}`,
        );
        setCachedIdentityAddress(storedIdentityAddress);
      }
    }
  }, [userAddress, cachedIdentityAddress, chainId]);

  // Cache the identity address when we get a result
  useEffect(() => {
    if (actualOnchainID && typeof actualOnchainID === "string") {
      setCachedIdentityAddress(actualOnchainID);
      // Also save to localStorage for persistence
      if (typeof window !== "undefined" && userAddress) {
        localStorage.setItem(
          `identityAddress_${userAddress}_${chainId}`,
          actualOnchainID,
        );
      }
    }
  }, [actualOnchainID, userAddress, chainId]);

  // Clear cache when user address changes
  useEffect(() => {
    setCachedIdentityAddress(null);
  }, [userAddress]); // Dependency on userAddress

  // Track when user has an onchain ID and persist that state
  useEffect(() => {
    console.log("[useOnchainID] 🔄 Effect triggered:", {
      hasOnchainID,
      isLoading,
      userAddress,
    });

    if (hasOnchainID === true && !isLoading && userAddress) {
      console.log(
        "[useOnchainID] ✅ User has onchain ID, setting persistent state",
      );
      setHasEverHadOnchainID(true);
      // Store in localStorage for persistence across remounts
      localStorage.setItem(
        `hasEverHadOnchainID_${userAddress}_${chainId}`,
        "true",
      );
      console.log(
        "[useOnchainID] 💾 Stored in localStorage:",
        `hasEverHadOnchainID_${userAddress}_${chainId}`,
      );
    }
  }, [hasOnchainID, isLoading, userAddress, chainId]);

  // Debug: Log any changes to hasEverHadOnchainID
  useEffect(() => {
    console.log(
      "[useOnchainID] 🎯 hasEverHadOnchainID changed to:",
      hasEverHadOnchainID,
    );

    // Check if localStorage still has the value
    if (userAddress && typeof window !== "undefined") {
      const stored = localStorage.getItem(
        `hasEverHadOnchainID_${userAddress}_${chainId}`,
      );
      console.log("[useOnchainID] 🔍 localStorage check:", {
        key: `hasEverHadOnchainID_${userAddress}_${chainId}`,
        stored,
        matches: stored === "true" && hasEverHadOnchainID === true,
      });
    }
  }, [hasEverHadOnchainID, userAddress, chainId]);

  // Debug: Track userAddress changes
  useEffect(() => {
    console.log("[useOnchainID] 👤 userAddress changed to:", userAddress);
  }, [userAddress]);

  // Return null instead of zero address to prevent UI from showing it
  const onchainIDAddress =
    onchainID &&
    typeof onchainID === "string" &&
    onchainID !== "0x0000000000000000000000000000000000000000"
      ? onchainID
      : null;

  // Calculate claimId for KYC using ethers.js (v6) only if issuer and topic are defined
  let claimId: `0x${string}` | undefined = undefined;
  if (issuer && topic !== undefined) {
    const abiCoder = AbiCoder.defaultAbiCoder();
    claimId = keccak256(
      abiCoder.encode(["address", "uint256"], [issuer as `0x${string}`, topic]),
    ) as `0x${string}`;
    // Log only when all values are present
    // console.log("issuer address", issuer);
    // console.log("topic", topic);
    // console.log("claimId", claimId);
  }

  // Only read claim if onchainID and claimId are present
  const canReadClaim = !!onchainID && !!claimId;
  const {
    data: kycClaim,
    isLoading: kycLoading,
    error: kycError,
    refetch: refetchClaim,
  } = useReadContract({
    address: canReadClaim ? (onchainID as `0x${string}`) : undefined,
    abi: onchainidABI,
    functionName: "getClaim",
    args: canReadClaim ? [claimId] : [],
    query: { enabled: canReadClaim },
  });

  // Check if claim is valid (issuer should not be zero address and topic should match)
  let hasKYCClaim = false;
  console.log("kycClaim data:", kycClaim);
  console.log("🔍 KYC Claim Verification Debug:");
  console.log("Claim data:", kycClaim);
  console.log("Expected issuer:", issuer);
  console.log("Expected topic:", topic);
  console.log("ClaimId:", claimId);

  if (kycClaim && issuer && topic !== undefined && Array.isArray(kycClaim)) {
    const claimIssuer = kycClaim[2];
    const claimTopic = kycClaim[0];
    const isIssuerMatch =
      claimIssuer && claimIssuer.toLowerCase() === issuer.toLowerCase();
    const isTopicMatch =
      claimTopic !== undefined && Number(claimTopic) === topic;
    const isNotZeroAddress =
      claimIssuer !== "0x0000000000000000000000000000000000000000";

    // console.log("Claim issuer:", claimIssuer);
    // console.log("Claim topic:", claimTopic);
    // console.log("Issuer match:", isIssuerMatch);
    // console.log("Topic match:", isTopicMatch);
    // console.log("Not zero address:", isNotZeroAddress);

    hasKYCClaim = isIssuerMatch && isTopicMatch && isNotZeroAddress;
    console.log("Final hasKYCClaim:", hasKYCClaim);
  } else {
    console.log("❌ KYC claim verification failed - missing data:");
    console.log("kycClaim exists:", !!kycClaim);
    console.log("issuer exists:", !!issuer);
    console.log("topic defined:", topic !== undefined);
    console.log("is array:", Array.isArray(kycClaim));
  }

  // Combined refetch function that refetches both identity and claim data
  const refetch = async () => {
    console.log("🔄 Refetching onchain identity data...");
    await refetchIdentity();
    if (canReadClaim) {
      await refetchClaim();
    }
  };

  console.log("user has the OnchainID?", hasOnchainID);

  return {
    hasOnchainID,
    hasEverHadOnchainID, // Export the persistent state
    onchainIDAddress: onchainIDAddress,
    loading: isLoading,
    error,
    hasKYCClaim,
    kycClaim,
    kycLoading,
    kycError,
    refetch, // Export the refetch function
    isVerified: isVerified || false, // Export verification status from identity registry
  };
}
