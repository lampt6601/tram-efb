"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const TMA_ROOT_PATHS = ["/tma/dashboard", "/tma/loading"];

/**
 * Manages the Telegram native back button.
 * Shows the back button on non-root TMA pages and navigates on click.
 */
export function TmaBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const isRoot = TMA_ROOT_PATHS.some(
    (p) => pathname === p || pathname === p + "/",
  );

  useEffect(() => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (!backButton) return;
    if (isRoot) {
      backButton.hide();
    } else {
      backButton.show();
    }
  }, [isRoot]);

  useEffect(() => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (!backButton) return;
    const handleClick = () => router.back();
    backButton.onClick(handleClick);
    return () => backButton.offClick(handleClick);
  }, [router]);

  return null;
}
