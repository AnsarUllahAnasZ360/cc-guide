# How I Actually Use Claude Code

Not theory. Not documentation regurgitation. What I actually do every day after a month of intensive use.

---

## The Mindset Shift That Changed Everything

I used to hate terminals. Not "mildly disliked" — *hated*. I'd search for 20 minutes to find a GUI rather than type one command. I believed command lines were for a different era, a different kind of person.

Then I spent a month with Claude Code.

And something shifted. The terminal wasn't the enemy. It was the unlock. The people who mastered it could do things that seemed impossible. Ship features overnight. Build entire products in weekends. Turn ideas into software while everyone else was still planning.

But here's the real shift:

**I stopped being a typist. Now I'm an architect.**

The old way: you write code, AI helps you debug it, you iterate forever.

My way: I define what needs to happen, Claude executes, I review and steer.

You have to trust the process. Write a good PRD, let it run, check back later. It feels weird at first. Then it becomes the only way you want to work.

---

## My Daily Setup

### The Tools I Actually Use

| Tool | Why It's Non-Negotiable |
|------|------------------------|
| Claude Code | The AI brain. Everything flows through this. |
| tmux | Sessions that survive laptop sleep, SSH drops, terminal crashes |
| Git worktrees | Parallel feature work without branch switching hell |
| Ralph TUI | Task orchestration for autonomous loops |
| Agent Browser CLI | Browser automation for verifying UI actually works |
| GitHub CLI (`gh`) | PRs, issues, everything git-related |

### Why tmux Changed My Life

Ralph loops run for hours. Sometimes overnight. Without tmux:
- Laptop sleeps? Loop dies.
- SSH disconnects? Loop dies.
- Accidentally close terminal? Loop dies.

With tmux:
```bash
# Start session
tmux new-session -s feature

# Detach (loop keeps running)
Ctrl+b, then d

# Come back hours later
tmux attach -t feature
```

I start every coding session with tmux. No exceptions.

### Why Worktrees Are a Game Changer

You can't run two Ralph loops on the same codebase — they'd fight over files. Git worktrees solve this:

```bash
# Main codebase at /project
# Feature A worktree at /project-feature-a
# Feature B worktree at /project-feature-b

git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b
```

Now I can have three autonomous agents working simultaneously:
- Main codebase: bug fixes
- Worktree A: new feature
- Worktree B: refactoring

Each in its own tmux session. All running while I do something else.

---

## My Actual Workflow

### Starting a Feature

**Step 1: Think First**

Before touching Claude, I write down what I'm actually building. In plain words. Not code. Not PRD format. Just:

> "Users should be able to export their data as CSV. The button goes on the settings page. It should include all their projects and tasks."

30 seconds. Forces clarity.

**Step 2: Run /prd**

The interview extracts everything from my brain:
- What exactly am I building?
- Why does it matter?
- How will I know it's done?

I answer questions. It generates the PRD.

**Step 3: Review the PRD**

I read through it. Does it make sense? Are the acceptance criteria verifiable? If something feels off, I fix it now. This is cheaper than fixing it later when the loop is halfway done.

**Step 4: Start the Loop**

```bash
tmux new-session -s export-feature
ralph-tui run
```

**Step 5: Detach and Do Something Else**

```
Ctrl+b, d
```

The loop runs. I work on something else. Or take a walk. Or sleep.

**Step 6: Check Back Periodically**

Every 30-60 minutes:
```bash
tmux attach -t export-feature
```

Questions I ask:
- Is it BLOCKED? (needs my input)
- Is it making progress? (check recent commits)
- Is it going in circles? (same test failing repeatedly)

If it's working, I detach and let it continue. If it needs me, I fix whatever it needs.

---

## The /clear Habit

Every time I start something new, I clear the context:

```
/clear
```

Claude doesn't need the history of what I was doing two hours ago. That history:
- Eats tokens
- Causes confusion
- Makes Claude run compaction (summarization) calls

Clear it. Start fresh. Move on.

Pro tip: `/resume` lets you go back to previous sessions if needed. They're saved. But default to clearing.

---

## CLI First, MCP Last (The Rule I Wish I'd Known Day One)

Every MCP you enable adds tool definitions to Claude's context window. Those tool definitions consume tokens. More tools = less room for actual work = slower, worse results.

**Before adding ANY MCP, ask:**
- Is there a CLI for this service?
- Can Claude just run a bash command instead?

| Service | Use This | Not This |
|---------|----------|----------|
| GitHub | `gh` | github-mcp |
| Vercel | `vercel` | vercel-mcp |
| Supabase | `supabase` | supabase-mcp |
| Stripe | `stripe` | stripe-mcp |
| AWS | `aws` | aws-mcp |

I keep my MCP count under 5. More than 10 and things start degrading.

---

## The CLAUDE.md File (Your Claude's Memory)

CLAUDE.md is Claude's memory of your project. It gets loaded into context automatically every session.

**What goes in CLAUDE.md:**

```markdown
# Project Name

## What This Is
Brief description. What problem does it solve?

## Key Commands
- `bun dev` - Start development server
- `bun test` - Run tests
- `bun build` - Production build
- `bun lint` - Lint code

## Project Structure
- `src/components/` - React components
- `src/lib/` - Utility functions
- `src/app/` - Next.js pages

## Coding Conventions
- Use TypeScript strict mode
- Components go in PascalCase files
- Utilities go in camelCase files
- No default exports

## Things NOT To Do
- Don't use any CSS framework except Tailwind
- Don't add new dependencies without asking
- Don't modify the auth system

## Current Context
Working on: Export feature
Branch: feature/data-export
```

