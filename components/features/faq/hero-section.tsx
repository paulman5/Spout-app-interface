"use client";

import { DiagonalPattern } from "@/components/slant-dashes-svg";
// export const metadata = {
//   title: "FAQ - Spout",
//   description:
//     "Frequently Asked Questions about Spout's services, features, and offerings. Find answers to common queries and learn more about how Spout can help you achieve your financial goals.",
// };

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
      "Spout brings traditional assets like bonds to DeFi by tokenizing U.S. investment-grade ETFs into secure, yield-bearing tokens backed 1:1 by real assets.",
  },
  {
    question: "How does Spout handle off-hour market liquidations?",
    answer: "",
  },
  {
    question:
      "How can I integrate Spout's stablecoin into other DeFi protocols?",
    answer: "",
  },
  {
    question: "How does Spout tokenize U.S. stocks, ETFs, and bonds?",
    answer: "",
  },
  {
    question: "What is the benefit of using Spout's tokenized assets in DeFi?",
    answer: "",
  },
  {
    question: "How do I get started with Spout?",
    answer: "",
  },
  {
    question: "Is Spout compliant with U.S. regulations?",
    answer: "",
  },
  {
    question: "What privacy features does Spout offer?",
    answer: "",
  },
  {
    question: "Can I use Spout's assets as collateral for lending?",
    answer: "",
  },
  {
    question: "What is the process for minting Spout's stablecoin?",
    answer: "",
  },
  {
    question:
      "How are collateralization rates determined for different assets?",
    answer: "",
  },
  {
    question: "What chains does Spout support?",
    answer: "",
  },
  {
    question: "How does Spout verify asset backing and reserves?",
    answer: "",
  },
  {
    question:
      "What yield opportunities does Spout provide for tokenized assets?",
    answer: "",
  },
  {
    question: "Can users from emerging markets access Spout?",
    answer: "",
  },
];

export default function HeroSection() {
  const [openItem, setOpenItem] = useState<string>("item-0");

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="relative z-10">
        {/* Vertical lines on both sides - hidden on mobile */}
        <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
          {/* Left vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-[1.5px] bg-[#A7C6ED]"></div>
          {/* Right vertical line */}
          <div className="absolute right-4 top-0 bottom-0 w-[1.5px] bg-[#A7C6ED]"></div>
        </div>

        <main className="relative">
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
          <div className="relative z-10 w-full px-4 py-2">
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

          <div className="relative py-12">
            {/* Diagonal pattern */}
            <div className="relative z-10 w-full px-4 py-2">
              <DiagonalPattern
                width="100%"
                height={34}
                color="#A7C6ED"
                strokeWidth={1.5}
                spacing={14}
              />
            </div>

            <section className="px-6 md:px-12 lg:px-24 pt-12">
              <div className="max-w-6xl mx-auto">
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

          <div className="relative mt-16">
            <div className="absolute top-0 left-0 w-full h-px bg-spout-accent"></div>
            <div className="absolute top-0 left-2.5 w-2.5 h-2.5 rotate-45 border-2 border-spout-accent bg-white"></div>
            <div className="absolute top-0 right-2.5 w-2.5 h-2.5 rotate-45 border-2 border-spout-accent bg-white"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
