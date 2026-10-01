---
name: model-routing
description: >
  Pick the cheapest model tier that does a piece of work well, from rules in
  .factory/routing.json, and settle disputes about tiers with a best-of-k
  eval instead of opinion. Use when starting any task in a repo with
  .factory/, before handing work to a subagent, when a run is getting
  expensive, when asked "which model should do this", or when a new model
  ships and the routing may be stale.
license: MIT
compatibility: >
  Node.js 18+, no dependencies. Applying a tier depends on the harness: Claude
  Code subagent models, Codex profiles, Cursor's model picker. The eval runner
  needs git worktrees and a headless agent command (for example claude -p or
  codex exec); it spends real tokens.
metadata:
  author: software-factory
  version: "1.0"
allowed-tools: Bash(node:*) Bash(git worktree *)
---

# Model routing

Running every job on the strongest model is the most common way a factory
gets too expensive to keep running. Triage, labeling, doc fixes, and small CI
repairs do not need a frontier model. Specs and ambiguous calls do. Routing
makes that decision explicit, records it, and lets data change it.

Rules name tiers (`fast`, `balanced`, `frontier`), never model IDs. Each
harness maps a tier to a model in one table, so a model release changes one
line, not every rule.

## Find the scripts

```bash
SKILL_DIR="$(dirname "$(find skills .claude/skills .agents/skills ~/.claude/skills ~/.agents/skills ~/.claude/plugins \
  -name SKILL.md -path '*model-routing*' 2>/dev/null | head -1)")"
```

## Route a task

```bash
node "$SKILL_DIR/scripts/route.mjs" --beat build --class ci-fix --size small
# tier fast, model haiku, rule chore-small
# ledger flags: --tier fast --model haiku --rule chore-small
```

Pass the printed flags to `run-ledger start`, so every run records which
rule sent it where. That is the data the loop learns from.

The first matching rule wins, and no match means `default`. A rule matches
when every key it names (`beat`, `class`, `size`) equals the task's value,
or is in its list.

## Default split

| Work | Tier |
|---|---|
| Triage, labels, dedupe, monitoring checks | fast |
| Docs, small chores, small CI fixes, mechanical sweeps | fast |
| Implementation slices, test-and-fix loops, PR follow-up, browser checks | balanced |
| Specs, architecture, ambiguity calls, final review of subagent work | frontier |
| Large or migration work | frontier |

## Applying the tier

The session you are in is usually on one model. Routing mostly decides what
you hand off:

- **Keep on the main thread:** planning, ambiguity calls, reviewing what
  subagents return, and talking to the person.
- **Hand to a cheaper subagent:** each implementation slice, the test-fix
  loop, PR babysitting, browser verification, and mechanical multi-file edits
  (one subagent per disjoint set of files).

How to set the model per harness:

| Harness | How |
|---|---|
| Claude Code | Subagent `model` field (`haiku`, `sonnet`, `opus`), or `claude --model` for headless runs |
| Codex | A profile per tier in `~/.codex/config.toml`, then `codex --profile <tier>` |
| Cursor | The model picker, or the model setting of the background agent |
| CI workflows | A repository variable per tier, read by the agent step |

When the harness cannot switch models, record the tier anyway. The ledger
then shows what routing would have saved, which is an argument for a harness
that can.

## Settle it with an eval

When someone thinks a rule is wrong ("haiku keeps botching CI fixes"),
measure instead of arguing:

1. Write 5 to 10 real, small tasks of that class into
   `.factory/evals/<class>/`, one markdown file each. The body is the prompt,
   and the frontmatter has a `check:` command that exits 0 on success:
   ```markdown
   ---
   check: npm test -- tests/parser.test.js
   setup: npm ci
   ---
   The parser drops the last row when the CSV has no trailing newline. Fix it.
   ```
   Past issues with known fixes make the best tasks.
2. Dry-run to see the plan and the cost:
   ```bash
   node "$SKILL_DIR/scripts/route-eval.mjs" --tasks .factory/evals/ci-fix \
     --tiers fast,balanced --k 3 --dry-run \
     --agent-cmd "claude -p --model {model} --permission-mode acceptEdits < {prompt_file}"
   ```
3. Run it with a cap: add `--budget-tokens 2000000`. Each attempt runs in its
   own throwaway worktree, so attempts cannot see each other's work.
4. Read the result table and the recommendation: the cheapest tier whose pass
   rate is within `--margin` (default 10 points) of the best one.

The result file lands in `.factory/evals/<date>-<class>.json`. The script
never edits `routing.json`. Changing a rule is a PR: edit the rule, add the
result file under `evidence` for that rule id, and put the table in the PR
body. The `routing-change` gate means a human merges it.

Evals cost real money. Never run them in CI on every push. Run them by hand,
or from a manual workflow, with a budget.

## Do not do these

- **Do not pin model IDs in rules.** Put them in `tiers`.
- **Do not route by vibes.** A rule change without an eval file or ledger
  numbers behind it is a guess. Say so in the PR if that is all you have.
- **Do not route the main thread's review work down.** A cheap model
  checking a cheap model's work compounds the misses.
