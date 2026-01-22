# Claude Code Guide

> *"Everything's coming up Milhouse!"*

Skills and guides for autonomous AI-assisted development with Claude Code and Ralph loops.

---

## What Is This?

You've seen the demos. People shipping entire products overnight. Loops running for hours. Features appearing while they slept.

And you've thought: *"Why can't I do that?"*

**This repository is for you.** The developer who feels one step behind. The founder with ideas but no time. The team where only one person "gets" AI.

Three skills that make the complicated stuff simple:
- **`/prd`** — Create PRDs through conversation, not writing
- **`/setup-claude`** — Configure your repo optimally without reading 100 docs
- **`/agent-browser`** — Browser automation for verifying UI actually works

Plus guides on how to actually use Claude Code productively.

---

## Quick Start

### Add Skills to Your Project

```bash
# Add all skills (recommended)
npx @ansarullahanas/cc-guide add-skill --all

# Or add individually
npx @ansarullahanas/cc-guide add-skill prd
npx @ansarullahanas/cc-guide add-skill setup-claude
npx @ansarullahanas/cc-guide add-skill agent-browser
```

**Via skills.sh:**
```bash
npx skills add AnsarUllahAnasZ360/cc-guide
```

### Use the Skills

In Claude Code:

```
/prd                    # Create a PRD for a new feature
/setup-claude init      # Set up a new repository
/setup-claude audit     # Audit an existing repository
/agent-browser          # Browser automation help
```

---

## The Big Idea

**Traditional:** You code, AI helps, you iterate forever.

**This way:** You define the work, AI executes, you review.

```
Traditional:          Ralph Loop:
Human → AI → Human    Human → PRD → AI Loop → Human Review
     ↑      ↓              ↓           ↓
     └──────┘          (autonomous)  (complete)
```

**The quality of your PRD determines the quality of your output.**

---

## Why "Milhouse"?

In the world of AI-assisted development:

**Ralph Wiggum is the AI** — Confused, making mistakes, but never stopping. The AI is Ralph.

**Milhouse is the human** — Trying hard, a little confused, hoping this time it works.

This repository helps Milhouse win. Not by making you a prompt engineer, but by giving you skills that ask the right questions and make the right decisions.

Read the full story: [What Is Milhouse?](./guides/what-is-milhouse.md)

---

## What You Need

| Tool | Install | Why |
|------|---------|-----|
| Claude Code | [claude.ai/claude-code](https://claude.ai/claude-code) | Core CLI |
| GitHub CLI | `brew install gh` | Git operations |
| tmux | `brew install tmux` | Persistent sessions |
| Ralph TUI | `npm install -g ralph-tui` | Task orchestration |
| Agent Browser | `npm install -g agent-browser` | Browser automation |

---

## Guides

Start here:

| Guide | What You'll Learn |
|-------|-------------------|
| [What Is Milhouse?](./guides/what-is-milhouse.md) | The philosophy behind this repo |
| [My Claude Workflow](./guides/my-claude-workflow.md) | How I actually use Claude Code daily |
| [Ralph Loops Explained](./guides/ralph-loops-explained.md) | Running autonomous development loops |
| [Best Practices](./guides/best-practices.md) | Lessons learned the hard way |

---

## Skills

### PRD Skill (`/prd`)

Creates self-verifying PRDs through an interview process:

1. Identifies what type of task you're doing
2. Extracts everything you know via brain dump
3. Asks clarifying questions
4. Confirms understanding
5. Generates `PRD.md` and `prd.json`

**The output is a PRD that Ralph TUI can execute autonomously.**

You don't write PRDs. You answer questions.

### Setup Claude Skill (`/setup-claude`)

Two modes:

**Init** — For new repositories:
- Environment & tools check
- CLI discovery & authentication
- MCP configuration (context-window aware)
- Skills, subagents, rules, hooks setup
- CLAUDE.md generation
- Ralph TUI configuration

**Audit** — For existing repositories:
- Environment analysis
- Gap analysis
- Recommendations with interactive fixes
- Context window optimization

### Agent Browser Skill (`/agent-browser`)

Headless browser automation for AI agents:
- Navigate, click, fill forms
- Take screenshots and snapshots
- E2E testing workflows
- Web scraping

**Essential for verifying that UI actually works**, not just that Claude says it works.

---

## Key Concepts

### CLI First, MCP Last

CLIs don't consume context window. MCPs do.

Before enabling any MCP:
- Check if a CLI exists (`gh`, `vercel`, `supabase`, `stripe`)
- Install and authenticate the CLI
- Only use MCP when there's no CLI alternative

Keep MCPs under 10. Under 5 is better.

### tmux for Persistence

Ralph loops run for hours. tmux means:
- Sessions persist through SSH disconnects
- You can detach and come back later
- Multiple loops can run in parallel

```bash
tmux new-session -s feature
ralph-tui run
# Ctrl+b, d to detach
# tmux attach -t feature to come back
```

### Worktrees for Parallelism

Can't run two Ralph loops on the same codebase. Git worktrees fix this:

```bash
git worktree add ../project-feature-a feature-a
```

Each worktree can run its own tmux session with its own Ralph loop.

---

## Repository Structure

```
cc-guide/
├── skills/
│   ├── prd/                  # PRD creation skill
│   │   ├── SKILL.md          # Entry point
│   │   ├── AGENTS.md         # Comprehensive reference
│   │   ├── interview/        # Interview process guides
│   │   └── categories/       # Task-type specific guidance
│   │
│   ├── setup-claude/         # Setup/audit skill
│   │   ├── SKILL.md          # Entry point
│   │   ├── workflows/        # Init & audit workflows
│   │   ├── components/       # Detailed component guides
│   │   ├── reference/        # Reference material
│   │   └── templates/        # Config templates
│   │
│   └── agent-browser/        # Browser automation skill
│       └── SKILL.md          # CLI reference
│
├── guides/
│   ├── what-is-milhouse.md        # Philosophy and purpose
│   ├── my-claude-workflow.md      # Daily workflow
│   ├── ralph-loops-explained.md   # Autonomous loops guide
│   └── best-practices.md          # Lessons learned
│
├── templates/
│   └── prompt.hbs            # Ralph TUI prompt template
│
└── bin/
    └── add-skill.js          # npx cc-guide add-skill
```

---

## The Workflow

```
1. SETUP (once per project)
   /setup-claude init

2. PLAN (once per feature)
   /prd

3. BUILD (autonomous)
   tmux new-session -s feature
   ralph-tui run
   Ctrl+b, d

4. MONITOR (periodic)
   tmux attach -t feature

5. SHIP
   Review, merge, celebrate
```

---

## Further Reading

**Official:**
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) — From Anthropic
- [Ralph Wiggum](https://ghuntley.com/ralph/) — Geoffrey Huntley's original technique
- [Ralph TUI](https://github.com/subsy/ralph-tui) — Task orchestration tool

**Community:**
- [awesome-ralph](https://github.com/snwfdhmp/awesome-ralph) — Curated Ralph resources

---

## License

MIT — See [LICENSE](./LICENSE)

---

**The goal isn't to remove humans from development. It's to elevate humans from typists to architects.**

*Everything's coming up Milhouse.*
