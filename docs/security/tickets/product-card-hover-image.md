# Security Ticket: product-card-hover-image

**Confirmation of no sensitive surface:** Confirmed. Renders an additional
image URL already returned by the existing product list endpoint via the
existing server-side proxy. No auth, secrets, new API calls, third-party
integrations, or infra/CDN config touched. Image URLs come from the tenant's
own catalogue, same trust level as the existing `thumbnail`.

**Dependency change check:** No dependencies added or changed.
