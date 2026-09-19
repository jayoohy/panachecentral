# Storefront API

Reference for building a customer-facing storefront (web or mobile) against
the Duka commerce platform. This covers the **entire** public storefront
surface, documented below in full. Everything else in the API
(`/catalogue/*`, `/orders/*` without the `storefront` prefix, `/staff`,
`/platform/*`, etc.) is the admin dashboard's API and is out of scope here —
do not call it from a storefront client.

Live interactive spec: `GET /api/docs` (Swagger UI) on the API host.

## 1. Base URL & tenant resolution

Every request must resolve to exactly one tenant (store). The API picks the
tenant in this order — pick **one** and be consistent:

| Method | How | When to use |
|---|---|---|
| Subdomain | Host header is `{tenant-slug}.duka.app` (or configured `APP_BASE_DOMAIN`) | Production storefronts served on the tenant's subdomain |
| Custom domain | Host header matches a verified `domain_mappings` row | Tenant has mapped their own domain |
| API key | `X-API-Key` header alone (no host match needed) | Local dev, mobile apps, or any client not served from the tenant's domain |

For local development or a storefront not hosted on the tenant's own
(sub)domain, **the API key is sufficient** — you do not need to send a
fake Host header.

Base path for every endpoint in this document: `/api/storefront/v1`.

## 2. Authentication

All storefront routes require two headers, in addition to whatever resolves
the tenant (see above):

```
X-API-Key: <tenant's public key>
X-API-Secret: <tenant's secret>
```

- Both are per-tenant, generated in the admin dashboard under
  **Developers → API Key** (`POST /developers/api-key/regenerate`, admin-only,
  session-authenticated — not part of this storefront surface).
- The secret is shown **once**, at generation time, and is never
  retrievable again — store it in your storefront's server-side env config,
  never ship it to a browser bundle. If a storefront is a client-rendered SPA,
  proxy storefront API calls through your own backend/edge function so the
  secret never reaches the browser.
- Regenerating rotates both key and secret and immediately invalidates the
  old pair — expect to update your deployed config when you rotate.
- Missing or mismatched key/secret → `401 Unauthorized`.
- No tenant could be resolved at all → `403 Forbidden`.

### 2.1 Customer sessions (optional)

Customer accounts are entirely optional — guest checkout with just the
tenant `X-API-Key`/`X-API-Secret` above works exactly as it always has.
Registering/logging in a customer adds a **second**, independent layer on
top: an `HttpOnly` session cookie (`duka_customer_session`), scoped to one
customer on one tenant, set by §5.12/§5.13 below and required on the
`account/*` routes (§5.16).

- The customer session cookie is unrelated to the admin dashboard's session
  cookie — a browser can hold both at once without conflict, and neither
  authorizes the other's routes.
- `POST checkout` (§5.9) reads this cookie **if present** to attach the
  resulting order to the logged-in customer's account, but never requires
  it — a request with no cookie (or an expired one) checks out as a guest
  exactly as before.
- The cookie is `Secure` in production and not readable by JavaScript
  (`HttpOnly`) — if your storefront is a client-rendered SPA, proxy these
  calls through your own backend the same way §2 already recommends for the
  API key/secret, so the browser only ever talks to your own origin.
- Session lasts 30 days from login/registration; there's no refresh
  endpoint — re-login once it expires.

## 3. Rate limiting

Requests are rate-limited **per tenant**, per rolling 60-second window, at a
limit set by the tenant's subscription tier (`starter` 60/min, `growth`
120/min, `business` 300/min, `enterprise` 1000/min). Exceeding it returns
`429 Too Many Requests`. Build in retry/backoff on 429 rather than hard-failing.

## 4. Conventions

- **Money** is always an integer in minor units (kobo/cents), never a float.
  Divide by 100 for display, and format/currency-symbol on the client based
  on the `currency` field (default `"NGN"`).
- **IDs** are UUIDs (strings).
- **Errors** use the default Nest shape:
  ```json
  { "statusCode": 400, "message": "cartId is required", "error": "Bad Request" }
  ```
  `message` can be a string or an array of strings (validation errors).
- **Pagination** (catalogue list and `account/orders`) is page-based: `page`
  (1-indexed), `pageSize` (max 100). Responses include `total`, `totalPages`,
  `hasNextPage`, and `hasPrevPage` alongside `items`.
