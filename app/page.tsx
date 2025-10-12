import BgGrain from "@/components/bg-grain-svg";
import {
  HeroSection,
  FeaturesSection,
  ProofOfReserveSection,
  ProofOfReserveCards,
  InvestmentGradeSecuritySection,
  TransparentReservesSection,
  CallToActionSection,
  AnimatedFooterSection,
} from "@/components/features/root";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center relative">
      <BgGrain className="fixed inset-0 w-full h-full z-0" />
      {/* Hero Section */}
      <div className="relative z-10 w-full">
        <HeroSection />
      </div>

      {/* Proof of Reserve Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-neutral-800 to-emerald-800 overflow-hidden">
        <ProofOfReserveSection />

        <ProofOfReserveCards />

        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-emerald-200/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InvestmentGradeSecuritySection />
              <TransparentReservesSection />
            </div>
          </div>
        </div>

        <CallToActionSection />
      </section>

      {/* Features Section */}
      <div className="relative z-10 w-full">
        <FeaturesSection />
      </div>

      {/* Animated Footer */}
      <div className="relative z-10 w-full">
        <AnimatedFooterSection />
      </div>
    </div>
  );
}
