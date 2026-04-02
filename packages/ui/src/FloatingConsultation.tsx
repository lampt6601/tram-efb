"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

export function FloatingConsultation() {
  const pathname = usePathname();
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/accounts/")) {
    return null;
  }

  return (
    <>
      {/* Scroll to top - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50 sm:bottom-8 sm:left-8">
        <div
          className={`transition-all duration-300 ${
            showScroll
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0 pointer-events-none hidden"
          }`}
        >
          <button
            onClick={scrollToTop}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg transition-all hover:bg-slate-700 hover:scale-110 active:scale-95 sm:h-14 sm:w-14"
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
          >
            <ArrowUp className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </>
  );
}
