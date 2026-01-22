# The Ralph Wiggum Technique: A Complete Guide

> *"Me fail English? That's unpossible!"* — Ralph Wiggum

And yet, somehow, Ralph keeps going. That's the whole point.

---

## What Is This Ralph Thing Everyone's Talking About?

In mid-2025, an Australian developer named Geoffrey Huntley introduced something that sounded almost disappointingly simple: **"Ralph is a Bash loop."**

```bash
while :; do cat PROMPT.md | claude-code ; done
```

That's it. An endless loop that feeds instructions to Claude Code repeatedly. The AI builds on its previous iterations, reads its own commits, notices what's broken, and fixes it.

VentureBeat called Ralph Wiggum "the biggest name in AI right now." A Simpsons character who eats paste became the face of autonomous coding. The irony is beautiful.

**But why "Ralph Wiggum"?**

Because the AI is like Ralph — confused, making mistakes, saying weird things, but *never stopping*. You point it at a task and it just... keeps going. It might take a weird path. It might fail spectacularly. But it iterates. And iteration, done long enough, eventually works.

---

## The Philosophy (This Part Matters)

Geoffrey Huntley's core philosophy sounds counterintuitive:

**"Better to fail predictably than succeed unpredictably."**

Traditional AI coding workflows focus on crafting the perfect prompt, getting Claude to produce pristine code on the first attempt. The Ralph approach inverts this entirely. Instead of perfection, you optimize for *iteration*. Instead of clever prompts, you write *clear completion criteria*.

### The Three Pillars

**1. Deterministic Imperfection**
> "The beauty of Ralph — the technique is deterministically bad in an undeterministic world."

When Ralph produces errors, you don't abandon the technique. You tune your approach by adding clearer instructions. "SLIDE DOWN, DON'T JUMP" — be explicit about what you want. The failures teach you how to communicate better.

**2. Faith in Eventual Consistency**
Building with Ralph requires patience and belief that continuous iteration leads toward working solutions, even when paths seem circuitous. It might take 5 iterations. It might take 50. But if your acceptance criteria are clear and your verification is automated, it will get there.

**3. Skill-Dependent Mirroring**
Ralph is a mirror. It reflects your own capabilities. Those struggling with AI tools often lack specific prompting skills rather than having fundamental tool failures. The better you get at defining work, the better Ralph performs.

---

## The Evolution: From Bash Loop to Ralph TUI

The original technique was just that bash loop. But people built tools around it:

