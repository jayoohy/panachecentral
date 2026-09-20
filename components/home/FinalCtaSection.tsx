import Link from "next/link";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonClassName } from "@/components/shared/Button";
import { TAGLINE_ACCENT, TAGLINE_LEAD } from "@/lib/constants";

export function FinalCtaSection() {
  return (
    <Section tone="bone">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-7">
          <SectionHeading tone="bone" accent={TAGLINE_ACCENT}>
            {TAGLINE_LEAD}
          </SectionHeading>
        </Reveal>
        <Reveal delay={150} className="lg:col-span-4 lg:col-start-9">
          <p className="text-lg font-light leading-[1.75]">
            Pieces chosen one by one, for everyday wear.
          </p>
          <Link href="/shop" className={buttonClassName("primary-onyx", "mt-8")}>
            Shop the Collection
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
