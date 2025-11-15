import {
  CTASection,
  FAQSection,
  HeroSection,
  HowSpoutWorks,
  InTheNews,
  InvestmentDifferent,
  ProofOfReserveLanding,
  UnlockingFinance,
} from "@/components/features/root";

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center relative">
        {/* Vertical lines on both sides - hidden on mobile */}
        <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
          {/* Left vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-[1.5px] bg-[#A7C6ED]"></div>
          {/* Right vertical line */}
          <div className="absolute right-4 top-0 bottom-0 w-[1.5px] bg-[#A7C6ED]"></div>
        </div>
        {/* Hero Section */}
        <div className="relative z-10 w-full">
          <HeroSection />
        </div>

        {/* How Spout Works Section */}
        <div className="relative z-10 w-full">
          <HowSpoutWorks />
        </div>

        {/* Proof of Reserve Section */}
        <div className="relative z-10 w-full">
          <ProofOfReserveLanding />
        </div>

        {/* Unlocking Finance Section */}
        <div className="relative z-10 w-full">
          <UnlockingFinance />
        </div>

        {/* Investment Different Section */}
        <div className="relative z-10 w-full">
          <InvestmentDifferent />
        </div>

        {/* In The News Section */}
        <div className="relative z-10 w-full">
          <InTheNews />
        </div>

        {/* FAQ Section */}
        <div className="relative z-10 w-full">
          <FAQSection />
        </div>

        {/* CTA Section */}
        <div className="relative z-10 w-full">
          <CTASection />
        </div>
      </div>
    </>
  );
}
