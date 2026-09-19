"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/useAccount";
import { useCartStore } from "@/lib/store/cart-store";
import { AccountNav } from "@/components/commerce/AccountNav";
import { PageHeading } from "@/components/shared/PageHeading";

export default function AccountPage() {
  const isLoggedIn = useCartStore((state) => state.isLoggedIn);
  const router = useRouter();
  const { data: account, isLoading } = useAccount();

  useEffect(() => {
    if (!isLoggedIn) router.replace("/account/login?redirect=/account");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
      <PageHeading>My Account</PageHeading>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-8 space-y-4">
        {isLoading || !account ? (
          <div className="h-20 animate-pulse rounded-none bg-surface" />
        ) : (
          <dl className="space-y-3 text-sm">
            <Row label="Name" value={account.name} />
            <Row label="Email" value={account.email} />
            <Row label="Phone" value={account.phone ?? "Not provided"} />
          </dl>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-bone/10 pb-3">
      <dt className="text-bone/50">{label}</dt>
      <dd className="text-bone">{value}</dd>
    </div>
  );
}
