import BgGrain from "@/components/bg-grain-svg";
import {
  AnnouncementBar,
  HeroSection,
  HowSpoutWorks,
  ProofOfReserveLanding,
  UnlockingFinance,
  InvestmentDifferent,
  InTheNews,
  FAQSection,
  CTASection,
  AnimatedFooterSection,
} from "@/components/features/root";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <div className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center relative">
        <BgGrain className="fixed inset-0 w-full h-full z-0" />
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

      {/* Animated Footer */}
      <div className="relative z-10 w-full">
        <AnimatedFooterSection />
      </div>
      </div>
    </>
  );
}
