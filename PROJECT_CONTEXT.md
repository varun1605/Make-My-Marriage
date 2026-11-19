# Make My Marriage — project context and handoff

Last updated: **2026-11-19**.

This is the maintained project handoff for future sessions. It summarizes the
user's decisions, repository evidence, and prior work; it is not a replacement
for the frozen specifications or a verbatim conversation archive. Read
[AGENTS.md](AGENTS.md) first for working rules. Verify this snapshot against Git
and source before acting, and update it when meaningful work is completed.

## Current snapshot

- **Stage:** public homepage plus Phase 1 signup/login, current-user lookup and
  logout implemented locally. Wedding planning previews remain illustrative.
- **Current auth state:** `/signup`, `/login`, protected `/account`, and four REST
  handlers are implemented. Atlas connectivity/read-only transaction checks passed.
  The user confirmed successful browser login to `/account` on 2026-11-02.
  Direct Chrome QA on November 3–4 verified signup/login/logout, account protection,
  form errors, session refresh, mobile login/layout and no-JavaScript fallbacks
  against an isolated temporary database. Remaining browser cases are listed in
  [the manual QA report](docs/MANUAL_QA_2026-11-04.md).
- **Previous homepage release:** `a6f122e` — Build public wedding homepage from
  reviewed design; pushed to `origin/dev` on 2026-10-22.
- **Earlier baseline:** `cdc267d` — Initialize Make My Marriage project scaffold,
  committed 2026-10-16; includes all four frozen specifications and the plan.
- **Repository:** <https://github.com/varun1605/Make-My-Marriage>, working branch
  `dev`. Confirm branch/status before future work; do not assume this stays current.
- **Auth delivery:** this change packages signup/login, session lookup/logout,
  development-origin and credential-form fixes, tests, setup and QA documentation.
  The user explicitly authorized committing and pushing it to `origin/dev` on
  2026-11-19. Git history and remote comparison establish delivery status; no
  deployment was requested or performed.
- **Release limitation:** Chrome QA is partial. Mobile menu, additional viewport,
  navigation/history and failure-state checks remain; native automation stopped
  responding during the pass. The user closed this QA task with the collected
  results on November 4; remaining cases are deferred, not awaiting a reply.
  Production HTTPS and Atlas writes were not tested.
- **Local server diagnosis (2026-11-02):** `localhost:3000` reached a separate PHP
  server on IPv6 and reproduced the reported missing-resource 404. The existing
  Next.js server returned the homepage with HTTP 200 at `http://127.0.0.1:3000`.
  Use that IPv4 URL, which matches local `APP_ORIGIN`; no runtime change was needed.
- **Development refresh fix (2026-11-02):** Next.js was blocking the IPv4
  hot-reload WebSocket, whose repeated reconnect failures trigger page reloads.
  Added `allowedDevOrigins: ["127.0.0.1"]`; the running dev server picked it up,
  and the connection stayed open for 50 seconds. Auth origin/session rules remain
  unchanged. The user confirmed login now succeeds and opens `/account`.
- **Review finding corrected (2026-11-03):** login/signup now declare POST to
  their existing endpoints, keep credential controls disabled until JavaScript is
  ready, and provide no-script guidance. This closes the native GET credential
  exposure finding. Six new server-rendered form regressions and production HTML
  checks pass. Direct Chrome checks subsequently confirmed disabled controls and
  explanatory guidance without JavaScript on both auth pages, then usable inputs
  and successful login after JavaScript was restored.

## Document map and precedence

