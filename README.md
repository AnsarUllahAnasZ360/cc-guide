# Claude Code Guide

> *"Everything's coming up Milhouse!"*

Skills and guides for autonomous AI-assisted development with Claude Code and Ralph loops.

---

## What Is This?

You've seen the demos. People shipping entire products overnight. Loops running for hours. Features appearing while they slept.

And you've thought: *"Why can't I do that?"*

**This repository is for you.** The developer who feels one step behind. The founder with ideas but no time. The team where only one person "gets" AI.

A focused set of skills and plugins that make the complicated stuff simple:
- **`/prd`** — Create PRDs through conversation, not writing
- **`/ralph-preflight`** — Validate everything before starting a Ralph loop
- **`/setup-claude`** — Configure your repo optimally without reading 100 docs
- **`/agent-browser`** — Browser automation for verifying UI actually works
- **ProofOps Verification** — Review branches, fix issues, capture browser proof, and render proof videos
- **Sprint Protocol** — Run Codex-native research, stories, execution, optional QA verification, and PR handoff
- **QA** — Run Codex-native end-to-end QA with Browser Use, tests, fixes, documentation, and narrated proof videos

Plus guides on how to actually use Claude Code productively.

---

## Quick Start

### Add Skills to Your Project

```bash
# Add all skills (recommended)
npx github:AnsarUllahAnasZ360/cc-guide#main add-skill --all

# Or add individually
npx github:AnsarUllahAnasZ360/cc-guide#main add-skill prd
npx github:AnsarUllahAnasZ360/cc-guide#main add-skill ralph-preflight
npx github:AnsarUllahAnasZ360/cc-guide#main add-skill setup-claude
npx github:AnsarUllahAnasZ360/cc-guide#main add-skill agent-browser
```

### Install Sprint Protocol With skills.sh

Install the Sprint Protocol skill directly into Claude Code and Codex:

```bash
npx skills add AnsarUllahAnasZ360/cc-guide --skill sprint-protocol -a claude-code -a codex -g -y
```

To install every skill from this repo into both agents:

```bash
npx skills add AnsarUllahAnasZ360/cc-guide --skill '*' -a claude-code -a codex -g -y
```

### Add Codex Plugins

Install the richer Codex plugin version when you want the Codex plugin card, phase skills, and marketplace metadata:

```bash
npx github:AnsarUllahAnasZ360/cc-guide#main add-plugin proof-driven-verification
npx github:AnsarUllahAnasZ360/cc-guide#main add-plugin sprint-protocol
npx github:AnsarUllahAnasZ360/cc-guide#main add-plugin qa
```

### Install A Plugin Globally For Codex

Install once into your home Codex plugin catalog so it is available from any project on that computer:

```bash
npx github:AnsarUllahAnasZ360/cc-guide#main add-plugin proof-driven-verification --global
npx github:AnsarUllahAnasZ360/cc-guide#main add-plugin sprint-protocol --global
npx github:AnsarUllahAnasZ360/cc-guide#main add-plugin qa --global
```

After the npm package is published at `1.1.0` or newer, the equivalent npm form is:

```bash
npx @ansarullahanas/cc-guide add-plugin proof-driven-verification --global
npx @ansarullahanas/cc-guide add-plugin sprint-protocol --global
npx @ansarullahanas/cc-guide add-plugin qa --global
```

This writes plugins into `~/plugins/<plugin-name>` and updates `~/.agents/plugins/marketplace.json`.
On another computer, run the same command again after installing Codex and Node.

Then ask Codex for a phase directly:

```text
Use Sprint Protocol to research and plan this work.
Use sprint-stories to write stories for sprint <name>.
Use sprint-execute to implement sprint <name>.
Use sprint-verify to run QA/evidence verification for sprint <name> and prepare the PR when needed.
Use QA to verify these sprint folders end to end.
```

Optional one-command install plus host-level prerequisite setup. This may install or check workstation tools such as Agent Browser, ffmpeg/ffprobe, browser payloads, and the optional Deepgram CLI:

```bash
npx github:AnsarUllahAnasZ360/cc-guide#main add-plugin proof-driven-verification --setup
```

Run ProofOps in one command from any repo. If the plugin is not already installed in that repo, the command installs the local plugin copy first so Codex can load the ProofOps skills:

```bash
npx github:AnsarUllahAnasZ360/cc-guide#main proofops --task "Verify this branch before I merge it"
```

Generate a QA invocation prompt from any repo:

```bash
npx github:AnsarUllahAnasZ360/cc-guide#main qa --task "Verify these completed sprint folders end to end"
```

After the npm package is published at `1.1.0` or newer, the equivalent npm form is:

```bash
npx @ansarullahanas/cc-guide qa --task "Verify these completed sprint folders end to end"
```

Run the doctor after installing the plugin in a repo:

```bash
node plugins/proof-driven-verification/scripts/doctor.mjs
```

Store Deepgram securely on macOS without committing it:

```bash
DEEPGRAM_API_KEY=... node plugins/proof-driven-verification/scripts/deepgram-key.mjs set
DEEPGRAM_API_KEY=... node ~/plugins/qa/scripts/deepgram-key.mjs set
```

### Use the Skills

In Claude Code:

```
/prd                    # Create a PRD for a new feature
/ralph-preflight        # Validate config before starting Ralph loop
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

### Ralph Pre-Flight Skill (`/ralph-preflight`)

Run this after `/prd` and before starting a Ralph loop:

1. Detects global CLAUDE.md conflicts (can override local config)
2. Checks for existing Ralph state from previous runs
3. Validates config.toml and template paths
4. Verifies prd.json structure and template variable mapping
5. Offers branch vs worktree setup options
6. Provides ready-to-copy tmux and Ralph launch commands

**Catches configuration issues before they waste iterations.**

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
│   ├── ralph-preflight/      # Pre-flight check skill
│   │   └── SKILL.md          # Validation & launch commands
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
├── plugins/
│   ├── proof-driven-verification/ # ProofOps verification plugin
│   ├── sprint-protocol/           # Codex sprint lifecycle plugin
│   └── qa/                        # Codex QA verification plugin
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
    └── add-skill.js          # npx @ansarullahanas/cc-guide add-skill / add-plugin
```

---

## The Workflow

```
1. SETUP (once per project)
   /setup-claude init

2. PLAN (once per feature)
   /prd

3. VALIDATE (before each loop)
   /ralph-preflight

4. BUILD (autonomous)
   tmux new-session -s feature
   ralph-tui run --prd path/to/prd.json
   Ctrl+b, d

5. MONITOR (periodic)
   tmux attach -t feature

6. SHIP
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
