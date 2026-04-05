"use client";

import { useEffect } from "react";

/**
 * Syncs the Telegram Mini App color scheme (dark/light) with the app's
 * Tailwind dark mode class. Listens for themeChanged events to keep in sync.
 */
export function TmaThemeSync() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Signal Telegram that the app is ready and expand to full height
    tg.ready();
    tg.expand();

    const apply = () => {
      if (tg.colorScheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    apply();
    tg.onEvent("themeChanged", apply);
    return () => tg.offEvent("themeChanged", apply);
  }, []);

  return null;
}
