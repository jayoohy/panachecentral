# User-Relevant Data Presentation

## Purpose

When building or reviewing any user-facing feature, do **not** treat the database schema or API response as the UI design.

The UI must present information based on what the **intended user actually needs to understand, decide, or act on**, rather than simply exposing whatever fields are available in the database.

A technically correct UI can still be a poor product if it exposes implementation details instead of meaningful information.

---

## Core Rule

> **Every piece of information displayed to a user must have a clear user-facing purpose.**

Before displaying a field, ask:

1. Who is the intended user?
2. What does this information mean to them?
3. Does seeing it help them understand, decide, find, or perform an action?
4. Is there a more human-readable representation?
5. Is this actually something the user needs to see at all?

If a field cannot answer these questions, **do not expose it by default**.

---

## Never Blindly Mirror the Database

Do not build interfaces that simply map database columns to table columns.

### Bad

```text
id | userId | categoryId | vendorId | status | createdAt | updatedAt
```

### Better

```text
Order       Customer       Category       Vendor              Status       Created
#ORD-1042   John Doe       Electronics    Acme Electronics     Processing    Aug 15, 2026
```

The database structure is an implementation detail. The interface should represent the application's domain and the user's mental model.

---

# 1. Never Display Raw Foreign Keys When Human-Readable Data Exists

Fields such as:

```text
userId
user_id
categoryId
category_id
vendorId
vendor_id
productId
product_id
addressId
address_id
paymentId
payment_id
```

should generally **not** be displayed directly to normal users.

### Bad

```text
Customer ID: 83921
Category ID: 17
Vendor ID: 42
```

### Good

```text
Customer: John Doe
Category: Electronics
Vendor: Acme Electronics
```

Resolve relationships into meaningful information.

If the relationship cannot be resolved, do not automatically fall back to exposing the raw foreign key.

Instead consider:

- a meaningful fallback label
- `Unknown`
- `Unassigned`
- `Deleted user`
- `No category`
- an appropriate empty state

Only expose the raw identifier when it has a legitimate operational purpose.

---

# 2. Distinguish Technical IDs From User-Facing Identifiers

Not every ID is bad.

A user-facing identifier can be valuable when it represents something the user actually needs to reference.

### Appropriate

```text
Order #ORD-10492
Invoice #INV-2026-00421
Ticket #TCK-1832
Tracking #NG123456789
```

### Usually inappropriate

```text
UUID: 550e8400-e29b-41d4-a716-446655440000
User ID: 83921
Category ID: 17
Database ID: 48291
```

If an identifier is useful to the user, present it as a **domain identifier**, not as a database implementation detail.

---

# 3. Translate Enums and Internal Values

Never assume internal values are suitable for presentation.

### Bad

```text
status: awaiting_vendor
payment_status: partially_paid
fulfillment_status: out_for_delivery
role: delivery_service
```

### Good

```text
Status: Awaiting Vendor
Payment: Partially Paid
Fulfillment: Out for Delivery
Role: Delivery Service
```

Use appropriate labels, badges, icons, or other visual representations where useful.

Do not expose internal naming conventions such as:

```text
snake_case
camelCase
SCREAMING_SNAKE_CASE
numeric enum values
database codes
```

unless they are genuinely meaningful to the intended user.

---

# 4. Never Display Numeric or Boolean Codes Without Context

Do not expose implementation values simply because they exist in the API.

### Bad

```text
Active: 1
Verified: 0
Priority: 2
Type: 3
```

### Good

```text
Status: Active
Verified: No
Priority: High
Type: Business Account
```

Boolean values should normally be represented with meaningful labels.

Instead of:

```text
is_verified: false
```

use:

```text
Verification: Not verified
```

---

# 5. Format Dates and Times for Humans

Do not blindly display raw database timestamps.

### Bad

```text
2026-08-15T20:32:11.000Z
```

### Better

```text
Aug 15, 2026, 9:32 PM
```

