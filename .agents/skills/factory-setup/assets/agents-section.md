
## Software factory

This repo runs the software factory workflow. Skills:
`npx skills add aditya-deokar/software-factory`.

Inner loop: `issue-triage`, then `spec-writing` when triage says so (a human
approves before code), `worktree-isolation`, `service-layer`,
`test-evidence` (before state first, proof scaled to the change),
`visual-diff` and `code-review-loop` to 5/5, then `release-monitoring` after
merge. Beats switched off in `.factory/config.json` are skipped.

Outer loop: read `.factory/memory/INDEX.md` at task start (`agent-memory`),
pick the model tier with `model-routing`, record one run per task with
`run-ledger`, and let `skill-feedback-loop` propose improvements as reviewed
PRs. Nothing in the outer loop merges its own work.

End every report as Done with its artifact, or as
`BLOCKED: <what> - unblock: <one action>`.

### Repo-specific

- **Commands:** install, dev, test, typecheck, lint, exactly as typed.
- **Invariants:** what must never happen, one line each.
- **Monitoring:** where failures show up after merge.
- **Not testable locally:** and what to do instead.
