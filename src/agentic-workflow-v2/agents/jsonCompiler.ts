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

  // Add subtitle if present
  if (slide.subtitle) {
    textComponents.push({
      id: uuidv4(),
      type: "paragraph",
      name: "Subtitle",
      content: slide.subtitle,
      className: "text-2xl text-muted-foreground mt-2 mb-4",
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
                    content: slide.columnHeadings?.[0] || "Column 1",
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
                    content: slide.columnHeadings?.[1] || "Column 2",
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
                    content: slide.columnHeadings?.[0] || "Column 1",
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
                    content: slide.columnHeadings?.[1] || "Column 2",
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
                    content: slide.columnHeadings?.[2] || "Column 3",
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
      // Use structured statValue from content writer, fallback to regex extraction
      const bigStat = slide.statValue || (slide.slideContent?.match(/\d+[%$]?|\$\d+/)?.[0]) || "47%";
      
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
                className: "flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5 rounded-lg p-8",
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
                    content: slide.statLabel || slide.slideTitle || "",
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
      // Use structured comparison fields from content writer
      const compItemsA = slide.comparisonPointsA || (
        isListContent(slide.slideContent || "")
          ? parseListContent(slide.slideContent || "").slice(0, Math.ceil(parseListContent(slide.slideContent || "").length / 2))
          : [slide.slideContent || ""]
      );
      const compItemsB = slide.comparisonPointsB || (
        isListContent(slide.slideContent || "")
          ? parseListContent(slide.slideContent || "").slice(Math.ceil(parseListContent(slide.slideContent || "").length / 2))
          : []
      );

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
                    content: slide.comparisonLabelA || "Option A",
                    className: "text-center text-green-600 dark:text-green-400",
                  },
                  {
                    id: uuidv4(),
                    type: "bulletList",
                    name: "Bullet List",
                    content: compItemsA,
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
                    content: slide.comparisonLabelB || "Option B",
                    className: "text-center text-blue-600 dark:text-blue-400",
                  },
                  {
                    id: uuidv4(),
                    type: "bulletList",
                    name: "Bullet List",
                    content: compItemsB,
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
            content: slide.quoteText || slide.slideContent || "",
            className: "text-3xl font-medium italic text-center",
          },
          {
            id: uuidv4(),
            type: "paragraph",
            name: "Author",
            content: slide.quoteAttribution || `— ${slide.slideTitle || ""}`,
            className: "text-right text-muted-foreground mt-4",
          },
        ],
      };

    case "timelineLayout":
      // Use structured processSteps from content writer, fallback to parsed content
      const hasTimelineLayoutSteps = slide.processSteps && slide.processSteps.length > 0;
      const fallbackTimelineItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const timelineSteps = hasTimelineLayoutSteps 
        ? Math.min(slide.processSteps!.length, 4) 
        : Math.min(fallbackTimelineItems.length, 4);

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
                  content: hasTimelineLayoutSteps ? slide.processSteps![i].stepTitle : (fallbackTimelineItems[i] || `Phase ${i + 1}`),
                  className: "text-primary",
                },
                {
                  id: uuidv4(),
                  type: "paragraph",
                  name: "Paragraph",
                  content: hasTimelineLayoutSteps ? (slide.processSteps![i].stepDescription || "") : (fallbackTimelineItems[i + timelineSteps] || ""),
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
      // Use structured gridItems from content writer, fallback to parsed content
      const fallbackGridItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const defaultIcons = ["✓", "★", "⚡", "🎯"];
      const hasStructuredGrid = slide.gridItems && slide.gridItems.length > 0;
      const gridCount = hasStructuredGrid ? Math.min(4, slide.gridItems!.length) : Math.min(4, fallbackGridItems.length);

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
            content: Array.from({ length: gridCount }, (_, i) => ({
              id: uuidv4(),
              type: "column",
              name: `Item ${i + 1}`,
              className: "text-center p-4 rounded-lg border",
              content: [
                {
                  id: uuidv4(),
                  type: "heading3",
                  name: "Icon/Number",
                  content: hasStructuredGrid ? slide.gridItems![i].icon : defaultIcons[i],
                  className: "text-4xl mb-2",
                },
                {
                  id: uuidv4(),
                  type: "heading4",
                  name: "Title",
                  content: hasStructuredGrid ? slide.gridItems![i].itemTitle : (fallbackGridItems[i] || `Feature ${i + 1}`),
                },
                {
                  id: uuidv4(),
                  type: "paragraph",
                  name: "Description",
                  content: hasStructuredGrid ? slide.gridItems![i].itemDescription : (fallbackGridItems[i + 4] || ""),
                  placeholder: "Brief description",
                  className: "text-sm",
                },
              ],
            })),
          },
        ],
      };

    case "sectionDivider":
      // Use structured sectionNumber, fallback to regex extraction
      const sectionNum = slide.sectionNumber || (slide.slideTitle?.match(/\d+/)?.[0]) || "02";

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
      // Use structured processSteps from content writer, fallback to parsed content
      const hasStructuredSteps = slide.processSteps && slide.processSteps.length > 0;
      const fallbackSteps = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const numSteps = hasStructuredSteps ? Math.min(slide.processSteps!.length, 3) : Math.min(fallbackSteps.length, 3);

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
                    content: hasStructuredSteps ? slide.processSteps![i].stepTitle : (fallbackSteps[i] || `Step ${i + 1}`),
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
            content: slide.ctaButtonText || "Get Started →",
            link: "#",
            bgColor: "#3b82f6",
            className: "inline-block px-8 py-4 rounded-lg font-semibold",
          },
        ],
      };

    case "creativeHero":
      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Creative Hero",
            content: [
              {
                id: uuidv4(),
                type: "column",
                name: "Left Column",
                className: "flex flex-col justify-center",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading1",
                    name: "Heading1",
                    content: slide.slideTitle || "",
                    className: "text-6xl font-black tracking-tight",
                  },
                  ...(slide.subtitle ? [{
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Subtitle",
                    content: slide.subtitle,
                    className: "text-2xl text-muted-foreground font-medium mt-6",
                  }] : []),
                  {
                    id: uuidv4(),
                    type: "paragraph",
                    name: "Paragraph",
                    content: slide.slideContent || "",
                    className: "text-xl text-muted-foreground mt-4",
                  },
                  {
                    id: uuidv4(),
                    type: "customButton",
                    name: "Button",
                    content: slide.ctaButtonText || "Explore More",
                    link: "#",
                    bgColor: "#000000",
                    className: "mt-8 w-fit",
                  },
                ],
              },
              {
                id: uuidv4(),
                type: "column",
                name: "Right Column",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    content: slide.imageUrl || "",
                    alt: slide.slideTitle || "Hero Image",
                    className:
                      "rounded-3xl object-cover h-full shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-500",
                  },
                ],
              },
            ],
          },
        ],
      };

    case "bentoGrid":
      // Use structured stats/gridItems from content writer, fallback to parsed content
      const hasBentoStats = slide.stats && slide.stats.length >= 2;
      const hasBentoInsights = slide.gridItems && slide.gridItems.length > 0;
      const fallbackBentoItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const bentoStat1 = hasBentoStats ? `${slide.stats![0].value}\n${slide.stats![0].label}` : (fallbackBentoItems[0] || "12.5k");
      const bentoStat2 = hasBentoStats ? `${slide.stats![1].value}\n${slide.stats![1].label}` : (fallbackBentoItems[1] || "98%");
      const bentoInsights = hasBentoInsights
        ? slide.gridItems!.map(item => `${item.icon} ${item.itemTitle}: ${item.itemDescription}`)
        : (fallbackBentoItems.length > 2 ? fallbackBentoItems.slice(2) : ["Key insight point 1", "Key insight point 2", "Key insight point 3"]);

      return {
        id: uuidv4(),
        type: "column",
        name: "Main Column",
        content: [
          {
            id: uuidv4(),
            type: "title",
            name: "Title",
            content: slide.slideTitle || "",
            className: "mb-6",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Bento Grid Layout",
            content: [
              // Column 1: Image Card
              {
                id: uuidv4(),
                type: "column",
                name: "Col 1",
                content: [
                  {
                    id: uuidv4(),
                    type: "image",
                    name: "Image",
                    content: slide.imageUrl || "",
                    alt: slide.slideTitle || "Dashboard Image",
                    className: "h-full object-cover rounded-2xl",
                  },
                ],
                className:
                  "h-full bg-muted/20 rounded-3xl border border-border/50 p-2",
              },
              // Column 2: Stat Boxes
              {
                id: uuidv4(),
                type: "column",
                name: "Col 2",
                className: "flex flex-col gap-4",
                content: [
                  {
                    id: uuidv4(),
                    type: "statBox",
                    name: "Stat Box",
                    content: bentoStat1,
                    className: "flex-1",
                  },
                  {
                    id: uuidv4(),
                    type: "statBox",
                    name: "Stat Box",
                    content: bentoStat2,
                    className: "flex-1",
                  },
                ],
              },
              // Column 3: Insights
              {
                id: uuidv4(),
                type: "column",
                name: "Col 3",
                className:
                  "bg-primary/5 rounded-3xl p-6 flex flex-col justify-center",
                content: [
                  {
                    id: uuidv4(),
                    type: "heading2",
                    name: "Heading",
                    content: "Key Insights",
                  },
                  {
                    id: uuidv4(),
                    type: "bulletList",
                    name: "List",
                    content: bentoInsights,
                  },
                ],
              },
            ],
          },
        ],
      };

    case "statsRow":
      // Use structured stats array from content writer
      const hasStructuredStats = slide.stats && slide.stats.length >= 3;
      const fallbackStatsItems = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const stat1 = hasStructuredStats ? `${slide.stats![0].value}\n${slide.stats![0].label}` : (fallbackStatsItems[0] || "10M+");
      const stat2 = hasStructuredStats ? `${slide.stats![1].value}\n${slide.stats![1].label}` : (fallbackStatsItems[1] || "4.9/5");
      const stat3 = hasStructuredStats ? `${slide.stats![2].value}\n${slide.stats![2].label}` : (fallbackStatsItems[2] || "150+");

      return {
        id: uuidv4(),
        type: "column",
        name: "Column",
        content: [
          {
            id: uuidv4(),
            type: "heading2",
            name: "Section Title",
            content: slide.slideTitle || "",
            className: "text-center mb-12",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Stats Grid",
            content: [
              {
                id: uuidv4(),
                type: "statBox",
                name: "Stat 1",
                content: stat1,
              },
              {
                id: uuidv4(),
                type: "statBox",
                name: "Stat 2",
                content: stat2,
              },
              {
                id: uuidv4(),
                type: "statBox",
                name: "Stat 3",
                content: stat3,
              },
            ],
          },
        ],
      };

    case "timeline":
      // Use structured processSteps from content writer for timeline phases
      const hasTimelineSteps = slide.processSteps && slide.processSteps.length >= 3;
      const fallbackTimeline = isListContent(slide.slideContent || "")
        ? parseListContent(slide.slideContent || "")
        : [slide.slideContent || ""];
      const phase1 = hasTimelineSteps ? slide.processSteps![0].stepTitle : (fallbackTimeline[0] || "Phase 1");
      const phase2 = hasTimelineSteps ? slide.processSteps![1].stepTitle : (fallbackTimeline[1] || "Phase 2");
      const phase3 = hasTimelineSteps ? slide.processSteps![2].stepTitle : (fallbackTimeline[2] || "Phase 3");

      return {
        id: uuidv4(),
        type: "column",
        name: "Main",
        content: [
          {
            id: uuidv4(),
            type: "heading2",
            name: "Title",
            content: slide.slideTitle || "",
            className: "mb-8 text-center",
          },
          {
            id: uuidv4(),
            type: "resizable-column",
            name: "Timeline Grid",
            content: [
              {
                id: uuidv4(),
                type: "timelineCard",
                name: "Q1",
                content: phase1,
              },
              {
                id: uuidv4(),
                type: "timelineCard",
                name: "Q2",
                content: phase2,
              },
              {
                id: uuidv4(),
                type: "timelineCard",
                name: "Q3",
                content: phase3,
              },
            ],
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
 * Recursively validate and fix content items to ensure all have required fields
 */
function validateContent(content: any): any {
  if (!content) return null;
  
  // If it's an array, validate each item
  if (Array.isArray(content)) {
    return content.map(validateContent).filter(item => item !== null);
  }
  
  // For string content (like in bulletList), return as-is
  if (typeof content === 'string') {
    return content;
  }
  
  // If it's not an object, return as-is
  if (typeof content !== 'object') {
    return content;
  }
  
  // Ensure type exists
  if (!content.type) {
    if (Array.isArray(content.content) && content.content.some((c: any) => typeof c === 'object')) {
      content.type = 'column';
    } else if (typeof content.content === 'string') {
      content.type = 'paragraph';
    } else {
      console.warn('Skipping content without type:', content);
      return null;
    }
  }
  
  // Ensure id exists
  if (!content.id) {
    content.id = uuidv4();
  }
  
  // Ensure name exists
  if (!content.name) {
    content.name = content.type || 'Component';
  }
  
  // Recursively validate nested content if it's an array of objects
  if (Array.isArray(content.content)) {
    content.content = content.content.map((item: any) => {
      if (typeof item === 'object' && item !== null) {
        return validateContent(item);
      }
      return item; // Keep strings as-is (for lists)
    }).filter((item: any) => item !== null);
  }
  
  return content;
}

/**
 * Compile a single slide into final JSON structure
 */
function compileSingleSlide(slide: SlideGenerationData): Slide {
  const layoutType = slide.layoutType || "blank-card";
  const template = getLayoutTemplate(layoutType);
  
  let content = buildLayoutContent(slide, layoutType);
  
  // Validate and fix the content structure
  content = validateContent(content);

  return {
    id: uuidv4(),
    slideName: slide.outline || "Slide",
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
