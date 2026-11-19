# Signup and login increment — 2026-10-23

Implementation record, not a change to the four frozen specifications.

## Delivered scope

- `/signup` and `/login` reuse the Stitch Luxury Login visual direction and the
  existing homepage tokens/fonts/image. Mobile uses a single-column form.
- `/account` is an authenticated account confirmation page until wedding setup
  is implemented. Anonymous/expired sessions redirect to `/login`.
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, and
  `POST /api/auth/logout` follow API_DESIGN §§10–14. Signup has no email verification.
- Homepage account controls now link to these pages. Password recovery, wedding
  creation, and membership writes remain separate increments.
- The reference design's OTP/digital-pass controls, 30-day checkbox, unsupported
  security claims, and nonexistent policy/reset links are not presented as features.

## Local setup

An ignored `.env.local` was created for the current workspace, with a generated
session secret and an initially empty MongoDB URI. The user has since supplied
the URI locally and its read-only connection check passed. Keep connection
strings there, not in chat or source. A fresh checkout can copy `.env.example` to
`.env.local` and generate its own secret.

| Variable | Value/requirement |
| --- | --- |
| `MONGODB_URI` | Atlas development connection string, with a dedicated development DB user |
| `MONGODB_DB_NAME` | Defaults in the template to `make_my_marriage_dev`; this selects the database independently of the URI path |
| `APP_ORIGIN` | Exact browser origin, no trailing slash; local template uses `http://127.0.0.1:3000` |
| `SESSION_SECRET` | 32 cryptographically random bytes encoded as 64 hex characters; separate secret per environment |

The Atlas user needs read/write and index-creation privileges on this development
database. Allow the development machine's network address in Atlas Network Access.
Use a replica set: signup/login session replacement uses transactions. Do not use
a standalone MongoDB server or production wedding data for development/testing.

Run `npm ci` then `npm run dev`, and open `http://127.0.0.1:3000/signup`. Restart
the development server after changing environment configuration. If the port or
hostname changes, update `APP_ORIGIN` to match exactly. In this workspace another
application was listening on IPv6 localhost:3000, hence the explicit IPv4 URL.
`next.config.ts` explicitly allows `127.0.0.1` for Next.js development resources.
This keeps the hot-reload WebSocket connected and prevents its retry loop from
reloading the page during form entry. This development setting is separate from
the auth API's strict `APP_ORIGIN`/Host checks, which remain enforced.

No email, R2, Google Places, or Stitch credentials are needed for this increment.
Forms and the homepage render without database setup; authentication attempts
return a generic 503 while required server configuration is missing. The app never
substitutes fake successful authentication for a missing database.

For deployment, use HTTPS and configure these values in the server environment;
`npm start` runs production mode and requires an HTTPS `APP_ORIGIN` for auth.
Changing the session secret invalidates existing sessions. Never use `NEXT_PUBLIC_`
for the database URI or secret. Do not commit `.env.local` or `.mcp.json`.

## Decisions approved for this increment

The user approved Argon2id, 15–128-character passwords, fixed seven-day sessions,
MongoDB-backed rate limiting, Vitest with an isolated MongoDB test server, the
signup/login paths, and an account confirmation page. The user supplied the
Atlas development URI manually. Formatter and password-recovery parameters remain
deferred.

Concrete implementation settings:

