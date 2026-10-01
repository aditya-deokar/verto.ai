# Product spec template

Copy into `specs/<slug>.md`. Delete any section that genuinely does not apply,
and say in one line why rather than leaving it empty.

```markdown
# <Title>

Issue: #<n> · Status: draft | approved · Author: <agent/run id>

## Open questions

1. <Question>? Recommended: <answer>, because <one line>.
2. ...

## Problem

Who hits this, in what situation, and what it costs them today. Two to four
sentences. Quote the reporter if their words are clearer than yours.

## Users and situations

- <User type>: <the situation where this matters to them>

## Invariants

What must stay true no matter how this is built. These are the rules a
future change must not break.

- <e.g. A draft is never visible to anyone but its author.>

## Behavior

What a user sees and can do when this ships, step by step. Include the
unhappy paths: empty states, errors, permission denied, slow network.

## Non-goals

What this deliberately does not do, so review does not drift into it.

## Acceptance checks

Each one observable, so `test-evidence` can prove it with an artifact.

| # | Check | Evidence type |
|---|---|---|
| 1 | Saving with an empty title shows "Title is required" and keeps the form contents | recording |
| 2 | A draft URL opened by another user returns 404 | output-pair |
```

Notes:

- Invariants are the most reusable part. When one is new and durable, add it
  to the repo's `AGENTS.md` invariants after approval, or save it with
  `agent-memory` as a `decision`.
- "Evidence type" uses the ledger's names: `recording`, `screenshots`,
  `visual-diff`, `output-pair`, `measurement`, `query`, `log`, `test-suite`.
