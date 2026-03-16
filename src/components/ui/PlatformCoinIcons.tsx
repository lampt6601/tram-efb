"use client";

import { cn } from "@/lib/utils";

const ANDROID_GREEN = "#3DDC84";
const IOS_GRAY = "#555555";

interface PlatformIconProps {
  className?: string;
  size?: number;
}

/**
 * Android robot head icon — recognizable, coin-context (eFootball coins on Android).
 */
export function AndroidCoinIcon({ className, size = 18 }: PlatformIconProps) {
  const s = size;
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {/* Head — rounded rectangle (robot face) */}
      <rect
        x="5.5"
        y="7"
        width="13"
        height="11"
        rx="2.8"
        fill={ANDROID_GREEN}
      />
      {/* Antennae */}
      <path
        stroke={ANDROID_GREEN}
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
        d="M9.2 7.2V3.8 M14.8 7.2V3.8"
      />
      <circle cx="9.2" cy="2.8" r="1" fill={ANDROID_GREEN} />
      <circle cx="14.8" cy="2.8" r="1" fill={ANDROID_GREEN} />
      {/* Eyes */}
      <circle cx="9.5" cy="10.5" r="1.2" fill="#1a1a2e" />
      <circle cx="14.5" cy="10.5" r="1.2" fill="#1a1a2e" />
      {/* Smile */}
      <path
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="1"
        strokeLinecap="round"
        d="M9 14.2s1.2 1.1 3 1.1 3-1.1 3-1.1"
      />
    </svg>
  );
}

/**
 * Apple / iOS icon — minimal apple outline for coin-context (eFootball coins on iOS).
 */
export function IosCoinIcon({ className, size = 18 }: PlatformIconProps) {
  const s = size;
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        fill={IOS_GRAY}
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
  );
}
