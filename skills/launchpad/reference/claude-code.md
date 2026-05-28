# Claude Code — authoring goals & workflows

> Every capability here is an officially documented Claude Code feature. Author only these. Doc URLs at the bottom.

## Goal mode (`/goal`) — official
- **What:** a session-scoped automation mode. You set a completion condition (e.g. "all tests pass"); after each turn a fast evaluator (default Haiku) checks whether the condition holds by reading Claude's output. If false, Claude runs another turn with the reason as context. The goal clears automatically when the condition is met, and per-turn approval prompts are removed for the duration.
- **Requires:** Claude Code v2.1.139+.
- **Use for:** substantial work with a verifiable end state — migrations, design implementations, issue backlogs, test fixes.
- **vs other automation:** `/loop` reruns on a time interval; `/goal` reruns when the previous turn finishes. Auto mode approves tool calls within a turn; `/goal` removes per-turn prompts entirely.
- **How to author it well:** make the completion condition concrete and machine-checkable. "Every test in `apps/web` passes and `pnpm typecheck` is clean" beats "the feature works." The evaluator only sees the conversation, so the run must surface evidence (command output, file/grep checks) each turn or the condition can't be judged.

## Dynamic Workflows — official (research preview)
- **What:** Claude writes a JavaScript orchestration script that coordinates many sub-agents in the background while your session stays responsive. The runtime executes the script deterministically; intermediate results stay in script variables (not the conversation); each agent gets isolated context; the run is resumable within the session.
- **Requires:** v2.1.154+ and a paid plan or the Anthropic API.
- **Use for:** tasks that outgrow a few sub-agents in one turn — codebase audits, 500-file migrations, cross-checked research, plans drafted from multiple angles. Scales to dozens–hundreds of agents.
- **How to trigger:** include the word `workflow` in the prompt, or set `/effort ultracode` to auto-plan workflows for substantive tasks.
- **vs goal mode:** a goal keeps the SAME Claude looping turn-by-turn to a condition (one conversation). A workflow runs MANY agents across parallel phases, orchestrated by code, in the background.
- **Bundled:** `/deep-research` (web search → cross-check → cite sources).

## Sub-agents & multi-agent — official
- **Subagents** (`/agents`, or files in `~/.claude/agents/` user-level / `.claude/agents/` project-level): run in their own context window and return a summary. Each has a description, system prompt, tool allowlist, and optional model override. Claude spawns them based on description matching. Use to isolate a side task and protect the main context.
- **Agent View** (`claude agents`): dispatch independent background sessions and monitor them from one screen. Use for independent parallel tasks you want as a dashboard, not a conversation.
- **Agent Teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, experimental, opt-in): multiple sessions sharing a task list + inter-agent messaging; Claude plans, assigns, and supervises.
- **Dynamic Workflows:** the scale option above (16–1000 agents).

## Context & persistence — official
- **CLAUDE.md** (project root or `~/.claude/…`): persistent rules, conventions, vocabulary; loads at session start (first ~25KB). Put locked instructions here so compaction cannot lose them.
- **Auto memory (MEMORY.md):** Claude auto-saves learnings; first ~25KB loads per session.
- **`/context`** shows what is using context; **`/compact focus=…`** controls what is preserved during compaction.

## When authoring for Claude Code, choose:
- Verifiable single objective, one thread → **`/goal`** with a concrete, machine-checkable completion condition + a read-first CLAUDE.md.
- Many parallel agents / large fan-out → **Dynamic Workflows** (say "workflow" or set `/effort ultracode`).
- A few bounded side investigations → in-conversation **subagents**.

## Sources
- Goal mode: https://code.claude.com/docs/en/goal.md
- Dynamic Workflows: https://code.claude.com/docs/en/workflows.md
- Sub-agents: https://code.claude.com/docs/en/sub-agents.md · Agents: https://code.claude.com/docs/en/agents.md
- How Claude Code works: https://code.claude.com/docs/en/how-claude-code-works.md · Memory: https://code.claude.com/docs/en/memory.md
