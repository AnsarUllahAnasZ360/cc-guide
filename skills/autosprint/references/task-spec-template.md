# Task spec template

A task spec is a **context transfer from the planning model to the execution model**. The planner (the strongest model available, with the full research and conversation in hand) will not be in the room when this task runs; a cheaper, fresh-context agent will be. Everything that made the planner confident about this task — the problem, the evidence, the integration points, the pattern to follow, the traps — either gets written into the spec or gets lost. A strong model directing a cheaper model with a rich spec outperforms the cheap model guessing; that gap is where this whole system's economics come from.

The spec is also a *map*, and the implementer is told to treat it as one: it must do its own research pass to verify the spec's claims against the territory (the actual code) before editing. So write the spec to make that research fast and targeted — point at exactly what to read and what to verify — rather than trying to make research unnecessary.

The implementer receives three layers: `sprint.md`'s goal (where the sprint is going), the epic's `README.md` (why this epic exists, how its tasks connect), and this spec. Don't duplicate the other two layers here; do the opposite — assume they've been read and go deep on this task only.

## Epic README (one per epic folder)

```markdown
# E02: Webhook integration

## Why this epic exists
Two paragraphs max: the theme, what the sprint looks like when this epic is done,
and how it builds on / feeds other epics.

## Tasks and how they connect
| ID | Title | Depends on | The one-line story |
| T01 | ... | — | establishes X that T02 consumes |

## Epic-level definition of done
The 2-4 binary checks the epic reviewer audits beyond per-task criteria —
the "does it hold together" bar.

## Watch out for
Epic-wide gotchas: shared files, ordering traps, conventions specific to this area.
```

## Task spec

```markdown
# E02-T03: Route failed-payment webhooks through the dunning service

**Complexity:** standard          <!-- simple | standard | complex -->
**Engine:** claude                <!-- claude | codex (+ codexModel in sprint.json) -->
**Depends on:** E01-T02
**File scope:** src/billing/webhooks.ts, src/billing/dunning/*, tests/billing/

## Problem
Failed-payment webhooks currently mark the subscription `past_due` and stop
(src/billing/webhooks.ts:141 — verified). Nothing retries, emails, or suspends —
revenue leaks silently. Epic E01 built the dunning state machine; this task
connects the webhook to it.

## Context the planner had that you need
The compressed version of everything relevant from research and planning:
- Stripe sends `invoice.payment_failed` up to 4 times; dedupe on `event.id`
  (we've seen duplicates in production logs — research.md finding F3).
- The team rejected queue-based processing for this path (decision D2: latency
  over durability here) — do not introduce a queue.
- `DunningService.beginOrAdvance()` is idempotent by design; lean on that.

## Research first, then build
Verify this map against the territory before editing:
- Read src/billing/webhooks.ts:100-180 — confirm the handler shape and the
  `markPastDue()` call site still match the above.
- Read src/billing/dunning/service.ts (E01-T02's deliverable) — confirm the
  actual signature of beginOrAdvance before wiring it.
- Skim tests/billing/webhooks.test.ts — this is the test pattern to follow.
If you need more background on X, look at Y — give "learn more here" pointers
for anything with depth (docs URLs, sibling implementations, prior art files).

## Solution direction
Replace the direct status write with `DunningService.beginOrAdvance(subscriptionId)`.
The old `past_due` write and its helper `markPastDue()` become dead — delete them.
If the territory disagrees with this direction, trust the territory and record
the deviation as a decision.

## Out of scope
- Email template content (E03)
- Admin UI for dunning state (not this sprint)

## Definition of done            <!-- every item binary-checkable -->
- [ ] WHEN an `invoice.payment_failed` webhook arrives for an active subscription,
      THE SYSTEM SHALL create a dunning record in state `retry_1`.
- [ ] WHEN one arrives for a subscription already in dunning,
      THE SYSTEM SHALL advance the state machine exactly one step.
- [ ] `markPastDue()` and its call sites no longer exist.
- [ ] New/updated tests cover both behaviors above and pass.

## Test plan
- `npm test -- billing/webhooks` — expected: pass, including the two new cases
- `npm run typecheck` — expected: clean

## Required skills/tools
- `vercel:nextjs` — API route conventions for the webhook endpoint
  (if a named skill is missing, discover the current equivalent or follow the
  local pattern in the file scope, and record which you did)
```

## Quality bar

- **Transfer the "why", not just the "what".** The *Context the planner had* section is the highest-value real estate in the spec: production observations, rejected alternatives with reasons, decisions from research. An executor that understands intent makes the right call when reality diverges; one that only has instructions makes a plausible-looking wrong one.
- **Make the research pass cheap and directed.** Name the exact files, line ranges, and questions to verify. "Do your own research" without pointers burns the context budget the task needs for implementation.
- **Definition of done is binary.** Each item checkable by a command, a grep, or a test. The epic reviewer audits against these; vague criteria disable the quality gate.
- **Name what the change replaces.** Deleting superseded code is a first-class deliverable in the definition of done. Two coexisting code paths is the most common defect of AI-implemented refactors.
- **Mark references verified or inferred.** `file:line` the planner actually read is *verified*; an earlier task's expected output is *inferred — will exist by execution time*. Implementers calibrate trust from these labels.
- **Size to a good work item.** Batch 2–3 trivially-related changes into one task; split anything you doubt one agent completes cleanly in one pass. See SKILL.md's sizing section — this judgment is the plan's make-or-break skill.