| Document | Purpose |
| --- | --- |
| [PRD](docs/PRD.md) | Frozen product scope, roles, UX, delivery phases |
| [System design](<docs/SYSTEM_DESIGN (1).md>) | Frozen architecture and integrations |
| [Database design](docs/DATABASE_DESIGN.md) | Frozen persistence and constraints |
| [API design](docs/API_DESIGN.md) | Frozen REST contracts and amendments |
| [Scaffold plan](PROJECT_SCAFFOLD.md) | Reviewed structure, dependencies, sequence, decision gaps |
| [README](README.md) | Current setup, commands, dependency rationale, file inventory |
| [Agent rules](AGENTS.md) | Instructions for future work and handoff maintenance |
| [Asset provenance](public/ASSETS.md) | Stitch references, local imagery, fonts and licenses |
| [Auth implementation](docs/AUTH_IMPLEMENTATION.md) | Current auth setup, decisions, limits, file responsibilities and verification |
| [Chrome manual QA](docs/MANUAL_QA_2026-11-04.md) | Direct browser observations, environment, passed cases and remaining checks |

The specifications remain unchanged. Some amendments describe implementation in
past tense and mention tests or paths that do not exist in this checkout. Those
statements define contracts; they do not prove repository features are complete.
Read amendments as well as original sections. Escalate unresolved conflicts before
implementing affected behaviour. Historical scaffold notes are not current status.

## Decisions and working preferences established so far

1. Inspect and plan before implementing. Keep the frozen product and architecture;
   do not redesign them or silently choose unspecified product/security parameters.
2. Implement small, independently reviewable increments. The homepage was
   explicitly authorized as an initial UI increment before business workflows.
3. Approved minimal tooling: npm, pinned direct dependencies and lockfile, strict
   TypeScript, Next.js ESLint rules, and plain CSS. No component library or state
   framework was added. Test tooling was initially deferred, then Vitest and an
   isolated MongoDB test server were approved for authentication. A formatter and
   later provider integrations remain deferred.
4. Keep local startup independent of production accounts and credentials. Add
   Mongoose, Zod, and provider packages when the relevant increment needs them.
5. Review Stitch designs against the PRD before implementation. Preserve the visual
   direction while correcting feature claims that exceed V1. The user approved
   those corrections and the homepage implementation.
6. Store durable project context in the repository and keep it updated as work
   proceeds. The 2026-10-22 request explicitly authorized creating `AGENTS.md` now,
   superseding the earlier instruction to leave that artifact pending approval.
7. Commit/push authorization is task-specific. Both existing implementation commits
   were pushed with explicit user authorization; subsequent documentation and auth
   requests do not themselves request another push.
8. On 2026-10-23 the user authorized signup/login implementation, approved the
   proposed security/test/UI settings, and requested a local environment template
   to configure the MongoDB connection string manually. See the auth implementation
   record for the concrete settings; no credentials are stored in this handoff.

## What is implemented

### Scaffold and tooling

- One Next.js App Router application, TypeScript, `@/*` mapped to `src/*`.
- Current manifest pins Next.js 16.4.2, React/React DOM 19.3.1, TypeScript 6.0.3,
  ESLint 10.12.0. `package.json` and `package-lock.json` control exact versions;
  these numbers are a snapshot, not a requirement to freeze dependencies forever.
- `packageManager`: npm 11.7.0. Engines: npm >=11; Node 20.19+ within 20.x,
  22.13+ within 22.x, or >=24. See README for setup.
- Auth routes/models/services and server auth/config/db/http infrastructure now
  exist. Wedding/member repositories only expose read projections for auth; other
  domain/provider directories remain reserved. Test scripts now run real tests.
- `next.config.ts` disables automatic agent-rules generation (`agentRules: false`);
  project instructions are maintained deliberately in the root `AGENTS.md`.
  It also allows `127.0.0.1` for development resources so the documented local
  browser URL can keep its hot-reload WebSocket connected.

### Public homepage

| File | Implemented responsibility |
| --- | --- |
| `src/app/page.tsx` | Public marketing page, feature previews, calls to action, footer |
| `src/app/layout.tsx` | Root layout and homepage metadata |
| `src/app/globals.css` | Local fonts, tokens, resets, focus, skip link, reduced motion |
| `src/components/home/home.module.css` | Page styling and responsive breakpoints |
| `src/components/home/site-header.tsx` | Desktop/mobile navigation and menu interaction |
| `src/components/home/access-button.tsx` | Links to signup/login (replaced coming-soon dialogs) |
| `src/components/icon.tsx` | Shared inline SVG presentation icons |
| `public/images`, `public/fonts` | Two local marketing images, variable fonts, licenses |

