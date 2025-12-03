// lib/layoutTemplates.ts - Available Layout Templates

import { LayoutTemplate } from "./state";

/**
 * All available layout types for AI selection
 */
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // === BASIC LAYOUTS ===
  {
    type: "blank-card",
    slideName: "Blank card",
    className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
    requiresImage: false,
    contentStructure: "title-content",
  },
  
  // === IMAGE + TEXT LAYOUTS ===
  {
    type: "accentLeft",
    slideName: "Accent left",
    className: "min-h-[300px]",
    requiresImage: true,
    contentStructure: "image-text",
  },
  {
    type: "accentRight",
    slideName: "Accent Right",
    className: "min-h-[300px]",
    requiresImage: true,
    contentStructure: "image-text",
  },
  {
    type: "imageAndText",
    slideName: "Image and text",
    className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
    requiresImage: true,
    contentStructure: "image-text",
  },
  {
    type: "textAndImage",
    slideName: "Text and image",
    className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
    requiresImage: true,
    contentStructure: "image-text",
  },
  
  // === COLUMN LAYOUTS ===
  {
    type: "twoColumns",
    slideName: "Two columns",
    className: "p-4 mx-auto flex justify-center items-center",
    requiresImage: false,
    contentStructure: "two-column",
  },
  {
    type: "twoColumnsWithHeadings",
    slideName: "Two columns with headings",
    className: "p-4 mx-auto flex justify-center items-center",
    requiresImage: false,
    contentStructure: "two-column",
  },
  {
    type: "threeColumns",
    slideName: "Three columns",
    className: "p-4 mx-auto flex justify-center items-center",
    requiresImage: false,
    contentStructure: "three-column",
  },
  {
    type: "threeColumnsWithHeadings",
    slideName: "Three columns with headings",
    className: "p-4 mx-auto flex justify-center items-center",
    requiresImage: false,
    contentStructure: "three-column",
  },
  {
    type: "fourColumns",
    slideName: "Four columns",
    className: "p-4 mx-auto flex justify-center items-center",
    requiresImage: false,
    contentStructure: "four-column",
  },
  
  // === IMAGE GRID LAYOUTS ===
  {
    type: "twoImageColumns",
    slideName: "Two Image Columns",
    className: "p-4 mx-auto flex justify-center items-center",
    requiresImage: true,
    contentStructure: "image-grid",
  },
  {
    type: "threeImageColumns",
    slideName: "Three Image Columns",
    className: "p-4 mx-auto flex justify-center items-center",
    requiresImage: true,
    contentStructure: "image-grid",
  },
  {
    type: "fourImageColumns",
    slideName: "Four Image Columns",
    className: "p-4 mx-auto flex justify-center items-center",
    requiresImage: true,
    contentStructure: "image-grid",
  },
  
  // === ADVANCED SPECIALIZED LAYOUTS ===
  {
    type: "titleAndContent",
    slideName: "Title and Content",
    className: "p-8 mx-auto flex flex-col min-h-[400px]",
    requiresImage: false,
    contentStructure: "title-content",
  },
  {
    type: "splitContentImage",
    slideName: "Split Content Image",
    className: "min-h-[400px]",
    requiresImage: true,
    contentStructure: "image-text",
  },
  {
    type: "bigNumberLayout",
    slideName: "Big Number Layout",
    className: "p-8 mx-auto flex min-h-[400px]",
    requiresImage: false,
    contentStructure: "stat-showcase",
  },
  {
    type: "comparisonLayout",
    slideName: "Comparison Layout",
    className: "p-8 mx-auto min-h-[400px]",
    requiresImage: false,
    contentStructure: "comparison",
  },
  {
    type: "quoteLayout",
    slideName: "Quote Layout",
    className: "p-12 mx-auto flex items-center justify-center min-h-[400px]",
    requiresImage: false,
    contentStructure: "quote",
  },
  {
    type: "timelineLayout",
    slideName: "Timeline Layout",
    className: "p-8 mx-auto min-h-[400px]",
    requiresImage: false,
    contentStructure: "timeline",
  },
  {
    type: "fullImageBackground",
    slideName: "Full Image Background",
    className: "relative min-h-[500px]",
    requiresImage: true,
    contentStructure: "image-overlay",
  },
  {
    type: "iconGrid",
    slideName: "Icon Grid",
    className: "p-8 mx-auto min-h-[400px]",
    requiresImage: false,
    contentStructure: "feature-grid",
  },
  {
    type: "sectionDivider",
    slideName: "Section Divider",
    className: "p-12 mx-auto flex items-center justify-center min-h-[400px] bg-linear-to-br from-primary/10 to-primary/5",
    requiresImage: false,
    contentStructure: "divider",
  },
  {
    type: "processFlow",
    slideName: "Process Flow",
    className: "p-8 mx-auto min-h-[400px]",
    requiresImage: false,
    contentStructure: "process",
  },
  {
    type: "callToAction",
    slideName: "Call to Action",
    className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
    requiresImage: false,
    contentStructure: "cta",
  },
];

