"use client";

import { useIosPwa } from "@/hooks/useIosPwa";

/**
 * iOS PWA status bar background overlay.
 * Renders a translucent background behind the iOS status bar so text/icons
 * don't overlap with app content. Only renders in iOS PWA standalone mode.
 *
 * Uses the theme background color to blend seamlessly with the app.
 */
export function IosPwaProvider() {
  const isIosPwa = useIosPwa();

  if (!isIosPwa) return null;

  return (
    <div
      aria-hidden
      className="bg-status-bar bg-slate-50/90 backdrop-blur-md dark:bg-slate-950/90"
    />
  );
}
