# Stack Profiles

QA should use project-specific commands from local docs and `package.json`. These profiles are defaults, not replacements for repo instructions.

## Next.js

- Start the dev server with the project-approved command.
- Use Next.js DevTools MCP when available.
- Query runtime errors, logs, routes, project metadata, and page metadata.
- Use Browser Use to load pages in a real browser before accepting user-facing behavior.

## Convex

- Load the Convex rules skill when available.
- Review schema changes, indexes, validators, auth identity usage, public/internal function boundaries, and high-churn data placement.
- Run Convex-specific tests when the repo defines them.
- Use Convex CLI for environment/deployment checks when needed.

## ZScribeV2

Default commands:

- dependency install: `bun install --frozen-lockfile`
- dev stack: `bun run dev`
- targeted tests: `bun test <path>`
- backend tests: `bun run test:convex`
- API tests: `bun run test:api`
- component tests: `bun run test:components`
- smoke tests: `bun run test:smoke`
- final gate: `bun run check`

Default browser URL:

- `https://localhost:3001`

Use seeded/demo data only for proof videos.
