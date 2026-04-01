"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({
  fallbackHref = "/",
  children,
  className,
}: {
  fallbackHref?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
