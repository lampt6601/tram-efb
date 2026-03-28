"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Gamepad2,
  Maximize2,
} from "lucide-react";
import { galleryMain, galleryThumb, galleryFull } from "@/lib/image-utils";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      // Only trigger if horizontal swipe is dominant and > 50px
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) onSwipeLeft();
        else onSwipeRight();
      }
      touchStart.current = null;
    },
    [onSwipeLeft, onSwipeRight],
  );

  return { onTouchStart, onTouchEnd };
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === selectedIndex) return;
      setIsLoading(true);
      setSelectedIndex(index);
    },
    [selectedIndex],
  );

  const nextImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      goTo(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
    },
    [goTo, selectedIndex, images.length],
  );

  const prevImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      goTo(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
    },
    [goTo, selectedIndex, images.length],
  );

  // Swipe handlers
  const swipeNext = useCallback(() => {
    goTo(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  }, [goTo, selectedIndex, images.length]);

  const swipePrev = useCallback(() => {
    goTo(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  }, [goTo, selectedIndex, images.length]);

  const mainSwipe = useSwipe(swipeNext, swipePrev);
  const fullscreenSwipe = useSwipe(swipeNext, swipePrev);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "Escape") setIsFullscreen(false);
    },
    [isFullscreen, prevImage, nextImage],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("hide-floating");
    } else {
      document.body.style.overflow = "auto";
      document.body.classList.remove("hide-floating");
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
      document.body.classList.remove("hide-floating");
    };
  }, [handleKeyDown, isFullscreen]);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center from-slate-100 to-slate-200">
        <Gamepad2 className="h-24 w-24 text-slate-300" />
      </div>
    );
  }

  const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
  const nextIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;

  return (
    <div className="flex flex-col gap-2 sm:gap-4">
      {/* Hidden preload images for prev/next */}
      {images.length > 1 && (
        <div className="hidden" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={galleryThumb(images[prevIndex])} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={galleryThumb(images[nextIndex])} alt="" />
        </div>
      )}

      {/* Main Image — swipeable on mobile */}
      <div
        className="group relative aspect-16/7 cursor-pointer overflow-hidden rounded-xl bg-slate-100 shadow-sm transition-all hover:shadow-md"
        onClick={() => setIsFullscreen(true)}
        onTouchStart={mainSwipe.onTouchStart}
        onTouchEnd={mainSwipe.onTouchEnd}
      >
        {/* Blur-up reveal — blurry/faded while loading, sharpens on load */}
        <Image
          key={selectedIndex}
          src={galleryMain(images[selectedIndex])}
          alt={`${title} - screenshot ${selectedIndex + 1}`}
          width={1600}
          height={700}
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            isLoading
              ? "scale-105 blur-md opacity-40"
              : "scale-100 blur-0 opacity-100"
          }`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          onLoad={() => setIsLoading(false)}
        />

        {/* Overlay hover hints */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
        <div className="absolute top-4 right-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <Maximize2 className="h-3.5 w-3.5" /> Phóng to
          </div>
        </div>

        {/* Inline Navigation — hidden on mobile (use swipe) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-black/60 group-hover:translate-x-0 group-hover:opacity-100 hidden sm:flex"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-black/40 p-2 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-black/60 group-hover:translate-x-0 group-hover:opacity-100 hidden sm:flex"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dot indicators on mobile (≤7 images) */}
        {images.length > 1 && images.length <= 7 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === selectedIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

      </div>

      {/* Thumbnail Carousel — hidden on mobile to save space */}
      {images.length > 1 && (
        <div className="hide-scrollbar hidden gap-2 overflow-x-auto py-2 scroll-smooth px-2 w-full max-w-full sm:flex">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative aspect-16/7 max-w-48 shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                selectedIndex === i
                  ? "ring-2 ring-indigo-600 ring-offset-2 opacity-100"
                  : "opacity-60 hover:opacity-100 hover:ring-2 hover:ring-indigo-300 hover:ring-offset-1"
              }`}
            >
              <Image
                src={galleryThumb(img)}
                alt={`${title} thumbnail ${i + 1}`}
                width={200}
                height={88}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox — swipeable */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          onTouchStart={fullscreenSwipe.onTouchStart}
          onTouchEnd={fullscreenSwipe.onTouchEnd}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-8 sm:top-8"
            aria-label="Close fullscreen"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative h-full w-full max-w-7xl px-0 py-16 sm:px-12">
            <div className="relative h-full w-full flex items-center justify-center">
              <Image
                key={`fs-${selectedIndex}`}
                src={galleryFull(images[selectedIndex])}
                alt={`${title} fullscreen ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                quality={90}
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:left-8"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:right-8"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
