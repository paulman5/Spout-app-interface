"use client";

import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useOnchainID } from "@/hooks/view/onChain/useOnchainID";
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useContractAddress } from "@/lib/addresses";
import { useUSDCTokenBalance } from "@/hooks/view/onChain/useUSDCTokenBalance";

export default function OnchainIDChecker() {
  const { address: userAddress } = useAccount();
  const idFactoryAddress = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536";
  const issuerAddress = useContractAddress("issuer");
  const {
    hasOnchainID,
    hasEverHadOnchainID,
    hasKYCClaim,
    loading: onchainIDLoading,
    kycLoading,
  } = useOnchainID({
    userAddress,
    idFactoryAddress,
    issuer: issuerAddress,
    topic: 1,
  });

  // Track if we've already shown the KYC toast to prevent duplicates
  const [hasShownKYCToast, setHasShownKYCToast] = React.useState(false);

  // Track if we've waited for data to settle
  const [hasWaitedForSettlement, setHasWaitedForSettlement] =
    React.useState(false);
  const { amountUi: usdcBalance, isLoading: usdcLoading } =
    useUSDCTokenBalance();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Wait for data to settle before making any decisions
  React.useEffect(() => {
    const isLoading = onchainIDLoading || kycLoading;

    if (!isLoading && !hasWaitedForSettlement) {
      console.log(
        "[KYC Sonner Debug] ⏳ Data loaded, waiting 0.5 seconds for settlement...",
      );

      const timer = setTimeout(() => {
        console.log(
          "[KYC Sonner Debug] ✅ Data settled, hasOnchainID:",
          hasOnchainID,
          "hasEverHadOnchainID:",
          hasEverHadOnchainID,
        );
        setHasWaitedForSettlement(true);
      }, 500); // Reduced from 1000ms to 500ms for faster response

      return () => clearTimeout(timer);
    }
  }, [
    hasOnchainID,
    onchainIDLoading,
    kycLoading,
    hasWaitedForSettlement,
    hasEverHadOnchainID,
  ]);

  // Immediately dismiss any existing KYC toasts if KYC is completed
  React.useEffect(() => {
    if (
      hasOnchainID === true &&
      hasKYCClaim === true &&
      !onchainIDLoading &&
      !kycLoading
    ) {
      console.log(
        "[KYC Sonner Debug] ✅ KYC completed, immediately dismissing any existing toasts",
      );
      toast.dismiss("kyc-toast");
    }
  }, [hasOnchainID, hasKYCClaim, onchainIDLoading, kycLoading]);

  React.useEffect(() => {
    // Dismiss toast if already on the KYC tab
    if (pathname === "/app/profile" && searchParams?.get("tab") === "kyc") {
      toast.dismiss("kyc-toast");
    }

    // Also dismiss if KYC is completed, regardless of page
    if (
      hasOnchainID === true &&
      hasKYCClaim === true &&
      !onchainIDLoading &&
      !kycLoading
    ) {
      console.log(
        "[KYC Sonner Debug] ✅ KYC completed, dismissing toast on navigation",
      );
      toast.dismiss("kyc-toast");
    }
  }, [
    pathname,
    searchParams,
    hasOnchainID,
    hasKYCClaim,
    onchainIDLoading,
    kycLoading,
  ]);

  // Dismiss KYC toast when KYC is completed
  React.useEffect(() => {
    console.log(
      "[KYC Dismiss Debug] hasOnchainID:",
      hasOnchainID,
      "hasKYCClaim:",
      hasKYCClaim,
      "onchainIDLoading:",
      onchainIDLoading,
      "kycLoading:",
      kycLoading,
    );

    if (
      hasOnchainID === true &&
      hasKYCClaim === true &&
      !onchainIDLoading &&
      !kycLoading
    ) {
      console.log("[KYC Sonner Debug] ✅ KYC completed, dismissing toast");
      toast.dismiss("kyc-toast");
    }
  }, [hasOnchainID, hasKYCClaim, onchainIDLoading, kycLoading]);

  // Show 'Claim USDC' Sonner if user has no USDC, but only on the trade page
  React.useEffect(() => {
    console.log(
      "[USDC Sonner Debug] usdcBalance:",
      usdcBalance,
      "usdcLoading:",
      usdcLoading,
      "pathname:",
      pathname,
    );

    // Dismiss USDC toast if user has USDC balance
    if (!usdcLoading && Number(usdcBalance) > 50) {
      console.log(
        "[USDC Sonner Debug] ✅ User has USDC balance, dismissing toast",
      );
      toast.dismiss("usdc-toast");
      return;
    }

    if (
      !usdcLoading &&
      Number(usdcBalance) <= 0 &&
      String(pathname) === "/app/trade"
    ) {
      toast.warning(
        "You need USDC to start trading. Claim your testnet USDC to begin.",
        {
          id: "usdc-toast",
          action: {
            label: "Claim USDC",
            onClick: () => {
              window.open("https://testnet.zenithswap.xyz/swap", "_blank");
              toast.dismiss("usdc-toast");
            },
          },
          duration: Infinity,
        },
      );
    } else {
      console.log("[USDC Sonner Debug] ❌ Conditions not met:");
      console.log("  - !usdcLoading:", !usdcLoading);
      console.log("  - Number(usdcBalance) <= 0:", Number(usdcBalance) <= 0);
      console.log(
        '  - pathname === "/app/trade":',
        String(pathname) === "/app/trade",
      );
    }
  }, [usdcBalance, usdcLoading, pathname, searchParams]);

  // Show 'Complete Profile' Sonner if user has not completed KYC
  React.useEffect(() => {
    console.log(
      "[KYC Sonner Debug] hasOnchainID:",
      hasOnchainID,
      "hasEverHadOnchainID:",
      hasEverHadOnchainID,
      "hasKYCClaim:",
      hasKYCClaim,
      "onchainIDLoading:",
      onchainIDLoading,
      "kycLoading:",
      kycLoading,
      "pathname:",
      pathname,
      "searchParams:",
      searchParams?.get("tab"),
      "hasShownKYCToast:",
      hasShownKYCToast,
      "hasWaitedForSettlement:",
      hasWaitedForSettlement,
    );

    // Only wait for onchainIDLoading, not kycLoading for faster response
    const isLoading = onchainIDLoading;

    // Don't do anything while loading or before data has settled
    if (isLoading || !hasWaitedForSettlement) {
      console.log(
        "[KYC Sonner Debug] ⏳ Still loading or waiting for settlement...",
      );
      return;
    }

    // FIRST: Check if KYC is completed - if so, dismiss toast and return early
    if (hasEverHadOnchainID === true) {
      toast.dismiss("kyc-toast");
      setHasShownKYCToast(false); // Reset the flag when KYC is completed
      return;
    }

    // SECOND: Only show toast if user has never had an onchain ID, not on KYC page, and haven't shown it yet
    if (
      hasEverHadOnchainID === false &&
      !(pathname === "/app/profile" && searchParams?.get("tab") === "kyc") &&
      !hasShownKYCToast
    ) {
      setHasShownKYCToast(true); // Mark that we've shown the toast
      toast.warning(
        "Complete KYC and create your onchainIdentity to buy Spout tokens",
        {
          id: "kyc-toast",
          action: {
            label: "Complete Profile",
            onClick: () => {
              router.push("/app/profile?tab=kyc");
              toast.dismiss("kyc-toast");
            },
          },
          duration: Infinity,
        },
      );
    } else {
      console.log("[KYC Sonner Debug] ❌ Conditions not met:");
      console.log(
        "  - hasEverHadOnchainID === false:",
        hasEverHadOnchainID === false,
      );
      console.log(
        "  - Not on KYC page:",
        !(pathname === "/app/profile" && searchParams?.get("tab") === "kyc"),
      );
      console.log("  - !hasShownKYCToast:", !hasShownKYCToast);
    }
  }, [
    hasOnchainID,
    hasEverHadOnchainID,
    hasKYCClaim,
    onchainIDLoading,
    kycLoading,
    router,
    pathname,
    searchParams,
    hasShownKYCToast,
    hasWaitedForSettlement,
  ]);

  // Always dismiss KYC toast if user has ever had onchain ID and data has settled (runs on every render as backup)
  if (
    hasEverHadOnchainID === true &&
    !onchainIDLoading &&
    !kycLoading &&
    hasWaitedForSettlement
  ) {
    console.log(
      "[KYC Sonner Debug] ✅ User has ever had onchain ID, dismissing KYC toast on render",
    );
    toast.dismiss("kyc-toast");
  }

  // Debug: Log all values on every render
  console.log(
    "[KYC Debug Render] hasOnchainID:",
    hasOnchainID,
    "hasKYCClaim:",
    hasKYCClaim,
    "onchainIDLoading:",
    onchainIDLoading,
    "kycLoading:",
    kycLoading,
    "pathname:",
    pathname,
  );

  return null;
}
