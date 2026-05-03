/**
 * MCP Resource — verto://themes
 *
 * Read-only listing of all available presentation themes.
 * Returns serializable theme data (name, colors, fonts, type) — no React components.
 *
 * Data source: src/lib/constants.ts → themes array
 * This is static data — no database query needed.
 */

import { themes } from '@/lib/constants';
import { registerResourcePlugin } from './registry';
import { RESOURCE_URIS } from '../config/constants';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Extract only the serializable fields from each theme.
 * The Theme type in constants.ts may contain React component references
 * or other non-serializable data — we only expose what LLMs need.
 */
function serializeThemes() {
  return themes.map((theme) => ({
    name: theme.name,
    type: theme.type,
    font_family: theme.fontFamily,
    heading_font_family: theme.headingFontFamily,
    font_color: theme.fontColor,
    background_color: theme.backgroundColor,
    slide_background_color: theme.slideBackgroundColor,
    accent_color: theme.accentColor,
    accent_gradient: theme.accentGradient,
    surface_color: theme.surfaceColor,
    muted_color: theme.mutedColor,
    gradient_background: theme.gradientBackground ?? null,
    border_radius: theme.borderRadius,
    shadow_preset: theme.shadowPreset,
  }));
}

function registerThemesResource(server: McpServer): void {
  server.resource(
    'themes',
    RESOURCE_URIS.THEMES,
    {
      description:
        'List of all available presentation themes with their visual properties (colors, fonts, gradients). Check this before using presentation_update_theme to see valid theme names.',
      mimeType: 'application/json',
    },
    async (_uri) => {
      const serializedThemes = serializeThemes();

      return {
        contents: [
          {
            uri: RESOURCE_URIS.THEMES,
            mimeType: 'application/json',
            text: JSON.stringify({
              themes: serializedThemes,
              total: serializedThemes.length,
              note: 'Use the "name" field as the theme_name argument in presentation_update_theme.',
            }),
          },
        ],
      };
    }
  );
}

// Self-register
registerResourcePlugin({
  name: 'themes',
  register: registerThemesResource,
});
