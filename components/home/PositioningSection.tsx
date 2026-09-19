import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { SectionKicker } from "@/components/shared/SectionKicker";

export function PositioningSection() {
  return (
    <Section tone="bone">
      <div className="grid gap-10 lg:grid-cols-12">
        <SectionKicker tone="bone" className="lg:col-span-3">
          01 / The House
        </SectionKicker>
        <Reveal delay={100} className="lg:col-span-8 lg:col-start-5">
          <SectionHeading tone="bone" accent="Not a Page">
            A House,
          </SectionHeading>
          <p className="mt-10 max-w-[65ch] font-serif text-xl leading-relaxed sm:text-2xl">
            Panache Central is a fine jewelry house for people who buy once and keep forever. Every
            piece is chosen — not stocked — to sit alongside gold and diamonds without looking out
            of place.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
