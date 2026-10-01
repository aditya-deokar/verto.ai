---
name: agent-memory
description: >
  Keep a repo's hard-won facts (root causes, environment quirks, decisions,
  pitfalls) in .factory/memory/, each with the PR or issue it came from, so
  agents stop re-learning them. Use when starting any task in a repo with
  .factory/ (read the index), before re-deriving a root cause or debugging an
  environment problem (search first), when a person corrects you or tells you
  something twice, and at the end of a task to save what the next agent needs.
license: MIT
compatibility: >
  Node.js 18+, no dependencies, Linux, macOS, and Windows. Memory is plain
  markdown in git; any harness can read it. Links uses to run records when
  run-ledger is in use.
metadata:
  author: software-factory
  version: "1.0"
  signals: "[repeated-correction]"
allowed-tools: Bash(node:*) Bash(git:*)
---

# Agent memory

Skills hold procedures. Memory holds facts: that the macOS CI runner times
out on its first `npx` call, that the `orders` table is sharded by region,
that we decided against websockets in March and why. Without memory, an
agent that fixed a bug last week re-derives the same root cause today, and
pays for it in tokens and time.

Each memory is one file in `.factory/memory/`, with a source link, committed
with the PR that learned it. A human reviews every memory the same way they
review code, and git keeps the history.

## Find the script

```bash
SKILL_DIR="$(dirname "$(find skills .claude/skills .agents/skills ~/.claude/skills ~/.agents/skills ~/.claude/plugins \
  -name SKILL.md -path '*agent-memory*' 2>/dev/null | head -1)")"
MEM="$SKILL_DIR/scripts/memory.mjs"
```

## At the start of a task: read the index

Read `.factory/memory/INDEX.md`. It is one line per memory, so it stays
cheap. Open a memory file only when its line bears on the task. (The Claude
Code plugin's session hook prints the index for you; without it, read the
file yourself.)

## Before re-deriving anything: search

Before debugging an error, investigating a flaky test, or working out why
something is built the way it is:

```bash
node "$MEM" search "ECONNRESET" "macos runner"
```

When a memory helps, count it. The use count decides which memories graduate
into skills, and a run record without it undercounts what memory saved:

```bash
node "$MEM" use macos-npx-timeout --run current
```

Treat a memory as a lead, not a verdict. Check that it still holds before
acting on it; code moves. If it is wrong, fix it in the same PR (`add
--update`) and say so.

## At the end of a task: save what the next agent needs

Save a fact when all three are true:

1. **It cost something to learn:** a debugging session, a failed attempt, or
   a person's correction.
2. **It is not in the code, a skill, or `AGENTS.md`.** Anything a reader of
   those would already know is noise.
3. **It will matter again.** A one-off data fix does not.

```bash
node "$MEM" add --name macos-npx-timeout --type pitfall \
  --description "macOS CI times out on the first npx call; warm the cache first" \
  --source https://github.com/o/r/pull/41 --run current \
  --body "The macos-latest runner's first npx call downloads for 90s+ and trips the 60s step timeout.
Run 'npx --yes <pkg> --version' in a setup step before the real call."
```

| Type | For | Example |
|---|---|---|
| `pitfall` | A trap and how to avoid it | Symlink install fails on Windows without Developer Mode; use `--copy` |
| `fact` | How something actually behaves | The staging DB is restored from prod every Sunday at 02:00 UTC |
| `decision` | What was chosen, and why | No websockets: the proxy drops idle connections at 60s (PR #88) |
| `reference` | Where something lives | Flaky test quarantine list is in `ci/quarantine.txt` |

Rules for the text:

- **The description is the index line.** Write it with the words someone
  would search for: the error text, the component name.
- **Say how to apply it,** not only what happened.
- **Always give a source.** A PR, issue, or commit URL. A memory nobody can
  trace cannot be checked, so the script refuses one without a source.
- **One fact per memory.** If `add` warns that a new memory is similar to an
  existing one, update that one instead (`--update`).
- **Never store secrets, credentials, or customer data.** The script refuses
  known token shapes, but it cannot catch everything. Memory is in git.

Then put this in the PR body, so reviewers see what memory did:

```markdown
Memories used: macos-npx-timeout
Memories written: staging-db-restore-window
```

## When a person corrects you

A correction repeated twice means memory failed. Save the correction as a
`pitfall` or `decision` right away, with the message or comment as the
source, and record the correction as a `touch` in the ledger. The
`repeated-correction` friction pattern counts these, and the outer loop
watches that number.

## Upkeep

```bash
node "$MEM" index                       # regenerate INDEX.md; also the fix for merge conflicts in it
node "$MEM" prune --unused-days 90      # mark long-unused memories stale (never deletes)
node "$MEM" graduate --min-uses 3       # memories used often enough to belong in a skill
```

**Graduation.** A memory used three or more times is really part of a
procedure. Propose moving it into the skill that owns that procedure, or
into `AGENTS.md`, and delete the memory in the same PR. `skill-feedback-loop`
does this on its weekly pass; do it by hand when you notice one.

**Conflicts.** `INDEX.md` is generated. On a merge conflict, take either
side and run `memory.mjs index`. Never hand-merge it.

## Do not do these

- **Do not save the task log.** "Fixed the login bug by changing X" belongs
  in the commit message.
- **Do not save what a skill already says.** Improve the skill instead.
- **Do not edit memory outside a PR.** Unreviewed memory is how a wrong fact
  spreads to every future task.
