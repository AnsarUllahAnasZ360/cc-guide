# What Is Milhouse?

> *"Everything's coming up Milhouse!"*

---

## The Honest Truth

Let's be real for a second.

You've seen the demos. You've watched the Twitter threads. You've read about people shipping entire products overnight while they slept. You've seen the screenshots of terminals doing magic, PRDs getting executed, loops running for hours.

And you've thought: *"Why can't I do that?"*

You've tried Claude Code. You wrote a prompt. It did something weird. You tried again. It broke something. You asked it to fix what it broke. It broke something else. You gave up and wrote the code yourself.

You've heard about Ralph loops. You read the docs. You saw terms like "iteration caps" and "quality gates" and "Handlebars templates" and your eyes glazed over. You closed the tab.

You've watched your teammate — the one who "gets" AI — ship three features while you were still figuring out how to phrase your prompt. You've felt that specific flavor of inadequacy that comes from knowing the tools exist but not being able to wield them.

Here's the thing: **You're not bad at this. The tools weren't built for you.**

They were built for the people who already think in systems. The prompt engineers. The context architects. The people who read documentation for fun.

But what about everyone else? What about the rest of us?

**What about Milhouse?**

---

## Who Is Milhouse?

Milhouse Van Houten. Bart Simpson's best friend. The kid with the glasses who's always one step behind. The eternal sidekick. The guy who tries SO hard and somehow still ends up with his pants pulled down in front of the whole school.

Milhouse isn't cool. Milhouse isn't the protagonist. Milhouse isn't the one with the plan.

But Milhouse shows up. Every single time. He gets knocked down and gets back up. He fails and tries again. He's optimistic to a fault. And every once in a while — every once in a beautiful while — things go his way.

And when they do, he screams it from the rooftops:

**"EVERYTHING'S COMING UP MILHOUSE!"**

---

## The Parallel

In the world of AI-assisted development:

**Ralph Wiggum is the AI.** Confused, making mistakes, but never stopping. You point it at a task and it just... keeps going. That's the Ralph loop. The AI is Ralph.

**But who's the human using it?**

Be honest. Are you the genius prompt engineer who writes perfect PRDs on the first try? Are you the person who understands token limits and context windows and system prompts intuitively?

Or are you more like... Milhouse?

Trying hard. A little confused. Hoping this time it works. Watching others succeed and wondering what they know that you don't.

**This repository is for the human Milhouses.**

It's the admission that you might not know what you're doing — and the promise that you don't have to.

---

## The One-Liner

> **"Ralph is your AI. You might be Milhouse. This repository helps Milhouse finally win."**

Or, if you prefer:

> **"For every developer who's ever felt one step behind. Your time is coming."**

---

## What This Repository Actually Gives You

Three skills that make the complicated stuff simple:

### 1. `/prd` — The Interview Layer

Ralph TUI expects you to show up with a perfect PRD. Detailed user stories. Acceptance criteria. Quality gates. The works.

The `/prd` skill asks you questions instead.

*"What are you trying to build?"*
*"What should it do when someone clicks that button?"*
*"How will you know it's working?"*

You answer in plain English. The skill generates the PRD. You never have to learn what a "quality gate" is unless you want to.

### 2. `/setup-claude` — The Configuration Layer

Setting up Claude Code properly is weirdly complicated:
- CLAUDE.md files
- MCP configurations
- Context window management
- Skills, hooks, rules, subagents
- tmux, worktrees, authentication

The `/setup-claude` skill handles all of this. It asks what you're building and configures everything.

Two modes:
- **Init**: New project? Sets everything up from scratch
- **Audit**: Existing project? Analyzes and suggests improvements

### 3. `/agent-browser` — The Verification Layer

AI loves to say "it works" when it doesn't. Especially with UI.

The Agent Browser skill gives Claude a real browser. It can:
- Navigate to pages
- Click buttons
- Fill forms
- Take screenshots
- Verify things actually work

No more "LGTM" when the button doesn't even render.

---

## The Philosophy

### "You Don't Have to Be Bart"

Bart is cool. Bart has the ideas. Bart gets in trouble and gets out of it with style.

You don't have to be Bart.

Milhouse succeeds not by being cool, but by showing up. By trying again. By having systems that compensate for what he lacks in natural talent.

That's the philosophy: **Showing up with the right system beats natural talent without one.**

