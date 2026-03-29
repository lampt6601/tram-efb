"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  distance?: "sm" | "md" | "lg";
}

const DISTANCE_MAP = {
  sm: "translate-y-4",
  md: "translate-y-8",
  lg: "translate-y-14",
};

// Shared IntersectionObserver — one observer for all ScrollReveal instances
let sharedObserver: IntersectionObserver | null = null;
const observedElements = new Map<Element, { delay: number }>();

function getSharedObserver() {
  if (sharedObserver) return sharedObserver;

  if (typeof window === "undefined") return null;

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const meta = observedElements.get(el);
          if (meta) {
            el.style.transitionDelay = `${meta.delay}ms`;
            el.dataset.visible = "true";
          }
          sharedObserver!.unobserve(el);
          observedElements.delete(el);
        }
      }
    },
    { threshold: 0.08 },
  );

  return sharedObserver;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = "md",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getSharedObserver();
    if (!observer) return;

    observedElements.set(el, { delay });
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      observedElements.delete(el);
    };
  }, [delay]);

  const translateClass =
    direction === "left"
      ? "-translate-x-8"
      : direction === "right"
        ? "translate-x-8"
        : DISTANCE_MAP[distance];

  return (
    <div
      ref={ref}
      data-visible="false"
      className={`w-full opacity-0 ${translateClass} transition-all duration-700 ease-out data-[visible=true]:opacity-100 data-[visible=true]:translate-x-0 data-[visible=true]:translate-y-0 ${className}`}
    >
      {children}
    </div>
  );
}
