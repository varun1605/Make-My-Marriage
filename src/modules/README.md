# Domain modules

The reserved module directories follow `PROJECT_SCAFFOLD.md`:

`auth`, `wedding`, `wedding-members`, `events`, `tasks`, `guests`, `invitations`,
`expenses`, `vendors`, `wedding-website`, `photos`, `livestream`, and `email`.

Add services, repositories, models, Zod schemas, and tests only when an increment
needs them. Models belong to their owning domain. Modules without separate
persistence must not invent collections. `photos` owns the Gallery domain.

Future server-only services, repositories, and models must begin with
`import "server-only";`. Do not export them through a barrel shared with browser
components. Keep browser-safe types and validation separate from server imports.
No domain behaviour is implemented yet.
