"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/hooks/useCheckout";
import { useAccount } from "@/hooks/useAccount";
import { useCartStore } from "@/lib/store/cart-store";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/shared/Button";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "@/components/shared/field-styles";

const LAST_ORDER_ID_KEY = "panache:lastOrderId";

export function CheckoutForm() {
  const router = useRouter();
  const cartId = useCartStore((state) => state.cartId);
  const isLoggedIn = useCartStore((state) => state.isLoggedIn);
  const { data: account } = useAccount();
  const checkout = useCheckout();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!cartId) return;
    setError(null);

    const returnUrl = `${window.location.origin}/order-confirmation`;

    checkout.mutate(
      {
        cartId,
        customerName: isLoggedIn ? undefined : name || undefined,
        customerEmail: isLoggedIn ? undefined : email || undefined,
        customerPhone: isLoggedIn ? undefined : phone || undefined,
        returnUrl,
      },
      {
        onSuccess: (order) => {
          if (order.payment?.redirectUrl) {
            // The gateway's own redirect strips any query params we'd want
            // to add to returnUrl after the fact (we don't know the order id
            // until this very response, which arrives after returnUrl was
            // already submitted) — sessionStorage survives the round trip
            // to the gateway and back, so /order-confirmation can recover it.
            sessionStorage.setItem(LAST_ORDER_ID_KEY, order.id);
            window.location.href = order.payment.redirectUrl;
          } else {
            // No gateway leg — we control this navigation directly, so the
            // order id can go straight in the query string (design spec F7).
            router.push(`/order-confirmation?orderId=${order.id}`);
          }
        },
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : "Something went wrong.");
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isLoggedIn && account ? (
        <div className="border border-bone/10 bg-surface p-4 text-sm">
          Checking out as <span className="font-medium">{account.name}</span> ({account.email})
        </div>
      ) : (
        <>
          <p className="text-sm text-bone/70">
            Have an account?{" "}
            <a href="/account/login" className="text-bone underline underline-offset-2 hover:text-gold">
              Log in for faster checkout.
            </a>
          </p>
          <Field label="Name" value={name} onChange={setName} type="text" autoComplete="name" />
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
          <Field label="Phone" value={phone} onChange={setPhone} type="tel" autoComplete="tel" />
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-(--color-error)">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary-gold" className="w-full" loading={checkout.isPending}>
        {checkout.isPending ? "Placing Order…" : "Place Order"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
  autoComplete: string;
}) {
  const id = `checkout-${label.toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className={FIELD_LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 ${FIELD_CLASS}`}
      />
    </div>
  );
}

export { LAST_ORDER_ID_KEY };
