"use client";

import Image from "next/image";
import Link from "next/link";
import { DiagonalPattern } from "@/components/slant-dashes-svg";
import BgGrain from "@/components/bg-grain-svg";

export function UnlockingFinance() {
  return (
    <section className="w-full py-4 sm:py-6 lg:py-8 relative">
      {/* Background grain for this section */}
      <BgGrain className="absolute inset-0 w-full h-full z-0" />
      {/* Section content */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-lora font-normal text-[#004040] mb-4 sm:mb-6">
            Unlocking <span className="font-medium">Finance</span> with DeFi
            <br />
            through our stablecoin
          </h2>
          <p className="text-base sm:text-lg font-noto-sans font-normal text-[#475569] leading-relaxed">
            Expand access to traditional assets with security, transparency, and
            real yield on-chain.
          </p>
          <p className="text-base sm:text-lg font-noto-sans font-normal text-[#475569] leading-relaxed">
            Global access, real yield, full transparency, built for DeFi.
          </p>
        </div>

        {/* Cards Section */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 mb-6 sm:mb-8 lg:mb-12">
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

          {/* Top-middle diamond */}
          <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 -top-2 sm:-top-3 z-20">
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

          {/* Bottom-middle diamond */}
          <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 -bottom-2 sm:-bottom-3 z-20">
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
              className="text-blue-400 sm:w-6 sm:h-6"
            >
              <path
                d="M12 2L22 12L12 22L2 12L12 2Z"
                stroke="currentColor"
                strokeWidth="3"
                fill="white"
              />
            </svg>
          </div>

          {/* DeFi Integration Benefits Card */}
          <div className="border bg-white border-gray-300 rounded-l-none sm:rounded-l-none rounded-r-none sm:rounded-r-none p-4 sm:p-6 lg:p-8 relative">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#004040]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-noto-sans font-semibold text-[#004040]">
                DeFi Integration Benefits
              </h3>
            </div>

            <p className="text-sm sm:text-base font-noto-sans font-normal text-[#475569] mb-4 sm:mb-6 leading-relaxed">
              DeFi expands access to traditional assets by enabling
              security-backed lending and diversified exposure, unlocking
              opportunities while bridging traditional and decentralized
              markets.
            </p>

            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 lg:mb-0">
              <li className="flex items-center gap-2 text-xs sm:text-sm font-noto-sans text-[#475569]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400"></div>
                Security-backed lending
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm font-noto-sans text-[#475569]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400"></div>
                Multi-asset exposure
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm font-noto-sans text-[#475569]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400"></div>
                Access to real yield
              </li>
            </ul>

            {/* Benefits icon */}
            <div className="flex justify-center lg:absolute lg:bottom-6 lg:right-6">
              <Image
                src="/svg-assets/defi-integration-benefits.svg"
                alt="Benefits"
                width={180}
                height={180}
                className="w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40"
              />
            </div>
          </div>

          {/* DeFi Security & Transparency Card */}
          <div className="border-t sm:border-t border-r border-b border-l-0 sm:border-l-0 bg-white border-gray-300 rounded-r-none sm:rounded-r-none rounded-l-none sm:rounded-l-none p-4 sm:p-6 lg:p-8 relative">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Image
                src="/svg-assets/defi-security-transparency.svg"
                alt="Lock"
                width={24}
                height={24}
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
              <h3 className="text-lg sm:text-xl font-noto-sans font-semibold text-[#004040]">
                DeFi Security & Transparency
              </h3>
            </div>

            <p className="text-sm sm:text-base font-noto-sans font-normal text-[#475569] mb-4 sm:mb-6 leading-relaxed">
              DeFi combines strong safeguards with full transparency, ensuring
              all assets are protected and fully verifiable while building
              lasting trust and unlocking new opportunities in finance.
            </p>

            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 lg:mb-0">
              <li className="flex items-center gap-2 text-xs sm:text-sm font-noto-sans text-[#475569]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400"></div>
                Institutional-grade asset protection
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm font-noto-sans text-[#475569]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400"></div>
                Transparent on-chain verification
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm font-noto-sans text-[#475569]">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400"></div>
                Continuous independent audits
              </li>
            </ul>

            {/* Lock icon */}
            <div className="flex justify-center lg:absolute lg:bottom-3 lg:right-6">
              <Image
                src="/svg-assets/security-lock.svg"
                alt="Lock"
                width={160}
                height={160}
                className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36"
              />
            </div>
          </div>
        </div>

        {/* View Reserve Details Button */}
        <div className="flex justify-start">
          <Link
            href="/app/proof-of-reserve"
            className="inline-flex bg-white p-2 sm:p-3 border rounded-md border-gray-300 items-center gap-1 sm:gap-2 text-[#004040] font-semibold text-sm sm:text-base hover:text-[#003030] transition-colors"
          >
            View Reserve Details
            {/* make it use react icons */}
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Diagonal blue lines at bottom */}
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
