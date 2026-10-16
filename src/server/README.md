# Server infrastructure

Reserved directories:

- `auth`: password, token, session, and cookie mechanisms.
- `authorization`: trusted membership, role, and tenant context.
- `db`: reusable Mongoose connection management.
- `http`: request helpers and HTTP error mapping.
- `email`: Resend adapter.
- `storage`: Cloudflare R2 adapter, eventually `r2.ts`.
- `vendors`: Google Places adapter.
- `config`: server environment configuration.

Future runtime modules here must begin with `import "server-only";` so Next.js
rejects imports into client bundles. This scaffold contains no server runtime
modules or secrets; these directories alone do not enforce an import boundary.
Provider integrations and environment validation are deferred to their first
feature. Do not initialize clients or require production credentials just to boot.
