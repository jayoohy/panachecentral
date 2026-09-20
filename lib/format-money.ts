// Per the workspace's user-relevant-data-presentation rule: never render a
// raw minor-units integer, always format for the currency it's actually in.
export function formatMoney(minorUnits: number, currency: string = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: minorUnits % 100 === 0 ? 0 : 2,
  }).format(minorUnits / 100);
}

/** "₦15,000", or "₦15,000 – ₦18,000" when variants differ, "" when the product has no priced variant. */
export function formatPriceRange(range: {
  minPriceMinorUnits: number | null;
  maxPriceMinorUnits: number | null;
}): string {
  const { minPriceMinorUnits: min, maxPriceMinorUnits: max } = range;
  if (min === null) return "";
  return max !== null && max !== min ? `${formatMoney(min)} – ${formatMoney(max)}` : formatMoney(min);
}
