"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/hooks/useCheckout";
import { useAccount } from "@/hooks/useAccount";
import { useCartStore } from "@/lib/store/cart-store";
import { ApiError } from "@/lib/api-client";
import { formatOrderNumber } from "@/lib/format-order-status";
import { CHECKOUT_MODE, GENERAL_INQUIRY_MESSAGE, buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { Button } from "@/components/shared/Button";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "@/components/shared/field-styles";

const LAST_ORDER_ID_KEY = "panache:lastOrderId";

type CheckoutError = { kind: "api"; message: string } | { kind: "generic" };

export function CheckoutForm() {
  const router = useRouter();
  const cartId = useCartStore((state) => state.cartId);
  const isLoggedIn = useCartStore((state) => state.isLoggedIn);
  const { data: account } = useAccount();
  const checkout = useCheckout();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<CheckoutError | null>(null);

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
          if (CHECKOUT_MODE === "whatsapp") {
            // Popup blockers commonly stop window.open — the confirmation page
            // repeats this same link as a visible fallback if it was blocked.
            const message = buildOrderMessage(formatOrderNumber(order.id), account?.name ?? name);
            window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
            router.push(`/order-confirmation?orderId=${order.id}`);
            return;
          }

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
          setError(err instanceof ApiError ? { kind: "api", message: err.message } : { kind: "generic" });
        },
      }
    );
  }

  const whatsapp = CHECKOUT_MODE === "whatsapp";

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
          <Field label="Name" value={name} onChange={setName} type="text" autoComplete="name" required={whatsapp} />
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
          <Field label="Phone" value={phone} onChange={setPhone} type="tel" autoComplete="tel" />
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-(--color-error)">
          {error.kind === "api" ? (
            error.message
          ) : whatsapp ? (
            <>
              Something went wrong. Please try again, or message us on{" "}
              <a
                href={buildWhatsAppLink(GENERAL_INQUIRY_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-gold"
              >
                WhatsApp
              </a>
              .
            </>
          ) : (
            "Something went wrong."
          )}
        </p>
      )}

      <Button type="submit" variant="primary-gold" className="w-full" loading={checkout.isPending}>
        {whatsapp
          ? checkout.isPending
            ? "Opening WhatsApp…"
            : "Continue on WhatsApp"
          : checkout.isPending
            ? "Placing Order…"
            : "Place Order"}
      </Button>
      {whatsapp && (
        <p className="text-center text-xs text-bone/60">
          We&apos;ll open WhatsApp so you can confirm your order with us directly.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
  autoComplete: string;
  required?: boolean;
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
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 ${FIELD_CLASS}`}
      />
    </div>
  );
}

export { LAST_ORDER_ID_KEY };