- Passwords are not trimmed or truncated. Argon2id uses 19 MiB, two iterations,
  one lane and library-generated random salts, following the
  [OWASP password-storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- Name is trimmed and limited to 1–120 characters; email is trimmed, validated,
  limited to 254 characters, and separately normalized to lowercase for uniqueness.
  Provider-specific dot/plus transformations are not applied.
- Session tokens contain 32 random bytes. Only a purpose-separated HMAC-SHA-256
  digest is stored. `mmm_session` is HttpOnly, SameSite=Lax, Path=/, Secure in
  production, with a seven-day absolute expiry and no sliding renewal.
- Successful signup/login replaces the session presented by that browser.
  Other devices retain their sessions. Logout revokes the presented session.
- Signup commits user/session together; a session-write failure rolls back the
  new account. Unique email and token indexes plus session expiry TTL are created
  before accepting auth writes. Expiry is also checked during every session lookup.
- Mutation requests require the configured Origin and matching Host. JSON bodies
  are limited to 16 KiB; schemas reject unknown fields. Responses are `no-store`;
  unexpected errors never expose raw database/configuration details.
- Credential forms declare POST to the existing auth endpoint and keep all inputs
  and submit controls disabled until the client submit handler is ready. With
  JavaScript disabled, a notice explains how to enable the form. This prevents
  native GET submission from placing credentials in URLs. Normal submissions
  continue to use JSON fetch; no native form-body support or new API was added.

## Rate limiting

Initial fixed-window defaults live in `src/server/auth/rate-limit.ts`:

| Limit | Threshold |
| --- | --- |
| Signup per source | 5 requests/hour |
| Login per source | 30 requests/15 minutes |
| Login per normalized email | 10 requests/15 minutes |
| Global cap per signup/login endpoint | 100 requests/minute |

All attempts count, including successful requests. Responses use HTTP 429 and
`Retry-After`. Counts use atomic MongoDB increments, HMAC-derived identifiers, and
TTL expiry in an infrastructure collection named `auth_rate_limits`. This is not
a new business domain or a replacement for the 13 primary collections.

Only on Vercel does the app trust the platform-overwritten `x-forwarded-for`
header, per [Vercel's request-header documentation](https://vercel.com/docs/headers/request-headers).
Otherwise it uses one shared source bucket, so arbitrary forwarded headers cannot
bypass limits. Local testers share that bucket and may hit the signup limit. The
thresholds should be reviewed with actual traffic before release; another hosting
platform requires an explicit trusted-proxy policy.

## Files and boundaries

Routes in `src/app/api/auth` perform request/origin checks, rate limiting, schema
validation, service calls and cookie/response mapping. `src/modules/auth` owns
user/session models, persistence and workflows; `src/server/auth` owns password,
token and rate-limit mechanisms. `src/server/config`, `db`, and `http` supply the
minimal shared foundation. Browser components import only browser-safe schemas.

The Wedding and Wedding Members domains currently expose read-only repository
projections for `/me` and login's `hasWedding`. They read membership fresh using
the authenticated user ID, then resolve the wedding ID from that membership.
They create no memberships/weddings and do not define partial canonical models;
full models and write invariants belong to their later increments.

## Verification and remaining work

- `npm run check`: passed lint and TypeScript.
- `npm test`: 12 tests passed against a temporary local MongoDB replica set,
  including concurrent duplicate signup, transaction rollback, hash-only storage,
  generic login errors, rotation/expiry/logout, current membership, origin checks,
  request validation, rate-limit races and secure-cookie/configuration behaviour.
- `npm run build`: passed, including static signup/login and dynamic account/APIs.
- `npm audit --omit=dev`: zero reported production vulnerabilities on 2026-10-23.
  The existing development lint dependency advisory remains tracked in README.
- Local credential values were checked against Git-visible files and browser JS
  output; none were found. `.env.local` and `.mcp.json` remain ignored/untracked.
- Live HTTP checks against the production build and a separate temporary replica
  set passed: public pages, unauthenticated redirect, signup, secure-cookie header,
  protected account content/no-store, login, current-user and logout invalidation.
  The local HTTP harness supplied the configured HTTPS Origin to simulate TLS
  termination; this was not a browser test of production cookie delivery.
- Visual/keyboard/browser interaction checks were initially blocked because no
  browser automation surface was available. Direct Chrome QA on November 3–4
  later verified core auth flows, errors/focus, desktop and 390 × 844 layouts,
  and both no-JavaScript fallbacks against a temporary DB. See the
  [manual QA report](MANUAL_QA_2026-11-04.md) for actual coverage and remaining cases.
- Atlas connection verification passed on 2026-10-23 using the supplied local URI:
  authenticated connection/ping, replica-set or sharded topology, and a read-only
  transaction. The transaction was aborted; no documents, collections or indexes
  were modified. Write/index permissions and live signup were not exercised.
- No commit, push, deployment, email integration or password recovery was performed.

On 2026-11-02, after the development-origin fix, the user confirmed that browser
login succeeds and opens `/account`. This is user-reported verification; browser
automation remained blocked by macOS permissions. No direct database inspection
was performed for this confirmation.

The user closed the manual QA task with the collected results on November 4.
Core signup/login/logout passed in the isolated browser test environment;
remaining browser cases are deferred to a future QA request. Production HTTPS
and Atlas writes remain unverified.

The 2026-11-03 credential-form correction passed lint/typecheck, production build,
and all 18 tests (12 isolated database tests plus six new server-rendered form
regressions). The six new cases failed against the original component, then passed
after the fix. Production HTML for both auth pages also confirmed POST, disabled
controls, and no-script guidance. Browser verification was attempted but macOS
Accessibility/Screen Recording permissions remained pending; browser hydration,
keyboard and responsive behaviour were not reverified in this correction.