/**
 * Get layout template by type
 */
export function getLayoutTemplate(type: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find(layout => layout.type === type);
}

/**
 * Get layouts that don't require images (for text-heavy content)
 */
export function getTextOnlyLayouts(): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter(layout => !layout.requiresImage);
}

/**
 * Get layouts that include images
 */
export function getImageLayouts(): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter(layout => layout.requiresImage);
}

/**
 * Layout descriptions for AI selection
 */
export const LAYOUT_DESCRIPTIONS = `
═══════════════════════════════════════════════════════════════
📐 AVAILABLE SLIDE LAYOUT TYPES (25 Total)
═══════════════════════════════════════════════════════════════

**BASIC LAYOUTS:**
1. blank-card → Simple centered title + content. Perfect for: intro slides, conclusions, simple statements

**IMAGE + TEXT LAYOUTS:**
2. accentLeft → Large image LEFT, text RIGHT. Use for: visual emphasis, product showcases
3. accentRight → Text LEFT, large image RIGHT. Use for: feature explanations with visuals
4. imageAndText → Compact image + text side by side. Use for: balanced visual content
5. textAndImage → Compact text + image side by side. Use for: text-focused with visual support
6. splitContentImage → Half screen content, half image. Use for: major concepts with strong visuals

**COLUMN LAYOUTS (List & Comparisons):**
7. twoColumns → Two equal text columns. Use for: comparisons, pros/cons, before/after
8. twoColumnsWithHeadings → Two columns with individual headings. Use for: categorized content
9. threeColumns → Three equal text columns. Use for: features, benefits, multiple points
10. threeColumnsWithHeadings → Three columns with headings. Use for: structured multi-point content
11. fourColumns → Four equal columns. Use for: many short items, feature lists

**IMAGE GRID LAYOUTS:**
12. twoImageColumns → Two columns with images + captions. Use for: product comparisons, case studies
13. threeImageColumns → Three columns with images + captions. Use for: portfolio, examples, categories
14. fourImageColumns → Four columns with images + captions. Use for: team members, gallery, features

**ADVANCED SPECIALIZED LAYOUTS:**
15. titleAndContent → Clean title above bulletList. Use for: key takeaways, action items, simple lists
16. bigNumberLayout → Giant stat/number with explanation. Use for: impressive metrics, KPIs, achievements
17. comparisonLayout → Two styled boxes side-by-side. Use for: A vs B, options, alternatives
18. quoteLayout → Large centered quote with attribution. Use for: testimonials, inspiration, expert opinions
19. timelineLayout → Vertical timeline with phases. Use for: roadmaps, history, step-by-step processes
20. fullImageBackground → Full-screen image with text overlay. Use for: dramatic openings, emotional impact
21. iconGrid → 2x2 grid of icon + title + description. Use for: features, services, benefits overview
22. sectionDivider → Large section number + title. Use for: chapter breaks, section transitions
23. processFlow → Horizontal arrow flow (Step 1 → 2 → 3). Use for: workflows, methodologies, sequences
24. callToAction → Centered CTA with title + description + button. Use for: final slide, next steps

**SELECTION STRATEGY:**
- Slide 1: Usually blank-card or titleAndContent (introduction)
- Slides 2-N-1: Mix layouts based on content type (avoid 3+ consecutive same layouts)
- Final Slide: callToAction, blank-card, or quoteLayout (conclusion/CTA)
- Use image layouts for concepts that benefit from visuals
- Use column layouts for comparisons, lists, features
- Use specialized layouts for specific purposes (stats → bigNumberLayout, quotes → quoteLayout)
- Aim for 5+ different layout types in a full presentation
`;
