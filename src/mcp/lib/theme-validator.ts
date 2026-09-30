/**
 * MCP Lib — Theme Validator
 *
 * Resolves theme names against the app's theme catalog. Used by
 * presentation_update_theme to reject unknown themes before hitting the
 * database, and by presentation_generate to fall back to Default.
 */

import { themes } from '@/lib/constants';
import { matchThemeName, type ThemeNameResolution } from './theme-names';

export type { ThemeNameResolution };

/** Cache the valid theme names (immutable at runtime) */
let _themeNames: string[] | null = null;

/**
 * Get all valid theme names from the app's constant catalog.
 */
export function getValidThemeNames(): string[] {
  if (!_themeNames) {
    _themeNames = themes.map((t) => t.name);
  }
  return _themeNames;
}

/** Case- and whitespace-insensitive match against the catalog. */
export function resolveThemeName(input: string): ThemeNameResolution {
  return matchThemeName(input, getValidThemeNames());
}
