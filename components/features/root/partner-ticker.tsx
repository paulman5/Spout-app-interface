"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const partners = [
  {
    src: "/partners/chainlink-logo.svg",
    alt: "Chainlink",
    link: "https://chain.link/",
  },
  {
    src: "/partners/inco-logo.svg",
    alt: "Inco",
    link: "https://www.inco.org/",
  },
  {
    src: "/partners/blocksense-logo.svg",
    alt: "Blocksense",
    link: "https://blocksense.network/",
  },
  {
    src: "/partners/circle-logo.svg",
    alt: "Circle",
    link: "https://circle.com/",
  },
  {
    src: "/partners/solana-logo.svg",
    alt: "Solana",
    link: "https://solana.org/",
  },
  {
    src: "/partners/ripple-logo.svg",
    alt: "Ripple",
    link: "https://ripple.com/",
  },
  {
    src: "/partners/Pharos.svg",
    alt: "Pharos",
    link: "https://pharosnetwork.xyz/",
  },
  // {
  //   src: "/partners/faroswap-full.svg",
  //   alt: "Faroswap",
  //   link: "https://faroswap.xyz/",
  // }
];

export function PartnerTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<number>(0);
  const segmentWidthRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const speed = 0.6; // px per frame

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const updateSegmentWidth = () => {
      if (contentRef.current) {
        // We rendered partners array 3 times → one segment is 1/3 of total width
        segmentWidthRef.current = contentRef.current.scrollWidth / 3;
      }
    };
    updateSegmentWidth();
    window.addEventListener("resize", updateSegmentWidth);

    // Pause animation when ticker not in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.1 },
    );
    if (tickerRef.current) observer.observe(tickerRef.current);

    let frame: number;
    const animate = () => {
      if (
        !prefersReducedMotion &&
        !isPaused &&
        isVisibleRef.current &&
        tickerRef.current
      ) {
        let next = offsetRef.current - speed;
        const segment = segmentWidthRef.current || 0;
        if (segment > 0 && Math.abs(next) >= segment) {
          next = 0; // reset to start of first segment
        }
        offsetRef.current = next;
        // Avoid React state updates; mutate style directly for smoothness
        tickerRef.current.style.transform = `translate3d(${next}px,0,0)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateSegmentWidth);
      if (tickerRef.current) observer.disconnect();
    };
  }, [isPaused]);

  return (
    <div className="w-full rounded-lg border border-gray-300 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center">
        {/* Fixed "Compatible With Leading Networks" box */}
        <div className="bg-white rounded-t-lg sm:rounded-l-lg sm:rounded-t-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b sm:border-b-0 sm:border-r border-gray-300 flex-shrink-0 w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-noto-sans text-[#334155] font-semibold text-center leading-tight">
            Compatible With
            <br />
            Leading Networks
          </h3>
        </div>

        {/* Animated partner logos */}
        <div
          className="flex-1 overflow-hidden bg-white"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={tickerRef}
            className="flex items-center will-change-transform"
            style={{ transform: "translate3d(0,0,0)" }}
          >
            <div ref={contentRef} className="flex items-center shrink-0">
              {/* Duplicate the partners array for seamless loop */}
              {[...partners, ...partners, ...partners].map((partner, idx) => (
                <Link
                  key={idx}
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded group"
                  aria-label={partner.alt}
                >
                  <div className="bg-white px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 border-r border-gray-200 transition-all duration-300 ease-out flex items-center justify-center min-w-[140px] sm:min-w-[160px] lg:min-w-[180px] hover:bg-gray-50 relative">
                    <Image
                      src={partner.src}
                      alt={partner.alt}
                      width={80}
                      height={80}
                      className="h-10 sm:h-12 lg:h-14 w-auto max-w-[100px] sm:max-w-[120px] lg:max-w-[140px] object-contain transition-all duration-300 ease-out group-hover:scale-105"
                      draggable={false}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