The homepage covers events, tasks, guests/RSVPs, invitations, recorded expenses,
vendors, wedding websites, YouTube livestreams, and private photo sharing. Its
sample cards are explicitly illustrative. Section links use page anchors.
Create-wedding and login controls now link to `/signup` and `/login`. Authentication
lands on `/account`, a protected confirmation screen. No wedding onboarding,
private dashboard, or guest-facing routes exist yet.

The visual direction uses warm ivory, wine, champagne gold, sage, EB Garamond,
and Manrope, with local imagery and Next.js image optimization. Source paths and
Stitch screen identifiers are recorded in `public/ASSETS.md`.

### Signup/login increment

- Four documented endpoints: signup, login, current user, logout. No verification
  email, password reset, wedding creation, or member writes are implemented.
- User/session schemas, unique email/token indexes, expiry TTL, transactional
  signup/session replacement, generic login failures, current membership reads.
- Argon2id passwords (15–128 characters); random 32-byte sessions stored only as
  HMAC digests; fixed seven-day HttpOnly cookies, Secure in production.
- Same-origin mutation checks, limited JSON bodies, Zod validation, no-store
  responses, and MongoDB rate limits. Settings and source details are recorded in
  `docs/AUTH_IMPLEMENTATION.md`; `auth_rate_limits` is an infrastructure collection.
- Login/signup forms cannot accept credentials before their JavaScript submit
  handler is ready. Explicit POST fallback prevents credential-bearing GET URLs;
  JSON request contracts, origin validation and session handling are unchanged.
- Dependencies added/pinned: Mongoose, Zod, Argon2, server-only; Vitest 4 (compatible
  with existing Node 20) and mongodb-memory-server for tests. No provider SDKs.
- `/signup` and `/login` follow the existing Stitch Luxury Login reference's arch,
  palace image, ivory/wine colours and typography. Unsupported OTP/digital-pass,
  30-day remember-me and nonexistent reset/policy links were omitted.
- Ignored `.env.local` contains the user-supplied MongoDB URI and a locally
  generated secret; template selects `make_my_marriage_dev` and uses
  `APP_ORIGIN=http://127.0.0.1:3000`. Keep `.env.example` safe to commit.
- On 2026-10-23, the user-supplied connection passed authenticated ping, topology,
  and read-only transaction checks. No documents, collections or indexes were
  changed. Write/index permissions were not exercised. Automated feature tests
  continue to use their own temporary replica set, not the Atlas database.

### Stitch and credential handling

- Earlier work successfully connected to Stitch and retrieved/viewed designs in
  the user's Make My Marriage Platform project (`16426202201826503075`). This is
  historical evidence; tool availability/authentication must be checked when needed.
- Stitch is a design-time tool, not an application runtime dependency. The homepage
  serves local assets and does not need a live Stitch connection.
- Local `.mcp.json` contains connection credentials and is ignored via
  `/.mcp.json`. It was untracked and absent from locally available Git history
  when reviewed. It was excluded from the homepage commit and push.
- Never put its contents into this file, source, logs, screenshots, or commits.
  A fresh checkout does not inherit another machine's local MCP registration.

## Architecture to preserve as features are added

Use the frozen stack: Next.js/TypeScript modular monolith, REST Route Handlers,
MongoDB Atlas/Mongoose, Zod, custom server-side sessions, R2, Resend, Google Places,
YouTube, Vercel and Vercel Cron. Bulk email uses MongoDB jobs and small batches.

The dependency direction is UI → REST handler → domain service → repository →
Mongoose; services call provider adapters where required. Private runtime code
must have `server-only` boundaries. Authorization belongs in the backend.

