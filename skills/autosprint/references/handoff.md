# Handoff — verification guide, completion report, PR

The handoff products are what make the whole system worth running: an engineer who was not present must be able to trust, test, and merge the work. Three artifacts carry that: the verification guide (written at plan time), the completion report (written by the run), and the PR body (written by the run). Their common rule: written for a reader with zero context from this conversation, in plain sentences, evidence over claims.

## verification-guide.md (plan mode writes; ship agent updates if scope changed)

The ordered playbook for the human verifier. Order matters — cheap, high-signal checks first, so a broken sprint is caught in minutes, not after an afternoon of setup.

```markdown
# Sprint <id>: Verification Guide

## What this sprint claims to deliver
One paragraph + per-epic one-liners. (The reviewer verifies claims, so state them.)

## Environment
Branch, setup commands, services/credentials/seed data needed, in copy-paste form.

## Verification order
1. **Static pass (minutes):** commands to run — typecheck, test suite, build.
   Expected results stated exactly.
2. **Per-epic checks:** for each epic, the 2-5 things to verify, each traceable
   to a definition-of-done item, each with the command / route / flow to exercise
   and the expected result. Live-product checks go here — this is where browser
   testing belongs, done by the human (or their tools), not assumed done by agents.
3. **Integration flows:** the 1-3 cross-epic user journeys that prove the sprint
   goal end to end.
4. **Risk-targeted review:** files/decisions the reviewer should read with extra
   suspicion (from sprint.md risks + ledger decisions and tasksAtRisk).

## Known limitations
What was deliberately not done, deferred, or failed during the run.
```

## completion-report.md (ship agent writes)

The first document the operator and the receiving engineer read. Structure the ship agent follows:

- **Outcome first:** goal, and in one paragraph, how much of it shipped — including the completion-gate status (the run does not ship red without saying so here first).
- **Per-epic account:** delivered / repaired (what the review fixed) / failed / parked, with task-level notes only where they change what the reader does.
- **Numbers from git, not memory:** commits, files changed, insertions/deletions (`git diff --shortstat <base>...HEAD`).
- **Consolidated decisions:** every autonomous choice from the ledger, deduplicated, each one sentence + why. This section is how the operator audits judgment, not just output.
- **Known issues & tasksAtRisk:** honest, specific, with pointers.
- **Where to start verifying:** top 3 pointers into the verification guide.

## PR body (ship agent writes)

- Goal and link to `sprint.md` (the sprint folder travels in the PR).
- Epic-by-epic summary with a **criteria → evidence table**: each epic's key definition-of-done items mapped to the test run, command output, or commit that proves it. Claims without evidence are listed as *unverified* — never silently omitted.
- Consolidated decisions log (same content as the report, trimmed).
- Known issues / limitations.
- **For the reviewer:** verification guide path, suggested review order (scope → criteria/evidence → risk areas → style), and a note that per-task commits (`[<sprint-id>/<task-id>]`) let them review commit-by-commit.

Draft PRs by default: the receiving engineer flips it to ready after verification — that flip is the human sign-off the process is built around. The engineer adds their own fix commits on the same branch and merges when satisfied; nothing in the sprint assumes agents get another turn after handoff (though the operator can always plan a follow-up sprint from the reviewer's findings).
