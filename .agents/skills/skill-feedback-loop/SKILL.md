---
name: skill-feedback-loop
description: >
  The factory's outer loop. Reads where people keep correcting agents (local
  transcripts, the run ledger, human review comments on merged PRs), finds the
  skill that owns each repeated failure, and opens one small, evidence-backed
  PR to improve it for a human to review. Use when the weekly loop runs, when
  asked to "improve the skills", "run the loop", or "why do agents keep doing
  X", when a friction report shows a climbing pattern, or when a memory has
  been used often enough to graduate into a skill.
license: MIT
compatibility: >
  Node.js 18+, no dependencies. Transcript signals need local Claude Code or
  Codex transcripts (unavailable in CI; the loop runs on the other signals).
  Review-comment signals and opening the PR need an authenticated gh CLI.
metadata:
  author: software-factory
  version: "1.0"
allowed-tools: Bash(node:*) Bash(git:*) Bash(gh pr *) Bash(gh api *) Bash(gh label *)
---

# Skill feedback loop

Skills go stale. People correct agents in review comments and chat, and
unless something reads those corrections, the same mistake repeats forever.
This loop is the observer: it watches how the inner-loop skills perform and
proposes the smallest change that would have prevented the repeated
correction. A human reviews every proposal. The loop never merges.

It runs as its own task, with its own worktree and its own run record
(`--class loop`).

## Find the scripts

```bash
SKILL_DIR="$(dirname "$(find skills .claude/skills .agents/skills ~/.claude/skills ~/.agents/skills ~/.claude/plugins \
  -name SKILL.md -path '*skill-feedback-loop*' 2>/dev/null | head -1)")"
```

## 1. Collect signals

```bash
node "$SKILL_DIR/scripts/collect-signals.mjs"            # all sources, writes .factory/.cache/signals-<date>.json
node "$SKILL_DIR/scripts/friction-report.mjs" --since 14d   # just the transcript counts, with sample quotes
```

Four sources, each optional:

| Source | What it shows | Needs |
|---|---|---|
| Friction patterns | How often people typed each known correction, now vs the window before | Local transcripts |
| Run ledger | Corrections by beat, review rounds by class, runs shipped without evidence | `.factory/runs/` |
| Review comments | Human comments on merged PRs, grouped by skill or area | `gh` |
| Memory | Memories used often enough to graduate | `.factory/memory/` |

A missing source is reported as unavailable, never as zero. Transcripts stay
local: the signals file is written to the gitignored `.factory/.cache/`.

## 2. Pick one thing

The script ranks candidates and prints `Next:`. A friction key qualifies
when all of these hold:

- It reached `loop.min_occurrences` (default 2) this window. One incident is
  an anecdote.
- It is new or climbing compared with the previous window.
- Its owner has no open proposal, and no proposal merged within
  `loop.cooldown_windows` windows. A change needs time to show whether it
  worked.
- There is budget: fewer than `loop.max_open_prs` proposals are open.

If `Next:` says nothing qualifies, stop. Record the run as `closed` and
report the table. A quiet week is a result.

Before trusting a count, read its samples. Regexes misfire. If a sample
is not really that correction, the fix is to the pattern (with a new
`miss` example), not to the skill.

## 3. Diagnose before writing

Read the owning skill in full, then answer in writing:

1. **Does the skill already say the right thing?** If yes, more text will not
   help. A rule that has already been broken twice needs a mechanism: a script
   the agent runs, a check in `check-factory.mjs` or the linter, or a hook.
   Propose that, and delete the prose it replaces in the same PR.
2. **Is the trigger the problem?** If the skill never loaded when it should
   have, change the `description`, and only the description. See
   `skill-authoring`.
3. **Is it missing a case?** Add the case, in the skill's existing voice, at
   the point in the procedure where the agent would need it.

## 4. Write the proposal

Copy [references/proposal-template.md](references/proposal-template.md) to
`.factory/proposals/<date>-<key>.md`. It records the signal, diagnosis,
change, the number it should move (with the baseline), and the rollback.
Trim sample quotes to what shows the pattern. They land in git.

Then make the change and open the PR through the normal ship beat:

```bash
gh label create factory:skill-loop --color 5319E7 2>/dev/null || true
gh pr create --label factory:skill-loop --title "<skill>: <what changes>" --body-file <proposal file>
```

Run the linter (`node scripts/lint-skills.mjs` in a skills repo) and
`check-factory.mjs` before opening it.

## 5. Stop, then follow up next time

After opening the PR, stop. A human merges it or closes it. Set the proposal
`status` to match (`merged`, `closed`) when that happens.

On every later run, `collect-signals` compares each merged proposal's key
with its baseline. If the number did not drop within two windows, it flags
the proposal. Open a revert PR and say so plainly. A change that did not help
is still clutter the agent has to read.

## Rules the loop must keep

- **One skill per PR.** Two changes in one PR make it impossible to tell
  which one moved the number.
- **No key, no rule.** Every added instruction cites a friction key. If the
  failure has no key, add a pattern to `.factory/friction-patterns.json`
  first (with `match` and `miss` examples), so the change can be measured.
  Set `metadata.signals` on the skill to the keys it owns.
- **Never edit a vendored skill's body.** `code-review-loop`,
  `code-review-loop-large`, `visual-diff`, and `prose-cleanup` stay as
  upstream shipped them. When one of them owns the failure, propose an
  `AGENTS.md` note or a wrapper instead.
- **Never merge, never push to a PR you did not open,** and never open a
  second proposal for a skill that already has one open.
- **Graduation removes the memory.** When a memory moves into a skill, delete
  the memory file and rerun `memory.mjs index` in the same PR.

## Recording the run

```bash
node "$LEDGER" start --class loop --size small --title "skill loop <date>"
node "$LEDGER" finish current --outcome shipped     # or closed when nothing qualified
```
