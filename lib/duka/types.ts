// Shapes mirror docs/storefront-api.md exactly — do not rename fields, the
// route handlers pass these straight through from Duka's JSON responses.

export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "active";
  category: { id: string; name: string; slug: string } | null;
  thumbnail: string | null;
  /** Every image in display order; images[0] is the thumbnail (§5.2). Drives the card hover swap. */
  images: string[];
  minPriceMinorUnits: number | null;
  maxPriceMinorUnits: number | null;
  /** Total units across all variants — for a sold-out badge only, not a quantity cap. */
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  barcode: string | null;
  priceMinorUnits: number;
  attributeValues: Record<string, string>;
  stock: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "active";
  category: { id: string; name: string; slug: string } | null;
  images: string[];
  variants: ProductVariant[];
};

export type Paginated<T> = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  items: T[];
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotalMinorUnits: number;
  taxMinorUnits: number;
  discountMinorUnits: number;
  couponCode: string | null;
  totalMinorUnits: number;
  pricesIncludeTax: boolean;
};

export type CartItem = {
  productVariantId: string;
  productName: string;
  productSlug: string;
  sku: string;
  attributeValues: Record<string, string>;
  image: string | null;
  quantity: number;
  /** The variant's current units on hand — the cap for this line's quantity. */
  stock: number;
  unitPriceMinorUnits: number;
  lineTotalMinorUnits: number;
};

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type FulfillmentStatus =
  | "received"
  | "payment_confirmed"
  | "inventory_updated"
  | "picking"
  | "packing"
  | "dispatched"
  | "delivered"
  | "completed"
  | "feedback";

export type OrderItem = {
  id: string;
  productVariantId: string;
  productName: string;
  sku: string;
  attributeValues: Record<string, string>;
  quantity: number;
  unitPriceMinorUnits: number;
  discountMinorUnits: number;
  taxMinorUnits: number;
  lineTotalMinorUnits: number;
};

export type Order = {
  id: string;
  origin: string;
  status: FulfillmentStatus;
  syncStatus: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  subtotalMinorUnits: number;
  taxMinorUnits: number;
  discountMinorUnits: number;
  couponCode: string | null;
  totalMinorUnits: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  paymentMethod: string | null;
  paymentDetails: unknown;
  /** `null` on orders placed before fulfilment options existed (§5.10). */
  fulfilmentMethod: FulfilmentMethod | "in_store" | null;
  deliveryAddress: DeliveryAddress | null;
  pickupLocation: { locationId: string; name: string; address: string; phone: string | null } | null;
  deliveryFeeMinorUnits: number | null;
  deliveryNote: string | null;
  courier: string | null;
  trackingReference: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type CheckoutResponse = Order & {
  payment?: { redirectUrl: string; reference: string };
};

export type OrderSummary = Omit<Order, "items">;

export type FulfilmentMethod = "delivery" | "pickup";

export type DeliveryAddress = {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  landmark?: string;
};

/** GET /store (§5.17). */
export type StoreInfo = {
  name: string;
  logoUrl: string | null;
  accentColor: string | null;
  currency: string;
  pricesIncludeTax: boolean;
  contact: { phone: string | null; address: string | null };
  delivery:
    | { enabled: false }
    | { enabled: true; feeMode: "flat"; feeMinorUnits: number }
    | { enabled: true; feeMode: "note"; note: string };
  pickup: { available: boolean };
};

/** GET /pickup-locations (§5.18). */
export type PickupLocation = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
};

/** POST /checkout body (§5.9). */
export type CheckoutRequest = {
  cartId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
  fulfilmentMethod: FulfilmentMethod;
  deliveryAddress?: DeliveryAddress;
  pickupLocationId?: string;
};

export type ProductSort = "name" | "newest" | "best_selling" | "price_asc" | "price_desc";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};
