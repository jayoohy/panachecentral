// Per the workspace's user-relevant-data-presentation rule: never render a
// raw minor-units integer, always format for the currency it's actually in.
export function formatMoney(minorUnits: number, currency: string = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: minorUnits % 100 === 0 ? 0 : 2,
  }).format(minorUnits / 100);
}
