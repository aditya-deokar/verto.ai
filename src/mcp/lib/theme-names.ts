/**
 * Catalog matching for theme names, kept free of imports so Node's test
 * runner can load it without the app's path aliases.
 */

export type ThemeNameResolution =
  | { ok: true; name: string }
  | { ok: false; reason: 'unknown'; input: string };

/**
 * Maps user or model input onto a catalog name, ignoring case and extra
 * whitespace ("dark  elegance" -> "Dark Elegance"). Callers decide what an
 * unknown name means: generation falls back to Default, a theme update
 * rejects the call.
 */
export function matchThemeName(
  input: string,
  names: readonly string[]
): ThemeNameResolution {
  const needle = input.trim().replace(/\s+/g, ' ').toLowerCase();
  const match = needle ? names.find((name) => name.toLowerCase() === needle) : undefined;
  return match ? { ok: true, name: match } : { ok: false, reason: 'unknown', input };
}
