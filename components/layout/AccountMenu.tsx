"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/** Header account affordance — plain login link when signed out, a dropdown when signed in. */
export function AccountMenu({
  isLoggedIn,
  accountName,
  onLogout,
}: {
  isLoggedIn: boolean;
  accountName?: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!isLoggedIn) {
    return (
      <Link href="/account/login" className="hidden t-press text-bone hover:text-gold sm:inline-flex" aria-label="Log in">
        <AccountIcon />
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={accountName ? `Account menu for ${accountName}` : "Account menu"}
        className="t-press text-bone hover:text-gold"
      >
        <AccountIcon />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-48 border border-bone/10 bg-surface py-2 text-sm"
        >
          <Link role="menuitem" href="/account" className="block px-4 py-2 text-bone hover:text-gold" onClick={() => setOpen(false)}>
            My Account
          </Link>
          <Link
            role="menuitem"
            href="/account/orders"
            className="block px-4 py-2 text-bone hover:text-gold"
            onClick={() => setOpen(false)}
          >
            My Orders
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="block w-full px-4 py-2 text-left text-bone/70 hover:text-gold"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" strokeLinecap="round" />
    </svg>
  );
}
