import type { Metadata } from "next";
import { CareGuide } from "@/components/commerce/CareGuide";
import { METAL_CARE_GUIDE } from "@/lib/care";
import { SITE_NAME } from "@/lib/site";

const DESCRIPTION = `How to clean, wear, and store stainless steel and 18k gold plated jewelry from ${SITE_NAME}.`;

export const metadata: Metadata = {
  title: METAL_CARE_GUIDE.heading,
  description: DESCRIPTION,
  alternates: { canonical: "/care/metal-care" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    title: METAL_CARE_GUIDE.heading,
    description: DESCRIPTION,
    url: "/care/metal-care",
  },
};

export default function MetalCarePage() {
  return <CareGuide content={METAL_CARE_GUIDE} />;
}
