"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/cart-store";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { CartView } from "@/components/commerce/CartView";
import { PageHeading } from "@/components/shared/PageHeading";

/**
 * Panel-reveal from the right (transitions-dev), role=dialog + focus trap +
 * Escape-to-close per design spec §5/§7. Closes automatically on navigation
 * so a "Checkout" click doesn't leave a stale open drawer over the next page.
 */
export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerFocusRef = useRef<Element | null>(null);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      triggerFocusRef.current = document.activeElement;
      panelRef.current?.focus();
    } else if (triggerFocusRef.current instanceof HTMLElement) {
      triggerFocusRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  return (
    <div
      className={`t-panel-scrim fixed inset-0 z-50 bg-onyx/70 ${isOpen ? "" : "pointer-events-none"}`}
      data-state={isOpen ? "open" : "closed"}
      onClick={closeDrawer}
      aria-hidden={!isOpen}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        data-state={isOpen ? "open" : "closed"}
        onClick={(event) => event.stopPropagation()}
        className="t-panel absolute right-0 top-0 flex h-dvh w-[92vw] max-w-md flex-col border-l border-bone/10 bg-onyx sm:w-[420px]"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <PageHeading compact>Your Cart</PageHeading>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="t-press flex h-11 w-11 items-center justify-center text-xl text-bone"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-hidden">{isOpen && <CartView />}</div>
      </div>
    </div>
  );
}
