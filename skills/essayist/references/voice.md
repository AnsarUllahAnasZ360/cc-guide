# voice

How the essay must sound. Read this in full before drafting a single sentence, and again before the final pass. The reviewer agents grade against this file.

The test for every line: *would the author say this out loud to a smart friend?* If not, rewrite it until they would.

## the aesthetic

- **mostly lowercase.** titles and headings are always lowercase. body sentences default to lowercase starts too... it reads relaxed, like the author typed it fast because the idea mattered more than the formatting. Keep correct casing where losing it hurts readability: proper nouns (Postgres, Anthropic, Karpathy), acronyms (API, RAG, CPU), code identifiers, and "I".
- **no em dashes. ever.** not `—`, not `--`. This is a hard rule with zero exceptions, and the number-one tell the author cares about. Where an em dash wants to live, use a comma, a period, parentheses, or an ellipsis instead.
- **ellipses as pause marks...** they mark a beat of thinking, a trailing thought, a "wait for it". Use them the way the author talks: a few per essay, at moments that earn a pause. More than ~4 in a piece and it becomes a tic instead of a voice.
- **contractions always.** "don't", "it's", "i've". Spelled-out forms ("do not", "it is") read like a legal notice.
- **the aesthetic is seasoning, not substance.** lowercase and ellipses read authentic only when the claims underneath are precise, cited, and specific... casual register over sloppy content just reads sloppy. The relaxed surface is earned by the rigor below it.

## the register

- **conversational, not casual-sloppy.** The register is a senior engineer explaining something over coffee: relaxed grammar, precise content. Slang is fine when the author would use it; imprecision is not.
- **first person, experience-led.** "i spent two days on this before noticing..." beats any amount of third-person authority. The essay is the author telling you what happened and what they now believe.
- **talk to one reader.** "you" throughout. Never "the reader", "one", "developers may find".
- **plain words.** use, not utilize. before, not prior to. because, not due to the fact that. If a shorter word exists and means the same thing, the longer one is wrong.
- **short sentences, varied rhythm.** Most sentences under ~20 words. Then occasionally a long one that winds through a complication the way the actual problem did, followed by a short one. Like that.
- **confident, honestly uncertain.** No hedging fog ("it could be argued that perhaps..."). When the author is sure, say it flat. When not, say so in person: "i think", "i haven't tested this past 10k rows", "someone will correct me here".

## headings

- Use headings only when the piece is long enough that a reader needs to navigate (roughly 900+ words or three-plus distinct movements). A short essay flows better as unbroken prose... Paul Graham publishes 2,000-word essays with zero headings.
- When used: plain, lowercase, descriptive. "what actually broke", "the fix", "what i'd do differently". A heading is a signpost, not a billboard.
- Never: "Introduction", "Conclusion", "Final Thoughts", numbered "Part 1:", pun headings, question headings, emoji.

## the "a real person spent time on this" signal

Specificity is the whole game. Generic text can be generated; specifics have to be lived.

- Real numbers: "took 40 minutes", "cut p99 from 800ms to 90ms", "the third attempt".
- Real names and versions: "Postgres 16", "the skills.sh CLI", "my M3 macbook".
- Real errors and dead ends: quote the actual error message, name the approach that failed and why it seemed reasonable at the time.
- Real tradeoffs: "i chose X even though Y is cleaner, because...". Showing the option you rejected proves you saw it.
- Opinions with ownership: "i think most teams get this backwards" is interesting. "some argue that..." is filler.

If a paragraph contains no specific detail, it is either setup (keep it to two sentences) or padding (delete it).

## banned patterns (AI tells)

These make text read machine-written. The style reviewer rejects any draft containing them:

- em dashes (anywhere, any form)
- "delve", "dive into", "deep dive", "explore" (as a verb for reading), "unpack", "navigate the landscape"
- "It's not just X, it's Y" and the "no X. no Y. just Z." cadence
- "In today's fast-paced world", "In the ever-evolving landscape of...", any opener about the modern era
- "game-changer", "revolutionize", "unlock", "supercharge", "seamless", "robust" (unless describing actual robustness with evidence), "leverage" (as a verb)
- rule-of-three lists in every other sentence ("fast, simple, and reliable")
- the bold-term-colon pattern repeated as a list ("**Speed:** it is fast. **Safety:** it is safe.")
- every paragraph the same length; a wall of 3-sentence paragraphs is a fingerprint
- section-closing summaries that repeat what was just said
- rhetorical questions as transitions ("So what does this mean for you?")
- exclamation marks doing enthusiasm the content should be doing
- hedged both-sides-ism ("there are pros and cons to consider") in place of a position

## personalization sourcing

The essay must be built from the author's actual material, never invented biography:

- The braindump is primary. Every story, opinion, number, and dead end mentioned goes on the shortlist to use.
- Persistent memory, CLAUDE.md, previous conversations, and past essays in the project are secondary sources for the author's real projects, stack, opinions, and recurring phrases.
- **Never fabricate an experience.** No invented anecdotes, no "i remember when...", no fictional colleagues, no made-up metrics. If the essay needs a story the author didn't supply, either ask, or leave an explicit slot: `[your story about the first time this bit you... 2-3 sentences]`.

## voice profile

A per-author calibration file lives at `writing/voice-profile.md` in the project (create it on first run). It records: platforms they publish on, their default length, casing preference (full-lowercase vs sentence-case), pet phrases, topics and stack, links to past writing, and every correction they have made to previous drafts. Read it before drafting; append to it after any session where the author corrected the voice. Corrections in that file outrank the defaults in this one.
