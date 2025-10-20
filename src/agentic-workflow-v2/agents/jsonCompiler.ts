// agents/jsonCompiler.ts - Agent 7: Compile Final JSON Structure

import { v4 as uuidv4 } from "uuid";
import {
  AdvancedPresentationState,
  Slide,
  FinalSlideContent,
  SlideGenerationData,
} from "../lib/state";
import { getLayoutTemplate } from "../lib/layoutTemplates";

/**
 * Parse content into list format
 */
function parseListContent(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.replace(/^-|^\*|^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Check if content is a list
 */
function isListContent(content: string): boolean {
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return false;

  const listPatterns = /^[-*•]\s+|^\d+\.\s+/;
  const listLines = lines.filter((line) => listPatterns.test(line.trim()));

  return listLines.length >= lines.length * 0.5; // At least 50% are list items
}

/**
 * Build layout-specific content structure
 */
function buildLayoutContent(
  slide: SlideGenerationData,
  layoutType: string
): FinalSlideContent {
  const textComponents: FinalSlideContent[] = [];

  // Add title
  if (slide.slideTitle) {
    textComponents.push({
      id: uuidv4(),
      type: "heading1",
      name: "Slide Title",
      content: slide.slideTitle,
    });
  }

  // Add content based on type
  if (slide.slideContent) {
    if (isListContent(slide.slideContent)) {
      textComponents.push({
        id: uuidv4(),
        type: "bulletList",
        name: "Bullet Points",
        content: parseListContent(slide.slideContent),
      });
    } else {
      textComponents.push({
        id: uuidv4(),
        type: "paragraph",
        name: "Main Content",
        content: slide.slideContent,
      });
    }
  }

  // Build layout based on type
  switch (layoutType) {
    case "accentLeft":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        restrictDropTo: true,
        content: [
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Resizable column",
            restrictToDrop: true,
            content: [
              {
                id: uuidv4(),
                type: "image",
                name: "Image",
                content: slide.imageUrl || "",
                alt: slide.slideTitle || slide.outline,
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: textComponents,
                className: "w-full h-full p-8 flex justify-center items-center",
              },
            ],
          },
        ],
      };

    case "accentRight":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Resizable column",
            restrictToDrop: true,
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: textComponents,
                className: "w-full h-full p-8 flex justify-center items-center",
              },
              {
                id: uuidv4(),
                type: "image",
                name: "Image",
                restrictToDrop: true,
                content: slide.imageUrl || "",
                alt: slide.slideTitle || slide.outline,
              },
            ],
          },
        ],
      };

    case "imageAndText":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Image and text",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    className: "p-3",
                    content: slide.imageUrl || "",
                    alt: slide.slideTitle || slide.outline,
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: textComponents,
                className: "w-full h-full p-8 flex justify-center items-center",
              },
            ],
          },
        ],
      };

    case "textAndImage":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Text and image",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: textComponents,
                className: "w-full h-full p-8 flex justify-center items-center",
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    className: "p-3",
                    content: slide.imageUrl || "",
                    alt: slide.slideTitle || slide.outline,
                  },
                ],
              },
            ],
          },
        ],
      };

    case "twoColumns":
      // Split content into two parts
      const paragraphs = slide.slideContent?.split("\n\n") || [];
      const half = Math.ceil(paragraphs.length / 2);
      
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Two columns",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: paragraphs.slice(0, half).join("\n\n"),
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: paragraphs.slice(half).join("\n\n"),
                placeholder: "Start typing...",
              },
            ],
          },
        ],
      };

    case "twoColumnsWithHeadings":
      const items = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const midpoint = Math.ceil(items.length / 2);

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Two columns with headings",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Column 1",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: items.slice(0, midpoint).join("\n"),
                    placeholder: "Start typing...",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Column 2",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: items.slice(midpoint).join("\n"),
                    placeholder: "Start typing...",
                  },
                ],
              },
            ],
          },
        ],
      };

    case "threeColumns":
      const threeItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const third = Math.ceil(threeItems.length / 3);

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Three columns",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: threeItems.slice(0, third).join("\n"),
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: threeItems.slice(third, third * 2).join("\n"),
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: threeItems.slice(third * 2).join("\n"),
                placeholder: "Start typing...",
              },
            ],
          },
        ],
      };

    case "threeColumnsWithHeadings":
      const threeHeadingItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const thirdHeading = Math.ceil(threeHeadingItems.length / 3);

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Three columns with headings",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Column 1",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: threeHeadingItems.slice(0, thirdHeading).join("\n"),
                    placeholder: "Start typing...",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Column 2",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: threeHeadingItems.slice(thirdHeading, thirdHeading * 2).join("\n"),
                    placeholder: "Start typing...",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Column 3",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: threeHeadingItems.slice(thirdHeading * 2).join("\n"),
                    placeholder: "Start typing...",
                  },
                ],
              },
            ],
          },
        ],
      };

    case "fourColumns":
      const fourItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const quarter = Math.ceil(fourItems.length / 4);

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Four columns",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: fourItems.slice(0, quarter).join("\n"),
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: fourItems.slice(quarter, quarter * 2).join("\n"),
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: fourItems.slice(quarter * 2, quarter * 3).join("\n"),
                placeholder: "Start typing...",
              },
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: fourItems.slice(quarter * 3).join("\n"),
                placeholder: "Start typing...",
              },
            ],
          },
        ],
      };

    case "twoImageColumns":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Two Image Columns",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    className: "p-3",
                    content: slide.imageUrl || "",
                    alt: `${slide.slideTitle} - Image 1`,
                  },
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Feature 1",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: slide.slideContent?.split("\n")[0] || "",
                    placeholder: "Start typing...",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    className: "p-3",
                    content: slide.imageUrl || "",
                    alt: `${slide.slideTitle} - Image 2`,
                  },
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Feature 2",
                    placeholder: "Heading 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: slide.slideContent?.split("\n")[1] || "",
                    placeholder: "Start typing...",
                  },
                ],
              },
            ],
          },
        ],
      };

    case "threeImageColumns":
      const threeImageItems = parseListContent(slide.slideContent || "");
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Three Image Columns",
            className: "border",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    className: "p-3",
                    content: slide.imageUrl || "",
                    alt: `${slide.slideTitle} - Image 1`,
                  },
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: threeImageItems[0] || "Item 1",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: threeImageItems[3] || "",
                    placeholder: "Description...",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    className: "p-3",
                    content: slide.imageUrl || "",
                    alt: `${slide.slideTitle} - Image 2`,
                  },
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: threeImageItems[1] || "Item 2",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: threeImageItems[4] || "",
                    placeholder: "Description...",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    className: "p-3",
                    content: slide.imageUrl || "",
                    alt: `${slide.slideTitle} - Image 3`,
                  },
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: threeImageItems[2] || "Item 3",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: threeImageItems[5] || "",
                    placeholder: "Description...",
                  },
                ],
              },
            ],
          },
        ],
      };

    case "fourImageColumns":
      const fourImageItems = parseListContent(slide.slideContent || "");
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Untitled Card",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Four Image Columns",
            className: "border",
            content: Array.from({ length: 4 }, (_, i) => ({
              id: uuidv4(),
              type: "column",
              name: "Column",
              content: [
                {
                  id: uuidv4(),
                  type: "image",
                  name: "Image",
                  className: "p-3",
                  content: slide.imageUrl || "",
                  alt: `${slide.slideTitle} - Image ${i + 1}`,
                },
                {
                  id: uuidv4(),
                  type: "heading3",
                  name: "Heading3",
                  content: fourImageItems[i] || `Item ${i + 1}`,
                },
                {
                  id: uuidv4(),
                  type: "paragraph",
                  name: "Paragraph",
                  content: fourImageItems[i + 4] || "",
                  placeholder: "Description...",
                },
              ],
            })),
          },
        ],
      };

    case "titleAndContent":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Slide Title",
            className: "mb-6",
          },
          {
            id: uuidv4(),
            type: "bulletList",
            name: "Bullet List",
            content: isListContent(slide.slideContent || "")
              ? parseListContent(slide.slideContent || "")
              : [slide.slideContent || ""],
          },
        ],
      };

    case "splitContentImage":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Resizable column",
            restrictToDrop: true,
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading2",
                    name: "Heading2",
                    content: slide.slideTitle || "",
                    placeholder: "Section Title",
                  },
                  {
                    id: uuidv4(),
                    type: "bulletList",
                    name: "Bullet List",
                    content: isListContent(slide.slideContent || "")
                      ? parseListContent(slide.slideContent || "")
                      : [slide.slideContent || ""],
                  },
                ],
                className: "w-full h-full p-8",
              },
              {
                id: uuidv4(),
                type: "image",
                name: "Image",
                restrictToDrop: true,
                content: slide.imageUrl || "",
                alt: slide.slideTitle || slide.outline,
                className: "w-full h-full object-cover",
              },
            ],
          },
        ],
      };

    case "bigNumberLayout":
      // Extract first number/stat from content
      const statMatch = slide.slideContent?.match(/\d+[%$]?|\$\d+/);
      const bigStat = statMatch ? statMatch[0] : "47%";
      
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Resizable column",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                className: "flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8",
                content: [
                  {
                    id: uuidv4(),
                    type: "title",
                    name: "Big Number",
                    content: bigStat,
                    className: "text-6xl font-bold text-center",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                className: "p-4",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading2",
                    name: "Heading2",
                    content: slide.slideTitle || "",
                    placeholder: "Metric Title",
                  },
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: slide.slideContent?.replace(bigStat, "").trim() || "",
                    placeholder: "Description...",
                  },
                ],
              },
            ],
          },
        ],
      };

    case "comparisonLayout":
      const comparisonItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const halfComparison = Math.ceil(comparisonItems.length / 2);

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Comparison Title",
            className: "mb-6 text-center",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Resizable column",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                className: "border-2 border-primary/20 rounded-lg p-6 bg-green-50 dark:bg-green-950/20",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Option A",
                    className: "text-center text-green-600 dark:text-green-400",
                  },
                  {
                    id: uuidv4(),
                    type: "bulletList",
                    name: "Bullet List",
                    content: comparisonItems.slice(0, halfComparison),
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Column",
                className: "border-2 border-primary/20 rounded-lg p-6 bg-blue-50 dark:bg-blue-950/20",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Heading3",
                    content: "Option B",
                    className: "text-center text-blue-600 dark:text-blue-400",
                  },
                  {
                    id: uuidv4(),
                    type: "bulletList",
                    name: "Bullet List",
                    content: comparisonItems.slice(halfComparison),
                  },
                ],
              },
            ],
          },
        ],
      };

    case "quoteLayout":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        className: "max-w-4xl",
        content: [
          {
            id: uuidv4(),
            type: "blockquote",
            name: "Blockquote",
            content: slide.slideContent || "",
            className: "text-3xl font-medium italic text-center",
          },
          {
            id: uuidv4(),
            type: "paragraph",
            name: "Author",
            content: `— ${slide.slideTitle || ""}`,
            className: "text-right text-muted-foreground mt-4",
          },
        ],
      };

    case "timelineLayout":
      const timelineItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const timelineSteps = Math.min(timelineItems.length, 4);

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Timeline Title",
            className: "mb-8 text-center",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Resizable column",
            className: "gap-4",
            content: Array.from({ length: timelineSteps }, (_, i) => ({
              id: uuidv4(),
              type: "column",
              name: `Step ${i + 1}`,
              className: `border-l-4 border-primary${i > 0 ? `/${100 - i * 20}` : ""} pl-4`,
              content: [
                {
                  id: uuidv4(),
                  type: "heading3",
                  name: "Heading3",
                  content: timelineItems[i] || `Phase ${i + 1}`,
                  className: "text-primary",
                },
                {
                  id: uuidv4(),
                  type: "paragraph",
                  name: "Paragraph",
                  content: timelineItems[i + timelineSteps] || "",
                  placeholder: "Description...",
                },
              ],
            })),
          },
        ],
      };

    case "fullImageBackground":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "image",
            name: "Background Image",
            content: slide.imageUrl || "",
            alt: slide.slideTitle || "Background",
            className: "absolute inset-0 w-full h-full object-cover opacity-30",
          },
          {
            id: uuidv4(),
            type: "column",
            name: "Content",
            className: "relative z-10 p-12 flex flex-col justify-center h-full",
            content: [
              {
                id: uuidv4(),
                type: "title",
                name: "Title",
                content: slide.slideTitle || "",
                placeholder: "Overlay Title",
                className: "text-white drop-shadow-lg",
              },
              {
                id: uuidv4(),
                type: "paragraph",
                name: "Paragraph",
                content: slide.slideContent || "",
                placeholder: "Your message here...",
                className: "text-white drop-shadow-lg mt-4",
              },
            ],
          },
        ],
      };

    case "iconGrid":
      const gridItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const icons = ["✓", "★", "⚡", "🎯"];

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Features / Benefits",
            className: "mb-8 text-center",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Grid",
            className: "grid grid-cols-2 gap-6",
            content: Array.from({ length: Math.min(4, gridItems.length) }, (_, i) => ({
              id: uuidv4(),
              type: "column",
              name: `Item ${i + 1}`,
              className: "text-center p-4 rounded-lg border",
              content: [
                {
                  id: uuidv4(),
                  type: "heading3",
                  name: "Icon/Number",
                  content: icons[i],
                  className: "text-4xl mb-2",
                },
                {
                  id: uuidv4(),
                  type: "heading4",
                  name: "Title",
                  content: gridItems[i] || `Feature ${i + 1}`,
                },
                {
                  id: uuidv4(),
                  type: "paragraph",
                  name: "Description",
                  content: gridItems[i + 4] || "",
                  placeholder: "Brief description",
                  className: "text-sm",
                },
              ],
            })),
          },
        ],
      };

    case "sectionDivider":
      // Extract section number from title if present
      const sectionMatch = slide.slideTitle?.match(/\d+/);
      const sectionNum = sectionMatch ? sectionMatch[0] : "02";

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        className: "text-center",
        content: [
          {
            id: uuidv4(),
            type: "heading1",
            name: "Section Number",
            content: sectionNum,
            className: "text-7xl font-bold text-primary/30 mb-4",
          },
          {
            id: uuidv4(),
            type: "title",
            name: "Section Title",
            content: slide.slideTitle?.replace(/\d+/, "").trim() || "",
            placeholder: "Section Name",
            className: "text-5xl",
          },
        ],
      };

    case "processFlow":
      const processSteps = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const numSteps = Math.min(processSteps.length, 3);

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Process Title",
            className: "mb-8 text-center",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Flow Steps",
            className: "flex items-center gap-2",
            content: Array.from({ length: numSteps }, (_, i) => [
              {
                id: uuidv4(),
                type: "column",
                name: `Step ${i + 1}`,
                className: "flex-1 bg-primary/10 rounded-lg p-6 text-center",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading3",
                    name: "Step Number",
                    content: `${i + 1}`,
                    className: "text-2xl font-bold text-primary mb-2",
                  },
                  {
                    id: uuidv4(),
                    type: "heading4",
                    name: "Step Title",
                    content: processSteps[i] || `Step ${i + 1}`,
                  },
                ],
              },
              // Add arrow between steps (except after last step)
              ...(i < numSteps - 1 ? [{
                id: uuidv4(),
                type: "paragraph",
                name: "Arrow",
                content: "→",
                className: "text-3xl text-primary",
              }] : []),
            ]).flat(),
          },
        ],
      };

    case "callToAction":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        className: "max-w-3xl",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            placeholder: "Ready to Get Started?",
            className: "mb-4",
          },
          {
            id: uuidv4(),
            type: "paragraph",
            name: "Description",
            content: slide.slideContent || "",
            placeholder: "Brief description of what action you want them to take...",
            className: "text-xl mb-8 text-muted-foreground",
          },
          {
            id: uuidv4(),
            type: "customButton",
            name: "CTA Button",
            content: "Get Started →",
            link: "#",
            bgColor: "#3b82f6",
            className: "inline-block px-8 py-4 rounded-lg font-semibold",
          },
        ],
      };

    case "blank-card":
    default:
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: textComponents,
      };
  }
}

