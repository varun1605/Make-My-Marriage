# Make My Marriage

Next.js App Router + TypeScript foundation for the V1 modular monolith.
The public homepage at `/` follows the reviewed Stitch design, with content
aligned to the frozen V1 scope. Signup, login, session lookup and logout are
implemented; remaining product workflows will be added in bounded increments.

Start future work with [AGENTS.md](AGENTS.md) and
[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). They record project instructions,
decisions, completed work, verification limits, and the next planning steps.

## Homepage

The homepage introduces events, tasks, guests, invitations, recorded expenses,
vendors, wedding websites, YouTube livestreams, and private photo sharing.
Cards contain illustrative sample data, not live wedding records. Expense
visuals show spending categories, not budget allocations or payment schedules.

Section links and the responsive mobile menu work locally. Create-wedding and
login controls now link to `/signup` and `/login`. After authentication, `/account`
confirms the signed-in account; wedding setup/dashboard remain separate increments.
The public homepage contains no private wedding data or backend/provider imports.

The page uses plain CSS, shared colour tokens, and locally served EB Garamond and
Manrope fonts. Images use Next.js image optimisation. See
[public/ASSETS.md](public/ASSETS.md) for asset sources and font licences.

## Run locally

Use npm 11 or newer and a Node.js version matching `package.json`: 20.19+ within
20.x, 22.13+ within 22.x, or 24+. Verified locally with Node.js 20.19.0 and npm 11.7.0.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Public pages render without database credentials.
For signup/login, fill `MONGODB_URI` in the ignored `.env.local` created for this
workspace, then restart the development server. A fresh checkout should copy
`.env.example` to `.env.local` and generate its own 64-hex-character session secret.
Use an isolated Atlas development database (replica set), and make `APP_ORIGIN`
match the browser origin exactly. See [authentication setup](docs/AUTH_IMPLEMENTATION.md)
for variables, permissions, security settings and verification limits.

If `http://localhost:3000` shows “The requested resource / was not found on this
server,” open `http://127.0.0.1:3000` instead. On this workspace, a separate PHP
server was verified on IPv6 localhost (`::1:3000`) on 2026-11-02; it returned that
404 while the Next.js homepage returned HTTP 200 over IPv4. Run this project with
`npm run dev` and keep the browser origin consistent with `APP_ORIGIN`. The blank
secret fields in `.env.example` are intentional; actual values belong in `.env.local`.

`next.config.ts` allows `127.0.0.1` for development resources, including the
hot-reload WebSocket. Without this, Next.js rejects that connection and its client
eventually reloads the page after repeated failed reconnects, interrupting forms.
This setting does not change the auth API's exact `APP_ORIGIN` checks. Restart
`npm run dev` if a configuration change has not been picked up automatically.
The configuration also disables automatic `AGENTS.md` generation so starting
the development server preserves the deliberately maintained root `AGENTS.md`.

