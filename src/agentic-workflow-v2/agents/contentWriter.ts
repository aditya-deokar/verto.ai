// agents/contentWriter.ts - Agent 3: Write Content for All Slides (Bulk)

import { generateObject } from "ai";
import { model, modelConfigs } from "../lib/llm";
import { AdvancedPresentationState } from "../lib/state";
import { bulkContentSchema, validateSlideCount } from "../lib/validators";

/**
 * Agent 3: Content Writer (Bulk)
 * 
 * Purpose: Writes title and body content for ALL slides in a single API call
 * - More efficient than per-slide generation
 * - Ensures consistent tone and style
 * - Avoids rate limiting
 * 
 * @param state - Current graph state
 * @returns Updated state with slide titles and content
 */
export async function runContentWriter(
  state: AdvancedPresentationState
): Promise<Partial<AdvancedPresentationState>> {
  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│  ✍️  AGENT 3: Content Writer (Bulk)     │");
  console.log("└─────────────────────────────────────────┘");

  if (!state.outlines || state.outlines.length === 0) {
    console.log("⚠️  No outlines to process. Skipping content generation.");
    return {};
  }

  try {
    const outlines = state.outlines;
    const topic = state.userInput;
    const context = state.additionalContext || "";
    
    console.log(`📝 Generating content for ${outlines.length} slides...`);

    // Format outlines for prompt
    const formattedOutlines = outlines
      .map((outline, index) => `${index + 1}. ${outline}`)
      .join("\n");

    const prompt = `You are an ELITE presentation copywriter specializing in creating engaging, impactful slide content that captivates audiences and communicates ideas with clarity.

═══════════════════════════════════════════════════════════════
📋 PRESENTATION DETAILS
═══════════════════════════════════════════════════════════════
Overall Topic: "${topic}"
${context ? `Additional Context: "${context}"` : ""}

═══════════════════════════════════════════════════════════════
📝 SLIDE OUTLINES TO WRITE
═══════════════════════════════════════════════════════════════
${formattedOutlines}

═══════════════════════════════════════════════════════════════
✍️ YOUR TASK
═══════════════════════════════════════════════════════════════
For EACH outline above, generate TWO components:

**1. TITLE (Max 80 characters)**
- Compelling, clear, action-oriented
- Use power words and active voice
- Make it memorable and specific
- Examples: "Transform Your Workflow" NOT "Workflow Transformation"

**2. CONTENT (150-600 characters)**
- Structure varies based on content type:
  
  **For Concept/Explanation Slides:**
  - Start with clear definition or statement
  - Add 2-3 supporting points as bullet list
  - Use "\n-" format for bullets
  
  **For Data/Statistics Slides:**
  - Lead with the impressive number or stat
  - Explain what it means
  - Add context or comparison
  
  **For Process/Timeline Slides:**
  - Use numbered list "\n1. Step" format
  - Keep each step concise (5-10 words)
  - Focus on actions
  
  **For Comparison Slides:**
  - Use bullet points for each option
  - Highlight key differences
  - Keep parallel structure
  
  **For Examples/Case Studies:**
  - Tell a mini story
  - Include specific details
  - Show impact/results

═══════════════════════════════════════════════════════════════
🎯 CONTENT QUALITY STANDARDS
═══════════════════════════════════════════════════════════════
✅ DO:
- Write for slides (concise, scannable)
- Use bullet points liberally (format: "\n- Point")
- Include numbers and specifics when relevant
- Vary sentence structure and length
- Build logical flow slide-to-slide
- Make every word count
- Think visually (content should complement layouts)

❌ DON'T:
- Write long paragraphs or essays
- Use jargon without explanation
- Include unnecessary details
- Repeat information across slides
- Use passive voice excessively
- Create walls of text

═══════════════════════════════════════════════════════════════
📊 EXAMPLE OUTPUT FORMATS
═══════════════════════════════════════════════════════════════

**Concept Slide:**
Title: "The Power of AI in Modern Business"
Content: "Artificial Intelligence is revolutionizing how companies operate and compete:\n- Automate repetitive tasks (save 40% time)\n- Make data-driven decisions faster\n- Personalize customer experiences at scale\n- Predict trends before competitors"

**Statistics Slide:**
Title: "Market Growth: The Numbers Speak"
Content: "Global AI market reached $136B in 2023, growing 37% year-over-year.\n\nKey drivers:\n- Enterprise adoption up 3x since 2020\n- 80% of companies now invest in AI\n- Expected to hit $1.5T by 2030"

**Process Slide:**
Title: "Your 5-Step AI Implementation Roadmap"
Content: "1. Assess current capabilities and gaps\n2. Define clear business objectives\n3. Select the right AI tools and partners\n4. Train team and pilot projects\n5. Scale successful implementations"

**Comparison Slide:**
Title: "Traditional vs. AI-Powered Approach"
Content: "Traditional:\n- Manual data analysis (hours/days)\n- Limited personalization\n- Reactive decision-making\n\nAI-Powered:\n- Real-time insights (seconds)\n- Hyper-personalization at scale\n- Predictive and proactive"

═══════════════════════════════════════════════════════════════
🚀 GENERATE NOW
═══════════════════════════════════════════════════════════════
Create compelling, professional content for ALL ${outlines.length} slides in the EXACT same order. Make this presentation unforgettable!`;

    console.log("🤖 Calling AI to generate content...");

    const { object } = await generateObject({
      model: model,
      schema: bulkContentSchema,
      prompt: prompt,
      temperature: modelConfigs.content.temperature,
    });

    const slidesContent = object.slidesContent;

    // Validate we got the right number of slides
    validateSlideCount(
      slidesContent.length,
      outlines.length,
      "Content Writer"
    );

    console.log(`✅ Generated content for ${slidesContent.length} slides:`);
    slidesContent.forEach((slide, i) => {
      console.log(`   ${i + 1}. ${slide.title}`);
      console.log(`      Content: ${slide.content.slice(0, 60)}...`);
    });

    // Update slide data with titles and content
    const updatedSlideData = state.slideData.map((slide, index) => ({
      ...slide,
      slideTitle: slidesContent[index].title,
      slideContent: slidesContent[index].content,
    }));

    return {
      slideData: updatedSlideData,
      currentStep: "Content Written",
      progress: 40, // 40% complete
    };
  } catch (error) {
    console.error("🔴 Error generating content:", error);
    return {
      error: `Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