- **Accounts are optional.** A cart is identified purely by the opaque `id`
  returned from `POST /cart` — treat it like a token, and persist it
  client-side (e.g. `localStorage`) to resume a cart across visits,
  regardless of whether the shopper is logged in. Registering/logging in
  (§2.1) only affects checkout (which account, if any, the resulting order
  attaches to) and order history — it never changes how the cart itself works.

---

## 5. Endpoints

### 5.1 List categories

```
GET /api/storefront/v1/catalogue/categories
```

No query params. Returns every non-archived category for the tenant, sorted
by name. Categories can be nested (`parentId` points at another category in
this same list, or `null` for a top-level category) — build a tree/nav
client-side from `parentId` if the tenant uses nested categories; a
flat-category tenant will just have every row with `parentId: null`.

Response `200`:

```json
[
  {
    "id": "uuid",
    "parentId": null,
    "name": "Electronics",
    "slug": "electronics-a1b2",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

`tenantId` isn't returned — every request is already scoped to one tenant, so
it would just be the same value on every row. `archived` isn't returned
either, since this endpoint never returns archived categories in the first
place.

Use a category's `id` as the `categoryId` query param on §5.2 (list
products) to filter the product grid to that category.

### 5.2 List products

```
GET /api/storefront/v1/catalogue/products
```

Query params (all optional):

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | `1` | |
| `pageSize` | number | `20` | capped at 100 |
| `categoryId` | uuid | — | filter to one category |
| `search` | string | — | case-insensitive substring match on product name |

Only `status: "active"` products are ever returned — draft/archived products
never appear here, so you don't need to filter client-side.

Response `200`:

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 42,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPrevPage": false,
  "items": [
    {
      "id": "uuid",
      "name": "Wireless Mouse",
      "slug": "wireless-mouse-x7k2",
      "description": "...",
      "status": "active",
      "category": {
        "id": "uuid",
        "name": "Electronics",
        "slug": "electronics-a1b2"
      },
      "thumbnail": "https://.../mouse-front.jpg",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

`category` is the product's category, already resolved — no need for a
separate lookup against §5.1 to show a category name/breadcrumb on the grid.
`thumbnail` is the product's lead image URL (lowest `sortOrder`), or `null`
if the product has no images uploaded — render a placeholder in that case.

`tenantId` and `addedBy` aren't returned — they're internal ids (the tenant
is already fixed for the whole request, and `addedBy` is a staff audit
field) with no display use on a customer-facing grid.

Note: this list does **not** include variants, price, or stock — fetch
product detail for that. Design your product grid to show name/slug/thumbnail
and defer price/stock to the detail view or a follow-up batched call if you
need prices on the grid (not currently exposed as a batch endpoint — see
Known Gaps).

### 5.3 Get product detail

```
GET /api/storefront/v1/catalogue/products/:slug
```

Looked up by the product's `slug` (returned on the listing endpoint, §5.2),
not its internal `id` — the storefront never needs to know or expose the raw
database id in a public product URL.

Returns the product plus all variants, each annotated with pooled stock
(summed across all locations — the storefront never sees per-location stock).

Response `200`:

```json
{
  "id": "uuid",
  "name": "Wireless Mouse",
  "slug": "wireless-mouse-x7k2",
  "description": "...",
  "status": "active",
  "category": {
    "id": "uuid",
    "name": "Electronics",
    "slug": "electronics-a1b2"
  },
  "images": ["https://.../mouse-front.jpg", "https://.../mouse-side.jpg"],
  "variants": [
    {
      "id": "uuid",
      "sku": "WM-BLK-001",
      "barcode": "123456789012",
      "priceMinorUnits": 1500000,
      "attributeValues": { "color": "Black" },
      "stock": 42
    }
  ]
}
```

`images` is every uploaded product image, in display order (first is the
same one used as `thumbnail` on the list endpoint) — empty array if none.
`category` is nested the same way as §5.2, not a bare `categoryId`.

`404` if the product doesn't exist, isn't `active`, or belongs to another
tenant.

`priceMinorUnits` is the variant's price — a product with multiple variants
can have different prices per variant; always price off the variant, not the
product.

`stock` of `0` means out of stock — disable add-to-cart for that variant, the
API does not block adding an out-of-stock item to the cart itself (stock is
only enforced at checkout).

### 5.4 Create a cart

```
POST /api/storefront/v1/cart
```

No body. Creates an empty cart and returns it hydrated (empty).

Response `201`:

```json
{
  "id": "uuid",
  "items": [],
  "subtotalMinorUnits": 0,
  "taxMinorUnits": 0,
  "discountMinorUnits": 0,
  "couponCode": null,
  "totalMinorUnits": 0,
  "pricesIncludeTax": false
}
```

Call this once per shopper session and persist `id` client-side. Don't call
it again for the same shopper unless the stored cart id is gone/invalid.

### 5.5 Get a cart

```
GET /api/storefront/v1/cart/:id
```

Returns the same shape as create, hydrated with current items/totals. Use
this to refresh cart state (e.g. on page load, reading the stored cart id).

`404` if the cart doesn't exist or belongs to another tenant.

### 5.6 Set a cart item (add / update / remove)

```
PATCH /api/storefront/v1/cart/:id
```

Body:

```json
{ "productVariantId": "uuid", "quantity": 3 }
```

This is a **set**, not an increment — sending `quantity: 3` for a variant
already in the cart replaces its quantity with 3, it does not add 3 more.
Compute the new total client-side and send it.

- `quantity > 0` — upserts the line (inserts if new, updates if it already
  exists in the cart).
- `quantity === 0` — removes the line if present (no-op if not present).
- `quantity < 0` — not a valid removal signal, rejected with `400`.

Response `200`: the full hydrated cart (same shape as §5.4), so you can
re-render the cart from the response without a follow-up GET.

Note: this endpoint does **not** check stock — the check happens at
checkout. A quantity that exceeds available stock will succeed here and only
fail (or oversell, for POS reasons irrelevant to storefront) at checkout
time; show current `stock` from the product-detail response as a soft
client-side cap, but be ready to handle a checkout-time stock error.

### 5.7 Apply a coupon to the cart

```
POST /api/storefront/v1/cart/:id/coupon
```

Body:

```json
{ "code": "SAVE-AB12CD" }
```

Validates the code against the cart's current subtotal (active, not
expired, redemption limit not reached, subtotal meets the coupon's minimum)
and, if valid, stores it on the cart. Response `200`: the full hydrated cart
(same shape as §5.4), now with `discountMinorUnits` folded into
`totalMinorUnits` and `couponCode` set.

`400` with a specific reason if the code is invalid — e.g. `"Coupon is not
valid"`, `"Coupon has expired"`, `"Coupon redemption limit reached"`, or
`"Order does not meet the coupon minimum"` — show it to the shopper as-is.

