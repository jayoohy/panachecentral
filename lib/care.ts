import type { ProductDetail } from "@/lib/duka/types";

export type CareTip = { title: string; body: string };
export type CareGuide = {
  /** Route segment — the guide lives at /care/{slug}. */
  slug: string;
  /** Short label used for the link back on a product detail page. */
  linkLabel: string;
  heading: string;
  intro: string;
  tips: CareTip[];
};

export const METAL_CARE_GUIDE: CareGuide = {
  slug: "metal-care",
  linkLabel: "Jewelry Care Guide",
  heading: "Caring for Stainless Steel and 18k Gold Plated Pieces",
  intro: "These pieces are made for regular wear. A little care keeps them looking their best.",
  tips: [
    {
      title: "Wear it often.",
      body: "Stainless steel resists tarnish and handles showers and daily sweat without issue. Gold plated pieces hold their colour longest if you keep them away from long soaks and heavy sweat.",
    },
    {
      title: "Keep cleaning simple.",
      body: "Warm water and a mild soap work well, followed by a good rinse. A soft cloth or soft-bristled toothbrush reaches into textured areas. On gold plated pieces, stick to a soft cloth and a gentle wipe.",
    },
    {
      title: "Dry it before you store it.",
      body: "Pat it dry with a soft cloth first, especially around chain links and any ridged detail.",
    },
    {
      title: "Restore the shine with care.",
      body: "A microfibre cloth brings back the shine on polished pieces. On matte pieces, wipe in one direction only. Skip rough cloths or polishing paste on gold plating, since they can wear the layer thin.",
    },
    {
      title: "Chemicals go on after, jewelry goes on last.",
      body: "Take it off before bleach, chlorine, or a strong cleaning product. Put it on after perfume, lotion, and hairspray.",
    },
    {
      title: "Give each piece its own space.",
      body: "Store it in a pouch or a lined box so it isn't rubbing against other jewelry.",
    },
    {
      title: "Leave out the abrasives.",
      body: "Scouring pads, rough cloths, and jewelry dips dull the finish and can strip plating.",
    },
    {
      title: "About the gold plating.",
      body: "18k gold plating is a thin layer of gold over stainless steel. It's meant to be worn, and gentle handling keeps its colour. Friction will soften the finish over time, which is normal for any plated piece.",
    },
  ],
};

/** True when a product's specifications list a Material of stainless steel. */
export function isStainlessSteel(specifications: ProductDetail["specifications"]): boolean {
  if (!specifications) return false;
  return specifications.some(
    (spec) =>
      spec.key.trim().toLowerCase() === "material" &&
      spec.value.trim().toLowerCase().includes("stainless steel"),
  );
}

/** True when a product's specifications list a Material of (18k) gold plated. */
export function isGoldPlated(specifications: ProductDetail["specifications"]): boolean {
  if (!specifications) return false;
  return specifications.some((spec) => {
    if (spec.key.trim().toLowerCase() !== "material") return false;
    const value = spec.value.trim().toLowerCase();
    return value.includes("gold") && value.includes("plat");
  });
}

/** Resolves the care guide to link to from a product detail page, if any material rule applies. */
export function getCareGuide(specifications: ProductDetail["specifications"]): CareGuide | undefined {
  if (isStainlessSteel(specifications) || isGoldPlated(specifications)) return METAL_CARE_GUIDE;
  return undefined;
}
