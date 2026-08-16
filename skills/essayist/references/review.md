# the review gauntlet

No draft ships on the writer's own judgment. The writer has been staring at the piece too long to see it fresh, so after the draft and figures are done, launch **three reviewer agents in parallel** (one message, three Task/Agent calls, so they run concurrently). Each gets the full draft, a specific lens, and no knowledge of the others.

Sequence: draft complete → 3 agents in parallel → merge findings → apply fixes → one final voice pass → deliver.

## agent 1: the fact checker

Gets: the draft, the claims ledger (every factual claim with its status and source), and WebSearch/WebFetch access.

Prompt it to:
- Extract every checkable claim from the draft independently (don't trust the ledger to be complete... the drafting pass may have introduced new claims).
- Verify each against a primary source: official docs, the original paper or announcement, the actual changelog. A blog post citing a blog post is not verification.
- Check every citation link: does it load, and does it actually support the sentence it's attached to?
- Check dates and versions: is this still true in the current version? "true in 2023" is a finding, not a pass.
- Return a table: claim → verdict (`verified` / `unsupported` / `contradicted` / `outdated`) → source URL → suggested fix.

## agent 2: the voice reviewer

Gets: the draft, `references/voice.md`, and the author's `writing/voice-profile.md` if it exists.

Prompt it to:
- Scan for every banned pattern in voice.md (em dashes first... a single one fails the review).
- Read each paragraph asking "would a human who lived this write this sentence?" and flag anything that smells generated: uniform paragraph rhythm, summary sentences, hedge fog, enthusiasm punctuation.
- Check the specificity budget: does every section contain at least one concrete detail (number, name, error, date)? Flag paragraphs running on pure abstraction.
- Verify the personal material is real: every anecdote and metric must trace back to the braindump, the author's memory files, or an explicit `[slot]`. An anecdote with no source is a fabrication and a hard fail.
- Return line-level edits, not vibes: quote the offending line, give the rewrite.

## agent 3: the cold reader

Gets: the draft and one line describing the target reader (e.g. "mid-level engineer who has heard of RAG but never built one"). Deliberately does NOT get the braindump or the research notes... it must experience the essay the way a stranger will.

Prompt it to:
- Read start to finish and report where it got confused, where it got bored, and where it stopped trusting the author. Boredom locations are the most valuable finding.
- Check the opening: do the first three sentences make you want the fourth? Would you keep reading past the first screen on your phone?
- Check each figure: does it clarify the nearby prose, or restate it? Could it stand alone if shared as an image?
- Check the ending: does it land on an earned takeaway, or fade into summary?
- Answer honestly: "did this feel like a person explaining something they lived, or content?" and say why.
- Report length verdict: too thin (claims without support), right, or padded (mark cuttable passages by quote).

## merging findings

- **Fix silently**: mechanical voice violations, broken links, confirmed typos, cuts the cold reader justified.
- **Fix and flag in the handoff note**: contradicted or outdated facts (show the author what changed and the source... they said the original thing, so they need to know it was wrong, not just have it vanish).
- **Flag without fixing**: anything where the fix requires the author (a missing personal story, an unsupported opinion they may want to own anyway, a claim no source could confirm or deny). Never quietly delete the author's opinion... opinions don't need citations, only facts do.
- Disagreements between agents go to the author, framed with a recommendation.

After applying fixes, do one last top-to-bottom read purely for voice (fixes tend to arrive in reviewer-flavored prose) and smooth any seams.

A piece is done only when: zero banned patterns, zero unverified facts (verified, cited, or flagged), at least one real personal thread through it, and the cold reader called it "a person, not content".
