# My Claude Code Workflow

This is how I use Claude Code. Not theory - what I actually do every day.

## The Philosophy

I stopped being a typist. Now I'm an architect.

The old way: you write code, AI helps you debug it, you iterate forever.

My way: I define what needs to happen, Claude executes, I review and steer.

**The shift is mental.** You have to trust the process. Write a good PRD, let it run, check back later. It feels weird at first. Then it becomes the only way you want to work.

## My Daily Setup

### Tools I Use

| Tool | Why |
|------|-----|
| Claude Code | The core CLI |
| tmux | Sessions that persist |
| Git worktrees | Parallel feature work |
| Ralph TUI | Task orchestration |
| Agent Browser CLI | Browser automation |
| GitHub CLI | PRs and issues |

### Why tmux Matters

Ralph loops run for hours. tmux means:
- SSH disconnects don't kill your work
- You can close your laptop and come back
- Multiple loops can run in parallel

I start every coding session with:
```bash
tmux new-session -s main
```

### Why Worktrees Matter

You can't run two Ralph loops on the same codebase. Git worktrees let you:
- Work on feature A in `/project`
- Work on feature B in `/project-feature-b`
- Each has its own tmux session

```bash
git worktree add ../project-feature-b feature-b
tmux new-session -s feature-b -d
tmux send-keys -t feature-b "cd ../project-feature-b && ralph-tui run" Enter
```

Now you have two autonomous agents working in parallel.

## How I Start a Feature

1. **Think first.** What am I actually trying to build? Write it down in plain words.

2. **Run /prd.** Let the interview process extract everything from my brain.

3. **Review the PRD.** Does it make sense? Are the acceptance criteria verifiable?

4. **Start the loop.**
   ```bash
   tmux new-session -s feature-name
   ralph-tui run
   ```

5. **Detach and work on something else.** Ctrl+b, d.

6. **Check back periodically.** Is it BLOCKED? Does it need me?

## How I Monitor

I check every 30-60 minutes:
- `tmux attach -t feature-name` - see what's happening
- Check progress.md - see what's done
- Look for BLOCKED signals - these need human input

If it's blocked, I fix whatever it needs and let it continue.

## My CLI Philosophy

**CLIs over MCPs. Always.**

Every MCP you enable adds tool definitions to Claude's context window. That's expensive.

A CLI adds nothing. It's just a command Claude can run.

Before adding any MCP, ask: "Is there a CLI for this?"
- GitHub? Use `gh`, not GitHub MCP
- Vercel? Use `vercel`, not Vercel MCP
- Stripe? Use `stripe`, not Stripe MCP

I keep my MCP count under 10. Ideally under 5.

## The PRD Is Everything

A vague PRD produces garbage. A precise PRD produces working code.

Good PRD characteristics:
- Clear task descriptions (WHAT and WHY)
- Step-by-step implementation tasks (HOW)
- Verifiable acceptance criteria (DONE WHEN)
- Dependency ordering (DO THIS FIRST)

The time you spend on the PRD directly correlates with the quality of the output.

## What I've Learned

1. **Trust the process.** It feels weird to walk away. Do it anyway.

2. **Start small.** Your first Ralph loops should be simple features.

3. **Context is king.** CLAUDE.md matters. Keep it updated.

4. **Verify everything.** If there's UI, use Agent Browser CLI.

5. **When in doubt, ask.** The interview process exists for a reason.

## When Things Go Wrong

**BLOCKED means it needs you.** Don't ignore it. Fix whatever it needs.

**Tests failing repeatedly?** The PRD might be unclear. Revise the acceptance criteria.

**Going in circles?** The scope might be too big. Break it down.

**Weird hallucinations?** Your CLAUDE.md might be missing context.

## The Mental Model

You are the architect. Claude is the builder.

Architects don't lay bricks. They define what gets built, review the work, and make adjustments.

Your job:
1. Define the work clearly (PRD)
2. Set up the environment (tools, config)
3. Monitor and steer (check-ins)
4. Review and ship (final validation)

That's it. Let go of the keyboard. Think bigger.
