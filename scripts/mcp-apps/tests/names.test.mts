import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanSlideName } from '../../../src/lib/slides/slide-names.ts';
import { matchThemeName } from '../../../src/mcp/lib/theme-names.ts';

test('cleanSlideName strips the outline generator tag', () => {
  assert.equal(
    cleanSlideName('Beyond Simple Chains: The Era of Stateful AI Agents [opening - creativeHero]'),
    'Beyond Simple Chains: The Era of Stateful AI Agents'
  );
  assert.equal(cleanSlideName('AI Market Growth in 2024 [statistics]'), 'AI Market Growth in 2024');
});

test('cleanSlideName keeps brackets that are part of the title', () => {
  assert.equal(cleanSlideName('The [redacted] memo'), 'The [redacted] memo');
  assert.equal(cleanSlideName('Plain title'), 'Plain title');
});

test('cleanSlideName never returns an empty name', () => {
  assert.equal(cleanSlideName('[statistics]'), '[statistics]');
});

const catalog = ['Default', 'Dark Elegance', 'Neon Nights'];

test('matchThemeName ignores case and extra whitespace', () => {
  assert.deepEqual(matchThemeName('  dark   elegance ', catalog), { ok: true, name: 'Dark Elegance' });
  assert.deepEqual(matchThemeName('NEON NIGHTS', catalog), { ok: true, name: 'Neon Nights' });
});

test('matchThemeName reports a style description as unknown', () => {
  const result = matchThemeName('Modern technical, premium developer-tool aesthetic', catalog);
  assert.equal(result.ok, false);
  assert.equal(matchThemeName('', catalog).ok, false);
  // Prefixes are not matches: "Dark" must not silently become "Dark Elegance".
  assert.equal(matchThemeName('Dark', catalog).ok, false);
});