/**
 * Compile a single slide into final JSON structure
 */
function compileSingleSlide(slide: SlideGenerationData): Slide {
  const layoutType = slide.layoutType || "blank-card";
  const template = getLayoutTemplate(layoutType);
  
  const content = buildLayoutContent(slide, layoutType);

  return {
    id: uuidv4(),
    slideName: slide.outline,
    type: layoutType,
    className: template?.className || "p-8 mx-auto flex justify-center items-center min-h-[200px]",
    content: content,
  };
}

/**
 * Agent 7: JSON Compiler
 * 
 * Purpose: Compiles all slide data into final presentation JSON
 * - Validates all required data is present
 * - Builds proper nested structure
 * - Ensures schema compliance
 * 
 * @param state - Current graph state
 * @returns Updated state with final JSON
 */
export async function runJsonCompiler(
  state: AdvancedPresentationState
): Promise<Partial<AdvancedPresentationState>> {
  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│  📦 AGENT 7: JSON Compiler             │");
  console.log("└─────────────────────────────────────────┘");

  if (!state.slideData || state.slideData.length === 0) {
    console.error("🔴 Cannot compile JSON, no slide data available.");
    return {
      error: "No slide data was generated to compile.",
    };
  }

  try {
    console.log(`📦 Compiling ${state.slideData.length} slides into final JSON...`);

    // Validate all slides have required data
    const incompleteSlides = state.slideData.filter(
      (slide) => !slide.slideTitle || !slide.slideContent || !slide.layoutType
    );

    if (incompleteSlides.length > 0) {
      console.warn(`⚠️  ${incompleteSlides.length} slides have incomplete data`);
    }

    // Compile all slides
    const finalPresentation: Slide[] = state.slideData.map(compileSingleSlide);

    console.log("✅ Presentation JSON compiled successfully:");
    finalPresentation.forEach((slide, i) => {
      console.log(`   ${i + 1}. ${slide.slideName} (${slide.type})`);
    });

    return {
      finalPresentationJson: finalPresentation,
      currentStep: "JSON Compiled",
      progress: 85, // 85% complete
    };
  } catch (error) {
    console.error("🔴 Error during JSON compilation:", error);
    return {
      error: `Failed to compile JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
