# Codex — authoring goals

> Codex Goals are single-thread and evidence-gated. There is NO in-goal sub-agent delegation — author parallelism as separate threads/worktrees. Doc URLs at the bottom.

## What a Codex Goal is
- "Goals are persistent objectives in Codex that keep a thread working toward a defined outcome across turns." A normal prompt says "do this next thing"; a Goal says "keep working until this outcome is true."
- **Single-thread by design.** The Goal belongs to the one thread where the context lives — files inspected, commands run, diffs produced, logs seen, reasoning built up. There are **no sub-agents inside a Goal.**

## When to use / not use
- **Use for:** performance optimization, flaky-test investigation, dependency migrations, bug hunts that require reproduction, multi-step refactors, benchmark-driven tuning, research tasks that require a final artifact.
- **Do NOT use for:** a one-line edit, a simple explanation, a short code review, or a question where you want one answer and then a stop; or when the finish line is vague, or "to hide uncertainty."

## The six required ingredients of a goal prompt (verbatim)
- **Outcome** — what should be true when the work is done.
- **Verification surface** — the test, benchmark, report, artifact, command output, or source material that proves it.
- **Constraints** — what must not regress while Codex works.
- **Boundaries** — which files, tools, data, repositories, or resources Codex may use.
- **Iteration policy** — how Codex should decide what to try next after each attempt.
- **Blocked stop condition** — when Codex should stop and report that no defensible path remains.

**Template (verbatim):** "`<desired end state>` verified by `<specific evidence>` while preserving `<constraints>`. Use `<allowed inputs, tools, or boundaries>`. Between iterations, `<how Codex should choose the next best action>`. If blocked or no valid paths remain, `<what Codex should report and what would unlock progress>`."

## Done is evidence-gated
- "A Goal should not be marked complete because the model believes it is probably done. It should be complete only after the objective is checked against the relevant files, tests, logs, benchmark output, generated artifacts, or other concrete evidence."

## Long-horizon runs — durable project memory (the file pattern)
- **Prompt.md** — the frozen spec: goals + non-goals, hard constraints (perf, determinism, UX, platform), deliverables, and a "Done when" (checks + demo flow).
- **Plan.md** — milestones small enough to complete in one loop; acceptance criteria + validation commands per milestone. "Plans markdown file is source of truth."
- **Documentation.md** — current milestone status (what's done, what's next) + decisions made (and why). "Update documentation markdown file continuously."
- **Loop:** plan → edit → run tools → observe → repair → update docs/status → repeat. "Run validation after each milestone (fix failures immediately)."

## Delegation & parallelism (the supported way)
- **No in-goal sub-agents.** To parallelize, use **parallel threads across projects** and **git worktrees** ("isolate runs, keep diffs reviewable, reduce thrash") — separate runs, not workers inside one goal.
- Manage context by externalizing state into the repo + the markdown files above, not by relying on the window. A long goal can be paused before losing connectivity, then resumed.

## Durable guidance lives in AGENTS.md
- Read before any work; layered root-down with nearer files overriding. Put repo conventions, hard constraints, and validation commands here so every Codex run inherits them.

## When authoring for Codex, choose:
- Verifiable objective → a **Goal** built from the six ingredients, plus a Prompt/Plan/Documentation trio for anything long-horizon.
- Need parallelism → multiple **threads / worktrees**, NOT sub-agents — and say so explicitly in the artifact so no one tries to spawn workers a Codex goal cannot run.

## Sources
- Using Goals in Codex: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- Run long horizon tasks with Codex: https://developers.openai.com/cookbook/examples/codex/long_horizon_tasks
- Prompting: https://developers.openai.com/codex/prompting · GPT-5 Codex prompting guide: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
- Custom instructions with AGENTS.md: https://developers.openai.com/codex/guides/agents-md · Best practices: https://developers.openai.com/codex/learn/best-practices
