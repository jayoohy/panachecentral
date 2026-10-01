import { ContentPage, type ContentSection } from "@/components/shared/ContentPage";
import type { CareGuide as CareGuideContent } from "@/lib/care";

/** Full-page material care guide, linked to from a product detail page (see lib/care.ts). */
export function CareGuide({ content }: { content: CareGuideContent }) {
  const sections: ContentSection[] = content.tips.map((tip) => ({
    heading: tip.title.replace(/\.$/, ""),
    paragraphs: [tip.body],
  }));

  return (
    <ContentPage
      kicker="Care Guide"
      title={content.heading}
      intro={content.intro}
      sections={sections}
      cta={{ label: "Shop the Collection", href: "/shop" }}
    />
  );
}
