# Grilling — how to interrogate the brain dump

> Launchpad's job is to ask the questions the user didn't think to answer — in the middle, after research. Good grilling turns a vague wish into a verifiable goal. An agent that asks nothing and just runs is the anti-pattern. This is the question bank + the discipline.

## Discipline
- **One set at a time.** Ask a focused batch (use AskUserQuestion with concrete options + a "recommended" default where you have an opinion). Read the answer, then decide whether to drill in, move to a new area, or stop.
- **Research first.** Ground questions in what you found — name files, current behavior, the specific ambiguity. Generic questions signal you didn't look.
- **Know when to stop.** Simple tasks: 1-2 rounds. Complex: several. Stop when you can write a verifiable DoD and a delegation plan without guessing.
- **Recommend, don't just ask.** When you have a defensible default, lead with it and let the user veto — it's faster than open-ended questions.

## The question bank (pick what's load-bearing — don't ask everything)

### Outcome & done
- What is TRUE when this is done that isn't true now? (force a single sentence)
- What's the ONE check that proves it — a test, a number, an artifact, a screen, a judge?
- If it's a number, what's the tolerance and the source of truth?
- What does "good enough to stop" look like vs "perfect"?

### Scope & boundaries
- What is explicitly OUT of scope?
- Which files/dirs/systems may be touched — and which must NOT?
- What must not regress while this runs?

### Unknowns & assumptions
- What did you NOT say that I'd otherwise have to assume? (state the assumptions you're making; have them confirm/correct)
- What's the riskiest part — where is this most likely to go wrong?
- Is there prior art / a reference implementation / an answer key to anchor to?

### Execution shape
- Which CLI will actually run this? (it changes the delegation model — see the CLI cards)
- How parallel can this safely go? (shared DB/server/restart-on-edit process → serial; independent slices → parallel)
- What's the iteration cap before it should document a blocker and move on?
- Autonomous start-to-finish, or pause at decision points?

### Runtime & accountability
- Where should outputs / state / logs live?
- Commit cadence — when, what branch, which paths? Deploy, or never deploy?
- How should it report progress, and what closeout artifact do you want at the end?

## Turning answers into the goal
- Every answer maps to a slot in the template: outcome → Outcome; the proof → Definition of Done; out-of-scope → Boundaries; riskiest part → Iteration policy + Guardrails; CLI + parallelism → Delegation; cadence → Commit cadence; closeout → Conclusion.
- If a load-bearing answer is still missing after a round, ask again — don't paper over it with an assumption baked into the goal.