Depending on the context, relative time may be more useful:

```text
2 hours ago
Yesterday
Aug 15
```

Use the appropriate representation for the user's context.

Do not remove important precision when precision is actually needed.

For example, financial transactions, logs, audit records, and scheduling systems may require exact timestamps.

---

# 6. Format Currency and Numbers According to Context

Never assume raw numeric values are user-friendly.

### Bad

```text
amount: 150000
```

### Good

```text
₦150,000
```

For quantities:

```text
quantity: 1500
```

may be better presented as:

```text
1,500 units
```

Use the correct currency, decimal precision, thousands separators, units, and context.

Do not invent formatting rules when the application's existing localization or currency system already provides them.

---

# 7. Hide Developer and Database Metadata From Normal Users

Do not expose fields simply because they exist.

Examples of fields that often should remain internal:

```text
created_by
updated_by
deleted_at
internal_notes
database_id
migration_version
sync_token
api_version
internal_status
webhook_id
external_reference
raw_payload
metadata
```

These fields may be appropriate for:

- administrators
- developers
- support staff
- audit screens
- debugging tools

But they should not automatically appear in normal user interfaces.

---

# 8. Use Relationships Instead of Making Users Understand the Schema

If the user needs information about a related entity, represent the relationship naturally.

### Bad

```text
Order
customer_id: 82
vendor_id: 14
shipping_address_id: 291
payment_id: 993
```

### Better

```text
Order #ORD-1042

Customer
John Doe

Vendor
Acme Electronics

Shipping Address
12 Independence Avenue, Enugu

Payment
Paid · Paystack
```

The interface should communicate the **business relationship**, not the database relationship.

---

# 9. Tables Must Be Designed Around User Tasks

When creating a table, do not ask:

> "Which database fields can I put into this table?"

Ask:

> "What information does the user need to scan to accomplish their task?"

For every column, determine:

- Is it useful for scanning?
- Is it relevant to the current task?
- Is it understandable without technical knowledge?
- Can the user act on it?
- Does it help distinguish one row from another?

Avoid tables with excessive columns simply because the backend provides them.

---

# 10. Prefer Meaningful Names Over Technical Names

Database/API naming should not leak into the UI.

### Bad

```text
created_by
customer_id
order_status
payment_method
delivery_service_id
```

### Good

```text
Created By
Customer
Order Status
Payment Method
Delivery Service
```

UI labels should be written for humans.

---

# 11. Consider the Intended User

The same data may be appropriate for one user and inappropriate for another.

For example:

### Customer

```text
Order
Items
Total
Payment
Delivery Status
Estimated Delivery
```

### Vendor

```text
Order
Customer
Items
Quantity
Fulfillment Status
Shipping Information
```

### Administrator

```text
Order
Customer
Vendor
Payment
Fulfillment
Created By
Internal Status
Audit Information
```

Do not assume that because an administrator needs a field, every user needs it.

Always design the presentation around the **current user's role and task**.

---

# 12. Detail Pages Should Provide Context

A detail page should not look like a raw database record.

### Bad

```text
id: 29382
user_id: 8392
category_id: 17
status: 2
created_at: 2026-08-15T20:32:11Z
```

### Better

```text
Product

iPhone 15 Pro
Electronics

Status
Active

Owner
John Doe

Created
Aug 15, 2026
```

Group related information logically.

Use sections such as:

- Overview
- Customer
- Payment
- Shipping
- Activity
- Metadata
- Audit Log

when appropriate.

---

# 13. Don't Replace IDs With Expensive Queries Blindly

User-friendly presentation must not create poor backend architecture.

If the UI needs:

```text
category.name
vendor.name
customer.name
```

make sure the backend/API provides the required relationships efficiently.

Avoid creating an N+1 query problem just to make the interface look better.

Prefer appropriate:

- eager loading
- joins
- relationship queries
- API serializers/resources
- DTOs
- GraphQL selections
- dedicated view models
- frontend data transformations

