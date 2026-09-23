import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { buttonClassName } from "@/components/shared/Button";

export type ContentSection = { heading: string; paragraphs: string[] };

/**
 * Editorial long-form page (About, policies): kicker + Playfair
 * title, then one hairline-separated row per section — label left, prose right
 * (Stitch asymmetric 12-column grid). Copy is passed in, never written here.
 */
export function ContentPage({
  kicker,
  title,
  accent,
  intro,
  notice,
  sections,
  cta,
}: {
  kicker: string;
  title: string;
  /** Set in italic after the title, e.g. "About *the House*" */
  accent?: string;
  intro?: string;
  /** Bordered callout below intro — e.g. flagging a policy page as a legal-review draft. */
  notice?: string;
  sections: ContentSection[];
  cta?: { label: string; href: string };
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
      <Reveal>
        <SectionKicker>{kicker}</SectionKicker>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          {title}
          {accent && (
            <>
              {" "}
              <em className="italic">{accent}</em>
            </>
          )}
        </h1>
        {intro && (
          <p className="mt-8 max-w-[65ch] text-lg font-light leading-[1.75] text-bone/85">{intro}</p>
        )}
        {notice && (
          <p className="mt-8 max-w-[65ch] border border-gold/40 bg-surface px-5 py-4 text-sm leading-[1.65] text-bone/80">
            {notice}
          </p>
        )}
      </Reveal>

      <div className="mt-20 border-t border-bone/10">
        {sections.map((section, index) => (
          <Reveal key={section.heading} className="grid grid-cols-1 gap-6 border-b border-bone/10 py-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-serif text-2xl sm:text-3xl">{section.heading}</h2>
            </div>
            <div className="space-y-5 lg:col-span-7 lg:col-start-6">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="max-w-[65ch] text-[0.9375rem] leading-[1.75] text-bone/80">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      {cta && (
        <Reveal className="mt-16">
          <Link href={cta.href} className={buttonClassName("primary-gold")}>
            {cta.label}
          </Link>
        </Reveal>
      )}
    </div>
  );
}
