import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Copy } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useDisconnect, useAccount } from "wagmi";
import { useNetwork } from "@/context/NetworkContext";

const CustomConnectButton = () => {
  const { checkAndSwitchNetwork } = useNetwork();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      checkAndSwitchNetwork().catch((error: Error) => {
        console.error("Failed to switch network in connect button:", error);
      });
    }
  }, [isConnected, checkAndSwitchNetwork]);
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        const handleLogout = async () => {
          await checkAndSwitchNetwork();
          await disconnectAsync();
        };

        const handleAccountDetails = async () => {
          await checkAndSwitchNetwork();
          openAccountModal();
        };

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={() => {
                      if (openConnectModal) {
                        openConnectModal();
                      } else {
                        console.error("❌ openConnectModal is not available. Check RainbowKit configuration.");
                        alert("Wallet connection is not available. Please check your browser console for details.");
                      }
                    }}
                    className="text-white text-sm focus:outline-none hover:text-white bg-black cursor-pointer rounded-xl px-3 py-2 transition-colors border border-gray-600/50 hover:border-emerald-700 hover:!bg-emerald-700"
                  >
                    Connect Wallet
                  </button>
                );
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex focus:outline-none text-black items-center gap-2 bg-emerald-700/20 hover:bg-emerald-700/35 rounded-xl py-0.5 pl-0.5 pr-4 border-0 border-gray-600/50 transition-colors">
                      <div className="w-8 h-8 rounded-xl">
                        <Image src="/1.png" className="w-full h-full" width={32} height={32} alt="Profile_Image" />
                      </div>
                      <span className="text-sm capitalize font-semibold text-muted-foreground">
                        {account.displayName}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <DropdownMenuItem onClick={() => copyAddress(account.address)} className="cursor-pointer">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAccountDetails} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Account Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default CustomConnectButton;
