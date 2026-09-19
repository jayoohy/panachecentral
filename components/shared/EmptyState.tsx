import Link from "next/link";
import { buttonClassName } from "@/components/shared/Button";

type EmptyStateProps = {
  heading: string;
  body: string;
  cta?: { label: string; href: string };
};

/** One implementation of "nothing here" — empty cart, empty search, empty order history (design spec §5). */
export function EmptyState({ heading, body, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 border border-bone/10 bg-surface px-6 py-16 text-center">
      <p className="font-serif text-2xl text-bone">{heading}</p>
      <p className="max-w-sm text-[0.9375rem] leading-[1.65] text-bone/70">{body}</p>
      {cta && (
        <Link href={cta.href} className={buttonClassName("outline", "mt-4")}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}
