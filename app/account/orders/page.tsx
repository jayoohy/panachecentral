"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountOrders } from "@/hooks/useAccountOrders";
import { useCartStore } from "@/lib/store/cart-store";
import { AccountNav } from "@/components/commerce/AccountNav";
import { OrderHistoryRow } from "@/components/commerce/OrderHistoryRow";
import { Pagination } from "@/components/commerce/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeading } from "@/components/shared/PageHeading";

export default function AccountOrdersPage() {
  const isLoggedIn = useCartStore((state) => state.isLoggedIn);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAccountOrders(page);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/account/login?redirect=/account/orders");
  }, [isLoggedIn, router]);

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!isLoggedIn) return null;

  return (
    <div ref={topRef} className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
      <PageHeading>My Account</PageHeading>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-none bg-surface" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            heading="No orders yet."
            body="When you make a purchase, it will appear here."
            cta={{ label: "Start Shopping", href: "/shop" }}
          />
        ) : (
          <>
            {data.items.map((order) => (
              <OrderHistoryRow key={order.id} order={order} />
            ))}
            <Pagination page={data.page} totalPages={data.totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}
