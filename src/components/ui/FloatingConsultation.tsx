"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { CONTACT_ZALO_GROUP_URL, CONTACT_MESSENGER_URL } from "@/lib/constants";
import zaloIcon from "@/assets/icons/zalo.png";
import facebookIcon from "@/assets/icons/facebook.webp";

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

  if (pathname?.startsWith("/admin")) {
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

      {/* Social Contacts - Bottom Right */}
      <div className="floating-consultation fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8 transition-opacity duration-300">
        {/* Zalo Section */}
        <div className="flex flex-col items-end gap-3">
          {/* Tooltip / Label */}
          <div className="animate-bounce rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:text-sm relative">
            Tư vấn miễn phí
            <div className="absolute -bottom-1 right-5 h-3 w-3 rotate-45 bg-blue-600"></div>
          </div>

          {/* Zalo Floating Button */}
          <a
            href={CONTACT_ZALO_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-blue-50 transition-all hover:scale-110 hover:ring-blue-100 active:scale-95 sm:h-16 sm:w-16 self-end"
            title="Tham gia Nhóm Zalo Tư Vấn"
          >
            <Image
              src={zaloIcon}
              alt="Zalo Group"
              className="h-9 w-9 object-contain transition-transform group-hover:scale-110 sm:h-11 sm:w-11"
            />

            {/* Pulse effect on Zalo */}
            <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-blue-400 opacity-20"></div>
          </a>
        </div>

        {/* Facebook Button */}
        <a
          href={CONTACT_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-blue-50 transition-all hover:scale-110 hover:ring-blue-100 active:scale-95 sm:h-16 sm:w-16"
          title="Liên hệ Facebook THC eFootball Shop"
        >
          <Image
            src={facebookIcon}
            alt="Facebook"
            className="h-9 w-9 object-contain transition-transform group-hover:scale-110 sm:h-11 sm:w-11"
          />
        </a>
      </div>
    </>
  );
}
