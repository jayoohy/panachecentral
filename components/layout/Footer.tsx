import Link from "next/link";
import { TAGLINE } from "@/lib/constants";
import { SOCIAL_LINKS } from "@/lib/social";

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

// Category links live in the header/mobile menu already — repeating the full list here
// just made the footer long without adding anything a visitor couldn't already reach.
export function Footer() {
  return (
    <footer className="border-t border-bone/10 bg-onyx px-6 py-12 text-bone sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
        <FooterColumn title="Company">
          {COMPANY_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-gold">
                {link.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Legal">
          {LEGAL_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-gold">
                {link.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Follow">
          {SOCIAL_LINKS.map((link) => {
            const isEmail = link.href.startsWith("mailto:");
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={isEmail ? undefined : "_blank"}
                  rel={isEmail ? undefined : "noopener noreferrer"}
                  aria-label={isEmail ? "Email Panache Central" : `Panache Central on ${link.label}`}
                  className="hover:text-gold"
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </FooterColumn>
      </div>

      <p className="mx-auto mt-10 max-w-6xl border-t border-bone/10 pt-6 text-[0.6875rem] uppercase tracking-[0.18em] text-bone/60">
        {TAGLINE}
      </p>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-gold">{title}</h3>
      <ul className="mt-4 space-y-2 text-[0.9375rem] text-bone/75">{children}</ul>
    </div>
  );
}
