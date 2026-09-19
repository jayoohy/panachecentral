import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { SectionKicker } from "@/components/shared/SectionKicker";

// The three colors and the card come straight from the "How It Arrives" copy.
const PACKAGING = [
  { label: "The Box", value: "Onyx Black" },
  { label: "The Seal", value: "Champagne Gold" },
  { label: "The Lining", value: "Bone White" },
  { label: "The Card", value: "Material and care, printed" },
] as const;

export function ArrivalSection() {
  return (
    <Section tone="surface">
      <Reveal>
        <SectionKicker>03 / How It Arrives</SectionKicker>
      </Reveal>
      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-7">
          <SectionHeading tone="onyx" accent="It’s Made">
            Arrives the Way
          </SectionHeading>
        </Reveal>
        <Reveal delay={150} className="lg:col-span-4 lg:col-start-9">
        <p className="max-w-[65ch] text-lg font-light leading-[1.75] text-bone/85">
          Each order ships in an Onyx Black box with a Champagne Gold seal, lined in Bone White. A
          printed card notes the material and how to care for it. Nothing extra. Nothing missing.
        </p>
        </Reveal>
      </div>
      <dl className="mt-20 grid border-t border-bone/10 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGING.map((item, index) => (
          <Reveal key={item.label} delay={index * 100} className="border-b border-bone/10 py-8 sm:pr-8">
            <dt className="text-xs font-medium uppercase tracking-[0.22em] text-bone/60">{item.label}</dt>
            <dd className="mt-3 font-serif text-xl">{item.value}</dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
