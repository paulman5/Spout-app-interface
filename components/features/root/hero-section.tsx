"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScreenSize } from "@/hooks/use-screen-size";
import { JoinMailingList } from "./join-mailing-list";
import { PartnerTicker } from "./partner-ticker";
import Image from "next/image";
import { DiagonalPattern } from "@/components/slant-dashes-svg";
import BgGrain from "@/components/bg-grain-svg";

export function HeroSection() {
  const screenSize = useScreenSize();

  return (
    <section className="w-full flex flex-col relative overflow-hidden">
      {/* Background grain for this section */}
      <BgGrain className="absolute inset-0 w-full h-full z-0" />
      {/* Hero content wrapper with grid background */}
      <div className="relative w-full">
        {/* Background grid pattern - only for hero area */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:35px_35px]"></div>

        {/* Gradient fade overlay - fades from bottom (visible) to top (hidden) */}
        {/* <div className="absolute inset-0 z-[1] bg-gradient-to-t from-transparent from-0% via-transparent via-75% to-gray-50 to-100%"></div> */}

        {/* Main content */}
        <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 sm:pt-12 lg:pt-20 pb-0 flex flex-col lg:flex-row items-start justify-between gap-0">
          {/* Left column - Text content */}
          <div className="w-full lg:w-[55%] mb-6 sm:mb-12 lg:mb-0">
            <div className="max-w-5xl space-y-4 sm:space-y-6">
              {/* Main heading */}
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-lora font-normal text-[#004040] leading-tight">
                The platform for what&apos;s next
                <br />
                in decentralized investing
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-lg lg:text-xl font-noto-sans text-[#334155] leading-relaxed">
                Spout makes U.S. investment-grade assets like bonds and equities
                available as secure, yield-bearing tokens, fully backed 1:1 by
                real ETFs.
              </p>

              {/* CTA Button */}
              <div className="pt-2 sm:pt-0">
                <Link href="/app">
                  <Button
                    size="lg"
                    className="bg-[#004040] hover:bg-[#003030] data-[hovered]:bg-[#003030] text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg lg:text-xl font-semibold rounded-none shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    Launch Platform
                    <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </Button>
                </Link>
              </div>

              {/* Secondary text */}
              <p className="text-xs sm:text-sm lg:text-base font-noto-sans text-[#6b7280] uppercase tracking-wide">
                [JOIN THE PLATFORM THAT&apos;S MAKING TRADITIONAL CAPITAL MORE
                EFFICIENT]
              </p>

              {/* Mailing List */}
              <div className="max-w-md pt-2 sm:pt-0">
                <JoinMailingList />
              </div>
            </div>
          </div>

          {/* Right column - SVG graphic */}
          <div className="w-full lg:w-[45%] flex items-center justify-center lg:justify-end -mt-2 sm:-mt-6 lg:-mt-8">
            <div className="w-full max-w-[280px] sm:max-w-sm lg:max-w-xl">
              <Image
                src="/svg-assets/landingpage/spout-water-tokens.svg"
                alt="Spout Water Tokens"
                width={550}
                height={550}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* Compatible Networks Section */}
        <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16 mb-3 sm:mb-6">
          <div className="px-16 hidden md:block">
            <PartnerTicker />
          </div>
          <div className="block md:hidden">
            <PartnerTicker />
          </div>
        </div>
      </div>

      {/* Slant Dashes */}
      <div className="relative z-10 w-full mt-10 px-4 py-2">
        <DiagonalPattern
          width="100%"
          height={34}
          color="#A7C6ED"
          strokeWidth={1.5}
          spacing={14}
        />
      </div>
    </section>
  );
}
