"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Wallet,
  UserCheck,
  Shield,
} from "lucide-react";
import gatewayABI from "@/abi/gateway.json";
import { useContractAddress } from "@/lib/addresses";
import { useOnchainID } from "@/hooks/view/onChain/useOnchainID";
import { useAddClaim } from "@/hooks/writes/onChain/useAddClaim";
import { useIdentityVerification } from "@/hooks/view/onChain/useIdentityVerification";
import { useNetwork } from "@/context/NetworkContext";
interface KYCSignatureResponse {
  signature: {
    r: string;
    s: string;
    v: number;
  };
  issuerAddress: string;
  dataHash: string;
  topic: number;
}

export default function KYCFlow() {
  const { address, isConnected } = useAccount();
  const { checkAndSwitchNetwork, isBase } = useNetwork();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<number>(91);
  const [onchainIDAddressCurrent, setOnchainIDAddressCurrent] =
    useState<string>("");
  const [kycSignature, setKycSignature] = useState<KYCSignatureResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [claimAdded, setClaimAdded] = useState(false);
  const [cooldownUntilMs, setCooldownUntilMs] = useState<number | null>(null);
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] =
    useState<number>(0);
  const gatewayAddress = useContractAddress("gateway");
  const idFactoryAddress = useContractAddress("idfactory");
  const issuerAddress = useContractAddress("issuer");

  // Contract interactions
  const {
    writeContract,
    data: deployHash,
    isPending: isDeploying,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isDeployed } =
    useWaitForTransactionReceipt({
      hash: deployHash,
    });

  // Add claim to identity using custom hook
  const {
    addClaim,
    isAddingClaim,
    isConfirmingClaim,
    isClaimAdded,
    error: addClaimError,
  } = useAddClaim();

  // Use useOnchainID for all identity info
  const {
    onchainIDAddress,
    loading: isCheckingIdentity,
    hasKYCClaim,
    refetch: refetchOnchainID,
  } = useOnchainID({
    userAddress: address,
    idFactoryAddress,
    issuer: issuerAddress,
    topic: 1,
  });

  // Check identity verification status
  const {
    isVerified: isIdentityVerified,
    isLoading: isCheckingVerification,
    refetch: refetchVerification,
  } = useIdentityVerification(address);

  // Sync local state with hook value and handle network switching
  useEffect(() => {
    if (typeof onchainIDAddress === "string") {
      setOnchainIDAddressCurrent(onchainIDAddress);
    }
  }, [onchainIDAddress]);

  // Refetch identity data when deployment is successful
  useEffect(() => {
    if (isDeployed) {
      console.log("✅ Identity deployed successfully, refetching data...");
      // Add a small delay to ensure the blockchain state has updated
      const timer = setTimeout(async () => {
        await refetchOnchainID();
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [isDeployed, refetchOnchainID]);

  // Console log wallet address when it changes
  useEffect(() => {
    if (address) {
      console.log("Wallet address:", address);
    }
  }, [address]);

  // Automatically switch to Base Sepolia when wallet connects with better error handling
  useEffect(() => {
    if (isConnected) {
      checkAndSwitchNetwork().catch((error: Error) => {
        console.error("Failed to switch network in KYC flow:", error);
        setError(
          "Failed to switch to Base Sepolia network. Please try switching manually.",
        );
      });
    }
  }, [isConnected, checkAndSwitchNetwork]);

  // Check if identity exists (avoid unknown type in JSX)
  const hasExistingIdentity = Boolean(
    onchainIDAddress &&
      typeof onchainIDAddress === "string" &&
      onchainIDAddress !== "0x0000000000000000000000000000000000000000",
  );

  const steps = [
    {
      id: 1,
      title: "Connect Wallet",
      description: "Connect your wallet to start the verification process",
      icon: Wallet,
      status: isConnected ? "completed" : "current",
    },
    {
      id: 2,
      title: "Create OnchainID",
      description: "Deploy your onchain identity",
      icon: UserCheck,
      status: hasExistingIdentity
        ? "completed"
        : isDeployed
          ? "completed"
          : isConnected
            ? "current"
            : "pending",
    },
    {
      id: 3,
      title: "Verification",
      description: "Complete verification with signature",
      icon: Shield,
      status: isIdentityVerified || kycSignature ? "completed" : "pending",
    },
    {
      id: 4,
      title: "Add Claim to Identity",
      description: "Add verification claim to your onchain identity",
      icon: Shield,
      status: isClaimAdded ? "completed" : "pending",
    },
  ];

  // Filter out Add Claim step if identity is verified in the registry
  // Since identity registry verification is what matters for token minting,
  // we don't need the onchain identity claim step
  const visibleSteps = (() => {
    if (isIdentityVerified) {
      return steps.filter((step) => step.id !== 4); // Skip add claim if verified in registry
    } else {
      return steps;
    }
  })();

  // Modify progress calculation
  const progress = (() => {
    if (hasExistingIdentity && isIdentityVerified) {
      return 100;
    } else if (isIdentityVerified && !isClaimAdded) {
      return 75;
    } else if (hasExistingIdentity || isDeployed) {
      return 50;
    } else if (isConnected) {
      return 25;
    } else {
      return 0;
    }
  })();

  // Handle identity deployment
  const handleDeployIdentity = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      setError("");

      writeContract({
        address: gatewayAddress as `0x${string}`,
        abi: gatewayABI.abi,
        functionName: "deployIdentityForWallet",
        args: [address],
      });
      console.log("Deploy transaction hash:", deployHash);
    } catch (err) {
      setError("Failed to deploy identity");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle KYC signature request
  const handleKYCSignature = async () => {
    if (!address || !onchainIDAddress) return;
    if (cooldownUntilMs && Date.now() < cooldownUntilMs) return;

    try {
      setIsLoading(true);
      setError("");

      // Add timeout to prevent forever loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("/api/kyc-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: address,
          onchainIDAddress: onchainIDAddress,
          claimData: "KYC passed",
          topic: 1,
          countryCode: selectedCountry,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = "Failed to get KYC signature";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const errorText = await response.text();
            console.error("Non-JSON error response:", errorText);
            errorMessage = `Server error (${response.status}): ${response.statusText}`;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data: KYCSignatureResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing success response:", parseError);
        throw new Error("Invalid response format from server");
      }
      setKycSignature(data);
      setCurrentStep(3);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to get KYC signature",
        );
      }
      console.error("KYC signature error:", err);
      // Start 60s cooldown after any failure
      const until = Date.now() + 60000;
      setCooldownUntilMs(until);
      try {
        if (typeof window !== "undefined" && address) {
          const storageKey = `kycCooldown:${address.toLowerCase()}`;
          window.localStorage.setItem(storageKey, String(until));
        }
      } catch (_) {
        // Ignore storage failures
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Hydrate cooldown from localStorage on mount/address change
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !address) return;
      const storageKey = `kycCooldown:${address.toLowerCase()}`;
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const storedUntil = Number(raw);
      if (Number.isFinite(storedUntil) && storedUntil > Date.now()) {
        setCooldownUntilMs(storedUntil);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch (_) {
      // Ignore storage failures
    }
  }, [address]);

  // Update live countdown for cooldown
  useEffect(() => {
    if (cooldownUntilMs === null) {
      setCooldownRemainingSeconds(0);
      return;
    }
    const tick = () => {
      const remainingMs = cooldownUntilMs - Date.now();
      if (remainingMs <= 0) {
        setCooldownUntilMs(null);
        setCooldownRemainingSeconds(0);
        try {
          if (typeof window !== "undefined" && address) {
            const storageKey = `kycCooldown:${address.toLowerCase()}`;
            window.localStorage.removeItem(storageKey);
          }
        } catch (_) {
          // Ignore storage failures
        }
      } else {
        setCooldownRemainingSeconds(Math.ceil(remainingMs / 1000));
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [cooldownUntilMs, address]);

  // Handler for add claim button
  const handleAddClaim = async () => {
    if (!kycSignature || !onchainIDAddressCurrent || !address) return;
    addClaim({
      onchainIDAddress: onchainIDAddressCurrent,
      issuerAddress: issuerAddress as `0x${string}`,
      signature: kycSignature.signature,
      topic: 1,
      claimData: "KYC passed",
      account: address,
    });
  };

  // console.log("kycsignature address", kycSignature?.issuerAddress);
  // console.log("issuerAddress", issuerAddress);

  // // Add comprehensive debugging logs
  // console.log("🔍 KYC Debug Information:");
  // console.log("Current chain ID:", useChainId());
  // console.log("Expected issuer address:", issuerAddress);
  // console.log("KYC signature issuer address:", kycSignature?.issuerAddress);
  // console.log("OnchainID address:", onchainIDAddress);
  // console.log("Has KYC claim:", hasKYCClaim);
  // console.log("Is claim added:", isClaimAdded);
  // console.log("Current step:", currentStep);
  // console.log("Has existing identity:", hasExistingIdentity);
  // console.log("Is identity verified:", isIdentityVerified);
  // console.log("Is checking verification:", isCheckingVerification);

  // Update current step based on state
  useEffect(() => {
    if (!isConnected) {
      setCurrentStep(1);
    } else if (isConnected && !hasExistingIdentity && !isDeployed) {
      setCurrentStep(2);
    } else if ((hasExistingIdentity || isDeployed) && !isIdentityVerified) {
      setCurrentStep(3);
    } else if (isIdentityVerified && !isClaimAdded) {
      setCurrentStep(4);
    } else if (isIdentityVerified && isClaimAdded) {
      setCurrentStep(4); // Stay at the last step when complete
    }
  }, [
    isConnected,
    isDeployed,
    isIdentityVerified,
    isClaimAdded,
    hasExistingIdentity,
  ]);

  // Update onchain ID address when identity is deployed or already exists
  useEffect(() => {
    if (hasExistingIdentity && typeof onchainIDAddress === "string") {
      console.log("Identity address from contract:", onchainIDAddress);
    } else if (
      isDeployed &&
      onchainIDAddress &&
      typeof onchainIDAddress === "string"
    ) {
      console.log("Identity address from contract:", onchainIDAddress);
    }
  }, [isDeployed, onchainIDAddress, hasExistingIdentity]);

  // Track when claim is successfully added
  useEffect(() => {
    if (isClaimAdded) {
      setClaimAdded(true);
      console.log("KYC claim added successfully to identity");
    }
  }, [isClaimAdded]);

  const getStepIcon = (step: (typeof steps)[0]) => {
    if (
      (step.id === 2 && step.status === "completed") ||
      (step.id === 3 && hasExistingIdentity)
    ) {
      // OnchainID or KYC completed: show green check
      return <CheckCircle className="h-6 w-6 text-emerald-600" />;
    }
    const Icon = step.icon;
    if (step.status === "completed") {
      return <CheckCircle className="h-6 w-6 text-emerald-600" />;
    } else if (step.status === "current") {
      return <Icon className="h-6 w-6 text-blue-600" />;
    } else {
      return <Icon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStepStatus = (step: (typeof steps)[0]) => {
    if (step.status === "completed") {
      return (
        <Badge variant="default" className="bg-emerald-100 text-emerald-800">
          Completed
        </Badge>
      );
    } else if (step.status === "current") {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          In Progress
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-500">
          Pending
        </Badge>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Verification</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete your verification to access advanced trading features. This
          process creates your onchain identity and verifies your credentials.
        </p>

        {/* Network Status Indicator */}
        {isConnected && (
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isBase
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  isBase ? "bg-emerald-500" : "bg-yellow-500"
                }`}
              />
              {isBase
                ? "Connected to Base Sepolia Network"
                : "Wrong Network - Switching..."}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="grid gap-6">
        {visibleSteps.map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all duration-300 ${
              step.status === "current" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                    {getStepIcon(step)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                {getStepStatus(step)}
              </div>
            </CardHeader>

            <CardContent>
              {/* Step 1: Connect Wallet */}
              {step.id === 1 && (
                <div className="space-y-4">
                  {!isConnected ? (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Please connect your wallet to continue
                      </p>
                      <Badge variant="outline" className="text-gray-500">
                        Use the connect button in the header
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-800">
                          Wallet Connected
                        </p>
                        <p className="text-sm text-emerald-600">{address}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Create OnchainID */}
              {step.id === 2 && (
                <div className="space-y-4">
                  {isCheckingIdentity ? (
                    <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                      <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                      <div>
                        <p className="font-medium text-yellow-800">
                          Verifying...
                        </p>
                        <p className="text-sm text-yellow-600">
                          Checking for existing onchain identity
                        </p>
                      </div>
                    </div>
                  ) : !hasExistingIdentity && !isDeployed ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">
                          Create Your Onchain Identity
                        </h4>
                        <p className="text-sm text-blue-600">
                          This will deploy a unique onchain identity for your
                          wallet address. This identity will be used for KYC
                          verification and future interactions.
                        </p>
                      </div>

                      <Button
                        onClick={handleDeployIdentity}
                        isDisabled={
                          isDeploying ||
                          isConfirming ||
                          !isConnected ||
                          !isBase
                        }
                        className="w-full"
                      >
                        {isDeploying || isConfirming ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isDeploying
                              ? "Deploying Identity..."
                              : "Confirming Transaction..."}
                          </>
                        ) : !isBase ? (
                          "Switch to Base Sepolia Network"
                        ) : (
                          "Deploy Identity"
                        )}
                      </Button>

                      {error && (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">{error}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">
                            Identity Already Exists
                          </p>
                          <p className="text-sm text-emerald-600">
                            OnchainID Address:{" "}
                            {(isDeployed && !onchainIDAddressCurrent) ||
                            isCheckingIdentity ? (
                              <div className="flex items-center space-x-2 mt-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Loading identity address...</span>
                              </div>
                            ) : onchainIDAddressCurrent ? (
                              <span className="font-mono text-xs break-all">
                                {onchainIDAddressCurrent}
                              </span>
                            ) : (
                              <span>Loading...</span>
                            )}
                          </p>
                          <p className="text-xs text-emerald-600">
                            Your onchain identity was already created.
                            Proceeding to verification.
                          </p>
                        </div>
                      </div>
                      {isIdentityVerified && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium text-emerald-800">
                                Identity Registered
                              </p>
                              <p className="text-xs text-emerald-600">
                                Your identity has been successfully registered
                                and verified.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: KYC Verification */}
              {step.id === 3 && (
                <div className="space-y-4">
                  {isIdentityVerified ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="font-medium text-emerald-800">
                            Identity Verification Complete
                          </p>
                          <p className="text-sm text-emerald-600">
                            Your identity is verified in the identity registry
                            and you can mint tokens.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : kycSignature ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <div className="flex-1">
                          <p className="font-medium text-emerald-800">
                            Verification Signature Obtained
                          </p>
                          <p className="text-sm text-emerald-600">
                            Your verification signature has been obtained
                            successfully.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">
                          Complete Verification
                        </h4>
                        <p className="text-sm text-blue-600">
                          Get your verification signature to verify your
                          identity on-chain. This is required for trading
                          ERC3643 compliant tokens.
                        </p>
                      </div>

                      <Button
                        onClick={handleKYCSignature}
                        isDisabled={
                          !address ||
                          !onchainIDAddress ||
                          isLoading ||
                          !isBase ||
                          (cooldownUntilMs !== null &&
                            cooldownRemainingSeconds > 0)
                        }
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Getting KYC Signature...
                          </>
                        ) : !isBase ? (
                          "Switch to Base Sepolia Network"
                        ) : cooldownUntilMs !== null &&
                          cooldownRemainingSeconds > 0 ? (
                          `Retry in ${Math.max(1, cooldownRemainingSeconds)}s`
                        ) : (
                          "Get KYC Signature"
                        )}
                      </Button>

                      {error && (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">{error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Add Claim to Identity */}
              {step.id === 4 && hasExistingIdentity && (
                <div className="space-y-4">
                  {isIdentityVerified ? (
                    <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-800">
                          Identity Verification Completed
                        </p>
                        <p className="text-sm text-emerald-600">
                          Your identity is verified in the identity registry and
                          you can mint tokens.
                        </p>
                      </div>
                    </div>
                  ) : !isClaimAdded ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2">
                          Add Verification Claim to Identity
                        </h4>
                        <p className="text-sm text-purple-600">
                          Add verification claim to your onchain identity to
                          complete the verification process.
                        </p>
                      </div>

                      <Button
                        onClick={handleAddClaim}
                        isDisabled={
                          isAddingClaim ||
                          isConfirmingClaim ||
                          !kycSignature ||
                          !isBase
                        }
                        className="w-full"
                      >
                        {isAddingClaim || isConfirmingClaim ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isAddingClaim
                              ? "Adding Verification Claim..."
                              : "Confirming Transaction..."}
                          </>
                        ) : !isBase ? (
                          "Switch to Base Sepolia Network"
                        ) : (
                          "Add Verification Claim"
                        )}
                      </Button>

                      {addClaimError && (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600">
                            {addClaimError}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-800">
                          KYC Claim Added
                        </p>
                        <p className="text-sm text-emerald-600">
                          KYC claim has been added to your identity
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      {isClaimAdded && (
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <span>KYC Verification Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Congratulations! You have successfully completed the KYC
              verification process. Your onchain identity is now verified and
              you can access advanced trading features.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <p className="font-semibold text-gray-800 mb-2">
                  Wallet Address
                </p>
                <p className="text-gray-600 font-mono text-xs break-all leading-relaxed">
                  {address}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <p className="font-semibold text-gray-800 mb-2">OnchainID</p>
                <p className="text-gray-600 font-mono text-xs break-all leading-relaxed">
                  {onchainIDAddressCurrent}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <p className="font-semibold text-gray-800 mb-2">Country Code</p>
                <p className="text-gray-600 text-lg font-medium">
                  +{selectedCountry}
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-emerald-100 rounded-lg border border-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 mb-1">
                    KYC Claim Added Successfully
                  </p>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Your KYC verification has been successfully added to your
                    onchain identity. You can now access advanced trading
                    features.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
