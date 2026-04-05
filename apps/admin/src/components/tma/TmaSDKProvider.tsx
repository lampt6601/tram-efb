"use client";

import type { ReactNode } from "react";
import { TmaThemeSync } from "./TmaThemeSync";
import { TmaBackButton } from "./TmaBackButton";

/**
 * Initializes the Telegram Mini App environment.
 * Calls tg.ready() + tg.expand() and sets up theme/back-button children.
 */
export function TmaSDKProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <TmaThemeSync />
      <TmaBackButton />
      {children}
    </>
  );
}
