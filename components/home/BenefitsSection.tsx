import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { SectionKicker } from "@/components/shared/SectionKicker";

const PILLARS = [
  {
    numeral: "I",
    title: "Chosen, Not Stocked",
    body: "Each design earns its place in the collection on its own. Nothing goes out under the Panache Central name to fill a gap in a catalog.",
  },
  {
    numeral: "II",
    title: "One Material Standard",
    body: "Stainless steel, moissanite, and gold-plated pieces are held to the same bar.",
  },
  {
    numeral: "III",
    title: "Chosen for Daily Wear",
    body: "Pieces are selected for everyday wear, not for one event and a drawer.",
  },
] as const;

export function BenefitsSection() {
  return (
    <Section tone="onyx">
      <Reveal>
        <SectionKicker>02 / The House Pillars</SectionKicker>
        <div className="mt-6 max-w-3xl">
          <SectionHeading tone="onyx" accent="One Occasion">
            Chosen for More Than
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
