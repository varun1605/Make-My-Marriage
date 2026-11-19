# Server infrastructure

Infrastructure ownership:

- `auth`: password, token, session, and cookie mechanisms.
- `authorization`: trusted membership, role, and tenant context.
- `db`: reusable Mongoose connection management.
- `http`: request helpers and HTTP error mapping.
- `email`: Resend adapter.
- `storage`: Cloudflare R2 adapter, eventually `r2.ts`.
- `vendors`: Google Places adapter.
- `config`: server environment configuration.

Runtime modules here must begin with `import "server-only";` so Next.js rejects
imports into client bundles. Authentication now includes Argon2id, HMAC sessions,
MongoDB rate counters, lazy environment validation, a reused database connection,
and safe request/error helpers. See `docs/AUTH_IMPLEMENTATION.md` for setup.
Provider adapters and general wedding authorization remain deferred. Do not
initialize clients or require production credentials just to render public pages.
