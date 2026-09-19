Panache Central — marketing site plus a customer storefront built against the
Duka Storefront API (see `docs/storefront-api.md`).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.local` (not committed) with:

```
DUKA_API_URL=<tenant's storefront API base, including /api/storefront/v1>
API_KEY=<tenant's storefront X-API-Key>
API_SECRET=<tenant's storefront X-API-Secret>
```

The secret never reaches the browser — every Duka call goes through
`lib/duka/` (server-only) and is proxied via `app/api/storefront/**` Route
Handlers, consumed client-side through `hooks/` with TanStack Query. See
`docs/design/panache-storefront-design-spec.md` and
`docs/engineering/panache-storefront-impl-notes.md` for the full design/build
record.

### Testing

```bash
npm run test    # vitest — format/status utility coverage
npm run lint
npx tsc --noEmit
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Duka Storefront API reference](docs/storefront-api.md)
