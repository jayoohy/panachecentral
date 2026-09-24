"use client";

import { RadioCard } from "@/components/commerce/RadioCard";
import { DeliveryAddressFields } from "@/components/commerce/DeliveryAddressFields";
import { PickupLocationList } from "@/components/commerce/PickupLocationList";
import { FIELD_LABEL_CLASS } from "@/components/shared/field-styles";
import { usePickupLocations } from "@/hooks/useStoreInfo";
import type { CheckoutFulfilment } from "@/hooks/useCheckoutFulfilment";
import type { FulfilmentMethod } from "@/lib/duka/types";
import { GENERAL_INQUIRY_MESSAGE, buildWhatsAppLink } from "@/lib/whatsapp";

const OPTIONS: Record<
  FulfilmentMethod,
  { label: string; description: string }
> = {
  delivery: {
    label: "Delivery",
    description: "We'll bring it to your address.",
  },
  pickup: {
    label: "Pickup",
    description: "Collect it from one of our locations.",
  },
};

/**
 * Checkout's "How would you like to receive it?" block (PRD R1–R3): loading,
 * error, nothing-offered, and the delivery/pickup choice with its fields.
 * Copy per docs/design/storefront-api-readiness-design-spec.md §8.
 */
export function FulfilmentSection({
  fulfilment,
}: {
  fulfilment: CheckoutFulfilment;
}) {
  const {
    store,
    methods,
    method,
    setMethod,
    address,
    updateAddress,
    pickupLocationId,
    setPickupLocationId,
  } = fulfilment;
  const pickup = usePickupLocations(method === "pickup");

  return (
    // Border on a wrapper: a fieldset's own border is drawn through its <legend>.
    <div className="border-t border-bone/10 pt-6">
      <fieldset className="space-y-4">
        <legend className={`${FIELD_LABEL_CLASS} mb-4`}>
          How would you like to receive it?
        </legend>

        {store.isLoading ? (
          <div className="space-y-2" aria-label="Loading delivery options">
            <div className="h-16 animate-pulse bg-surface" />
            <div className="h-16 animate-pulse bg-surface" />
          </div>
        ) : store.isError ? (
          <p role="alert" className="text-sm text-(--color-error)">
            We couldn&apos;t load delivery options.{" "}
            <button
              type="button"
              onClick={() => store.refetch()}
              className="underline underline-offset-2 hover:text-gold"
            >
              Try again
            </button>
            , or message us on{" "}
            <a
              href={buildWhatsAppLink(GENERAL_INQUIRY_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gold"
            >
              WhatsApp
            </a>
            .
          </p>
        ) : methods.length === 0 ? (
          <p role="alert" className="text-sm text-bone/70">
            This store isn&apos;t taking online orders right now.
          </p>
        ) : (
          <>
            <div
              className={`grid gap-2 ${methods.length > 1 ? "sm:grid-cols-2" : ""}`}
            >
              {methods.map((option) => (
                <RadioCard
                  key={option}
                  name="fulfilment-method"
                  value={option}
                  checked={method === option}
                  onChange={() => setMethod(option)}
                >
                  <span className="block font-medium text-bone">
                    {OPTIONS[option].label}
                  </span>
                  <span className="block text-bone/60">
                    {OPTIONS[option].description}
                  </span>
                </RadioCard>
              ))}
            </div>

            {method === "delivery" && (
              <DeliveryAddressFields
                address={address}
                onChange={updateAddress}
              />
            )}
            {method === "pickup" && (
              <PickupLocationList
                locations={pickup.data}
                isLoading={pickup.isLoading}
                isError={pickup.isError}
                selectedId={pickupLocationId}
                onSelect={setPickupLocationId}
              />
            )}
          </>
        )}
      </fieldset>
    </div>
  );
}
