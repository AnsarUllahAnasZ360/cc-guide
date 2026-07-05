# Autosprint: how I turned my Sunday planning ritual into a shipping pipeline

Every Sunday night, I sit down with five projects and one version of me.

I lead multiple product teams, about twenty five engineers across them. I rarely get to write code anymore, and honestly, writing code was never my edge. My edge is the part before the code: understanding the problem, researching the solution, architecting the plan, and deciding what a team should build next. So my Sundays became a ritual. Review progress, plan the sprint, record a Loom or write up notes, hand it to the team, repeat next week.

It worked. But I kept staring at a gap. Software delivery has three big pieces: figuring out what to build, building it, and verifying and shipping it. I am strong at the first. My engineers are strong at the third. And the second piece, the actual building, had quietly become something AI agents can do for hours without me in the room. I was paying for Claude Code and Codex subscriptions with rate limits I never fully used, while my plans waited days for a human to pick them up.

Autosprint is my answer to that gap. It is a Claude Code skill that takes my role as the architect, hands execution to a fleet of AI agents running through the night, and delivers my team a pull request they can verify, iterate, and ship. This post is my field notes on how it works and what I learned building it.

## The road here: PRDs, then Sprint Protocol, then workflows

This is my third attempt at the same idea.

First I built a PRD skill: an interview process that turned my brain dumps into self-verifying requirement docs an agent could execute. Then I built Sprint Protocol: a full phase system with research, story writing, review, execution, and verification, running on subagents. Both taught me a lot. Both had the same ceiling: a single model in a single context window was doing the orchestration, and I was the babysitter. Long runs drifted. Context rotted. Somebody had to be watching.

Then Claude Code shipped dynamic workflows. The model writes a small JavaScript harness, and that code, not the model's attention span, controls the execution: which agent spawns, in what order, with what model, with what checks. Anthropic's engineers describe it as giving every task its own custom harness. For me it meant something simpler: once launched, the sprint could not get lazy, could not lose the plot, and could not stop to ask me a question at 3am.

That changed the design completely. The old protocol assumed a human nearby. The new one assumes the opposite.

## The shape of an autosprint

The mental model is a hierarchy with exactly three levels.

A **sprint** is the unit of delivery: one branch, one autonomous run, one pull request, one completion report. An **epic** is a themed group of tasks inside the sprint, and it is the quality checkpoint: every epic ends with a review agent that audits the work. A **task** is the atomic unit: one problem, one fresh agent, one commit.

The lifecycle has four modes. **Discover**: I show up with unknowns, and small teams of research agents map the problem and the solution while I answer the questions only I can answer. **Plan**: the strongest model available writes the sprint: epic folders, task specs, a machine-readable plan file, and a verification guide for my team. I approve it, and that approval is the only human gate in the entire system. **Launch**: a canonical workflow executes everything, task by task or in parallel waves, with per-task commits and epic reviews, while a live dashboard updates on my phone. **Handoff**: my team receives a draft PR carrying its own plan, evidence, decision log, and testing playbook.

## The lessons that actually matter

Building this forced me to get specific about things I used to hand-wave. These are the ones worth stealing.

**The plan is data. The engine is code.** Early on, the most time-consuming part was writing the orchestration itself. Now the skill ships one battle-tested executor script, and every sprint is just a JSON file fed into it. Nobody writes orchestration at 11pm on a Sunday anymore, which also means nobody debugs fresh orchestration bugs at 3am on a Monday.

**Task sizing is the whole game.** Every task runs in a fresh context window, and it fails at both extremes. Make tasks too small and every agent pays the same orientation tax, reading the project, the epic, the spec, just to change three lines. Make them too big and the agent's context bloats mid-flight, right when the hard part arrives. The target is a good work item: one coherent problem an agent can research, build, verify, and commit with room to spare. I now believe this single judgment decides whether the sprint succeeds.

**A spec is a context transfer, not a to-do list.** The expensive model plans. Cheaper models execute. That economic split only works if the spec carries everything the planner knew: the why, the production observations, the alternatives we rejected and the reasons. An executor that understands intent makes the right call when reality diverges from the plan. One that only has instructions makes a plausible-looking wrong one.

**The map is not the territory.** This one I took straight from Thariq Shihipar's field guide on working with Fable. The spec is a map. The code is the territory. So every agent's first instruction is to verify the spec against the actual code before editing, and to trust the territory when they disagree. The same thinking shapes discovery: before planning anything, I run a blindspot pass where an agent hunts for my unknown unknowns. It once surfaced a half-built retry system that would have silently fought the feature we were about to build.

**Reviews that fix, not gates that stop.** In an unattended run, a gate that stops is a run that dies. So the reviewer at the end of every epic does not file tickets. It reads the actual diffs against the specs, checks that replaced code was deleted, hunts for defects, then repairs what it finds and commits the fixes. Failures do not halt the night either: a failed epic only skips the epics that depended on it, and everything else still ships with an honest account.

**Agents must tell the truth.** Every prompt carries the same rules: audit every claim against a command result, report failures as failures, and never weaken a test to make it pass. Agents also keep an append-only ledger of every decision they made alone and every assumption where my input would have changed things. Those surface on the dashboard as a list of questions waiting for me. Trust is not a vibe here. It is a file format.

**Estimate complexity, never time.** Tasks are simple, standard, or complex. Complexity routes models and triggers decomposition. Nobody estimates hours, because the workers do not bill by the hour and the calendar is not the constraint anymore. Human review capacity is.

**Use every subscription you pay for.** Tasks can be routed to Codex, with a Claude agent supervising: it hands the spec to a headless Codex run, reviews the diff, and owns the commit. When Codex hits a rate limit mid-run, the supervisor implements the task itself and logs the fallback. Two subscriptions, one pipeline, zero drama.

**HTML beats markdown for staying in the loop.** Another Thariq lesson. Progress reports I actually read are not walls of markdown. The dashboard is a single HTML page with a Kanban of every task, a trajectory timeline showing what each review found and fixed, and the decisions feed. I check it from my phone the way other people check a delivery tracker.

## What a week looks like now

Sunday night: an hour of discovery and planning with the best model, approve the plan, launch, close the laptop. Overnight: agents implement, reviewers audit and repair, the completion gate re-runs the checks until the build is green, a docs agent trues up the README. Monday morning: a push notification, a dashboard, a completion report, and a draft PR. Monday afternoon: an engineer follows the verification guide, tests the product like a human, pushes their own fixes, flips the PR from draft to ready, and merges. That flip is the human signature on the whole thing.

The honest caveat: none of this survives a bad plan. The quality of the research and the task specs dominates every downstream outcome, which is exactly why the human architect is not going anywhere. Autosprint does not replace my engineers either. It hands them better-prepared work, with the thinking attached.

## Try it

The skill is open source in my cc-guide repo. Install it in any project:

```bash
npx skills add AnsarUllahAnasZ360/cc-guide --skill autosprint -a claude-code -g -y
```

Then start with something small: one epic, three tasks, a problem you already understand. Let the first run teach you how your codebase and the protocol get along, and size up from there.

Credit where it is due: much of the thinking here stands on the Claude Code team's writing, especially Thariq Shihipar's posts on [dynamic workflows](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code), [finding your unknowns](https://x.com/trq212/article/2073100352921215386), [session management and the 1M context](https://claude.com/blog/using-claude-code-session-management-and-1m-context), and [HTML as an output format](https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html).

Field notes from the work. More as I learn.
