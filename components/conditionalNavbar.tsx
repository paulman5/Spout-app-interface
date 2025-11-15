"use client";

import Navbar from "@/components/navBar";
import { usePathname } from "next/navigation";
import { AnimatedFooterSection } from "./features/root";

export function ConditionalNavbar() {
  const pathname = usePathname();

  // Hide navbar when in /app routes
  if (pathname?.startsWith("/app") || pathname?.startsWith("/auth")) {
    return null;
  }

  return <Navbar />;
}

export function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer when in /app routes
  if (pathname?.startsWith("/app") || pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <div className="relative z-10 w-full">
      <AnimatedFooterSection />
    </div>
  );
}
