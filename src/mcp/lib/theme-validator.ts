/**
 * MCP Lib — Theme Validator
 *
 * Validates theme names against the app's theme catalog.
 * Used by presentation_update_theme to reject invalid themes
 * before hitting the database.
 */

import { themes } from '@/lib/constants';

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

/**
 * Check if a theme name exists in the catalog (case-sensitive).
 */
export function isValidThemeName(name: string): boolean {
  return getValidThemeNames().includes(name);
}