**The rule:** CLAUDE.md should be human-readable. If you wouldn't understand it, neither will Claude.

---

## The Extended Thinking Hack

When I need Claude to think harder about something:

| Word | Thinking Level |
|------|----------------|
| "think" | Light thinking |
| "think hard" | Medium thinking |
| "think harder" | Deep thinking |
| "ultrathink" | Maximum thinking |

Example:
> "Think hard about the best way to structure this data export feature considering scalability."

Use this for architecture decisions, debugging complex issues, and planning. Don't use it for simple tasks (wastes time).

---

## Visual Iteration for UI Work

For anything visual:

**Step 1:** Tell Claude what to build

**Step 2:** Take a screenshot (Cmd+Ctrl+Shift+4 on Mac) and paste it

**Step 3:** "This is what it looks like. Here's what's wrong: [description]"

**Step 4:** Iterate 2-3 times

Claude is excellent with images. Use them.

For automated verification, Agent Browser CLI:
```bash
agent-browser open http://localhost:3000
agent-browser snapshot -i     # See interactive elements
agent-browser click @e5       # Click element 5
agent-browser screenshot verification.png
```

---

## The Escape Key Saves Lives

When Claude is going down the wrong path:

**Single Escape:** Interrupt without losing context. Claude stops. You redirect.

**Double Escape:** Edit your previous prompt. Explore alternatives.

Don't let bad work continue. Interrupt early.

---

## Parallel Claude Sessions

Sometimes I run multiple Claude instances:
- One writes code
- Another reviews it

Or:
- One works on frontend
- Another works on backend

```bash
# Terminal 1: Frontend
cd /project
claude

# Terminal 2: Backend in worktree
cd /project-backend
claude
```

Git worktrees make this clean. Each has its own state.

---

## The Hooks That Save My Sanity

In `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "biome check --write $CLAUDE_FILE_PATHS"
      }]
    }]
  }
}
```

Every file Claude touches gets auto-formatted. No more "fix the formatting" commits.

---

## What I've Learned (The Hard Way)

### 1. Trust the Process

It feels weird to walk away from running code. Do it anyway. The loop knows what it's doing. Micromanaging slows everything down.

### 2. Start Small

Your first Ralph loops should be simple features. "Add a button that does X." Not "rebuild the entire auth system."

Build trust gradually.

### 3. Context Is King

When Claude produces weird output, 90% of the time it's because CLAUDE.md is missing context. Before blaming Claude, check what context it has.

### 4. Verify Everything Visual

Claude loves to say "it works" when it doesn't. Especially UI. Always verify with your own eyes or Agent Browser.

### 5. Specificity Beats Cleverness

Bad: "Make the form better"
Good: "Add email validation to the sign-up form. Show inline errors. Use the existing error message pattern from `src/components/forms/Input.tsx`"

### 6. The PRD Is Everything

Vague PRD = garbage output. Precise PRD = working code.

Time spent on PRD quality is never wasted.

---

## When Things Go Wrong

### Tests Keep Failing

1. The acceptance criteria might be unclear → Revise PRD
2. Context might be missing → Update CLAUDE.md
3. Scope might be too big → Break it down

### Going in Circles

Same code being written and reverted:
1. Task is too vague → Add explicit instructions
2. Conflicting requirements → Clarify in PRD
3. Break into smaller stories

### Weird Hallucinations

Claude making up APIs, using wrong patterns:
1. CLAUDE.md missing project conventions
2. Add explicit "follow pattern in X file" notes
3. Reference specific files Claude should mimic

### BLOCKED Forever

Claude keeps hitting BLOCKED:
1. Read what it's asking for
2. Make the decision
3. Provide the information
4. Let it continue

Don't ignore BLOCKED signals. They're Claude asking for help.

---

## My Mental Model

**You are the architect. Claude is the builder.**

Architects don't lay bricks. They:
1. **Define** what gets built (PRD)
2. **Configure** the environment (CLAUDE.md, tools)
3. **Monitor** and steer (periodic check-ins)
4. **Review** and ship (final validation)

That's it. Let go of the keyboard. Think bigger.

---

## Quick Reference

### Starting My Day
```bash
tmux new-session -s main
claude
```

### Starting a Feature
```bash
# 1. Think about what I'm building
# 2. Run /prd
# 3. Start loop
tmux new-session -s feature
ralph-tui run
# 4. Detach
Ctrl+b, d
```

### Monitoring
```bash
tmux attach -t feature
# Check progress, detach if working
Ctrl+b, d
```

### Parallel Features
```bash
git worktree add ../project-feature-b feature-b
tmux new-session -s feature-b -d "cd ../project-feature-b && ralph-tui run"
```

### Cleaning Up
```bash
/clear                              # New task? Clear context
git worktree remove ../project-feature-b  # Done with worktree
```

---

## The Bottom Line

After a month of intensive Claude Code use, my workflow looks nothing like when I started.

I write less code. I ship more features. I sleep better (literally — loops run overnight).

The secret isn't a fancy prompt or a magic configuration. It's:
1. Clear definition of work (PRD)
2. Proper environment setup (CLAUDE.md, tools)
3. Trust in autonomous execution (Ralph loops)
4. Regular but not obsessive monitoring

That's the whole system. Master these four things and you'll ship more than you ever thought possible.

**The goal isn't to remove humans from development. It's to elevate humans from typists to architects.**
