# craft

How the essay is built: structure, story, length. Distilled from studying the writers who do this best (Paul Graham, Julia Evans, Dan Luu, Simon Willison, swyx, Gergely Orosz, Karpathy) plus the engagement data from Medium, Substack, and X. Sources are linked so claims here can be re-verified.

One meta-finding frames everything: Dan Luu [surveyed the top programming blogs](https://danluu.com/writing-non-advice/) and found they share almost **no surface style**... plain-text walls, hand-drawn comics, 300-word aphorisms, and 10,000-word data dumps all work. What they share is underneath: surprise, struggle, concreteness, citation. So this file encodes the underlying moves as rules, and leaves the aesthetics to voice.md.

## before structure: is there anything to say?

Paul Graham's [usefulness formula](https://paulgraham.com/useful.html): importance × novelty × correctness × strength. The essay must tell the reader something true that they didn't already know... style cannot rescue an empty piece.

The bar is lower than it feels, though. Julia Evans's [rule](https://jvns.ca/blog/2023/06/05/some-blogging-myths/): you need **1-2 interesting things the reader doesn't know**, not originality, expertise, or comprehensiveness. "i just learned this" is a valid genre (Simon Willison has published [hundreds of TILs](https://simonwillison.net/2022/Nov/6/what-to-blog-about/)). And Dan Luu found his most impactful posts said "obvious" things nobody had bothered writing down. If the braindump contains one real surprise or one lived struggle, there's an essay in it.

Start from the author's **specific irritation or confusion**, not from "the topic". "things i wish i'd known before X" beats "an overview of X" every time.

## the shape: a story spine, not a topic outline

Write for **one specific person**: a coworker, or the author from six months ago ([Evans](https://jvns.ca/blog/2023/06/05/some-blogging-myths/), [swyx's learn-in-public](https://swyx.io/learn-in-public)... "make the thing you wish you had found"). Then walk that person along the author's path:

1. **hook**: open at the moment of tension... the weird benchmark number, the 2am pager, the claim the author no longer believes. Never open with history, definitions, or "in this post i will".
2. **context**: only what the reader needs to feel the stakes, fed in as needed, not front-loaded.
3. **struggle**: what was tried, what failed, why each failure seemed reasonable at the time. This is the section writers cut and readers value most... the dead ends are where the transferable reasoning lives. "we used Postgres" teaches nothing; "we tried Mongo, hit X, measured Y, switched" teaches everything.
4. **the turn**: the insight, and specifically what made it click. One turn per essay; two ideas tangled together means two essays.
5. **landing**: the earned takeaway, the thing the author will do differently, or the question the work opened. Never a recap, never "in conclusion".

Framing shaky ground as personal story is also correctness armor (Evans): nobody can well-actually "here's what happened to me". And digressions that would break the spine go to **footnotes**, the PG/Luu move that keeps the argument clean while preserving the nerd-candy.

## story techniques

- **one load-bearing analogy per hard concept, and show where it breaks.** Karpathy's signature: map the mechanism onto something familiar, use it for intuition, then mark its limits... an analogy with unmarked limits becomes the reader's misconception.
- **example before abstraction.** Show one concrete case fully, then generalize. Never open with the framework.
- **replace adjectives with data.** Amazon [treats adjectives as bugs](https://slab.com/blog/jeff-bezos-writing-management-strategy/): not "much faster"... "p99 went from 800ms to 90ms". Weasel words ("most users", "significantly", "soon") are banned.
- **the changed mind.** "i thought X, then Y happened" is the most trustworthy structure in technical writing because it proves contact with reality.

## length: density is fixed, length is variable

[Medium's own data](https://medium.com/data-lab/the-optimal-post-is-7-minutes-74b9f41509b) says engagement peaks at a **7-minute read, ~1,600 words**... with the counterintuitive detail that images count toward read time, so a figure-rich "7-minute" piece is closer to 1,000–1,200 words of text. Substack analysis lands on [1,200–1,800 words](https://writebuildscale.substack.com/p/i-analyzed-94391-substack-posts-heres) as the safe default. But every source adds the same caveat: write as long as the point needs, no longer. A reader quits at the first padded paragraph, not at a word count.

| piece | target | notes |
|---|---|---|
| X/Twitter long-form | 500–1,200 words | phone, in-feed; one idea; no headings; sentences ≤15 words; the hook is half the writing effort |
| standard essay / blog / Medium | 1,000–1,800 words | the 7-minute sweet spot, less text if figure-heavy |
| newsletter | 1,200–1,800 words | go easy on images... they trip spam filters; text-only newsletters routinely win in email |
| deep dive | 2,500–4,000+ words | only when the receipts justify it (Dan Luu territory); needs headings and figures |

Sanity checks: every ~300 words should deliver a new specific (a number, an example, a figure, a turn). Under ~700 words, it's probably an X post, not an essay. Over 2,000, either the depth is real or two essays are tangled.

Figures pace reading too: [BuzzSumo's analysis of 1M+ articles](https://buzzsumo.com/blog/how-to-massively-boost-your-blog-traffic-with-these-5-awesome-image-stats/) found an image every 75–100 words correlated with ~2x shares. Treat that as a readability rhythm (a visual artifact... figure, code block, quote... every few paragraphs), never a quota.

## the rewrite loop

Graham's process, and the step that separates published-quality from draft-quality ([write like you talk](https://paulgraham.com/talk.html)):

- draft loose and fast, then edit tight over multiple passes. Each pass hunts exactly two flaws: **boring** and **unconvincing**.
- the read-aloud test on every sentence: "is this the way i'd say it to a friend?" If not, replace it with what the author would actually say. PG claims this alone beats 95% of writers.
- cut anything you would skip as a reader. "Clutter is the disease" ([Zinsser](https://tylerdevries.com/book-summaries/on-writing-well/))... ask of every word whether it's doing new work.
- strength calibration ([useful writing](https://paulgraham.com/useful.html)): say what you're sure of flat, with no hedge. Qualify only genuine uncertainty, in person ("i think", "my understanding is"). Dan Luu found unhedged writing measurably gets more readers... but chooses honesty anyway, and so does this skill: plain where sure, explicitly unsure where not, never hedge-as-filler.

## per-platform notes

- **X long-form**: one idea per line, blank lines as rhythm, dense paragraphs die on mobile. Spend disproportionate time on the first line... hook shapes that work: the number promise, the contrarian take with receipts, "i was wrong about X".
- **blog/Medium**: subheads only past ~900 words, roughly every 250–300 words when used.
- **newsletter**: subject line = the hook; figures become links or get cut.

## titles

Lowercase, specific, honest... the title is a promise the essay must keep.

- good: "what i learned migrating 40 services off cron", "the retry queue was the whole problem", "you probably don't need a vector database"
- bad: "Unlocking the Power of Queues", "Ultimate Guide to...", listicle numbers, colon-subtitles restating the title.

Offer 2-3 options at delivery; the author picks. Titles are personal.
