"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { CheckoutForm } from "@/components/commerce/CheckoutForm";
import { OrderSummaryPanel } from "@/components/commerce/OrderSummaryPanel";
import { PageHeading } from "@/components/shared/PageHeading";

export default function CheckoutPage() {
  const { cart, isLoading } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && cart && cart.items.length === 0) {
      router.replace("/cart");
    }
  }, [isLoading, cart, router]);

  if (isLoading || !cart || cart.items.length === 0) {
    return <div className="mx-auto max-w-4xl px-6 py-12 text-sm text-bone/60">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
      <PageHeading>Checkout</PageHeading>
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
        <CheckoutForm />
        <div className="lg:sticky lg:top-24">
          <OrderSummaryPanel source={cart} />
        </div>
      </div>
    </div>
  );
}
