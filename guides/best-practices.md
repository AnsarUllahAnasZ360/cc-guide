# Best Practices: Lessons Learned the Hard Way

Everything in this guide comes from real experience — mostly from making mistakes and figuring out why things broke.

---

## The Setup That Actually Works

### CLI First, MCP Last

This is the single most impactful lesson.

Every MCP you enable adds tool definitions to Claude's context window. Context is expensive. More tools = less room for your actual work = slower, worse results.

**The Rule:** Before enabling ANY MCP, ask "Is there a CLI for this?"

| Service | CLI (Use This) | MCP (Avoid) |
|---------|----------------|-------------|
| GitHub | `gh` | github-mcp |
| Vercel | `vercel` | vercel-mcp |
| Supabase | `supabase` | supabase-mcp |
| Stripe | `stripe` | stripe-mcp |
| AWS | `aws` | aws-mcp |
| Firebase | `firebase` | firebase-mcp |
| Netlify | `netlify` | netlify-mcp |

**Recommended Limits:**
- MCPs: Under 10 enabled (under 5 is better)
- Total Tools: Under 80

If you exceed these, Claude starts getting confused about which tool to use and burns tokens on tool selection.

### Context Window Management

The context window is precious real estate. Treat it like expensive RAM — don't waste it.

**Things that eat context:**
- MCP tool definitions (each tool = ~200-500 tokens)
- Long conversation history
- Large file reads
- Verbose CLAUDE.md files

**How to preserve context:**
1. Use `/clear` between unrelated tasks
2. Keep CLAUDE.md concise (hundreds of lines, not thousands)
3. Use `.claude/rules/` for detailed guidelines instead of cramming into CLAUDE.md
4. Prefer CLIs over MCPs

### tmux Is Not Optional

For anything longer than a quick question, use tmux:

```bash
# Start session
tmux new-session -s project

# Detach (work continues)
Ctrl+b, d

# Reattach later
tmux attach -t project

# List sessions
tmux list-sessions
```

Without tmux:
- Laptop sleep kills your work
- SSH disconnect kills your work
- Accidentally close terminal kills your work

With tmux, the session persists through all of these.

### Worktrees for Parallel Work

You can't run two Claude sessions on the same codebase effectively — they'll conflict over files.

Git worktrees give you independent directories from the same repo:

```bash
# Create worktree for feature work
git worktree add ../project-feature feature-branch

# Each worktree can have its own:
# - Claude session
# - tmux session
# - Ralph loop
```

This enables:
- Main codebase: bug fixes
- Worktree A: new feature
- Worktree B: refactoring

All running simultaneously.

---

## PRD Writing: Where Success Is Determined

### Be Painfully Specific

**Bad:** "Add user authentication"

**Good:** "Add email/password authentication using Clerk. Users should be able to sign up, sign in, and sign out. Protect the /dashboard route using Clerk middleware. Show loading states during auth operations. Use the existing design system for all UI."

The specificity gap between these two examples is the difference between working code and garbage.

### Acceptance Criteria Must Be Verifiable

**Bad:** "Authentication should work well"

**Good:**
- User can sign up with valid email and password
- User can sign in with existing credentials
- User can sign out from the header menu
- Invalid credentials show appropriate error messages
- Unauthenticated users are redirected from /dashboard to /sign-in
- Auth state persists across browser refresh

Every criterion should answer the question "How would I test this?"

### Task Ordering Matters

Always order tasks by dependency:

1. **First:** Context gathering (read relevant files, understand patterns)
2. **Second:** Core implementation (the actual work)
3. **Third:** Edge cases and error handling
4. **Last:** Verification (run tests, check build)

Never put verification before implementation is complete. Never put implementation before understanding the codebase.

### Include Checkpoints

Every phase should end with a verification story:

```json
{
  "id": "US-004",
  "title": "Phase 1 Checkpoint",
  "description": "Verify all Phase 1 work is complete before proceeding",
  "tasks": [
    "Run type check",
    "Run lint",
    "Run all tests",
    "Verify build succeeds",
    "Browser verify UI if applicable"
  ],
  "acceptanceCriteria": [
    "No TypeScript errors",
    "No lint errors",
    "All tests pass",
    "Build succeeds"
  ]
}
```

Checkpoints catch issues early. It's cheaper to fix bugs at the checkpoint than after three more phases of work.

---

## During Execution: Trust But Verify

### Check Back Regularly, But Not Obsessively

**Check every 30-60 minutes:**
1. Is it BLOCKED? (needs your input)
2. Is it making progress? (check recent commits)
3. Is it going in circles? (same test failing 3+ times)

If it's working, let it work. Micromanagement slows everything down.

### Handle BLOCKED Immediately

BLOCKED means Claude needs something only you can provide:
- Missing environment variable
- Decision between approaches
- External service configuration
- Unclear requirements

Read what it's asking. Provide the answer. Let it continue.

**Don't ignore BLOCKED signals.** A loop stuck on BLOCKED for hours is wasted compute time and wasted opportunity.

