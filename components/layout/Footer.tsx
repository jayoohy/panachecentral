import Link from "next/link";
import { LAUNCH_CATEGORIES, TAGLINE } from "@/lib/constants";

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Care & Materials", href: "/care-materials" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
];

export function Footer() {
  return (
    <footer className="border-t border-bone/10 bg-onyx px-6 py-20 text-bone sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
        <FooterColumn title="Shop">
          {LAUNCH_CATEGORIES.map((category) => (
            <li key={category.href}>
              <Link href={category.href} className="hover:text-gold">
                {category.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

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
      </div>

      <p className="mx-auto mt-16 max-w-6xl border-t border-bone/10 pt-6 text-[0.6875rem] uppercase tracking-[0.18em] text-bone/60">
        {TAGLINE}
      </p>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-gold">{title}</h3>
      <ul className="mt-6 space-y-3 text-[0.9375rem] text-bone/75">{children}</ul>
    </div>
  );
}
