import Link from "next/link";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { buttonClassName } from "@/components/shared/Button";

// Renders inside the root layout (Header/Footer stay mounted) for any route Next.js can't
// match, plus every notFound() call elsewhere in the app — previously fell through to
// Next's generic default page, breaking the brand experience at the exact moment a
// visitor is already lost (audit F8). Visual language matches EmptyState (kicker, serif
// headline with an italic accent, centered, one or two CTAs).
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-onyx px-6 py-32 text-center text-bone">
      <SectionKicker>Panache Central</SectionKicker>
      <p className="mt-6 font-serif text-4xl tracking-tight sm:text-5xl">
        We couldn&apos;t find <em className="italic">that page.</em>
      </p>
      <p className="mt-4 max-w-sm text-[0.9375rem] leading-[1.65] text-bone/70">
        The link may be out of date, or the piece may no longer be listed.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/shop" className={buttonClassName("primary-gold")}>
          Shop the Collection
        </Link>
        <Link href="/" className={buttonClassName("outline")}>
          Back to Panache Central
        </Link>
      </div>
    </div>
  );
}
