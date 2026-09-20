"use client";

import { create } from "zustand";

// Which product's Quick Look panel is open, if any — one modal instance mounted
// once at the layout, so any ProductCard anywhere can open it by slug.
type QuickViewState = {
  slug: string | null;
  open: (slug: string) => void;
  close: () => void;
};

export const useQuickViewStore = create<QuickViewState>((set) => ({
  slug: null,
  open: (slug) => set({ slug }),
  close: () => set({ slug: null }),
}));
