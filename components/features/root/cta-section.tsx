"use client";

import Image from "next/image";
import Link from "next/link";
import { DiagonalPattern } from "@/components/slant-dashes-svg";
import BgGrain from "@/components/bg-grain-svg";

export function CTASection() {
  return (
    <section className="w-full py-4 sm:py-8 lg:py-12 relative">
      {/* Background grain for this section */}
      <BgGrain className="absolute inset-0 w-full h-full z-0" />
      {/* Section content */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16 pb-8 sm:pb-12 lg:pb-16">
        <div className="relative border border-gray-300 rounded-none shadow-sm pl-4 sm:pl-4 lg:pl-5 pr-4 sm:pr-4 lg:pr-5 py-6 sm:py-8 lg:py-12">
          {/* Top-left diamond */}
          <div className="hidden sm:block absolute -left-2 sm:-left-3 -top-2 sm:-top-3 z-20">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-blue-300 sm:w-6 sm:h-6"
            >
              <path
                d="M12 2L22 12L12 22L2 12L12 2Z"
                stroke="currentColor"
                strokeWidth="3"
                fill="white"
              />
            </svg>
          </div>

          {/* Top-right diamond */}
          <div className="hidden sm:block absolute -right-2 sm:-right-3 -top-2 sm:-top-3 z-20">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-blue-300 sm:w-6 sm:h-6"
            >
              <path
                d="M12 2L22 12L12 22L2 12L12 2Z"
                stroke="currentColor"
                strokeWidth="3"
                fill="white"
              />
            </svg>
          </div>

          {/* Bottom-left diamond */}
          <div className="hidden sm:block absolute -left-2 sm:-left-3 -bottom-2 sm:-bottom-3 z-20">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-blue-300 sm:w-6 sm:h-6"
            >
              <path
                d="M12 2L22 12L12 22L2 12L12 2Z"
                stroke="currentColor"
                strokeWidth="3"
                fill="white"
              />
            </svg>
          </div>

          {/* Bottom-right diamond */}
          <div className="hidden sm:block absolute -right-2 sm:-right-3 -bottom-2 sm:-bottom-3 z-20">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-blue-300 sm:w-6 sm:h-6"
            >
              <path
                d="M12 2L22 12L12 22L2 12L12 2Z"
                stroke="currentColor"
                strokeWidth="3"
                fill="white"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-lora font-normal text-[#004040] leading-tight">
                Ready to Start Earning Stable Yields?
              </h2>
              <p className="text-sm sm:text-base lg:text-lg font-noto-sans text-[#475569] leading-relaxed">
                Join thousands of users who are already earning consistent
                returns from investment-grade corporate bonds on the blockchain.
              </p>
              <div className="pt-2 sm:pt-0">
                <Link href="/app">
                  <button className="px-6 sm:px-8 py-3 sm:py-3 bg-[#004040] text-white font-noto-sans font-medium rounded-lg hover:bg-[#003030] transition-colors text-sm sm:text-base w-full sm:w-auto">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative mt-4 sm:mt-0">
              <Image
                src="/svg-assets/landingpage/spout-wallstreet.png"
                alt="Stock Exchange Building"
                width={600}
                height={400}
                className="w-full h-auto rounded-none max-w-md mx-auto lg:max-w-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diagonal blue lines at bottom */}
      <div className="absolute bottom-0 w-full z-10 px-4 py-2">
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
