/**
 * The outline generator annotates each outline with its content type, e.g.
 * "Why Chains Break [problem - bullet points]" or "Intro [statistics]", and
 * those strings used to become slide names verbatim.
 *
 * Only a trailing bracketed tag is removed, so titles that use brackets
 * mid-sentence ("The [redacted] memo") keep them. No imports: the MCP widget
 * bundles and Node's native test runner both load this file directly.
 */
const TRAILING_TAG = /\s*\[[^\[\]]{1,80}\]\s*$/;

export function cleanSlideName(name: string): string {
  const cleaned = name.replace(TRAILING_TAG, '').trim();
  return cleaned || name.trim();
}
