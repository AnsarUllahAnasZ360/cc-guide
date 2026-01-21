# Ralph Loops Explained

A practical guide to running autonomous AI development loops.

## What Is a Ralph Loop?

A Ralph loop is an autonomous execution pattern:

1. You write a PRD with tasks and acceptance criteria
2. Ralph TUI feeds tasks to Claude one at a time
3. Claude executes, self-verifies, and signals completion
4. The loop continues until done

That's it. No hand-holding. No constant intervention.

## The Stack

```
You (architect)
    ↓
PRD (prd.json)
    ↓
Ralph TUI (orchestrator)
    ↓
Claude Code (executor)
    ↓
Your codebase
```

## Setting Up a Loop

### 1. Prerequisites

Make sure you have:
- Claude Code installed
- Ralph TUI installed (`npm install -g ralph-tui`)
- tmux installed (`brew install tmux`)
- A git repository

### 2. Create the PRD

Run `/prd` in Claude Code. The interview will extract:
- What you're building
- Why it matters
- How to verify it's done

Output: `docs/prds/your-feature/prd.json`

### 3. Start a tmux Session

```bash
tmux new-session -s your-feature
```

### 4. Run Ralph

```bash
ralph-tui run
```

### 5. Detach and Monitor

Detach: `Ctrl+b, d`

Check back: `tmux attach -t your-feature`

## Completion Signals

Claude uses these signals during execution:

| Signal | Meaning |
|--------|---------|
| `<promise>COMPLETE</promise>` | Task done, all criteria met |
| `<promise>BLOCKED</promise>` | Needs human input |
| `<promise>SKIP</promise>` | Can't complete, non-critical |
| `<promise>EJECT</promise>` | Critical failure, needs human |

**COMPLETE** = move to next task
**BLOCKED** = you need to fix something
**SKIP** = optional work that couldn't be done
**EJECT** = stop everything, something's wrong

## The Progress File

Ralph maintains `progress.md` with:
- What's been completed
- Current status
- Learnings and patterns discovered
- Blockers encountered

Check this file to understand the loop's history.

## Parallel Loops with Worktrees

You can run multiple loops on different features:

```bash
# Create worktrees
git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b

# Start loops in separate tmux sessions
tmux new-session -s feature-a -d "cd ../project-feature-a && ralph-tui run"
tmux new-session -s feature-b -d "cd ../project-feature-b && ralph-tui run"
```

Now you have two autonomous agents working in parallel.

## When to Intervene

**Check back every 30-60 minutes.** Look for:

1. **BLOCKED signals** - Something needs your input
2. **Repeated test failures** - PRD might need clarification
3. **Circular behavior** - Scope might be too big

When you intervene:
1. Fix the issue
2. Update the PRD if needed
3. Let the loop continue

## Loop Configuration

Ralph TUI is configured in `.ralph-tui/config.toml`:

```toml
configVersion = "2.0"
tracker = "json"
agent = "claude"
model = "opus"
maxIterations = 50
autoCommit = true
```

Key settings:
- `model`: opus for complex work, sonnet for simpler tasks
- `maxIterations`: safety limit
- `autoCommit`: whether to commit after each task

## The Prompt Template

`.ralph-tui/templates/prompt.hbs` defines how tasks are presented to Claude.

It includes:
- PRD context
- Current task details
- Previous learnings
- Completion signals

Don't modify this unless you know what you're doing.

## Debugging a Loop

**Loop seems stuck:**
1. Check if BLOCKED
2. Check progress.md for patterns
3. Look at the last few commits

**Tests keep failing:**
1. Review acceptance criteria - are they verifiable?
2. Check if there's missing context in CLAUDE.md
3. Consider breaking into smaller tasks

**Weird output:**
1. Check CLAUDE.md for missing project context
2. Review the PRD description field
3. Ensure dependencies are correctly ordered

## Best Practices

1. **Start small.** First loops should be simple features.

2. **Write precise PRDs.** Vague input = garbage output.

3. **Use verification tasks.** Every phase should end with a checkpoint.

4. **Keep CLAUDE.md updated.** Claude needs context to work well.

5. **Don't micro-manage.** Trust the process. Check back periodically.

6. **Document learnings.** Each loop teaches you something.

## The Mindset Shift

Traditional development: you do the work, AI helps.

Ralph loops: you define the work, AI does it.

This requires trust. It feels weird at first.

But once you experience shipping a feature while doing something else entirely, you won't go back.
