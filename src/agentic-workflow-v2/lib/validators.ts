// lib/validators.ts - Zod Schemas for Validation

import { z } from "zod";

/**
 * Schema for outline generation
 */
export const outlineSchema = z.object({
  outlines: z
    .array(z.string())
    .min(5)
    .max(15)
    .describe("A list of 5-15 concise slide topics based on topic complexity."),
});

/**
 * Schema for a single slide's content
 */
export const singleSlideContentSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(100)
    .describe("A compelling and concise title for the slide."),
  content: z
    .string()
    .min(10)
    .max(1000)
    .describe("The main body content for the slide. Use markdown bullets (-) for lists. Keep it concise and engaging."),
});

/**
 * Schema for bulk content generation (legacy)
 */
export const bulkContentSchema = z.object({
  slidesContent: z
    .array(singleSlideContentSchema)
    .describe("An array of content objects, one for each slide outline-solid provided."),
});

/**
 * Schema for layout-aware content generation (premium)
 * Extends basic content with structured fields for specific layout types
 */
export const layoutAwareContentSchema = z.object({
  slidesContent: z
    .array(
      z.object({
        title: z
          .string()
          .min(3)
          .max(100)
          .describe("A compelling and concise title for the slide."),
        subtitle: z
          .string()
          .max(150)
          .optional()
          .describe("An optional tagline or subtitle to appear beneath the main title."),
        content: z
          .string()
          .min(10)
          .max(1000)
          .describe("The main body content. Use markdown bullets (-) for lists. Always populated as fallback."),
        // === Structured fields for premium layouts ===
        statValue: z.string().optional()
          .describe("For bigNumberLayout/statsRow: prominent stat e.g. '$4.2B', '150%', '10M+'"),
        statLabel: z.string().optional()
          .describe("For bigNumberLayout/statsRow: label for the stat e.g. 'Revenue Growth'"),
        stats: z.array(z.object({
          value: z.string().describe("Stat value e.g. '10M+', '99.9%'"),
          label: z.string().describe("Stat label e.g. 'Users', 'Uptime'"),
        })).optional()
          .describe("For statsRow (3 items) / bentoGrid (2 items): multiple stat values"),
        comparisonLabelA: z.string().optional()
          .describe("For comparisonLayout: first option label (topic-specific, NOT 'Option A')"),
        comparisonLabelB: z.string().optional()
          .describe("For comparisonLayout: second option label (topic-specific, NOT 'Option B')"),
        comparisonPointsA: z.array(z.string()).optional()
          .describe("For comparisonLayout: 3-4 bullet points for option A"),
        comparisonPointsB: z.array(z.string()).optional()
          .describe("For comparisonLayout: 3-4 bullet points for option B"),
        quoteText: z.string().optional()
          .describe("For quoteLayout: the actual quote text"),
        quoteAttribution: z.string().optional()
          .describe("For quoteLayout: who said it e.g. '— Steve Jobs'"),
        processSteps: z.array(z.object({
          stepTitle: z.string().describe("Step name"),
          stepDescription: z.string().optional().describe("Brief step description (10-15 words)"),
        })).optional()
          .describe("For processFlow/timelineLayout/timeline: 3-4 ordered steps"),
        gridItems: z.array(z.object({
          icon: z.string().describe("Single contextual emoji"),
          itemTitle: z.string().describe("Item title"),
          itemDescription: z.string().describe("One-line description"),
        })).optional()
          .describe("For iconGrid (4 items) / bentoGrid (3 insight items)"),
        ctaButtonText: z.string().optional()
          .describe("For callToAction/creativeHero: action button text e.g. 'Start Free Trial →'"),
        sectionNumber: z.string().optional()
          .describe("For sectionDivider: two-digit section number e.g. '01', '02'"),
        columnHeadings: z.array(z.string()).optional()
          .describe("For columnsWithHeadings: heading labels for each column"),
      })
    )
    .describe("An array of layout-aware content objects, one per slide."),
});

/**
 * Schema for layout selection
 */
export const layoutSelectionSchema = z.object({
  layouts: z
    .array(
      z.object({
        slideIndex: z.number().describe("Index of the slide (0-based)"),
        layoutType: z
          .enum([
            // === BASIC LAYOUTS ===
            "blank-card",
            // === IMAGE + TEXT LAYOUTS ===
            "accentLeft",
            "accentRight",
            "imageAndText",
            "textAndImage",
            // === COLUMN LAYOUTS ===
            "twoColumns",
            "twoColumnsWithHeadings",
            "threeColumns",
            "threeColumnsWithHeadings",
            "fourColumns",
            // === IMAGE GRID LAYOUTS ===
            "twoImageColumns",
            "threeImageColumns",
            "fourImageColumns",
            // === ADVANCED SPECIALIZED LAYOUTS ===
            "titleAndContent",
            "splitContentImage",
            "bigNumberLayout",
            "comparisonLayout",
            "quoteLayout",
            "timelineLayout",
            "fullImageBackground",
            "iconGrid",
            "sectionDivider",
            "processFlow",
            "callToAction",
            // === CREATIVE LAYOUTS (Premium) ===
            "creativeHero",
            "bentoGrid",
            "statsRow",
            "timeline",
          ])
          .describe("Selected layout type"),
        reasoning: z
          .string()
          .describe("Brief explanation for this layout choice"),
      })
    )
    .describe("Layout selection for each slide"),
});

/**
 * Schema for image query generation
 */
export const imageQuerySchema = z.object({
  imageQueries: z
    .array(
      z.object({
        slideIndex: z.number().describe("Index of the slide (0-based)"),
        query: z
          .string()
          .min(3)
          .max(100)
          .describe("Search query for image (optimized for stock photos)"),
        altText: z
          .string()
          .min(5)
          .max(200)
          .describe("Descriptive alt text for accessibility"),
      })
    )
    .describe("Image queries for slides that need images"),
});

/**
 * Validate that slide count matches expected count
 */
export function validateSlideCount(
  actual: number,
  expected: number,
  context: string
): void {
  if (actual !== expected) {
    throw new Error(
      `${context}: Expected ${expected} slides but got ${actual}. Please ensure the AI generates the exact number of items.`
    );
  }
}

/**
 * Validate slide data completeness
 */
export function validateSlideData(slideData: any[]): boolean {
  return slideData.every(
    (slide) =>
      slide.outline &&
      slide.slideTitle &&
      slide.slideContent &&
      slide.layoutType
  );
}
