---
name: factory-setup
description: >
  Set up the software factory in a repository: the .factory/ data directory
  (config, routing rules, friction patterns, memory index), the AGENTS.md
  workflow section, and optional GitHub Actions for triage, the weekly
  improvement loop, and post-merge monitoring. Use when asked to "set up the
  factory", "install the workflow", or "bootstrap AGENTS.md" in a repo, when
  a factory skill finds no .factory/ directory, or to validate an existing
  .factory/ after editing it by hand.
license: MIT
compatibility: >
  Node.js 18+, no dependencies, Linux, macOS, and Windows. The workflow
  templates need GitHub Actions and an ANTHROPIC_API_KEY or OPENAI_API_KEY
  secret; everything else is local files.
metadata:
  author: software-factory
  version: "1.0"
allowed-tools: Bash(node:*) Bash(git:*)
---

# Factory setup

The factory's skills work in any repo, but the outer loop needs somewhere to
keep its data. This skill creates that place once and checks it afterwards.
It never overwrites a file, so it is safe to rerun.

## Find the scripts

`$SKILL_DIR` is the folder this `SKILL.md` lives in.

```bash
SKILL_DIR="$(dirname "$(find skills .claude/skills .agents/skills ~/.claude/skills ~/.agents/skills ~/.claude/plugins \
  -name SKILL.md -path '*factory-setup*' 2>/dev/null | head -1)")"
```

## Set up

Always dry-run first and show the person the plan. It is their repo.

```bash
node "$SKILL_DIR/scripts/setup.mjs" --dry-run
node "$SKILL_DIR/scripts/setup.mjs"               # .factory/ and AGENTS.md
node "$SKILL_DIR/scripts/setup.mjs" --workflows   # plus .github/workflows/factory-*.yml
```

What it creates, only where missing:

| Path | What it is |
|---|---|
| `.factory/config.json` | Switches for each beat and loop. All off gives plain v2 behavior. |
| `.factory/routing.json` | Task class to model tier rules (`model-routing`) |
| `.factory/friction-patterns.json` | The corrections the loop counts, each owned by a skill (`skill-feedback-loop`) |
| `.factory/memory/INDEX.md` | The memory index (`agent-memory`) |
| `.factory/runs/`, `proposals/`, `evals/` | Empty, filled by the ledger, the loop, and routing evals |
| `AGENTS.md` | The full workflow if the repo has none; otherwise one appended section, marked so a rerun skips it |
| `.github/workflows/factory-*.yml` | Only with `--workflows`. See below. |

Commit `.factory/` and `AGENTS.md`. The data plane is meant to live in git,
so every change to it is reviewed.

## Then fill in the repo-specific part

The script cannot know the repo's commands. Open `AGENTS.md` and fill the
repo-specific section with real values, found by reading `package.json`,
`Makefile`, `pyproject.toml`, and CI config, not guessed:

- Exact install, dev, test, typecheck, and lint commands.
- Hard invariants: what must never happen, in one line each.
- Where production problems show up (CI on the default branch, deploy
  status, an error tracker), for `release-monitoring`.
- Which gates need a human. The default is every gate in
  `config.json.human_gates`.

Ask the person for anything you cannot find. An `AGENTS.md` with placeholders
left in produces agents that guess.

If the repo's harness uses different model names, edit the `tiers` table in
`.factory/routing.json`. Leave a harness at `null` when unsure; routing
records the tier anyway.

## The workflow templates

With `--workflows`, three files land in `.github/workflows/`:

| File | Trigger | Does |
|---|---|---|
| `factory-triage.yml` | Issue opened | Runs `issue-triage` headless, labels the issue, posts the decision |
| `factory-loop.yml` | Weekly, or manual | Runs `skill-feedback-loop` and opens at most one proposal PR |
| `factory-monitor.yml` | CI fails on the default branch | Opens one `factory:regression` issue per failing workflow, no agent needed |

They assume the factory skills are committed in the repo (`npx skills add
aditya-deokar/software-factory` in the project, then commit), and a secret
named `ANTHROPIC_API_KEY`. Set the repository variable `FACTORY_AGENT` to
`codex` and add `OPENAI_API_KEY` to run the agent steps with Codex instead.
Read each file before committing it. They are templates, and permissions are
scoped to the minimum each job needs.

## Check

Run this after any hand edit to `.factory/`, and in CI:

```bash
node "$SKILL_DIR/scripts/check-factory.mjs"            # finds .factory/ from the git root
node "$SKILL_DIR/scripts/check-factory.mjs" path/to/.factory
```

It validates every file against the bundled schemas. It also checks that
routing rules name defined tiers, that each friction pattern matches its own
examples and misses its counter-examples, that memory files carry provenance
and no secrets, and that `INDEX.md` lists every memory.

Exit codes: `0` checked and valid, `1` problems found, `2` could not run
(no directory, or nothing in it to check). Treat `2` as a failure in CI. A
check that inspected nothing has not passed.

## Turning parts off

Everything is opt-in through `.factory/config.json`:

- `beats.triage`, `beats.spec`, `beats.monitor`: skip that beat.
- `ledger`, `memory`, `routing`: skip that data.
- `loop.enabled`: the weekly loop exits without proposing.

Agents read the config at the start of a task. A switch that is off means
the matching skill does not run, not that it runs and discards its output.
