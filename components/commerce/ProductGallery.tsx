"use client";

import { useRef, useState } from "react";

const SWIPE_COMMIT_THRESHOLD = 15; // % of track width a drag must cross to change slides

/**
 * Swipeable product image carousel with a clickable thumbnail strip (audit F3 —
 * the previous static gallery rendered thumbnails with no way to actually view
 * them). Dragging the hero image follows the pointer 1:1 via a live transform;
 * releasing past SWIPE_COMMIT_THRESHOLD commits to the next/previous slide,
 * otherwise it snaps back. Left/right arrow keys give keyboard users the same
 * navigation the drag gives touch/mouse users, and thumbnails are real buttons
 * so all three input styles land on the same `index` state.
 */
export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
  const [index, setIndex] = useState(0);
  const [dragPercent, setDragPercent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(images.length - 1, next)));
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (images.length <= 1) return;
    dragStartX.current = event.clientX;
    setIsDragging(true);
    trackRef.current?.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!isDragging) return;
    const width = trackRef.current?.clientWidth || 1;
    setDragPercent(((event.clientX - dragStartX.current) / width) * 100);
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragPercent <= -SWIPE_COMMIT_THRESHOLD) goTo(index + 1);
    else if (dragPercent >= SWIPE_COMMIT_THRESHOLD) goTo(index - 1);
    setDragPercent(0);
  }

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-square touch-pan-y select-none overflow-hidden border border-bone/10 bg-surface"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${productName} images, ${index + 1} of ${images.length}`}
        tabIndex={images.length > 1 ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") goTo(index + 1);
          if (event.key === "ArrowLeft") goTo(index - 1);
        }}
      >
        <div
          ref={trackRef}
          className="t-gallery-slide flex h-full"
          style={{
            transform: `translateX(${-(index * 100) + dragPercent}%)`,
            transitionDuration: isDragging ? "0ms" : undefined,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={i === 0 ? productName : `${productName} — view ${i + 1}`}
              draggable={false}
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === index || undefined}
              aria-label={`View image ${i + 1} of ${images.length}`}
              className={`aspect-square overflow-hidden border transition-colors duration-300 ${
                i === index ? "border-gold" : "border-bone/10 hover:border-bone/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
