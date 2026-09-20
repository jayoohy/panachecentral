import Link from "next/link";
import { SectionKicker } from "@/components/shared/SectionKicker";

/**
 * Full-page "Coming Soon" stub — design spec §3.11.
 * Reused for the footer's remaining Legal routes (Privacy, Terms) rather than a
 * 404 or invented copy, pending real policy text.
 */
export function ComingSoonPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-onyx px-6 py-32 text-center text-bone">
      <SectionKicker>Panache Central</SectionKicker>
      <p className="mt-6 font-serif text-4xl tracking-tight sm:text-5xl">
        This page is <em className="italic">on its way.</em>
      </p>
      <Link
        href="/"
        className="mt-10 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold hover:text-bone"
      >
        Back to Panache Central <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
