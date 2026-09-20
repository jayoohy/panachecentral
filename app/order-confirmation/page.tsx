"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useOrder } from "@/hooks/useOrder";
import { useAccount } from "@/hooks/useAccount";
import { formatOrderNumber, formatOrderReference } from "@/lib/format-order-status";
import { CHECKOUT_MODE, buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { PaymentStatusBadge, FulfillmentStatusBadge } from "@/components/commerce/StatusBadges";
import { OrderSummaryPanel } from "@/components/commerce/OrderSummaryPanel";
import { SuccessCheck } from "@/components/commerce/SuccessCheck";
import { PageHeading } from "@/components/shared/PageHeading";
import { buttonClassName } from "@/components/shared/Button";

const LAST_ORDER_ID_KEY = "panache:lastOrderId";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-20" />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  // Gateway redirects strip any query params beyond what returnUrl already
  // had — see components/commerce/CheckoutForm.tsx for why the id is
  // recovered from sessionStorage on this specific path. Read directly in
  // render rather than an effect+setState pass — sessionStorage is
  // synchronously available and this route is never statically prerendered.
  const orderId =
    searchParams.get("orderId") ??
    (typeof window !== "undefined" ? sessionStorage.getItem(LAST_ORDER_ID_KEY) : null);

  const whatsapp = CHECKOUT_MODE === "whatsapp";
  const { data: order, isLoading, isError } = useOrder(orderId ?? "", token, { poll: !whatsapp });
  const { data: account } = useAccount();
  const [showSuccess, setShowSuccess] = useState(false);
  const previousStatus = useRef(order?.paymentStatus);

  useEffect(() => {
    if (!whatsapp && order?.paymentStatus === "paid" && previousStatus.current !== "paid") {
      setShowSuccess(true);
    }
    previousStatus.current = order?.paymentStatus;
  }, [order?.paymentStatus, whatsapp]);

  if (!orderId || isError) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="font-serif text-xl text-bone">We couldn&apos;t find this order.</p>
        <Link href="/" className={buttonClassName("outline", "mt-6")}>
          Back to Panache Central
        </Link>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-20">
        <div className="h-6 w-2/3 animate-pulse rounded-none bg-surface" />
        <div className="h-24 animate-pulse rounded-none bg-surface" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {showSuccess && (
        <div className="mb-6 flex justify-center">
          <SuccessCheck />
        </div>
      )}
      <div className="text-center">
        <PageHeading>{whatsapp ? "Thank you. We've received your order." : "Thank you. Your order is confirmed."}</PageHeading>
        <p className="mt-2 text-sm text-bone/60">{formatOrderReference(order.id)}</p>
        {whatsapp ? (
          <div className="mt-6">
            <a
              href={buildWhatsAppLink(buildOrderMessage(formatOrderNumber(order.id), order.customerName ?? account?.name))}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName("primary-gold")}
            >
              Continue on WhatsApp
            </a>
          </div>
        ) : (
          <>
            <div className="mt-4 flex justify-center gap-2">
              <PaymentStatusBadge status={order.paymentStatus} />
              <FulfillmentStatusBadge status={order.status} />
            </div>
            {order.paymentStatus === "pending" && (
              <p className="mt-3 text-sm text-bone/60">
                Confirming your payment — this can take a few seconds.
              </p>
            )}
            {order.paymentStatus === "failed" && (
              <div className="mt-3">
                <p className="text-sm text-(--color-error)">
                  Payment didn&apos;t go through. No charge was made — you&apos;re welcome to try again.
                </p>
                <Link href="/shop" className={buttonClassName("outline", "mt-4")}>
                  Browse the Collection
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-10">
        <OrderSummaryPanel source={order} />
      </div>
    </div>
  );
}
