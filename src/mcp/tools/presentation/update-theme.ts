/**
 * MCP Tool — presentation_update_theme
 *
 * Change the visual theme of a presentation.
 * Validates the theme name against the app's theme catalog before applying.
 *
 * Reuses:
 * - presentationUpdateThemeSchema (schemas.ts)
 * - getOwnedProjectForMcp (lib/mcp-project-access.ts)
 * - projectToPresentation (mappers.ts)
 * - resolveThemeName / getValidThemeNames (lib/theme-validator.ts)
 */

import prisma from '@/lib/prisma';
import type { AuthContext } from '../../auth/types';
import type { McpToolResponse } from '../_shared/response';
import { mcpSuccess } from '../_shared/response';
import { Errors } from '../_shared/errors';
import { createThemeStudioWidgetData } from '../../apps/widget-data';
import type { PresentationUpdateThemeInput } from './schemas';
import { getOwnedProjectForMcp } from '../../lib/mcp-project-access';
import { projectToPresentation } from './mappers';
import { resolveThemeName, getValidThemeNames } from '../../lib/theme-validator';

/**
 * Handler for the presentation_update_theme tool.
 */
export async function handlePresentationUpdateTheme(
  args: PresentationUpdateThemeInput,
  auth: AuthContext
): Promise<McpToolResponse> {
  const { presentation_id } = args;

  // Validate against the catalog; any casing is accepted and the canonical
  // name is what gets stored.
  const resolved = resolveThemeName(args.theme_name);
  if (!resolved.ok) {
    const validNames = getValidThemeNames();
    return Errors.validationError(
      `Invalid theme name '${args.theme_name}'. Valid themes: ${validNames.join(', ')}. ` +
      `Use the 'verto://themes' resource to browse all available themes.`
    );
  }
  const theme_name = resolved.name;

  // Ownership check
  const project = await getOwnedProjectForMcp(presentation_id, auth.userId);

  if (!project) {
    return Errors.notFound('Presentation', presentation_id);
  }

  // Apply theme
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { themeName: theme_name },
  });

  const presentation = projectToPresentation(updated);

  // Plan 10 F4: the result re-renders the theme studio with the applied
  // theme as current, so the apply flow loops entirely inside the widget.
  return mcpSuccess(presentation, {
    widget: createThemeStudioWidgetData({ presentation }),
  });
}
