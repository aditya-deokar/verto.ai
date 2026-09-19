# 14 — What the in-chat UI still needs

> Written 2026-09-19 against `migrate/mcp-ext-apps` at `fefb01e`, after the
> icon repair and the app-bridge action fixes.
> Companion to [`13-phase-d-deep-dive-plan.md`](./13-phase-d-deep-dive-plan.md),
> which covered architecture. This one is about product surface: what a person
> can and cannot do without leaving the chat.

---

## 1. Where the in-chat experience stands

Seven widgets ship today, and after the two fixes above them every control in
them does what it says. The foundation a native in-chat app needs is in place:

| Property | Status | Where |
|---|---|---|
| Actions hit the host bridge, not the model | Done | `shared/runtime.ts` → `callServerTool` |
| Zero token cost per click | Done | tool calls are host-proxied; only retry and permanent delete spend a turn |
| Light/dark follows the host instantly | Done | `verto-skin.ts` `attachHostAdaptation` → `onhostcontextchanged` |
| Deck theme painted from the real catalog | Done | 65 themes in `generated/themes-data.ts` |
| Widget state pushed back to the model | Done | `pushModelContext` after theme apply, unpublish, slide edits |
| Adaptive to platform, touch, PiP, safe areas | Done | `.vt-mobile` / `.vt-touch` / `.vt-narrow` / `.vt-pip` |
| Failures visible in-widget | Done | `aria-live` action notes, `isError` surfaced |
| Behaviour covered by a host harness | Done | `npm run mcp:smoke`, 15 interactions |

What is missing is not plumbing. It is that several ordinary things a person
wants to do with a deck have no in-chat surface at all, so the conversation
has to hand off to the dashboard.

---

## 2. The gaps, in the order they hurt

### Tier 1 — flows that dead-end in chat

**1. There is no way to shape a deck before it is generated.**

`presentation_create` accepts an `outlines[]` array
(`tools/presentation/schemas.ts:38`), but it is not app-callable and its UI
resource is the generic action-result card. So the only in-chat way to start a
deck is a free-text `presentation_generate`, where the model composes the
outline invisibly and the person first sees it as a finished deck.

The single highest-value widget left to build is an **outline composer**: the
model proposes an outline, the widget renders it as editable, reorderable
cards, and Generate goes from there. Everything it needs exists — an ordered
list of `{title, order}`, the drag/reorder pattern already in the deck preview
filmstrip, and a create tool that takes exactly that shape.

*Needs:* `presentation_create` app-callable, one new widget, one new UI
resource. No schema change.

**2. Slides cannot be added or removed in chat.**

The guided editor edits text on existing slides only — its targets are
`kind: 'text' | 'field' | 'listItem'` (`shared/slide-editor.ts:21`) — and the
deck preview can reorder. There is no add, delete, or duplicate.

The server is already ready: `presentation_update_slides` replaces the whole
array and is app-callable, and the reorder path in `deck-preview.ts` already
sends a full rewritten array. This is widget work, not protocol work.

*Needs:* add/delete/duplicate controls on the filmstrip, a slide-type picker
for new slides, and undo. Reuse the existing confirm pattern for delete.

**3. Images are untouchable.**

Generated decks carry Unsplash and inline Gemini images — they are
CSP-allowlisted for exactly this reason (`apps/constants.ts`
`SLIDE_IMAGE_RESOURCE_DOMAINS`) — but no widget lets anyone swap one, remove
one, or ask for a different one. The editor descends into `imageAndText`
blocks but only collects text targets from them
(`shared/slide-editor.ts:479-484`); there is no editable target kind for an
image at all.

*Needs:* an image action on image-bearing slides. Re-prompting an image is the
one case here that genuinely wants a model turn; swapping to a different
already-fetched candidate does not.

**4. A running generation cannot be stopped.**

Documented as deferred in `10-in-chat-verto-experience-plan.md` (§7.3,
decision 2): the run manager has no cancel API, and the team chose not to ship
a button that lies. That was right, and it leaves the progress card polling to
completion with no exit. A long or wrong generation has to be waited out.

*Needs:* backend cancel first (`PresentationGenerationRun` status transition
plus a check inside the workflow loop), then
`presentation_generation_cancel` as an app-callable tool, then a Cancel button
behind capability detection.

**5. Nothing can be exported from chat.**

`10-in-chat-verto-experience-plan.md:56` puts PDF export out of scope because
it "needs binary download". That is no longer true: the SDK exposes
`downloadFile` on the app, and no widget uses it. Export is the most common
thing a person wants at the end of a deck conversation, and today the answer
is "open the dashboard".

