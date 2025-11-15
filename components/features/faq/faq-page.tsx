"use client";

import BgGrain from "@/components/bg-grain-svg";
import { DiagonalPattern } from "@/components/slant-dashes-svg";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqData = [
  {
    question: "How does Spout bring traditional assets like bonds to DeFi?",
    answer:
      "Spout brings traditional assets like bonds to DeFi by tokenizing U.S. investment-grade ETFs into secure, yield-bearing tokens backed 1:1 by real assets. Our platform converts institutional-quality bonds into blockchain-native tokens that maintain their yield characteristics while gaining DeFi liquidity. Each token is fully collateralized by the underlying bond ETF held in secure custody.",
  },
  {
    question: "How does Spout handle off-hour market liquidations?",
    answer:
      "Spout uses an advanced market-aware algorithm that adjusts collateral requirements and liquidation thresholds based on real-time market conditions. During off-hours, our system maintains enhanced liquidity pools and utilizes cross-chain bridges to ensure positions can be liquidated fairly even when traditional markets are closed. Our protocol also features a delay mechanism to prevent cascading liquidations.",
  },
  {
    question:
      "How can I integrate Spout's stablecoin into other DeFi protocols?",
    answer:
      "Spout tokens are fully compatible with standard ERC-20 and major DeFi protocols including Uniswap, Aave, and Curve. You can use our REST API or smart contract interfaces to integrate directly. We provide comprehensive documentation and SDKs for popular languages. Integration typically takes 2-4 hours for standard use cases, and our developer team is available for custom implementations.",
  },
  {
    question: "How does Spout tokenize U.S. stocks, ETFs, and bonds?",
    answer:
      "Our tokenization process involves acquiring investment-grade securities, holding them in segregated custody accounts, and issuing 1:1 backed tokens on the blockchain. Each token represents a claim on the underlying asset. For stocks and ETFs, we use institutional custodians regulated by the SEC. Bonds are stored with DTCC-approved depositories. The entire process is audited monthly by independent third parties.",
  },
  {
    question: "What is the benefit of using Spout's tokenized assets in DeFi?",
    answer:
      "Tokenized assets on Spout provide 24/7 liquidity, instant settlement, yield generation from underlying assets, and access to DeFi composability. Unlike traditional finance, you can use your positions as collateral, lend them out for additional yield, or trade them on secondary markets without waiting for market hours. Our tokens maintain stable yield regardless of crypto market volatility.",
  },
  {
    question: "How do I get started with Spout?",
    answer:
      "Getting started is simple: create an account at spout.finance, complete KYC verification (takes 10-15 minutes), connect your wallet, and deposit USD or USDC. You can then mint Spout tokens by selecting your desired asset and collateral amount. Our onboarding includes guided tutorials, live support, and a testnet environment to practice before using mainnet.",
  },
  {
    question: "Is Spout compliant with U.S. regulations?",
    answer:
      "Yes, Spout operates in full compliance with U.S. securities and financial regulations. We are registered with relevant regulatory bodies and maintain partnerships with licensed custodians and institutional service providers. All tokenized assets are held in regulated custody, and our smart contracts are regularly audited. We adhere to AML/KYC requirements for all users.",
  },
  {
    question: "What privacy features does Spout offer?",
    answer:
      "Spout balances privacy with regulatory compliance. On-chain transactions are pseudonymous using your wallet address, while KYC data is encrypted and stored separately. We implement privacy-preserving cross-chain bridges and support privacy-focused wallets. However, as a regulated platform, we maintain transaction records required by law while never sharing personal data with third parties without explicit consent.",
  },
  {
    question: "Can I use Spout's assets as collateral for lending?",
    answer:
      "Absolutely. Spout tokens are accepted as collateral on lending protocols like Aave and Compound. You can deposit your tokens as collateral and borrow against them while still earning yield on the underlying assets. Our liquidation parameters are conservative to protect borrowers from sudden depegging, and we maintain a liquidation reserve fund to ensure protocol stability.",
  },
  {
    question: "What is the process for minting Spout's stablecoin?",
    answer:
      "To mint Spout tokens, deposit your collateral (USDC or USD) into our smart contract, which is held securely. The protocol verifies collateral sufficiency, and your tokens are minted at a 1:1 ratio to the underlying asset value. Minting is instant and costs only the blockchain gas fee (typically $2-10 on Ethereum). You can unmint at any time by sending tokens back to the protocol.",
  },
  {
    question:
      "How are collateralization rates determined for different assets?",
    answer:
      "Collateralization rates are determined by risk assessment algorithms that consider asset volatility, market liquidity, and custody risk. Investment-grade bonds have minimum collateralization of 110%, while blue-chip stocks require 130%. Our oracle system updates rates every 4 hours based on real-time market data from multiple sources. Users are always notified 48 hours before any rate changes.",
  },
  {
    question: "What chains does Spout support?",
    answer:
      "Spout is currently live on Ethereum mainnet and Polygon, with Beta support on Arbitrum and Optimism. We're actively developing support for Solana and Avalanche, with mainnet launch expected in Q2. Our cross-chain bridge technology allows seamless asset movement between supported networks with minimal fees (0.05% average).",
  },
  {
    question: "How does Spout verify asset backing and reserves?",
    answer:
      "Spout maintains 100% backing for all issued tokens, verified through monthly third-party audits by Big Four accounting firms. We publish real-time attestations on-chain showing reserve balances updated daily. Users can verify backing through our transparency portal, which displays custody proofs, audit reports, and reserve data. We also participate in periodic multi-sig reconciliations with custodians.",
  },
  {
    question:
      "What yield opportunities does Spout provide for tokenized assets?",
    answer:
      "Spout tokens automatically earn yields from the underlying assets—typically 4-6% annually for bonds and 2-4% for dividend-paying stocks. Additional yields come from lending through DeFi protocols (5-12%), liquidity mining rewards (10-20%), and governance token distributions. Composite yields can reach 15-25% annually for active users managing multiple positions.",
  },
  {
    question: "Can users from emerging markets access Spout?",
    answer:
      "Spout is accessible globally with some regional restrictions due to local regulations. Users from most countries can participate in our platform. However, certain high-risk jurisdictions (OFAC sanctioned countries) are restricted for regulatory compliance. We're working with local regulators to expand access. All users must complete KYC verification regardless of location, in accordance with international AML standards.",
  },
];