The goal is:

> **User-friendly UI without sacrificing application performance or architecture.**

---

# 14. API Responses Should Also Consider the UI Contract

Do not force the frontend to repeatedly reconstruct human-readable information from raw IDs when the backend already owns the relationships.

For example, instead of only returning:

```json
{
  "categoryId": 17,
  "vendorId": 42
}
```

consider an appropriate API representation such as:

```json
{
  "category": {
    "id": 17,
    "name": "Electronics"
  },
  "vendor": {
    "id": 42,
    "name": "Acme Electronics"
  }
}
```

Do not blindly return every related object either.

Return what the client actually needs.

---

# 15. Don't Expose Information Just Because It Is Available

Availability does not imply relevance.

A database record may contain:

```text
id
uuid
user_id
organization_id
created_by
updated_by
deleted_at
version
sync_status
internal_status
metadata
```

That does not mean the UI should display any of them.

The correct question is:

> **Does this information help the current user accomplish something?**

If not, keep it internal.

---

# 16. Preserve Useful Technical Information When It Has User Value

Do not apply this rule blindly.

Some technical-looking information is legitimately useful.

Examples:

```text
Order ID
Tracking Number
Invoice Number
SKU
Product Code
Serial Number
Reference Number
API Key identifier
Transaction Reference
```

The test is not:

> "Does this look technical?"

The test is:

> "Does the intended user have a reason to know or use this information?"

---

# 17. Review Existing Features, Not Just New Features

When modifying an existing page, review the surrounding UI.

If you encounter:

```text
categoryId
userId
vendorId
status: 2
createdAt
```

do not simply add another feature beside them.

Consider whether the existing implementation already violates this rule.

Fix obvious user-facing data presentation issues when they are within the scope of the feature.

However, avoid unrelated large refactors unless necessary.

---

# 18. Mandatory Review Before Marking a Feature Complete

Before considering a user-facing feature complete, perform a **User-Relevance Review**.

For every visible field, ask:

### Relevance
- Does the intended user need this information?
- Does it help them understand or act?

### Readability
- Is the value understandable to a normal user?
- Is it using human-readable terminology?

### Relationships
- Are foreign keys represented by meaningful entity information?
- Are related entities displayed naturally?

### Formatting
- Are dates readable?
- Are currencies formatted?
- Are numbers formatted?
- Are statuses translated into meaningful labels?

### Technical leakage
- Am I exposing database IDs?
- Am I exposing internal codes?
- Am I exposing implementation details?
- Am I exposing raw API/database structures?

### Context
- Does this field make sense in this particular screen?
- Is it appropriate for the current user's role?

### Density
- Does the table contain unnecessary columns?
- Is important information buried among technical fields?

### Consistency
- Does this follow the application's existing presentation patterns?
- Are similar entities represented consistently elsewhere?

---

# 19. Red Flags

During implementation or review, treat the following as warning signs:

```text
userId
categoryId
vendorId
organizationId
*_id
createdBy
updatedBy
deletedAt
status: 1
status: 2
type: 3
isActive: true
isVerified: false
2026-08-15T20:32:11.000Z
150000
raw JSON
database UUID
internal enum
```

These are not automatically wrong, but they should trigger a review:

> **"Is this actually how the user should see this information?"**

---

# 20. Final Principle

The database describes **how the application stores information**.

The API describes **how systems exchange information**.

The UI describes **how humans understand and interact with the application**.

These three representations do not need to be identical.

### The standard to follow

> **Build interfaces around the user's mental model and tasks, not around the database schema.**

When an AI agent generates a page, table, form, dashboard, or detail view, it must actively evaluate whether the information is **meaningful, human-readable, contextual, and actionable** for the intended user before exposing it.

A feature is not complete merely because the correct data is displayed.

It is complete when the **right data is displayed in the right form to the right user for the right purpose**.