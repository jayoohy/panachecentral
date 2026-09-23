"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { useProduct } from "@/hooks/useProduct";
import { useCartStore } from "@/lib/store/cart-store";
import { useCart, useUpdateCartItem } from "@/hooks/useCart";
import { formatMoney } from "@/lib/format-money";
import { VariantSelector } from "@/components/commerce/VariantSelector";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { PageHeading } from "@/components/shared/PageHeading";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { ProductDetail, ProductVariant } from "@/lib/duka/types";

function resolveVariant(
  variants: ProductVariant[],
  selectedAttributes: Record<string, string>,
): ProductVariant | undefined {
  return variants.find((variant) =>
    Object.entries(selectedAttributes).every(
      ([key, value]) => variant.attributeValues[key] === value,
    ),
  );
}

// initialProduct comes from the server page so the full product HTML is in the first response
// (crawlers that skip JavaScript, including most LLM bots, would otherwise only see the skeleton).
export function ProductDetailView({
  slug,
  initialProduct,
}: {
  slug: string;
  initialProduct?: ProductDetail;
}) {
  const {
    data: product,
    isLoading,
    isError,
  } = useProduct(slug, initialProduct);
  const cartId = useCartStore((state) => state.cartId);
  const { cart } = useCart();
  const updateItem = useUpdateCartItem();
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});

  const selectedVariant = useMemo(
    () =>
      product
        ? resolveVariant(product.variants, selectedAttributes)
        : undefined,
    [product, selectedAttributes],
  );

  if (isError) notFound();

  if (isLoading || !product) {
    return (
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:px-10 lg:grid-cols-12 lg:px-16">
        <div className="aspect-square animate-pulse bg-surface lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <div className="h-8 w-2/3 animate-pulse bg-surface" />
          <div className="h-4 w-1/3 animate-pulse bg-surface" />
        </div>
      </div>
    );
  }

  const displayVariant = selectedVariant ?? product.variants[0];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/shop/${product.category.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        <div className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
          {product.category && (
            <SectionKicker>{product.category.name}</SectionKicker>
          )}
          <div className="mt-4">
            <PageHeading>{product.name}</PageHeading>
          </div>
          {displayVariant && (
            <p className="mt-6 text-lg font-light tracking-[0.08em] text-bone">
              {formatMoney(displayVariant.priceMinorUnits)}
            </p>
          )}
          {/* product.description is HTML authored in the catalog (see docs/storefront-api.md), not
              user-submitted — rendering it lets the store's own paragraph breaks show correctly. */}
          <div
            className="mt-6 text-[0.9375rem] leading-[1.75] text-bone/80 [&_p+p]:mt-4"
            dangerouslySetInnerHTML={{ __html: product.description }}
            id="product-body"
          />

          <div className="mt-8 border-t border-bone/10 pt-8">
            <VariantSelector
              variants={product.variants}
              selectedAttributes={selectedAttributes}
              onSelectAttribute={(key, value) =>
                setSelectedAttributes((prev) => ({ ...prev, [key]: value }))
              }
            />
          </div>

          <div className="mt-8">
            <AddToCartButton
              outOfStock={!displayVariant || displayVariant.stock === 0}
              loading={updateItem.isPending}
              onAdd={() => {
                if (!cartId || !displayVariant) return;
                // PATCH sets an absolute quantity, not a delta (docs/storefront-api.md
                // §5.6) — increment from whatever's already in the cart for this variant.
                const existingQuantity =
                  cart?.items.find(
                    (item) => item.productVariantId === displayVariant.id,
                  )?.quantity ?? 0;
                return updateItem.mutateAsync({
                  productVariantId: displayVariant.id,
                  quantity: existingQuantity + 1,
                });
              }}
            />
            {displayVariant && displayVariant.stock === 0 && (
              <p className="mt-3 text-xs text-bone/60">
                This option is currently unavailable.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
