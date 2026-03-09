"use client";

import { useEffect, useRef, useState } from "react";

export function AutoScrollSlider({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (isHovered || isInteracting) return;

    const interval = setInterval(() => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        // We reached the end, go back to start
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Scroll right by roughly one card width
        // The snap-x property will smoothly snap it to the exact card
        el.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, isInteracting]);

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => {
        // Delay resuming scroll after touch ends
        setTimeout(() => setIsInteracting(false), 2000);
      }}
      className="flex w-full gap-4 sm:gap-0 snap-x snap-mandatory overflow-x-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {children}
    </div>
  );
}