### Don't Over-Intervene

The instinct is to "help" when you see Claude working. Resist it.

**Intervene only when:**
- BLOCKED signal
- Same test failing 3+ times
- Clearly going in circles (doing and undoing the same change)
- Critical error (wrong file deleted, wrong branch, etc.)

**Don't intervene when:**
- It's taking longer than expected (patience)
- It's taking a different approach than you would (diversity)
- It made a small mistake but is fixing it (self-correction)

---

## Code Quality: Automation Is Your Friend

### Hooks for Automatic Formatting

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

Now every file Claude touches gets auto-formatted. No more "fix formatting" commits.

Other useful hooks:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "biome check --write $CLAUDE_FILE_PATHS"
          }
        ]
      }
    ],
    "PreCommit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bun run typecheck"
          }
        ]
      }
    ]
  }
}
```

### CLAUDE.md Matters More Than You Think

CLAUDE.md is loaded into every conversation. It's Claude's persistent memory of your project.

**What belongs in CLAUDE.md:**
- Project description (what it does, who it's for)
- Key commands (dev, test, build, lint)
- Project structure overview
- Coding conventions
- Things NOT to do
- Current context (what you're working on)

**What doesn't belong:**
- Entire API documentation
- Long code examples
- History of changes
- Detailed specifications (put these in PRDs)

Keep it concise. Hundreds of lines, not thousands.

### Use Modular Rules

Instead of one mega CLAUDE.md, split guidelines into `.claude/rules/`:

```
.claude/
  rules/
    security.md      # Security guidelines
    testing.md       # Testing requirements
    coding-style.md  # Style conventions
    api-design.md    # API patterns
```

Claude loads these contextually. Asking about tests? It loads testing.md. Working on API? It loads api-design.md.

This keeps context usage efficient.

---

## Common Mistakes (And How to Fix Them)

### 1. PRD Too Vague

**Symptom:** Loop produces wrong implementation or goes in circles

**Fix:** Add specificity. Reference exact files, exact patterns, exact behavior.

Instead of "follow best practices," write "follow the pattern in src/components/forms/Input.tsx"

### 2. Missing Context

**Symptom:** Claude doesn't follow project patterns, uses wrong conventions

**Fix:** Update CLAUDE.md with project conventions. Add specific examples. Reference files to mimic.

### 3. Scope Too Big

**Symptom:** Tasks take forever, loop seems stuck, going in circles

**Fix:** Break the PRD into smaller, independent stories. Each story should be completable in 15-30 minutes of AI work.

### 4. No Verification Steps

**Symptom:** Bugs discovered late, rework needed

**Fix:** Add checkpoint stories after each phase. Include browser verification for all UI work.

### 5. MCP Overload

**Symptom:** Claude seems slow, makes wrong tool choices, context errors

**Fix:** Disable unused MCPs. Convert to CLIs where possible. Aim for under 5 MCPs.

### 6. Ignoring BLOCKED

**Symptom:** Loop stuck for hours with no progress

**Fix:** Check regularly. When BLOCKED, read what's needed, provide it, continue.

### 7. Not Using /clear

**Symptom:** Claude confused by unrelated context, responses getting slower

**Fix:** Use `/clear` when starting new tasks. The history isn't helping — it's hurting.

---

## Mental Models

### You're the Architect

Architects don't lay bricks. They:
1. **Define** what gets built (PRD)
2. **Set constraints** (rules, conventions)
3. **Review** the work (check-ins)
4. **Adjust** (unblock, redirect)

Your job is clarity, not typing.

### Trust But Verify

The loop will do the work. Your job:
1. Set it up correctly (good PRD, proper tools)
2. Monitor periodically (not obsessively)
3. Intervene when needed (BLOCKED, circles, errors)
4. Review the output (before shipping)

### Compound Learning

Every loop teaches something. Document:
- What worked well
- What didn't work
- Patterns discovered
- PRD improvements for next time

This knowledge improves future loops. Bad loops aren't failures — they're tuition.

### Context Is Expensive

Treat context window like expensive RAM:
- Don't waste it on unnecessary MCPs
- Clear it when starting new work
- Keep CLAUDE.md lean
- Use modular rules

More available context = better Claude responses.

---

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

### Parallel Work
```bash
# Create worktree
git worktree add ../project-feature feature-branch

# Start loop in new session
tmux new-session -s feature -d "cd ../project-feature && ralph-tui run"
```

### Tool Verification
```bash
# Check your tools
claude --version
gh --version
tmux -V
ralph-tui --version
```

### Context Management
```bash
# Clear context
/clear

# Resume previous session
/resume

# Check stats
/stats
```

---

## The Bottom Line

**The quality of your setup and PRD directly determines the quality of your output.**

Invest time upfront:
- Configure tools properly (CLI first, minimal MCPs)
- Write specific PRDs (verifiable criteria, proper ordering)
- Set up automation (hooks, rules)
- Keep context lean (clear often, modular rules)

Then trust the process. Check in periodically. Ship code.

That's the system. It works.
