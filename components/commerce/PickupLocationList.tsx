import { RadioCard } from "@/components/commerce/RadioCard";
import type { PickupLocation } from "@/lib/duka/types";

/** Radio list of the store's pickup locations (PRD R3). */
export function PickupLocationList({
  locations,
  isLoading,
  isError,
  selectedId,
  onSelect,
}: {
  locations: PickupLocation[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (isLoading) {
    return (
      <div
        className="h-16 animate-pulse bg-surface"
        aria-label="Loading pickup locations"
      />
    );
  }
  if (isError || !locations || locations.length === 0) {
    return (
      <p role="alert" className="text-sm text-bone/70">
        No pickup locations are available right now. Please choose delivery.
      </p>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Pickup location</legend>
      {locations.map((location) => (
        <RadioCard
          key={location.id}
          name="pickup-location"
          value={location.id}
          checked={selectedId === location.id}
          onChange={() => onSelect(location.id)}
        >
          <span className="block font-medium text-bone">{location.name}</span>
          <span className="block text-bone/70">{location.address}</span>
          {location.phone && (
            <span className="block text-bone/50">{location.phone}</span>
          )}
        </RadioCard>
      ))}
    </fieldset>
  );
}