export default function FaqPage() {
  const [openItem, setOpenItem] = useState<string>("item-0");

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background grain for this section */}
      <BgGrain
        className="absolute inset-0 w-full h-full"
        style={{
          zIndex: 1,
        }}
      />
      <div className="relative z-50">
        {/* top horizontal line  - hidden on mobile*/}
        <div className="hidden md:block absolute top-0 left-0 w-full h-[1.5px] bg-[#A7C6ED]"></div>
        {/* top right diamond */}
        <div className="hidden lg:block absolute -top-2 right-2 z-20">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-300"
          >
            <path
              d="M12 2L22 12L12 22L2 12L12 2Z"
              stroke="currentColor"
              strokeWidth="3"
              fill="white"
            />
          </svg>
        </div>
        {/* top left diamond */}
        <div className="hidden lg:block absolute -top-2 left-2 z-20">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-300"
          >
            <path
              d="M12 2L22 12L12 22L2 12L12 2Z"
              stroke="currentColor"
              strokeWidth="3"
              fill="white"
            />
          </svg>
        </div>
        {/* Vertical lines on both sides - hidden on mobile */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
          {/* Left vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-[1.5px] bg-[#A7C6ED]"></div>
          {/* Right vertical line */}
          <div className="absolute right-4 top-0 bottom-0 w-[1.5px] bg-[#A7C6ED]"></div>
        </div>

        <main className="relative font-noto-sans">
          <section className="py-16 px-6 md:px-12 lg:px-24 relative">
            {/* Background grid pattern - only for hero area */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:35px_35px]"></div>

            <div className="max-w-7xl mx-auto text-center">
              <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-[3px] bg-spout-accent/35 mb-8">
                <span className="text-base font-medium text-spout-text-secondary">
                  FAQs
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-normal text-spout-primary font-lora leading-tight mb-6">
                Frequently asked questions
              </h1>

              <p className="text-lg text-spout-text-muted max-w-2xl mx-auto leading-7">
                Everything you need to know about Spout and how we're changing
                decentralized investing.
              </p>
            </div>
          </section>

          {/* Diagonal pattern */}
          <div className="relative z-10 w-full px-4 py-2 overflow-hidden">
            <DiagonalPattern
              width="100%"
              height={34}
              color="#A7C6ED"
              strokeWidth={1.5}
              spacing={14}
            />
          </div>

          <div className="relative py-12">
            <section className="px-6 md:px-12 lg:px-24 pt-12">
              <div className="max-w-3xl mx-auto">
                <Accordion
                  type="single"
                  collapsible
                  value={openItem}
                  onValueChange={setOpenItem}
                >
                  {faqData.map((faq, index) => {
                    const isOpen = openItem === `item-${index}`;
                    return (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className={`border border-spout-border mb-px last:mb-0 ${isOpen ? "bg-white" : "bg-[#FFFDFB]"}`}
                      >
                        <AccordionTrigger className="px-8 py-5 text-lg font-medium text-black text-left hover:no-underline [&>svg]:hidden">
                          <div className="flex items-center justify-between w-full">
                            <span className="pr-4">{faq.question}</span>
                            <ChevronDown
                              className={`h-6 w-6 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </div>
                        </AccordionTrigger>
                        {faq.answer && (
                          <AccordionContent className="px-8 pb-5 pt-3 text-base font-medium text-spout-text-muted leading-7">
                            {faq.answer}
                          </AccordionContent>
                        )}
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </section>
          </div>

          {/* Diagonal pattern */}
          <div className="relative z-10 w-full px-4 py-2 overflow-hidden">
            <DiagonalPattern
              width="100%"
              height={34}
              color="#A7C6ED"
              strokeWidth={1.5}
              spacing={14}
            />
          </div>

          <div className="relative py-20">
            <section className="px-6 md:px-12 lg:px-24 2xl:px-28">
              <div className="max-w-6xl lg:max-w-max mx-auto">
                <div className="relative border-2 border-spout-border bg-white/40 rounded-sm">
                  <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 rotate-45 border-2 border-spout-accent bg-white z-10"></div>
                  <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rotate-45 border-2 border-spout-accent bg-white z-10"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 rotate-45 border-2 border-spout-accent bg-white z-10"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 rotate-45 border-2 border-spout-accent bg-white z-10"></div>

                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="p-10 lg:p-14 flex flex-col justify-center">
                      <h2 className="text-3xl font-semibold text-spout-primary mb-5 leading-tight">
                        Ready to Start Earning Stable Yields?
                      </h2>
                      <p className="text-lg text-spout-text-muted leading-7 mb-8">
                        Join thousands of users who are already earning
                        consistent returns from investment-grade corporate bonds
                        on the blockchain.
                      </p>
                      <button className="inline-flex items-center gap-3 px-5 py-2.5 rounded border border-spout-accent bg-spout-primary text-white text-xl font-medium hover:bg-spout-primary/90 transition-colors w-fit">
                        Get Started
                        <ArrowRight className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="relative ">
                      <div className="absolute -top-1.5 -left-1 w-2.5 h-2.5 rotate-45 border-2 border-spout-accent bg-white hidden lg:block"></div>
                      <div className="absolute -bottom-1.5 -left-1 w-2.5 h-2.5 rotate-45 border-2 border-spout-accent bg-white hidden lg:block"></div>
                      <img
                        src="/bank_image.png"
                        alt="Financial building"
                        className="w-full h-full object-cover border-2 border-spout-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
        {/* Diagonal pattern */}
        <div className="relative z-40 w-full px-4 py-2 overflow-hidden">
          <DiagonalPattern
            width="100%"
            height={34}
            color="#A7C6ED"
            strokeWidth={1.5}
            spacing={14}
          />
        </div>
      </div>
    </div>
  );
}
