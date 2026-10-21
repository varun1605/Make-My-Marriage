# Make My Marriage

Next.js App Router + TypeScript foundation for the V1 modular monolith.
The public homepage at `/` follows the reviewed Stitch design, with content
aligned to the frozen V1 scope. Product workflows and REST endpoints will be
added in bounded increments.

## Homepage

The homepage introduces events, tasks, guests, invitations, recorded expenses,
vendors, wedding websites, YouTube livestreams, and private photo sharing.
Cards contain illustrative sample data, not live wedding records. Expense
visuals show spending categories, not budget allocations or payment schedules.

Section links and the responsive mobile menu work locally. Create-wedding and
login buttons open a dismissible coming-soon dialog; they do not create accounts,
authenticate, collect details, or navigate to unimplemented routes. Authentication
and dashboard screens remain separate increments. The public page contains no
private wedding data or backend/provider imports.

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

Open http://localhost:3000. No environment file, database, provider credentials,
or external-service connection is required to run the homepage.

`next.config.ts` disables automatic `AGENTS.md` generation so starting the
development server preserves the separate project-rules approval workflow.

## Validate and build

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

`npm run check` runs lint and type checking. Type checking generates Next.js route
types before running TypeScript, so it works on a fresh checkout. Next.js also
generates `next-env.d.ts`; generated files are ignored by Git.

A test framework and formatter are deferred by agreement. There is no placeholder
test script. Add feature tests when the first implementation increment and its
test tooling are approved.

## Project structure

| Location | Purpose |
| --- | --- |
| `src/app` | Server Component root layout/page, plain global CSS, future App Router pages |
| `src/app/api` | Reserved REST route-handler surfaces; no executable handlers yet |
| `src/modules` | Reserved directories for all 13 documented domains |
| `src/server` | Reserved authentication, authorization, database, HTTP, provider, and configuration infrastructure |
| `src/components` | Shared presentation components |
| `src/shared` | Browser-safe shared types and pure utilities |
| `public` | Public static assets, never private wedding media |
| `tests` | Future integration/E2E suites and fixtures |

Small `.gitkeep` files preserve the reserved directories in Git. They contain no
implementation. Create models, schemas, services, repositories, provider adapters,
and routes only as their increments need them.

Pages/layouts are Server Components unless explicitly marked `"use client"`.
Future private runtime modules must use `import "server-only";`; Next.js provides
that boundary marker internally. Do not import database/provider code from client
components or browser-safe shared modules. No server infrastructure is implemented
yet, and a directory name alone does not enforce authorization or import safety.
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

The official Next.js plugin is configured directly so the scaffold can use
ESLint 10 without the full preset's older React/import plugin peer constraints.
TypeScript 6.0 is pinned to match the TypeScript ESLint parser's supported range.

Mongoose, Zod, and provider SDKs remain the frozen choices for their respective
features; they are not installed before there is code that needs them.

### Dependency audit note

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

Still deferred: test framework, formatter, service configuration, feature-specific
frontend conventions, and the open product/security decisions recorded in the
plan. The first business increment is signup with secure session creation after
its parameters are agreed. `AGENTS.md` content still requires separate approval.

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
| `src/components/home/access-button.tsx` | Accessible coming-soon dialog for deferred account access |
| `src/components/home/home.module.css` | Scoped homepage styling and responsive layouts |
| `src/components/icon.tsx` | Shared inline SVG presentation icons |
| `public/images/*`, `public/fonts/*`, `public/ASSETS.md` | Local Stitch imagery, fonts, licences, and provenance |
| `README.md` | Setup, checks, dependency rationale, and scope |
| `src/app/api/README.md` | REST handler placement and responsibilities |
| `src/modules/README.md` | Domain ownership and server/client conventions |
| `src/server/README.md` | Infrastructure ownership and secret boundaries |
| `src/components/README.md`, `src/shared/README.md` | Shared UI and browser-safe code boundaries |
| `tests/README.md` | Deferred testing setup and current verification |
| `public/.gitkeep` | Reserves public assets directory |
| `src/app/api/{auth,public,internal}/.gitkeep` | Reserves the three API namespaces |
| `src/modules/{auth,wedding,wedding-members,events,tasks,guests,invitations,expenses,vendors,wedding-website,photos,livestream,email}/.gitkeep` | Reserves all domain modules |
| `src/server/{auth,authorization,db,http,email,storage,vendors,config}/.gitkeep` | Reserves infrastructure directories |

Brace notation in the inventory lists individual files. Frozen specifications
and the scaffold plan are preserved without modification.
