# Template — Interactive Prompt

> The output when the mode is interactive. One tight, pasteable prompt. No package. Fill the slots, delete the guidance, hand it over.

## The shape (outcome-first)

```
<One sentence: what should be TRUE when you're done.>

Context: <the 2-4 facts the agent needs — where the code lives, the relevant pattern, the constraint that matters>.
Read first: <files/paths to look at before acting, if any>.
Constraints: <what must not change/regress; stack or style rules>.
Done when: <the concrete check that proves it — a test passes, output matches, the screen renders>.
Output: <what to hand back — a diff, an explanation, a file at a path>.
```

## Rules for a good interactive prompt
- Lead with the outcome, not the steps. Let the agent choose how.
- Name the evidence ("done when") even for small tasks — it raises quality and lets the agent self-check.
- Point at files instead of pasting them when you can.
- Keep it to a short paragraph + the slots. If it's growing into milestones and acceptance criteria, it is not interactive — go back to `../reference/mode-decision.md`.

## Examples
- **Fix:** "Fix the duplicate-toast bug in `src/ui/toast.ts`. Context: toasts double-fire on route change because the listener isn't cleaned up. Done when: navigating between routes shows exactly one toast and the toast unit tests pass. Output: the diff."
- **Explain:** "Explain how auth session refresh works in this repo. Read first: `lib/auth/*`. Output: a short walkthrough + the 2-3 files that matter, with line refs."
- **Small refactor:** "Rename `getUserData` → `fetchUserProfile` everywhere and update call sites. Done when: `pnpm typecheck` is clean and no references to the old name remain. Output: the diff + the count of files changed."
