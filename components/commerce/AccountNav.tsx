"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Profile", href: "/account" },
  { label: "Orders", href: "/account/orders" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-8 border-b border-bone/10" aria-label="Account">
      {TABS.map((tab) => {
        const isActive = tab.href === "/account" ? pathname === "/account" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`border-b pb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ${
              isActive ? "border-gold text-bone" : "border-transparent text-bone/60 hover:text-bone"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
