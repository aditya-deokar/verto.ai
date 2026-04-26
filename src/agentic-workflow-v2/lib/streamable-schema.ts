// lib/streamable-schema.ts - Zod Schema for Streamable Single-Agent Presentation Generation
//
// This schema defines the structured output for a SINGLE AI agent that generates
// an entire presentation in one pass. The output is directly compatible with the
// existing Slide/ContentItem types used by useSlideStore.
//
// Root shape: Slide[]  (flat array — matches JSON output format exactly)

import { z } from "zod";

// ─────────────────────────────────────────────────────
// ContentItem type enum
// ─────────────────────────────────────────────────────

/**
 * All content item types supported by the renderer.
 * Only types that appear in the JSON example are marked (*); the rest are
 * kept for forward-compatibility with the full renderer type set.
 */
const CONTENT_ITEM_TYPES = [
  // * Used in example JSON
  "column",            // * root container
  "heading1",          // *
  "heading2",          // * (inside statBox)
  "paragraph",         // *
  "bulletList",        // *
  "image",             // *
  "customButton",      // *
  "blockquote",        // *
  "statBox",           // *

  // Additional renderer types (forward-compatible)
  "resizable-column",
  "text",
  "heading3",
  "heading4",
  "title",
  "numberedList",
  "quote",
  "divider",
  "calloutBox",
  "code",
  "codeBlock",
  "timelineCard",
  "link",
] as const;

// ─────────────────────────────────────────────────────
// ContentItem schema (recursive)
// ─────────────────────────────────────────────────────

/**
 * Recursive content item schema.
 *
 * The `content` field is a union of three shapes, matching the JSON:
 *   • string        — for leaf nodes (heading1, paragraph, customButton, blockquote, image, …)
 *   • string[]      — for list nodes (bulletList, numberedList)
 *   • ContentItem[] — for container/composite nodes (column, statBox, …)
 *
 * Uses z.lazy() to allow self-reference.
 */
const contentItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    /** Unique identifier — use a short human-readable prefix + numeric suffix, e.g. "h1-551", "col-554". */
    id: z.string().describe(
      "Unique element ID using a type-prefix + number suffix, e.g. 'h1-551', 'col-554', 'bl-557'"
    ),

    /** Renderer type — must be one of the recognised content item types. */
    type: z.enum(CONTENT_ITEM_TYPES).describe("Content item type"),

    /** Human-readable label used by the editor (e.g. 'root', 'title', 'subtitle', 'hero'). */
    name: z.string().describe(
      "Short human-readable display name for this element, e.g. 'root', 'title', 'cta', 'hero'"
    ),

    /**
     * Content payload — shape depends on `type`:
     *   • column / statBox   → ContentItem[]
     *   • bulletList         → string[]
     *   • everything else    → string
     */
    content: z
      .union([
        z.string(),
        z.array(z.string()),
        z.array(contentItemSchema),
      ])
      .describe(
        "Content payload: string for leaf nodes, string[] for list nodes, ContentItem[] for containers"
      ),

    /** Optional Tailwind class names applied to the rendered element. */
    className: z.string().optional().describe(
      "Optional Tailwind CSS class string, e.g. 'flex flex-col gap-4 w-full'"
    ),

    /** Alt text — required when type === 'image'; ignored otherwise. */
    alt: z.string().optional().describe(
      "Accessibility alt text — must be provided when type === 'image'"
    ),

    /** Placeholder text shown when the field is empty in the editor. */
    placeholder: z.string().optional().describe(
      "Optional placeholder text for editable fields in the editor"
    ),

    /** When true, this item may only be dropped into designated drop targets. */
    restrictToDrop: z.boolean().optional().describe(
      "If true, this item can only be dropped into specific targets"
    ),

    /** When true, only specific items may be dropped into this container. */
    restrictDropTo: z.boolean().optional().describe(
      "If true, only specific items can be dropped into this container"
    ),
  })
);

export type ContentItem = z.infer<typeof contentItemSchema>;

