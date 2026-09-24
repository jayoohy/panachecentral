import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { PositioningSection } from "@/components/home/PositioningSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { CollectionSection } from "@/components/home/CollectionSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { ProductRailSection } from "@/components/home/ProductRailSection";
import { RAILS } from "@/lib/product-rails";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero />
      <PositioningSection />
      <ProductRailSection rail={RAILS.featured} />
      <BenefitsSection />
      <CollectionSection />
      <ProductRailSection rail={RAILS["new-arrivals"]} />
      <ProductRailSection rail={RAILS["best-sellers"]} />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
