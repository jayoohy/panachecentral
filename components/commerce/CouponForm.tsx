"use client";

import { useState } from "react";
import { useApplyCoupon, useRemoveCoupon } from "@/hooks/useCart";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/shared/Button";
import { FIELD_CLASS } from "@/components/shared/field-styles";

/**
 * Success = discount row fades in on the cart (owned by CartSummary once the
 * mutation resolves). Error = the input shakes with the API's message shown
 * verbatim (design spec §5/§8).
 */
export function CouponForm({ couponCode }: { couponCode: string | null }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    applyCoupon.mutate(code, {
      onSuccess: () => setCode(""),
      onError: (err) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong.");
        setShaking(true);
        setTimeout(() => setShaking(false), 300);
      },
    });
  }

  if (couponCode) {
    return (
      <div className="flex items-center justify-between border border-gold/30 bg-surface px-4 py-2 text-sm">
        <span className="text-bone">
          Code applied: <span className="font-medium">{couponCode}</span>
        </span>
        <button
          type="button"
          onClick={() => removeCoupon.mutate()}
          className="text-bone/50 underline underline-offset-2 hover:text-bone"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Coupon code"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "coupon-error" : undefined}
          data-shaking={shaking}
          className={`t-shake flex-1 ${FIELD_CLASS}`}
        />
        <Button type="submit" variant="outline" loading={applyCoupon.isPending} disabled={!code}>
          Apply
        </Button>
      </div>
      {error && (
        <p id="coupon-error" role="alert" className="text-xs text-(--color-error)">
          {error}
        </p>
      )}
    </form>
  );
}
