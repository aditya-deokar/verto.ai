/**
 * The outline generator annotates each outline with its content type, e.g.
 * "Why Chains Break [problem - bullet points]" or "Intro [statistics]", and
 * those strings used to become slide names verbatim.
 *
 * Only a trailing tag in that vocabulary is removed: either the
 * "type - detail" form, or a bare content-type word. "Revenue [Q3]" and
 * "The [redacted] memo" keep their brackets. No imports: the MCP widget
 * bundles and Node's native test runner both load this file directly.
 */
const TRAILING_TAG = /\s*\[([^\[\]]{1,80})\]\s*$/;

/** Content types the outline prompt asks for (agents/outlineGenerator.ts). */
const CONTENT_TYPES = new Set([
  'opening', 'problem', 'concept', 'statistics', 'comparison', 'process',
  'features', 'tips', 'features/tips', 'example', 'data', 'timeline', 'cta',
  'conclusion', 'section', 'overview', 'summary', 'introduction', 'agenda',
]);

function isOutlineTag(tag: string): boolean {
  const text = tag.trim().toLowerCase();
  return / - /.test(text) || CONTENT_TYPES.has(text);
}

export function cleanSlideName(name: string): string {
  const match = TRAILING_TAG.exec(name);
  if (!match || !isOutlineTag(match[1])) return name.trim();

  const cleaned = name.slice(0, match.index).trim();
  return cleaned || name.trim();
}