*Needs:* a server-side render path producing the file, then a Download control
behind `getHostCapabilities()?.downloadFile`.

### Tier 2 — the workspace surface is thin

**6. The list has no search, filter, or sort.** `presentation_list` already
accepts `sort_by`, `sort_order` and `include_deleted`, and the theme studio
already has a working search input to copy. The workspace widget exposes none
of it. Past a couple of dozen decks the list stops being usable.

**7. There is no trash view.** The widget always sends
`include_deleted: false`, so deleted decks are reachable only if the model
happens to pass the flag. Recover exists as a row action but there is no way
to get to a row that needs it.

**8. There is no multi-select.** `presentation_delete_permanently` takes a
batch up to `LIMITS.MAX_PERMANENT_DELETE_BATCH`, and the UI can only act on
one row at a time.

These three are the same widget and roughly one piece of work.

### Tier 3 — platform debts that will bite later

**9. `verto://presentations` is a stub.** It says so itself
(`resources/presentations.ts:7-9`): MCP resources get no per-request auth
context, so it returns an instructional message instead of data. Either give
it session auth or drop it; a resource that never returns the thing it
advertises is worse than no resource.

**10. Every widget carries the full SDK.** Current bundles:

| Widget | Bytes | Budget | Headroom |
|---|---|---|---|
| deck-preview | 415,755 | 448 KB | 42 KB |
| generation-progress | 399,854 | 416 KB | 26 KB |
| deck-live | 393,727 | 512 KB | 128 KB |
| presentation-list | 368,704 | 384 KB | 24 KB |
| theme-studio | 363,869 | 384 KB | 29 KB |
| action-result | 362,466 | 384 KB | 30 KB |
| publish-card | 345,746 | 384 KB | 46 KB |

About 305 KB of each is the same SDK plus zod baseline, re-sent per resource
read. The workspace list has 24 KB left and the progress card 26 KB, which is
roughly one more feature each before a budget has to be raised or the baseline
attacked. Worth measuring whether hosts cache resource reads before
optimising, but the headroom is real and shrinking.

**11. Widget logic has no unit tests.** `npm run mcp:smoke` now covers
behaviour end to end and phase 9H covers appearance, but the pure functions —
payload normalisation, patch application in the slide editor, the inline
markup sanitiser, QR encoding — have no direct tests. The smoke harness is
slow enough (a browser per run) that it will not be the place to test edge
cases.

---

## 3. What "native" still means here

The SEP-1865 properties are in place: clicks go to the bridge, cost no tokens,
and themes sync instantly. Three smaller things would make it feel less like a
card and more like an app:

- **Keyboard navigation beyond the presenter.** `deck-live` handles arrows,
  Space, Home/End, Esc and G. The workspace list, theme studio and filmstrip
  are click-only.
- **Display modes beyond the presenter.** Only `deck-live` calls
  `requestDisplayMode` (`deck-live.ts:729`). A deck preview that could go
  fullscreen for editing, or PiP while the conversation continues, would use
  a capability already advertised.
- **Optimistic rendering.** Every action waits for its round trip before the
  UI moves. The calls are fast, but publish, unpublish and reorder all have
  known outcomes and could paint immediately with rollback on failure.

---

## 4. Suggested order

| # | Work | Why here | Rough size |
|---|---|---|---|
| 1 | Workspace search, filter, sort, trash, multi-select (gaps 6-8) | One widget, no server changes, removes the most common reason to leave chat | 2-3 d |
| 2 | Outline composer (gap 1) | Highest product value; makes the deck a conversation instead of a result | 3-4 d |
| 3 | Slide add/delete/duplicate (gap 2) | Completes the editor; server already supports it | 2-3 d |
| 4 | Export via `downloadFile` (gap 5) | Unblocks the end of every deck conversation | 2 d + server render |
| 5 | Cancel generation (gap 4) | Needs backend work first | 1 d after backend |
| 6 | Image control (gap 3) | Largest design question of the set | 3-4 d |
| 7 | Resource stub, bundle size, unit tests (gaps 9-11) | Debt, not features; schedule before they force a decision | ongoing |

Gaps 1-3 and 6 each need a new or extended UI resource, so the React-port
decision in `13-phase-d-deep-dive-plan.md` §5.3 comes up again around item 2.
That rule still holds: vanilla plus the shared facade unless local state
genuinely outweighs ~50 KB. The outline composer, with drag reordering and
per-card edit state, is the first widget with a real case to make.
