/**
 * What the shopper pays, and — only while on sale — the regular price struck
 * through plus the API's ready-made discount label (docs/storefront-api.md §5.2–5.4).
 */
export function PriceTag({
  price,
  regularPrice,
  discountLabel,
  className = "",
}: {
  price: string;
  regularPrice?: string;
  discountLabel?: string;
  className?: string;
}) {
  const onSale = Boolean(regularPrice) && regularPrice !== price;

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums ${className}`}>
      <span>{price}</span>
      {onSale && (
        <>
          <s className="text-[0.85em] text-bone/40">
            <span className="sr-only">Was </span>
            {regularPrice}
          </s>
          {discountLabel && (
            <span className="border border-gold/50 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-gold">
              {discountLabel}
            </span>
          )}
        </>
      )}
    </span>
  );
}
