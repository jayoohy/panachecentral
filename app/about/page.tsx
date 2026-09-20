import type { Metadata } from "next";
import { ContentPage, type ContentSection } from "@/components/shared/ContentPage";
import { SITE_NAME } from "@/lib/site";

const TITLE = "About";
const DESCRIPTION = `${SITE_NAME} is a luxury jewelry house for people who choose pieces to wear, not just to own. Stainless steel, moissanite, and gold-plated pieces, chosen one at a time.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_NG", title: TITLE, description: DESCRIPTION, url: "/about" },
};

// Every line is from the locked brand copy (docs/panache-central-homepage-content.md §2–§4) —
// no founding story, dates or numbers until real ones are supplied.
const SECTIONS: ContentSection[] = [
  {
    heading: "The House",
    paragraphs: [
      "Panache Central is a luxury jewelry house for people who choose pieces to wear, not just to own.",
      "Every piece is chosen, not stocked.",
    ],
  },
  {
    heading: "Chosen, Not Stocked",
    paragraphs: [
      "Each design earns its place in the collection on its own. Nothing goes out under the Panache Central name to fill a gap in a catalog.",
    ],
  },
  {
    heading: "One Material Standard",
    paragraphs: [
      "Stainless steel, moissanite, and gold-plated pieces. Each product page lists the exact material.",
    ],
  },
  {
    heading: "Chosen for Daily Wear",
    paragraphs: [
      "Pieces are selected for everyday wear, not for one event and a drawer.",
    ],
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      kicker="The House"
      title="About"
      accent="Panache Central"
      intro="A luxury jewelry house for people who choose pieces to wear, not just to own."
      sections={SECTIONS}
      cta={{ label: "Shop the Collection", href: "/shop" }}
    />
  );
}
