/**
 * Theme Utilities — Phase 3
 * 
 * Resolves enhanced theme tokens with sensible defaults.
 * All new tokens are optional, so components can safely use these
 * helpers without checking if a theme has the new properties.
 */

import { Theme } from './types';

// Shadow presets mapped to CSS box-shadow values
const shadowMap: Record<string, string> = {
  none: 'none',
  soft: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  medium: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  dramatic: '0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -4px rgba(0,0,0,0.1)',
};

/**
 * Resolves the full set of visual tokens from a theme,
 * filling in sensible defaults for any missing enhanced tokens.
 */
export function resolveThemeTokens(theme: Theme) {
  const isDark = theme.type === 'dark';

  return {
    // Pass through base tokens
    ...theme,

    // Resolved enhanced tokens with defaults
    headingFontFamily: theme.headingFontFamily || theme.fontFamily,
    accentGradient:
      theme.accentGradient ||
      `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentColor}cc)`,
    surfaceColor:
      theme.surfaceColor ||
      (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
    mutedColor:
      theme.mutedColor ||
      (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
    borderRadius: theme.borderRadius || '12px',
    shadow: shadowMap[theme.shadowPreset || 'soft'],
  };
}

/**
 * Returns CSS custom properties for a theme, useful for
 * applying theme tokens to a container via inline styles.
 */
export function getThemeCSSVars(theme: Theme): Record<string, string> {
  const tokens = resolveThemeTokens(theme);

  return {
    '--theme-font': tokens.fontFamily,
    '--theme-heading-font': tokens.headingFontFamily,
    '--theme-color': tokens.fontColor,
    '--theme-accent': tokens.accentColor,
    '--theme-accent-gradient': tokens.accentGradient,
    '--theme-bg': tokens.backgroundColor,
    '--theme-surface': tokens.surfaceColor,
    '--theme-muted': tokens.mutedColor,
    '--theme-radius': tokens.borderRadius,
    '--theme-shadow': tokens.shadow,
  };
}