There are 13 planned domains: Auth, Wedding, Wedding Members, Events, Tasks,
Guests, Invitations, Expenses, Vendors, Wedding Website, Gallery (`photos`),
Livestream, and Email. The 13 primary collections are `users`, `sessions`,
`password_reset_tokens`, `weddings`, `wedding_memberships`,
`wedding_member_invitations`, `events`, `tasks`, `guests`, `vendors`, `expenses`,
`photos`, and `email_jobs`. A domain does not automatically require its own collection.

Key invariants: one wedding per user; wedding-scoped private data; Admin/Manager
shared operational visibility with Admin-only member administration; last-Admin
protection; guests without accounts; atomic wedding/first-membership creation and
member acceptance; integer-paise money; explicit date/time semantics. Consult the
specifications for full contracts and accepted token exceptions.

V1 excludes budgeting/allocations/split payments, vendor bookings/payments,
household and travel coordination, automated WhatsApp/SMS, realtime collaboration,
and other PRD non-goals. The homepage review removed misleading promises in these
areas. Public wedding websites and private guest invitations remain separate;
gallery claims cover photos, not RAW/video uploads.

## Validation evidence and limitations

These are recorded results; reading this document does not rerun checks. The
auth increment was verified on 2026-10-23. Re-run relevant checks when code changes.
The 2026-11-02 startup investigation checked local HTTP responses and environment
formats only; it did not repeat auth flows, Atlas connectivity, or browser QA.
The subsequent login-refresh investigation on that date reran lint, typecheck,
build and all 12 isolated auth tests, then verified the repaired development
WebSocket and origin rejections. Browser automation was attempted but macOS
Computer Use permissions were unavailable. The user subsequently confirmed
successful browser login and navigation to `/account`; this is user-reported
verification, not an automated browser or direct database inspection.
On 2026-11-03, the credential-form correction passed check/build and all 18 tests.
Production HTML confirms safe initial form markup on both auth pages. Browser
verification was initially blocked by macOS Accessibility/Screen Recording
permissions. Later on November 3–4, native Chrome access became available and
the direct manual QA pass recorded below was performed. These results supersede
the earlier all-browser-QA-pending status, but do not constitute full sign-off.

| Check | Last recorded result |
| --- | --- |
| `npm run check` | Passed lint and TypeScript again before commit/push on 2026-11-19 |
| `npm run build` | Passed on 2026-11-19 with homepage, signup/login, dynamic account and auth APIs |
| HTTP smoke checks | Production build with temporary DB: public pages, protected account, signup/login/me/logout passed; homepage asset checks passed earlier |
| Static HTML inspection | Homepage checks passed earlier; current homepage/signup/login each return one h1 |
| Staged whitespace check | Passed before homepage commit; trailing whitespace in two font licenses was removed |
| Git push | `a6f122e` pushed successfully to `origin/dev`; clean tree verified afterward |
| `npm test` | All 18 tests passed again on 2026-11-19: 12 isolated MongoDB integration cases and six server-rendered form regressions, using local-process permission for the temporary MongoDB replica set |
| Browser visual/interaction QA | November 3–4: direct Chrome homepage navigation, auth success/errors, signup/login/logout, session refresh/protection, current-user, 390 × 844 mobile login/layout and no-JavaScript checks passed against a temporary DB; remaining checks blocked by native UI automation failure; see manual QA report |
| Atlas connection | Authenticated ping and read-only transaction passed on 2026-10-23; writes/index creation not exercised |
| Production dependency audit | `npm audit --omit=dev`: zero reported vulnerabilities on 2026-10-23 |
| Credential exclusion | Local credential values absent from Git-visible files and browser JS output |
| Local server routing (2026-11-02) | IPv4 homepage: Next.js HTTP 200; localhost/IPv6: PHP HTTP 404 matching the reported error; required local environment formats valid |
| Development refresh fix (2026-11-02) | Home/login/signup HTTP 200; IPv4 HMR connected with HTTP 101 and stayed open for 50 seconds; untrusted dev/auth origins rejected with HTTP 403 |
| Credential-form correction (2026-11-03) | Six regression cases failed before the fix and passed afterward; production login/signup HTML declares POST, disables all form controls before hydration, and includes no-script guidance |

