"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Holds the two pieces of client state that need to outlive any single
// component and survive a reload: the opaque cart id (docs/storefront-api.md
// §4 — "treat it like a token, persist it client-side") and a cached
// logged-in flag (the doc explicitly says there's no cheap "am I logged in"
// check beyond calling GET /account, so cache the result instead of calling
// it on every render).
type CartStoreState = {
  cartId: string | null;
  isLoggedIn: boolean;
  isDrawerOpen: boolean;
  setCartId: (cartId: string | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      cartId: null,
      isLoggedIn: false,
      isDrawerOpen: false,
      setCartId: (cartId) => set({ cartId }),
      setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: "panache-storefront",
      // Drawer open/closed is transient UI state, not something to restore
      // on the next visit.
      partialize: (state) => ({ cartId: state.cartId, isLoggedIn: state.isLoggedIn }),
    }
  )
);
