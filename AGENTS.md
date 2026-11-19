# Make My Marriage — agent instructions

## Start each task

1. Read `PROJECT_CONTEXT.md` for the current handoff, decisions, and limitations.
2. Inspect Git status and relevant source before editing; preserve unrelated work.
3. Read the relevant frozen specifications, including later amendments, and the
   directory READMEs for the affected code. Do not infer implementation from a
   specification's use of the word “implemented.” Verify the actual source.
4. Implement one bounded increment. Explain intended behaviour, expected files,
   and relevant authorization/security boundaries before making feature changes.

## Sources of truth

| File | Authority |
| --- | --- |
| `docs/PRD.md` | Product behaviour, roles, scope, release phases |
| `docs/SYSTEM_DESIGN (1).md` | Architecture, technology, integrations |
| `docs/DATABASE_DESIGN.md` | Persistence, schemas, indexes, integrity |
| `docs/API_DESIGN.md` | REST contracts, validation, authorization, responses |

These four files are frozen: do not edit them without an explicit user request.
Follow amendments that explicitly supersede earlier sections. Flag unresolved
conflicts or unspecified product/security choices before implementing dependent
behaviour; do not silently invent requirements, endpoints, or schema fields.
`PROJECT_SCAFFOLD.md` records the architecture plan. `PROJECT_CONTEXT.md` records
progress, not new product requirements. Neither overrides the frozen documents.
Current explicit user instructions supersede older workflow notes.

## Architecture and boundaries

- Keep one Next.js + TypeScript modular monolith. Use Next.js Route Handlers for
  documented REST operations, MongoDB Atlas + Mongoose for persistence, and Zod
  for external-boundary validation.
- Keep route handlers thin: parse, authenticate/authorize, validate, call services,
  map responses/errors. Business rules belong in domain services; database access
  belongs in repositories and domain-owned models, not UI or route files.
- Use `src/modules` for domains, `src/server` for server infrastructure/provider
  adapters, `src/components` for presentation, and `src/shared` for browser-safe
  types/utilities. Gallery belongs to `src/modules/photos`.
- Default pages/layouts to Server Components. Add `"use client"` only where
  browser interaction requires it. Future private runtime services, repositories,
  models, and infrastructure must use `import "server-only";`. Keep browser-safe
  types separate; never expose Mongoose documents or credentials to clients.
- Preserve custom email/password authentication with MongoDB-backed sessions and
  HttpOnly cookies, Secure in production, SameSite=Lax, Path=/.
- Providers: Cloudflare R2 for storage, Resend for email, Google Places for vendor
  discovery, YouTube for livestreams, Vercel for deployment/Cron. Bulk email uses
  MongoDB jobs and small batches. Introduce adapters/dependencies when needed.
- Do not introduce microservices, Express, NestJS, GraphQL, Redis, external auth
  platforms, realtime collaboration, or unapproved infrastructure.

## Product and security invariants

- Wedding is the tenant boundary. Resolve private wedding context from the
  authenticated user and membership; never trust a client `weddingId`. Scope
  wedding-owned queries, mutations, references, email jobs, and storage actions.
  User/session/reset data uses user ownership; signup must not require membership.
- One user belongs to at most one wedding. Admins and Managers share normal
  wedding visibility; enforce documented Admin-only membership operations,
  last-Admin protection, and immediate access removal on the backend.
- Guests require no accounts. Keep public websites separate from private guest
  invitations and token-protected galleries; expose only documented public fields.
- Follow exact REST contracts, errors, pagination, cookie/origin checks, indexes,
  and atomicity requirements. Store money in integer paise and preserve specified
  date/time semantics. Directory structure and hidden controls are not security.
- Expenses record spending/commitments, not budgets, installments, or split
  payments. Do not add bookings/payments, household/travel management, automated
  WhatsApp/SMS, or other excluded V1 features. Stitch is a visual reference;
  frozen specifications control behaviour and feature claims.
- Never log or document passwords, secret tokens, sessions, signed URLs, provider
  credentials, or sensitive customer data. Keep `.mcp.json` and secret environment
  files out of Git; never force-add them. `public/` is never private media storage.
- Preserve the accepted guest invitation stable-token exception. Do not generalize
  it to other tokens; resolve the gallery-token conflict before dependent work.

## Tooling and verification

- Use npm, the committed lockfile, strict TypeScript, the `@/*` alias, existing
  ESLint rules, and plain CSS/CSS Modules. Keep direct dependencies pinned and
  explain new dependencies. Vitest and mongodb-memory-server are approved for
  feature tests; a formatter remains deferred.
- Run relevant checks for code changes: `npm run check` (lint + typecheck), and
  `npm run build` when application/build behaviour changes. Add meaningful feature
  tests for backend features and run `npm test`. Tests must use their own temporary
  database, never a developer's Atlas database or production records.
- Verify UI changes in a browser where available, including responsive layouts,
  keyboard navigation, focus, and dialogs. Report unavailable verification honestly.
  Documentation-only changes need link/content/diff checks, not an application build.
- Finish with behaviour/files changed, checks and results, remaining work, and any
  divergence. Do not claim a commit, push, deployment, or live service connection
  without observing success. Commit/push only within the user's authorized scope.

## Maintain continuity

- Update `PROJECT_CONTEXT.md` in the same change as meaningful implementation,
  decisions, reviews, or blocker resolution. Refresh the current snapshot and
  append a short dated milestone; keep historical evidence distinct from current
  validation. Update README setup instructions when they change.
- Record what exists, what remains, decisions and their rationale, checks actually
  run, unresolved questions, and the next bounded step. Mark proposals as proposals.
- Never copy secrets, complete chat transcripts, or transient tool/session IDs
  into context. Use repository-relative paths and durable commit references.
- Read context at session start and reconcile it with Git/source. Context is a
  maintained handoff, not guaranteed automatic memory. Do not start the next
  feature merely because it appears in the handoff.
