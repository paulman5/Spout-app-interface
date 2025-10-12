"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScreenSize } from "@/hooks/use-screen-size";
import { JoinMailingList } from "./join-mailing-list";
import { PartnerTicker } from "./partner-ticker";
import Image from "next/image";

export function HeroSection() {
  const screenSize = useScreenSize();

  return (
    <section className="w-full flex flex-col relative min-h-screen overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:35px_35px]"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20 flex flex-col lg:flex-row items-center justify-between">
        {/* Left column - Text content */}
        <div className="w-full lg:w-2/3 lg:pr-12 mb-12 lg:mb-0">
          <div className="max-w-3xl">
            {/* Main heading */}
            <h1 className="text-3xl lg:text-5xl font-lora font-normal text-[#004040] mb-8 leading-tight">
              The platform for what's<br />
              next in decentralized investing
            </h1>
            
            {/* Description */}
            <p className="text-lg lg:text-xl font-noto-sans text-[#334155] mb-12 leading-relaxed">
              Spout makes U.S. investment-grade assets like bonds and equities available
              as secure, yield-bearing tokens, fully backed 1:1 by real ETFs.
            </p>
            
            {/* CTA Button */}
            <div className="mb-8">
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-[#004040] hover:bg-[#003030] text-white px-8 py-4 text-lg font-semibold rounded-none shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Launch Platform
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Secondary text */}
            <p className="text-sm font-noto-sans text-[#6b7280] uppercase tracking-wide mb-8">
              [JOIN THE PLATFORM THAT'S MAKING TRADITIONAL CAPITAL MORE EFFICIENT]
            </p>
            
            {/* Mailing List */}
            <div className="max-w-md">
              <JoinMailingList />
            </div>
          </div>
        </div>

        {/* Right column - SVG graphic */}
        <div className="w-full lg:w-1/3 flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-lg">
            <Image
              src="/spout-water-tokens.svg"
              alt="Spout Water Tokens"
              width={453}
              height={498}
              className="w-full"
              priority
            />
          </div>
        </div>
      </div>

      {/* Compatible Networks Section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <PartnerTicker />
      </div>
    </section>
  );
}
