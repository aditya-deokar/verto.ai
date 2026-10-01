# Proposal template

Save as `.factory/proposals/<YYYY-MM-DD>-<key>.md` and commit it in the same PR
as the change it proposes. The frontmatter is validated by
`factory-setup`'s `check-factory.mjs`.

```markdown
---
key: false-done
target: test-evidence
status: open
date: 2026-10-12
window: 14d
baseline: 5
target_count: 1
pr: null
---

# test-evidence: <one-line summary of the change>

## Signal

- `false-done`: 5 this window, 1 the window before (friction report, 2026-10-12).
- Ledger: 4 corrections on the `prove` beat across runs <id>, <id>.
- Samples:
  - "you said it was fixed but the settings page still 500s" (<ref if any>)
  - "still broken after the last push"

## Diagnosis

Which part of the skill failed, and why the existing text did not prevent
it. Quote the lines. If the skill already says the right thing, say so: the
fix is a mechanism, not more text.

## Change

The diff in words, plus the diff itself in the PR. One skill, the smallest
change that addresses the diagnosis. List any prose this replaces and delete
it in the same PR.

## Expected movement

`false-done` from 5 to at most 1 per 14 days, measured by the friction
report two windows after merge.

## Rollback

Revert this PR. Nothing else depends on it.
```

Status moves `open` → `merged` or `closed` when the PR resolves, and
`merged` → `reverted` if the follow-up shows it did not help. Update the
status in the proposal file; the loop reads it for cooldowns and follow-ups.
