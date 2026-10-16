# REST route handlers

Add handlers here with the feature that implements their documented contract.
The reserved `auth`, `public`, and `internal` directories correspond to the API
surfaces in `docs/API_DESIGN.md`. Authenticated application routes live directly
under this directory, for example `wedding/route.ts` and `events/route.ts`.

No API endpoints are implemented by this scaffold. Keep future handlers thin:
authenticate, authorize, validate with Zod, call a service, and map the response.
