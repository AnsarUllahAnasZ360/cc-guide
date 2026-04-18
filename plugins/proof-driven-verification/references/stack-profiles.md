# Stack Profiles

ProofOps is stack-agnostic. Detect the stack from files and scripts, then choose the narrowest reliable verification path.

## Detection

- Next.js: `next.config.*`, `app/`, `pages/`, `next` dependency.
- Supabase: `supabase/`, `@supabase/*`, `supabase` CLI config, `NEXT_PUBLIC_SUPABASE_URL`.
- Convex: `convex/`, `convex` dependency, `VITE_CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL`.
- Laravel: `artisan`, `composer.json`, `routes/web.php`, `routes/api.php`, `phpunit.xml`, `vite.config.*`.

## Next.js

- If Next.js 16+ and MCP config exists, use Next.js DevTools MCP first.
- Start from declared scripts, preferring `dev`, `dev:web`, or app-specific docs.
- Browser proof should include runtime MCP errors, page metadata, routes, console, network, and screenshots.

## Supabase

- Never assume local Docker is available.
- If local Supabase is required and Docker is not running, report an environment blocker.
- If cloud dev credentials exist and repo docs allow them, use the cloud path.
- Never upload service-role keys or customer data into narration text.

## Convex

- Prefer repo scripts for `convex dev`, codegen, and tests.
- Verify both UI behavior and Convex function/API effects.
- Capture network and browser errors; include Convex dashboard/log pointers only if available locally.

## Laravel

- Prefer repo scripts and `composer`/`artisan` commands.
- Common checks: `composer test`, `php artisan test`, `php artisan route:list`, migrations in test DB, Vite build for frontend.
- Browser proof should verify web routes, auth/session behavior, validation errors, and API responses.

## Unknown Stack

- Inspect package manifests, lockfiles, Docker files, Makefiles, CI, and README.
- Ask one focused setup question only after local discovery fails.
