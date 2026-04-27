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

## Local Project Profiles

Build a profile from the target repository instead of assuming one global stack contract.

Look for:

- README and AGENTS instructions;
- package scripts;
- CI workflow commands;
- framework config;
- sprint verification checklist;
- local setup scripts;
- required environment variables;
- documented test commands;
- expected localhost URL and protocol.

Use seeded/demo data only for proof videos. Never use production data or real PHI unless the user explicitly approves a safe handling plan.
