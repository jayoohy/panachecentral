import { Section } from "@/components/shared/Section";
import { ComingSoonInline } from "@/components/shared/ComingSoonInline";

// docs/panache-central-homepage-content.md §6: no placeholder testimonials or
// invented numbers — this section stays empty until real proof points exist.
export function TrustSection() {
  return (
    <Section tone="bone">
      <div className="text-center">
        <ComingSoonInline tone="bone" />
      </div>
    </Section>
  );
}