// ─────────────────────────────────────────────────────
// Slide schema
// ─────────────────────────────────────────────────────

/**
 * A single presentation slide.
 *
 * Matches the shape of each element in the JSON array exactly:
 * {
 *   id, type, content, className, slideName, slideOrder
 * }
 */
export const streamableSlideSchema = z.object({
  /**
   * Unique slide ID — use a short topic prefix + numeric suffix.
   * @example "agi-550", "tech-175"
   */
  id: z.string().describe(
    "Unique slide ID using a topic-prefix + number suffix, e.g. 'agi-550'"
  ),

  /**
   * Layout template name consumed by the renderer.
   * @example "gradientHero", "titleAndContent", "comparisonLayout", "statsRow"
   */
  type: z.string().describe(
    "Layout type identifier consumed by the renderer, e.g. 'gradientHero', 'titleAndContent'"
  ),

  /** Root content tree for this slide — must be a 'column' container. */
  content: contentItemSchema.describe(
    "Root content node — must be type 'column' with nested content items as its content array"
  ),

  /** Optional Tailwind class string applied to the slide wrapper element. */
  className: z.string().optional().describe(
    "Tailwind CSS classes for the slide wrapper, e.g. 'h-full w-full p-8 flex items-center'"
  ),

  /** Descriptive name shown in the slide panel / editor. */
  slideName: z.string().describe(
    "Human-readable slide name, e.g. 'Introduction', 'Key Benefits', 'Thank You'"
  ),

  /** 0-indexed position of this slide in the deck. */
  slideOrder: z
    .number()
    .int()
    .min(0)
    .describe("0-indexed slide order within the presentation deck"),
});

export type StreamableSlide = z.infer<typeof streamableSlideSchema>;

// ─────────────────────────────────────────────────────
// Presentation schema
// ─────────────────────────────────────────────────────

/**
 * Full presentation — a flat array of slides.
 *
 * This matches the JSON output shape exactly: `Slide[]`
 * (no wrapper object).
 *
 * Constraints:
 *   • Min 5 slides  — enough for a coherent deck
 *   • Max 20 slides — keeps token usage reasonable
 *   • slideOrder values should be unique and form a contiguous 0-based sequence
 */
export const streamablePresentationSchema = z
  .array(streamableSlideSchema)
  .min(5)
  .max(20)
  .describe(
    "Ordered array of 5–20 slides. Generate in sequence: slideOrder 0 = opening, last = closing."
  );

export type StreamablePresentation = z.infer<typeof streamablePresentationSchema>;

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

/**
 * Check whether a partially-streamed slide object has enough data to render.
 * Used during streaming to decide when to emit a slide to the client.
 *
 * A slide is renderable when:
 *   1. It has a `slideName` and a `type`
 *   2. Its root `content` node has a `type` and a `name`
 *   3. The root content array is non-empty (or the string content is non-empty)
 */
export function isSlideRenderable(slide: Partial<StreamableSlide>): boolean {
  if (!slide) return false;
  if (!slide.slideName || !slide.type) return false;

  const root = slide.content as any;
  if (!root) return false;
  if (!root.type || !root.name) return false;

  if (Array.isArray(root.content)) {
    return root.content.length > 0;
  }

  if (typeof root.content === "string") {
    return root.content.length > 0;
  }

  return true;
}

/**
 * Sort a (possibly unordered) array of slides by their `slideOrder` field.
 * Safe to call on partially-streamed arrays — slides without `slideOrder`
 * are pushed to the end.
 */
export function sortSlides(slides: StreamableSlide[]): StreamableSlide[] {
  return [...slides].sort(
    (a, b) => (a.slideOrder ?? Infinity) - (b.slideOrder ?? Infinity)
  );
}

/**
 * Validate a complete presentation against the schema.
 * Returns a typed result — check `success` before accessing `data`.
 */
export function validatePresentation(raw: unknown) {
  return streamablePresentationSchema.safeParse(raw);
}