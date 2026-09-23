import type { Metadata } from "next";
import { ContentPage, type ContentSection } from "@/components/shared/ContentPage";
import { SITE_NAME } from "@/lib/site";
import { CONTACT_EMAIL } from "@/lib/social";

const TITLE = "Terms of Sale";

// Draft, standard e-commerce boilerplate structure — not legal advice, and not final.
// noindex stays on until this is reviewed and the notice below is removed
// (docs/design/panache-storefront-ux-audit-2026-09-22.md F2).
export const metadata: Metadata = {
  title: TITLE,
  robots: { index: false },
};

const SECTIONS: ContentSection[] = [
  {
    heading: "Orders & Confirmation",
    paragraphs: [
      `Placing an order opens a WhatsApp conversation with ${SITE_NAME}. Your order is confirmed once we've heard from you on WhatsApp and acknowledged it — not automatically at checkout.`,
      "We reserve the right to decline or cancel an order, including for a piece that's sold out or listed in error, and will let you know if that happens.",
    ],
  },
  {
    heading: "Pricing & Payment",
    paragraphs: [
      "All prices are shown in Nigerian Naira (NGN) and are current at the time of viewing. Prices may change without notice, but the price shown at the time you place an order is the price that applies to that order.",
    ],
  },
  {
    heading: "Shipping",
    paragraphs: [
      "Delivery timelines and costs are confirmed with you directly on WhatsApp once your order is placed, as they can depend on your location and the piece ordered.",
    ],
  },
  {
    heading: "Returns & Exchanges",
    paragraphs: [
      "If a piece arrives damaged or isn't what you ordered, contact us within a reasonable time of delivery and we'll work with you on a repair, replacement, or refund.",
      "Because pieces are chosen in limited quantities rather than mass-stocked, we're not always able to offer a like-for-like exchange — we'll tell you what's possible when you reach out.",
    ],
  },
  {
    heading: "Product Descriptions",
    paragraphs: [
      "We describe materials (stainless steel, moissanite, gold-plated, etc.) as accurately as we can on each product page. Photography is representative; small variations in tone or finish between the photo and the physical piece can occur.",
    ],
  },
  {
    heading: "Limitation of Liability",
    paragraphs: [
      `${SITE_NAME} isn't liable for indirect or consequential loss arising from your use of this site or a purchase made through it, beyond what's required by applicable law.`,
    ],
  },
  {
    heading: "Governing Law",
    paragraphs: ["These terms are governed by the laws of Nigeria."],
  },
];

export default function TermsPage() {
  return (
    <ContentPage
      kicker="Panache Central"
      title="Terms"
      accent="of Sale"
      intro="The terms that apply when you order from us."
      notice={`Draft — pending legal review. This page describes our current practices in plain language but hasn't yet been reviewed by counsel, and shouldn't be treated as final. Questions in the meantime: ${CONTACT_EMAIL}.`}
      sections={SECTIONS}
      cta={{ label: "Contact Us", href: "/contact" }}
    />
  );
}
