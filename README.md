# Claude Code Guide

Skills and guides for autonomous AI-assisted development with Claude Code and Ralph loops.

## What This Is

Three skills you can add to any project:
- **`prd`** - Create PRDs that Claude can execute autonomously
- **`setup-claude`** - Initialize or audit repositories for optimal Claude Code usage
- **`agent-browser`** - Headless browser automation and E2E testing

Plus guides on how I actually use Claude Code.

## Quick Start

### Add Skills to Your Project

```bash
# Add the PRD skill
npx @ansarullahanas/cc-guide add-skill prd

# Add the setup/audit skill
npx @ansarullahanas/cc-guide add-skill setup-claude

# Add the browser automation skill
npx @ansarullahanas/cc-guide add-skill agent-browser

# Or add all skills
npx @ansarullahanas/cc-guide add-skill --all
```

**Or via skills.sh:**
```bash
npx skills add AnsarUllahAnasZ360/cc-guide
```

This copies the skills to your project's `.claude/skills/` folder.

### Use the Skills

In Claude Code:

```
/prd                    # Create a PRD for a new feature
/setup-claude init      # Set up a new repository
/setup-claude audit     # Audit an existing repository
```

## The Idea

Traditional: You code, AI helps, you iterate forever.

This way: You define the work, AI executes, you review.

```
Traditional:          Ralph Loop:
Human → AI → Human    Human → PRD → AI Loop → Human Review
     ↑      ↓              ↓           ↓
     └──────┘          (autonomous)  (complete)
```

**The quality of your PRD determines the quality of your output.**

## What You Need

| Tool | Install | Why |
|------|---------|-----|
| Claude Code | [claude.ai/claude-code](https://claude.ai/claude-code) | Core CLI |
| GitHub CLI | `brew install gh` | Git operations |
| tmux | `brew install tmux` | Persistent sessions |
| Ralph TUI | `npm install -g ralph-tui` | Task orchestration |
| Agent Browser | `npm install -g agent-browser` | Browser automation |

## Guides

- [My Claude Workflow](./guides/my-claude-workflow.md) - How I actually use Claude Code
- [Ralph Loops Explained](./guides/ralph-loops-explained.md) - Running autonomous development loops
- [Best Practices](./guides/best-practices.md) - Lessons learned

## Skills

### PRD Skill (`/prd`)

Creates self-verifying PRDs through an interview process:
1. Identifies what type of task you're doing
2. Extracts everything you know via brain dump
3. Asks clarifying questions
4. Confirms understanding
5. Generates `PRD.md` and `prd.json`

The output is a PRD that Ralph TUI can execute autonomously.

### Agent Browser Skill (`/agent-browser`)

Headless browser automation for AI agents:
- Navigate, click, fill forms
- Take screenshots and snapshots
- E2E testing workflows
- Web scraping

Essential for any task involving UI verification.

### Setup Claude Skill (`/setup-claude`)

Two modes:

**Init** - For new repositories (13 phases):
- Environment & tools check (including tmux)
- CLI discovery & authentication
- MCP configuration (context-window aware)
- Skills, subagents, rules, hooks setup
- CLAUDE.md generation
- Ralph TUI configuration

**Audit** - For existing repositories (8 phases):
- Environment analysis
- CLI and context window audit
- Gap analysis
- Recommendations with interactive fixes

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
│   ├── my-claude-workflow.md
│   ├── ralph-loops-explained.md
│   └── best-practices.md
│
├── templates/
│   └── prompt.hbs            # Ralph TUI prompt template
│
└── bin/
    └── add-skill.js          # npx cc-guide add-skill
```

## Key Concepts

### CLI First, MCP Last

CLIs don't consume context window. MCPs do.

Before enabling any MCP:
- Check if a CLI exists (`gh`, `vercel`, `supabase`, `stripe`)
- Install and authenticate the CLI
- Only use MCP when there's no CLI alternative

### tmux for Persistence

Ralph loops run for hours. tmux means:
- Sessions persist through SSH disconnects
- You can detach and come back later
- Multiple loops can run in parallel

### Worktrees for Parallelism

Can't run two Ralph loops on the same codebase. Git worktrees fix this:
```bash
git worktree add ../project-feature-a feature-a
```

Each worktree can run its own tmux session with its own Ralph loop.

## License

MIT - See [LICENSE](./LICENSE)

---

**The goal isn't to remove humans from development. It's to elevate humans from typists to architects.**
