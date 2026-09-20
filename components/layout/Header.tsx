"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAUNCH_CATEGORIES, isVisibleCategory } from "@/lib/constants";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/hooks/useCart";
import { useAccount } from "@/hooks/useAccount";
import { useLogout } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store/cart-store";
import { CartBadge } from "@/components/commerce/CartBadge";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { MenuIcon } from "@/components/layout/MenuIcon";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: categories } = useCategories();
  const { cart } = useCart();
  const isLoggedIn = useCartStore((state) => state.isLoggedIn);
  const { data: account } = useAccount();
  const logout = useLogout();
  const openDrawer = useCartStore((state) => state.openDrawer);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const navLinks =
    categories && categories.length > 0
      ? categories
          .filter((category) => !category.parentId && isVisibleCategory(category))
          .map((category) => ({ label: category.name, href: `/shop/${category.slug}` }))
      : LAUNCH_CATEGORIES;

  const mobileLinks = [{ label: "Home", href: "/" }, ...navLinks];

  return (
    <header className="sticky top-0 z-40 border-b border-bone/10 bg-onyx text-bone">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 sm:px-10 lg:px-16">
        <Link href="/" className="shrink-0 text-xs font-semibold uppercase tracking-[0.3em] hover:text-gold">
          Panache Central
        </Link>

        <nav className="hidden flex-wrap justify-center gap-x-6 gap-y-2 xl:flex" aria-label="Categories">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`border-b pb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 hover:text-gold ${
                  isActive ? "border-gold text-bone" : "border-transparent text-bone/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={openDrawer}
            className="relative t-press text-bone hover:text-gold"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <CartIcon />
            <CartBadge count={itemCount} />
          </button>

          <AccountMenu isLoggedIn={isLoggedIn} accountName={account?.name} onLogout={() => logout.mutate()} />

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-bone hover:text-gold xl:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      <MobileNav links={mobileLinks} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.25" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2l2.4 12.2a1.5 1.5 0 0 0 1.47 1.3h8.7a1.5 1.5 0 0 0 1.47-1.18L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
