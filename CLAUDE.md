# Prescription Spanish — Reading App

A personal-study Spanish reader: short stories/dialogues with click-to-reveal
English translations, at the line level and (sparingly) the word level. This is
a **reading practice tool, not a quiz/flashcard app** — no gamification, ever.

## Constraints (don't relitigate these)

- **No framework, no build step, no bundler, no backend.** Plain HTML/CSS/JS only.
- **No dev server tooling.** The user previews locally with VS Code's Live Server
  extension themselves — never suggest `npm start`, Vite, webpack-dev-server, etc.
- Design priorities: reading comfort (large font, generous line-height, high
  contrast, comfortable measure) and calm/uncluttered visuals (no streaks,
  badges, progress bars, bright primary colors). It should sit comfortably next
  to soft, rounded, cartoon-ish hand-drawn illustrations, not clash with them.

## Three-layer content pipeline (keep these separate — don't collapse them)

1. **`/source/*.txt`** — hand-authored plain text, one file per story. Format:
   ```
   title: <string>
   domain: <string, e.g. general | clinical>
   level: <string, e.g. A2 | B1 | B2>
   image: <optional path/URL, may be blank>
   ---

   [Speaker: ]Spanish sentence with optional {phrase|translation} tags. :: Full English translation of the line.
   ```
   - Header fields are `key: value` lines, explicitly terminated by a line
     containing just `---`. (A stray blank line inside the header is harmless —
     only `---` ends it, which is why this replaced the earlier
     blank-line-ends-header rule.) If no `---` line is found anywhere in the
     file, the splitter reports "No "---" separator found to end header." and
     stops rather than guessing.
   - Body: one line per sentence, starting after `---` (blank lines there are
     skipped). Split on the **first** literal `::` (Spanish side never contains
     a literal `::`).
   - An optional `Speaker: ` prefix at the start of the Spanish side marks a
     dialogue line; its absence means narration.
   - `{spanish phrase|english translation}` marks a word or phrase for
     word-level click-to-reveal. Used sparingly — only genuinely difficult
     vocabulary, not every word.

2. **`/content/<slug>.json`** — generated per-story output. Produced by
   `/tools/splitter.html`, **not hand-edited**. Shape:
   ```json
   {
     "title": "...", "domain": "...", "level": "...", "image": "",
     "lines": [
       {
         "speaker": null,
         "translation": "Full English sentence (sibling of words, not nested in them).",
         "words": [
           { "leading": "", "text": "El", "trailing": "", "translation": null },
           { "leading": "", "text": "taquicardia", "trailing": ".", "translation": "rapid heartbeat" }
         ]
       }
     ]
   }
   ```
   - `leading`/`trailing` hold punctuation (`¿¡"'“(«` / `.,;:!?"'”)»…`) split off
     each token so words can be rejoined with correct spacing.
   - A bracketed multi-word phrase becomes **one** word token (its `text` may
     contain a space) rather than being split further.
   - Case in `text` is preserved exactly as typed — never lowercased.

3. **`/content/index.json`** — manifest, one entry per story:
   `{ "entries": [{ "title", "domain", "level", "image", "file" }] }`.
   The reader loads this first to know what content exists. `tools/splitter.html`
   outputs an entry for this file as copyable text (it has no filesystem access
   to write it directly — the user pastes it in).

## `/tools/splitter.html`

Standalone, single-file HTML+JS converter (paste source text in, copy story
JSON + manifest entry out). Core parsing logic: header parse → per-line `::`
split → speaker regex (`^([\p{L}][\p{L} .'-]{0,39}):\s(.*)$`, unicode-aware) →
bracket-phrase extraction (`\{([^|}]+)\|([^}]+)\}`) → whitespace tokenize →
leading/trailing punctuation strip. If you change this logic, the same
transformation is duplicated nowhere else — it's the single source of truth for
source → JSON conversion.

## `/reader/` app

Plain JS, no dependencies. `app.js` does hash-based routing (`#/` = library,
`#/story/<file>` = story view) fetching `../content/index.json` and
`../content/<file>.json` directly via `fetch`. Reveal interactions use a
`display:none` → `display:block` → next-frame `.visible` class flip so opacity
can actually transition (a pure CSS rule can't animate from `display:none`).

Domain theming is CSS custom properties keyed off `[data-domain="..."]` on the
story container (`reader/style.css`) — clinical is blue/gray, general is dark
green/soft tan, applied narrowly (chips, accents) not as full-page theming.
Adding a new domain later is just one more `[data-domain="..."]` block; the
library view's filter tabs are derived from whatever domains appear in the
manifest, no code change needed there.

## Current scope / what's intentionally NOT built yet

No user accounts, no progress tracking/persistence, no real header images (user
is illustrating these themselves later), no quizzes/fill-in-the-blank/flashcards.
Only one hand-verified test entry exists (`source/dialogue-test.txt` →
`content/dialogue-test.json`); the user plans to author 10-20 real source files
once this pipeline is validated in daily use.

## Verifying changes

No test suite. Sanity-check with:
```
node -e "JSON.parse(require('fs').readFileSync('content/index.json'))"
node --check reader/app.js
```
For anything touching the splitter's parsing logic, the safest check is
extracting its `<script>` body and running `parseSource()` against
`source/dialogue-test.txt` in Node, diffing against `content/dialogue-test.json`
— that's how the current splitter logic was validated (no browser automation is
available in this environment). Visual/interaction verification (fade timing,
colors, popover placement) is the user's job via Live Server — don't start a
dev server to do this yourself.
