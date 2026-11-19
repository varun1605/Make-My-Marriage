# Make My Marriage V1 — Project Scaffold Plan

This document records the reviewed project structure and implementation sequence.
It is a planning document, not an executable application scaffold. Unresolved
choices are marked **Needs implementation decision** and remain open.

> **Status update — 2026-10-22:** This plan preserves the pre-scaffold assessment
> and historical approval steps. The approved scaffold and public homepage now
> exist. The user has explicitly requested creation of `AGENTS.md` and a maintained
> context file, superseding this plan's earlier instruction to leave agent rules
> pending separate approval. Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for
> current progress and resolved tooling choices, [AGENTS.md](AGENTS.md) for working
> rules, and [README.md](README.md) for executable setup. Open feature decisions
> remain open unless a later recorded decision explicitly resolves them.

## 1. Authoritative specifications

| Document | Controls |
| --- | --- |
| [PRD.md](docs/PRD.md) | Product behaviour, scope, roles, and release phases |
| [SYSTEM_DESIGN (1).md](<docs/SYSTEM_DESIGN (1).md>) | Architecture, technologies, integrations, and deployment |
| [DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | Persistence, schemas, indexes, and integrity rules |
| [API_DESIGN.md](docs/API_DESIGN.md) | REST contracts, validation, authorization, and responses |

These four documents remain the source of truth. This plan does not amend them.
Read relevant implementation amendments as well as the original sections; where
an amendment explicitly supersedes earlier guidance, follow that amendment.
Flag unresolved conflicts before implementing the affected behaviour. Do not
change frozen documents without an explicit request.

## 2. Current repository

At the time of this review, the repository contains the four specifications under
`docs/`, Git metadata, and `.DS_Store`. It has no application source, package
manifest, lockfile, framework configuration, tests, or `AGENTS.md`.

Some specification amendments describe implemented features, source paths, and
test commands. Those implementation artifacts are absent from this checkout;
their mention is not evidence that functionality or tooling already exists here.

## 3. Frozen technical foundation

| Area | Established choice |
| --- | --- |
| Application | Next.js + TypeScript modular monolith; one deployable application |
| Backend | Node.js through Next.js Route Handlers; explicit REST APIs |
| Database | MongoDB Atlas + Mongoose |
| Validation | Zod at external boundaries; Mongoose for persistence integrity |
| Authentication | Custom email/password authentication; server-side sessions in MongoDB |
| Session cookie | HttpOnly, Secure in production, SameSite=Lax, Path=/ |
| Object storage | Cloudflare R2; signed direct browser uploads |
| Email | Resend behind an internal abstraction |
| Bulk email | MongoDB email jobs, small batches, atomic claiming, Vercel Cron |
| Vendor discovery | Google Places through the backend |
| Livestream | YouTube embed |
| Hosting/logging | Vercel; application and runtime logs |

Do not introduce microservices, Express, NestJS, GraphQL, Redis, external auth
platforms, dedicated queue infrastructure, or realtime collaboration in V1.
Do not expand product scope beyond the specifications.

## 4. Target directory structure

The tree below records the reviewed organization. It is a destination map, not
an instruction to generate every directory, route, or placeholder immediately.
`...` abbreviates documented child routes rather than naming a literal directory.

```text
Make-My-Marriage/
├── docs/                         # Existing frozen specifications
├── PROJECT_SCAFFOLD.md            # This plan
├── AGENTS.md                     # Future project rules; content approval required
├── public/                       # Public static assets, never private wedding media
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/               # Authentication pages and layouts
│   │   ├── (onboarding)/         # Create/join wedding experience
│   │   ├── (private)/app/        # Wedding dashboard and management pages
│   │   ├── w/[slug]/            # Published wedding website
│   │   ├── invite/[token]/      # Guest invitation and RSVP
│   │   ├── gallery/[token]/     # Token-protected guest gallery
│   │   └── api/
│   │       ├── auth/...
│   │       ├── wedding/...
│   │       ├── dashboard/
│   │       ├── members/...
│   │       ├── member-invitations/[token]/accept/
│   │       ├── events/...
│   │       ├── tasks/...
│   │       ├── guests/...
│   │       ├── expenses/...
│   │       ├── vendors/...
│   │       ├── vendor-discovery/search/
│   │       ├── gallery/...
│   │       ├── photos/...
│   │       ├── email-batches/...
│   │       ├── public/...
│   │       └── internal/jobs/email/
│   ├── modules/
│   │   ├── auth/
│   │   ├── wedding/
│   │   ├── wedding-members/
│   │   ├── events/
│   │   ├── tasks/
│   │   ├── guests/
│   │   ├── invitations/
│   │   ├── expenses/
│   │   ├── vendors/
│   │   ├── wedding-website/
│   │   ├── photos/              # Gallery domain; path specified by amendment
│   │   ├── livestream/
│   │   └── email/
│   ├── server/
│   │   ├── auth/                # Session, cookie, password, and token utilities
│   │   ├── authorization/       # Membership, role, and tenant checks
│   │   ├── db/                  # Reusable Mongoose connection management
│   │   ├── http/                # Request helpers and HTTP error mapping
│   │   ├── email/               # Resend adapter
│   │   ├── storage/r2.ts        # R2 signing/object operations; documented path
│   │   ├── vendors/             # Google Places adapter
│   │   └── config/              # Server environment configuration
│   ├── components/              # Shared presentation components
│   └── shared/                  # Browser-safe types and utilities
└── tests/                       # Integration/E2E suites and fixtures
```

App Router pages and layouts belong under `src/app`; backend endpoint handlers
use `route.ts` in the corresponding API directories. Route groups organize files
and layouts; they do not themselves enforce authentication or authorization.
Exact authentication/onboarding page URLs remain **Needs implementation decision**.

Domain modules own their services, repositories, Mongoose models, Zod schemas,
types, and focused unit tests as needed. A module can contain multiple models;
a module without independent persistence should not receive an artificial model
or collection. Domain-specific error definitions stay with the domain; shared
error representation and HTTP mapping belong in `server/http`.

`modules/auth` owns authentication workflows; `server/auth` provides supporting
mechanisms. `modules/email` owns templates and delivery/job workflows;
`server/email` encapsulates Resend. `modules/vendors` owns saved-vendor and
discovery use cases; `server/vendors` encapsulates Google Places. Avoid duplicate
service layers or generic abstractions without an immediate purpose.

## 5. Domain and persistence ownership

| Module | Responsibility | Collections or embedded data |
| --- | --- | --- |
| Auth | Accounts, sessions, password reset | `users`, `sessions`, `password_reset_tokens` |
| Wedding | Tenant identity, creation, details, dashboard coordination | `weddings` |
| Wedding Members | Membership, roles, member invitations | `wedding_memberships`, `wedding_member_invitations` |
| Events | Event planning and archiving | `events` |
| Tasks | Assignment, status, due dates, event associations | `tasks` |
| Guests | Invitation groups, contact details, capacity | `guests` |
| Invitations | Stable sharing links, invitation views, RSVP, delivery coordination | Invitation/RSVP fields in `guests` |
| Expenses | Recorded expenditure and summaries | `expenses` |
| Vendors | Saved vendors and discovery | `vendors` |
| Wedding Website | Publishing, themes, public content | Embedded wedding configuration |
| Gallery (`photos`) | Uploads, browsing, sharing, albums, QR | `photos`; embedded wedding gallery configuration |
| Livestream | YouTube configuration | Embedded wedding configuration |
| Email | Templates, immediate delivery, bulk processing | `email_jobs` |

There are 13 primary collections. Do not add separate collections for guest
invitations, RSVP, websites, galleries, livestreams, or email batches. Invitations
use the Guests persistence interface; website, gallery configuration, and
livestream services use Wedding persistence. Each collection has one model owner.

Use the documented indexes and constraints. Wedding date is date-only, event
timestamps are UTC with an explicit wedding timezone, and money uses integer
paise. Calculate dashboard totals from indexed source collections rather than
maintaining denormalized counters initially.

## 6. Layer responsibilities and dependency rules

```text
UI → REST Route Handler → Domain Service → Repository → Mongoose → MongoDB
                                      └→ Provider Abstraction → External Service
```

- **Route handlers:** parse requests; authenticate; resolve authorized context;
  validate body/query/route parameters with Zod; invoke services; map results and
  errors into the documented HTTP contracts. Keep business rules out of handlers.
- **Services:** enforce domain rules, validate same-wedding references, coordinate
  workflows and providers, and define transaction boundaries. Services receive
  trusted authorization context rather than treating client fields as authority.
- **Repositories:** encapsulate queries, projections, writes, aggregations, and
  transaction participation. Wedding-owned operations require wedding scope.
- **Models:** express the database design and indexes; do not invent fields or
  change persistence rules merely to simplify a handler or screen.
- **Provider adapters:** contain provider SDK/configuration details and translate
  failures without exposing credentials or raw provider errors.
- **UI:** uses documented REST contracts for application operations. Neither UI
  files nor route handlers should scatter direct Mongoose/database queries.

Dependencies flow toward services and persistence, never from repositories or
provider adapters into routes or UI. Cross-domain access uses explicit service
or repository interfaces; avoid circular dependencies and direct access to
another module's models. Shared browser-safe utilities do not depend on modules
or server infrastructure.

Browser components must never import models, repositories, database connections,
server services/configuration, session internals, or credential-bearing provider
SDKs. Pass serializable public response types to UI; do not expose Mongoose
documents or secret-bearing server objects. The concrete mechanism for enforcing
these import boundaries is **Needs implementation decision**.

## 7. API and security boundaries

| Surface | Contract |
| --- | --- |
| `/api/auth/*` | Signup, login, logout, current user, forgot/reset password |
| Authenticated `/api/*` | Documented wedding-management resources and actions |
| `/api/public/*` | Published website data and token-protected guest/member-invitation views |
| `/api/internal/*` | System-only processing protected by the internal cron secret |

Use the exact route contracts in API_DESIGN, including amendments. Do not add
`/api/v1`, invent endpoints, or replace documented REST operations with a different
API mechanism. Use page pagination for endpoints that specify it; photo lists
use cursors. Preserve endpoint-specific list contracts, response shapes, and
consistent application errors.

- Wedding is the tenant boundary. Derive private wedding context from session →
  user → membership. Do not trust a client-supplied `weddingId` as authorization.
- Scope every wedding-owned lookup and mutation to its authorized wedding,
  including referenced records, email batches, and storage operations.
- User/session/reset data uses user ownership. Signup, wedding creation, and
  invitation acceptance must not require a pre-existing wedding membership.
- One user can belong to only one wedding. Creation makes the creator an Admin.
- Admins and Managers share normal wedding operations. Managers may read members;
  membership administration and pending-invitation listing are Admin-only.
- Never allow the last Admin to be removed or demoted. Member removal must
  immediately remove wedding access even if the login session remains valid.
- Guests never require accounts. Resolve guest access through the appropriate
  token and expose only the documented public fields.
- Return `NOT_FOUND` for another wedding's resource. Enforce authorization in the
  backend rather than relying on layouts, hidden controls, or frontend filtering.
- Keep APIs same-origin; follow the specified cookie and mutation-origin checks.
- Never log passwords, secret tokens, session credentials, signed URLs, or provider
  credentials. Avoid logging token-bearing paths or sensitive provider responses.
- Wedding creation plus first membership, and invitation acceptance plus new
  membership, must be atomic.

Guest invitation tokens already have an accepted stable raw-token exception,
excluded from ordinary reads and logs. Session/reset/member-invitation tokens
follow the later HMAC-SHA-256 clarification. Gallery-token persistence remains
an unresolved cross-document decision; do not silently choose an approach.

## 8. Scaffold implementation boundary

After outstanding scaffold choices are approved, create only the minimum
infrastructure needed to start the application, plus useful shared structure.
Introduce domain files and provider adapters when their first increment needs
them; do not generate hundreds of empty files or nonfunctional endpoint stubs.

Do not implement signup, wedding creation, membership, guests, expenses, vendors,
photos, or other product behaviour during scaffolding. Do not require production
service connections merely to boot. Explain each added dependency and keep
development data and credentials isolated from production.

Before implementing a bounded increment, read its relevant frozen sections and
the eventual approved AGENTS.md; describe behaviour, expected file changes, and
tenant/security requirements. Run the applicable lint, typecheck, tests, and build
checks configured for that work. Report changed files, behaviour, validation,
remaining work, and any divergence. If a frozen contract must change, ask before
making that change.

AGENTS.md is a separate future artifact. Present its proposed content for approval
before writing it, as requested in the project workflow.

## 9. Delivery sequence

| Phase | PRD scope |
| --- | --- |
| 1 — Foundation | Authentication → Wedding creation → Wedding Members → Dashboard shell |
| 2 — Planning | Events, Tasks |
| 3 — Guests | Guest management, Invitations, RSVP, Email, WhatsApp sharing |
| 4 — Financial and Vendors | Expense tracker, My Vendors, Vendor discovery |
| 5 — Wedding Experience | Wedding website, Themes, YouTube livestream |
| 6 — Memories | Gallery, Guest uploads, Albums, Private sharing, QR |
| 7 — Production Readiness | Error handling, Security review, Responsive design, Performance, Testing, Analytics, Deployment, Monitoring |

Preserve this phase order. Within it, implement Events before dependent task and
guest associations; Guest records before sharing/RSVP/delivery; and storage/member
gallery capabilities before guest uploads and QR. Expenses may initially omit a
vendor, adding vendor associations when saved vendors exist.

Resend is needed during Phase 1 for password resets and member invitations.
Phase 3 adds guest email and bulk jobs. Validation, security, and relevant tests
accompany each increment; Phase 7 expands readiness verification rather than
postponing those responsibilities until release.

### Phase 1 increments

1. **Shared foundation:** approved server/client boundaries, environment handling,
   Mongoose connection reuse, validation/error conventions, and test setup.
2. **Authentication:** signup and session creation first; then login, current user,
   logout, and password reset. Use the documented models, unique indexes, TTL
   indexes, cookie properties, and responses.
3. **Wedding creation/context:** documented wedding endpoints, atomic wedding and
   first Admin creation, stable slug, gallery-token generation after its decision,
   membership resolution, and tenant authorization.
4. **Member invitations:** create/list/revoke, public preview, and authenticated
   acceptance. Enforce matching normalized email, expiry, membership uniqueness,
   and atomic acceptance.
5. **Member administration:** listing, role changes, and removal with final-Admin
   protection and immediate loss of access for removed members.
6. **Dashboard shell:** wedding identity, navigation, countdown, and the agreed
   initial behaviour of the documented dashboard aggregation contract.

The first business increment is **signup with secure session creation**, after
its implementation parameters are approved. Keep each increment independently
implementable, testable, and reviewable.

Phase 1 verification should cover duplicate accounts, invalid/expired sessions,
expired/reused reset tokens, concurrent wedding creation, invalid/revoked/expired
member invitations, mismatched invitation email, duplicate acceptance, Manager
restrictions, cross-wedding access, and concurrent attempts to remove/demote the
last Admin.

## 10. Decisions still open

All entries below are **Needs implementation decision**. Example values or
commands in a specification do not establish an unambiguous project default.

### Before executable scaffolding

| Decision | What must be settled |
| --- | --- |
| Package manager and versions | Package manager, lockfile, Node/Next/dependency versions, pinning policy. The appendix mentions `npm test`; no package configuration exists here. |
| Configuration details | Exact naming/aliases, test placement, and how server/client import boundaries are enforced within the reviewed structure |
| TypeScript, lint, formatting | Strictness, tools/rules, scripts, and CI checks |
| Test tooling | Unit/integration/E2E runners, database environment, fixtures, provider mocks |
| Styling and frontend conventions | Styling/component approach, form handling, data fetching, state conventions |
| Local development | Environment variables, isolated development database, transaction-capable testing, index setup, provider test configuration |
| Minimum scaffold | Exact bootable files/dependencies and when external-service configuration becomes required |

### Before the affected Phase 1 feature

| Decision | Gap and source |
| --- | --- |
| Gallery-token persistence | DATABASE_DESIGN §§19–20 requires hash-only storage; API_DESIGN §108 recommends recoverable stable raw storage. API §17 generates the token at wedding creation. |
| Authentication parameters | Password policy/library/cost; session lifetime/renewal; reset/member-invitation lifetimes; reset-time session invalidation; authentication rate-limit thresholds. Cookie flags and the later token-hashing clarification are already specified. |
| Wedding input/defaults | PRD §9.2 requires city/location, but individual location fields are optional in the database example. Minimum location validation and initial website/gallery/livestream defaults need agreement. |
| Expired invitation replacement | DATABASE_DESIGN §§28–29 allows expired invitations to remain PENDING while a partial unique index allows one pending invitation per wedding/email. API §22 rejects pending duplicates; reinvitation handling is unspecified. |
| Dashboard shell | PRD Phase 1 asks for a shell; API §20 describes aggregates over later-phase domains. Initial shell behaviour needs agreement without inventing a replacement API contract. |

### Before later features

- **Needs implementation decision — analytics scope:** PRD Phase 7 includes
  analytics, while SYSTEM_DESIGN excludes product analytics in MVP and
  API_DESIGN §109 excludes product analytics APIs. Do not introduce a provider
  during scaffolding.
- **Needs implementation decision — guest import:** the PRD journey mentions
  importing guests, but no import contract is defined. Do not invent one.
- **Needs implementation decision — remaining optional contracts/configuration:**
  settle the documented alternatives when their increments are planned, including
  bulk-send payload options, optional failed-email retry controls, QR response
  choice, proposed cover-upload routes, and email-worker batch/retry settings.
  Preserve choices already fixed by later amendments.
