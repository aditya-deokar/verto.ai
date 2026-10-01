import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dropTargetIndex,
  duplicateSlide,
  filterThemes,
  insertSlide,
  moveSlide,
  removeSlide,
  renumberSlides,
} from '../../../src/mcp/apps/components/shared/deck-model.ts';

type Slide = { id: string; slideName: string; slideOrder?: number; content?: unknown };

const deck = (): Slide[] => [
  { id: 'a', slideName: 'Intro', slideOrder: 7 },
  { id: 'b', slideName: 'Problem', slideOrder: 3 },
  { id: 'c', slideName: 'Close' },
];

const ids = (slides: unknown[]) => slides.map((slide) => (slide as Slide).id);
const orders = (slides: unknown[]) => slides.map((slide) => (slide as Slide).slideOrder);

test('renumberSlides sets slideOrder to the array index', () => {
  assert.deepEqual(orders(renumberSlides(deck())), [0, 1, 2]);
});

test('moveSlide moves one slide and renumbers, without touching the input', () => {
  const input = deck();
  const moved = moveSlide(input, 0, 2);
  assert.deepEqual(ids(moved), ['b', 'c', 'a']);
  assert.deepEqual(orders(moved), [0, 1, 2]);
  assert.deepEqual(ids(input), ['a', 'b', 'c']);
  assert.equal(input[0].slideOrder, 7);
});

test('moveSlide ignores out-of-range positions', () => {
  assert.deepEqual(ids(moveSlide(deck(), 0, -1)), ['a', 'b', 'c']);
  assert.deepEqual(ids(moveSlide(deck(), 2, 3)), ['a', 'b', 'c']);
});

test('removeSlide returns the removed slide for undo', () => {
  const { slides, removed } = removeSlide(deck(), 1);
  assert.deepEqual(ids(slides), ['a', 'c']);
  assert.deepEqual(orders(slides), [0, 1]);
  assert.equal((removed as Slide).id, 'b');
});

test('insertSlide puts a removed slide back where it was', () => {
  const { slides, removed } = removeSlide(deck(), 1);
  assert.deepEqual(ids(insertSlide(slides, removed, 1)), ['a', 'b', 'c']);
  assert.deepEqual(ids(insertSlide(slides, removed, 99)), ['a', 'c', 'b']);
});

test('duplicateSlide inserts a copy after the original with fresh ids at every depth', () => {
  const input: Slide[] = [
    {
      id: 'a',
      slideName: 'Intro',
      content: { id: 'n1', type: 'column', content: [{ id: 'n2', type: 'heading1', content: 'Hi' }] },
    },
    { id: 'b', slideName: 'Close' },
  ];
  let counter = 0;
  const result = duplicateSlide(input, 0, () => `new-${++counter}`) as Slide[];

  assert.deepEqual(ids(result), ['a', 'new-1', 'b']);
  assert.equal(result[1].slideName, 'Intro (copy)');
  assert.deepEqual(orders(result), [0, 1, 2]);

  const copyContent = result[1].content as { id: string; content: Array<{ id: string; content: string }> };
  assert.equal(copyContent.id, 'new-2');
  assert.equal(copyContent.content[0].id, 'new-3');
  assert.equal(copyContent.content[0].content, 'Hi');

  // The original tree keeps its ids, so guided-editor patches stay unambiguous.
  const original = input[0].content as { id: string; content: Array<{ id: string }> };
  assert.equal(original.id, 'n1');
  assert.equal(original.content[0].id, 'n2');
});

test('filterThemes matches every word against name and type', () => {
  const themes = [
    { name: 'Neon Nights', type: 'dark' },
    { name: 'Nature Fresh', type: 'light' },
    { name: 'Dark Elegance', type: 'dark' },
  ];
  assert.deepEqual(filterThemes(themes, 'neon').map((t) => t.name), ['Neon Nights']);
  assert.deepEqual(filterThemes(themes, 'DARK').map((t) => t.name), ['Neon Nights', 'Dark Elegance']);
  assert.deepEqual(filterThemes(themes, 'n light').map((t) => t.name), ['Nature Fresh']);
  assert.equal(filterThemes(themes, '   ').length, 3);
  assert.equal(filterThemes(themes, 'zzz').length, 0);
});

test('dropTargetIndex accounts for the slide leaving its own gap', () => {
  // Five slides; slots 0..5 are the gaps between them.
  assert.equal(dropTargetIndex(0, 3), 2, 'dragging right lands one before the slot');
  assert.equal(dropTargetIndex(4, 1), 1, 'dragging left lands on the slot');
  assert.equal(dropTargetIndex(2, 2), 2, 'the gap before itself is a no-op');
  assert.equal(dropTargetIndex(2, 3), 2, 'the gap after itself is a no-op');
  assert.equal(dropTargetIndex(0, 5), 4, 'after the last slide');
  assert.deepEqual(
    ids(moveSlide(deck(), 0, dropTargetIndex(0, 2))),
    ['b', 'a', 'c'],
    'dropping slide a after slide b'
  );
});