Before release, finish the manual QA report's remaining checks: mobile menu,
additional viewport sizes, remaining CTA/home links, browser history after logout,
offline/rate-limit/slow-request behaviour and production HTTPS. Completed direct
Chrome observations are distinct from earlier static and integration evidence.

README records an older dependency audit dated 2026-10-15: no production findings,
four high-severity entries in one development lint dependency chain. That is
historical for development dependencies. The auth increment's production-only
audit reported zero vulnerabilities on 2026-10-23. Check current upstream status
before release decisions; do not automatically force downgrades.

## Remaining decisions and next work

The user subsequently authorized signup/login and approved its settings. That
increment is now implemented and tested locally. The supplied Atlas URI passed
read-only checks, and the user confirmed browser login opens `/account` after
the development-origin fix. The credential-form review finding was corrected on
2026-11-03. Direct Chrome QA has now verified those core auth flows and both
disabled-JavaScript fallbacks on an isolated local instance. The user chose to
finish with the collected results; remaining browser cases in
`docs/MANUAL_QA_2026-11-04.md` are deferred to a future QA request. No next product
feature is authorized by this QA task.
The subsequent 2026-11-19 request explicitly authorizes commit/push of this work.

The correction uses the existing auth endpoints and dependencies. Native
URL-encoded requests are still unsupported by the JSON-only API; the form remains
disabled when JavaScript is unavailable. No API/schema changes were introduced.

Remaining Phase 1 sequence: password recovery → wedding creation → member
invitations/administration → dashboard shell, in separately authorized increments.
Read `docs/AUTH_IMPLEMENTATION.md` before changing auth parameters. Reset-password,
member-invitation and gallery decisions were not resolved by this auth approval.

| Decision still open | When needed |
| --- | --- |
| Future provider mocks and domain-specific fixtures/indexes | When later increments need them; auth runner/database/index setup is now implemented |
| Reset/member-invitation lifetimes and reset-time session invalidation | Before password recovery/member invitations; signup/login settings are resolved |
| Later provider configuration | Atlas connection is configured and read-only verified; other providers remain deferred |
| Wedding onboarding URLs and later form conventions | Auth uses `/signup`, `/login`, `/account` and same-origin fetch |
| Gallery token persistence: DB §§19–20 hash-only versus API §108 recoverable stable-token recommendation | Before wedding creation generates gallery access |
| Minimum wedding location inputs and initial website/gallery/livestream defaults | Before wedding creation |
| Replacement of expired PENDING member invitations under the partial unique index | Before invitation creation/reinvitation |
| Phase 1 dashboard shell behaviour versus the later-domain aggregation contract | Before dashboard implementation |
| Analytics discrepancy, guest import without a contract, optional upload/QR/email controls | Before the affected later increment |

The accepted stable raw guest-invitation-token exception is already documented;
it does not resolve gallery-token storage. See scaffold §10 and the original
specifications for the detailed gaps rather than treating this table as a contract.

Preserve the PRD delivery order: Foundation (auth → wedding → members → dashboard),
Planning (events/tasks), Guests, Financial/Vendors, Wedding Experience, Memories,
then broader Production Readiness. Relevant security and testing accompany every
increment. Resend is needed in Phase 1 for resets/member invitations, not only
Phase 3 guest email.

## Milestone log

- **Initial planning (before scaffold commit):** inspected the four specifications,
  mapped modules/collections/API surfaces, recorded the scaffold plan and decision
  gaps. User approved the minimal tooling and empty scaffold.
- **2026-10-16 — `cdc267d`:** scaffold and design documents committed; `dev` was
  created and pushed with user approval. Local startup/readiness checks completed.
- **Before homepage implementation:** Stitch connection configured and designs
  viewed. User requested a thorough PRD/design review before coding, then approved
  the recommendations and homepage implementation. Exact session dates not retained.
