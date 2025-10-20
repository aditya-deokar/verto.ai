// agents/layoutSelector.ts - Agent 4: Select Optimal Layouts (AI-Powered)

import { generateObject } from "ai";
import { model, modelConfigs } from "../lib/llm";
import { AdvancedPresentationState } from "../lib/state";
import { layoutSelectionSchema, validateSlideCount } from "../lib/validators";
import { LAYOUT_DESCRIPTIONS, getLayoutTemplate } from "../lib/layoutTemplates";

/**
 * Agent 4: Layout Selector (NEW)
 * 
 * Purpose: Intelligently selects the best layout for each slide based on content
 * - Analyzes content type and structure
 * - Selects optimal layout from available templates
 * - Ensures variety in presentation
 * 
 * @param state - Current graph state
 * @returns Updated state with layout types
 */
export async function runLayoutSelector(
  state: AdvancedPresentationState
): Promise<Partial<AdvancedPresentationState>> {
  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│  🎨 AGENT 4: Layout Selector           │");
  console.log("└─────────────────────────────────────────┘");

  if (!state.slideData || state.slideData.length === 0) {
    console.log("⚠️  No slide data to process. Skipping layout selection.");
    return {};
  }

  try {
    const slides = state.slideData;
    console.log(`🎯 Selecting layouts for ${slides.length} slides...`);

    // Format slide content for analysis
    const slidesSummary = slides
      .map((slide, index) => {
        return `Slide ${index + 1}:
  Outline: ${slide.outline}
  Title: ${slide.slideTitle}
  Content: ${slide.slideContent?.slice(0, 150)}...`;
      })
      .join("\n\n");

    const prompt = `You are an ELITE presentation designer with expertise in visual communication and layout optimization. Your mission: Select the PERFECT layout for each slide to maximize impact and engagement.

${LAYOUT_DESCRIPTIONS}

═══════════════════════════════════════════════════════════════
📊 SLIDES TO ANALYZE
═══════════════════════════════════════════════════════════════
${slidesSummary}

═══════════════════════════════════════════════════════════════
🎯 YOUR SELECTION CRITERIA
═══════════════════════════════════════════════════════════════

**Content Analysis:**
1. **Text-Heavy Content** → Use column layouts (twoColumns, threeColumns, fourColumns)
2. **Visual Concepts** → Use image layouts (accentLeft, splitContentImage, imageAndText)
3. **Statistics/Numbers** → Use bigNumberLayout for impressive metrics
4. **Comparisons** → Use comparisonLayout or twoColumnsWithHeadings
5. **Quotes** → Use quoteLayout for testimonials or inspirational messages
6. **Processes** → Use processFlow or timelineLayout for step-by-step content
7. **Features List** → Use iconGrid or threeColumnsWithHeadings
8. **Case Studies** → Use twoImageColumns or threeImageColumns with visuals
9. **Dramatic Moments** → Use fullImageBackground for emotional impact
10. **Transitions** → Use sectionDivider between major sections
11. **Conclusion** → Use callToAction for final slide with clear next steps

**Visual Variety Rules:**
- ✅ Aim for 5-8 different layout types in the presentation
- ❌ Never use same layout 3+ times consecutively
- ✅ Alternate between image-heavy and text-heavy layouts
- ❌ Don't overuse basic layouts (blank-card should be <30% of slides)
- ✅ Use specialized layouts (bigNumber, quote, timeline) when content fits

**Strategic Positioning:**
- Slide 1: titleAndContent or blank-card (strong opening)
- Early slides: Mix image + text layouts to engage visually
- Middle slides: Vary based on content (columns, grids, specialized)
- Final slide: callToAction (clear next steps) OR quoteLayout (inspirational close)

═══════════════════════════════════════════════════════════════
✨ OUTPUT REQUIREMENTS
═══════════════════════════════════════════════════════════════
For each slide, provide:
1. **layoutType:** One of the 25 available layouts
2. **reasoning:** 30-50 word explanation of WHY this layout is perfect for this content

Be bold! Use advanced layouts when they fit. Make this presentation visually stunning!

Generate layout selections for all ${slides.length} slides NOW:`;

    console.log("🤖 Calling AI to select layouts...");

    const { object } = await generateObject({
      model: model,
      schema: layoutSelectionSchema,
      prompt: prompt,
      temperature: modelConfigs.layout.temperature,
    });

    const layouts = object.layouts;

    // Validate we got selections for all slides
    validateSlideCount(layouts.length, slides.length, "Layout Selector");

    console.log(`✅ Selected layouts:`);
    layouts.forEach((layout, i) => {
      console.log(
        `   ${i + 1}. ${layout.layoutType} - ${layout.reasoning.slice(0, 50)}...`
      );
    });

    // Update slide data with layout types
    const updatedSlideData = state.slideData.map((slide, index) => {
      const selectedLayout = layouts[index];
      const template = getLayoutTemplate(selectedLayout.layoutType);
      
      return {
        ...slide,
        layoutType: selectedLayout.layoutType,
      };
    });

    return {
      slideData: updatedSlideData,
      currentStep: "Layouts Selected",
      progress: 55, // 55% complete
    };
  } catch (error) {
    console.error("🔴 Error selecting layouts:", error);
    return {
      error: `Failed to select layouts: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
