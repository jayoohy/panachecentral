import type { Metadata } from "next";
import { ContentPage, type ContentSection } from "@/components/shared/ContentPage";
import { SITE_NAME } from "@/lib/site";

const TITLE = "About";
const DESCRIPTION = `${SITE_NAME} is a fine jewelry house for people who buy once and keep forever. Stainless steel, moissanite, and gold pieces, chosen to sit beside gold and diamonds.`;

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
      "Panache Central is a fine jewelry house for people who buy once and keep forever.",
      "Every piece is chosen — not stocked — to sit alongside gold and diamonds without looking out of place.",
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
      "Stainless steel, moissanite, and gold pieces are held to the same bar. There's no lower tier and no starter line. Each product page lists the exact material.",
    ],
  },
  {
    heading: "Made for the Long Wear",
    paragraphs: [
      "Pieces are built for daily wear and for handing down, not for one event and a drawer.",
    ],
  },
  {
    heading: "Arrives the Way It’s Made",
    paragraphs: [
      "Each order ships in an Onyx Black box with a Champagne Gold seal, lined in Bone White. A printed card notes the material and how to care for it. Nothing extra. Nothing missing.",
    ],
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      kicker="The House"
      title="About"
      accent="Panache Central"
      intro="A fine jewelry house for people who buy once and keep forever."
      sections={SECTIONS}
      cta={{ label: "Shop the Collection", href: "/shop" }}
    />
  );
}
