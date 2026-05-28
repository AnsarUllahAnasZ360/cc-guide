# Definition of Done — the quality core

> The #1 reason an autonomous run wastes hours is a soft definition of done. "Done when the model thinks it's done" is not done. A goal is only as good as the evidence that proves it. This card is how Launchpad pins it down.

## The rule
- Done is **evidence-gated**, never self-asserted. "A Goal should not be marked complete because the model believes it is probably done. It should be complete only after the objective is checked against the relevant files, tests, logs, benchmark output, generated artifacts, or other concrete evidence" (Codex cookbook).

## Name the verification surface
- Every goal must name its **verification surface** — the concrete thing that proves the outcome: a test suite, a benchmark number, a generated artifact (PDF / xlsx / report), command output, a diff, or an independent judge.
- If you cannot name it, you do not have a goal yet (see `mode-decision.md`). Grill it into existence before authoring.

## Make it quantified + checkable
- Prefer machine-checkable conditions: "every test in X passes," "`pnpm typecheck` clean," "p95 < 120 ms on bench Y," "the artifact at `path` matches the key within tolerance Z."
- For Claude `/goal`, the completion condition feeds a fast evaluator each turn — it must be judgeable from surfaced evidence, so the run must print/produce that evidence every turn.
- Where a number has a tolerance, state the tolerance AND the source of truth (the answer key, the benchmark, the spec).

## Independent verification (no self-grading)
- The thing that did the work should not be the sole thing that certifies it. Prefer an independent check: a test / lint / build the agent cannot fake, or a cross-model / critic judge that reads the output against the criteria.
- For subjective or holistic outcomes (an estimate, a design, a research report), an independent judge grading against explicit criteria beats the executor's own sign-off.

## Anti-overfit
- A change made to pass one case must be checked against the others. No hard-coding of answer values, fixture IDs, or magic constants to "hit" a number — that passes the check while breaking generality. Done means *generally* done, not *fitted* to the check.

## The DoD checklist for any authored goal
- [ ] Outcome stated as a TRUE/FALSE condition, not a vibe.
- [ ] Verification surface named and reachable by the executor.
- [ ] Condition quantified + machine-checkable where possible; tolerance + source named where not.
- [ ] An independent check exists (test / build / lint or a judge) — not just self-assertion.
- [ ] Anti-overfit clause: changes must generalize; no fitting to the check.
- [ ] Blocked-stop condition: what to report when no defensible path remains.

## Sources
- Codex — Using Goals in Codex (evidence-gated done; the verification surface): https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- Claude Code — Goal mode (completion condition checked each turn by an evaluator): https://code.claude.com/docs/en/goal.md