## Validate and build

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm run check` runs lint and type checking. Type checking generates Next.js route
types before running TypeScript, so it works on a fresh checkout. Next.js also
generates `next-env.d.ts`; generated files are ignored by Git.

Vitest and mongodb-memory-server run authentication tests against an isolated
temporary replica set, without using `.env.local` or Atlas. The first test run may
download a MongoDB binary. A formatter remains deferred. Partial Chrome visual
and interaction QA passed; see the [manual QA report](docs/MANUAL_QA_2026-11-04.md)
for completed checks and deferred cases.

## Project structure

| Location | Purpose |
| --- | --- |
| `src/app` | Homepage, auth pages/account confirmation, layouts and global CSS |
| `src/app/api` | Four auth REST handlers; other surfaces reserved |
| `src/modules` | Auth workflows/models; read-only wedding/membership projections; other domains reserved |
| `src/server` | Auth mechanisms, rate limiting, config, DB and HTTP helpers; provider infrastructure reserved |
| `src/components` | Shared presentation components |
| `src/shared` | Browser-safe shared types and pure utilities |
| `public` | Public static assets, never private wedding media |
| `tests` | Isolated MongoDB authentication integration tests |

Small `.gitkeep` files preserve the reserved directories in Git. They contain no
implementation. Create models, schemas, services, repositories, provider adapters,
and routes only as their increments need them.

Pages/layouts are Server Components unless explicitly marked `"use client"`.
Private runtime modules use `import "server-only";`. Do not import database/provider
code from client components or browser-safe shared modules. Auth forms share only
browser-safe validation schemas; route handlers and account rendering call server
services. A directory name alone does not enforce authorization or import safety.
See [Next.js server/client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning).

## Approved scaffold tooling

- npm with exact direct dependency versions and a committed lockfile.
- Strict TypeScript and the `@/*` alias for `src/*`.
- ESLint using the official Next.js plugin's Core Web Vitals rules, JavaScript
  recommended rules, and TypeScript recommended rules.
- Plain CSS; the homepage adds locally served fonts with system fallbacks.
  No remote font fetching occurs during builds.

The setup follows the [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation)
and [ESLint guide](https://nextjs.org/docs/app/api-reference/config/eslint).

### Why each dependency exists

| Package | Purpose |
| --- | --- |
| `next` | App Router, development server, production build/runtime, future REST Route Handlers |
| `react`, `react-dom` | Framework rendering dependencies |
| `typescript` | Strict compile-time checks |
| `@types/node`, `@types/react`, `@types/react-dom` | Type declarations for the runtime and rendering dependencies |
| `eslint`, `@eslint/js` | Supported ESLint runtime and recommended JavaScript rules |
| `@next/eslint-plugin-next` | Official Next.js Core Web Vitals rules |
| `typescript-eslint` | TypeScript parsing and recommended lint rules |
| `mongoose`, `zod` | Documented database persistence and boundary validation |
| `argon2` | Approved password hashing |
| `server-only` | Enforces server/client import boundaries |
| `vitest`, `mongodb-memory-server` | Approved feature tests with isolated MongoDB transactions |

The official Next.js plugin is configured directly so the scaffold can use
ESLint 10 without the full preset's older React/import plugin peer constraints.
TypeScript 6.0 is pinned to match the TypeScript ESLint parser's supported range.

Mongoose and Zod are now used by authentication. Provider SDKs remain deferred
until the corresponding features need them.

### Dependency audit note

After the auth dependencies were added on 23 October 2026,
`npm audit --omit=dev` reported zero production vulnerabilities.

On 15 October 2026, the production dependency audit (`npm audit --omit=dev`)
reported no vulnerabilities. The full audit reports four high-severity entries
in one development-only chain: the Next.js lint plugin → `fast-glob` →
`micromatch` → `braces`. The underlying
[braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) has no patched
release listed. Track the upstream fix; an automatic forced downgrade of Next.js
lint tooling is not applied. This limitation does not prevent the scaffold checks
from running.

## Specifications and next work

The four documents in `docs/` remain authoritative. See
[PROJECT_SCAFFOLD.md](PROJECT_SCAFFOLD.md) for the reviewed architecture and sequence.
It records the pre-scaffold repository assessment; this README describes the
current executable starting point.

Signup/login settings and test tooling were approved and implemented. Still
deferred: password recovery/Resend, wedding creation, member administration,
dashboard, formatter and later integrations. Open decisions remain recorded in
`PROJECT_CONTEXT.md`; resolved auth settings and file responsibilities are in
[AUTH_IMPLEMENTATION.md](docs/AUTH_IMPLEMENTATION.md). Root instructions are in `AGENTS.md`.

### Scaffold file inventory

| Files | Purpose |
| --- | --- |
| `.gitignore` | Excludes dependencies, generated output, credentials, and local metadata |
| `package.json`, `package-lock.json` | Scripts, exact dependency versions, reproducible dependency tree |
| `tsconfig.json` | Strict TypeScript, Next.js plugin, source alias |
| `eslint.config.mjs` | Next.js and TypeScript lint configuration |
| `next.config.ts` | Disables automatic agent-rules file generation during development |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | Homepage content, layout, metadata, fonts, and shared design tokens |
| `src/components/home/site-header.tsx` | Responsive navigation and mobile menu |
| `src/components/home/access-button.tsx` | Homepage links to signup/login |
| `src/components/home/home.module.css` | Scoped homepage styling and responsive layouts |
| `src/components/icon.tsx` | Shared inline SVG presentation icons |
| `public/images/*`, `public/fonts/*`, `public/ASSETS.md` | Local Stitch imagery, fonts, licences, and provenance |
| `README.md` | Setup, checks, dependency rationale, and scope |
| `src/app/api/README.md` | REST handler placement and responsibilities |
| `src/modules/README.md` | Domain ownership and server/client conventions |
| `src/server/README.md` | Infrastructure ownership and secret boundaries |
| `src/components/README.md`, `src/shared/README.md` | Shared UI and browser-safe code boundaries |
| `tests/README.md` | Test setup and verification scope |
| `docs/AUTH_IMPLEMENTATION.md` | Auth setup, implementation decisions and validation |
| `.env.example` | Safe server environment template; actual `.env.local` is ignored |
| `src/app/(auth)`, `src/components/auth` | Auth screens, shared forms/styles, logout and account confirmation |
| `src/modules/auth`, `src/server/{auth,config,db,http}` | Auth persistence/services and shared server foundation |
| `vitest.config.mts`, `tests/*.ts` | Test configuration and MongoDB integration suite |
| `public/.gitkeep` | Reserves public assets directory |
| `src/app/api/{auth,public,internal}/.gitkeep` | Reserves the three API namespaces |
| `src/modules/{auth,wedding,wedding-members,events,tasks,guests,invitations,expenses,vendors,wedding-website,photos,livestream,email}/.gitkeep` | Reserves all domain modules |
| `src/server/{auth,authorization,db,http,email,storage,vendors,config}/.gitkeep` | Reserves infrastructure directories |

Brace notation in the inventory lists individual files. Frozen specifications
remain unchanged; the scaffold plan retains its historical assessment with a
current-status note linking to the maintained handoff.