Only one coupon per cart; applying a new code replaces whatever was applied
before (there's no separate "remove then apply" required).

Every subsequent `GET`/`PATCH` on this cart re-validates the stored code
against the *current* subtotal and against the coupon's live state (it could
be deactivated, expire, or hit its redemption limit from someone else's
checkout in the meantime). If it's no longer valid, the API silently clears
it and the response reverts to `discountMinorUnits: 0, couponCode: null` —
watch for the discount disappearing between reads rather than assuming it's
permanent once applied.

### 5.8 Remove a coupon from the cart

```
DELETE /api/storefront/v1/cart/:id/coupon
```

No body. Response `200`: the hydrated cart with `couponCode: null` and
`discountMinorUnits: 0`. No-op (still `200`) if no coupon was applied.

### 5.9 Checkout

```
POST /api/storefront/v1/checkout
```

Body:

```json
{
  "cartId": "uuid",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+2348012345678",
  "returnUrl": "https://your-storefront.example.com/order-confirmation"
}
```

`cartId` is required; the three customer fields are optional, but you should
collect at least `customerEmail` in your checkout form — it's both the
fallback contact method for a guest order and what triggers the order
confirmation email (see below).

If the request carries a valid customer session cookie (§2.1), the created
order is linked to that account automatically — nothing to add to this body
for it, and nothing changes if there's no session (guest checkout). If the
cart has a coupon applied (§5.7), it's redeemed into the order automatically
too; if that coupon went invalid between being applied and this call (e.g.
someone else exhausted its redemption limit first), checkout fails with
`400` rather than silently dropping the discount.

