# Codex lane — routing tasks to GPT models

Tasks with `engine: "codex"` are implemented by OpenAI's Codex CLI while a Claude agent supervises. The point is capacity: an operator with both a Claude subscription and a ChatGPT subscription can burn both rate limits in one sprint. The division of labor stays fixed — Claude plans, reviews, commits, and reports; Codex writes code.

## How it works in the executor

The implementer agent for a codex task is still a Claude agent. It:

1. Feeds the task spec to Codex headlessly:
   ```bash
   codex exec --cd "$(git rev-parse --show-toplevel)" -s workspace-write -a never \
     -m <codex model id> -c model_reasoning_effort="<low|medium|high>" \
     -o /tmp/codex-<taskId>.md "$(cat <specPath>)"
   ```
   `-s workspace-write` uses Codex's own sandbox for containment; `-a never` means no approval prompts (this is an unattended run). The model ID and reasoning effort come from `sprint.json`'s `codex` block (per-task `codexModel` overrides it) — the operator picks these at plan time; never run on the CLI's default model, because which GPT variant burns which quota is a decision only the operator can make.
2. Reviews the diff against the spec itself, iterating with `codex exec resume --last "fix: …"` — at most two correction rounds, then it fixes the remainder directly.
3. Owns the tests, the ledger entry, the commit, and the structured report, exactly like a claude-engine task. The epic reviewer audits codex tasks identically.

## Preflight (launch mode runs this when any codex task exists)

- `codex login status` — must show the ChatGPT-subscription login. If the operator ever logged in with an API key, warn: that switches billing to API pricing instead of the subscription quota.
- One smoke run: `codex exec -s read-only --skip-git-repo-check "reply OK"`.
- **macOS sandbox conflict:** Claude Code's Bash sandbox is known to crash the Codex binary (a Seatbelt mach-lookup denial — anthropics/claude-code#42857). The executor's prompts already tell agents to retry with the sandbox disabled when this happens; confirm the session's permission settings will allow that (`dangerouslyDisableSandbox` on the Bash call, or a seatbelt allow-rule for `com.apple.SystemConfiguration.configd`). Don't nest sandboxes — Codex's own `workspace-write` sandbox is the containment layer.

If preflight fails, re-route the codex tasks to `engine: "claude"` and tell the operator, rather than launching a run that will fall back task by task.

## Routing guidance

- Codex suits well-specified, pattern-following implementation — `simple`/`standard` tasks with tight specs. Keep `complex` tasks, anything ambiguous, and all review roles on Claude: reviews are the quality gate and the supervisor pattern already gives every codex task a Claude review.
- Codex quota windows are short (rolling 5-hour + weekly caps). A sprint that routes many tasks to codex should expect mid-run limit hits — the executor's fallback (Claude implements, records the fallback as a decision) makes this survivable, but front-load the codex tasks if quota is tight.
- Alternative integration paths exist (OpenAI's official `codex-plugin-cc` plugin for Claude Code, Codex's MCP server mode). The `codex exec` subprocess pattern is what the executor uses because it is file-based, inspectable, and has no session-state coupling — but the plugin is worth having interactively for `/codex:review` second opinions on Claude-written code.