**Ralph TUI** (by [@subsy](https://github.com/subsy/ralph-tui)) is the orchestration layer that makes this practical:
- Reads your PRD (prd.json)
- Feeds tasks to Claude one at a time
- Tracks progress and completion signals
- Handles the loop mechanics so you don't have to

Think of it as the infrastructure that turns "infinite loop" into "managed autonomous development."

---

## How a Ralph Loop Actually Works

```
                                    ┌─────────────────┐
                                    │                 │
                                    │   You (Human)   │
                                    │                 │
                                    └────────┬────────┘
                                             │
                                    Write PRD (prd.json)
                                             │
                                             ▼
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│                         RALPH TUI                                  │
│                    (The Orchestrator)                              │
│                                                                   │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│   │   Task 1    │───▶│   Task 2    │───▶│   Task 3    │───▶ ...  │
│   └─────────────┘    └─────────────┘    └─────────────┘          │
│          │                  │                  │                  │
└──────────┼──────────────────┼──────────────────┼──────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │              CLAUDE CODE                        │
    │            (The Executor)                       │
    │                                                 │
    │  1. Reads task from PRD                         │
    │  2. Reads codebase context                      │
    │  3. Implements changes                          │
    │  4. Self-verifies against criteria              │
    │  5. Signals completion                          │
    │  6. Commits changes                             │
    │                                                 │
    └────────────────────┬────────────────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │             │
                  │  Codebase   │
                  │             │
                  └─────────────┘
```

### The Completion Signals

Claude communicates with Ralph TUI using special signals:

| Signal | Meaning | What Happens |
|--------|---------|--------------|
| `<promise>COMPLETE</promise>` | Task done, all criteria met | Move to next task |
| `<promise>BLOCKED</promise>` | Needs human input | Loop pauses, you intervene |
| `<promise>SKIP</promise>` | Can't complete, non-critical | Move on, note the skip |
| `<promise>EJECT</promise>` | Critical failure | Stop everything, you fix it |

**COMPLETE** is what you want. **BLOCKED** is normal — complex work needs human decisions. **SKIP** is rare but acceptable. **EJECT** is "something is very wrong."

---

## Setting Up Your First Ralph Loop

### Prerequisites

You need these tools. No substitutes.

| Tool | Install | Why |
|------|---------|-----|
| Claude Code | [claude.ai/claude-code](https://claude.ai/claude-code) | The AI brain |
| Ralph TUI | `npm install -g ralph-tui` | Task orchestration |
| tmux | `brew install tmux` | Session persistence |
| Git | (you have this) | Version control |
| GitHub CLI | `brew install gh` | Git operations |

### The Setup Checklist

```bash
# 1. Verify tools
claude --version
ralph-tui --version
tmux -V
gh --version

# 2. Make sure you're in a git repo
git status

# 3. Authenticate Claude Code (if not already)
claude

# 4. Configure Ralph TUI (one-time)
ralph-tui setup
```

### Running Your First Loop

**Step 1: Create the PRD**

In Claude Code:
```
/prd
```

The interview process extracts everything from your brain and generates:
- `docs/prds/your-feature/PRD.md` (human-readable)
- `docs/prds/your-feature/prd.json` (machine-readable)

**Step 2: Start a tmux Session**

```bash
tmux new-session -s your-feature-name
```

tmux matters because Ralph loops run for hours. Your laptop might sleep. Your SSH might disconnect. Your terminal might crash. tmux means the loop keeps running.

**Step 3: Start the Loop**

```bash
ralph-tui run
```

Ralph reads your prd.json and begins executing tasks.

**Step 4: Detach and Live Your Life**

```
Ctrl+b, then d
```

You're detached. The loop continues in the background. Go get coffee. Take a walk. Work on something else. Sleep.

**Step 5: Check Back Periodically**

```bash
# Reattach to see what's happening
tmux attach -t your-feature-name

# Or check the progress file
cat progress.md
```

---

## The PRD: Where Success or Failure Is Determined

This is the truth nobody wants to hear:

**The quality of your PRD determines the quality of your output.**

A vague PRD produces garbage. A precise PRD produces working code.

### What Makes a Good PRD

```json
{
  "name": "user-authentication",
  "description": "Implement email/password authentication using Clerk. This enables users to access protected features. Reference CLAUDE.md for project conventions.",
  "branchName": "feature/user-auth",
  "userStories": [
    {
      "id": "US-001",
      "title": "Understand auth patterns before implementing",
      "description": "Before writing code, understand how Clerk integrates with Next.js",
      "tasks": [
        "Read Clerk documentation at clerk.com/docs",
        "Review existing auth patterns in src/middleware.ts",
        "Document planned approach in progress.md"
      ],
      "acceptanceCriteria": [
        "Understanding of Clerk middleware pattern is documented",
        "Integration approach is clear"
      ],
      "dependsOn": [],
      "notes": "Clerk uses middleware for route protection",
      "passes": false
    },
    {
      "id": "US-002",
      "title": "Implement sign-up flow",
      "description": "Users can create accounts with email/password",
      "tasks": [
        "Create sign-up page at /sign-up",
        "Use Clerk's SignUp component",
        "Style to match existing design system",
        "Verify flow works with Agent Browser CLI"
      ],
      "acceptanceCriteria": [
        "Sign-up page renders at /sign-up",
        "User can enter email and password",
        "Successful sign-up redirects to /dashboard",
        "Error states display correctly"
      ],
      "dependsOn": ["US-001"],
      "notes": "Follow form patterns in src/components/forms/",
      "passes": false
    }
  ]
}
```

### The PRD Formula

1. **Description**: WHAT and WHY, not HOW
2. **Tasks**: Step-by-step instructions
3. **Acceptance Criteria**: Verifiable conditions — when ALL are met, you're done
4. **Notes**: File paths, patterns, warnings, gotchas
5. **Dependencies**: What must complete before this starts

### Common PRD Mistakes

| Mistake | Example | Fix |
|---------|---------|-----|
| Too vague | "Add authentication" | "Add email/password auth using Clerk with sign-up, sign-in, sign-out flows" |
| Unverifiable criteria | "Auth should work well" | "User can sign up, sign in, sign out. Protected routes redirect unauthenticated users" |
| Missing context | "Follow best practices" | "Follow existing form patterns in src/components/forms/" |
| Too big | "Build the entire user system" | Break into sign-up, sign-in, profile, settings as separate PRDs |

---

## Parallel Loops: Multiple Features at Once

You can't run two Ralph loops on the same codebase — they'd fight over files. But you can use **git worktrees**:

```bash
# Create a worktree for feature A
git worktree add ../project-feature-a feature-a

# Create a worktree for feature B
git worktree add ../project-feature-b feature-b

# Start Ralph in feature A
tmux new-session -s feature-a -d
tmux send-keys -t feature-a "cd ../project-feature-a && ralph-tui run" Enter

# Start Ralph in feature B
tmux new-session -s feature-b -d
tmux send-keys -t feature-b "cd ../project-feature-b && ralph-tui run" Enter
```

Now you have two autonomous agents working simultaneously on different features.

```bash
# Check on your loops
tmux list-sessions

# Attach to either
tmux attach -t feature-a
```

---

## When Things Go Wrong (And They Will)

### BLOCKED Signals

**This is normal.** Complex work requires human decisions.

When you see BLOCKED:
1. Read what it's asking for
2. Make the decision or provide the information
3. Let the loop continue

Common BLOCKED causes:
- Missing environment variable
- Need to choose between approaches
- External service needs configuration
- Unclear acceptance criteria

### Tests Failing Repeatedly

If the same test fails 3+ times:
1. The PRD might be unclear — revise acceptance criteria
2. There might be missing context — update CLAUDE.md
3. The scope might be too big — break it down

### Going in Circles

If Claude keeps doing and undoing the same thing:
1. The task is probably too vague
2. Add more explicit instructions
3. Consider breaking into smaller tasks

### Weird Hallucinations

If Claude is making up APIs or using wrong patterns:
1. Your CLAUDE.md is probably missing context
2. Add project conventions and patterns
3. Reference specific files it should follow

---

## Advanced: What Geoffrey Huntley Actually Does

From his interviews, here's what he runs in production:

- **Pre-commit hooks** catch issues before they're committed
- **Property-based tests** verify behavior exhaustively
- **Snapshot tests** catch unexpected changes
- **Agents run with sudo** on bare metal NixOS boxes
- **No code review** — agents push directly to master
- **Deployment in under 30 seconds**
- **Self-healing** — if something breaks, feedback loops feed back into the active session

He shared something incredible in January 2026: the first evolutionary software auto-heal. The system identified a problem with a feature, studied the codebase, fixed it, deployed it automatically, and verified that it worked. All without human intervention.

That's where this is going. You're not there yet. Neither am I. But understanding the direction helps.

---

## The Mindset Shift

Traditional development:
```
Human writes code → AI helps debug → Human iterates forever
```

Ralph loops:
```
Human defines work → AI executes → Human reviews and ships
```

This requires trust. It feels weird at first.

You have to walk away from the keyboard. You have to let the loop work. You have to resist the urge to "help."

But once you ship a feature while doing something else entirely — while sleeping, while at the gym, while having dinner — you won't go back.

---

## Quick Reference

### Starting a Loop
```bash
# 1. Create PRD
/prd

# 2. Start tmux session
tmux new-session -s feature-name

# 3. Run Ralph
ralph-tui run

# 4. Detach
Ctrl+b, d
```

### Monitoring
```bash
# Reattach
tmux attach -t feature-name

# Check progress
cat progress.md

# List all sessions
tmux list-sessions
```

### Parallel Work
```bash
# Create worktree
git worktree add ../project-feature feature-branch

# Start in new session
tmux new-session -s feature -d "cd ../project-feature && ralph-tui run"
```

---

## Further Reading

- [Geoffrey Huntley's Ralph Wiggum](https://ghuntley.com/ralph/) — The original technique
- [Everything is a Ralph Loop](https://ghuntley.com/loop/) — The philosophy
- [Ralph TUI](https://github.com/subsy/ralph-tui) — The orchestration tool
- [awesome-ralph](https://github.com/snwfdhmp/awesome-ralph) — Curated resources

---

**Remember:** Ralph is the AI. Confused, persistent, keeps trying. Your job is to define the work clearly enough that even a confused but persistent executor can get there eventually.

And they will. One iteration at a time.

> *"I bent my wookie."* — Ralph Wiggum

Yeah, sometimes Claude bends things too. But the loop keeps going.
