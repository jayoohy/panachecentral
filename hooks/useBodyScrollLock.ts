"use client";

import { useEffect } from "react";

/** Locks page scroll behind a full-screen overlay (mobile menu, cart drawer) while `active`. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