- **2026-10-22 — `a6f122e`:** homepage implemented/reviewed. Credential review found
  untracked `.mcp.json`; ignored it and verified exclusion. Homepage and assets
  committed/pushed to `dev` with user authorization.
- **2026-10-22 — documentation handoff:** user requested durable context and agent
  instructions. Added this file and `AGENTS.md`, reconciled stale status notes,
  and checked local Markdown links, whitespace, and unchanged frozen documents.
  Application checks were not rerun for documentation-only edits.
- **2026-10-23 — next-feature recommendation:** reviewed the handoff and PRD/API
  requirements; recommended signup with secure session creation after a bounded
  foundation/planning step. Recorded the proposed Phase 1 sequence and kept open
  choices explicit. No application implementation or commit/push was performed.

- **2026-10-23 — signup/login implementation:** user approved Argon2id, 15–128
  characters, seven-day sessions, MongoDB limits, Vitest/isolated DB, auth URLs and
  account confirmation. Built UI/API/persistence and local env templates. Lint,
  typecheck, build, 12 tests and live production-build HTTP checks passed. Browser
  automation remained unavailable; Atlas URI setup was pending at that point. No push/deployment.

- **2026-10-23 — Atlas connection verification:** user supplied the URI locally.
  Authenticated connection/ping, replica-set or sharded topology, and a read-only
  transaction all passed. Transaction was aborted and connection closed; no data
  or indexes were changed. Credentials were not displayed. Write permissions and
  browser signup remain unverified against Atlas.

- **2026-11-02 — local server diagnosis:** reproduced the user's exact 404 from
  the PHP server at `localhost:3000`/IPv6; confirmed the existing Next.js homepage
  responds successfully at `http://127.0.0.1:3000`. Required `.env.local` values
  passed format checks without displaying credentials. Added README troubleshooting;
  no application/configuration changes or process termination. Documentation links
  and whitespace checked; application tests/build not rerun for this documentation
  change. Auth/browser verification remains outstanding.

- **2026-11-02 — login-refresh investigation and development-origin fix:** the
  user reported form submission appearing to refresh `/login`. Server logs
  confirmed blocked IPv4 HMR access; installed Next.js source reloads the page
  after repeated connection failures. Reproduced the rejected WebSocket, added
  only `127.0.0.1` to `allowedDevOrigins`, and verified HTTP 101 plus a stable
  50-second connection. Public auth pages returned HTTP 200; untrusted development
  and auth origins remained blocked (403). Check/build and all 12 auth tests
  passed; tests required local-process permission after the sandbox blocked their
  temporary MongoDB listener. Updated setup/auth notes; frozen specs unchanged.
  Browser automation was blocked by macOS permissions; user confirmation was
  pending at that point. No commit/push/deployment.

- **2026-11-02 — user confirmation:** after refreshing the repaired local login
  page, the user confirmed login succeeds and opens `/account`. Recorded this
  manual verification and closed the reported login-refresh issue. Browser
  signup/logout and broader UI QA remain pending. Documentation-only update;
  link/whitespace checks passed, application checks not rerun.

- **2026-11-02 — uncommitted-change review:** reviewed tracked and untracked auth,
  UI, configuration, dependency and documentation changes against the frozen specs.
  Identified one P1: login/signup forms lack an explicit safe native submission
  method, exposing credentials in URLs if JavaScript is unavailable. Confirmed
  enabled fields and missing method in both production-rendered pages and checked
  standard HTML form semantics. No other concrete defects identified in this pass.
  Manifest/lockfile consistency, dependency inventory, ignored credential files,
  frozen-spec diff and whitespace checks passed. Reused check/build/12-test results
  from earlier this session for unchanged application code; did not rerun them.
  Browser automation remains unavailable. Only this handoff was edited; the
  finding remains unresolved and no commit/push/deployment was performed.

