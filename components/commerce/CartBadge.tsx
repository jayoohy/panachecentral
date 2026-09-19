"use client";

import { useEffect, useRef, useState } from "react";

/** Notification-badge pop transition on the header cart icon (design spec §5). */
export function CartBadge({ count }: { count: number }) {
  const [pop, setPop] = useState(false);
  const previous = useRef(count);

  useEffect(() => {
    if (count > previous.current) {
      setPop(true);
      const timer = setTimeout(() => setPop(false), 500);
      previous.current = count;
      return () => clearTimeout(timer);
    }
    previous.current = count;
  }, [count]);

  if (count === 0) return null;

  return (
    <span
      key={pop ? "pop" : "still"}
      className={`absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-onyx ${pop ? "t-badge-pop" : ""}`}
    >
      {count}
    </span>
  );
}
