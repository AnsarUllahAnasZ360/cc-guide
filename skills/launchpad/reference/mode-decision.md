# Mode Decision — interactive vs goal vs workflow

> Pick the cheapest mode that fits. Most work is interactive. Escalate to a goal only for a verifiable, multi-turn objective; to a workflow only for many-agent fan-out. Picking too big wastes compute and attention; picking too small means babysitting. Citations at the bottom.

## The 30-second triage

Ask, in order:

1. **Is the finish line crisp and verifiable?** If you cannot name the evidence that would prove "done," STOP — you are not ready for a goal. Sharpen scope first (interactive / grill). Codex's cookbook is explicit: never use a goal "to hide uncertainty," and never "when the finish line is vague."
2. **Would one answer, one edit, or a short review settle it?** → **Interactive.** Codex: do not use a goal "for a one-line edit, a simple explanation, a short code review, or a question where you want one answer and then a stop."
3. **Is it substantial work with a single verifiable end state, runnable across many turns in one thread?** → **Goal.**
4. **Does it need many agents working in parallel, cross-checking each other, or fanning out over hundreds of files?** → **Workflow.**

## Interactive

- **What it is:** a normal session — you stay in the loop, steering turn by turn. (Antigravity calls this **Fast mode**: "execute tasks directly… use for simple tasks.")
- **Use for:** one-shot edits, explanations, short reviews, debugging a single thing, exploration ("what do you think?"), anything where you want to read the answer and decide the next move.
- **Signal you chose wrong:** you keep re-prompting the same large task across many turns and re-pasting context → promote to a goal.
- **Launchpad output:** one tight prompt (`../templates/interactive-prompt.md`). No package.

## Goal

- **What it is:** a persistent objective that keeps one thread working until a defined outcome is TRUE. Claude `/goal` loops — a fast evaluator checks the completion condition after each turn and re-runs with the reason until it is met. Codex Goals are "persistent objectives… across turns." Antigravity Planning-mode goals decompose into a plan before executing.
- **Use for (the cookbook's own list):** performance optimization, flaky-test investigation, dependency migrations, bug hunts that require reproduction, multi-step refactors, benchmark-driven tuning, and research tasks that require a final artifact.
- **The balance to strike:** "narrow enough to audit but broad enough to let [the agent] choose the next action."
- **Hard gate:** you MUST be able to state the *verification surface* — the test, benchmark, report, artifact, command output, or judge that proves the outcome. No verification surface → it is not a goal yet; grill it into one.
- **Launchpad output:** a goal package (`../templates/goal-package.md`).

## Workflow

- **What it is:** orchestration of MANY agents across parallel phases. In Claude Code this is **Dynamic Workflows** — Claude writes a script that coordinates 16–1000 background sub-agents; intermediate results live in script variables (not the conversation), each agent gets isolated context, and the run is resumable.
- **Use for:** jobs that outgrow a handful of sub-agents in one turn — codebase-wide audits, 500-file migrations, multi-angle research with cross-checking, drafting one plan from several independent investigations.
- **Distinct from a goal:** a goal keeps ONE thread looping to a condition; a workflow runs dozens–hundreds of agents across phases. Choose a workflow only when a goal's single thread would bottleneck.
- **CLI reality (see the cards):** Dynamic Workflows is a Claude Code feature (research preview). Codex has no direct equivalent — approximate with parallel threads / git worktrees. Antigravity uses the Agent Manager's async sub-agents.
- **Launchpad output:** a workflow brief (`../templates/workflow-brief.md`).

## Worked signals

| The user says… | Likely mode |
| --- | --- |
| "Why is this test flaky? Keep at it until it's green 100 runs straight." | Goal |
| "What does this function do?" / "rename X to Y" | Interactive |
| "Audit all 400 routes for missing auth and report findings." | Workflow |
| "Migrate the codebase from library A to library B." | Goal (or Workflow if huge + cleanly parallelizable) |
| "I have an idea but I'm not sure what it even is yet." | Interactive (clarify) → maybe Goal later |
| "Bring p95 checkout latency under 120 ms on the bench, keep tests green." | Goal |
| "Draft three independent designs for X, then reconcile them." | Workflow |

## When unsure

- Default to the cheaper mode: interactive < goal < workflow.
- If the objective is real but underspecified, run the grill (`../intake/grilling.md`) to sharpen it into a goal — do **not** author a vague goal "to see what happens."
- A goal that would spawn a large parallel fan-out is really a workflow; a workflow whose phases are actually sequential and single-threaded is really a goal.

## Sources

- OpenAI Codex — *Using Goals in Codex* (cookbook): when to use / not use a goal; the "narrow enough to audit, broad enough to choose the next action" balance; "do not use a Goal to hide uncertainty." https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- Claude Code — *Goal mode*: https://code.claude.com/docs/en/goal.md
- Claude Code — *Dynamic Workflows* (research preview): https://code.claude.com/docs/en/workflows.md
- Google Antigravity — Planning vs Fast mode (Codelabs): https://codelabs.developers.google.com/getting-started-google-antigravity ; Agent Manager / async multi-agent (Developers Blog): https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/