- **2026-11-03 — credential-form security correction:** user requested the review
  fix. Added explicit POST destinations, controls disabled until hydration, a
  pre-readiness submit guard and no-script guidance to the shared auth form.
  Added six regression tests using actual server-rendered component markup;
  all six failed against the old implementation and passed after correction.
  Lint/typecheck, production build and all 18 tests passed. Production HTML for
  login/signup confirmed POST, disabled controls and no-script guidance. Existing
  database tests used their isolated temporary replica set, never Atlas. Browser
  verification was attempted twice but macOS permissions remained pending.
  Updated authentication/test notes and this handoff; frozen specs and dependencies
  unchanged. Browser interaction QA remains; no commit/push/deployment.

- **2026-11-04 — partial Chrome manual QA:** tested the November 3–4 working-tree
  snapshot in Chrome Incognito against a separate local application and temporary
  MongoDB replica set. Verified homepage anchors/skip link, auth validation,
  signup, repeated login/logout, account protection/refresh, current-user responses,
  duplicate signup, mobile login/layout at 390 × 844, and both no-JavaScript
  fallbacks followed by successful reactivation. No application defect confirmed
  in completed cases. Native Chrome actions later stopped responding with
  `noWindowsAvailable`; requested a visible, unlocked QA window. Remaining mobile
  menu/navigation/failure cases and environment limits are recorded in
  `docs/MANUAL_QA_2026-11-04.md`; full manual sign-off remains pending. Source/assets
  and configuration matched the snapshot; no environment files or Atlas records
  were used. Documentation-only changes; no new app tests/build, code fix,
  commit, push or deployment. Documentation links/whitespace and diff checks
  passed. Stopped the isolated QA server and temporary DB successfully after
  the browser blocker; normal development server untouched. Recreate the
  temporary environment to resume remaining checks.

- **2026-11-04 — QA closure:** user requested finishing with the collected
  results. Closed the manual QA task with passed observations and explicit
  coverage gaps; full release sign-off is not claimed. Updated the report and
  handoff only; remaining browser cases are deferred rather than awaiting input.

- **2026-11-04 — uncommitted-change re-review:** independently reviewed tracked
  and untracked auth/UI/infrastructure, tests, configuration, dependency and
  documentation changes against the applicable root instructions and frozen
  contracts. No actionable defects found; the earlier credential-form issue is
  corrected. Lint/typecheck, all 18 isolated tests, manifest/lockfile consistency,
  ignored credential-file checks and diff whitespace checks passed. The initial
  test attempt was blocked by the sandbox's local listener restriction; the
  permitted rerun passed using only its own temporary MongoDB replica set.
  Production build and browser QA were not repeated; earlier build evidence and
  explicitly deferred manual cases remain distinct. Only this handoff was
  updated; no application changes, commit, push or deployment.

- **2026-11-19 — auth delivery preparation:** user explicitly requested commit
  and push of the reviewed changes. Fetched `origin` and confirmed `dev` had no
  divergence. Lint/typecheck, production build and all 18 isolated tests passed.
  Verified the environment template is safe, local credential files remain
  ignored/untracked, and their secret values are absent from changed/new files.
  Frozen specifications are unchanged. This revision packages the auth increment,
  security/development fixes, tests and maintained documentation; browser QA
  coverage remains as recorded on November 4. Commit/push results are verified
  against Git after this preparation; no deployment or new feature work.

## Keeping this file useful

At the end of meaningful work, refresh the snapshot and affected sections, then
append one compact milestone: date, change/decision, verification, remaining work,
and commit when one exists. Mark superseded decisions and resolve stale blockers;
do not merely append contradictory status. Avoid a growing transcript of tool calls.
Record failures and unverified work as clearly as successes. Never store secrets.

For a new session, a useful opening instruction is:

> Read AGENTS.md and PROJECT_CONTEXT.md, inspect the current Git status and source,
> and use the frozen specifications for the next task. Keep PROJECT_CONTEXT.md
> updated with completed work, decisions, validation, and remaining questions.

The files preserve context when they are read and maintained; they do not provide
automatic memory outside the repository. Commit them with related changes when
commit/push is authorized so the handoff is available in future checkouts.
