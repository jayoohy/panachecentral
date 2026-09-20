import type { Metadata } from "next";
import { PageHeading } from "@/components/shared/PageHeading";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { ContactForm } from "@/components/shared/ContactForm";
import { SOCIAL_LINKS, CONTACT_EMAIL } from "@/lib/social";
import { SITE_NAME } from "@/lib/site";

const TITLE = "Contact";
const DESCRIPTION = `Reach ${SITE_NAME} on WhatsApp, by email, or on social.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_NG", title: TITLE, description: DESCRIPTION, url: "/contact" },
};

const FOLLOW_LINKS = SOCIAL_LINKS.filter((link) => !link.href.startsWith("mailto:"));

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
      <SectionKicker>Panache Central</SectionKicker>
      <div className="mt-6">
        <PageHeading>Contact</PageHeading>
      </div>
      <p className="mt-6 max-w-[60ch] text-[0.9375rem] leading-[1.75] text-bone/80">
        The fastest way to reach us is WhatsApp. You can also write in directly or find us on
        social.
      </p>

      <div className="mt-16 space-y-12 border-t border-bone/10 pt-12">
        <section>
          <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-gold">Email</h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 inline-block text-bone hover:text-gold">
            {CONTACT_EMAIL}
          </a>
        </section>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-gold">Follow</h2>
          <ul className="mt-3 space-y-2 text-[0.9375rem] text-bone/80">
            {FOLLOW_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Panache Central on ${link.label}`}
                  className="hover:text-gold"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-[0.22em] text-gold">Send a Message</h2>
          <p className="mt-3 text-sm text-bone/70">Opens WhatsApp with your message ready to send.</p>
          <div className="mt-4">
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  );
}
