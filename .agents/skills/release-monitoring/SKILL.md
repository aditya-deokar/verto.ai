---
name: release-monitoring
description: >
  Check a change after it merges: CI on the default branch, the deploy, the
  error sources the repo names, and the PR's own evidence rerun against the
  shipped build. Turn anything broken into a regression issue that feeds back
  into triage. Use when a factory PR has just merged, when asked "did it deploy",
  "is main green", or "check production", or when a CI failure lands on the
  default branch.
license: MIT
compatibility: >
  Needs git and an authenticated gh CLI for CI, deployment, and issue checks.
  Error-tracker checks use whatever CLI or URL the repo's AGENTS.md names.
  Records results with run-ledger when the repo has .factory/.
metadata:
  author: software-factory
  version: "1.0"
allowed-tools: Bash(gh run *) Bash(gh api *) Bash(gh issue *) Bash(gh pr view *) Bash(git:*) Bash(node:*)
---

# Release monitoring

Work in the factory does not end at merge. A change can pass review and CI
on its branch and still break the default branch (merge skew), fail to deploy,
or fail for real users. This beat looks once, on purpose, and feeds what it
finds back into intake. It is a check, not a vigil.

Default tier: `fast`. Every step is reading status.

## When it runs

- Right after a factory PR merges, if you are still in the session.
- From `factory-monitor.yml` when CI fails on the default branch (see
  `factory-setup`).
- When a person asks whether something shipped.

Skip it when `.factory/config.json` has `beats.monitor: false`.

## The checks, in order

Stop at the first failure and go to "When something is broken".

1. **CI on the merge commit.**
   ```bash
   SHA=$(gh pr view <pr> --json mergeCommit --jq .mergeCommit.oid)
   gh run list --commit "$SHA" --json name,status,conclusion,url
   ```
   If runs are still going, wait with a bound instead of polling in a loop:
   `gh run watch <run-id> --exit-status`, within `monitor.watch_minutes` from
   the config (default 30). Past that, record `pending` and stop.
2. **Deploy, if the repo deploys from the default branch.**
   ```bash
   gh api "repos/{owner}/{repo}/deployments?sha=$SHA" --jq '.[0].id' \
     | xargs -I{} gh api "repos/{owner}/{repo}/deployments/{}/statuses" --jq '.[0].state'
   ```
   `success` is not behavior proof. It only means the deploy finished.
3. **The PR's own evidence, against the shipped build.** If the PR's
   evidence was a command (a curl, a CLI call, a query) and it is cheap and
   safe to run against the deployed environment, run it again and compare it
   with the PR's "after". Never run write operations against production for
   this.
4. **Error sources named in AGENTS.md,** filtered to the time since deploy:
   the error tracker, logs, or crash reports. Look for new error types, not
   for the total count.

No monitoring sources in `AGENTS.md` and no deploy? Then step 1 is the whole
check. Say so plainly instead of implying more was checked.

## Recording the result

```bash
node "$LEDGER" beat <run-id> monitor --set status=clean
node "$LEDGER" finish <run-id> --outcome merged
```

`status` is `clean`, `regression`, `pending` (ran out of watch time), or
`skipped` (switched off, or nothing to check). The run id is on the PR's
`Run:` line, and `$LEDGER` is resolved as shown in `run-ledger`.

## When something is broken

1. **Check it is new.** Did the same check fail on the commit before the
   merge? `gh run list --branch <default> --limit 5`. A failure that predates
   the merge is not this PR's regression; say so and link the earlier run.
2. **Open one issue,** after searching for an open one about the same failure:
   ```bash
   gh issue list --label factory:regression --state open --search "<workflow or error>"
   gh issue create --label factory:regression \
     --title "Regression after #<pr>: <what broke>" \
     --body "<failing run URL or error excerpt>

   Merged in #<pr> (<sha>). Last good: <run URL>. Evidence from the PR: <link>."
   ```
3. **Record it:** `beat <run-id> monitor --set status=regression --set issue=<n>`.
4. **Hand it to triage.** The new issue goes through `issue-triage` like
   any other. Do not hot-fix it in the same breath. Revert first if the break
   blocks other people, and say that you did.

## Do not do these

- **Do not leave a watcher running.** Every wait has a bound, and the beat
  ends with a recorded status, even `pending`.
- **Do not call a green deploy "verified".** A deploy status says the deploy
  finished, not that the feature works.
- **Do not open a second issue for a known failure.** Comment on the open one
  with the new occurrence.
- **Do not monitor what you were not asked to.** One PR, its merge commit,
  the sources the repo names.
