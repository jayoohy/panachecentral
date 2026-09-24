/**
 * Product tile photograph with a hover swap: when the product has a second
 * image (docs/storefront-api.md §5.2 `images`), it cross-fades in over the
 * lead image while the parent `.group` card is hovered or keyboard-focused.
 *
 * Tailwind v4 wraps `group-hover` in `@media (hover: hover)`, so touch
 * devices never get stuck on the alternate image after a tap. The second
 * image is decorative (same product, different angle) — empty alt so screen
 * readers don't announce the product twice.
 *
 * ponytail: plain <img>, not next/image — see ProductCard.tsx.
 */
export function ProductCardImage({
  name,
  thumbnail,
  images,
}: {
  name: string;
  thumbnail: string | null;
  images?: string[];
}) {
  if (!thumbnail) {
    return (
      <div className="flex h-full items-center justify-center text-[0.6875rem] uppercase tracking-[0.18em] text-bone/30">
        No image
      </div>
    );
  }

  // `images` is optional at runtime until every API host serves the §5.2 field.
  const hoverImage = images?.find((src) => src !== thumbnail);
  const zoom =
    "transition-[transform,opacity] duration-700 group-hover:scale-[1.03] motion-reduce:transition-none";

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnail}
        alt={name}
        loading="lazy"
        className={`h-full w-full object-cover ${zoom} ${
          hoverImage ? "group-hover:opacity-0 group-focus-within:opacity-0" : ""
        }`}
      />
      {hoverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hoverImage}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 ${zoom}`}
        />
      )}
    </>
  );
}
