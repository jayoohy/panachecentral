import type { Metadata } from "next";
import { ContentPage, type ContentSection } from "@/components/shared/ContentPage";
import { SITE_NAME } from "@/lib/site";

const TITLE = "About";
const DESCRIPTION = `${SITE_NAME}. Style, undisputed. Non-tarnish, fade-resistant, hypoallergenic pieces sourced one at a time.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_NG", title: TITLE, description: DESCRIPTION, url: "/about" },
};

// No founding story, dates or numbers until real ones are supplied.
const SECTIONS: ContentSection[] = [
  {
    heading: "Style, That Doesn't Ask Twice",
    paragraphs: [
      "Panache Central sources pieces built to last: non-tarnish, fade-resistant, hypoallergenic. No drama, just consistency.",
    ],
  },
  {
    heading: "No Filler Pieces",
    paragraphs: [
      "Every design earns its place in the collection. Nothing goes out under the Panache Central name just to fill a gap.",
    ],
  },
  {
    heading: "Made to Last",
    paragraphs: [
      "Non-tarnish, fade-resistant, gentle on skin.",
    ],
  },
  {
    heading: "Worth It, Every Day",
    paragraphs: [
      "Precious doesn't mean fragile. Wear it on the ordinary days too.",
    ],
  },
];

export default function AboutPage() {
  return (
    <ContentPage
      kicker="The House"
      title="About"
      accent="Panache Central"
      intro="Style, Undisputed."
      sections={SECTIONS}
      cta={{ label: "Shop the Collection", href: "/shop" }}
    />
  );
}