`returnUrl` is where the payment gateway sends the customer back after they
pay (or cancel) — see §6 below. It's **only required if the tenant has an
active payment gateway configured**; omit it entirely for a tenant with none
and checkout behaves exactly as if the field didn't exist. If a gateway is
active and `returnUrl` is missing, checkout fails with `400`.

This converts the cart to an order in one transaction: it prices every line
against current variant prices and tax rules (not whatever the cart preview
showed — the cart's tax preview at add-to-cart time is not location-aware,
checkout's is, so the total **can shift slightly** at this step), decrements
stock, and deletes the cart. **The cart id is no longer valid after this
call** — create a new cart for a subsequent order.

If `customerEmail` was provided (guest or logged-in), an order-confirmation
email is sent immediately with a link back to the order — see §5.10.

Response `201`: the created order (see §5.10 for the shape) with `items`
included, plus a `payment` key:

```json
{
  "...": "...order fields, see §5.10...",
  "paymentReference": "pay_...",
  "payment": {
    "redirectUrl": "https://checkout.paystack.com/abc123",
    "reference": "pay_..."
  }
}
```

- **Tenant has an active gateway**: `payment.redirectUrl` is where you send
  the customer next (a full browser redirect, not an XHR) to actually pay.
  `order.paymentStatus` is `"pending"` until a webhook confirms it — see §6.
- **Tenant has no gateway configured**: `payment` is `undefined` and
  `paymentReference` is `null`, exactly like every field behaved before this
  existed. Don't branch your checkout UI on the *absence* of gateway fields
  breaking anything — this is the fully-supported, unchanged default path.

Errors:
- `404` — cart not found.
- `400` — cart is empty, a variant in it no longer exists, or `returnUrl` is
  missing while a gateway is active.

### 5.10 Get an order

```
GET /api/storefront/v1/orders/:id
```

Same auth as every other route in this document (§2): tenant resolution +
`X-API-Key`/`X-API-Secret`, server-side only. For a browser-safe way to show
a customer their own order without those secrets, see §5.11 (guest
order-view link) or §5.16 (logged-in customer's own order history).

Response `200`:

```json
{
  "id": "uuid",
  "origin": "storefront",
  "status": "received",
  "syncStatus": "synced",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+2348012345678",
  "subtotalMinorUnits": 3000000,
  "taxMinorUnits": 225000,
  "discountMinorUnits": 0,
  "couponCode": null,
  "totalMinorUnits": 3225000,
  "currency": "NGN",
  "paymentStatus": "pending",
  "paymentReference": "pay_...",
  "paymentMethod": null,
  "paymentDetails": null,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "items": [
    {
      "id": "uuid",
      "productVariantId": "uuid",
      "productName": "Wireless Mouse",
      "sku": "WM-BLK-001",
      "attributeValues": { "color": "Black" },
      "quantity": 2,
      "unitPriceMinorUnits": 1500000,
      "discountMinorUnits": 0,
      "taxMinorUnits": 225000,
      "lineTotalMinorUnits": 3225000
    }
  ]
}
```

`tenantId` and `locationId` aren't returned — the tenant is already fixed
for the whole request, and the fulfilling store location isn't meaningful to
an online customer. Each item carries `productName`/`sku`/`attributeValues`
(resolved from the variant) so you can render "what did I buy" without a
follow-up product-detail call — `productVariantId` alone isn't enough to
show a line item.

Use this to render an order confirmation / tracking page.

`paymentStatus` (`pending | paid | failed | refunded`) is the **financial**
status — whether the customer has actually paid. It's tracked separately
from `status`, which is the **fulfillment** lifecycle
(`received → payment_confirmed → inventory_updated → picking → packing →
dispatched → delivered → completed → feedback`). Nothing in the API
currently advances `status` automatically off of `paymentStatus` — a paid
order still needs a merchant to move it through fulfillment by hand (or your
own integration to do so). Poll this endpoint (or redirect the customer back
to a page that does, from your `returnUrl` — see §6) to find out whether
payment succeeded.

`404` if the order doesn't exist or belongs to another tenant.

### 5.11 Guest order-view link

```
GET /api/storefront/v1/orders/:id/view?token=<token>
```

The route the order-confirmation email (sent automatically by §5.9 whenever
`customerEmail` is provided) links to. Deliberately **not** behind
`X-API-Key`/`X-API-Secret` — `token` is a single-order-scoped, signed link
issued at checkout time, so a customer can click straight through from their
inbox with no server-side secret involved and no account required.

Response `200`: the same order shape as §5.10.

- The token only ever authorizes the exact order it was issued for — it
  can't be edited or reused to view a different order (`403` if you try).
- Valid for 90 days from checkout. There's currently no "look up my order by
  email" fallback once it expires — if you need one, build it against
  `account/orders` (§5.16) instead, which requires the customer to have an
  account.
- This is the same order whether the checkout was a guest or a logged-in
  customer — both get an email with this link.

### 5.12 Register

```
POST /api/storefront/v1/account/register
```

Body: `{ "email": "jane@example.com", "password": "at least 8 characters", "name": "Jane Doe", "phone": "+2348012345678" }`
(`phone` optional).

Creates a customer account scoped to the resolved tenant and immediately
logs it in — response `200` is `{ "customer": { "id", "name", "email", "phone" } }`,
with the session cookie (§2.1) set on the response. `409` if that email is
already registered for this tenant (a different tenant can reuse the same
email — accounts aren't global).

### 5.13 Login

```
POST /api/storefront/v1/account/login
```

Body: `{ "email": "jane@example.com", "password": "..." }`. Same response
shape as register, session cookie set the same way. `401` on a wrong
email/password.

### 5.14 Logout

```
POST /api/storefront/v1/account/logout
```

No body. Clears the session cookie. Always `200`, even if there was no
session to clear.

### 5.15 Forgot / reset password

```
POST /api/storefront/v1/account/forgot-password
Body: { "email": "jane@example.com" }

POST /api/storefront/v1/account/reset-password
Body: { "token": "...", "newPassword": "at least 8 characters" }
```

`forgot-password` always returns the same generic message
(`"If that account exists, we've sent a reset link."`) whether or not the
email matched an account — don't use the response to infer whether an email
is registered. If it matched, a reset-password email is sent with a link
valid for 15 minutes; `reset-password` consumes that link's token exactly
once (a reused or expired token is rejected).

### 5.16 Account routes (require a customer session)

The following all require the `duka_customer_session` cookie (§2.1) —
`401` if it's missing/invalid, so gate these behind your storefront's own
"logged in" check first.

```
GET /api/storefront/v1/account
```
The logged-in customer's own profile: `{ "id", "name", "email", "phone" }`.

```
GET /api/storefront/v1/account/orders
```
Paginated (`page`/`pageSize`, same convention as §5.2), newest first:
`{ "page", "pageSize", "total", "totalPages", "hasNextPage", "hasPrevPage",
"items": [...] }` where each item is the same shape as §5.10 (minus `items`,
i.e. order summaries — fetch the detail route below for line items). Only
ever returns orders that belong to this customer.

```
GET /api/storefront/v1/account/orders/:id
```
Full order detail (same shape as §5.10, including `items`). `404` — not
`403` — if the order exists but belongs to a different customer, so this
route can't be used to confirm whether an arbitrary order id is valid.

---

## 6. Payment gateways (Paystack, Flutterwave, Opay)

A tenant can connect **one** of Paystack, Flutterwave, or Opay from their
own merchant account (in the admin dashboard, Settings → Payments). Whether
a given tenant has done so is entirely opaque to you as a storefront
integrator — you don't check for it, you just always pass `returnUrl` on
checkout and handle both possible response shapes from §5.9:

1. **Gateway active** — `payment.redirectUrl` is present. Redirect the
   browser there (a full navigation, not a fetch) immediately after
   checkout succeeds. The customer pays on the gateway's own hosted page and
   is sent back to your `returnUrl` when done, at which point you should
   `GET /orders/:id` to find out what actually happened — **arriving back at
   `returnUrl` does not by itself mean payment succeeded** (the customer
   could have cancelled, or the redirect can race the webhook below).
2. **No gateway active** — `payment` is absent. Nothing to redirect to;
   treat checkout as complete the same way it always worked.

Payment confirmation is **webhook-driven, not redirect-driven**: the
gateway calls the API server-to-server when payment settles, which is what
actually flips `paymentStatus` to `paid`. This is more reliable than trusting
the customer's browser to come back (they might close the tab), but it also
means there can be a short delay between the redirect landing and
`paymentStatus` updating — if your confirmation page reads `pending`
immediately after redirect, poll briefly rather than treating it as failure.

An order left unpaid for **1 hour** is automatically expired (`paymentStatus`
set to `failed`, held stock released) — don't build a storefront flow that
expects an abandoned checkout to remain payable indefinitely.

The separate `paystackPlanCode` / `flutterwavePlanId` fields in the schema
(`packages/db/src/schema/platform.ts`) are for the **platform's own SaaS
billing** of tenants' subscriptions — unrelated to this section, which is
about a tenant accepting payments from their own customers.

---

## 7. Implementation guide for a coding assistant

Minimal client flow to implement a storefront against this API:

1. **On app load**: read a stored cart id (e.g. `localStorage.getItem('cartId')`).
   If absent, `POST /cart` and store the returned `id`. Also check for a
   stored "logged in" flag — there's no endpoint to ask "am I logged in?"
   beyond calling `GET /account` (§5.16) and seeing whether it 401s, so cache
   that result client-side rather than calling it on every page load.
2. **Product listing page**: `GET /catalogue/products` with `page`/`search`/
   `categoryId` as the user filters.
3. **Product detail page**: `GET /catalogue/products/:slug` (use the `slug`
   from the listing/cart response, not the product's `id`); render variants as
   a selector (size/color/etc. from `attributeValues`), disable variants
   where `stock === 0`.
4. **Add/update/remove from cart**: `PATCH /cart/:cartId` with the *new
   absolute* quantity for that variant (not a delta). Re-render the cart from
   the response body — no extra GET needed.
5. **Cart page**: `GET /cart/:cartId` on load to reconcile state (e.g. after
   a refresh); render `items`, `subtotalMinorUnits`, `taxMinorUnits`,
   `discountMinorUnits`, `totalMinorUnits`; use `pricesIncludeTax` to decide
   whether to show tax as a separate line or already folded into unit
   prices. A coupon input on this page calls `POST /cart/:id/coupon` (§5.7)
   and re-renders from its response the same way.
6. **Login/register (optional)**: `POST /account/login` or
   `/account/register` (§5.12–5.13) before checkout if the shopper wants an
   account; skip entirely for guest checkout — nothing else in this flow
   changes either way.
7. **Checkout form**: collect name/email/phone (all optional, but prompt for
   at least `customerEmail` — it's both the guest contact fallback and what
   triggers the confirmation email), `POST /checkout` with the cart id and a
   `returnUrl` pointing at your own order-confirmation route (include the
   order id as a query param yourself, e.g.
   `.../order-confirmation?orderId=...` — the gateway doesn't know your
   route structure, it just bounces the browser back to exactly the URL you
   gave it). On success, clear the stored cart id (it's now invalid). If the
   response includes `payment.redirectUrl`, navigate the browser there; if
   it doesn't, go straight to your confirmation route instead — both are
   normal outcomes (§6).
8. **Order confirmation page**: `GET /orders/:id` (server-side, with your
   API secret) or, if this page needs to work for a shopper who isn't
   proxied through your backend, use the token from the automatically-sent
   confirmation email's link instead (`GET /orders/:id/view?token=...`,
   §5.11 — no secret required). Render items/totals, and `paymentStatus` if
   you're using a gateway (still `pending` right after redirect is normal —
   poll briefly rather than treating it as failure; see §6). Fulfillment
   `status` doesn't advance automatically off of payment — don't build UI
   that waits for it to jump ahead on its own.
9. **Account page (optional)**: for a logged-in customer, `GET /account`
   (profile) and `GET /account/orders` (§5.16) render a "My Orders" page —
   nothing here is reachable without the session cookie from step 6.

Required headers on every request (server-side only — never in browser JS):
```
X-API-Key: <tenant key>
X-API-Secret: <tenant secret>
```

If your storefront is client-rendered, route these calls through your own
backend/API layer so `X-API-Secret` never ships to the browser.
