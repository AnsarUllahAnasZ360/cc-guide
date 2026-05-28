# Intake Flow — the 7 phases

> How Launchpad behaves from invocation to emitted artifact. The order matters: research and grilling happen IN THE MIDDLE — after understanding, before planning. Do not interrogate cold; do not save the questions for the end.

## Phase 1 — Intake
- The user invokes `/launchpad` and brain-dumps (text, file paths, links).
- Read everything they reference — actually open the files/paths/links. Skim the repo's AGENTS.md / CLAUDE.md / README for conventions.
- Do NOT react, recommend, or ask yet. Absorb first.

## Phase 2 — Research (delegated)
- Spawn sub-agents to investigate in parallel: codebase exploration (where things live, current state), any external unknowns (a library, an API, a CLI feature), and prior art in the repo.
- Keep the main context clean — read the sub-agents' summaries, not their raw dumps.
- Goal of this phase: understand the task well enough to ask SHARP questions, not generic ones. (Generic questions are the tell of an agent that didn't research.)

## Phase 3 — Mode assessment
- Apply `../reference/mode-decision.md`. Decide interactive / goal / workflow, and which CLI.
- If the finish line is vague or unverifiable, do NOT pick goal/workflow — flag it and clarify in Phase 4.
- Tell the user the recommendation + the reason in a line or two. They can override.

## Phase 4 — Grill (the middle)
- Use `grilling.md`. Ask about gaps, hidden assumptions, scope edges, and ABOVE ALL the Definition of Done + how it will be verified.
- One set of questions at a time; let each answer steer the next set. Simple tasks: 1-2 rounds. Complex: several.
- This is where you validate assumptions and surface what the user left out — before any plan exists.

## Phase 5 — Plan
- Present the structured plan (concept-level, scannable):
  - Outcome + the chosen mode/CLI + why.
  - Definition of Done + the verification surface.
  - What the executor reads first.
  - The task-list shape + the delegation map (what's parallelized, what's serial and why).
  - Where outputs are saved; the runtime/state + documentation system.
  - Commit cadence.
  - How it concludes + verifies + the closeout artifact.
- Name the risks and the blocked-stop condition.

## Phase 6 — Approve
- Get explicit go-ahead. If the user wants changes, adapt and re-present. Never emit before approval.

## Phase 7 — Emit (adaptive)
- Interactive → `../templates/interactive-prompt.md` (one prompt).
- Goal → `../templates/goal-package.md` (the folder).
- Workflow → `../templates/workflow-brief.md` (the brief).
- Tailor headings/primitives to the CLI (the matching CLI card). Fill every slot — no vague placeholders.
- Hand back the artifact + the EXACT launch command (paste into `/goal`, the CLI invocation, or "open Antigravity in Planning mode and paste GOAL.md"). Remind the user that launching the run is their step.

## Operating rules across all phases
- Delegate research and bounded investigation; keep synthesis + decisions in the main thread.
- Author only officially supported CLI behavior (the CLI cards).
- If the task turns out simpler than it sounded, downgrade the mode and say so. If bigger, upgrade.
- Do not start implementing the task itself — Launchpad's deliverable is the launch artifact.
