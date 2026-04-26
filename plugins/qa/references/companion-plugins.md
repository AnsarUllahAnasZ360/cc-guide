# Companion Plugins

QA is an orchestrator plugin, not a repackaged copy of OpenAI-owned runtime plugins.

## Decision

Do not copy Browser Use or Computer Use wholesale into QA.

Browser Use and Computer Use should remain installed as companion plugins because they are runtime surfaces owned and updated outside `cc-guide`.

## Why

- Browser Use includes the in-app browser client and the supported Browser skill contract.
- Computer Use includes a signed macOS application plus MCP server wiring. Copying that bundle into QA can break code signing, update flow, permissions, and future compatibility.
- GitHub uses a connector-backed app plus skills. QA should route to it when PR, CI, or publish context exists instead of duplicating connector behavior.

## QA Contract

QA assumes these companion capabilities when available:

- `browser-use`: primary user-visible browser verification surface.
- `computer-use`: fallback for native desktop apps, system dialogs, simulator workflows, extension workflows, or Browser Use blockers.
- `github`: PR context, review comments, CI workflows, and PR publishing.

If a companion plugin is unavailable, QA must degrade gracefully and report the missing capability as a blocker or reduced-confidence path.

## Install Shape

Preferred cc-guide setup is one visible plugin source:

- install Sprint Protocol and QA globally under `Home Plugins`
- avoid installing one globally and one locally unless a project-specific fork is intentional

This keeps the app surface clean while still allowing QA to operate inside any checkout.