### "Opinions Are a Feature"

This repository doesn't give you options. It gives you lanes.

Want to plan something? Use `/prd`.
Want to build something? Run Ralph.
Want to set up a repo? Use `/setup-claude`.

You don't decide how to configure the loop. The skills decide. You just answer questions.

This feels limiting until you realize: **every decision you don't make is one less thing you can screw up.**

### "The Victory Cry Is Earned"

"Everything's coming up Milhouse!" hits different when you've struggled.

When the loop completes. When the tests pass. When the PR is ready to merge. That's when you get to say it.

And you'll mean it. Because you remember all the times it didn't come up Milhouse. All the failed prompts. All the broken code. All the closed tabs.

The victory is sweeter when you've known defeat.

---

## The Principles

### 1. "No One Reads Documentation"

If it requires reading docs to use, it's already failed. These skills are built on the assumption that you won't read this file. That you'll just run `/prd` and expect it to work.

It will.

### 2. "Confusion Is Expected"

The system assumes you don't know what you're doing. That's not an insult — it's a design constraint. Every interaction is built for someone who's confused.

If you're NOT confused, great. It'll still work. But it's optimized for Milhouse.

### 3. "Loops Fix Everything"

Didn't work the first time? Run it again. Still broken? Run it again. Something weird happened? Run it again.

The loop is the answer to almost every problem. These skills make running loops trivially easy.

### 4. "Sleep Is Productive"

The best code is written while you're not watching. Ralph loops are built for AFK operation. Start it, leave it, come back to results.

Your unconscious hours are now billable.

### 5. "Shipping Beats Perfection"

This repository doesn't help you write perfect code. It helps you ship code that works.

Perfect is the enemy of done. Milhouse is the friend of done.

---

## The Workflow

Here's what using this repository looks like in practice:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. SETUP (once per project)                                    │
│     /setup-claude init                                          │
│     • Answers questions about your project                      │
│     • Configures CLAUDE.md, MCPs, skills, hooks                 │
│     • Sets up Ralph TUI                                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  2. PLAN (once per feature)                                     │
│     /prd                                                        │
│     • Asks what you're building                                 │
│     • Extracts requirements through interview                   │
│     • Generates PRD.md and prd.json                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  3. BUILD (autonomous)                                          │
│     tmux new-session -s feature                                 │
│     ralph-tui run                                               │
│     Ctrl+b, d                                                   │
│     • Loop runs autonomously                                    │
│     • Commits as it goes                                        │
│     • Uses Agent Browser for UI verification                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  4. MONITOR (periodic)                                          │
│     tmux attach -t feature                                      │
│     • Check progress                                            │
│     • Unblock if needed                                         │
│     • Let it continue                                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  5. SHIP                                                        │
│     • Review the PR                                             │
│     • Merge                                                     │
│     • "Everything's coming up Milhouse!"                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Who This Is For

- The developer who feels one step behind their team
- The founder who has ideas but can't code fast enough
- The junior dev who's intimidated by AI tools
- The senior dev who doesn't have time to learn another system
- The team lead who needs everyone to ship, not just the "AI whisperer"
- The person who's tried and failed and is willing to try one more time

**If you've ever felt like Milhouse — trying hard, a little lost, hoping this time it works — this is for you.**

---

## Who This Is NOT For

- People who enjoy maximum flexibility
- People who want to tune every parameter
- Power users who already mastered Ralph TUI and Claude Code

Use the tools directly. They're more powerful. This repository trades some power for simplicity.

---

## The Promise

You will ship.

Not because you became a prompt engineer. Not because you learned to write perfect PRDs. Not because you suddenly "got" how AI works.

You will ship because the skills asked you the right questions, made the right decisions, ran the right loops, and delivered the right results.

You will ship because the system was built for someone exactly like you.

You will ship because, finally, **everything's coming up Milhouse.**

---

## Getting Started

```bash
# Add the skills to your project
npx @AnsarUllahAnas/cc-guide add-skill --all

# Set up your repository
/setup-claude init

# Start planning your first feature
/prd

# Run the loop
tmux new-session -s feature
ralph-tui run
```

---

> *"I'm not a nerd. Nerds are smart."*
> — Milhouse Van Houten

Yeah, well. With this system, you don't have to be.

---

*"EVERYTHING'S COMING UP MILHOUSE!"*
