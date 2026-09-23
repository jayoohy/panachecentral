import type { Metadata } from "next";
import { ContentPage, type ContentSection } from "@/components/shared/ContentPage";
import { SITE_NAME } from "@/lib/site";
import { CONTACT_EMAIL } from "@/lib/social";

const TITLE = "Privacy Policy";

// Draft, standard e-commerce boilerplate structure — not legal advice, and not final.
// noindex stays on until this is reviewed and the notice below is removed
// (docs/design/panache-storefront-ux-audit-2026-09-22.md F2).
export const metadata: Metadata = {
  title: TITLE,
  robots: { index: false },
};

const SECTIONS: ContentSection[] = [
  {
    heading: "Information We Collect",
    paragraphs: [
      "When you create an account, place an order, or contact us, we collect the details you provide directly — typically your name, email address, phone number, and the order details themselves (items, sizes, delivery information).",
      "We don't collect payment card details on our own systems; where a payment gateway is used, your card details are handled entirely by that gateway.",
    ],
  },
  {
    heading: "How We Use Your Information",
    paragraphs: [
      `We use your information to create and fulfil your order, respond to questions, and keep your account working — creating your cart, remembering what's in it, and showing your order history.`,
      "We don't sell your personal information to third parties.",
    ],
  },
  {
    heading: "Ordering Through WhatsApp",
    paragraphs: [
      `Checkout currently completes through WhatsApp: placing an order opens a WhatsApp conversation with ${SITE_NAME}, prefilled with your order reference. That conversation, and any details you share in it, are subject to WhatsApp's own privacy policy in addition to this one.`,
    ],
  },
  {
    heading: "Cookies & Local Storage",
    paragraphs: [
      "We use browser storage to keep your cart and session working between visits (for example, remembering an in-progress cart or that you're signed in). We don't currently use third-party advertising cookies.",
    ],
  },
  {
    heading: "Data Retention & Your Rights",
    paragraphs: [
      "We keep account and order information for as long as your account is active, or as needed to fulfil orders and meet our own record-keeping obligations.",
      `You can ask us to access, correct, or delete your personal information at any time by contacting us at ${CONTACT_EMAIL}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <ContentPage
      kicker="Panache Central"
      title="Privacy"
      accent="Policy"
      intro="How we collect, use, and protect the information you share with us."
      notice="Draft — pending legal review. This page describes our current practices in plain language but hasn't yet been reviewed by counsel, and shouldn't be treated as final. If you have questions about how your information is handled in the meantime, contact us directly below."
      sections={SECTIONS}
      cta={{ label: "Contact Us", href: "/contact" }}
    />
  );
}
