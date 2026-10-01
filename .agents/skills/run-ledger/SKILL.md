---
name: run-ledger
description: >
  Record every task as a run in .factory/runs/ so the factory can be measured:
  class, size, model tier, beats completed, evidence, review rounds, human
  corrections, and token cost. Use when starting any task in a repo that has
  a .factory/ directory, at the end of each beat, when a human corrects or
  approves your work, when you finish or get blocked, and when asked how the
  factory is doing ("factory report", "how many PRs", "what did that cost").
license: MIT
compatibility: >
  Node.js 18+, no dependencies. Works on Linux, macOS, and Windows. Token cost
  is read from local Claude Code (~/.claude/projects) and Codex (~/.codex/sessions)
  transcripts when they exist; other harnesses record cost as unknown, never zero.
metadata:
  author: software-factory
  version: "1.1"
allowed-tools: Bash(node:*) Bash(git:*)
---

# Run ledger

A factory you cannot measure is a factory you cannot improve. The ledger is
one JSON file per task under `.factory/runs/`, committed with the PR that did
the work. The outer loop (`skill-feedback-loop`, `model-routing`) reads these
files; nothing else produces the numbers.

Skip this skill only in a repo with no `.factory/` directory. Suggest
`factory-setup` there instead of creating the directory yourself.

## Find the script

`$SKILL_DIR` is the folder this `SKILL.md` lives in. Resolve it once; a bare
`./scripts/` resolves against the user's repo and fails.

```bash
SKILL_DIR="$(dirname "$(find skills .claude/skills .agents/skills ~/.claude/skills ~/.agents/skills ~/.claude/plugins \
  -name SKILL.md -path '*run-ledger*' 2>/dev/null | head -1)")"
LEDGER="$SKILL_DIR/scripts/ledger.mjs"
```

PowerShell:

```powershell
$LEDGER = (Get-ChildItem -Recurse -Filter ledger.mjs -Path skills,.claude\skills,.agents\skills,$HOME\.claude\skills,$HOME\.claude\plugins -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
```

Every command below is `node "$LEDGER" ...`. `current` stands for the open
run on the current branch, so after `start` you rarely need the id.

## When to write

| Moment | Command |
|---|---|
| Task starts, after isolating | `start --class bugfix --size small --title "..." --source github:issue/123 --tier balanced --model <id> --rule <rule>` |
| Triage decided | `beat current triage --set decision=implement` |
| Spec approved | `beat current spec --set path=specs/login.md --set approved=true` |
| Evidence captured | `beat current prove --add evidence=recording --set before_captured=true` |
| PR open, review done | `beat current ship --set pr=45 --set review_rounds=2 --set final_score=5/5` |
| A human corrected you | `touch current --beat build --kind correction --ref <comment URL>` |
| A human approved a gate | `touch current --beat spec --kind approval --ref <URL>` |
| Your part is done | `finish current --outcome shipped` |
| You are blocked | `finish current --outcome blocked` |
| Post-merge check ran | `release-monitoring` sets `monitor`, then `finish <id> --outcome merged` |

`--set` overwrites a field, `--add` appends to a list, and values are coerced
(`2` is a number, `true` a boolean). The script validates every write against
the schema and refuses an invalid record rather than saving a bad one.

`start` takes the tier, model, and rule from `model-routing`. If the repo has
no routing, leave them out.

## Picking class and size

Class: `bugfix`, `feature`, `refactor`, `docs`, `ci-fix`, `migration`,
`perf`, `chore`. Use `triage` for a run that only triaged, `loop` for an
outer-loop run, and `eval` for a routing eval.

Size, by the diff you expect to ship:

- `small`: one concern, a few files, no new interfaces. Most bugfixes.
- `medium`: several files or one new interface. A typical feature.
- `large`: cross-cutting, a migration, or anything that needed a spec.

Pick before you start and do not revise it to match what happened. The gap
between the guess and the result is what routing learns from.

## What counts as a human touch

Record one every time a person had to step in. These are the factory's
defects, and hiding them makes the numbers lie.

| Kind | Example |
|---|---|
| `correction` | "That's still broken." A review comment asking for a change. "Don't touch that file." |
| `approval` | Spec approved, merge approved |
| `rejection` | Spec or PR rejected outright |
| `clarification` | You asked, they answered, and the answer changed the work |
| `manual-fix` | The human edited the code themselves |

Only people count. A comment from a review bot (Greptile, Copilot, CodeRabbit)
is not a human touch; it is already counted in `ship.review_rounds`.
Recording bot findings as touches inflates the number the outer loop acts on.

Link the comment or message in `--ref` whenever there is one. A touch with a
link can be checked; a touch without one is a guess.

## In the PR body

Add one line so reviewers and the outer loop can join the PR to its record:

```markdown
Run: `2026-10-02-fix-login-redirect-3f2a` (.factory/runs/2026-10-02-fix-login-redirect-3f2a.json)
```

Commit the run file on the task branch. It merges with the change it
describes.

## Report

```bash
node "$LEDGER" report --since 14d          # markdown table
node "$LEDGER" report --since all --json   # for scripts
```

The report gives runs by outcome, class, and tier; median review rounds;
human touches per shipped run; corrections by beat; how often evidence and the
before state were captured; median tokens per shipped run; and how often
memory was used. Paste it as evidence when someone asks whether the factory is
working, instead of describing it.

`report` exits 2 when there is no `runs/` directory. That means there is no
data to report on, which is different from a clean report.

## Tokens

`finish` sums token usage from local transcripts for this repo between
`started_at` and now. Claude Code and Codex are supported. Running `finish`
again (for example when a shipped PR later merges) keeps the first count.
Pass `--no-tokens` to skip the scan.

Cost stays `null` when no transcript is found. Never fill it in by hand with
an estimate. A number that looks measured but is not is worse than a blank.

## Do not do these

- **Do not backfill a run after the fact from memory.** Start the record
  when the work starts. A reconstructed record is a guess.
- **Do not leave a run open.** Every run ends `shipped`, `merged`, `closed`,
  `blocked`, or `abandoned`. An open run is invisible to the report.
- **Do not skip touches because they are embarrassing.** The outer loop needs
  them to find which skill failed.
- **Do not edit run files by hand** except to fix a mistake, and then run
  `factory-setup`'s `check-factory.mjs` on the directory.
