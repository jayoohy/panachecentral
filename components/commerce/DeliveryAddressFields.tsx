import { CheckoutField } from "@/components/commerce/CheckoutField";
import {
  FIELD_CLASS,
  FIELD_LABEL_CLASS,
} from "@/components/shared/field-styles";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import type { DeliveryAddress } from "@/lib/duka/types";

/** Nigerian delivery address group (PRD R2): every field required except landmark. */
export function DeliveryAddressFields({
  address,
  onChange,
}: {
  address: DeliveryAddress;
  onChange: (field: keyof DeliveryAddress, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <CheckoutField
        id="delivery-recipient"
        label="Recipient name"
        value={address.recipientName}
        onChange={(value) => onChange("recipientName", value)}
        autoComplete="shipping name"
        required
      />
      <CheckoutField
        id="delivery-phone"
        label="Phone"
        type="tel"
        value={address.phone}
        onChange={(value) => onChange("phone", value)}
        autoComplete="shipping tel"
        required
      />
      <CheckoutField
        id="delivery-address"
        label="Address"
        value={address.addressLine}
        onChange={(value) => onChange("addressLine", value)}
        autoComplete="shipping street-address"
        required
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CheckoutField
          id="delivery-city"
          label="City"
          value={address.city}
          onChange={(value) => onChange("city", value)}
          autoComplete="shipping address-level2"
          required
        />
        <div>
          <label htmlFor="delivery-state" className={FIELD_LABEL_CLASS}>
            State
          </label>
          <select
            id="delivery-state"
            required
            autoComplete="shipping address-level1"
            value={address.state}
            onChange={(event) => onChange("state", event.target.value)}
            className={`mt-1 ${FIELD_CLASS} [&>option]:bg-surface`}
          >
            <option value="" disabled>
              Choose a state
            </option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>
      <CheckoutField
        id="delivery-landmark"
        label="Landmark"
        value={address.landmark ?? ""}
        onChange={(value) => onChange("landmark", value)}
      />
    </div>
  );
}
