"use client";

import Image from "next/image";
import Link from "next/link";
import { DiagonalPattern } from "@/components/slant-dashes-svg";
import BgGrain from "@/components/bg-grain-svg";

export function InTheNews() {
  const newsItems = [
    {
      logo: "/svg-assets/landingpage/spout-ap.webp",
      publication: "AP News",
      date: "SEP 9, 2025",
      url: "https://apnews.com/press-release/globenewswire-mobile/onepiece-labs-solana-accelerator-officially-launches-f2e8e0a2478df30533933fdfe8f07a5e",
    },
    {
      logo: "/svg-assets/landingpage/spout-business-insder.svg",
      publication: "Business Insider",
      date: "SEP 9, 2025",
      url: "https://markets.businessinsider.com/news/stocks/onepiece-labs-solana-accelerator-officially-launches-1035128439",
    },
    {
      logo: "/svg-assets/landingpage/marketwatch-spout.webp",
      publication: "MarketWatch",
      date: "SEP 9, 2025",
      url: "https://www.marketwatch.com/press-release/onepiece-labs-solana-accelerator-officially-launches-7b06ee13?mod=search_headline",
    },
  ];

  return (
    <section className="w-full py-4 sm:py-6 lg:py-8 relative">
      {/* Background grain for this section */}
      <BgGrain className="absolute inset-0 w-full h-full z-0" />
      {/* Section content */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 pb-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-lora font-normal text-[#004040] mb-4 sm:mb-6">
            In the <span className="font-medium">News</span>
          </h2>
          <p className="text-base sm:text-lg font-noto-sans font-normal text-[#475569] max-w-3xl mx-auto leading-relaxed">
            Financial media outlets are highlighting our approach to secure,
            regulated
            <br />
            investing with real returns
          </p>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {newsItems.map((item, index) => (
            <div
              key={index}
              className="relative border border-gray-300 rounded-none"
            >
              {/* Top-left diamond */}
              <div className="absolute -left-2 sm:-left-3 -top-2 sm:-top-3 z-20">
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
              <div className="absolute -right-2 sm:-right-3 -top-2 sm:-top-3 z-20">
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
              <div className="absolute -left-2 sm:-left-3 -bottom-2 sm:-bottom-3 z-20">
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
              <div className="absolute -right-2 sm:-right-3 -bottom-2 sm:-bottom-3 z-20">
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

              {/* Card Content with rounded corners */}
              <div className="overflow-hidden rounded-none">
                {/* Logo Area */}
                <div className="h-32 sm:h-40 lg:h-48 flex bg-white items-center justify-center p-4 sm:p-6 lg:p-8">
                  <Image
                    src={item.logo}
                    alt={item.publication}
                    width={300}
                    height={120}
                    className="w-full h-auto max-h-20 sm:max-h-24 lg:max-h-32 object-contain"
                  />
                </div>

                {/* Publication Info */}
                <div className="p-3 sm:p-4 md:p-6 border-t border-gray-300 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 md:gap-4">
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 md:px-4 bg-blue-50 border border-blue-200 rounded text-[#004040] font-noto-sans text-xs sm:text-sm md:text-base font-medium hover:bg-blue-100 transition-colors flex-shrink-0"
                  >
                    <Image
                      src="/svg-assets/landingpage/spout-book.svg"
                      alt="Article"
                      width={20}
                      height={20}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                    {item.publication}
                  </Link>
                  <span className="text-xs sm:text-xs md:text-sm font-noto-sans text-[#475569] sm:ml-auto whitespace-nowrap">
                    {item.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
