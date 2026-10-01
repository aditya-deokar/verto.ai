---
name: spec-writing
description: >
  Write a product spec and a tech spec before building anything ambiguous,
  cross-cutting, or visible to users, and get a human to approve them before
  code starts. Use when triage says "spec", when a request has more than one
  reasonable design, when a change touches data shape, public APIs, or
  migrations, when asked to "write a spec", "plan this feature", or "design
  this", or when an earlier attempt was rejected as "not what I asked for".
license: MIT
compatibility: >
  Plain markdown, any harness. Opening the spec as a PR needs git and an
  authenticated gh CLI. Records approval in run-ledger when the repo has
  .factory/.
metadata:
  author: software-factory
  version: "1.0"
  signals: "[misread-intent]"
allowed-tools: Bash(git:*) Bash(gh pr *) Bash(gh issue *) Bash(node:*)
---

# Spec writing

A spec is the cheapest place to be wrong. A misread requirement caught in a
two-page document costs a comment. The same misread caught in review costs
the whole implementation. Write one when the task is ambiguous, not when it
is merely large and obvious.

Default tier: `frontier`. Ambiguity calls are where a stronger model earns
its cost.

## Two documents, two questions

| | Product spec | Tech spec |
|---|---|---|
| Answers | What must be true for users when this is done? | What shape will the code take to make it true? |
| Written for | Whoever owns the product decision | Whoever reviews the code |
| Changes when | The goal changes | The design changes |
| Template | [references/product-spec.md](references/product-spec.md) | [references/tech-spec.md](references/tech-spec.md) |

Keep them apart. A product spec that names files will be ignored by the
person deciding the product question. A tech spec that re-argues the goal
buries the design.

For a small ambiguous change, one file with both halves is fine. Keep the
headings.

## Procedure

1. **Read the issue, the relevant code, and memory.** Search `agent-memory`
   for decisions already made in this area. A spec that contradicts a
   recorded decision without saying so will be rejected.
2. **Write the product spec first.** Its acceptance checks are what
   `test-evidence` will prove later, so write each one as something a
   reviewer can check: "Saving with an empty title shows 'Title is required'
   and keeps the form contents", not "validation works".
3. **Write the tech spec against the product spec.** Every acceptance check
   maps to a place in the design. Use `service-layer` vocabulary: what the
   boundary decides, what the service does.
4. **Name the alternatives you rejected** and why, in two or three lines
   each. This is the part reviewers read most closely, and leaving it out
   invites the same debate in code review.
5. **Put open questions at the top** of the product spec, numbered, each
   with your recommended answer. A reviewer should be able to reply "1 yes,
   2 no, 3 your call" and unblock you.
6. **Open it for review** (below). Then stop. Do not start building in
   parallel "to save time". Building before approval turns the review into
   a rubber stamp.

## Where the spec lives

Files, reviewed as a PR, so the spec is versioned next to the code it
describes:

```bash
git switch -c spec/<slug>           # inside your task worktree
mkdir -p specs && $EDITOR specs/<slug>.md
git add specs/<slug>.md && git commit -m "spec: <title>"
git push -u origin spec/<slug>
gh pr create --title "Spec: <title>" --body "Spec for #<issue>. Open questions are at the top." --label factory:spec
gh issue comment <issue> --body "Spec up for review: <PR URL>"
```

If the repo does not keep specs in git, post the spec as an issue comment
instead and say so in the run record.

## The approval gate

The spec is approved when a human says so: a PR approval, a merge, or an
explicit "approved" comment. Silence is not approval, and neither is a
thumbs-up on an unrelated comment.

Record it (`$LEDGER` is resolved as shown in `run-ledger`):

```bash
node "$LEDGER" beat current spec --set path=specs/<slug>.md --set approved=true
node "$LEDGER" touch current --beat spec --kind approval --ref <approval URL>
```

Each requested change is a `correction` touch. Revise the spec, not the
code. Once approved, build on a fresh task branch per `worktree-isolation`
and link the spec in the implementation PR.

When the implementation has to deviate from the approved spec, update the
spec in the same PR and say what changed and why. A spec that no longer
matches the code is worse than none.

## Do not do these

- **Do not write a spec for an unambiguous change.** If triage said
  `implement`, the spec is overhead.
- **Do not pad.** A spec is as long as its decisions. Two pages is typical;
  ten pages usually means two specs.
- **Do not leave acceptance checks untestable.** "Fast", "intuitive", and
  "robust" cannot be proved. Give a number or an observable behavior.
- **Do not bury the open questions.** If the reviewer has to hunt for what
  you need from them, you will wait longer for the answer.
