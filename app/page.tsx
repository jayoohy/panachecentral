import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { PositioningSection } from "@/components/home/PositioningSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { CollectionSection } from "@/components/home/CollectionSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero />
      <PositioningSection />
      <BenefitsSection />
      <CollectionSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
