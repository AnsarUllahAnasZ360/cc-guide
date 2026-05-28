# Antigravity — authoring goals

> Antigravity (the Gemini-powered agentic IDE) has a real Agent Manager + async sub-agents. Its public docs are an in-browser SPA, so this card separates DOCUMENTED features from COMMUNITY SPECULATION — author only the documented ones, and keep the speculative ones best-effort. Doc URLs at the bottom.

## Goal mode / Agent Manager — documented
- The **Agent Manager** ("Manager Surface") is the primary surface: "spawn, orchestrate, and observe multiple agents working asynchronously across different workspaces."
- **Planning mode vs Fast mode:** Planning = "Agent can plan before executing tasks. Use for deep research, complex tasks, or collaborative work." Fast = "Agent will execute tasks directly. Use for simple tasks." → use **Planning mode** for a goal, **Fast** for interactive.
- **A goal is expressed through three sequential artifacts** (the documented structure): (1) **Task List** (structured plan before coding), (2) **Implementation Plan** (tech stack + proposed changes), (3) **Walkthrough** (summary + how to test). NOTE: a formal "Requirements + Acceptance Criteria" schema is NOT Google's terminology — it's a community/your-own layer. You can still write requirements + acceptance criteria in the prompt body; just don't assume the app enforces that schema.

## Async sub-agents — documented
- The orchestrator "can define and spawn specialized sub-agents on the fly to tackle focused subtasks in parallel… with isolated context windows," running in the background without blocking the main agent. Dynamic self-spawning IS documented.
- **Browser sub-agent** — a distinct documented agent (its own model) for browser control: click, scroll, type, read console, capture DOM, screenshots, video. Use it for UI verification.
- **Documented roles = orchestrator + browser sub-agent only.**

## Artifacts, Knowledge, verification — documented
- **Artifacts** are the core progress + steering mechanism: task lists, implementation plans, screenshots, browser recordings. You can comment on an artifact "similar to commenting on a doc — and the agent will incorporate your input without stopping its execution flow." This is how you steer a running goal without halting it.
- **Knowledge base** — agents save useful context/snippets to reuse on future tasks. A reusable playbook, not per-run scratch memory.
- **Verification** — after coding, the agent starts the server, opens a browser to verify, does manual testing via the browser sub-agent, then writes a Walkthrough with a screenshot/recording.

## COMMUNITY SPECULATION — do NOT make load-bearing
- The "explorer / worker / reviewer / auditor / challenger / sentinel" role taxonomy — NOT documented (only orchestrator + browser sub-agent are).
- "Self-succeed at N spawns" (e.g. 16) and any specific self-spawn fan-out limit — NOT documented.
- Exact concurrency caps (commonly cited as 2 Free / 5 Pro / unlimited Enterprise) — secondary sources only; verify in-app.
- "CODE_ONLY network mode" — reverse-engineered, not documented.
- These may be real in a given install, but a goal must NOT depend on them to succeed. Treat them as best-effort and confirm in-app before relying on a number or role name.

## Gemini 3.x prompting (for the Antigravity executor)
- Keep **temperature at the default 1.0** — Google warns changing it "may lead to looping or degraded performance."
- Gemini 3 "favors directness over persuasion and logic over verbosity" — be concise; state goals plainly.
- Recommended planning loop: **Analyze → Decompose → Strategize → Verify.**
- Gemini 3 is terse by default — explicitly request progress narration if you want it, and add an "if data is missing, do NOT fabricate" guard.

## When authoring for Antigravity, choose:
- Complex/long objective → a **Planning-mode goal** with a clear outcome, the read-first list, the Definition of Done, and explicit async-sub-agent delegation; rely on **Artifacts** for steering and the **browser sub-agent** for verification.
- Simple task → **Fast mode** (interactive).
- Do not encode undocumented role names, spawn caps, or succession behavior as hard requirements.

## Sources
- Build with Google Antigravity (Developers Blog): https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/
- Getting Started with Google Antigravity (Codelabs): https://codelabs.developers.google.com/getting-started-google-antigravity
- Docs (in-browser SPA — open in a browser to confirm caps/roles): https://antigravity.google/docs/agent-manager · https://antigravity.google/docs/subagents · https://antigravity.google/docs/knowledge · https://antigravity.google/docs/browser-subagent
- Gemini 3 prompting guide (Google Cloud): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/gemini-3-prompting-guide
