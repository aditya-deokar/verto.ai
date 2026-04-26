// lib/streamable-prompt.ts - Prompt Builder for Streamable Presentation Generation
//
// Prompt engineering principles applied:
//   • Role + task framing before any constraints
//   • Schema documented as rules, not a giant example to copy
//   • Micro-examples only for structurally tricky patterns (statBox, comparison)
//   • LAYOUT_DESCRIPTIONS injected as a live catalog — model picks the right template
//   • ID convention enforced with a prefix table
//   • Narrative arc defined as story beats, not a rigid numbered sequence
//   • Output contract is the very last thing — model reads constraints fresh before generating

import { LAYOUT_DESCRIPTIONS } from "./layoutTemplates";

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

export interface StreamablePromptOptions {
  topic: string;
  theme: string;
  /** Optional extra context: audience, tone, key message, word count hint, etc. */
  additionalContext?: string;
  /** Target slide count. Defaults to 10. Clamped to [5, 20]. */
  slideCount?: number;
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

/**
 * Convert a topic string into a short safe ID prefix.
 * "Agentic AI" → "agi"   |   "Climate Change 2025" → "cli"
 */
function topicPrefix(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .split(/\s+/)
    .map((w) => w.slice(0, 3))
    .slice(0, 2)
    .join("")
    .slice(0, 6) || "sld";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ─────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────

/**
 * Build the system + user prompt pair for streamable presentation generation.
 *
 * Returns { system, user } so callers can place them in the right API fields,
 * or call toString() / join them for single-prompt APIs.
 */
export function buildStreamablePrompt(options: StreamablePromptOptions): {
  system: string;
  user: string;
} {
  const {
    topic,
    theme,
    additionalContext,
    slideCount: rawCount = 10,
  } = options;

  const slideCount = clamp(rawCount, 5, 20);
  const prefix = topicPrefix(topic);

  // Inject live layout catalog so the model picks from real options
  const layoutCatalog = Object.entries(LAYOUT_DESCRIPTIONS)
    .map(([key, desc]) => `  • ${key}: ${desc}`)
    .join("\n");

  // ── SYSTEM ──────────────────────────────────────────
  const system = `\
You are a presentation architect. Your single job is to output a valid JSON array of slide objects — nothing else.

STYLE MANDATE
The presentation must feel like premium consulting work: precise language, concrete data points, clear hierarchy. No filler phrases ("In conclusion…", "It is important to note…"). Every sentence earns its place.

OUTPUT CONTRACT (non-negotiable)
• Respond with ONLY a raw JSON array. No markdown fences, no preamble, no commentary.
• The array must have exactly ${slideCount} slide objects, slideOrder 0 through ${slideCount - 1}.
• Every "id" in the entire output must be globally unique.
• The response must be valid JSON — parseable by JSON.parse() with no preprocessing.`;

  // ── USER ────────────────────────────────────────────
  const user = `\
Generate a complete ${slideCount}-slide presentation on the topic below.

TOPIC    : ${topic}
THEME    : ${theme}
${additionalContext ? `CONTEXT  : ${additionalContext}\n` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — SLIDE OBJECT SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each slide in the array has this shape:

{
  "id"        : "<prefix>-<number>"        // unique, e.g. "${prefix}-100"
  "type"      : "<layoutType>"             // see Layout Catalog below
  "slideName" : "<human label>"            // shown in the editor sidebar
  "slideOrder": <integer 0-based>
  "className" : "<tailwind classes>"       // see className cookbook below
  "content"   : <ContentItem>              // always a root "column" node
}

ContentItem schema (recursive):
{
  "id"        : "<type-prefix>-<number>"   // e.g. "h1-101", "bl-102", "col-103"
  "type"      : "<itemType>"               // see Item Types below
  "name"      : "<slot label>"             // e.g. "root", "title", "subtitle", "cta"
  "content"   : <string | string[] | ContentItem[]>
  "className" : "<tailwind>"               // optional
  "alt"       : "<description>"            // REQUIRED when type === "image"
}

─── ID CONVENTION ───────────────────────────────
Use a type-based prefix so IDs are human-readable at a glance:

  col-   → column (root containers)
  h1-    → heading1
  h2-    → heading2
  p-     → paragraph
  bl-    → bulletList
  nl-    → numberedList
  img-   → image
  btn-   → customButton
  bq-    → blockquote
  stat-  → statBox
  sv-    → heading2 inside a statBox (the big number)
  sl-    → paragraph inside a statBox (the label)
  tc-    → timelineCard
  cb-    → calloutBox

Slide IDs use the topic prefix: "${prefix}-<number>".
Pick numbers that are globally unique across the entire output (e.g. count up from 100).

─── ITEM TYPES ─────────────────────────────────
Leaf nodes (content = string):
  heading1, heading2, heading3, heading4 — titles and section labels
  paragraph    — body copy (2-4 sentences max per node)
  blockquote   — pull quotes or testimonials
  customButton — CTA label (keep ≤ 6 words, include →)
  image        — Unsplash URL (see Image Rules) or "[IMAGE: <query>]"
  divider      — decorative separator (content = "")

List nodes (content = string[]):
  bulletList   — unordered items (4-7 items ideal; ≤ 12 words per item)
  numberedList — ordered steps (3-6 items)

Container nodes (content = ContentItem[]):
  column       — vertical stack; use for every root and sub-container
  statBox      — metric card: must contain exactly [heading2 (value), paragraph (label)]

─── CONTENT DEPTH RULES ────────────────────────
Root structure is always:
  slide.content = { type: "column", name: "root", content: [...children] }

For MOST layouts, children of root are flat leaf/list nodes:
  [heading1 (title), paragraph (desc), bulletList (points)]

For STATS layouts (statsRow, metricDashboard, bigNumberLayout), root children
include statBox nodes, each containing their own [heading2, paragraph]:
  [heading1 (title), statBox, statBox, statBox]

For COMPARISON layouts (comparisonLayout, twoColumnsWithHeadings), root children
include two bulletList nodes side by side:
  [heading1 (title), bulletList (left/option-A), bulletList (right/option-B)]

For SECTION DIVIDER slides, root children are just [heading1 (roman numeral), heading1 (title)].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — LAYOUT CATALOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose the layout that best fits each slide's purpose. Do not repeat the same
layout type more than twice in a row.

${layoutCatalog}

─── LAYOUT → CONTENT MAPPING ───────────────────
  gradientHero / creativeHero / fullImageBackground
      → [heading1, paragraph, customButton]  + optional image
  agendaSlide
      → [heading1, bulletList (agenda items as "01 · Topic")]
  titleAndContent / iconGrid / featureShowcase
      → [heading1, paragraph?, bulletList]
  accentLeft / splitContentImage
      → [heading1, paragraph, image]
  bigNumberLayout
      → [statBox (one large metric), paragraph (context)]
  statsRow / metricDashboard
      → [heading1, statBox, statBox, statBox, ...]  (2-4 stats)
  comparisonLayout / twoColumnsWithHeadings
      → [heading1, bulletList (side A), bulletList (side B)]
  processFlow / timeline
      → [heading1, paragraph OR bulletList (steps/phases)]
  bentoGrid
      → [heading1, paragraph, bulletList, image]
  testimonialSlide
      → [blockquote, paragraph (author attribution)]
  sectionDivider
      → [heading1 (roman numeral "I", "II"…), heading1 (section title)]
  pricingTable / teamGrid / teamSlide
      → [heading1, paragraph?, bulletList]
  callToAction / thankYouSlide
      → [heading1, paragraph, paragraph?, customButton]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — CLASSNAME COOKBOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slide-level className (applied to the slide wrapper):
  Hero slides      → "h-full w-full flex items-center justify-center p-12 text-center"
  Content slides   → "h-full w-full p-8 flex flex-col"
  Stats slides     → "h-full w-full p-8 flex flex-col justify-center"
  Compact content  → "p-4 md:p-8 mx-auto flex flex-col min-h-[400px]"
  Split layouts    → "min-h-[400px]"
  Centered call-out→ "p-12 mx-auto flex items-center justify-center min-h-[400px]"

Root column className (applied to the root ContentItem of type "column"):
  Always → "flex flex-col gap-4 w-full"

Other items: omit className unless you have a specific layout reason.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — IMAGE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use Unsplash URLs in this exact format:
  https://images.unsplash.com/photo-<ID>?w=800&auto=format&fit=crop

Pick photos that are thematically relevant, not generic. Examples:
  Technology / AI  → photo-1677442136019-21780ecad995
  Data / networks  → photo-1451187580459-43490279c0fa
  Team / people    → photo-1552664730-d307ca884978
  Nature / growth  → photo-1441974231531-c6227db76b6e
  Urban / business → photo-1486406146926-c627a92ad1ab

Alternatively, use the placeholder format "[IMAGE: <descriptive search query>]"
which the renderer will resolve at runtime.

Always set "alt" to a concise description of what the image depicts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — NARRATIVE ARC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Structure the ${slideCount} slides as a compelling story with these beats.
Adapt proportionally — do not add slides that don't earn their place.

  HOOK (1 slide)       — Make the audience care immediately. Bold title, punchy subtitle, CTA.
                         Layout: gradientHero or creativeHero

  AGENDA (1 slide)     — Signal what's coming. Numbered agenda items build anticipation.
                         Layout: agendaSlide

  FOUNDATION (1-2)     — Define the core concept. What is it? Why does it exist?
                         Layout: creativeHero, accentLeft, or titleAndContent

  DETAIL (2-3)         — Go deeper. Principles, capabilities, technical specifics.
                         Layout: titleAndContent, iconGrid, processFlow

  EVIDENCE (1-2)       — Prove it. Real metrics, market data, industry adoption stats.
                         Layout: bigNumberLayout, statsRow, or metricDashboard

  CONTRAST (1)         — Show the before/after. What does the world look like without this?
                         Layout: comparisonLayout or twoColumnsWithHeadings

  ECOSYSTEM (1)        — Situate it. Players, frameworks, tools, components.
                         Layout: bentoGrid or featureShowcase

  MOMENTUM (1)         — Show movement. A timeline, a roadmap, or growth trajectory.
                         Layout: timeline or processFlow

  CREDIBILITY (1)      — Social proof. A quote from a respected voice in the field.
                         Layout: testimonialSlide

  CLOSE (1 slide)      — The ask. What should the audience do next?
                         Layout: thankYouSlide or callToAction

For longer decks (12+), add sectionDivider slides between major acts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — MICRO-EXAMPLES (tricky patterns only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── statBox (inside a statsRow slide) ──
{
  "id": "stat-210", "name": "s1", "type": "statBox",
  "content": [
    { "id": "sv-211", "name": "value", "type": "heading2", "content": "4.2×" },
    { "id": "sl-212", "name": "label", "type": "paragraph",
      "content": "faster time-to-market vs. manual processes" }
  ]
}

── comparisonLayout (two bullet lists, no extra wrappers) ──
"content": [
  { "id": "h1-220", "name": "title",     "type": "heading1",  "content": "Before vs. After" },
  { "id": "bl-221", "name": "before",    "type": "bulletList",
    "content": ["Manual, error-prone", "Weeks of iteration", "Siloed knowledge"] },
  { "id": "bl-222", "name": "after",     "type": "bulletList",
    "content": ["Automated, consistent", "Hours of iteration", "Shared institutional memory"] }
]

── sectionDivider ──
"content": [
  { "id": "h1-230", "name": "section-num",   "type": "heading1", "content": "II" },
  { "id": "h1-231", "name": "section-title", "type": "heading1", "content": "Implementation" }
]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — CONTENT QUALITY CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before emitting each slide, mentally verify:

  ✓ heading1 content is ≤ 8 words (punchy, not a full sentence)
  ✓ paragraph content is 1-3 sentences, specific and factual
  ✓ bulletList items start with a bold keyword or number (e.g. "Latency — sub-200ms p99")
  ✓ statBox value is a number, percentage, multiplier, or dollar amount — NOT a phrase
  ✓ customButton ends with → and is ≤ 6 words
  ✓ Every image node has an "alt" field
  ✓ No two consecutive slides share the same layout type
  ✓ No placeholder text ("Lorem ipsum", "Insert text here", "TBD")
  ✓ Content is specific to "${topic}" — not generic presentation filler

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Output the JSON array now. Start with [ and end with ]. No other text.`;

  return { system, user };
}

/**
 * Convenience: flatten to a single prompt string for APIs that don't
 * support separate system/user fields.
 */
export function buildStreamablePromptFlat(options: StreamablePromptOptions): string {
  const { system, user } = buildStreamablePrompt(options);
  return `${system}\n\n${user}`;
}