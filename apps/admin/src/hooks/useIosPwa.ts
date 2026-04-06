"use client";

import { useEffect, useState } from "react";

/**
 * Detects if the app is running as an iOS PWA (standalone mode).
 * Adds `is-ios-pwa` class to <body> for CSS-level adaptations.
 */
export function useIosPwa() {
  const [isIosPwa, setIsIosPwa] = useState(false);

  useEffect(() => {
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone =
      ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;

    const result = isIos && isStandalone;
    setIsIosPwa(result);

    if (result) {
      document.body.classList.add("is-ios-pwa");
    }

    return () => {
      document.body.classList.remove("is-ios-pwa");
    };
  }, []);

  return isIosPwa;
}
