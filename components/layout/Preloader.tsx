"use client";

import { useEffect } from "react";
import { TAGLINE } from "@/lib/constants";
import {
  PRELOAD_LEAVE_MS,
  PRELOAD_MAX_MS,
  PRELOAD_MIN_MS,
  PRELOAD_SEEN_KEY,
} from "@/lib/preloader";

/**
 * First-visit brand moment: wordmark, a gold hairline that draws itself, then
 * the Onyx curtain lifts to reveal the page. State lives on <html data-preload>
 * ("active" -> "leaving" -> removed) so the overlay is in the server HTML with
 * no flash, and the hero entrance can wait for the lift (see globals.css).
 * Shown once per session; skipped entirely for reduced motion or when the
 * layout script didn't arm it.
 */
export function Preloader() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.preload !== "active") return;

    root.style.overflow = "hidden";
    const started = performance.now();
    let leaveTimer: ReturnType<typeof setTimeout> | undefined;

    const leave = () => {
      if (root.dataset.preload !== "active") return;
      root.dataset.preload = "leaving";
      setTimeout(() => {
        delete root.dataset.preload;
        root.style.overflow = "";
        try {
          sessionStorage.setItem(PRELOAD_SEEN_KEY, "1");
        } catch {
          // storage blocked: the preloader simply shows again next visit
        }
      }, PRELOAD_LEAVE_MS);
    };

    const onReady = () => {
      leaveTimer = setTimeout(
        leave,
        Math.max(0, PRELOAD_MIN_MS - (performance.now() - started)),
      );
    };

    if (document.readyState === "complete") onReady();
    else window.addEventListener("load", onReady, { once: true });
    const cap = setTimeout(leave, PRELOAD_MAX_MS);

    return () => {
      window.removeEventListener("load", onReady);
      clearTimeout(leaveTimer);
      clearTimeout(cap);
    };
  }, []);

  return (
    <div data-preloader aria-hidden="true">
      <div className="preloader-content">
        <p className="preloader-wordmark font-serif text-4xl tracking-tight sm:text-6xl">
          Panache <em className="italic">Central</em>
        </p>
        <span className="preloader-line" />
        <p className="preloader-tagline text-[0.6875rem] font-semibold uppercase tracking-[0.3em]">
          {TAGLINE}
        </p>
      </div>
    </div>
  );
}
