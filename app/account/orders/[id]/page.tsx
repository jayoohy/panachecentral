"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { useAccountOrder } from "@/hooks/useAccountOrders";
import { useCartStore } from "@/lib/store/cart-store";
import { formatOrderReference } from "@/lib/format-order-status";
import { PaymentStatusBadge, FulfillmentStatusBadge } from "@/components/commerce/StatusBadges";
import { OrderSummaryPanel } from "@/components/commerce/OrderSummaryPanel";
import { PageHeading } from "@/components/shared/PageHeading";
import { buttonClassName } from "@/components/shared/Button";

export default function AccountOrderDetailPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = use(params);
  const isLoggedIn = useCartStore((state) => state.isLoggedIn);
  const router = useRouter();
  const { data: order, isLoading, isError } = useAccountOrder(id);

  useEffect(() => {
    if (!isLoggedIn) router.replace(`/account/login?redirect=/account/orders/${id}`);
  }, [isLoggedIn, router, id]);

  if (!isLoggedIn) return null;

  if (isError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="font-serif text-xl text-bone">We couldn&apos;t find this order.</p>
        <Link href="/account/orders" className={buttonClassName("outline", "mt-6")}>
          Back to Orders
        </Link>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <div className="h-24 animate-pulse rounded-none bg-surface" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
      <PageHeading>{formatOrderReference(order.id)}</PageHeading>
      <div className="mt-3 flex gap-2">
        <PaymentStatusBadge status={order.paymentStatus} />
        <FulfillmentStatusBadge status={order.status} />
      </div>
      <div className="mt-8">
        <OrderSummaryPanel source={order} />
      </div>
    </div>
  );
}
