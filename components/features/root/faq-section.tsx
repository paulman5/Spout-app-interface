"use client";

import { useState } from "react";
import { DiagonalPattern } from "@/components/slant-dashes-svg";
import BgGrain from "@/components/bg-grain-svg";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Spout bring traditional assets like bonds to DeFi?",
      answer: "Spout brings traditional assets like bonds to DeFi by tokenizing U.S. investment-grade ETFs into secure, yield-bearing tokens backed 1:1 by real assets.",
    },
    {
      question: "What guarantees that Spout tokens are secure and fully backed?",
      answer: "Every Spout token is backed 1:1 by investment-grade bond ETFs held by qualified U.S. custodians. We provide full transparency through on-chain proof-of-reserve verification, ensuring complete accountability and security for all tokenized assets.",
    },
    {
      question: "How can investors generate yield through Spout's platform?",
      answer: "Investors generate yield by holding Spout tokens, which accrue yield on price movement or dividends when attached to the underlying asset. The yield is distributed automatically to token holders. Spout tokens will be eligible to serve as collateral in the Spout lending market to efficiently borrow against your assets.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-20 relative">
      {/* Background grain for this section */}
      <BgGrain className="absolute inset-0 w-full h-full z-0" />
      {/* Section content */}
      <div className="w-full max-w-7xl mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Header */}
          <div>
            <div className="text-sm font-medium text-[#475569] mb-4 tracking-wider">
              [ FAQ ]
            </div>
            <h2 className="text-4xl lg:text-5xl font-lora font-normal text-[#004040] mb-6">
              Frequently asked<br />questions
            </h2>
            <p className="text-lg font-noto-sans font-normal text-[#475569] leading-relaxed">
              Everything you need to know about Spout and<br />how we're changing decentralized investing.
            </p>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-noto-sans font-medium text-[#004040] pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-[#004040] flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-5 pt-2 border-t border-gray-200">
                    <p className="text-base font-noto-sans text-[#475569] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagonal blue lines at bottom */}
      <div className="relative z-10 w-full mt-20">
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

