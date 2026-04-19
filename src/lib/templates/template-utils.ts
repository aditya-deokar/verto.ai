// src/lib/templates/template-utils.ts
// Utility functions for template placeholder handling and validation

import type { Slide, ContentItem } from "@/lib/types";

/**
 * Extract all {{placeholder}} tokens from a template's slides
 */
export function extractPlaceholders(slides: Slide[]): {
  key: string;
  slideIndex: number;
  contentType: string;
}[] {
  const placeholders: { key: string; slideIndex: number; contentType: string }[] = [];
  const pattern = /\{\{([a-z_0-9]+)\}\}/gi;

  slides.forEach((slide, slideIndex) => {
    walkContentItem(slide.content, (item) => {
      const text = typeof item.content === "string" ? item.content : "";
      let match;
      while ((match = pattern.exec(text)) !== null) {
        placeholders.push({
          key: match[1],
          slideIndex,
          contentType: item.type,
        });
      }
      pattern.lastIndex = 0;
    });
  });

  return placeholders;
}

/**
 * Replace all {{placeholder}} tokens in template slides with generated content
 */
export function populatePlaceholders(
  slides: Slide[],
  values: Record<string, string>
): Slide[] {
  return slides.map((slide) => ({
    ...slide,
    content: replaceInContentItem(slide.content, values),
  }));
}

function replaceInContentItem(
  item: ContentItem,
  values: Record<string, string>
): ContentItem {
  const result = { ...item };

  if (typeof result.content === "string") {
    result.content = replacePlaceholders(result.content, values);
    // Also clear the placeholder field if the content was replaced
    if (result.placeholder && !result.content.includes("{{")) {
      result.placeholder = undefined;
    }
  } else if (Array.isArray(result.content)) {
    result.content = result.content.map((child: any) => {
      if (typeof child === "string") {
        return replacePlaceholders(child, values);
      }
      if (child && typeof child === "object" && "id" in child) {
        return replaceInContentItem(child as ContentItem, values);
      }
      return child;
    });
  }

  return result;
}

function replacePlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{([a-z_0-9]+)\}\}/gi, (match, key) => {
    return values[key] ?? match;
  });
}

/**
 * Walk a ContentItem tree and call the callback for each node
 */
export function walkContentItem(
  item: ContentItem,
  callback: (item: ContentItem) => void
): void {
  callback(item);
  if (Array.isArray(item.content)) {
    item.content.forEach((child: any) => {
      if (child && typeof child === "object" && "id" in child) {
        walkContentItem(child as ContentItem, callback);
      }
    });
  }
}

/**
 * Validate that a template has valid slides
 */
export function validateTemplate(slides: unknown): slides is Slide[] {
  if (!Array.isArray(slides)) return false;
  if (slides.length === 0) return false;
  return slides.every(
    (s: any) => s && typeof s.id === "string" && typeof s.slideName === "string"
  );
}

/**
 * Build a prompt context from template structure for AI content generation
 */
export function buildTemplatePromptContext(
  slides: Slide[],
  outlines: string[]
): string {
  const sections = slides.map((slide, i) => {
    const outline = outlines[i] || slide.slideName;
    const placeholders = extractPlaceholders([slide]).map((p) => p.key);
    return `Slide ${i + 1}: "${outline}" (layout: ${slide.type})${
      placeholders.length > 0 ? `\n  Placeholders: ${placeholders.join(", ")}` : ""
    }`;
  });

  return `Template Structure:\n${sections.join("\n\n")}`;
}
