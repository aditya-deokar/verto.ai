# Tech spec template

Goes under the product spec in the same file, or in `specs/<slug>-tech.md`
when the product half has a different reviewer.

```markdown
## Tech spec

### Current shape

How the relevant code works today, with file paths. Only what the change
touches. A reviewer who does not know this area should be able to follow.

### Proposed shape

- Boundary (decides who, whether, what next): <files, functions>
- Service (does the how, returns structured results): <files, functions>
- Data: <tables, columns, files, and whether the change is additive>

A diagram helps when more than three components talk to each other.

### Acceptance check mapping

| Product check | Where it is enforced | How it is tested |
|---|---|---|
| 1 | `routes/drafts.ts` boundary, permission check | integration test plus recording |

### Alternatives considered

- <Option>: rejected because <reason>.

### Files touched

Expected list. Used by `worktree-isolation`'s overlap check against open PRs.

### Data and migration

Additive or destructive? How is it rolled back? What happens to rows written
between deploy and rollback?

### Risks

What could go wrong in production, and how `release-monitoring` would notice.

### Rollout

Flag, staged, or all at once. For all at once, say why that is safe.

### Test plan

Which automated tests are added, and which acceptance checks need runtime
evidence from `test-evidence`.
```

Notes:

- Keep file paths real. Check them with a quick search before writing them
  down; a spec that names files that do not exist loses the reviewer's trust.
- If "Files touched" overlaps an open PR, say so here and in the PR. That
  decision belongs to the human, per `worktree-isolation`.
