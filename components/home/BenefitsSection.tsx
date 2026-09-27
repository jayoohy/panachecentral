import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { SectionKicker } from "@/components/shared/SectionKicker";

const PILLARS = [
  {
    numeral: "I",
    title: "No Filler Pieces",
    body: "Every design earns its place in the collection. Nothing goes out under the Panache Central name just to fill a gap.",
  },
  {
    numeral: "II",
    title: "Made to Last",
    body: "Non-tarnish, fade-resistant, gentle on skin.",
  },
  {
    numeral: "III",
    title: "Worth It, Every Day",
    body: "Precious doesn't mean fragile. Wear it on the ordinary days too.",
  },
] as const;

export function BenefitsSection() {
  return (
    <Section tone="onyx">
      <Reveal>
        <SectionKicker>02 / The House Pillars</SectionKicker>
        <div className="mt-6 max-w-3xl">
          <SectionHeading tone="onyx" accent="One Occasion">
            More Than
          </SectionHeading>
        </div>
      </Reveal>
      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PILLARS.map((pillar, index) => (
          <Reveal key={pillar.title} delay={index * 100}>
          <article className="h-full border border-bone/10 bg-surface p-8 transition-colors duration-500 hover:border-gold/40">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold">{pillar.numeral}</p>
            <h3 className="mt-10 font-serif text-2xl leading-snug">{pillar.title}</h3>
            <p className="mt-4 text-[0.9375rem] leading-[1.65] text-bone/75">{pillar.body}</p>
          </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
