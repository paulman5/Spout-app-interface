"use client";

import { ReactNode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { AuthProvider } from "@/context/AuthContext";
import { NetworkProvider } from "@/context/NetworkContext";
import { pharos } from "@/lib/chainconfigs/pharos";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

// Custom config with more reliable RPC endpoints
const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

if (!projectId) {
  console.warn("⚠️ NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID is not set. Wallet connection may not work properly.");
}

const config = getDefaultConfig({
  appName: "Spout Finance",
  projectId: projectId,
  chains: [pharos],
  transports: {
    [pharos.id]: http("https://testnet.dplabs-internal.com"),
  },
  ssr: true,
});

function WalletConnectionPrompt() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (!isConnected) {
      toast("Wallet not connected", {
        description: "Please connect your wallet to continue.",
        action: {
          label: "Connect Wallet",
          onClick: openConnectModal ?? (() => {}),
        },
        duration: Infinity,
      });
    }
  }, [isConnected, openConnectModal]);

  return null;
}

const Providers = ({ children }: { children: ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <AuthProvider>
          <NetworkProvider>
            <WalletConnectionPrompt />
            {children}
          </NetworkProvider>
        </AuthProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export { Providers };
