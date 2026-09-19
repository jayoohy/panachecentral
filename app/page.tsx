import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { PositioningSection } from "@/components/home/PositioningSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { ArrivalSection } from "@/components/home/ArrivalSection";
import { CollectionSection } from "@/components/home/CollectionSection";
import { TrustSection } from "@/components/home/TrustSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero />
      <PositioningSection />
      <BenefitsSection />
      <ArrivalSection />
      <CollectionSection />
      <TrustSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
