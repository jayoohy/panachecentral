"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { buttonClassName } from "@/components/shared/Button";

// Root error boundary (still rendered inside the root layout — Header/Footer stay
// mounted; only app/global-error.tsx would replace <html>/<body>, and nothing here
// needs that). Previously an uncaught render error fell through to Next's default
// error screen (audit F8). `reset()` re-renders the segment that threw without a
// full page reload.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-onyx px-6 py-32 text-center text-bone">
      <SectionKicker>Panache Central</SectionKicker>
      <p className="mt-6 font-serif text-4xl tracking-tight sm:text-5xl">
        Something went <em className="italic">wrong.</em>
      </p>
      <p className="mt-4 max-w-sm text-[0.9375rem] leading-[1.65] text-bone/70">
        That&apos;s on us, not you. Please try again.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={reset} className={buttonClassName("primary-gold")}>
          Try Again
        </button>
        <Link href="/" className={buttonClassName("outline")}>
          Back to Panache Central
        </Link>
      </div>
    </div>
  );
}
