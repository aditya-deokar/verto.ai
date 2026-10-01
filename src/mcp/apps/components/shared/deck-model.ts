/**
 * Pure slide-array operations for the deck preview.
 *
 * The widget decides when an edit is allowed and what to tell the person;
 * this module only computes the next array. Every function returns a new
 * array, never mutates its input, and renumbers `slideOrder` so the
 * dashboard editor (which sorts by it) shows the order the person chose.
 *
 * No imports and no DOM, so Node's test runner loads it directly.
 */

type SlideRecord = Record<string, unknown>;

function isRecord(value: unknown): value is SlideRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Sets `slideOrder` to each slide's index. Non-object entries pass through. */
export function renumberSlides(slides: readonly unknown[]): unknown[] {
  return slides.map((slide, index) =>
    isRecord(slide) ? { ...slide, slideOrder: index } : slide
  );
}

function inRange(slides: readonly unknown[], index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < slides.length;
}

/** Moves the slide at `from` to position `to`. Out-of-range moves are no-ops. */
export function moveSlide(slides: readonly unknown[], from: number, to: number): unknown[] {
  if (!inRange(slides, from) || !inRange(slides, to) || from === to) {
    return renumberSlides(slides);
  }

  const next = slides.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return renumberSlides(next);
}

/**
 * Where a dragged slide ends up. `slot` is the gap it was dropped into: 0 is
 * before the first slide, `length` is after the last. Removing the slide
 * first shifts every later gap down by one.
 */
export function dropTargetIndex(from: number, slot: number): number {
  return slot > from ? slot - 1 : slot;
}

/** Removes the slide at `index`, returning it so the caller can offer undo. */
export function removeSlide(
  slides: readonly unknown[],
  index: number
): { slides: unknown[]; removed: unknown } {
  if (!inRange(slides, index)) {
    return { slides: renumberSlides(slides), removed: undefined };
  }

  const next = slides.slice();
  const [removed] = next.splice(index, 1);
  return { slides: renumberSlides(next), removed };
}

/** Puts `slide` back at `index` (clamped to the array bounds). */
export function insertSlide(
  slides: readonly unknown[],
  slide: unknown,
  index: number
): unknown[] {
  const at = Math.max(0, Math.min(Number.isInteger(index) ? index : slides.length, slides.length));
  const next = slides.slice();
  next.splice(at, 0, slide);
  return renumberSlides(next);
}

/**
 * Inserts a copy of the slide at `index` right after it. The copy and every
 * nested content node get fresh ids: the guided editor addresses nodes by id,
 * and two nodes sharing one would make its patches land on both slides.
 */
export function duplicateSlide(
  slides: readonly unknown[],
  index: number,
  makeId: () => string
): unknown[] {
  if (!inRange(slides, index) || !isRecord(slides[index])) {
    return renumberSlides(slides);
  }

  const copy = withFreshIds(structuredClone(slides[index]), makeId) as SlideRecord;
  if (typeof copy.slideName === 'string' && copy.slideName) {
    copy.slideName = `${copy.slideName} (copy)`;
  }

  const next = slides.slice();
  next.splice(index + 1, 0, copy);
  return renumberSlides(next);
}

function withFreshIds(value: unknown, makeId: () => string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => withFreshIds(item, makeId));
  }

  if (!isRecord(value)) return value;

  const next: SlideRecord = {};
  for (const [key, child] of Object.entries(value)) {
    next[key] = key === 'id' && typeof child === 'string' ? makeId() : withFreshIds(child, makeId);
  }
  return next;
}

/**
 * Case-insensitive search over theme names and their light/dark type.
 * Every whitespace-separated word must match, so "dark neon" finds
 * "Neon Nights" (a dark theme).
 */
export function filterThemes<T extends { name: string; type: string }>(
  themes: readonly T[],
  query: string
): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return themes.slice();

  return themes.filter((theme) => {
    const haystack = `${theme.name} ${theme.type}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
