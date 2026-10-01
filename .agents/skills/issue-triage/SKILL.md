---
name: issue-triage
description: >
  Decide what happens to an incoming piece of work before anyone writes code:
  implement it now, write a spec first, close it as a duplicate, ask the
  reporter for the specific missing facts, or decline it. Use when a new
  issue, bug report, feature request, Slack message, or failed monitor check
  arrives, when asked to "triage", "label", or "sort" issues, or before
  starting any task whose size and clarity nobody has judged yet.
license: MIT
compatibility: >
  Works in any harness. Reading and labeling GitHub issues needs an
  authenticated gh CLI; without it, triage a pasted report and print the
  decision. Uses run-ledger and agent-memory when the repo has .factory/.
metadata:
  author: software-factory
  version: "1.0"
allowed-tools: Bash(gh issue *) Bash(gh search *) Bash(gh label *) Bash(node:*) Bash(git:*)
---

# Issue triage

Triage is the cheapest place in the factory to prevent waste. A vague issue
sent straight to implementation comes back as the wrong PR. An easy issue
sent through a spec costs a day it did not need. A duplicate solved twice
costs both. Read enough to classify, then stop. Triage does not fix.

Default tier: `fast` (see `model-routing`). Triage is pattern matching, and it
runs on every issue.

## Output: exactly one decision

| Decision | When | What you do |
|---|---|---|
| `implement` | Small, unambiguous, and you can name the acceptance check in one sentence | Label `factory:implement`, go to Isolate |
| `spec` | Ambiguous, cross-cutting, product-visible, a migration, or more than one reasonable design | Label `factory:spec`, hand to `spec-writing` |
| `duplicate` | Same root cause as an open or recently closed issue | Link it, label `factory:duplicate`, close with a pointer |
| `needs-info` | You cannot reproduce or classify it without facts only the reporter has | Ask for those exact facts, label `factory:needs-info` |
| `decline` | Out of scope, working as intended, or not worth the cost | Say why in one or two sentences, label `factory:decline` |

If two decisions seem to fit, pick the more conservative: `spec` over
`implement`, `needs-info` over guessing.

## Procedure

1. **Read the whole report,** including comments, linked logs, and
   screenshots. The deciding fact is often in comment four.
2. **Check memory and history before judging.** Search `agent-memory`
   (`memory.mjs search <key terms>`) for a known root cause, then search
   issues, including closed ones:
   ```bash
   gh search issues --repo <owner>/<repo> "<distinctive error text>" --state all --limit 10
   gh issue list --state closed --search "<key terms> in:title,body" --limit 10
   ```
   Use the error message, stack frame, or component name, not the reporter's
   wording. Two people describe the same bug differently. They paste the
   same error.
3. **Try to reproduce, but only if it is cheap.** One command, one page
   load, or one test. If reproduction needs setup the issue does not
   describe, that is a `needs-info` signal, not a reason to spend an hour.
4. **Classify** with the table above and the size rules from `run-ledger`
   (`small`, `medium`, `large`). Anything `large` is `spec`.
5. **Act on the issue** (below) and record the run.

## Asking for information

A generic "can you share more details?" costs a round trip and usually
returns nothing useful. Ask for the specific facts that would decide it, and
say why each one matters:

```markdown
Thanks for the report. Two things would let us reproduce this:

1. The exact command you ran and its full output. The error in the title
   comes from two different code paths, and the output shows which.
2. Your OS and Node version (`node --version`). Windows fails this step
   differently.
```

Ask at most three questions. If you need more than three, the issue needs a
conversation, and a human should have it.

## Acting on GitHub

Create the labels once if they are missing:

```bash
for l in implement spec duplicate needs-info decline regression skill-loop; do
  gh label create "factory:$l" --color BFD4F2 2>/dev/null || true
done
```

Then apply the decision:

```bash
gh issue edit <n> --add-label factory:implement
gh issue comment <n> --body "Triage: implement. <one-sentence reason>. Acceptance check: <what proves it fixed>."
gh issue close <n> --reason "not planned" --comment "Duplicate of #<m>: <one line on why they are the same>."
```

The comment always gives the reason in one sentence. A label with no reason
cannot be challenged, and a wrong triage that cannot be challenged sticks.

## Recording it

If the repo has `.factory/`:

```bash
node "$LEDGER" start --class triage --size small --source github:issue/<n> --title "triage #<n>"
node "$LEDGER" beat current triage --set decision=duplicate --set duplicate_of=github:issue/<m>
node "$LEDGER" finish current --outcome closed
```

When the decision is `implement` and you are also doing the work, start one
run with the real class (`bugfix`, `feature`) instead, record the triage beat
on it, and carry on. `$LEDGER` is resolved as shown in `run-ledger`.

If memory helped (a known root cause, a known duplicate), mark it used:
`memory.mjs use <name>`. That count decides what graduates into a skill.

## Do not do these

- **Do not start fixing during triage.** If it is easy, say `implement` and
  then do it as its own task, through the normal beats.
- **Do not decline to avoid work.** Declining needs a reason the reporter
  would accept, even if they disagree with it.
- **Do not close a duplicate without the link.** "Duplicate" with no pointer
  reads as dismissal.
- **Do not triage your own monitor's regression as `decline`.** A regression
  from a merged factory PR is always `implement` or `spec`.
