# Best Practices

Lessons learned from running hundreds of Claude Code sessions and Ralph loops.

## Setup

### CLI First, MCP Last

Every MCP adds tool definitions to Claude's context window. Context is expensive.

**Before enabling any MCP, ask:**
- Is there a CLI for this service?
- Can Claude just run a bash command instead?

| Service | Use CLI | Don't Use MCP |
|---------|---------|---------------|
| GitHub | `gh` | github-mcp |
| Vercel | `vercel` | vercel-mcp |
| Supabase | `supabase` | supabase-mcp |
| Stripe | `stripe` | stripe-mcp |

Keep MCP count under 10. Under 5 is better.

### Context Window Management

Recommended limits:
- MCPs: under 10 enabled
- Tools: under 80 total

Every tool definition consumes tokens. More tools = less room for actual work.

### tmux Is Not Optional

Long-running tasks need persistent sessions:
```bash
# Start session
tmux new-session -s project

# Detach
Ctrl+b, d

# Reattach
tmux attach -t project

# List sessions
tmux list-sessions
```

### Worktrees for Parallel Work

Can't run two Ralph loops on the same repo. Use worktrees:
```bash
git worktree add ../project-feature feature-branch
```

Each worktree = independent directory = can run its own loop.

## PRD Writing

### Be Specific

Bad: "Add user authentication"

Good: "Add email/password authentication using Clerk. Users should be able to sign up, sign in, and sign out. Protect the /dashboard route. Use Clerk's middleware pattern."

### Verifiable Criteria

Bad: "Authentication should work well"

Good:
- User can sign up with email/password
- User can sign in with existing account
- User can sign out
- Unauthenticated users are redirected from /dashboard to /sign-in
- All auth pages use the existing design system

### Task Ordering

Dependencies matter:
1. First: context gathering (read relevant files)
2. Middle: implementation tasks
3. Last: verification (run tests, check build)

### Include Checkpoints

Every phase should end with a verification task:
- Run type check
- Run tests
- Build passes
- Browser verification (for UI)

## During Execution

### Check Back Regularly

Every 30-60 minutes:
1. Is it BLOCKED?
2. Check progress.md
3. Review recent commits

### Handle BLOCKED Immediately

BLOCKED means it needs you. Common causes:
- Missing environment variable
- Need to approve a decision
- External dependency issue
- Unclear acceptance criteria

Fix it and let the loop continue.

### Don't Over-Intervene

The loop knows what it's doing. If it's making progress, let it work.

Intervene only when:
- BLOCKED signal
- Same test failing 3+ times
- Clearly going in circles

## Code Quality

### Hooks for Automatic Formatting

Configure `.claude/settings.json`:
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

Now every file Claude touches gets auto-formatted.

### CLAUDE.md Matters

This is Claude's context for your project. Include:
- Project description
- Key commands (dev, test, build, lint)
- Coding conventions
- Things NOT to do
- File structure overview

Bad CLAUDE.md = confused Claude = bad output.

### Modular Rules

Don't dump everything in CLAUDE.md. Use `.claude/rules/`:
- `security.md` - security guidelines
- `coding-style.md` - style conventions
- `testing.md` - testing requirements

## Common Mistakes

### 1. PRD Too Vague

**Symptom:** Loop produces wrong implementation

**Fix:** More specific PRD with clearer acceptance criteria

### 2. Context Missing

**Symptom:** Claude doesn't follow project patterns

**Fix:** Update CLAUDE.md with project conventions

### 3. Scope Too Big

**Symptom:** Tasks taking forever, going in circles

**Fix:** Break into smaller user stories

### 4. No Verification Steps

**Symptom:** Bugs discovered late

**Fix:** Add checkpoint tasks after each phase

### 5. MCP Overload

**Symptom:** Claude seems slow, context errors

**Fix:** Disable unused MCPs, switch to CLIs

### 6. Ignoring BLOCKED

**Symptom:** Loop stuck for hours

**Fix:** Check regularly, fix blockers immediately

## Mental Models

### You're the Architect

Architects don't lay bricks. They:
- Define what gets built (PRD)
- Set constraints (rules, conventions)
- Review the work (check-ins)
- Make adjustments (unblock, redirect)

### Trust But Verify

The loop will do the work. Your job:
- Set it up correctly
- Monitor periodically
- Intervene when needed
- Review the output

### Compound Learning

Every loop teaches something. Document:
- What worked
- What didn't
- Patterns discovered
- PRD improvements

This knowledge improves future loops.

## Quick Reference

### Starting a Loop
```bash
# 1. Create PRD
/prd

# 2. Start tmux
tmux new-session -s feature

# 3. Run Ralph
ralph-tui run

# 4. Detach
Ctrl+b, d
```

### Monitoring
```bash
# Reattach
tmux attach -t feature

# Check progress
cat progress.md

# List sessions
tmux list-sessions
```

### Parallel Loops
```bash
# Create worktree
git worktree add ../project-feature feature-branch

# Start separate session
tmux new-session -s feature -d "cd ../project-feature && ralph-tui run"
```

### Tool Checks
```bash
claude --version
gh --version
tmux -V
ralph-tui --version
```

---

**Remember:** The quality of your setup and PRD directly determines the quality of your output. Invest time upfront. Reap the benefits during execution.
