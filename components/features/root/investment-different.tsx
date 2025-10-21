"use client";

import Image from "next/image";
import { DiagonalPattern } from "@/components/slant-dashes-svg";
import BgGrain from "@/components/bg-grain-svg";
import lockIcon from "@/components/svg-assets/landingpage/lock.svg";
import securitySafeIcon from "@/components/svg-assets/landingpage/security-safe.svg";
import flashIcon from "@/components/svg-assets/landingpage/flash.svg";
import keyIcon from "@/components/svg-assets/landingpage/key.svg";

export function InvestmentDifferent() {
  const features = [
    {
      icon: lockIcon,
      title: "Privacy Protection",
      description: "Confidential transactions with encrypted data",
      badges: ["Encrypted data", "Private transfers"],
    },
    {
      icon: securitySafeIcon,
      title: "Regulated Assets",
      description: "Backed by real corporate debt obligations",
      badges: ["SEC Compliant", "FDIC protected"],
    },
    {
      icon: flashIcon,
      title: "Instant Liquidity",
      description: "Trade tokens 24/7 on decentralized exchanges",
      badges: ["No Lock-up Period", "24/7 Trading"],
    },
    {
      icon: keyIcon,
      title: "Confidential Assets",
      description: "Protected identity and private records",
      badges: ["Secure handling", "Private layers"],
    },
  ];

  return (
    <section className="w-full py-20 relative">
      {/* Background grain for this section */}
      <BgGrain className="absolute inset-0 w-full h-full z-0" />
      {/* Section content */}
      <div className="w-full max-w-[1800px] mx-auto px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-lora font-normal text-[#004040] mb-6">
            How we do <span className="font-medium">Investment</span> different
          </h2>
          <p className="text-lg font-noto-sans font-normal text-[#475569] max-w-4xl mx-auto leading-relaxed">
            Consistent 5-8% returns from regulated corporate debt, with instant trading<br />
            and full transparency
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 mb-12">
          {/* Top-left diamond */}
          <div className="hidden lg:block absolute -left-3 -top-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Top-middle diamond 1 (25%) */}
          <div className="hidden lg:block absolute left-[25%] -translate-x-1/2 -top-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Top-middle diamond 2 (50%) */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 -top-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Top-middle diamond 3 (75%) */}
          <div className="hidden lg:block absolute left-[75%] -translate-x-1/2 -top-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Top-right diamond */}
          <div className="hidden lg:block absolute -right-3 -top-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Bottom-left diamond */}
          <div className="hidden lg:block absolute -left-3 -bottom-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Bottom-middle diamond 1 (25%) */}
          <div className="hidden lg:block absolute left-[25%] -translate-x-1/2 -bottom-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Bottom-middle diamond 2 (50%) */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 -bottom-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Bottom-middle diamond 3 (75%) */}
          <div className="hidden lg:block absolute left-[75%] -translate-x-1/2 -bottom-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Bottom-right diamond */}
          <div className="hidden lg:block absolute -right-3 -bottom-3 z-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-300">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`border bg-white border-gray-300 p-6 rounded-none lg:rounded-none flex flex-col ${
                index === 0 ? 'lg:rounded-l-lg' : 
                index === features.length - 1 ? 'lg:rounded-r-lg' : 
                ''
              } ${
                index !== features.length - 1 ? 'lg:border-r-0' : ''
              }`}
            >
              {/* Icon and Title */}
              <div className="flex items-start gap-3 mb-4">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <h3 className="text-lg font-noto-sans font-semibold text-[#004040]">
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm font-noto-sans font-normal text-[#475569] mb-4 leading-relaxed flex-grow">
                {feature.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {feature.badges.map((badge, badgeIndex) => (
                  <span
                    key={badgeIndex}
                    className="px-3 py-1 text-xs font-medium text-[#004040] bg-blue-50 border border-blue-200 rounded"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagonal blue lines at bottom */}
      <div className="relative z-10 w-full mt-10">
        <DiagonalPattern 
          width="100%" 
          height={34} 
          color="#A7C6ED" 
          strokeWidth={2} 
          spacing={14} 
        />
      </div>
    </section>
  );
}

