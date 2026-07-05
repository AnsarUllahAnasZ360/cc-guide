# Discover mode — problem and solution research

The operator arrives with unknowns: symptoms, complaints, half-formed goals, an audit request, open questions. Discover mode turns that into a `research.md` the plan mode can act on. This is the mode where the operator's judgment is most available — use it. Ask real questions, present findings as they land, and challenge framings that the evidence contradicts. The deliverable is a decision-ready document, not a compliant one.

## Two stages, one artifact

Research has two distinguishable stages. Run them as stages of one conversation, not separate ceremonies — findings from the first reshape the second, and both land in the same `research.md`.

**Stage 1 — Problem.** What is actually wrong or missing, where, and why does it matter? Ground every claim in evidence: file:line references, reproduced behavior, measured numbers, user reports. Separate verified facts from inference, and keep competing hypotheses alive with confidence levels until evidence kills them — the first plausible story is often wrong.

**Stage 2 — Solution.** What are the viable approaches, what does each cost, and which one fits this codebase? Search for prior art inside the repo first (the most common failure of AI-planned work is rebuilding something that exists), then outside knowledge where warranted. End with a recommendation, not a survey — the operator decides, but they decide on your recommendation.

A problem the operator already understands can start at stage 2. A pure audit ("what state is this system in?") can end after stage 1 and become its own small remediation sprint later.

## Hunting unknowns

The plan that eventually executes is a map, and the run fails where the map is wrong. Discover mode's real job is shrinking four gaps before they get expensive:

- **Known knowns** — what the operator states. Capture faithfully.
- **Known unknowns** — questions they know are open. Resolve them here, while they're present.
- **Unknown knowns** — things so obvious to them they'd never say them (conventions, taste, tribal decisions). Surface these by *showing* rather than asking: for design-flavored or approach-flavored questions, generate 2–3 deliberately different concrete options (an HTML mockup grid works well) and let their reaction extract what they knew but hadn't said.
- **Unknown unknowns** — the existing rate limiter nobody remembered, the constraint nobody mentioned. Run an explicit **blindspot pass**: one agent whose only brief is "what in this codebase or problem space would surprise the operator's current framing?" — prior implementations of the same idea, adjacent systems the change would touch, constraints that contradict the stated plan. This is the highest-value agent you'll spawn in discover mode, especially in unfamiliar territory.

When interviewing the operator, ask the questions whose answers would *reshape the plan* first — architecture-reshaping before preference-level — and batch them in small sets rather than drip-feeding.

## Working method

Delegate investigation to agents; keep synthesis and the conversation with the operator in the main session. Two or three agents at a time, sequenced in rounds — each round's findings determine the next round's questions. Wide parallel fan-outs waste tokens on questions that the first findings would have retired, and this mode never uses workflows: workflows execute decisions already made, and research is the process of making them.

Good agent shards are read-only, and return facts separated from inferences with exact references. Typical rounds:

- Round 1: current-state mapping — how the affected area actually works today (one agent per independent subsystem, max 3)
- Round 2: focused follow-ups on what round 1 exposed + prior-art search for candidate solutions
- Round 3 (when warranted): validation of the leading approach against the real code — integration points, migration cost, blast radius

Between rounds, tell the operator what changed your picture, and ask the questions only they can answer: intent, priorities, appetite, constraints. Batch questions; don't drip.

## research.md

```markdown
# <Initiative>: Research

## Objective
What the operator wants and why, in their terms.

## Problem
### Findings          <!-- per area: current state, evidence (file:line), gaps, risks -->
### Hypotheses considered and outcome

## Solution
### Options considered      <!-- 2-3, with real tradeoffs, one paragraph each -->
### Recommendation          <!-- and why it fits this codebase -->

## Decisions
Resolved: choices made in this conversation, with rationale.
Open: decisions the plan cannot proceed without.

## Sprint implications
Rough shape of the work: candidate epic themes, risk areas, what must land first,
what is explicitly out of scope.
```

The **Decisions** section is the handoff contract: plan mode treats every "resolved" entry as settled and must stop and ask if an "open" one blocks task writing. Close as many as possible while the operator is present — every open decision left here becomes either an interruption later or an agent guessing unattended.

When `research.md` is done, say what you'd plan and offer to proceed to plan mode.
