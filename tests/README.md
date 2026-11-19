# Tests

Run `npm test` for the Vitest authentication and form regression suites or
`npm run test:watch` while developing. `vitest.config.mts` aliases only the `server-only` boundary marker
in tests; application builds keep the real marker.

`auth.integration.test.ts` starts its own temporary MongoDB replica set bound to
127.0.0.1, creates a dedicated test database, and stops it after the suite. It never
loads `.env.local` or connects to your Atlas database. The first run may download
an official MongoDB binary; binaries are cached in the OS temporary directory.
Tests require permission to start local processes and listen on local ports.

The suite exercises real MongoDB queries, indexes, transactions and Argon2 hashing
through the route handlers. Only the transaction-failure test injects a persistence
failure. It covers signup races/rollback, sessions, logout, validation, origin
checks, current membership and rate limiting. These tests do not exercise browser
layout, focus, form submission or cookie handling in an actual browser.

`auth-form.test.ts` renders the actual login/signup component to server HTML with
React DOM, without a database or new test dependencies. Its six regression cases
verify POST fallback destinations, disabled credential/submit controls before
JavaScript is ready, and guidance for browsers with scripting disabled. These
checks cover the native GET credential-leak finding; browser hydration and
interaction checks remain separate verification.

Also run `npm run check` and `npm run build`. See
[authentication implementation](../docs/AUTH_IMPLEMENTATION.md) for the latest
verification record and outstanding browser/Atlas checks.
