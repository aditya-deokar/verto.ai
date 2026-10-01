# 15 · Deck studio: the deck preview as an in-chat editor

> Written 2026-09-30 against `master` at `ddad77a`. Follows
> [`14-in-chat-ui-gaps.md`](./14-in-chat-ui-gaps.md), which ranked slide
> add/remove, keyboard navigation and optimistic rendering as open gaps.

## Open questions

Each has the answer this change ships with. Reply in review to change one.

1. **What happens when `presentation_generate` gets a theme that is not in
   the catalog?** Ship: match it case-insensitively. If nothing matches, store
   `Default` and say so in the tool result, so the model can offer real
   themes. The alternative, rejecting the call, costs a whole generation turn
   for a cosmetic field.
2. **Can a slide be deleted from chat?** Ship: yes, behind a second click,
   with Undo for 10 seconds afterwards. The server already accepts a full
   slide array, and the dashboard is one click away for anything larger.
3. **Keep the in-widget presenter?** Ship: yes. `deck-live` is the full
   presenter, but the host decides whether an app-initiated
   `presentation_render_deck` opens a new view. The in-widget one always works.

## Product spec

### Problem

The deck preview is the first thing a person sees after generation, and in a
real ChatGPT session (the screenshots in the PR) it looked broken:

- The action panel sat on top of the cover slide and hid part of the title.
- The cover showed stock filler ("A clean preview of your generated Verto
  deck.") and three grey bars instead of the slide.
- Slide names carried the outline generator's layout tags, for example
  `[opening - creativeHero]`.
- The theme chip read "Modern technical, premium developer-tool aesthetic",
  a style prompt stored as the theme name.
- The Theme Studio drawer covered the deck it claimed to preview live, showed
  16 of 65 themes, and put Apply 3,000 px below the fold. The iframe grows to
  fit its content, so a `position: fixed` drawer spans the whole widget.
- The filmstrip stacked 15 full-size slides, making the widget 4,038 px tall.

### What must be true when this ships

Each line is checked by `scripts/mcp-apps/deck-studio-evidence.mjs` or the
basic-host smoke run, at an 860 px iframe that grows to fit like a real host.

1. The stage and the action panel never overlap (overlap area 0 px²) at
   860 px, and stack without horizontal scroll at 390 px.
2. The stage renders the selected slide's real content through the shared
   render kernel. No filler copy or placeholder bars when content exists.
3. No layout tag of the form `[word - words]` appears anywhere in the widget.
   New generations store clean slide names.
4. A theme name outside the catalog shows as the theme actually painted
   (`Default`), not as the stored string.
5. The filmstrip is a grid of thumbnails that render each slide. Clicking one,
   or pressing the arrow keys while the filmstrip has focus, selects it and
   updates the stage. The selected thumbnail has `aria-current="true"`.
6. "Edit this slide" opens the guided editor on the selected slide.
7. The stage toolbar moves the selected slide earlier or later, duplicates it,
   and deletes it. Delete needs a second click and offers Undo afterwards.
   Each change paints at once and rolls back with a visible message if the
   server rejects it. Every change renumbers `slideOrder`, so the dashboard
   editor shows the same order.
8. Structural edits are disabled, with a message, when the widget holds fewer
   slides than the deck has (a truncated response). Saving a partial array
   would delete the missing slides.
9. The theme picker opens inline beside the stage (below it on narrow
   widths), so the preview stays visible. It lists all 65 themes with a search
   box, and each card previews the theme's background, heading font and
   accent. Apply and Cancel sit in the picker header, on the first screen.
   Escape cancels.
10. Presenting hides the rest of the widget, so the presenter is not stretched
    across a 4,000 px iframe when the host refuses fullscreen.
11. The bundle stays inside its 448 KB budget, `npm run mcp:phase7` passes,
    and the smoke run passes.

12. Added 2026-10-01: a thumbnail can be dragged to a new position. A mouse
    drag starts after 6 px of travel; a touch drag needs a 300 ms press, so
    a swipe still scrolls the chat. A bar marks the gap the slide will land
    in, Escape cancels, and Alt + arrow keys do the same move from the
    keyboard. The drop saves through the same path as the move buttons.

### Out of scope

Adding a new blank slide (needs a slide-type picker), image swapping, export,
and generation cancel. Those stay in doc 14's order.

## Tech spec

### Boundary and service split

The widget is the boundary. It decides when an action is allowed, what to
confirm, what to paint, and what to tell the person. Mechanics move into pure
modules with no DOM and no bridge access, so they can be unit tested:

| Module | Owns | Callers |
|---|---|---|
| `src/lib/slides/slide-names.ts` | `cleanSlideName()` strips trailing outline tags | `jsonCompiler` (at source), `widget-data` mapper (old decks), deck preview |
| `src/mcp/apps/components/shared/deck-model.ts` | `moveSlide`, `duplicateSlide`, `removeSlide`, `insertSlide`, `renumberSlides`, `filterThemes` | deck preview |
| `src/mcp/lib/theme-validator.ts` | `resolveThemeName()`, case-insensitive catalog match | `presentation_generate`, `presentation_update_theme` |

`deck-model` returns new arrays and never mutates its input. `duplicateSlide`
gives the copy and every nested content node fresh ids, because the guided
editor addresses nodes by id and duplicates would make its patches ambiguous.

### Save path for slide changes

1. Apply the operation to the local copy and repaint (optimistic).
2. `presentation_update_slides` with the full renumbered array.
3. If the result carries `data.presentation.slides`, adopt it. Otherwise
   `presentation_get`. The current reorder always does both calls; the
   update result already has the slides.
4. On failure, restore the previous array, repaint, and show the server's
   message in the action note.

Operations are serialized. A second click while a save is in flight is
ignored, which keeps the rollback snapshot correct.

### Layout

- The stage is a 16:9 frame sized by its width. The slide renders on a fixed
  720 × 405 canvas scaled with `transform: scale()` from a `ResizeObserver`,
  so the stage and thumbnails show the same layout at any size. This removes
  the `aspect-ratio` plus grid `stretch` combination that caused the overlap:
  the stretched row height produced a width wider than the column.
- `.deck-shell` is a size container. The stage and rail sit side by side at
  720 px and wider, and stack below that.
- The theme picker and the action panel share the rail slot. Opening the
  picker swaps them. The picker's list scrolls inside a fixed height, so its
  header controls never leave the first screen.
- Presenting sets `data-mode="present"` on the root, and CSS hides the other
  sections.

### Server changes

- `jsonCompiler` names slides `slideTitle`, falling back to the cleaned
  outline.
- `widget-data` runs `cleanSlideName` on titles, so decks generated before
  this change also read cleanly.
- `presentation_generate` resolves `theme_preference` through
  `resolveThemeName`, falls back to `Default`, and returns `theme_note` when it
  did. Both copies of the schema description (`schemas.ts` and the inline one
  in `index.ts`) now say to pick a catalog name.
- `presentation_update_theme` accepts any casing and stores the canonical
  name.

### Rejected alternatives

- **Keep the drawer, cap its height with `max-height: 100vh`.** Inside an
  auto-sized iframe `100vh` is the iframe height, which is the problem.
- **Fetch fresh slides before every structural edit, as the text editor
  does.** It adds a round trip per click. Operations here address slides by
  position in the array the person is looking at, and the server result is
  adopted right after, so the window for a lost concurrent edit is one save.
- **A React port for local state.** Doc 13 §5.3 sets the bar at ~50 KB of
  bundle. The budget has 34 KB left and the state here is one selected index
  and one pending operation.

### Tests

- `npm run mcp:apps:test` runs Node's built-in test runner over the pure
  modules (native TypeScript, Node 22.18+).
- The smoke run gains cases for thumbnail selection, delete with undo,
  duplicate, rollback on a failed save, and theme apply from the inline
  picker.
- `deck-studio-evidence.mjs` captures the before and after screenshots and
  the measurements behind acceptance checks 1 to 9.
