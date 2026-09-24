import type { Order } from "@/lib/duka/types";

/**
 * Where an order is going (PRD R5): the delivery address, or the pickup
 * location, plus courier/tracking once dispatched (§5.10). Renders nothing for
 * orders placed before fulfilment options existed, or in-store sales.
 */
export function FulfilmentDetails({ order }: { order: Order }) {
  const {
    fulfilmentMethod,
    deliveryAddress,
    pickupLocation,
    courier,
    trackingReference,
  } = order;
  if (fulfilmentMethod === "delivery" && deliveryAddress) {
    return (
      <Block heading="Delivery">
        <p className="font-medium text-bone">{deliveryAddress.recipientName}</p>
        <p>{deliveryAddress.addressLine}</p>
        {deliveryAddress.landmark && <p>{deliveryAddress.landmark}</p>}
        <p>
          {deliveryAddress.city}, {deliveryAddress.state}
        </p>
        <p className="text-bone/50">{deliveryAddress.phone}</p>
        {(courier || trackingReference) && (
          <p className="mt-3 text-bone/70">
            {courier ? `Sent with ${courier}` : "Dispatched"}
            {trackingReference && ` · Tracking ${trackingReference}`}
          </p>
        )}
      </Block>
    );
  }
  if (fulfilmentMethod === "pickup" && pickupLocation) {
    return (
      <Block heading="Pickup">
        <p className="font-medium text-bone">{pickupLocation.name}</p>
        <p>{pickupLocation.address}</p>
        {pickupLocation.phone && (
          <p className="text-bone/50">{pickupLocation.phone}</p>
        )}
      </Block>
    );
  }
  return null;
}

function Block({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-bone/10 bg-surface p-6">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone/60">
        {heading}
      </p>
      <div className="mt-3 space-y-0.5 text-sm text-bone/80">{children}</div>
    </div>
  );
}
