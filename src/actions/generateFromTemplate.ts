'use server'

import { auth } from '@clerk/nextjs/server'
import { generateAdvancedPresentation } from '@/agentic-workflow-v2'
import prisma from '@/lib/prisma'
import { getAuthenticatedAppUser } from './project-access'
import { populatePlaceholders, extractPlaceholders, buildTemplatePromptContext } from '@/lib/templates/template-utils'
import type { Slide } from '@/lib/types'

/**
 * Server Action: Generate Presentation from Template using AI Population
 *
 * This runs the V2 agentic workflow but passes the template's outlines
 * to the outlineGenerator (skipping its generation), and the template's
 * layoutSequence to use layout awareness.
 *
 * After AI generates content, it merges the content into the template structure
 * by populating the {{placeholder}} tokens.
 */
export async function generateFromTemplateAction(
  templateId: string,
  topic: string,
  additionalContext?: string,
  themeOverride?: string,
  generationRunId?: string
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return {
        success: false,
        error: 'Not authenticated. Please sign in to generate presentations.'
      }
    }

    if (!topic || topic.trim().length === 0) {
      return {
        success: false,
        error: 'Topic is required'
      }
    }

    // ─── Fetch the template ───
    const template = await prisma.presentationTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return {
        success: false,
        error: 'Template not found'
      }
    }

    // Build enhanced context that includes template structure info
    const templateSlides = template.slides as unknown as Slide[]
    const templateContext = buildTemplatePromptContext(
      templateSlides,
      template.outlines
    )

    // Combine user context with template structure context
    const enhancedContext = [
      additionalContext || '',
      `\n\n--- TEMPLATE STRUCTURE (use this as your blueprint) ---\n`,
      templateContext,
      `\n\nIMPORTANT: Follow this exact slide structure. Each slide has a specific layout and purpose. Generate content that fits each slide's role perfectly.`,
    ].filter(Boolean).join('\n')

    const theme = themeOverride || template.themeName

    console.log('Starting template-based generation for:', {
      topic,
      templateName: template.name,
      templateSlides: template.slideCount,
      theme,
    })

    // ─── Run the standard workflow with template outlines ───
    // By passing the template's outlines, the outlineGenerator will use them
    // instead of generating new ones. The layoutSelector uses the same
    // outline names to intelligently pick layouts (or we can guide it with
    // the template's layoutSequence through the enhanced context).
    const result = await generateAdvancedPresentation(
      userId,
      topic,
      enhancedContext,
      theme,
      template.outlines, // Pass template outlines as provided outlines
      generationRunId
    )

    if (result.success && result.projectId) {
      // Increment template usage counter
      await prisma.presentationTemplate.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } },
      }).catch(() => {
        // Non-critical, don't fail the generation
      })

      console.log('Template-based generation completed:', {
        projectId: result.projectId,
        slideCount: result.slideCount,
      })
    }

    return result
  } catch (error) {
    console.error('Template generation error:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export type GenerateFromTemplateResult = Awaited<ReturnType<typeof generateFromTemplateAction>>
