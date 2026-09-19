import { Section } from "@/components/shared/Section";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Reveal } from "@/components/shared/Reveal";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { ComingSoonInline } from "@/components/shared/ComingSoonInline";

const FAQS = [
  {
    question: "What are pieces made from?",
    answer:
      "Stainless steel, moissanite, and gold, depending on the piece. Each product page lists the exact material.",
  },
  { question: "How do I care for it?", answer: null },
  { question: "Shipping and delivery?", answer: null },
  { question: "Returns?", answer: null },
] as const;

export function FaqSection() {
  return (
    <Section tone="surface">
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <SectionKicker>05 / Care &amp; Questions</SectionKicker>
          <div className="mt-6">
            <SectionHeading tone="onyx" accent="You Buy">
              Before
            </SectionHeading>
          </div>
        </Reveal>
        <dl className="divide-y divide-bone/10 border-y border-bone/10 lg:col-span-6 lg:col-start-7">
          {FAQS.map((item, index) => (
            <Reveal key={item.question} delay={index * 100} className="py-8">
              <dt className="font-serif text-xl text-bone">{item.question}</dt>
              <dd className="mt-3 text-[0.9375rem] leading-[1.65] text-bone/75">
                {item.answer ?? <ComingSoonInline tone="onyx" />}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  );
}
