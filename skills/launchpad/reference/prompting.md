# Prompting — make the run productive

> Cross-CLI prompting best practices for autonomous runs, distilled from the official Codex, Claude, and Gemini guidance. Apply these whatever mode you author.

## The outcome-first frame
- State the **outcome + verification + constraint**, not a list of steps. Weak: "Improve performance." Strong: "Reduce p95 checkout latency below 120 ms on the checkout benchmark while keeping the correctness suite green" — an outcome, a verification method, and a constraint.
- "Codex produces higher-quality outputs when it can verify its work." Verifiability is the single biggest quality lever — bake the check in (see `definition-of-done.md`).

## Decompose, plan, then act
- Complex work goes better when broken into smaller, focused steps. When unsure how to split, ask the agent to propose a plan first.
- Gemini's recommended loop: **Analyze → Decompose → Strategize → Verify.** Claude: explore in plan mode before implementing — two-phase beats single-pass.
- The authored goal must instruct the executor to write a task list / plan and treat it as the source of truth.

## Delegate, don't dictate
- Prefer "fix the checkout bug in `src/payments/`" over "read file X, then run command Y." Trust the agent to find the details — but bound the scope and name the evidence.
- For multi-step work the executor should hand bounded slices to sub-agents and keep its own context for orchestration + synthesis (see `delegation.md`).

## Anti-drift rules (for long runs)
- **Keep diffs scoped** — don't expand scope mid-run.
- **Stop-and-fix** — if validation fails, repair before moving on.
- **Decision notes** — record non-obvious choices to avoid oscillation (re-litigating the same decision).
- **No fabrication** — if data/evidence is missing, say so; never invent a number to "hit" a target.

## Research goals: fix the evidence standard up front
- Before investigating, define what counts as exact reproduction, partial reconstruction, proxy support, and blocked. Then build a claim inventory, map claims → evidence, implement the feasible pieces, label blockers, and produce an audit separating confirmed / support-only / blocked / uncertain.

## Durable guidance lives in the repo
- Codex reads **AGENTS.md**; Claude reads **CLAUDE.md**; layered root-down, nearer files override. Put conventions, constraints, and validation commands there so every run inherits them — don't re-paste them in each prompt.

## Per-model notes
- **GPT-5 / Codex:** responds to crisp outcome + verification + boundaries; auto-tracks remaining context; externalize state to files for long runs.
- **Gemini 3 (Antigravity):** keep temperature at the default 1.0 (changing it risks looping or degraded performance); favors directness over verbosity; terse by default — explicitly request progress narration; add "do not fabricate" guards.
- **Claude:** be specific up front (reference files, constraints, patterns); give verification targets (tests, screenshots, expected output) so it can self-check; use plan mode to analyze before coding.

## Sources
- Codex prompting: https://developers.openai.com/codex/prompting · GPT-5 Codex guide: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide · Goals cookbook: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex · Long-horizon: https://developers.openai.com/cookbook/examples/codex/long_horizon_tasks
- Claude Code how-it-works: https://code.claude.com/docs/en/how-claude-code-works.md
- Gemini 3 prompting guide: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/gemini-3-prompting-guide
