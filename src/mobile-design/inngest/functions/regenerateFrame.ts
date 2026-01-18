import { generateText } from "ai";
import { inngest } from "../client";
import { GENERATION_SYSTEM_PROMPT } from "@/mobile-design/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/mobile-design/lib/themes";
import { unsplashTool } from "../tool";
import { openrouter } from "@/mobile-design/lib/openrouter";

export const regenerateFrame = inngest.createFunction(
  { id: "regenerate-frame" },
  { event: "ui/regenerate.frame" },
  async ({ event, step }) => {
    const {
      userId,
      projectId,
      frameId,
      frameData,
      theme: themeId,
    } = event.data;

    // Generate new frame
    await step.run("regenerate-screen", async () => {
      const selectedTheme = THEME_LIST.find((t) => t.id === themeId);

      // Combine the Theme Styles + Base Variable
      const fullThemeCSS = `
        ${BASE_VARIABLES}
        ${selectedTheme?.style || ""}
      `;

      // Get existing frame for context
      const existingFrame = await prisma.mobileFrame.findUnique({
        where: { id: frameId },
      });

      if (!existingFrame) {
        throw new Error("Frame not found");
      }

      const result = await generateText({
        model: openrouter("google/gemini-3-pro-preview"),
        system: GENERATION_SYSTEM_PROMPT,
        tools: {
          searchUnsplash: unsplashTool,
        },
        maxSteps: 5,
        prompt: `
        REGENERATE THIS SCREEN with improvements and variations

        ORIGINAL SCREEN TITLE: ${frameData.title}
        ORIGINAL SCREEN DESCRIPTION: ${frameData.description}
        ORIGINAL SCREEN HTML: ${existingFrame.htmlContent}

        THEME VARIABLES (Reference ONLY - already defined in parent, do NOT redeclare these): ${fullThemeCSS}

        CRITICAL REQUIREMENTS - READ CAREFULLY:
        1. **PRESERVE the overall structure and layout but improve and vary the content**
          - Keep the same screen type and purpose
          - Maintain similar layout but with variations
          - Update content, images, and styling for freshness
          - Keep the same HTML structure pattern

        2. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
          Use Tailwind classes for layout, spacing, typography, shadows, etc.
          Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
        3. **All content must be inside a single root <div> that controls the layout.**
          - No overflow classes on the root.
          - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
        4. **For absolute overlays (maps, bottom sheets, modals, etc.):**
          - Use \`relative w-full h-screen\` on the top div of the overlay.
        5. **For regular content:**
          - Use \`w-full h-full min-h-screen\` on the top div.
        6. **Do not use h-screen on inner content unless absolutely required.**
          - Height must grow with content; content must be fully visible inside an iframe.
        7. **For z-index layering:**
          - Ensure absolute elements do not block other content unnecessarily.
        8. **Output raw HTML only, starting with <div>.**
          - Do not include markdown, comments, <html>, <body>, or <head>.
        9. **Ensure iframe-friendly rendering:**
            - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.
        Generate the complete, production-ready HTML for this screen now
        `.trim(),
      });

      let finalHtml = result.text ?? "";
      const match = finalHtml.match(/<div[\s\S]*<\/div>/);
      finalHtml = match ? match[0] : finalHtml;
      finalHtml = finalHtml.replace(/```/g, "");

      // Update the frame
      const updatedFrame = await prisma.mobileFrame.update({
        where: {
          id: frameId,
        },
        data: {
          htmlContent: finalHtml,
        },
      });

      return { success: true, frame: updatedFrame };
    });

    return { success: true };
  }
);
