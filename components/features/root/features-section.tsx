"use client";

import { Features } from "@/components/features";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { useScreenSize } from "@/hooks/use-screen-size";

export function FeaturesSection() {
  const screenSize = useScreenSize();
  return (
    <section className="relative py-24 overflow-hidden">
      <PixelTrail
        fadeDuration={1200}
        delay={300}
        pixelClassName="rounded-2xl bg-emerald-600/15"
        pixelSize={screenSize.lessThan("md") ? 40 : 60}
      />
      <Features />
    </section>
  );
}
